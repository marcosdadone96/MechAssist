/**
 * CRUD sobre la tabla `mis_motorreductores` (Supabase).
 *
 * Columnas esperadas (ajuste los identificadores si su DDL difiere):
 * id (uuid), cuenta_email (text), referencia (text), potencia_kw, rpm_salida,
 * par_nominal_nm, par_pico_nm, rpm_motor, eficiencia_reductor, notas, created_at.
 */

import { supabase } from '../../scripts/supabaseClient.mjs';

function _handleExpiredSession() {
  try {
    localStorage.removeItem('mdr-local-user-v1');
    localStorage.removeItem('mdr-user-sync-meta-v1');
    const lang =
      typeof document !== 'undefined'
        ? String(document.documentElement.lang || 'es').toLowerCase()
        : 'es';
    const msg = lang.startsWith('en')
      ? 'Your session has expired. Please sign in again.'
      : 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
    try {
      sessionStorage.setItem('mdr-session-expired-msg', msg);
    } catch (_) {}
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = '/register.html?session=expired';
    }
  } catch (_) {
    /* ignorar */
  }
}

/**
 * Supabase / PostgREST: 401 o JWT caducado.
 * @param {unknown} error
 */
function isUnauthorizedOrExpiredJwt(error) {
  if (!error || typeof error !== 'object') return false;
  const e = /** @type {Record<string, unknown>} */ (error);
  const status = e.status ?? e.statusCode;
  if (status === 401) return true;
  const code = String(e.code || '');
  if (code === 'PGRST301' || code === 'PGRST303') return true;
  const msg = String(e.message || '').toLowerCase();
  return msg.includes('jwt expired') || (msg.includes('jwt') && msg.includes('expired'));
}

export const TABLE_MIS_MOTORREDUCTORES = 'mis_motorreductores';

/** @typedef {import('./userGearmotorLibrary.js').UserGearmotorRecord} UserGearmotorRecord */

/**
 * @param {Record<string, unknown>} row
 * @returns {UserGearmotorRecord}
 */
export function mapRowToUserRecord(row) {
  const id = typeof row.id === 'string' ? row.id : String(row.id || '');
  const createdRaw = row.created_at;
  let createdAt = Date.now();
  if (typeof createdRaw === 'string') {
    const t = Date.parse(createdRaw);
    if (Number.isFinite(t)) createdAt = t;
  }
  const referencia = row.referencia != null ? String(row.referencia).trim() : '';
  const motor_kW = Number(row.potencia_kw);
  const n2_rpm = Number(row.rpm_salida);
  const T2_nom_Nm = Number(row.par_nominal_nm);
  /** @type {UserGearmotorRecord} */
  const rec = {
    id,
    createdAt,
    label: referencia || 'Motorreductor',
    motor_kW,
    n2_rpm,
    T2_nom_Nm,
  };
  const t2p = Number(row.par_pico_nm);
  if (Number.isFinite(t2p) && t2p > 0) rec.T2_peak_Nm = t2p;
  const nm = Number(row.rpm_motor);
  if (Number.isFinite(nm) && nm > 0) rec.motor_rpm_nom = nm;
  let eta = Number(row.eficiencia_reductor);
  if (Number.isFinite(eta) && eta > 0) {
    if (eta > 1 && eta <= 100) eta /= 100;
    if (eta > 0 && eta <= 1) rec.eta_g = eta;
  }
  const notes = row.notas != null ? String(row.notas).trim().slice(0, 500) : '';
  if (notes) rec.notes = notes;
  return rec;
}

/**
 * @param {string} email
 * @returns {Promise<UserGearmotorRecord[]>}
 */
export async function fetchMisMotorreductoresRows(email) {
  const { data, error } = await supabase
    .from(TABLE_MIS_MOTORREDUCTORES)
    .select('*')
    .eq('cuenta_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    if (isUnauthorizedOrExpiredJwt(error)) {
      _handleExpiredSession();
      return [];
    }
    throw error;
  }
  const rows = Array.isArray(data) ? data : [];
  return rows.map((row) => mapRowToUserRecord(/** @type {Record<string, unknown>} */ (row)));
}

/**
 * @param {object} p
 * @param {string} [p.label]
 * @param {string} [p.notes]
 * @param {number} p.motor_kW
 * @param {number} p.n2_rpm
 * @param {number} p.T2_nom_Nm
 * @param {number} [p.T2_peak_Nm]
 * @param {number} [p.motor_rpm_nom]
 * @param {number} [p.eta_g]
 * @returns {Record<string, unknown>}
 */
function payloadToInsertRow(email, p) {
  const referencia = String(p.label || '').trim().slice(0, 160) || 'Motorreductor';
  /** @type {Record<string, unknown>} */
  const row = {
    cuenta_email: email,
    referencia,
    potencia_kw: p.motor_kW,
    rpm_salida: p.n2_rpm,
    par_nominal_nm: p.T2_nom_Nm,
  };
  if (p.T2_peak_Nm != null && Number.isFinite(p.T2_peak_Nm) && p.T2_peak_Nm > 0) {
    row.par_pico_nm = p.T2_peak_Nm;
  } else {
    row.par_pico_nm = null;
  }
  if (p.motor_rpm_nom != null && Number.isFinite(p.motor_rpm_nom) && p.motor_rpm_nom > 0) {
    row.rpm_motor = p.motor_rpm_nom;
  } else {
    row.rpm_motor = null;
  }
  let eta = p.eta_g != null ? Number(p.eta_g) : NaN;
  if (Number.isFinite(eta) && eta > 0) {
    if (eta > 1 && eta <= 100) eta /= 100;
    row.eficiencia_reductor = eta > 0 && eta <= 1 ? eta : null;
  } else {
    row.eficiencia_reductor = null;
  }
  const notes = p.notes != null ? String(p.notes).trim().slice(0, 500) : '';
  row.notas = notes || null;
  return row;
}

/**
 * @param {string} email
 * @param {Parameters<typeof payloadToInsertRow>[1]} p
 * @returns {Promise<UserGearmotorRecord | null>}
 */
export async function insertMisMotorreductorRow(email, p) {
  const row = payloadToInsertRow(email, p);
  const { data, error } = await supabase
    .from(TABLE_MIS_MOTORREDUCTORES)
    .insert(row)
    .select()
    .single();

  if (error) {
    console.warn('[mis_motorreductores] insert', error);
    if (isUnauthorizedOrExpiredJwt(error)) _handleExpiredSession();
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  return mapRowToUserRecord(/** @type {Record<string, unknown>} */ (data));
}

/**
 * @param {string} email
 * @param {string} id
 * @param {Parameters<typeof payloadToInsertRow>[1]} p
 * @returns {Promise<UserGearmotorRecord | null>}
 */
export async function updateMisMotorreductorRow(email, id, p) {
  const patch = payloadToInsertRow(email, p);
  delete patch.cuenta_email;

  const { data, error } = await supabase
    .from(TABLE_MIS_MOTORREDUCTORES)
    .update(patch)
    .eq('id', id)
    .eq('cuenta_email', email)
    .select()
    .single();

  if (error) {
    console.warn('[mis_motorreductores] update', error);
    if (isUnauthorizedOrExpiredJwt(error)) _handleExpiredSession();
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  return mapRowToUserRecord(/** @type {Record<string, unknown>} */ (data));
}

/**
 * @param {string} email
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteMisMotorreductorRow(email, id) {
  const { error } = await supabase
    .from(TABLE_MIS_MOTORREDUCTORES)
    .delete()
    .eq('id', id)
    .eq('cuenta_email', email);

  if (error) {
    console.warn('[mis_motorreductores] delete', error);
    if (isUnauthorizedOrExpiredJwt(error)) _handleExpiredSession();
    return false;
  }
  return true;
}

/**
 * Suscripci�n Realtime (opcional): cambios en la tabla para este email.
 * @param {string} email
 * @param {() => void} onChange
 * @returns {() => void}
 */
export function subscribeMisMotorreductoresRealtime(email, onChange) {
  const safe = String(email || '').replace(/"/g, '');
  if (!safe) return () => {};

  const channel = supabase
    .channel(`mis_mr:${safe}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_MIS_MOTORREDUCTORES,
        filter: `cuenta_email=eq.${safe}`,
      },
      () => {
        try {
          onChange();
        } catch (_) {
          /* ignore */
        }
      },
    )
    .subscribe();

  return () => {
    try {
      void supabase.removeChannel(channel);
    } catch (_) {
      /* ignore */
    }
  };
}
