/**
 * POST  Tras pago Lemon de desbloqueo 1 : aplica calc_slug si el webhook tard.
 */
const { getProStore } = require('./lib/blobStore.js');
const { verifyAuthSession } = require('./lib/authSession.js');
const { emailBlobKey, isCalcUnlockVariant } = require('./lib/proEntitlementLogic.js');
const {
  applyCalcUnlock,
  activeCalcUnlocks,
  calcUnlockActive,
  loadRecord,
} = require('./lib/creditsLogic.js');
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

  const proKey = emailBlobKey(auth.email);
  let proRec = null;
  try {
    proRec = await store.getJSON(proKey);
  } catch (_) {
    proRec = null;
  }

  const calcSlug = String(body.calcSlug || proRec?.lastCalcUnlockSlug || '')
    .trim()
    .slice(0, 80);
  if (!calcSlug || !isAllowedCalcUnlockSlug(calcSlug)) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: 'invalid_calc_slug' }),
    };
  }

  const { rec } = await loadRecord(store, auth.email);
  if (calcUnlockActive(rec, calcSlug)) {
    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        already: true,
        calcSlug,
        calcUnlocked: true,
        unlockedCalcs: activeCalcUnlocks(rec),
      }),
    };
  }

  const variantId = proRec?.variantId != null ? String(proRec.variantId) : '';
  const unlockAt = proRec?.lastCalcUnlockAt || proRec?.updatedAt;
  const unlockTs = unlockAt ? Date.parse(String(unlockAt)) : NaN;
  const recentUnlock =
    Number.isFinite(unlockTs) && Date.now() - unlockTs < 7 * 24 * 60 * 60 * 1000;
  const unlockVariant = isCalcUnlockVariant(variantId);
  const unlockPurchase =
    proRec &&
    recentUnlock &&
    (unlockVariant || String(proRec.lastCalcUnlockSlug || '') === calcSlug);

  if (!unlockPurchase) {
    return {
      statusCode: 403,
      headers: cors,
      body: JSON.stringify({
        error: 'no_recent_unlock_payment',
        hint: 'complete_checkout_or_contact_support',
      }),
    };
  }

  await applyCalcUnlock(store, auth.email, calcSlug);
  const after = await loadRecord(store, auth.email);

  if (proRec?.lastCalcUnlockSlug !== calcSlug) {
    try {
      await store.setJSON(proKey, {
        ...proRec,
        lastCalcUnlockSlug: calcSlug,
        lastCalcUnlockAt: new Date().toISOString(),
      });
    } catch (_) {
      /* ignore */
    }
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      calcSlug,
      calcUnlocked: true,
      unlockedCalcs: activeCalcUnlocks(after.rec),
    }),
  };
};
