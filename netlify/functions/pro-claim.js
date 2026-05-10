/**
 * Emite JWT Pro tras comprobar entitlement en Blobs (email debe coincidir con Lemon).
 * Requiere Authorization: Bearer con JWT de sesión (typ mdr-auth de auth-login).
 *
 * Env: PRO_JWT_SECRET (min 16 chars), AUTH_JWT_SECRET o PRO_JWT_SECRET para validar sesión.
 */

const { getProStore } = require('./lib/blobStore.js');
const {
  normalizeEmail,
  emailBlobKey,
  subscriptionRecordActive,
} = require('./lib/proEntitlementLogic.js');
const { signJwt, verifyJwt } = require('./lib/proJwt.js');

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

function getAuthBearer(event) {
  const h = event.headers || {};
  const raw = h.authorization || h.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(String(raw));
  return m ? m[1].trim() : '';
}

exports.handler = async (event) => {
  const cors = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'method' }) };
  }

  const proSecret = process.env.PRO_JWT_SECRET;
  if (!proSecret || String(proSecret).length < 16) {
    console.error('pro-claim: PRO_JWT_SECRET missing or too short');
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured' }) };
  }

  const authSecret = process.env.AUTH_JWT_SECRET || process.env.PRO_JWT_SECRET;
  if (!authSecret || String(authSecret).length < 16) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured_auth' }) };
  }

  const sessionTok = getAuthBearer(event);
  const sessionPayload = verifyJwt(sessionTok, authSecret);
  if (!sessionPayload || sessionPayload.typ !== 'mdr-auth' || typeof sessionPayload.sub !== 'string') {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'unauthorized' }) };
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

  const sessionEmail = normalizeEmail(sessionPayload.sub);
  if (!sessionEmail || sessionEmail !== email) {
    return { statusCode: 403, headers: cors, body: JSON.stringify({ error: 'email_mismatch' }) };
  }

  const store = getProStore(event);
  const key = emailBlobKey(email);
  const rec = await store.get(key, { type: 'json' });
  if (!subscriptionRecordActive(rec)) {
    return { statusCode: 403, headers: cors, body: JSON.stringify({ error: 'no_entitlement' }) };
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 60 * 24 * 7;
  const token = signJwt({ sub: email, typ: 'mdr-pro', iat: now, exp }, proSecret);

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, expiresAt: exp * 1000 }),
  };
};
