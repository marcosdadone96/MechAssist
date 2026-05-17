/**
 * Tras login Netlify (JWT en localStorage), obtiene sesiùn Supabase Auth para RLS (auth.uid()).
 */

import { FEATURES } from '../config/features.js';
import { getCurrentUser } from './localAuth.js';
import { supabase } from '../../scripts/supabaseClient.mjs';

/**
 * @param {string} [reason]
 * @param {string} [detail]
 * @returns {string}
 */
export function supabaseSessionSyncErrorMessage(reason, detail) {
  const en =
    typeof document !== 'undefined' &&
    String(document.documentElement.lang || '')
      .toLowerCase()
      .startsWith('en');
  /** @type {Record<string, [string, string]>} */
  const map = {
    no_netlify_session: [
      'Inicie sesiùn de nuevo para sincronizar la nube.',
      'Sign in again to sync the cloud.',
    ],
    mint_failed: [
      'No se pudo abrir la sesiùn en la nube (servidor). Vuelva a iniciar sesiùn.',
      'Could not open cloud session (server). Please sign in again.',
    ],
    set_session: [
      'No se pudo activar la sesiùn Supabase en este navegador.',
      'Could not activate the Supabase session in this browser.',
    ],
    network: [
      'Error de red al conectar con la nube.',
      'Network error while connecting to the cloud.',
    ],
    no_session: [
      'Sesiùn en la nube no disponible. Inicie sesiùn de nuevo.',
      'Cloud session unavailable. Please sign in again.',
    ],
    local_only: [
      'La cuenta local no tiene sesiùn Supabase. Use registro con verificaciùn de correo.',
      'Local account has no Supabase session. Use email-verified registration.',
    ],
    rls_disabled: [
      'Guardado en nube desactivado en esta build.',
      'Cloud save is disabled in this build.',
    ],
    not_verified: [
      'Confirme su correo con el enlace de verificaci\u00f3n y vuelva a iniciar sesi\u00f3n.',
      'Confirm your email via the verification link, then sign in again.',
    ],
    misconfigured_supabase: [
      'Falta configuraci\u00f3n Supabase en Netlify (URL, anon key o service role).',
      'Missing Supabase config on Netlify (URL, anon key or service role).',
    ],
    misconfigured_secret: [
      'Falta AUTH_JWT_SECRET en Netlify.',
      'Missing AUTH_JWT_SECRET on Netlify.',
    ],
    unauthorized: [
      'Sesi\u00f3n caducada. Cierre sesi\u00f3n e inicie sesi\u00f3n de nuevo.',
      'Session expired. Sign out and sign in again.',
    ],
    sign_in: [
      'No se pudo enlazar su cuenta con Supabase. Cierre sesi\u00f3n e inicie sesi\u00f3n otra vez.',
      'Could not link your account to Supabase. Sign out and sign in again.',
    ],
    supabase_user: [
      'No se pudo crear el usuario en Supabase. Int\u00e9ntelo de nuevo.',
      'Could not create Supabase user. Try again.',
    ],
  };
  const pair = map[String(reason || 'no_session')] || map.no_session;
  const base = en ? pair[1] : pair[0];
  if (detail && reason !== 'not_verified') {
    return `${base} (${detail})`;
  }
  return base;
}

/**
 * Sesiùn Supabase (RLS) lista para operaciones con auth.uid().
 * @returns {Promise<{ user: import('@supabase/supabase-js').User | null, syncReason?: string, syncDetail?: string }>}
 */
export async function ensureSupabaseAuthUser() {
  const u = getCurrentUser();
  if (!FEATURES.useSupabaseRLS) return { user: null, syncReason: 'rls_disabled' };

  let { data: authData } = await supabase.auth.getUser();
  let user = authData?.user ?? null;
  if (!user && u?.serverAuth && u?.authToken) {
    const sync = await syncSupabaseSessionFromNetlifyJwt();
    ({ data: authData } = await supabase.auth.getUser());
    user = authData?.user ?? null;
    if (!user) {
      return {
        user: null,
        syncReason: sync.reason || 'no_session',
        syncDetail: sync.detail,
      };
    }
  }
  if (!user && u?.email && !u?.serverAuth) {
    return { user: null, syncReason: 'local_only' };
  }
  if (!user) return { user: null, syncReason: 'no_session' };
  return { user };
}

/**
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
export async function syncSupabaseSessionFromNetlifyJwt() {
  if (!FEATURES.useSupabaseRLS) return { ok: true };
  const u = getCurrentUser();
  if (!u?.serverAuth || !u.authToken) return { ok: false, reason: 'no_netlify_session' };

  try {
    const res = await fetch(`${window.location.origin}/.netlify/functions/supabase-session-mint`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${u.authToken}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn('[supabaseSessionSync] mint failed', res.status, data);
      const code =
        data && typeof data.error === 'string' && data.error.trim() ? data.error.trim() : 'mint_failed';
      const detail =
        data && typeof data.message === 'string' && data.message.trim() ? data.message.trim() : '';
      return { ok: false, reason: code, detail };
    }
    const { error } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    if (error) {
      console.warn('[supabaseSessionSync] setSession', error);
      return { ok: false, reason: 'set_session' };
    }
    return { ok: true };
  } catch (e) {
    console.warn('[supabaseSessionSync]', e);
    return { ok: false, reason: 'network' };
  }
}
