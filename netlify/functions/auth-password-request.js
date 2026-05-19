/**
 * POST { email, lang } — solicita restablecimiento de contraseña (correo Resend).
 * Siempre responde ok si el JSON es válido (no revela si el correo existe).
 */

const crypto = require('crypto');
const { getProStore } = require('./lib/blobStore.js');
const { normalizeEmail } = require('./lib/proEntitlementLogic.js');
const { verifiedUserKey, resetTokenKey, resetIndexKey } = require('./lib/authBlobKeys.js');
const { checkRateLimit } = require('./lib/rateLimiter.js');

const HOURS_VALID = 2;

function corsHeaders(event) {
  const allowed = ['https://www.themechassist.com', 'https://themechassist.com'];
  const origin =
    event && event.headers ? event.headers.origin || event.headers.Origin || '' : '';
  const isNetlifyPreview = origin.includes('.netlify.app');
  const isLocalhost =
    origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
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
 * @param {{ resetUrl: string, lang: 'es'|'en' }} opts
 */
function buildResetEmailHtml({ resetUrl, lang }) {
  const safeUrl = escapeHtml(resetUrl);
  const copy =
    lang === 'en'
      ? {
          body:
            'We received a request to reset your Themechassist password. Use the button below to choose a new one. This link is valid for 2 hours.',
          button: 'Reset password',
          footer: "If you didn't request this, you can safely ignore this email.",
          hint: 'Button not working? Copy and paste this link into your browser:',
        }
      : {
          body:
            'Hemos recibido una solicitud para restablecer tu contrase\u00f1a de Themechassist. Usa el bot\u00f3n de abajo para elegir una nueva. El enlace es v\u00e1lido durante 2 horas.',
          button: 'Restablecer contrase\u00f1a',
          footer: 'Si no has solicitado este cambio, puedes ignorar este mensaje.',
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
<title>${lang === 'en' ? 'Reset password' : 'Restablecer contrase\u00f1a'}</title>
</head>
<body style="margin:0;padding:0;background-color:#f9f9f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9f9f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);overflow:hidden;">
          <tr>
            <td style="padding:40px 36px 24px;text-align:center;border-bottom:1px solid #eeeeee;">
              <p style="margin:0;font-family:${serif};font-size:24px;font-weight:700;color:#1a1a1a;">Themechassist</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 8px;">
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
  const cors = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'method' }) };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured_resend' }) };
  }

  const from = String(process.env.AUTH_MAIL_FROM || '').trim();
  if (!from) {
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

  const email = normalizeEmail(body.email);
  const lang = body.lang === 'en' ? 'en' : 'es';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'email' }) };
  }

  const clientIp =
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    'unknown';

  const rlIp = await checkRateLimit(event, `pwd-req-ip:${clientIp}`);
  if (!rlIp.allowed) {
    return {
      statusCode: 429,
      headers: {
        ...cors,
        'Retry-After': String(rlIp.retryAfterSecs ?? 900),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'rate_limited', retryAfterSecs: rlIp.retryAfterSecs ?? 900 }),
    };
  }

  const rlEmail = await checkRateLimit(event, `pwd-req:${email}`);
  if (!rlEmail.allowed) {
    return {
      statusCode: 429,
      headers: {
        ...cors,
        'Retry-After': String(rlEmail.retryAfterSecs ?? 900),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'rate_limited', retryAfterSecs: rlEmail.retryAfterSecs ?? 900 }),
    };
  }

  const store = getProStore(event);
  let user;
  try {
    user = await store.get(verifiedUserKey(email), { type: 'json' });
  } catch (_) {
    user = null;
  }

  if (!user || !user.verifiedAt || !user.passwordHash) {
    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  }

  const idxKey = resetIndexKey(email);
  try {
    const oldTok = await store.get(idxKey, { type: 'text' });
    if (oldTok) {
      await store.delete(resetTokenKey(String(oldTok).trim())).catch(() => {});
      await store.delete(idxKey).catch(() => {});
    }
  } catch (_) {
    /* ignore */
  }

  const token = crypto.randomBytes(32).toString('hex');
  const createdAt = new Date().toISOString();

  await store.setJSON(resetTokenKey(token), { email, createdAt });
  await store.set(idxKey, token);

  const base = siteBaseUrl();
  const resetUrl = `${base}/register.html?reset=${encodeURIComponent(token)}`;

  const subject =
    lang === 'en' ? 'Reset your Themechassist password' : 'Restablece tu contrase\u00f1a de Themechassist';

  const textPlain =
    lang === 'en'
      ? `Open this link to reset your password (valid ${HOURS_VALID} hours):\n${resetUrl}\n\n\u2014 Themechassist`
      : `Abre este enlace para restablecer tu contrase\u00f1a (v\u00e1lido ${HOURS_VALID} horas):\n${resetUrl}\n\n\u2014 Themechassist`;

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
      html: buildResetEmailHtml({ resetUrl, lang }),
    }),
  });

  if (!resMail.ok) {
    const errText = await resMail.text();
    console.error('auth-password-request Resend failed', resMail.status, errText);
    await store.delete(resetTokenKey(token)).catch(() => {});
    await store.delete(idxKey).catch(() => {});
    return { statusCode: 502, headers: cors, body: JSON.stringify({ error: 'mail_failed' }) };
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
