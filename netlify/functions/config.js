const TABLE = process.env.SUPABASE_CONFIG_TABLE || 'site_config';
const KEY = process.env.SITE_CONFIG_KEY || 'primary';

const json = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  },
  body: JSON.stringify(body),
});

function supabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return {
    apikey: key,
    Authorization: 'Bearer ' + key,
    Accept: 'application/json',
  };
}

async function loadFromSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(KEY)}&select=config,updated_at&limit=1`;
  const response = await fetch(endpoint, { headers: supabaseHeaders() });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase config read failed (${response.status}): ${detail}`);
  }

  const rows = await response.json();
  return rows?.[0]?.config || null;
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
    const dbConfig = await loadFromSupabase();
    if (dbConfig) return json(200, dbConfig);
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
