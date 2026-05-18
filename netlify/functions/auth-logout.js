/**
 * POST Authorization: Bearer <JWT mdr-auth>
 * Invalida todas las sesiones de la cuenta (incrementa sessionVersion + Supabase global signOut).
 *
 * Env: AUTH_JWT_SECRET o PRO_JWT_SECRET (>=16)
 */

const { createClient } = require('@supabase/supabase-js');
const { getProStore } = require('./lib/blobStore.js');
const { verifyAuthSession, bumpSessionVersion } = require('./lib/authSession.js');

function corsHeaders(event) {
  const allowed = ['https://www.themechassist.com', 'https://themechassist.com'];
  const origin = event?.headers ? event.headers.origin || event.headers.Origin || '' : '';
  const isNetlifyPreview = origin.includes('.netlify.app');
  const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
  const allowedOrigin =
    allowed.includes(origin) || isNetlifyPreview || isLocalhost ? origin : 'https://www.themechassist.com';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function getBearer(event) {
  const h = event.headers || {};
  const raw = h.authorization || h.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(String(raw));
  return m ? m[1].trim() : '';
}

function trimEnv(v) {
  return String(v || '').trim();
}

function normalizeSupabaseUrl(raw) {
  const u = trimEnv(raw).replace(/\/+$/, '');
  if (!u) return '';
  try {
    const parsed = new URL(u);
    if (!parsed.hostname.endsWith('.supabase.co')) return '';
    return parsed.origin;
  } catch {
    return '';
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} email
 */
async function findAuthUserIdByEmail(admin, email) {
  const target = email.toLowerCase();
  let page = 1;
  const perPage = 1000;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users || [];
    const u = users.find((x) => String(x.email || '').toLowerCase() === target);
    if (u?.id) return u.id;
    if (users.length < perPage) break;
    page += 1;
    if (page > 100) break;
  }
  return null;
}

/**
 * @param {string} email
 */
async function revokeSupabaseSessions(email) {
  const url = normalizeSupabaseUrl(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const serviceKey = trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceKey) return;

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const uid = await findAuthUserIdByEmail(admin, email);
  if (uid) {
    await admin.auth.admin.signOut(uid, 'global');
  }
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

  const token = getBearer(event);
  const store = getProStore(event);
  const auth = await verifyAuthSession(token, secret, store);
  if (!auth.ok) {
    return {
      statusCode: 401,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: auth.error || 'unauthorized' }),
    };
  }

  await bumpSessionVersion(store, auth.email);
  try {
    await revokeSupabaseSessions(auth.email);
  } catch (e) {
    console.warn('[auth-logout] supabase signOut', e?.message || e);
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
