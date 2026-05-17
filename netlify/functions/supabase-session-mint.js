/**
 * POST Authorization: Bearer <JWT Netlify mdr-auth>
 * Crea o enlaza un usuario Supabase Auth y devuelve access_token + refresh_token
 * para supabase.auth.setSession en el cliente (RLS con auth.uid()).
 *
 * Env:
 * - SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY o SUPABASE_ANON_KEY (misma que usa el front)
 * - AUTH_JWT_SECRET o PRO_JWT_SECRET (validar JWT Netlify)
 *
 * Blob verificado: opcional supabaseShadowPassword (solo servidor) para signInWithPassword.
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

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !serviceKey || !anonKey) {
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
  const sessionClient = createClient(url, anonKey, {
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

  async function signInOnce() {
    return sessionClient.auth.signInWithPassword({ email, password: shadowPw });
  }

  let { data: sess, error: se } = await signInOnce();

  if ((se || !sess?.session) && shadowPw) {
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
        ({ data: sess, error: se } = await signInOnce());
      }
    }
  }

  if (se || !sess?.session) {
    console.warn('[supabase-session-mint] signIn', se);
    return {
      statusCode: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'sign_in', message: se?.message || 'no_session' }),
    };
  }

  const s = sess.session;
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
