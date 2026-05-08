/**
 * Recibe sugerencias (JSON) y envía un correo vía Resend.
 * Si faltan variables, devuelve 501 y el cliente usa Netlify Forms como respaldo.
 *
 * Variables en Netlify (Site settings ? Environment variables):
 * - RESEND_API_KEY
 * - FEEDBACK_TO_EMAIL   (tu bandeja)
 * - FEEDBACK_FROM_EMAIL (opcional, ej. "TheMechAssist <notificaciones@tudominio.com>")
 *
 * Resend: https://resend.com — verificar dominio o usar onboarding@resend.dev en pruebas.
 */

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

exports.handler = async (event) => {
  const cors = corsHeaders();
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'method' }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_TO_EMAIL;
  if (!apiKey || !to || String(to).trim().length < 3) {
    return {
      statusCode: 501,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'not_configured' }),
    };
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

  const honeypot = String(body.botField ?? '').trim();
  if (honeypot) {
    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
  }

  const message = String(body.message || '').trim();
  if (!message || message.length > 6000) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'message' }) };
  }

  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().slice(0, 120);
  const context = String(body.context || '').trim().slice(0, 500);

  const from =
    process.env.FEEDBACK_FROM_EMAIL || 'TheMechAssist <onboarding@resend.dev>';

  const lines = ['Nueva sugerencia — TheMechAssist', '', message, ''];
  if (name) lines.push(`Nombre: ${name}`);
  if (email) lines.push(`Correo: ${email}`);
  if (context) lines.push(`Contexto / referrer: ${context}`);

  const payload = {
    from,
    to: [String(to).trim()],
    subject: '[TheMechAssist] Sugerencia',
    text: lines.join('\n'),
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (emailOk) {
    payload.reply_to = email;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('email-feedback Resend failed', res.status, errText);
    return {
      statusCode: 502,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'send_failed' }),
    };
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
