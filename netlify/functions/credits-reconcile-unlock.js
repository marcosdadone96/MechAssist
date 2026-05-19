/**
 * POST  Tras pago Lemon de desbloqueo 1 : aplica calc_slug si el webhook tard.
 * Requiere sesin y pedido reciente del producto desbloqueo en Blobs Pro.
 */
const { getProStore } = require('./lib/blobStore.js');
const { verifyAuthSession } = require('./lib/authSession.js');
const { emailBlobKey, isCalcUnlockVariant, subscriptionRecordActive } = require('./lib/proEntitlementLogic.js');
const { applyCalcUnlock, activeCalcUnlocks, loadRecord } = require('./lib/creditsLogic.js');
const { isAllowedCalcUnlockSlug } = require('./lib/calcUnlockCatalog.js');

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
  const store = getProStore(event);
  const auth = await verifyAuthSession(sessionTok, authSecret, store);
  if (!auth.ok) {
    return {
      statusCode: 401,
      headers: cors,
      body: JSON.stringify({ error: auth.error || 'unauthorized' }),
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    body = {};
  }

  const calcSlug = String(body.calcSlug || '').trim().slice(0, 80);
  if (!calcSlug || !isAllowedCalcUnlockSlug(calcSlug)) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: 'invalid_calc_slug' }),
    };
  }

  const proKey = emailBlobKey(auth.email);
  let proRec = null;
  try {
    proRec = await store.getJSON(proKey);
  } catch (_) {
    proRec = null;
  }

  const variantId = proRec?.variantId != null ? String(proRec.variantId) : '';
  const paidUnlock =
    proRec?.active === true &&
    isCalcUnlockVariant(variantId) &&
    String(proRec?.status || '').toLowerCase() === 'paid';

  const updatedAt = proRec?.updatedAt ? Date.parse(String(proRec.updatedAt)) : NaN;
  const recent = Number.isFinite(updatedAt) && Date.now() - updatedAt < 3 * 60 * 60 * 1000;

  if (!paidUnlock || !recent) {
    return {
      statusCode: 403,
      headers: cors,
      body: JSON.stringify({ error: 'no_recent_unlock_payment' }),
    };
  }

  await applyCalcUnlock(store, auth.email, calcSlug);
  const { rec } = await loadRecord(store, auth.email);

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      calcSlug,
      calcUnlocked: true,
      unlockedCalcs: activeCalcUnlocks(rec),
    }),
  };
};
