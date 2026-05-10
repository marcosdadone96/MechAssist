/**
 * Tras login Netlify (JWT en localStorage), obtiene sesión Supabase Auth para RLS (auth.uid()).
 */

import { FEATURES } from '../config/features.js';
import { getCurrentUser } from './localAuth.js';
import { supabase } from '../../scripts/supabaseClient.mjs';

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
      console.warn('[supabaseSessionSync] mint failed', data);
      return { ok: false, reason: 'mint_failed' };
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
