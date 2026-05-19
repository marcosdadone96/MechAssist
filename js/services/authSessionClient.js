/**
 * Cierre de sesión local cuando el servidor invalida el JWT (otro dispositivo, etc.).
 */

const SESSION_END_KEY = 'mdr-session-ended';
/** @deprecated */
const SESSION_MSG_KEY = 'mdr-session-expired-msg';

/**
 * @param {Response} res
 * @param {unknown} data
 */
export function isSessionRevokedResponse(res, data) {
  if (res?.status !== 401) return false;
  const err =
    data && typeof data === 'object' && typeof data.error === 'string' ? data.error : '';
  return err === 'session_revoked';
}

/**
 * @param {'expired'|'revoked'} [reason]
 */
export function handleAuthSessionEnded(reason = 'expired') {
  try {
    localStorage.removeItem('mdr-local-user-v1');
    localStorage.removeItem('mdr-user-sync-meta-v1');
    try {
      sessionStorage.removeItem(SESSION_MSG_KEY);
      sessionStorage.setItem(SESSION_END_KEY, reason === 'revoked' ? 'revoked' : 'expired');
    } catch (_) {}
    if (typeof window !== 'undefined' && window.location) {
      const path = String(window.location.pathname || '').toLowerCase();
      if (path.endsWith('/register.html') || path.endsWith('register.html')) {
        const q = reason === 'revoked' ? 'replaced' : 'expired';
        if (!window.location.search.includes(`session=${q}`)) {
          window.location.replace(`/register.html?session=${q}&auth=login`);
        }
        return;
      }
      const q = reason === 'revoked' ? 'replaced' : 'expired';
      window.location.href = `/register.html?session=${q}&auth=login`;
    }
  } catch (_) {
    /* ignore */
  }
}

/**
 * @param {Response} res
 * @param {unknown} [data]
 */
export function handleAuthHttpResponse(res, data) {
  if (res?.status !== 401) return false;
  const parsed = data !== undefined ? data : null;
  if (!isSessionRevokedResponse(res, parsed)) return false;
  handleAuthSessionEnded('revoked');
  return true;
}

/**
 * @returns {'revoked'|'expired'|null}
 */
export function consumeSessionEndedReason() {
  try {
    const legacy = sessionStorage.getItem(SESSION_MSG_KEY);
    if (legacy) {
      sessionStorage.removeItem(SESSION_MSG_KEY);
      return legacy.toLowerCase().includes('otro dispositivo') ||
        legacy.toLowerCase().includes('another device')
        ? 'revoked'
        : 'expired';
    }
    const code = sessionStorage.getItem(SESSION_END_KEY);
    sessionStorage.removeItem(SESSION_END_KEY);
    if (code === 'revoked' || code === 'expired') return code;
  } catch (_) {
    /* ignore */
  }
  return null;
}
