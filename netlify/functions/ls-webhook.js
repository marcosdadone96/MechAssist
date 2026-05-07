/**
 * Webhook Lemon Squeezy: firma + persistencia en Netlify Blobs.
 *
 * Env:
 * - LEMON_SQUEEZY_WEBHOOK_SECRET (signing secret del webhook en Lemon)
 * - LEMON_PRO_VARIANT_IDS (opcional pero recomendado): UUIDs variant separados por coma,
 *   mismos que en checkout/buy/{variant-id}
 *
 * Eventos: order_* , subscription_* (ignora subscription_invoice).
 */

const crypto = require('crypto');
const { getProStore } = require('./lib/blobStore.js');
const {
  normalizeEmail,
  emailBlobKey,
  isVariantAllowed,
  subscriptionRecordActive,
} = require('./lib/proEntitlementLogic.js');

function getHeader(headers, name) {
  if (!headers) return '';
  const lower = name.toLowerCase();
  return headers[lower] ?? headers[name] ?? '';
}

/**
 * @param {string} secret
 * @param {string} rawBody
 * @param {string} signatureHeader
 */
function verifyLemonSignature(secret, rawBody, signatureHeader) {
  if (!secret || !signatureHeader || typeof rawBody !== 'string') return false;
  const hmac = crypto.createHmac('sha256', secret);
  const hexDigest = hmac.update(rawBody, 'utf8').digest('hex');
  const digestBuf = Buffer.from(hexDigest, 'utf8');
  const sigBuf = Buffer.from(signatureHeader, 'utf8');
  if (digestBuf.length !== sigBuf.length) return false;
  return crypto.timingSafeEqual(digestBuf, sigBuf);
}

/**
 * @param {Record<string, unknown>} attrs
 */
function variantFromOrder(attrs) {
  const fi = attrs.first_order_item;
  if (fi && typeof fi === 'object' && fi.variant_id != null) return fi.variant_id;
  if (attrs.variant_id != null) return attrs.variant_id;
  return null;
}

/**
 * @param {Record<string, unknown>} attrs
 */
function computeOrderActive(attrs) {
  const paid = String(attrs.status || '').toLowerCase() === 'paid';
  const vid = variantFromOrder(attrs);
  return paid && isVariantAllowed(vid);
}

/**
 * @param {string} eventName
 * @param {Record<string, unknown>} attrs
 */
function computeSubscriptionActive(eventName, attrs) {
  const variantId = attrs.variant_id != null ? attrs.variant_id : null;
  if (!isVariantAllowed(variantId)) return false;
  if (eventName === 'subscription_expired') return false;

  const st = String(attrs.status || '').toLowerCase();
  const endsAt = attrs.ends_at != null ? String(attrs.ends_at) : null;

  if (st === 'expired' || st === 'unpaid' || st === 'paused') return false;
  if (st === 'cancelled') {
    return subscriptionRecordActive({
      active: true,
      status: 'cancelled',
      endsAt,
    });
  }
  if (st === 'active' || st === 'on_trial' || st === 'past_due') return true;
  return false;
}

/**
 * @param {string} eventName
 * @param {Record<string, unknown>} attrs
 * @param {'order'|'subscription'} kind
 */
function buildRecord(eventName, attrs, kind) {
  const email = normalizeEmail(/** @type {string} */ (attrs.user_email || attrs.email || ''));
  const variantId =
    kind === 'order' ? variantFromOrder(attrs) : attrs.variant_id != null ? attrs.variant_id : null;
  const endsAt = attrs.ends_at != null ? String(attrs.ends_at) : null;

  const active =
    kind === 'order'
      ? computeOrderActive(attrs)
      : computeSubscriptionActive(eventName, attrs);

  return {
    email,
    variantId: variantId != null ? String(variantId) : null,
    active,
    status: attrs.status != null ? String(attrs.status) : '',
    endsAt,
    renewsAt: attrs.renews_at != null ? String(attrs.renews_at) : null,
    updatedAt: new Date().toISOString(),
    source: kind,
    lastEvent: eventName,
  };
}

/**
 * @param {ReturnType<typeof buildRecord>} rec
 */
function toStored(rec) {
  return {
    active: rec.active,
    status: rec.status,
    variantId: rec.variantId,
    endsAt: rec.endsAt,
    renewsAt: rec.renewsAt,
    updatedAt: rec.updatedAt,
    source: rec.source,
    lastEvent: rec.lastEvent,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('ls-webhook: LEMON_SQUEEZY_WEBHOOK_SECRET no configurada');
    return { statusCode: 500, body: 'Server misconfiguration' };
  }

  if (!process.env.LEMON_PRO_VARIANT_IDS) {
    console.warn('ls-webhook: LEMON_PRO_VARIANT_IDS vacio; se acepta cualquier variant (solo pruebas).');
  }

  let rawBody = event.body;
  if (event.isBase64Encoded && typeof rawBody === 'string') {
    rawBody = Buffer.from(rawBody, 'base64').toString('utf8');
  }
  if (rawBody == null) rawBody = '';

  const signature = getHeader(event.headers, 'X-Signature');
  if (!verifyLemonSignature(secret, rawBody, signature)) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let payload;
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch (_) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const eventName =
    getHeader(event.headers, 'X-Event-Name') ||
    (payload.meta && payload.meta.event_name) ||
    '';

  const data = payload.data;
  const type = data && data.type;
  const attrs = data && data.attributes;

  if (!attrs || typeof attrs !== 'object') {
    return { statusCode: 200, body: JSON.stringify({ received: true, ignored: true }) };
  }

  const invoiceTypes = new Set(['subscription-invoices', 'subscription-invoice']);
  if (invoiceTypes.has(String(type))) {
    return { statusCode: 200, body: JSON.stringify({ received: true, ignored: 'invoice' }) };
  }

  const store = getProStore(event);

  /** @type {'order'|'subscription' | null} */
  let kind = null;
  if (type === 'orders' || String(eventName).startsWith('order_')) {
    kind = 'order';
  } else if (type === 'subscriptions' || String(eventName).startsWith('subscription_')) {
    kind = 'subscription';
  }

  if (!kind) {
    return { statusCode: 200, body: JSON.stringify({ received: true, ignored: 'type' }) };
  }

  const rec = buildRecord(String(eventName), attrs, kind);
  if (!rec.email) {
    console.warn(`ls-webhook: sin email event=${eventName}`);
    return { statusCode: 200, body: JSON.stringify({ received: true, ignored: 'no_email' }) };
  }

  const key = emailBlobKey(rec.email);

  if (eventName === 'order_refunded') {
    await store.setJSON(key, {
      active: false,
      status: 'refunded',
      variantId: rec.variantId,
      endsAt: null,
      renewsAt: null,
      updatedAt: new Date().toISOString(),
      source: 'order',
      lastEvent: eventName,
    });
    console.log(`ls-webhook: refunded email=${rec.email}`);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ received: true }) };
  }

  const stored = toStored(rec);
  await store.setJSON(key, stored);

  console.log(`ls-webhook: event=${eventName} email=${rec.email} active=${stored.active}`);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: true }),
  };
};
