/**
 * Webhook Lemon Squeezy (Netlify Functions).
 * Variable de entorno: LEMON_SQUEEZY_WEBHOOK_SECRET (el signing secret del webhook en el panel LS).
 *
 * Verificacion de firma:
 * https://docs.lemonsqueezy.com/help/webhooks/signing-requests
 * Payload / eventos:
 * https://docs.lemonsqueezy.com/help/webhooks/webhook-requests
 */

const crypto = require('crypto');

function getHeader(headers, name) {
  if (!headers) return '';
  const lower = name.toLowerCase();
  return headers[lower] ?? headers[name] ?? '';
}

/**
 * @param {string} secret
 * @param {string} rawBody - cuerpo POST sin parsear (string UTF-8)
 * @param {string} signatureHeader - valor de X-Signature
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

exports.handler = async (event) => {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('ls-webhook: LEMON_SQUEEZY_WEBHOOK_SECRET no configurada');
    return { statusCode: 500, body: 'Server misconfiguration' };
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

  const eventName = getHeader(event.headers, 'X-Event-Name') || payload.meta?.event_name;

  if (eventName !== 'order_created' && eventName !== 'subscription_created') {
    return { statusCode: 200, body: 'Ignored' };
  }

  const email = payload.data?.attributes?.user_email;
  const resourceId = payload.data?.id;

  console.log(`ls-webhook: event=${eventName} email=${email} id=${resourceId}`);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: true }),
  };
};
