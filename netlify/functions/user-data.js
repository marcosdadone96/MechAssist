/**
 * Datos Pro por cuenta (motorreductores + configuraciones maquina) en Netlify Blobs.
 *
 * Requiere JWT de sesion emitido por auth-login (typ: mdr-auth).
 * Env: AUTH_JWT_SECRET o PRO_JWT_SECRET (>=16), mismo que auth-login.
 */

const { getProStore } = require('./lib/blobStore.js');
const { normalizeEmail, emailBlobKey } = require('./lib/proEntitlementLogic.js');
const { verifyJwt } = require('./lib/proJwt.js');

const MAX_BODY_BYTES = 1_500_000;
const MAX_GEARMOTORS = 200;

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
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Vary': 'Origin',
  };
}

function getAuthBearer(event) {
  const h = event.headers || {};
  const raw = h.authorization || h.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(String(raw));
  return m ? m[1].trim() : '';
}

function userdataBlobKey(email) {
  const n = normalizeEmail(email);
  return `sync:u:${emailBlobKey(n)}`;
}

/**
 * @param {unknown} row
 * @returns {object | null}
 */
function sanitizeGearmotorRow(row) {
  if (!row || typeof row !== 'object') return null;
  const r = /** @type {Record<string, unknown>} */ (row);
  const motor_kW = Number(r.motor_kW);
  const n2_rpm = Number(r.n2_rpm);
  const T2_nom_Nm = Number(r.T2_nom_Nm);
  if (!Number.isFinite(motor_kW) || motor_kW <= 0) return null;
  if (!Number.isFinite(n2_rpm) || n2_rpm <= 0) return null;
  if (!Number.isFinite(T2_nom_Nm) || T2_nom_Nm <= 0) return null;
  const id = typeof r.id === 'string' && r.id.length > 0 ? String(r.id).slice(0, 80) : '';
  if (!id) return null;
  const label = String(r.label || '')
    .trim()
    .slice(0, 160) || 'Motorreductor';
  const createdAt =
    typeof r.createdAt === 'number' && Number.isFinite(r.createdAt) ? r.createdAt : Date.now();
  /** @type {Record<string, unknown>} */
  const out = { id, createdAt, label, motor_kW, n2_rpm, T2_nom_Nm };
  let T2_peak_Nm = Number(r.T2_peak_Nm);
  if (Number.isFinite(T2_peak_Nm) && T2_peak_Nm > 0) out.T2_peak_Nm = T2_peak_Nm;
  let motor_rpm_nom = Number(r.motor_rpm_nom);
  if (Number.isFinite(motor_rpm_nom) && motor_rpm_nom > 0) out.motor_rpm_nom = motor_rpm_nom;
  let eta_g = Number(r.eta_g);
  if (Number.isFinite(eta_g) && eta_g > 0) {
    if (eta_g > 1 && eta_g <= 100) eta_g /= 100;
    if (eta_g > 0 && eta_g <= 1) out.eta_g = eta_g;
  }
  const notesRaw = r.notes != null ? String(r.notes) : '';
  if (notesRaw.trim()) out.notes = notesRaw.trim().slice(0, 500);
  return out;
}

/**
 * @param {unknown} raw
 * @returns {object[]}
 */
function sanitizeGearmotors(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const row of raw) {
    const g = sanitizeGearmotorRow(row);
    if (g) out.push(g);
    if (out.length >= MAX_GEARMOTORS) break;
  }
  return out;
}

/**
 * @param {unknown} raw
 * @returns {Record<string, unknown>}
 */
function sanitizeMachineConfigs(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const src = /** @type {Record<string, unknown>} */ (raw);
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [tool, byName] of Object.entries(src)) {
    const tk = String(tool || '').slice(0, 64);
    if (!tk) continue;
    if (!byName || typeof byName !== 'object' || Array.isArray(byName)) continue;
    /** @type {Record<string, unknown>} */
    const toolOut = {};
    for (const [name, cfg] of Object.entries(
      /** @type {Record<string, unknown>} */ (byName),
    )) {
      const nm = String(name || '').slice(0, 200);
      if (!nm) continue;
      if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) continue;
      const c = /** @type {Record<string, unknown>} */ (cfg);
      const state = c.state;
      if (!state || typeof state !== 'object' || Array.isArray(state)) continue;
      const updatedAt =
        typeof c.updatedAt === 'string' ? c.updatedAt.slice(0, 40) : new Date().toISOString();
      toolOut[nm] = { updatedAt, state: JSON.parse(JSON.stringify(state)) };
    }
    if (Object.keys(toolOut).length) out[tk] = toolOut;
  }
  return out;
}

exports.handler = async (event) => {
  const cors = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }

  const secret = process.env.AUTH_JWT_SECRET || process.env.PRO_JWT_SECRET;
  if (!secret || String(secret).length < 16) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured_secret' }) };
  }

  const token = getAuthBearer(event);
  const payload = verifyJwt(token, secret);
  if (!payload || payload.typ !== 'mdr-auth' || typeof payload.sub !== 'string') {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  const email = normalizeEmail(payload.sub);
  if (!email) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  const store = getProStore(event);
  const key = userdataBlobKey(email);

  if (event.httpMethod === 'GET') {
    let doc = null;
    try {
      doc = await store.get(key, { type: 'json' });
    } catch (_) {
      doc = null;
    }
    if (!doc || typeof doc !== 'object') {
      doc = { updatedAt: 0, gearmotors: [], machineConfigs: {} };
    }
    if (!Array.isArray(doc.gearmotors)) doc.gearmotors = [];
    if (!doc.machineConfigs || typeof doc.machineConfigs !== 'object') doc.machineConfigs = {};
    if (typeof doc.updatedAt !== 'number' || !Number.isFinite(doc.updatedAt)) doc.updatedAt = 0;

    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    };
  }

  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'method' }) };
  }

  let raw = event.body;
  if (event.isBase64Encoded && typeof raw === 'string') {
    raw = Buffer.from(raw, 'base64').toString('utf8');
  }
  const buf = Buffer.byteLength(String(raw || ''), 'utf8');
  if (buf > MAX_BODY_BYTES) {
    return { statusCode: 413, headers: cors, body: JSON.stringify({ error: 'payload_too_large' }) };
  }

  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch (_) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'json' }) };
  }

  const gearmotors = sanitizeGearmotors(body.gearmotors);
  const machineConfigs = sanitizeMachineConfigs(body.machineConfigs);

  const updatedAt = Date.now();
  const doc = { updatedAt, gearmotors, machineConfigs };

  try {
    await store.setJSON(key, doc);
  } catch (e) {
    console.error('user-data PUT setJSON', e);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'store' }) };
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, updatedAt }),
  };
};
