/**
 * Alta de cuenta: guarda pendiente en Blobs y envia correo de verificacion (Resend).
 *
 * Env Netlify:
 * - RESEND_API_KEY
 * - AUTH_MAIL_FROM (remitente obligatorio)
 * - AUTH_JWT_SECRET o PRO_JWT_SECRET (>=16 caracteres; valida que el sitio esta configurado)
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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {{ name: string, verifyUrl: string, lang: 'es'|'en' }} opts
 */
function buildVerificationEmailHtml({ name, verifyUrl, lang }) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(verifyUrl);
  const copy =
    lang === 'en'
      ? {
          greeting: 'Hello',
          body:
            "We're glad you're here. Themechassist helps you get more from your workshop\u2014please verify your email with the button below so we know it's really you. This link is valid for 48 hours.",
          button: 'Verify my account',
          footer: "If you didn't sign up, you can safely ignore this email.",
          hint: 'Button not working? Copy and paste this link into your browser:',
        }
      : {
          greeting: 'Hola',
          body:
            'Nos alegra tenerte con nosotros. Para completar tu registro en Themechassist y poder usar tu cuenta con tranquilidad, solo necesitas verificar tu correo con el bot\u00f3n de abajo. El enlace es v\u00e1lido durante 48 horas.',
          button: 'Verificar mi cuenta',
          footer: 'Si no has creado esta cuenta, puedes ignorar este mensaje.',
          hint: 'Si el bot\u00f3n no funciona, copia y pega este enlace en tu navegador:',
        };

  const font =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
  const serif = "Georgia,'Times New Roman',serif";
  const btn = '#007bff';

  return `<!DOCTYPE html>
<html lang="${lang === 'en' ? 'en' : 'es'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${lang === 'en' ? 'Verify email' : 'Verificar correo'}</title>
</head>
<body style="margin:0;padding:0;background-color:#f9f9f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9f9f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);overflow:hidden;">
          <tr>
            <td style="padding:40px 36px 24px;text-align:center;background-color:#ffffff;border-bottom:1px solid #eeeeee;">
              <p style="margin:0;font-family:${serif};font-size:24px;font-weight:700;color:#1a1a1a;letter-spacing:-0.03em;">Themechassist</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 8px;">
              <p style="margin:0 0 16px;font-family:${font};font-size:17px;line-height:1.5;color:#1a1a1a;font-weight:600;">${copy.greeting}, ${safeName}</p>
              <p style="margin:0;font-family:${font};font-size:15px;line-height:1.7;color:#555555;">${copy.body}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px 8px;text-align:center;">
              <a href="${safeUrl}" style="display:inline-block;background-color:${btn};color:#ffffff!important;font-family:${font};font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">${copy.button}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px 28px;">
              <p style="margin:0 0 8px;font-family:${font};font-size:12px;line-height:1.5;color:#888888;text-align:center;">${copy.hint}</p>
              <p style="margin:0;word-break:break-all;font-family:${font};font-size:12px;line-height:1.5;color:#666666;text-align:center;"><a href="${safeUrl}" style="color:${btn};text-decoration:underline;">${safeUrl}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 40px;">
              <p style="margin:0;font-family:${font};font-size:12px;line-height:1.5;color:#999999;text-align:center;">${copy.footer}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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

  const from = String(process.env.AUTH_MAIL_FROM || '').trim();
  if (!from) {
    console.error('auth-register: AUTH_MAIL_FROM missing');
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured_from' }) };
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

  const subject =
    lang === 'en'
      ? 'Verify your Themechassist email'
      : 'Confirma tu correo en Themechassist';

  const textPlain =
    lang === 'en'
      ? `Hello ${name},\n\nPlease verify your email by opening this link (valid 48 hours):\n${verifyUrl}\n\n\u2014 Themechassist`
      : `Hola ${name},\n\nConfirma tu correo abriendo este enlace (v\u00e1lido 48 horas):\n${verifyUrl}\n\n\u2014 Themechassist`;

  const htmlBody = buildVerificationEmailHtml({ name, verifyUrl, lang });

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
      html: htmlBody,
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
