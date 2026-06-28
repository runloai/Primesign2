// Netlify Function: Publish site config to GitHub
// This allows admin panel to persist changes server-side

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

  // Get environment variables
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'runloai';
  const repo = process.env.GITHUB_REPO || 'primesign2';
  const branch = process.env.GITHUB_BRANCH || 'main';
  const adminToken = process.env.ADMIN_PUBLISH_TOKEN;

  // Validate environment
  if (!token || !adminToken) {
    return json(500, { error: 'Server misconfiguration: missing GITHUB_TOKEN or ADMIN_PUBLISH_TOKEN' });
  }

  // Validate admin token from header
  const headers = event.headers || {};
  const providedToken = headers['x-admin-token'] || headers['X-Admin-Token'];
  if (providedToken !== adminToken) {
    return json(401, { error: 'Unauthorized' });
  }

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
  payload.serviceCategories = payload.serviceCategories.map((category) => ({
    id: String(category.id || category.label || 'category')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''),
    label: category.label || category.name || 'Category',
    icon: category.icon || '',
    description: category.description || '',
  }));

  const categoryIds = new Set(payload.serviceCategories.map((category) => category.id));

  payload.services = payload.services.map((service) => {
    const category = String(service.categoryId || service.category || 'other')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'other';

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
      category,
      categoryId: category,
      description: service.description || service.desc || '',
      desc: service.desc || service.description || '',
    };
  });

  payload.meta = {
    version: '2.1',
    publishedAt: new Date().toISOString(),
  };
  payload._version = payload.meta.version;
  payload._publishedAt = payload.meta.publishedAt;

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
