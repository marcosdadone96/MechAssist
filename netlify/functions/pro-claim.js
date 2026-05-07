/**
 * Emite JWT Pro tras comprobar entitlement en Blobs (email debe coincidir con Lemon).
 *
 * Env: PRO_JWT_SECRET (min 16 chars)
 */

const { getProStore } = require('./lib/blobStore.js');
const {
  normalizeEmail,
  emailBlobKey,
  subscriptionRecordActive,
} = require('./lib/proEntitlementLogic.js');
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

  const secret = process.env.PRO_JWT_SECRET;
  if (!secret || String(secret).length < 16) {
    console.error('pro-claim: PRO_JWT_SECRET missing or too short');
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured' }) };
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
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'email' }) };
  }

  const store = getProStore(event);
  const key = emailBlobKey(email);
  const rec = await store.get(key, { type: 'json' });
  if (!subscriptionRecordActive(rec)) {
    return { statusCode: 403, headers: cors, body: JSON.stringify({ error: 'no_entitlement' }) };
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 60 * 24 * 7;
  const token = signJwt({ sub: email, typ: 'mdr-pro', iat: now, exp }, secret);

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, expiresAt: exp * 1000 }),
  };
};
