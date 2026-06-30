import { createHmac, timingSafeEqual } from 'crypto';

const SUPABASE_TABLE = process.env.SUPABASE_CONFIG_TABLE || 'site_config';
const SUPABASE_KEY = process.env.SITE_CONFIG_KEY || 'primary';
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_CONFIG_BUCKET || 'site-config';
const SUPABASE_STORAGE_OBJECT = process.env.SUPABASE_CONFIG_OBJECT || `${SUPABASE_KEY}.json`;

const defaultAdvantageGridImages = [
  { url: '/images/led/2.webp', label: 'LED signage detail' },
  { url: '/images/glow/1.webp', label: 'Glow sign detail' },
  { url: '/images/wall/3.webp', label: 'Wall branding detail' },
  { url: '/images/square/brass.webp', label: 'Brass sign detail' },
];

function slugify(value, fallback = 'item') {
  const slug = String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || fallback;
}

function normalizeImage(image, fallbackLabel = 'Image') {
  if (!image) return null;
  if (typeof image === 'string') return image ? { url: image, label: fallbackLabel } : null;
  const url = image.url || image.src || '';
  if (!url) return null;
  return {
    ...image,
    url,
    label: image.label || image.alt || fallbackLabel,
  };
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .map((image, idx) => normalizeImage(image, `Image ${idx + 1}`))
    .filter(Boolean);
}

function safeEqualString(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}

function signSessionPayload(payloadPart, secret) {
  return createHmac('sha256', secret).update(payloadPart).digest('base64url');
}

function isValidAdminSession(session, secret) {
  if (!session || !secret) return false;
  const [payloadPart, signature] = String(session).split('.');
  if (!payloadPart || !signature) return false;

  const expected = signSessionPayload(payloadPart, secret);
  if (!safeEqualString(signature, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    return payload?.sub === 'primesign-admin' && Number(payload.exp) > Date.now();
  } catch {
    return false;
  }
}

async function ensureSupabaseBucket(supabaseUrl, supabaseServiceKey) {
  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/bucket`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceKey,
      Authorization: 'Bearer ' + supabaseServiceKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: SUPABASE_STORAGE_BUCKET,
      name: SUPABASE_STORAGE_BUCKET,
      public: false,
    }),
  });

  if (response.ok || response.status === 400 || response.status === 409) return;

  const detail = await response.text();
  throw new Error(`Supabase storage bucket create failed (${response.status}): ${detail}`);
}

async function publishToSupabaseStorage(supabaseUrl, supabaseServiceKey, payload) {
  await ensureSupabaseBucket(supabaseUrl, supabaseServiceKey);

  const objectPath = SUPABASE_STORAGE_OBJECT.split('/').map(encodeURIComponent).join('/');
  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(SUPABASE_STORAGE_BUCKET)}/${objectPath}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceKey,
      Authorization: 'Bearer ' + supabaseServiceKey,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'x-upsert': 'true',
    },
    body: JSON.stringify(payload, null, 2),
  });

  if (!response.ok) {
    const detail = await response.text();
    const error = new Error(`Supabase storage publish failed (${response.status}): ${detail}`);
    error.statusCode = response.status;
    throw error;
  }
}

export async function handler(event) {
  const json = (statusCode, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (event.httpMethod === 'OPTIONS') {
    return json(204, {});
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const headers = event.headers || {};
  const providedToken = headers['x-admin-token'] || headers['X-Admin-Token'];
  const providedSession = headers['x-admin-session'] || headers['X-Admin-Session'];
  const adminToken = process.env.ADMIN_PUBLISH_TOKEN;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET || adminToken;

  if (!adminToken && !sessionSecret) {
    return json(500, { error: 'Server misconfiguration: missing ADMIN_PUBLISH_TOKEN or ADMIN_SESSION_SECRET' });
  }

  const tokenOk = adminToken && providedToken && safeEqualString(providedToken, adminToken);
  const sessionOk = providedSession && isValidAdminSession(providedSession, sessionSecret);

  if (!tokenOk && !sessionOk) {
    return json(401, { error: 'Unauthorized' });
  }

  // Get GitHub environment variables used by the legacy fallback publisher.
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'runloai';
  const repo = process.env.GITHUB_REPO || 'primesign2';
  const branch = process.env.GITHUB_BRANCH || 'main';

  // Parse request body
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON payload' });
  }

  // Basic validation
  if (!payload || typeof payload !== 'object') {
    return json(400, { error: 'Empty or invalid payload' });
  }

  if (!Array.isArray(payload.services) || !Array.isArray(payload.serviceCategories)) {
    return json(400, { error: 'Payload must include services and serviceCategories arrays' });
  }

  // Add metadata
  const seenCategoryIds = new Set();
  payload.serviceCategories = payload.serviceCategories.reduce((categories, category) => {
    const id = slugify(category.id || category.label || category.name, 'category');
    if (seenCategoryIds.has(id)) return categories;
    seenCategoryIds.add(id);
    categories.push({
      id,
      label: category.label || category.name || id.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
      icon: category.icon || '',
      description: category.description || '',
    });
    return categories;
  }, []);

  const categoryIds = new Set(payload.serviceCategories.map((category) => category.id));

  payload.services = payload.services.map((service, index) => {
    const category = slugify(service.categoryId || service.category, 'other');
    const galleryImages = normalizeImages(service.galleryImages || service.images || []);
    const heroImage = normalizeImage(service.heroImage, service.name || 'Service image') || galleryImages[0] || null;
    const portfolioImages = normalizeImages(service.portfolioImages || []);

    if (!categoryIds.has(category)) {
      categoryIds.add(category);
      payload.serviceCategories.push({
        id: category,
        label: category.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
        icon: '',
        description: '',
      });
    }

    return {
      ...service,
      id: String(service.id || index + 1),
      category,
      categoryId: category,
      description: service.description || service.desc || '',
      desc: service.desc || service.description || '',
      heroImage,
      galleryImages,
      portfolioImages,
      images: galleryImages,
    };
  });

  const advantageGridImages = normalizeImages(
    payload.advantage?.gridImages || payload.advantageGridImages || payload.advantageImages || defaultAdvantageGridImages
  ).slice(0, 4);
  while (advantageGridImages.length < 4) {
    advantageGridImages.push(defaultAdvantageGridImages[advantageGridImages.length]);
  }
  payload.advantage = {
    ...(payload.advantage || {}),
    gridImages: advantageGridImages,
  };
  delete payload.advantage.images;
  payload.advantageImages = advantageGridImages;
  payload.advantageGridImages = advantageGridImages;

  payload.meta = {
    version: '2.1',
    publishedAt: new Date().toISOString(),
  };
  payload._version = payload.meta.version;
  payload._publishedAt = payload.meta.publishedAt;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseServiceKey) {
    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${SUPABASE_TABLE}?on_conflict=id`;
    let databaseError = null;

    try {
      const saveResp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          apikey: supabaseServiceKey,
          Authorization: 'Bearer ' + supabaseServiceKey,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
          id: SUPABASE_KEY,
          config: payload,
          updated_at: payload.meta.publishedAt,
        }),
      });

      if (saveResp.ok) {
        return json(200, {
          ok: true,
          message: 'Config published to database',
          storage: 'supabase-database',
          services: Array.isArray(payload.services) ? payload.services.length : 0,
          categories: Array.isArray(payload.serviceCategories) ? payload.serviceCategories.length : 0,
        });
      }

      databaseError = await saveResp.text();
      console.error('Supabase database publish failed:', databaseError);
    } catch (error) {
      databaseError = error.message;
      console.error('Supabase database publish failed:', error);
    }

    try {
      await publishToSupabaseStorage(supabaseUrl, supabaseServiceKey, payload);
      return json(200, {
        ok: true,
        message: 'Config published to Supabase Storage',
        storage: 'supabase-storage',
        databaseWarning: databaseError,
        services: Array.isArray(payload.services) ? payload.services.length : 0,
        categories: Array.isArray(payload.serviceCategories) ? payload.serviceCategories.length : 0,
      });
    } catch (error) {
      console.error('Supabase storage publish failed:', error);
      return json(error.statusCode || 500, { error: 'Supabase publish failed', detail: error.message, databaseWarning: databaseError });
    }
  }

  if (!token) {
    return json(500, { error: 'Server misconfiguration: add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or configure GITHUB_TOKEN fallback' });
  }

  const api = 'https://api.github.com';
  const fileUrl = api + '/repos/' + owner + '/' + repo + '/contents/public/config.json?ref=' + branch;

  try {
    // Get current file SHA
    const currentResp = await fetch(fileUrl, {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
      },
    });

    let sha;
    if (currentResp.ok) {
      const current = await currentResp.json();
      sha = current.sha;
    } else if (currentResp.status !== 404) {
      // File might not exist yet, that's OK
      console.error('Failed to get current file:', currentResp.status);
    }

    // Prepare new content
    const content = Buffer.from(JSON.stringify(payload, null, 2) + '\n', 'utf8').toString('base64');

    // Commit to GitHub
    const updateResp = await fetch(api + '/repos/' + owner + '/' + repo + '/contents/public/config.json', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update site config - ' + new Date().toISOString(),
        content: content,
        sha: sha,
        branch: branch,
      }),
    });

    if (!updateResp.ok) {
      const errorText = await updateResp.text();
      console.error('GitHub update failed:', errorText);
      return json(updateResp.status, { error: 'GitHub update failed', detail: errorText });
    }

    const result = await updateResp.json();

    return json(200, {
      ok: true,
      message: 'Config published successfully',
      commit: result.commit ? result.commit.sha : null,
      services: Array.isArray(payload.services) ? payload.services.length : 0,
      categories: Array.isArray(payload.serviceCategories) ? payload.serviceCategories.length : 0,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return json(500, { error: 'Internal server error', message: error.message });
  }
}
