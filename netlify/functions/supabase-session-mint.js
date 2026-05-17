/**
 * POST Authorization: Bearer <JWT Netlify mdr-auth>
 * Crea o enlaza un usuario Supabase Auth y devuelve access_token + refresh_token
 * para supabase.auth.setSession en el cliente (RLS con auth.uid()).
 *
 * Env:
 * - SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - AUTH_JWT_SECRET o PRO_JWT_SECRET (validar JWT Netlify)
 *
 * La sesión se emite solo con service role (generateLink + verifyOtp), sin depender de la anon key en Netlify.
 * Blob verificado: opcional supabaseShadowPassword (solo servidor) al crear el usuario Auth.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { getProStore } = require('./lib/blobStore.js');
const { normalizeEmail } = require('./lib/proEntitlementLogic.js');
const { verifiedUserKey } = require('./lib/authBlobKeys.js');
const { verifyJwt } = require('./lib/proJwt.js');

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

function randomPassword() {
  return crypto.randomBytes(32).toString('base64url');
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
 * @param {string} password
 */
async function mintSessionViaPassword(admin, email, password) {
  if (!password) return { session: null, error: new Error('no_password') };
  const { data, error } = await admin.auth.signInWithPassword({ email, password });
  if (error || !data?.session) {
    return { session: null, error: error || new Error('sign_in_password_failed') };
  }
  return { session: data.session, error: null };
}

/**
 * Emite access/refresh con service role (generateLink + verifyOtp).
 * Solo token_hash y type (magiclink); no pasar email (Supabase lo rechaza).
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} email
 */
async function mintSessionViaAdminLink(admin, email) {
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  const hashed = linkData?.properties?.hashed_token;
  if (linkErr || !hashed) {
    return { session: null, error: linkErr || new Error('generate_link_failed') };
  }
  const { data: verifyData, error: verifyErr } = await admin.auth.verifyOtp({
    token_hash: hashed,
    type: 'magiclink',
  });
  if (verifyErr || !verifyData?.session) {
    return { session: null, error: verifyErr || new Error('verify_otp_failed') };
  }
  return { session: verifyData.session, error: null };
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
  const payload = verifyJwt(token, secret);
  if (!payload || payload.typ !== 'mdr-auth') {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  const email = normalizeEmail(payload.sub);
  if (!email) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  const url = normalizeSupabaseUrl(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const serviceKey = trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceKey) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'misconfigured_supabase' }) };
  }

  const store = getProStore(event);
  let user;
  try {
    user = await store.get(verifiedUserKey(email), { type: 'json' });
  } catch (_) {
    user = null;
  }
  if (!user || !user.verifiedAt) {
    return { statusCode: 403, headers: cors, body: JSON.stringify({ error: 'not_verified' }) };
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let shadowPw = user.supabaseShadowPassword ? String(user.supabaseShadowPassword) : '';

  try {
    if (!shadowPw) {
      shadowPw = randomPassword();
      const { error: ce } = await admin.auth.admin.createUser({
        email,
        password: shadowPw,
        email_confirm: true,
        user_metadata: { name: user.name || '' },
      });
      if (ce) {
        const msg = String(ce.message || '').toLowerCase();
        const dup =
          msg.includes('already') ||
          msg.includes('registered') ||
          ce.code === 'email_exists' ||
          String(ce.status) === '422';
        if (dup) {
          const uid = await findAuthUserIdByEmail(admin, email);
          if (!uid) throw ce;
          const { error: ue } = await admin.auth.admin.updateUserById(uid, {
            password: shadowPw,
            email_confirm: true,
          });
          if (ue) throw ue;
        } else {
          throw ce;
        }
      }
      user.supabaseShadowPassword = shadowPw;
      await store.setJSON(verifiedUserKey(email), user);
    }
  } catch (e) {
    console.warn('[supabase-session-mint] ensure user', e);
    return {
      statusCode: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'supabase_user', message: String(e?.message || e) }),
    };
  }

  let { session: mintedSession, error: mintErr } = { session: null, error: null };
  if (shadowPw) {
    ({ session: mintedSession, error: mintErr } = await mintSessionViaPassword(admin, email, shadowPw));
  }
  if (mintErr || !mintedSession) {
    ({ session: mintedSession, error: mintErr } = await mintSessionViaAdminLink(admin, email));
  }

  if ((mintErr || !mintedSession) && shadowPw) {
    const uid = await findAuthUserIdByEmail(admin, email);
    if (uid) {
      const newPw = randomPassword();
      const { error: ue } = await admin.auth.admin.updateUserById(uid, {
        password: newPw,
        email_confirm: true,
      });
      if (!ue) {
        shadowPw = newPw;
        user.supabaseShadowPassword = newPw;
        await store.setJSON(verifiedUserKey(email), user);
        ({ session: mintedSession, error: mintErr } = await mintSessionViaAdminLink(admin, email));
      }
    }
  }

  if (mintErr || !mintedSession) {
    const msg = mintErr?.message || 'no_session';
    console.warn('[supabase-session-mint] mint session', mintErr, 'host=', new URL(url).hostname);
    return {
      statusCode: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'sign_in',
        message: msg,
        hint: 'Compruebe SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL (mismo proyecto en Supabase → Settings → API).',
      }),
    };
  }

  const s = mintedSession;
  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      expires_in: s.expires_in,
      expires_at: s.expires_at,
      token_type: s.token_type,
    }),
  };
};
