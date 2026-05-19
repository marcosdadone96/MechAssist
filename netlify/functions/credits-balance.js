/**
 * GET  saldo de crditos y suscripcin del usuario autenticado.
 */
const { getProStore } = require('./lib/blobStore.js');
const { verifyAuthSession } = require('./lib/authSession.js');
const { emailBlobKey, subscriptionRecordActive } = require('./lib/proEntitlementLogic.js');
const {
  ensureWelcomeCredits,
  loadRecord,
  publicBalance,
  calcUnlockActive,
  subscriptionActive,
  activeCalcUnlocks,
  syncSubscriptionFromProRecord,
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
  const store = getProStore(event);
  const auth = await verifyAuthSession(sessionTok, authSecret, store);
  if (!auth.ok) {
    return {
      statusCode: 401,
      headers: cors,
      body: JSON.stringify({ error: auth.error || 'unauthorized' }),
    };
  }

  const email = auth.email;

  let proRec = null;
  try {
    proRec = await store.get(emailBlobKey(email), { type: 'json' });
  } catch (_) {
    proRec = null;
  }
  if (subscriptionRecordActive(proRec)) {
    await syncSubscriptionFromProRecord(store, email, proRec).catch(() => {});
  }

  await ensureWelcomeCredits(store, email);
  const { rec } = await loadRecord(store, email);

  const calcSlug = String(event.queryStringParameters?.calcSlug || '').trim().slice(0, 80);
  const unlockedCalcs = activeCalcUnlocks(rec);
  const unlockedCalc = calcSlug ? calcUnlockActive(rec, calcSlug) : false;

  const subActive = subscriptionActive(rec);
  let subscriptionPlan = null;
  if (subActive && rec.subscription === 'unlimited') subscriptionPlan = 'unlimited';
  else if (subActive && rec.subscription === 'starter') subscriptionPlan = 'starter';

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      balance: publicBalance(rec),
      unlimited: subscriptionPlan === 'unlimited',
      starter: subscriptionPlan === 'starter',
      subscriptionPlan,
      subscriptionEndsAt: subActive ? rec.subscriptionEndsAt || null : null,
      calcUnlocked: unlockedCalc,
      calcSlug: calcSlug || undefined,
      unlockedCalcs,
    }),
  };
};
