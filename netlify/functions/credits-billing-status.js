/**
 * GET  Diagnstico de facturacin (cuenta + blob Lemon + ledger crditos).
 */
const { getProStore } = require('./lib/blobStore.js');
const { verifyAuthSession } = require('./lib/authSession.js');
const {
  emailBlobKey,
  subscriptionRecordActive,
  tierFromVariant,
  tierFromSubscriptionAttrs,
  proRecToTierAttrs,
  isCalcUnlockVariant,
} = require('./lib/proEntitlementLogic.js');
const {
  loadRecord,
  publicBalance,
  subscriptionActive,
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

  const { rec } = await loadRecord(store, email);
  const proActive = subscriptionRecordActive(proRec);
  const tier = proRec
    ? tierFromVariant(proRec.variantId) || tierFromSubscriptionAttrs(proRecToTierAttrs(proRec))
    : null;
  const unlockVariant = proRec?.variantId != null && isCalcUnlockVariant(proRec.variantId);
  const creditsSubActive = subscriptionActive(rec);

  let hint = 'ok';
  if (!proRec) {
    hint = 'lemon_webhook_never_received';
  } else if (!proActive) {
    hint = 'lemon_record_inactive';
  } else if (tier === 'starter' && !creditsSubActive) {
    hint = 'subscription_not_synced_to_credits';
  } else if (tier === 'starter' && rec.credits < 10) {
    hint = 'starter_low_credits';
  } else if (unlockVariant && Object.keys(rec.calcUnlocks || {}).length === 0) {
    hint = 'unlock_not_synced_to_credits';
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      email,
      hint,
      message:
        hint === 'lemon_webhook_never_received'
          ? `No hay datos Lemon para ${email}. Mismo correo que en el pago?`
          : undefined,
      lemon: proRec
        ? {
            active: proRec.active === true,
            status: proRec.status || null,
            variantId: proRec.variantId || null,
            tier,
            lastEvent: proRec.lastEvent || null,
            updatedAt: proRec.updatedAt || null,
          }
        : null,
      credits: {
        balance: publicBalance(rec),
        subscription: rec.subscription,
        subscriptionActive: creditsSubActive,
        subscriptionEndsAt: rec.subscriptionEndsAt || null,
      },
    }),
  };
};
