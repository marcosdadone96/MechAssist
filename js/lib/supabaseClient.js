/**
 * Cliente Supabase: Next.js (`process.env.NEXT_PUBLIC_*`), Vite (`import.meta.env`), o página estática
 * (`globalThis.__SUPABASE_URL__` / `__SUPABASE_ANON_KEY__`).
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

/**
 * @param {'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'} key
 */
function publicEnv(key) {
  try {
    if (typeof process !== 'undefined' && process.env && typeof process.env[key] === 'string') {
      return process.env[key];
    }
  } catch (_) {}
  try {
    const meta = typeof import.meta !== 'undefined' ? import.meta : null;
    const env = meta && /** @type {any} */ (meta).env;
    if (env && typeof env[key] === 'string') return env[key];
  } catch (_) {}
  try {
    const g = /** @type {any} */ (globalThis);
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
      if (typeof g.__NEXT_PUBLIC_SUPABASE_URL__ === 'string') return g.__NEXT_PUBLIC_SUPABASE_URL__;
      if (typeof g.__SUPABASE_URL__ === 'string') return g.__SUPABASE_URL__;
    }
    if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
      if (typeof g.__NEXT_PUBLIC_SUPABASE_ANON_KEY__ === 'string') return g.__NEXT_PUBLIC_SUPABASE_ANON_KEY__;
      if (typeof g.__SUPABASE_ANON_KEY__ === 'string') return g.__SUPABASE_ANON_KEY__;
    }
  } catch (_) {}
  return '';
}

const supabaseUrl = publicEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = publicEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (o en HTML estático: globalThis.__SUPABASE_URL__ / __SUPABASE_ANON_KEY__).',
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://invalid.supabase.local',
  supabaseAnonKey || 'invalid',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
