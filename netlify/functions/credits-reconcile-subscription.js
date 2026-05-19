/**
 * POST  Tras pago Lemon Starter/Ilimitado: sincroniza suscripcin al ledger de crditos.
 */
const { getProStore } = require('./lib/blobStore.js');
const { verifyAuthSession } = require('./lib/authSession.js');
const {
  emailBlobKey,
  subscriptionRecordActive,
  tierFromVariant,
  tierFromSubscriptionAttrs,
  proRecToTierAttrs,
} = require('./lib/proEntitlementLogic.js');
const {
  loadRecord,
  publicBalance,
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

  const proKey = emailBlobKey(auth.email);
  let proRec = null;
  try {
    proRec = await store.get(proKey, { type: 'json' });
  } catch (_) {
    proRec = null;
  }

  if (!subscriptionRecordActive(proRec)) {
    return {
      statusCode: 403,
      headers: cors,
      body: JSON.stringify({
        error: 'no_active_subscription',
        hint: 'check_lemon_webhook_and_variant_ids',
      }),
    };
  }

  const tier =
    tierFromVariant(proRec.variantId) || tierFromSubscriptionAttrs(proRecToTierAttrs(proRec));
  if (tier !== 'starter' && tier !== 'unlimited') {
    return {
      statusCode: 403,
      headers: cors,
      body: JSON.stringify({ error: 'not_subscription_tier', variantId: proRec.variantId || null }),
    };
  }

  if (proRec.active === false) {
    try {
      await store.setJSON(proKey, {
        ...proRec,
        active: true,
        updatedAt: new Date().toISOString(),
      });
    } catch (_) {
      /* ignore */
    }
  }

  const synced = await syncSubscriptionFromProRecord(store, auth.email, proRec);
  if (!synced.ok) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: synced.error || 'sync_failed' }),
    };
  }

  const { rec } = await loadRecord(store, auth.email);
  const subActive = subscriptionActive(rec);
  let subscriptionPlan = null;
  if (subActive && rec.subscription === 'unlimited') subscriptionPlan = 'unlimited';
  else if (subActive && rec.subscription === 'starter') subscriptionPlan = 'starter';

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      tier: synced.tier,
      balance: publicBalance(rec),
      unlimited: subscriptionPlan === 'unlimited',
      starter: subscriptionPlan === 'starter',
      subscriptionPlan,
      subscriptionEndsAt: subActive ? rec.subscriptionEndsAt || null : null,
      unlockedCalcs: activeCalcUnlocks(rec),
    }),
  };
};
