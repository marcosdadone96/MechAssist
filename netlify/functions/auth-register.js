/**
 * Alta de cuenta: guarda pendiente en Blobs y enva correo de verificacin (Resend).
 *
 * Env Netlify:
 * - RESEND_API_KEY
 * - AUTH_MAIL_FROM o FEEDBACK_FROM_EMAIL
 * - AUTH_JWT_SECRET o PRO_JWT_SECRET (?16 caracteres; valida que el sitio est configurado)
 * - URL (Netlify inyecta la URL del deploy)
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getProStore } = require('./lib/blobStore.js');
const { normalizeEmail } = require('./lib/proEntitlementLogic.js');
const { pendingTokenKey, pendingIndexKey, verifiedUserKey } = require('./lib/authBlobKeys.js');

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function siteBaseUrl() {
  const u = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (u && /^https?:\/\//i.test(String(u))) {
    return String(u).replace(/\/$/, '');
  }
  return 'https://www.themechassist.com';
}

exports.handler = async (event) => {
  const cors = corsHeaders();
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'method' }) };
  }

  const secret = process.env.AUTH_JWT_SECRET || process.env.PRO_JWT_SECRET;
  if (!secret || String(secret).length < 16) {
    console.error('auth-register: AUTH_JWT_SECRET / PRO_JWT_SECRET missing');
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured_secret' }) };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured_resend' }) };
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

  const name = String(body.name || '').trim().slice(0, 120);
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  const lang = body.lang === 'en' ? 'en' : 'es';

  if (!name || !email || !password) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'incomplete' }) };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'email' }) };
  }
  if (password.length < 8) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'password_short' }) };
  }

  const store = getProStore(event);

  const vu = verifiedUserKey(email);
  try {
    const existing = await store.get(vu, { type: 'json' });
    if (existing && existing.verifiedAt) {
      return { statusCode: 409, headers: cors, body: JSON.stringify({ error: 'already_registered' }) };
    }
  } catch (_) {
    /* ignore */
  }

  const idxKey = pendingIndexKey(email);
  try {
    const oldTok = await store.get(idxKey, { type: 'text' });
    if (oldTok) {
      await store.delete(pendingTokenKey(String(oldTok).trim())).catch(() => {});
      await store.delete(idxKey).catch(() => {});
    }
  } catch (_) {
    /* ignore */
  }

  const passwordHash = bcrypt.hashSync(password, 11);
  const token = crypto.randomBytes(32).toString('hex');
  const createdAt = new Date().toISOString();

  await store.setJSON(pendingTokenKey(token), { name, email, passwordHash, createdAt });
  await store.set(idxKey, token);

  const base = siteBaseUrl();
  const verifyUrl = `${base}/.netlify/functions/auth-verify?token=${encodeURIComponent(token)}`;

  const from =
    process.env.AUTH_MAIL_FROM ||
    process.env.FEEDBACK_FROM_EMAIL ||
    'TheMechAssist <onboarding@resend.dev>';

  const subject =
    lang === 'en'
      ? 'Verify your TheMechAssist email'
      : 'Confirma tu correo en TheMechAssist';

  const textPlain =
    lang === 'en'
      ? `Hello ${name},\n\nPlease verify your email by opening this link (valid 48 hours):\n${verifyUrl}\n\n TheMechAssist`
      : `Hola ${name},\n\nConfirma tu correo abriendo este enlace (vlido 48 horas):\n${verifyUrl}\n\n TheMechAssist`;

  const resMail = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      text: textPlain,
    }),
  });

  if (!resMail.ok) {
    const errText = await resMail.text();
    console.error('auth-register Resend failed', resMail.status, errText);
    await store.delete(pendingTokenKey(token)).catch(() => {});
    await store.delete(idxKey).catch(() => {});
    return { statusCode: 502, headers: cors, body: JSON.stringify({ error: 'mail_failed' }) };
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, pendingVerification: true }),
  };
};
