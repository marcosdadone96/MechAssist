/**
 * POST — consume créditos (sesión de cálculo, PDF, etc.) con idempotencia.
 */
const { getProStore } = require('./lib/blobStore.js');
const { verifyJwt } = require('./lib/proJwt.js');
const { consumeCredits, ensureWelcomeCredits } = require('./lib/creditsLogic.js');

function corsHeaders(event) {
  const allowed = ['https://www.themechassist.com', 'https://themechassist.com'];
  const origin = event?.headers?.origin || event?.headers?.Origin || '';
  const isNetlifyPreview = origin.includes('.netlify.app');
  const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
  const allowedOrigin =
    allowed.includes(origin) || isNetlifyPreview || isLocalhost
      ? origin
      : 'https://www.themechassist.com';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
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

  const authSecret = process.env.AUTH_JWT_SECRET || process.env.PRO_JWT_SECRET;
  if (!authSecret || String(authSecret).length < 16) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured' }) };
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

  const pool = body.pool === 'machines' || body.pool === 'fluids' ? body.pool : 'lab';
  const amount = Number(body.amount) || 10;
  const reason = String(body.reason || 'calc_session').slice(0, 40);
  const idempotencyKey = String(body.idempotencyKey || '').trim();
  const calcSlug = String(body.calcSlug || '').trim();

  const email = String(sessionPayload.sub).trim().toLowerCase();
  const store = getProStore(event);

  await ensureWelcomeCredits(store, email);
  const result = await consumeCredits(store, email, {
    pool,
    amount,
    reason,
    idempotencyKey,
    calcSlug,
  });

  const status = result.ok ? 200 : 402;
  return {
    statusCode: status,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  };
};
