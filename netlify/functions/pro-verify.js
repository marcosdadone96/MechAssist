/**
 * Valida JWT Pro y que el entitlement siga activo en Blobs.
 *
 * Env: PRO_JWT_SECRET (min 16 chars)
 */

const { getProStore } = require('./lib/blobStore.js');
const {
  normalizeEmail,
  emailBlobKey,
  subscriptionRecordActive,
} = require('./lib/proEntitlementLogic.js');
const { verifyJwt } = require('./lib/proJwt.js');

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
}

function getAuthBearer(event) {
  const h = event.headers || {};
  const raw = h.authorization || h.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(String(raw));
  return m ? m[1].trim() : '';
}

exports.handler = async (event) => {
  const cors = corsHeaders();
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ ok: false }) };
  }

  const secret = process.env.PRO_JWT_SECRET;
  if (!secret || String(secret).length < 16) {
    console.error('pro-verify: PRO_JWT_SECRET missing or too short');
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false }) };
  }

  const token = getAuthBearer(event);
  const payload = verifyJwt(token, secret);
  if (!payload || payload.typ !== 'mdr-pro' || typeof payload.sub !== 'string') {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ ok: false }) };
  }

  const email = normalizeEmail(payload.sub);
  const store = getProStore(event);
  const key = emailBlobKey(email);
  const rec = await store.get(key, { type: 'json' });
  if (!subscriptionRecordActive(rec)) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ ok: false, reason: 'inactive' }) };
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, email }),
  };
};
