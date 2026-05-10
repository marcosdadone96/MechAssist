/**
 * Recibe un resumen técnico del lienzo multieje y lo envía por Resend.
 *
 * Variables (Netlify): RESEND_API_KEY, FEEDBACK_TO_EMAIL (o REPORT_TO_EMAIL),
 * FEEDBACK_FROM_EMAIL o AUTH_MAIL_FROM
 */

function corsHeaders(event) {
  const allowed = [
    'https://www.themechassist.com',
    'https://themechassist.com',
  ];
  // En desarrollo local o deploy preview de Netlify, permitir el origen del request
  const origin = (event && event.headers)
    ? (event.headers.origin || event.headers.Origin || '')
    : '';
  const isNetlifyPreview = origin.includes('.netlify.app');
  const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
  const allowedOrigin = allowed.includes(origin) || isNetlifyPreview || isLocalhost
    ? origin
    : 'https://www.themechassist.com';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

exports.handler = async (event) => {
  const cors = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'method' }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REPORT_TO_EMAIL || process.env.FEEDBACK_TO_EMAIL;
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

  const text = String(body.text || '').trim();
  if (!text || text.length > 120000) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'text' }) };
  }

  const from =
    process.env.FEEDBACK_FROM_EMAIL ||
    process.env.AUTH_MAIL_FROM ||
    'TheMechAssist <onboarding@resend.dev>';

  const subject = '[TheMechAssist] Informe lienzo técnico multieje';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [String(to).trim()],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('transmission-report Resend failed', res.status, errText);
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
