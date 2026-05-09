/**
 * Sincroniza biblioteca de motorreductores y configuraciones de maquina con Netlify Blobs
 * cuando hay sesion servidor (JWT auth-login). Sin cuenta / sin token: solo localStorage.
 */

import { FEATURES } from '../config/features.js';
import { getCurrentUser } from './localAuth.js';
import { listUserGearmotors, replaceUserGearmotorsList } from './userGearmotorLibrary.js';

/** Mantener alineado con clearLocalUser si cambia. */
export const USER_SYNC_META_KEY = 'mdr-user-sync-meta-v1';

/** Misma clave base que machineConfigMount.js (evita import UI -> accessTier). */
const LS_MACHINE_CONFIGS = 'mdr-machine-configs-v1';

function accountEmailForMachine() {
  const u = getCurrentUser();
  return u?.email ? String(u.email).trim().toLowerCase() : '';
}

function migrateMachineConfigsLegacy(email) {
  const nk = `${LS_MACHINE_CONFIGS}::${email}`;
  try {
    if (localStorage.getItem(nk)) return;
    const legacy = localStorage.getItem(LS_MACHINE_CONFIGS);
    if (!legacy) return;
    localStorage.setItem(nk, legacy);
  } catch (_) {
    /* ignore */
  }
}

function fnBase() {
  return `${window.location.origin}/.netlify/functions`;
}

function getBearer() {
  const u = getCurrentUser();
  if (!u || !u.serverAuth || !u.authToken) return '';
  return String(u.authToken).trim();
}

/** @typedef {{ lastSyncFromServerAt: number, lastLocalModifyAt: number }} SyncMeta */

function readMeta() {
  try {
    const raw = localStorage.getItem(USER_SYNC_META_KEY);
    if (!raw) return { lastSyncFromServerAt: 0, lastLocalModifyAt: 0 };
    const o = JSON.parse(raw);
    return {
      lastSyncFromServerAt: Number(o.lastSyncFromServerAt) || 0,
      lastLocalModifyAt: Number(o.lastLocalModifyAt) || 0,
    };
  } catch (_) {
    return { lastSyncFromServerAt: 0, lastLocalModifyAt: 0 };
  }
}

function writeMeta(m) {
  try {
    localStorage.setItem(USER_SYNC_META_KEY, JSON.stringify(m));
  } catch (_) {
    /* ignore */
  }
}

/** Llamar al cerrar sesion (ver clearLocalUser). */
export function clearUserSyncMeta() {
  try {
    localStorage.removeItem(USER_SYNC_META_KEY);
  } catch (_) {
    /* ignore */
  }
  initPromise = null;
}

function readMachineConfigRoot() {
  const em = accountEmailForMachine();
  if (!em) return {};
  migrateMachineConfigsLegacy(em);
  try {
    const raw = localStorage.getItem(`${LS_MACHINE_CONFIGS}::${em}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

function replaceMachineConfigRoot(obj) {
  const em = accountEmailForMachine();
  if (!em) return;
  try {
    localStorage.setItem(
      `${LS_MACHINE_CONFIGS}::${em}`,
      JSON.stringify(obj && typeof obj === 'object' ? obj : {}),
    );
  } catch (_) {
    /* ignore */
  }
}

function localStorageHasMachineData() {
  const root = readMachineConfigRoot();
  for (const v of Object.values(root)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0) return true;
  }
  return false;
}

function applyServerDoc(doc) {
  const g = Array.isArray(doc.gearmotors) ? doc.gearmotors : [];
  replaceUserGearmotorsList(g, { skipCloudSync: true });
  replaceMachineConfigRoot(
    doc.machineConfigs && typeof doc.machineConfigs === 'object' ? doc.machineConfigs : {},
  );
  try {
    window.dispatchEvent(new CustomEvent('mdr-machine-configs-changed'));
  } catch (_) {
    /* ignore */
  }
}

function serverDocHasData(doc) {
  const g = Array.isArray(doc.gearmotors) && doc.gearmotors.length > 0;
  const mc = doc.machineConfigs && typeof doc.machineConfigs === 'object' && Object.keys(doc.machineConfigs).length > 0;
  return g || mc;
}

/**
 * Toca metadatos y programa subida (debounce) si hay sesion servidor.
 */
export function touchLocalAndSchedulePush() {
  if (!FEATURES.useServerAuth) return;
  if (!getBearer()) return;
  const m = readMeta();
  m.lastLocalModifyAt = Date.now();
  writeMeta(m);
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushUserData();
  }, 1800);
}

/** @type {ReturnType<typeof setTimeout> | null} */
let pushTimer = null;

async function pushUserData() {
  if (!FEATURES.useServerAuth || !getBearer()) return;
  const gearmotors = listUserGearmotors();
  const machineConfigs = readMachineConfigRoot();
  let res;
  try {
    res = await fetch(`${fnBase()}/user-data`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getBearer()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gearmotors, machineConfigs }),
    });
  } catch (_) {
    return;
  }
  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    /* ignore */
  }
  if (!res.ok || !data.updatedAt) return;
  const m = readMeta();
  m.lastSyncFromServerAt = data.updatedAt;
  m.lastLocalModifyAt = data.updatedAt;
  writeMeta(m);
}

/** @type {Promise<void> | null} */
let initPromise = null;

/**
 * Tras carga: resuelve conflictos por timestamp; migra local -> servidor si el blob esta vacio.
 */
export function initUserCloudSync() {
  if (!FEATURES.useServerAuth) return Promise.resolve();
  if (!getBearer()) {
    initPromise = null;
    return Promise.resolve();
  }
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const meta = readMeta();
    const localTs = meta.lastLocalModifyAt || 0;
    const appliedTs = meta.lastSyncFromServerAt || 0;

    let doc;
    try {
      const res = await fetch(`${fnBase()}/user-data`, {
        headers: { Authorization: `Bearer ${getBearer()}` },
      });
      if (res.status === 401) return;
      if (!res.ok) return;
      doc = await res.json();
    } catch (_) {
      return;
    }

    if (!doc || typeof doc !== 'object') return;
    const Ts = typeof doc.updatedAt === 'number' && Number.isFinite(doc.updatedAt) ? doc.updatedAt : 0;

    if (Ts > appliedTs) {
      applyServerDoc(doc);
      const m = readMeta();
      m.lastSyncFromServerAt = Ts;
      m.lastLocalModifyAt = Ts;
      writeMeta(m);
      return;
    }

    if (!serverDocHasData(doc) && (listUserGearmotors().length > 0 || localStorageHasMachineData())) {
      await pushUserData();
      return;
    }

    if (localTs > Ts) {
      await pushUserData();
    }
  })();

  return initPromise;
}

if (typeof window !== 'undefined') {
  window.addEventListener('mdr-clear-user-sync', () => {
    clearUserSyncMeta();
  });
}
