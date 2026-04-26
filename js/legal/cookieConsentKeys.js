/** Mantener alineado con cookiesAndAnalyticsBoot.js (script clásico, sin import). */
export const COOKIE_CONSENT_LS_KEY = 'mdr-cookie-consent-v1';

/** @typedef {'analytics' | 'essential' | null} CookieConsentValue */

export function readCookieConsent() {
  try {
    const v = localStorage.getItem(COOKIE_CONSENT_LS_KEY);
    if (v === 'analytics' || v === 'essential') return v;
    return null;
  } catch (_) {
    return null;
  }
}

export function writeCookieConsent(value) {
  try {
    if (value === 'analytics' || value === 'essential') {
      localStorage.setItem(COOKIE_CONSENT_LS_KEY, value);
    } else {
      localStorage.removeItem(COOKIE_CONSENT_LS_KEY);
    }
  } catch (_) {
    /* ignore */
  }
}
