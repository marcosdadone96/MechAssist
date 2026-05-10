/**
 * Motorreductores del usuario en Supabase (TheMechAssist Cloud).
 * Cache en memoria: llamar ensureGearmotorsCacheLoaded() antes de confiar en listUserGearmotors().
 */

import { buildManualGearmotorModel } from '../modules/motorVerify.js';
import { getCurrentUser } from './localAuth.js';
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
 */

export const USER_SAVED_BRAND_VALUE = '__user_saved__';

export const USER_GEARMOTOR_CHANGED_EVENT = 'mdr-user-gearmotors-changed';

/** @type {UserGearmotorRecord[]} */
let gearmotorCache = [];

function accountEmail() {
  const u = getCurrentUser();
  return u?.email ? String(u.email).trim().toLowerCase() : '';
}

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
  const em = accountEmail();
  if (!em) {
    gearmotorCache = [];
    notifyGearmotorChanged({ replace: true });
    return;
  }
  try {
    gearmotorCache = await fetchMisMotorreductoresRows(em);
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
  const em = accountEmail();
  if (!em) {
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
 * @returns {Promise<UserGearmotorRecord | null>}
 */
export async function addUserGearmotor(p) {
  const em = accountEmail();
  if (!em) return null;

  const motor_kW = Number(p.motor_kW);
  const n2_rpm = Number(p.n2_rpm);
  const T2_nom_Nm = Number(p.T2_nom_Nm);
  if (!Number.isFinite(motor_kW) || motor_kW <= 0) return null;
  if (!Number.isFinite(n2_rpm) || n2_rpm <= 0) return null;
  if (!Number.isFinite(T2_nom_Nm) || T2_nom_Nm <= 0) return null;

  if (gearmotorCache.length >= MAX_USER_GEARMOTORS) return null;

  const rec = await insertMisMotorreductorRow(em, p);
  if (!rec) return null;
  gearmotorCache = [rec, ...gearmotorCache.filter((r) => r.id !== rec.id)];
  notifyGearmotorChanged({ id: rec.id });
  return rec;
}

/**
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function removeUserGearmotor(id) {
  const em = accountEmail();
  if (!id || !em) return false;
  const ok = await deleteMisMotorreductorRow(em, id);
  if (!ok) return false;
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
  const em = accountEmail();
  if (!id || !em) return null;

  const motor_kW = Number(p.motor_kW);
  const n2_rpm = Number(p.n2_rpm);
  const T2_nom_Nm = Number(p.T2_nom_Nm);
  if (!Number.isFinite(motor_kW) || motor_kW <= 0) return null;
  if (!Number.isFinite(n2_rpm) || n2_rpm <= 0) return null;
  if (!Number.isFinite(T2_nom_Nm) || T2_nom_Nm <= 0) return null;

  const rec = await updateMisMotorreductorRow(em, id, p);
  if (!rec) return null;
  const idx = gearmotorCache.findIndex((r) => r.id === id);
  if (idx >= 0) gearmotorCache[idx] = rec;
  else gearmotorCache = [rec, ...gearmotorCache];
  notifyGearmotorChanged({ id });
  return rec;
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
 * Cambios en tiempo real (Supabase Realtime). Si la tabla no tiene Realtime activado, no falla.
 * @param {() => void} [onAfterRefresh]
 * @returns {() => void}
 */
export function subscribeUserGearmotorsRealtime(onAfterRefresh) {
  const em = accountEmail();
  if (!em) return () => {};

  return subscribeMisMotorreductoresRealtime(em, async () => {
    try {
      await refreshUserGearmotorsFromCloud();
    } catch (_) {
      /* ignore */
    }
    if (typeof onAfterRefresh === 'function') onAfterRefresh();
  });
}
