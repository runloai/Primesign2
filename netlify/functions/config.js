const TABLE = process.env.SUPABASE_CONFIG_TABLE || 'site_config';
const KEY = process.env.SITE_CONFIG_KEY || 'primary';
const STORAGE_BUCKET = process.env.SUPABASE_CONFIG_BUCKET || 'site-config';
const STORAGE_OBJECT = process.env.SUPABASE_CONFIG_OBJECT || `${KEY}.json`;

const json = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  },
  body: JSON.stringify(body),
});

function supabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
}

function supabaseHeaders() {
  const key = supabaseKey();
  if (!key) return null;

  return {
    apikey: key,
    Authorization: 'Bearer ' + key,
    Accept: 'application/json',
  };
}

async function loadFromSupabaseDatabase() {
  const url = process.env.SUPABASE_URL;
  const key = supabaseKey();
  const headers = supabaseHeaders();
  if (!url || !key || !headers) return null;

  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(KEY)}&select=config,updated_at&limit=1`;
  const response = await fetch(endpoint, { headers });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase database config read failed (${response.status}): ${detail}`);
  }

  const rows = await response.json();
  return rows?.[0]?.config || null;
}

async function loadFromSupabaseStorage() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const headers = supabaseHeaders();
  if (!url || !key || !headers) return null;

  const objectPath = STORAGE_OBJECT.split('/').map(encodeURIComponent).join('/');
  const endpoint = `${url.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(STORAGE_BUCKET)}/${objectPath}?t=${Date.now()}`;
  const response = await fetch(endpoint, { headers });
  if (response.status === 404) return null;
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase storage config read failed (${response.status}): ${detail}`);
  }

  return response.json();
}

async function loadStaticConfig(event) {
  const host = event.headers.host || '';
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const base = host ? `${proto}://${host}` : '';
  if (!base) return null;

  const response = await fetch(`${base}/config.json?t=${Date.now()}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;
  return response.json();
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  try {
    const dbConfig = await loadFromSupabaseDatabase();
    if (dbConfig) return json(200, dbConfig, { 'X-Config-Source': 'supabase-database' });
  } catch (error) {
    console.error(error);
  }

  try {
    const storageConfig = await loadFromSupabaseStorage();
    if (storageConfig) return json(200, storageConfig, { 'X-Config-Source': 'supabase-storage' });
  } catch (error) {
    console.error(error);
  }

  const fallback = await loadStaticConfig(event).catch((error) => {
    console.error(error);
    return null;
  });

  if (fallback) return json(200, fallback, { 'X-Config-Source': 'static-fallback' });
  return json(500, { error: 'No site config available' });
}
