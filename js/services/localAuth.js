import { FEATURES } from '../config/features.js';

const LS_USER = 'mdr-local-user-v1';

/** Demo-local fingerprint (not cryptography); enough to verify repeat logins in this browser. */
function hashPasswordDemo(pw) {
  const s = String(pw);
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(33, h) ^ s.charCodeAt(i);
  }
  return `h_${(h >>> 0).toString(16)}_${s.length}`;
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(LS_USER);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (!u || typeof u !== 'object') return null;
    return u;
  } catch (_) {
    return null;
  }
}

/**
 * @param {{ name: string, email: string, password: string }} fields
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export async function registerLocalUser({ name, email, password }, opts = {}) {
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const msg = {
    incomplete:
      lang === 'en'
        ? 'Please enter name, email and password.'
        : 'Complete nombre, email y contrase\u00f1a.',
    email: lang === 'en' ? 'Invalid email address.' : 'Email inv\u00e1lido.',
    pw:
      lang === 'en'
        ? 'Password must be at least 8 characters.'
        : 'La contrase\u00f1a debe tener al menos 8 caracteres.',
  };

  const nm = String(name || '').trim();
  const em = String(email || '').trim().toLowerCase();
  const pw = String(password || '');
  if (!nm || !em || !pw) throw new Error(msg.incomplete);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) throw new Error(msg.email);
  if (pw.length < 8) throw new Error(msg.pw);
  const user = {
    id: `u_${Date.now()}`,
    name: nm,
    email: em,
    createdAt: new Date().toISOString(),
    pwHash: hashPasswordDemo(pw),
  };
  try {
    localStorage.setItem(LS_USER, JSON.stringify(user));
  } catch (_) {
    /* ignore */
  }

  if (FEATURES.useSupabaseRLS && !FEATURES.useServerAuth) {
    try {
      const { supabase } = await import('../../scripts/supabaseClient.mjs');
      const { error } = await supabase.auth.signUp({
        email: em,
        password: pw,
        options: { data: { full_name: nm } },
      });
      if (error) console.warn('[localAuth] Supabase signUp', error.message);
    } catch (e) {
      console.warn('[localAuth] Supabase signUp', e);
    }
  }

  return user;
}

/**
 * @param {{ email: string, password: string }} fields
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export async function loginLocalUser({ email, password }, opts = {}) {
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const msg = {
    incomplete:
      lang === 'en' ? 'Enter email and password.' : 'Introduzca correo y contrase\u00f1a.',
    none:
      lang === 'en'
        ? 'No account found in this browser. Please sign up first.'
        : 'No hay cuenta en este navegador. Reg\u00edstrese primero.',
    email: lang === 'en' ? 'Email does not match this account.' : 'El correo no coincide con la cuenta guardada.',
    pw:
      lang === 'en'
        ? 'Password must be at least 8 characters.'
        : 'La contrase\u00f1a debe tener al menos 8 caracteres.',
    badPw: lang === 'en' ? 'Incorrect password.' : 'Contrase\u00f1a incorrecta.',
  };

  const em = String(email || '').trim().toLowerCase();
  const pw = String(password || '');
  if (!em || !pw) throw new Error(msg.incomplete);
  if (pw.length < 8) throw new Error(msg.pw);

  const user = getCurrentUser();
  if (!user || !user.email) throw new Error(msg.none);
  if (String(user.email).toLowerCase() !== em) throw new Error(msg.email);

  const hash = hashPasswordDemo(pw);
  if (user.pwHash) {
    if (user.pwHash !== hash) throw new Error(msg.badPw);
  } else {
    user.pwHash = hash;
    try {
      localStorage.setItem(LS_USER, JSON.stringify(user));
    } catch (_) {
      /* ignore */
    }
  }

  if (FEATURES.useSupabaseRLS && !FEATURES.useServerAuth) {
    try {
      const { supabase } = await import('../../scripts/supabaseClient.mjs');
      const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
      if (error) console.warn('[localAuth] Supabase signIn', error.message);
    } catch (e) {
      console.warn('[localAuth] Supabase signIn', e);
    }
  }

  return user;
}

export function persistServerSession({ name, email, authToken }) {
  const nm = String(name || '').trim();
  const em = String(email || '').trim().toLowerCase();
  const tok = String(authToken || '').trim();
  if (!nm || !em || !tok) return null;
  const user = {
    id: 'srv',
    name: nm,
    email: em,
    serverAuth: true,
    authToken: tok,
    verified: true,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(LS_USER, JSON.stringify(user));
  } catch (_) {
    /* ignore */
  }
  return user;
}

export function clearLocalUser() {
  try {
    import('../../scripts/supabaseClient.mjs')
      .then(({ supabase }) => supabase.auth.signOut())
      .catch(() => {});
  } catch (_) {
    /* ignore */
  }
  try {
    localStorage.removeItem(LS_USER);
    window.dispatchEvent(new CustomEvent('mdr-clear-user-sync'));
  } catch (_) {
    /* ignore */
  }
}
