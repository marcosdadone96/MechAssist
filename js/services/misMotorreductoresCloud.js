/**
 * CRUD sobre `mis_motorreductores` + carpetas `mis_motorreductores_folders` (marca).
 *
 * Columnas motorreductor: id, user_id, cuenta_email (trigger), referencia, potencia_kw,
 * rpm_salida, par_nominal_nm, par_pico_nm, rpm_motor, eficiencia_reductor, notas,
 * folder_id?, created_at.
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
export const TABLE_MR_FOLDERS = 'mis_motorreductores_folders';

/** PostgREST embed por FK folder_id — requiere migración mis_mr_brand_folders.sql */
const SELECT_MR_EMBED = '*, folder:mis_motorreductores_folders!folder_id(brand_id)';

/** @typedef {import('./userGearmotorLibrary.js').UserGearmotorRecord} UserGearmotorRecord */

/**
 * Asegura carpeta (user_id + brand_id) y devuelve id para folder_id.
 * @param {string} brandId id catálogo (ej. sew, nord)
 * @returns {Promise<{ folderId: string | null, error: unknown | null }>}
 */
export async function ensureBrandFolderForBrand(brandId) {
  const bid = String(brandId || '').trim().toLowerCase();
  if (!bid) return { folderId: null, error: null };

  const { data: existing, error: selErr } = await supabase
    .from(TABLE_MR_FOLDERS)
    .select('id')
    .eq('brand_id', bid)
    .maybeSingle();

  if (selErr) return { folderId: null, error: selErr };
  if (existing && typeof existing.id === 'string') return { folderId: existing.id, error: null };

  const { data: created, error: insErr } = await supabase
    .from(TABLE_MR_FOLDERS)
    .insert({ brand_id: bid })
    .select('id')
    .single();

  if (!insErr && created && typeof created.id === 'string') {
    return { folderId: created.id, error: null };
  }

  const code =
    insErr && typeof insErr === 'object' && 'code' in insErr
      ? String(/** @type {{ code?: string }} */ (insErr).code || '')
      : '';
  if (code === '23505') {
    const { data: row } = await supabase
      .from(TABLE_MR_FOLDERS)
      .select('id')
      .eq('brand_id', bid)
      .maybeSingle();
    if (row && typeof row.id === 'string') return { folderId: row.id, error: null };
  }

  return { folderId: null, error: insErr };
}

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

  const fo = row.folder;
  if (fo && typeof fo === 'object' && !Array.isArray(fo)) {
    const bid = String(/** @type {Record<string, unknown>} */ (fo).brand_id || '').trim();
    if (bid) rec.brandId = bid;
  }

  return rec;
}

/**
 * @returns {Promise<UserGearmotorRecord[]>}
 */
export async function fetchMisMotorreductoresRows() {
  const { data, error } = await supabase
    .from(TABLE_MIS_MOTORREDUCTORES)
    .select(SELECT_MR_EMBED)
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
 * @param {string | null} folderUuid
 */
function payloadToInsertRow(p, folderUuid) {
  const referencia = String(p.label || '').trim().slice(0, 160) || 'Motorreductor';
  /** @type {Record<string, unknown>} */
  const row = {
    referencia,
    potencia_kw: p.motor_kW,
    rpm_salida: p.n2_rpm,
    par_nominal_nm: p.T2_nom_Nm,
    folder_id: folderUuid || null,
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
 * @param {{ brandId?: string }} p
 */
async function resolveFolderForPayload(p) {
  const bid = p.brandId != null ? String(p.brandId).trim() : '';
  if (!bid) return { folderId: null, error: null };
  return ensureBrandFolderForBrand(bid);
}

/**
 * @param {Parameters<typeof payloadToInsertRow>[0] & { brandId?: string }} p
 * @returns {Promise<{ record: UserGearmotorRecord | null, error: unknown }>}
 */
export async function insertMisMotorreductorRow(p) {
  const { folderId, error: fe } = await resolveFolderForPayload(p);
  if (fe) return { record: null, error: fe };

  const row = payloadToInsertRow(p, folderId);
  const { data, error } = await supabase
    .from(TABLE_MIS_MOTORREDUCTORES)
    .insert(row)
    .select(SELECT_MR_EMBED)
    .single();

  if (error) {
    console.warn('[mis_motorreductores] insert', error);
    if (isUnauthorizedOrExpiredJwt(error)) _handleExpiredSession();
    return { record: null, error };
  }
  if (!data || typeof data !== 'object') {
    return { record: null, error: { message: 'Empty insert response' } };
  }
  return {
    record: mapRowToUserRecord(/** @type {Record<string, unknown>} */ (data)),
    error: null,
  };
}

/**
 * @param {string} id
 * @param {Parameters<typeof payloadToInsertRow>[0] & { brandId?: string }} p
 * @returns {Promise<{ record: UserGearmotorRecord | null, error: unknown }>}
 */
export async function updateMisMotorreductorRow(id, p) {
  const { folderId, error: fe } = await resolveFolderForPayload(p);
  if (fe) return { record: null, error: fe };

  const patch = payloadToInsertRow(p, folderId);

  const { data, error } = await supabase
    .from(TABLE_MIS_MOTORREDUCTORES)
    .update(patch)
    .eq('id', id)
    .select(SELECT_MR_EMBED)
    .single();

  if (error) {
    console.warn('[mis_motorreductores] update', error);
    if (isUnauthorizedOrExpiredJwt(error)) _handleExpiredSession();
    return { record: null, error };
  }
  if (!data || typeof data !== 'object') {
    return { record: null, error: { message: 'Empty update response' } };
  }
  return {
    record: mapRowToUserRecord(/** @type {Record<string, unknown>} */ (data)),
    error: null,
  };
}

/**
 * @param {string} id
 * @returns {Promise<{ ok: boolean, error: unknown | null }>}
 */
export async function deleteMisMotorreductorRow(id) {
  const { error } = await supabase
    .from(TABLE_MIS_MOTORREDUCTORES)
    .delete()
    .eq('id', id);

  if (error) {
    console.warn('[mis_motorreductores] delete', error);
    if (isUnauthorizedOrExpiredJwt(error)) _handleExpiredSession();
    return { ok: false, error };
  }
  return { ok: true, error: null };
}

/**
 * Suscripción Realtime filtrada por user_id (auth.users).
 * @param {string} userId uuid auth.users
 * @param {() => void} onChange
 * @returns {() => void}
 */
export function subscribeMisMotorreductoresRealtime(userId, onChange) {
  const safe = String(userId || '').replace(/"/g, '');
  if (!safe) return () => {};

  const channel = supabase
    .channel(`mis_mr:${safe}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_MIS_MOTORREDUCTORES,
        filter: `user_id=eq.${safe}`,
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
