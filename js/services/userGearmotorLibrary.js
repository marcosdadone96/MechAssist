/**
 * Motorreductores guardados por el usuario (localStorage) para reutilizarlos
 * en la comprobacion frente al punto calculado de cada maquina.
 */

import { buildManualGearmotorModel } from '../modules/motorVerify.js';

const LS_KEY = 'mdr-user-gearmotors-v1';

/** Maximo de registros (localStorage y rendimiento del desplegable). */
export const MAX_USER_GEARMOTORS = 200;

/** Version del JSON exportado / importado. */
export const GEARMOTOR_EXPORT_SCHEMA_VERSION = 1;

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

function newId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch (_) {
    /* ignore */
  }
  return `ug-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * @returns {UserGearmotorRecord[]}
 */
export function listUserGearmotors() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter(Boolean);
  } catch (_) {
    return [];
  }
}

/**
 * @param {string} id
 * @returns {UserGearmotorRecord | null}
 */
export function getUserGearmotor(id) {
  return listUserGearmotors().find((r) => r.id === id) || null;
}

/**
 * @param {unknown} row
 * @returns {UserGearmotorRecord | null}
 */
export function normalizeImportRow(row) {
  if (!row || typeof row !== 'object') return null;
  const r = /** @type {Record<string, unknown>} */ (row);
  const motor_kW = Number(r.motor_kW);
  const n2_rpm = Number(r.n2_rpm);
  const T2_nom_Nm = Number(r.T2_nom_Nm);
  if (!Number.isFinite(motor_kW) || motor_kW <= 0) return null;
  if (!Number.isFinite(n2_rpm) || n2_rpm <= 0) return null;
  if (!Number.isFinite(T2_nom_Nm) || T2_nom_Nm <= 0) return null;
  const label = String(r.label || '')
    .trim()
    .slice(0, 160) || 'Motorreductor';
  const id = typeof r.id === 'string' && r.id.length > 0 ? String(r.id).slice(0, 80) : newId();
  const createdAt =
    typeof r.createdAt === 'number' && Number.isFinite(r.createdAt) ? r.createdAt : Date.now();
  /** @type {UserGearmotorRecord} */
  const rec = { id, createdAt, label, motor_kW, n2_rpm, T2_nom_Nm };
  let T2_peak_Nm = Number(r.T2_peak_Nm);
  if (Number.isFinite(T2_peak_Nm) && T2_peak_Nm > 0) rec.T2_peak_Nm = T2_peak_Nm;
  let motor_rpm_nom = Number(r.motor_rpm_nom);
  if (Number.isFinite(motor_rpm_nom) && motor_rpm_nom > 0) rec.motor_rpm_nom = motor_rpm_nom;
  let eta_g = Number(r.eta_g);
  if (Number.isFinite(eta_g) && eta_g > 0) {
    if (eta_g > 1 && eta_g <= 100) eta_g /= 100;
    if (eta_g > 0 && eta_g <= 1) rec.eta_g = eta_g;
  }
  const notesRaw = r.notes != null ? String(r.notes) : '';
  if (notesRaw.trim()) rec.notes = notesRaw.trim().slice(0, 500);
  return rec;
}

/**
 * @param {unknown[]} rows
 * @returns {UserGearmotorRecord[]}
 */
export function normalizeImportRows(rows) {
  if (!Array.isArray(rows)) return [];
  const out = [];
  for (const row of rows) {
    const rec = normalizeImportRow(row);
    if (rec) out.push(rec);
  }
  return out;
}

/**
 * Mantiene como maximo MAX_USER_GEARMOTORS (los mas recientes por createdAt).
 * @param {UserGearmotorRecord[]} list
 * @returns {UserGearmotorRecord[]}
 */
export function clampGearmotorList(list) {
  if (list.length <= MAX_USER_GEARMOTORS) return list;
  return [...list]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, MAX_USER_GEARMOTORS);
}

/**
 * @param {unknown} data
 * @returns {unknown[] | null}
 */
export function extractGearmotorImportItems(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return null;
  const o = /** @type {Record<string, unknown>} */ (data);
  if (Array.isArray(o.items)) return o.items;
  if (Array.isArray(o.motorreductores)) return o.motorreductores;
  if (Array.isArray(o.gearmotors)) return o.gearmotors;
  return null;
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
 * @returns {UserGearmotorRecord | null}
 */
export function addUserGearmotor(p) {
  const motor_kW = Number(p.motor_kW);
  const n2_rpm = Number(p.n2_rpm);
  const T2_nom_Nm = Number(p.T2_nom_Nm);
  if (!Number.isFinite(motor_kW) || motor_kW <= 0) return null;
  if (!Number.isFinite(n2_rpm) || n2_rpm <= 0) return null;
  if (!Number.isFinite(T2_nom_Nm) || T2_nom_Nm <= 0) return null;

  const list = listUserGearmotors();
  if (list.length >= MAX_USER_GEARMOTORS) return null;

  const label = String(p.label || '').trim().slice(0, 160) || 'Motorreductor';

  /** @type {UserGearmotorRecord} */
  const rec = {
    id: newId(),
    createdAt: Date.now(),
    label,
    motor_kW,
    n2_rpm,
    T2_nom_Nm,
  };
  let T2_peak_Nm = Number(p.T2_peak_Nm);
  if (Number.isFinite(T2_peak_Nm) && T2_peak_Nm > 0) rec.T2_peak_Nm = T2_peak_Nm;
  let motor_rpm_nom = Number(p.motor_rpm_nom);
  if (Number.isFinite(motor_rpm_nom) && motor_rpm_nom > 0) rec.motor_rpm_nom = motor_rpm_nom;
  let eta_g = Number(p.eta_g);
  if (Number.isFinite(eta_g) && eta_g > 0) {
    if (eta_g > 1 && eta_g <= 100) eta_g /= 100;
    if (eta_g > 0 && eta_g <= 1) rec.eta_g = eta_g;
  }
  const notes = p.notes != null ? String(p.notes).trim().slice(0, 500) : '';
  if (notes) rec.notes = notes;

  list.push(rec);
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(clampGearmotorList(list)));
  } catch (_) {
    return null;
  }
  try {
    window.dispatchEvent(new CustomEvent(USER_GEARMOTOR_CHANGED_EVENT, { detail: { id: rec.id } }));
  } catch (_) {
    /* ignore */
  }
  return rec;
}

/**
 * @param {string} id
 * @returns {boolean}
 */
export function removeUserGearmotor(id) {
  if (!id) return false;
  const prev = listUserGearmotors();
  const list = prev.filter((r) => r.id !== id);
  if (list.length === prev.length) return false;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch (_) {
    return false;
  }
  try {
    window.dispatchEvent(new CustomEvent(USER_GEARMOTOR_CHANGED_EVENT, { detail: { id } }));
  } catch (_) {
    /* ignore */
  }
  return true;
}

/**
 * @param {string} id
 * @param {object} p Mismos campos que {@link addUserGearmotor}
 * @returns {UserGearmotorRecord | null}
 */
export function updateUserGearmotor(id, p) {
  if (!id) return null;
  const prev = listUserGearmotors();
  const idx = prev.findIndex((r) => r.id === id);
  if (idx < 0) return null;

  const motor_kW = Number(p.motor_kW);
  const n2_rpm = Number(p.n2_rpm);
  const T2_nom_Nm = Number(p.T2_nom_Nm);
  if (!Number.isFinite(motor_kW) || motor_kW <= 0) return null;
  if (!Number.isFinite(n2_rpm) || n2_rpm <= 0) return null;
  if (!Number.isFinite(T2_nom_Nm) || T2_nom_Nm <= 0) return null;

  const label = String(p.label || '').trim().slice(0, 160) || 'Motorreductor';

  /** @type {UserGearmotorRecord} */
  const rec = {
    ...prev[idx],
    label,
    motor_kW,
    n2_rpm,
    T2_nom_Nm,
  };

  delete rec.T2_peak_Nm;
  let T2_peak_Nm = Number(p.T2_peak_Nm);
  if (Number.isFinite(T2_peak_Nm) && T2_peak_Nm > 0) rec.T2_peak_Nm = T2_peak_Nm;

  delete rec.motor_rpm_nom;
  let motor_rpm_nom = Number(p.motor_rpm_nom);
  if (Number.isFinite(motor_rpm_nom) && motor_rpm_nom > 0) rec.motor_rpm_nom = motor_rpm_nom;

  delete rec.eta_g;
  let eta_g = Number(p.eta_g);
  if (Number.isFinite(eta_g) && eta_g > 0) {
    if (eta_g > 1 && eta_g <= 100) eta_g /= 100;
    if (eta_g > 0 && eta_g <= 1) rec.eta_g = eta_g;
  }

  delete rec.notes;
  const notes = p.notes != null ? String(p.notes).trim().slice(0, 500) : '';
  if (notes) rec.notes = notes;

  const list = [...prev];
  list[idx] = rec;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch (_) {
    return null;
  }
  try {
    window.dispatchEvent(new CustomEvent(USER_GEARMOTOR_CHANGED_EVENT, { detail: { id } }));
  } catch (_) {
    /* ignore */
  }
  return rec;
}

/**
 * Reemplaza toda la biblioteca. Valida y recorta a {@link MAX_USER_GEARMOTORS}.
 * @param {unknown[]} rows
 * @returns {boolean}
 */
export function replaceUserGearmotorsList(rows) {
  if (!Array.isArray(rows)) return false;
  const out = clampGearmotorList(normalizeImportRows(rows));
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(out));
  } catch (_) {
    return false;
  }
  try {
    window.dispatchEvent(new CustomEvent(USER_GEARMOTOR_CHANGED_EVENT, { detail: { replace: true } }));
  } catch (_) {
    /* ignore */
  }
  return true;
}

/**
 * Fusiona: actualiza por id existente; anade nuevos. Recorta al maximo permitido (mas recientes).
 * @param {unknown[]} rows
 * @returns {boolean}
 */
export function mergeUserGearmotorsList(rows) {
  if (!Array.isArray(rows)) return false;
  const incoming = normalizeImportRows(rows);
  const byId = new Map(listUserGearmotors().map((r) => [r.id, { ...r }]));
  for (const rec of incoming) {
    byId.set(rec.id, rec);
  }
  const merged = clampGearmotorList(Array.from(byId.values()));
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(merged));
  } catch (_) {
    return false;
  }
  try {
    window.dispatchEvent(new CustomEvent(USER_GEARMOTOR_CHANGED_EVENT, { detail: { merge: true } }));
  } catch (_) {
    /* ignore */
  }
  return true;
}

/**
 * @returns {string}
 */
export function exportUserGearmotorsJson() {
  return JSON.stringify(
    {
      schemaVersion: GEARMOTOR_EXPORT_SCHEMA_VERSION,
      exportKind: 'mechassist-user-gearmotors',
      exportedAt: new Date().toISOString(),
      items: listUserGearmotors(),
    },
    null,
    2,
  );
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
