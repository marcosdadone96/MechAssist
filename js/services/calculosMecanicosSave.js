/**
 * Guardado en Supabase � tabla calculos_mecanicos (JSONB).
 * Importa el cliente desde scripts/supabaseClient.mjs (requerido por el usuario).
 */

import { supabase } from '../../scripts/supabaseClient.mjs';
import { getCurrentUser } from './localAuth.js';
import { FEATURES } from '../config/features.js';
import { syncSupabaseSessionFromNetlifyJwt } from './supabaseSessionSync.js';
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
      let { data: authData } = await supabase.auth.getUser();
      let user = authData?.user;
      if (!user && u?.serverAuth && u?.authToken) {
        await syncSupabaseSessionFromNetlifyJwt();
        ({ data: authData } = await supabase.auth.getUser());
        user = authData?.user;
      }
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
