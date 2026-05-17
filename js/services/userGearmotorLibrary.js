/**
 * Motorreductores del usuario en Supabase (TheMechAssist Cloud).
 * Cache en memoria: llamar ensureGearmotorsCacheLoaded() antes de confiar en listUserGearmotors().
 */

import { buildManualGearmotorModel } from '../modules/motorVerify.js';
import { getCurrentUser } from './localAuth.js';
import {
  ensureSupabaseAuthUser,
  supabaseSessionSyncErrorMessage,
} from './supabaseSessionSync.js';
import {
  fetchMisMotorreductoresRows,
  insertMisMotorreductorRow,
  updateMisMotorreductorRow,
  deleteMisMotorreductorRow,
  subscribeMisMotorreductoresRealtime,
} from './misMotorreductoresCloud.js';

/** Maximo de registros (rendimiento del desplegable y cuota razonable). */
export const MAX_USER_GEARMOTORS = 200;

/** @typedef {object} UserGearmotorRecord
 * @property {string} id
 * @property {number} createdAt
 * @property {string} label
 * @property {number} motor_kW
 * @property {number} n2_rpm
 * @property {number} T2_nom_Nm
 * @property {number} [T2_peak_Nm]
 * @property {number} [motor_rpm_nom]
 * @property {number} [eta_g]
 * @property {string} [notes]
 * @property {string} [brandId] Marca / carpeta (id catálogo: sew, nord, …).
 */

export const USER_SAVED_BRAND_VALUE = '__user_saved__';

export const USER_GEARMOTOR_CHANGED_EVENT = 'mdr-user-gearmotors-changed';

/** Último error de Supabase al guardar/editar/borrar (para mensajes en UI). */
let lastGearmotorCloudErrorMessage = '';

/**
 * Mensaje de error de la última operación cloud (si hubo), y se limpia al leer.
 * @returns {string}
 */
export function takeLastGearmotorCloudErrorMessage() {
  const m = lastGearmotorCloudErrorMessage;
  lastGearmotorCloudErrorMessage = '';
  return m;
}

function setLastGearmotorCloudError(err) {
  if (typeof err === 'string' && err.trim()) {
    lastGearmotorCloudErrorMessage = err.trim();
    return;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    lastGearmotorCloudErrorMessage = String(/** @type {{ message?: string }} */ (err).message || '');
  } else {
    lastGearmotorCloudErrorMessage = '';
  }
}

/**
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
async function requireSupabaseUserForGearmotors() {
  const { user, syncReason, syncDetail } = await ensureSupabaseAuthUser();
  if (!user && syncReason) {
    setLastGearmotorCloudError(supabaseSessionSyncErrorMessage(syncReason, syncDetail));
  }
  return user;
}

/** @type {UserGearmotorRecord[]} */
let gearmotorCache = [];

function notifyGearmotorChanged(detail = {}) {
  try {
    window.dispatchEvent(new CustomEvent(USER_GEARMOTOR_CHANGED_EVENT, { detail }));
  } catch (_) {
    /* ignore */
  }
}

/**
 * Recarga la lista desde Supabase y actualiza la cache.
 * @returns {Promise<void>}
 */
export async function refreshUserGearmotorsFromCloud() {
  const user = await requireSupabaseUserForGearmotors();
  if (!user) {
    gearmotorCache = [];
    notifyGearmotorChanged({ replace: true });
    return;
  }
  try {
    gearmotorCache = await fetchMisMotorreductoresRows();
  } catch (e) {
    console.warn('[userGearmotorLibrary] refresh', e);
    throw e;
  }
  notifyGearmotorChanged({ replace: true });
}

/** @type {Promise<void> | null} */
let loadPromise = null;

/**
 * @returns {Promise<void>}
 */
export function ensureGearmotorsCacheLoaded() {
  if (!getCurrentUser()?.email) {
    gearmotorCache = [];
    return Promise.resolve();
  }
  if (loadPromise) return loadPromise;
  loadPromise = refreshUserGearmotorsFromCloud().finally(() => {
    loadPromise = null;
  });
  return loadPromise;
}

if (typeof window !== 'undefined') {
  window.addEventListener('mdr-clear-user-sync', () => {
    gearmotorCache = [];
  });
}

/**
 * @returns {UserGearmotorRecord[]}
 */
export function listUserGearmotors() {
  return gearmotorCache.slice();
}

/**
 * @param {string} id
 * @returns {UserGearmotorRecord | null}
 */
export function getUserGearmotor(id) {
  return gearmotorCache.find((r) => r.id === id) || null;
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
 * @param {string} [p.brandId]
 * @returns {Promise<UserGearmotorRecord | null>}
 */
export async function addUserGearmotor(p) {
  const user = await requireSupabaseUserForGearmotors();
  if (!user) return null;

  const motor_kW = Number(p.motor_kW);
  const n2_rpm = Number(p.n2_rpm);
  const T2_nom_Nm = Number(p.T2_nom_Nm);
  if (!Number.isFinite(motor_kW) || motor_kW <= 0) return null;
  if (!Number.isFinite(n2_rpm) || n2_rpm <= 0) return null;
  if (!Number.isFinite(T2_nom_Nm) || T2_nom_Nm <= 0) return null;

  if (gearmotorCache.length >= MAX_USER_GEARMOTORS) return null;

  setLastGearmotorCloudError(null);
  const { record, error } = await insertMisMotorreductorRow(p);
  if (error) setLastGearmotorCloudError(error);
  if (!record) return null;
  gearmotorCache = [record, ...gearmotorCache.filter((r) => r.id !== record.id)];
  notifyGearmotorChanged({ id: record.id });
  return record;
}

/**
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function removeUserGearmotor(id) {
  if (!id) return false;
  const user = await requireSupabaseUserForGearmotors();
  if (!user) return false;
  setLastGearmotorCloudError(null);
  const del = await deleteMisMotorreductorRow(id);
  if (del.error) setLastGearmotorCloudError(del.error);
  if (!del.ok) return false;
  gearmotorCache = gearmotorCache.filter((r) => r.id !== id);
  notifyGearmotorChanged({ id });
  return true;
}

/**
 * @param {string} id
 * @param {object} p Mismos campos que {@link addUserGearmotor}
 * @returns {Promise<UserGearmotorRecord | null>}
 */
export async function updateUserGearmotor(id, p) {
  if (!id) return null;
  const user = await requireSupabaseUserForGearmotors();
  if (!user) return null;

  const motor_kW = Number(p.motor_kW);
  const n2_rpm = Number(p.n2_rpm);
  const T2_nom_Nm = Number(p.T2_nom_Nm);
  if (!Number.isFinite(motor_kW) || motor_kW <= 0) return null;
  if (!Number.isFinite(n2_rpm) || n2_rpm <= 0) return null;
  if (!Number.isFinite(T2_nom_Nm) || T2_nom_Nm <= 0) return null;

  setLastGearmotorCloudError(null);
  const { record, error } = await updateMisMotorreductorRow(id, p);
  if (error) setLastGearmotorCloudError(error);
  if (!record) return null;
  const idx = gearmotorCache.findIndex((r) => r.id === id);
  if (idx >= 0) gearmotorCache[idx] = record;
  else gearmotorCache = [record, ...gearmotorCache];
  notifyGearmotorChanged({ id });
  return record;
}

/**
 * @param {UserGearmotorRecord} entry
 */
export function buildSavedGearmotorModel(entry) {
  const m = buildManualGearmotorModel({
    motor_kW: entry.motor_kW,
    n2_rpm: entry.n2_rpm,
    T2_nom_Nm: entry.T2_nom_Nm,
    T2_peak_Nm: entry.T2_peak_Nm,
    motor_rpm_nom: entry.motor_rpm_nom,
    eta_g: entry.eta_g,
    code: entry.label,
  });
  return {
    ...m,
    id: `ug:${entry.id}`,
  };
}

/**
 * Cambios en tiempo real (Supabase Realtime).
 * @param {() => void} [onAfterRefresh]
 * @returns {Promise<() => void>}
 */
export async function subscribeUserGearmotorsRealtime(onAfterRefresh) {
  const user = await requireSupabaseUserForGearmotors();
  const uid = user?.id;
  if (!uid) return () => {};

  return subscribeMisMotorreductoresRealtime(uid, async () => {
    try {
      await refreshUserGearmotorsFromCloud();
    } catch (_) {
      /* ignore */
    }
    if (typeof onAfterRefresh === 'function') onAfterRefresh();
  });
}
