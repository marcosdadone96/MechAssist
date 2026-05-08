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

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

exports.handler = async (event) => {
  const cors = corsHeaders();
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
