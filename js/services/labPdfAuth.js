/**
 * Exportacion PDF del laboratorio: solo con sesion iniciada.
 */
import { getCurrentUser } from './localAuth.js';

/** @returns {boolean} */
export function isLabPdfExportAllowed() {
  const u = getCurrentUser();
  return Boolean(String(u?.email || '').trim());
}

/**
 * @param {boolean} [en]
 * @returns {string}
 */
export function labPdfSignInUrl(en) {
  const file = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || '' : '';
  const next = file ? `?next=${encodeURIComponent(file)}` : '';
  return `register.html${next}`;
}

/**
 * @param {boolean} [en]
 */
export function labPdfSignInMessage(en) {
  return en
    ? 'Sign in or create a free account to export the PDF report.'
    : 'Inicie sesi\u00f3n o cree una cuenta gratuita para exportar el informe PDF.';
}
