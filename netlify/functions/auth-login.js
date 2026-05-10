/**
 * POST { email, password } ? JWT de sesin (cuenta verificada).
 *
 * Env: AUTH_JWT_SECRET o PRO_JWT_SECRET (?16)
 */

const bcrypt = require('bcryptjs');
const { getProStore } = require('./lib/blobStore.js');
const { normalizeEmail } = require('./lib/proEntitlementLogic.js');
const { verifiedUserKey } = require('./lib/authBlobKeys.js');
const { signJwt } = require('./lib/proJwt.js');
const { checkRateLimit, resetRateLimit } = require('./lib/rateLimiter.js');

function corsHeaders(event) {
  const allowed = [
    'https://www.themechassist.com',
    'https://themechassist.com',
  ];
  // En desarrollo local o deploy preview de Netlify, permitir el origen del request
  const origin = (event && event.headers)
    ? (event.headers.origin || event.headers.Origin || '')
    : '';
  const isNetlifyPreview = origin.includes('.netlify.app');
  const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
  const allowedOrigin = allowed.includes(origin) || isNetlifyPreview || isLocalhost
    ? origin
    : 'https://www.themechassist.com';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

exports.handler = async (event) => {
  const cors = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'method' }) };
  }

  const secret = process.env.AUTH_JWT_SECRET || process.env.PRO_JWT_SECRET;
  if (!secret || String(secret).length < 16) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured_secret' }) };
  }

  let raw = event.body;
  if (event.isBase64Encoded && typeof raw === 'string') {
    raw = Buffer.from(raw, 'base64').toString('utf8');
  }
  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch (_) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'json' }) };
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  if (!email || !password) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'incomplete' }) };
  }

  // Rate limiting: mx 5 intentos por email en 15 min
  const rl = await checkRateLimit(event, `login:${email}`);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: {
        ...cors,
        'Retry-After': String(rl.retryAfterSecs ?? 1800),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'rate_limited',
        retryAfterSecs: rl.retryAfterSecs ?? 1800,
      }),
    };
  }

  const store = getProStore(event);
  let user;
  try {
    user = await store.get(verifiedUserKey(email), { type: 'json' });
  } catch (_) {
    user = null;
  }

  if (!user) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'bad_credentials' }) };
  }

  if (!user.verifiedAt || !user.passwordHash) {
    return { statusCode: 403, headers: cors, body: JSON.stringify({ error: 'not_verified' }) };
  }

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'bad_credentials' }) };
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 60 * 24 * 30;
  const token = signJwt(
    {
      sub: email,
      name: user.name || '',
      typ: 'mdr-auth',
      iat: now,
      exp,
    },
    secret,
  );

  // Login correcto: resetear contador de intentos
  await resetRateLimit(event, `login:${email}`);

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      expiresAt: exp * 1000,
      user: { name: user.name, email },
    }),
  };
};
