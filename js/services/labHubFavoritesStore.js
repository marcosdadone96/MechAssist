import { getCurrentUser } from './localAuth.js';

const STORAGE_BASE = 'mdr-lab-hub-pins-v1';
/** @deprecated Anonymous key; cleared when using account storage. */
const LEGACY_KEY = 'mdr-lab-hub-pins-v1';

export function isLabHubFavoritesEnabled() {
  return Boolean(String(getCurrentUser()?.email || '').trim());
}

function accountStorageKey() {
  const email = String(getCurrentUser()?.email || '').trim().toLowerCase();
  return email ? `${STORAGE_BASE}::${email}` : null;
}

function purgeLegacyAnonymousPins() {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * @returns {Record<string, string[]>}
 */
function readAll() {
  const key = accountStorageKey();
  if (!key) return {};
  purgeLegacyAnonymousPins();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(all) {
  const key = accountStorageKey();
  if (!key) return;
  purgeLegacyAnonymousPins();
  try {
    if (!Object.keys(all).length) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(all));
    }
  } catch {
    /* ignore quota */
  }
}

/**
 * @param {string} hubId
 * @returns {string[]}
 */
export function getLabHubPins(hubId) {
  if (!isLabHubFavoritesEnabled()) return [];
  const list = readAll()[hubId];
  return Array.isArray(list) ? list.filter((id) => typeof id === 'string' && id.length > 0) : [];
}

/**
 * @param {string} hubId
 * @param {string[]} orderedIds
 */
export function setLabHubPins(hubId, orderedIds) {
  if (!isLabHubFavoritesEnabled()) return;
  const all = readAll();
  const next = orderedIds.filter((id) => typeof id === 'string' && id.length > 0);
  if (!next.length) {
    delete all[hubId];
  } else {
    all[hubId] = next;
  }
  writeAll(all);
  scheduleLabHubPinsCloudSync();
}

/**
 * @param {string} hubId
 */
export function clearLabHubPins(hubId) {
  setLabHubPins(hubId, []);
}

/** @returns {Record<string, string[]>} */
export function readLabHubPinsRoot() {
  if (!isLabHubFavoritesEnabled()) return {};
  const all = readAll();
  /** @type {Record<string, string[]>} */
  const out = {};
  for (const [hubId, ids] of Object.entries(all)) {
    if (!Array.isArray(ids)) continue;
    const list = ids.filter((id) => typeof id === 'string' && id.length > 0);
    if (list.length) out[hubId] = list;
  }
  return out;
}

/**
 * @param {Record<string, string[]>} hubsRecord
 */
export function replaceLabHubPinsRoot(hubsRecord) {
  if (!isLabHubFavoritesEnabled()) return;
  const src = hubsRecord && typeof hubsRecord === 'object' ? hubsRecord : {};
  /** @type {Record<string, string[]>} */
  const out = {};
  for (const [hubId, ids] of Object.entries(src)) {
    if (!Array.isArray(ids)) continue;
    const list = ids.filter((id) => typeof id === 'string' && id.length > 0);
    if (list.length) out[String(hubId)] = list;
  }
  writeAll(out);
}

export function scheduleLabHubPinsCloudSync() {
  if (!isLabHubFavoritesEnabled()) return;
  void import('./userCloudSync.js').then((m) => {
    if (typeof m.touchLocalAndSchedulePush === 'function') {
      m.touchLocalAndSchedulePush();
    }
  });
}
