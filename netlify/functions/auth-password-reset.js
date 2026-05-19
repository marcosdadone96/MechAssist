/**
 * POST { token, password }  establece nueva contrasea con token del correo.
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { getProStore } = require('./lib/blobStore.js');
const { normalizeEmail } = require('./lib/proEntitlementLogic.js');
const { verifiedUserKey, resetTokenKey, resetIndexKey } = require('./lib/authBlobKeys.js');
const { bumpSessionVersion } = require('./lib/authSession.js');
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

function randomPassword() {
  return crypto.randomBytes(32).toString('base64url');
}

function trimEnv(v) {
  return String(v || '').trim();
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
 * @param {object} user
 * @param {import('./lib/blobStore.js').ProStore} store
 */
async function rotateSupabaseShadowIfConfigured(email, user, store) {
  const url = trimEnv(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceKey = trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceKey || !user.supabaseShadowPassword) return;

  try {
    const admin = createClient(url.replace(/\/+$/, ''), serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const uid = await findAuthUserIdByEmail(admin, email);
    if (!uid) return;
    const newPw = randomPassword();
    const { error } = await admin.auth.admin.updateUserById(uid, { password: newPw });
    if (error) {
      console.warn('auth-password-reset: supabase shadow', error.message);
      return;
    }
    user.supabaseShadowPassword = newPw;
    await store.setJSON(verifiedUserKey(email), user);
  } catch (e) {
    console.warn('auth-password-reset: supabase shadow', e?.message || e);
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

  const token = String(body.token || '').trim();
  const password = String(body.password || '');

  if (!token || !password) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'incomplete' }) };
  }
  if (password.length < 8) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'password_short' }) };
  }

  const rl = await checkRateLimit(event, `pwd-reset:${token.slice(0, 16)}`);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: {
        ...cors,
        'Retry-After': String(rl.retryAfterSecs ?? 900),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'rate_limited', retryAfterSecs: rl.retryAfterSecs ?? 900 }),
    };
  }

  const store = getProStore(event);
  const tk = resetTokenKey(token);
  let pending;
  try {
    pending = await store.get(tk, { type: 'json' });
  } catch (_) {
    pending = null;
  }

  if (!pending) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'invalid_token' }) };
  }

  const email = normalizeEmail(pending.email);
  const created = new Date(pending.createdAt || 0).getTime();
  if (!email || Number.isNaN(created)) {
    await store.delete(tk).catch(() => {});
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'invalid_token' }) };
  }

  const ageMs = Date.now() - created;
  if (ageMs > HOURS_VALID * 3600000) {
    await store.delete(tk).catch(() => {});
    await store.delete(resetIndexKey(email)).catch(() => {});
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'expired_token' }) };
  }

  let user;
  try {
    user = await store.get(verifiedUserKey(email), { type: 'json' });
  } catch (_) {
    user = null;
  }

  if (!user || !user.verifiedAt) {
    await store.delete(tk).catch(() => {});
    await store.delete(resetIndexKey(email)).catch(() => {});
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'invalid_token' }) };
  }

  user.passwordHash = bcrypt.hashSync(password, 11);
  await store.setJSON(verifiedUserKey(email), user);
  await bumpSessionVersion(store, email);

  try {
    user = await store.get(verifiedUserKey(email), { type: 'json' });
  } catch (_) {
    user = null;
  }
  if (user) {
    await rotateSupabaseShadowIfConfigured(email, user, store);
  }

  await store.delete(tk).catch(() => {});
  await store.delete(resetIndexKey(email)).catch(() => {});

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
