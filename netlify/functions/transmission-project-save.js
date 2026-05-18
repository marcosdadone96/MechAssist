/**
 * POST: guarda una fila en proyectos_transmision usando cuenta Netlify (JWT mdr-auth).
 * Inserta con SUPABASE_SERVICE_ROLE_KEY (solo servidor; bypass RLS).
 *
 * Env:
 * - SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (secreto; nunca en cliente)
 * - AUTH_JWT_SECRET o PRO_JWT_SECRET (mismo que auth-login)
 *
 * Body JSON: { referencia?, p_motor, n2_salida, t2_nominal, n_motor?, eficiencia_reductor?, notas? }
 */

const { createClient } = require('@supabase/supabase-js');
const { normalizeEmail } = require('./lib/proEntitlementLogic.js');
const { getProStore } = require('./lib/blobStore.js');
const { verifyAuthSession } = require('./lib/authSession.js');

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

function getAuthBearer(event) {
  const h = event.headers || {};
  const raw = h.authorization || h.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(String(raw));
  return m ? m[1].trim() : '';
}

/**
 * @param {unknown} body
 * @returns {{ ok: true, row: Record<string, unknown> } | { ok: false, code: string }}
 */
function sanitizePayload(body) {
  if (!body || typeof body !== 'object') return { ok: false, code: 'json' };

  const referenciaRaw = body.referencia != null ? String(body.referencia).trim() : '';
  const referencia = referenciaRaw ? referenciaRaw.slice(0, 160) : null;

  const p_motor = Number(body.p_motor);
  const n2_salida = Number(body.n2_salida);
  const t2_nominal = Number(body.t2_nominal);
  if (!Number.isFinite(p_motor) || p_motor <= 0) return { ok: false, code: 'validation' };
  if (!Number.isFinite(n2_salida) || n2_salida <= 0) return { ok: false, code: 'validation' };
  if (!Number.isFinite(t2_nominal) || t2_nominal <= 0) return { ok: false, code: 'validation' };

  /** @type {Record<string, unknown>} */
  const row = { referencia, p_motor, n2_salida, t2_nominal };

  if (body.n_motor != null && body.n_motor !== '') {
    const n_motor = Number(body.n_motor);
    if (Number.isFinite(n_motor) && n_motor >= 1) row.n_motor = n_motor;
  }

  if (body.eficiencia_reductor != null && body.eficiencia_reductor !== '') {
    let eta = Number(body.eficiencia_reductor);
    if (Number.isFinite(eta) && eta > 1 && eta <= 100) eta /= 100;
    if (Number.isFinite(eta) && eta > 0 && eta <= 1) row.eficiencia_reductor = eta;
  }

  const notesRaw = body.notas != null ? String(body.notas) : '';
  if (notesRaw.trim()) row.notas = notesRaw.trim().slice(0, 500);

  return { ok: true, row };
}

exports.handler = async (event) => {
  const cors = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'method' }) };
  }

  const secret = process.env.AUTH_JWT_SECRET || process.env.PRO_JWT_SECRET;
  if (!secret || String(secret).length < 16) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured_secret' }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('transmission-project-save: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing');
    return { statusCode: 503, headers: cors, body: JSON.stringify({ error: 'misconfigured_supabase' }) };
  }

  const token = getAuthBearer(event);
  const store = getProStore(event);
  const auth = await verifyAuthSession(token, secret, store);
  if (!auth.ok) {
    return {
      statusCode: 401,
      headers: cors,
      body: JSON.stringify({ error: auth.error || 'unauthorized' }),
    };
  }

  const ownerEmail = auth.email;

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

  const sanitized = sanitizePayload(body);
  if (!sanitized.ok) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: sanitized.code }),
    };
  }

  /** @type {Record<string, unknown>} */
  const insertRow = {
    ...sanitized.row,
    owner_email: ownerEmail,
  };

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from('proyectos_transmision').insert(insertRow);

  if (error) {
    console.error('transmission-project-save insert', error.message);
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({ error: 'insert_failed' }),
    };
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
