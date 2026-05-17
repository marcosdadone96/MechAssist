/**
 * Guardado en Supabase � tabla calculos_mecanicos (JSONB).
 * Importa el cliente desde scripts/supabaseClient.mjs (requerido por el usuario).
 */

import { supabase } from '../../scripts/supabaseClient.mjs';
import { getCurrentUser } from './localAuth.js';
import { FEATURES } from '../config/features.js';
import { ensureSupabaseAuthUser } from './supabaseSessionSync.js';
import { showToast } from '../ui/labToast.js';

/** Tabla `calculos_mecanicos` en Supabase (nombre f�sico sin acentos). */
export const CALCULOS_TABLE = 'calculos_mecanicos';


/**
 * Recoge inputs con id en el �mbito (misma idea que machineConfigMount.collectFormState).
 * @param {ParentNode} scope
 * @returns {Record<string, unknown>}
 */
export function collectInputsFromScope(scope) {
  const out = {};
  scope.querySelectorAll('input[id], select[id], textarea[id]').forEach((el) => {
    if (el instanceof HTMLInputElement) {
      if (el.type === 'button' || el.type === 'submit' || el.type === 'reset' || el.type === 'search')
        return;
      out[el.id] = el.type === 'checkbox' ? Boolean(el.checked) : String(el.value ?? '');
      return;
    }
    if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      out[el.id] = String(el.value ?? '');
    }
  });
  return out;
}

/**
 * Resultados visibles: m�tricas laboratorio, outputs, paneles de resultados.
 * @param {ParentNode} scope
 * @returns {Record<string, unknown>}
 */
export function collectResultsFromScope(scope) {
  /** @type {Record<string, unknown>} */
  const out = {};

  scope.querySelectorAll('output[id]').forEach((el) => {
    if (el.id) out[`output:${el.id}`] = String(el.value ?? el.textContent ?? '').trim();
  });

  scope.querySelectorAll('.lab-metric').forEach((block) => {
    const kEl = block.querySelector('.k');
    const vEl = block.querySelector('.v');
    if (!kEl || !vEl) return;
    const k = String(kEl.textContent || '')
      .trim()
      .replace(/\s+/g, ' ');
    if (!k) return;
    const txt = vEl.innerText?.trim() || '';
    if (txt) out[k] = txt;
  });

  const blockIds = ['resultsGrid', 'engineeringReport', 'motorBlock', 'assumptions', 'designAlerts'];
  for (const id of blockIds) {
    const el = scope.querySelector(`#${CSS.escape(id)}`) || document.getElementById(id);
    if (el && el instanceof HTMLElement) {
      const t = el.innerText?.trim();
      if (t) out[`panel:${id}`] = t.slice(0, 16000);
    }
  }

  return out;
}

/**
 * @param {{
 *   tipo_maquina: string,
 *   datos_entrada: Record<string, unknown>,
 *   resultados: Record<string, unknown>,
 *   silent?: boolean,
 * }} opts
 * @returns {Promise<{ ok: boolean }>}
 */
export async function insertCalculoMecanico(opts) {
  const { tipo_maquina, datos_entrada, resultados, silent } = opts;
  const langEs = () =>
    typeof document !== 'undefined' &&
    !String(document.documentElement.lang || '')
      .toLowerCase()
      .startsWith('en');

  const u = getCurrentUser();
  const owner_email_legacy =
    u && typeof u.email === 'string' && String(u.email).trim()
      ? String(u.email).trim().toLowerCase()
      : null;

  try {
    if (FEATURES.useSupabaseRLS) {
      const { user } = await ensureSupabaseAuthUser();
      if (!user) {
        showToast(
          langEs()
            ? 'Inicie sesión y sincronice la nube para guardar (sesión Supabase).'
            : 'Sign in and sync the cloud session to save (Supabase session).',
          { type: 'error', durationMs: 5000 },
        );
        return { ok: false };
      }

      const { error } = await supabase.from(CALCULOS_TABLE).insert({
        tipo_maquina: String(tipo_maquina || '').slice(0, 200),
        datos_entrada: datos_entrada ?? {},
        resultados: resultados ?? {},
      });
      if (error) throw error;
    } else {
      const { error } = await supabase.from(CALCULOS_TABLE).insert({
        tipo_maquina: String(tipo_maquina || '').slice(0, 200),
        datos_entrada: datos_entrada ?? {},
        resultados: resultados ?? {},
        owner_email: owner_email_legacy,
      });
      if (error) throw error;
    }
    if (!silent) {
      showToast(
        langEs() ? 'Guardado en la nube ✓' : 'Saved to cloud ✓',
        { type: 'ok' },
      );
    }
    return { ok: true };
  } catch (e) {
    console.error('[calculos_mecanicos]', e);
    const msg = e && typeof e === 'object' && 'message' in e ? String(/** @type {any} */ (e).message) : String(e);
    showToast(
      langEs() ? `Error al guardar: ${msg}` : `Save failed: ${msg}`,
      { type: 'error', durationMs: 5000 },
    );
    return { ok: false };
  }
}

/**
 * @param {{ limit?: number, silent?: boolean }} [opts]
 * @returns {Promise<{ ok: boolean, rows?: Array<{ id: string, created_at: string, tipo_maquina: string, datos_entrada: Record<string, unknown>, resultados: Record<string, unknown> }>, reason?: string }>}
 */
export async function listMyCalculosMecanicos(opts = {}) {
  const limit = Math.min(500, Math.max(1, Number(opts.limit) || 200));
  const silent = opts.silent === true;
  const langEs = () =>
    typeof document !== 'undefined' &&
    !String(document.documentElement.lang || '')
      .toLowerCase()
      .startsWith('en');

  if (!FEATURES.useSupabaseRLS) {
    if (!silent) {
      showToast(
        langEs()
          ? 'El listado en la nube requiere sesión segura (RLS).'
          : 'Cloud listing requires secure session (RLS).',
        { type: 'error', durationMs: 5000 },
      );
    }
    return { ok: false, rows: [], reason: 'no_rls' };
  }

  try {
    const { user } = await ensureSupabaseAuthUser();
    if (!user) {
      return { ok: false, rows: [], reason: 'no_session' };
    }

    const { data, error } = await supabase
      .from(CALCULOS_TABLE)
      .select('id, created_at, tipo_maquina, datos_entrada, resultados')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { ok: true, rows: /** @type {any} */ (data) || [] };
  } catch (e) {
    console.error('[calculos_mecanicos list]', e);
    const msg = e && typeof e === 'object' && 'message' in e ? String(/** @type {any} */ (e).message) : String(e);
    if (!silent) {
      showToast(
        langEs() ? `Error al cargar: ${msg}` : `Load failed: ${msg}`,
        { type: 'error', durationMs: 5000 },
      );
    }
    return { ok: false, rows: [], reason: 'query_error' };
  }
}

/**
 * @param {string} id uuid fila
 * @param {{ silent?: boolean }} [opts]
 * @returns {Promise<{ ok: boolean }>}
 */
export async function deleteCalculoMecanicoById(id, opts = {}) {
  const silent = opts.silent === true;
  const langEs = () =>
    typeof document !== 'undefined' &&
    !String(document.documentElement.lang || '')
      .toLowerCase()
      .startsWith('en');

  if (!FEATURES.useSupabaseRLS) {
    if (!silent) {
      showToast(
        langEs() ? 'Borrado en la nube no disponible en este modo.' : 'Cloud delete not available in this mode.',
        { type: 'error', durationMs: 4000 },
      );
    }
    return { ok: false };
  }

  const rid = String(id || '').trim();
  if (!rid) return { ok: false };

  try {
    const { user } = await ensureSupabaseAuthUser();
    if (!user) {
      if (!silent) {
        showToast(
          langEs() ? 'Inicie sesión para borrar en la nube.' : 'Sign in to delete from the cloud.',
          { type: 'error', durationMs: 4000 },
        );
      }
      return { ok: false };
    }

    const { error } = await supabase.from(CALCULOS_TABLE).delete().eq('id', rid);
    if (error) throw error;
    if (!silent) {
      showToast(langEs() ? 'Eliminado de la nube.' : 'Removed from cloud.', { type: 'ok' });
    }
    return { ok: true };
  } catch (e) {
    console.error('[calculos_mecanicos delete]', e);
    const msg = e && typeof e === 'object' && 'message' in e ? String(/** @type {any} */ (e).message) : String(e);
    if (!silent) {
      showToast(
        langEs() ? `Error al borrar: ${msg}` : `Delete failed: ${msg}`,
        { type: 'error', durationMs: 5000 },
      );
    }
    return { ok: false };
  }
}
