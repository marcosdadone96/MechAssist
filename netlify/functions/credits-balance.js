/**
 * GET  saldo de crditos y suscripcin del usuario autenticado.
 */
const { getProStore } = require('./lib/blobStore.js');
const { verifyJwt } = require('./lib/proJwt.js');
const {
  ensureWelcomeCredits,
  loadRecord,
  publicBalance,
  calcUnlockActive,
  subscriptionActive,
  activeCalcUnlocks,
} = require('./lib/creditsLogic.js');

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
  if (event.httpMethod !== 'GET') {
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

  const email = String(sessionPayload.sub).trim().toLowerCase();
  const store = getProStore(event);

  await ensureWelcomeCredits(store, email);
  const { rec } = await loadRecord(store, email);

  const calcSlug = String(event.queryStringParameters?.calcSlug || '').trim().slice(0, 80);
  const unlockedCalcs = activeCalcUnlocks(rec);
  const unlockedCalc = calcSlug ? calcUnlockActive(rec, calcSlug) : false;

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      balance: publicBalance(rec),
      unlimited: subscriptionActive(rec) && rec.subscription === 'unlimited',
      starter: subscriptionActive(rec) && rec.subscription === 'starter',
      calcUnlocked: unlockedCalc,
      calcSlug: calcSlug || undefined,
      unlockedCalcs,
    }),
  };
};
