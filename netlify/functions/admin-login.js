import { createHash, createHmac, timingSafeEqual } from 'crypto';

const ADMIN_USERS = new Set(['admin']);
const ADMIN_PASSWORD_HASHES = new Set([
  '70c5a5f6472c4af85b3134b44ca737b791e71c1933d40f2c06fe189d50ac0201',
  'dde79aae9bbe9d350719d36811c74ef5ce4005adf50ed13cf2877416b188c5d7',
]);
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}

function sha256(value) {
  return createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

function safeEqualString(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}

function isAllowedPassword(password) {
  const hash = sha256(password);
  return [...ADMIN_PASSWORD_HASHES].some((allowed) => safeEqualString(hash, allowed));
}

function signSessionPayload(payloadPart, secret) {
  return createHmac('sha256', secret).update(payloadPart).digest('base64url');
}

function createSession(secret) {
  const payload = {
    sub: 'primesign-admin',
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadPart = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return {
    session: `${payloadPart}.${signSessionPayload(payloadPart, secret)}`,
    expiresAt: new Date(payload.exp).toISOString(),
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PUBLISH_TOKEN;
  if (!secret) {
    return json(500, { error: 'Server misconfiguration: missing ADMIN_SESSION_SECRET or ADMIN_PUBLISH_TOKEN' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON payload' });
  }

  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!ADMIN_USERS.has(username) || !isAllowedPassword(password)) {
    return json(401, { error: 'Invalid username or password' });
  }

  return json(200, {
    ok: true,
    ...createSession(secret),
  });
}
