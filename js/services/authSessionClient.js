/**
 * Cierre de sesión local cuando el servidor invalida el JWT (otro dispositivo, etc.).
 */

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
    const lang =
      typeof document !== 'undefined'
        ? String(document.documentElement.lang || 'es').toLowerCase()
        : 'es';
    const en = lang.startsWith('en');
    const msg =
      reason === 'revoked'
        ? en
          ? 'Your session ended because you signed in on another device. Please sign in again.'
          : 'Tu sesión se cerró porque iniciaste sesión en otro dispositivo. Vuelve a iniciar sesión.'
        : en
          ? 'Your session has expired. Please sign in again.'
          : 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
    try {
      sessionStorage.setItem(SESSION_MSG_KEY, msg);
    } catch (_) {}
    if (typeof window !== 'undefined' && window.location) {
      const q = reason === 'revoked' ? 'replaced' : 'expired';
      window.location.href = `/register.html?session=${q}`;
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
  const parsed =
    data !== undefined
      ? data
      : null;
  const revoked = isSessionRevokedResponse(res, parsed);
  handleAuthSessionEnded(revoked ? 'revoked' : 'expired');
  return true;
}
