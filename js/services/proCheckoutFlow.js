/**
 * Flujo comercial Pro: cuenta local obligatoria -> pagina de pago (checkout).
 */

import { FEATURES } from '../config/features.js';
import { getCurrentUser } from './localAuth.js';

const ALLOWED_NEXT_HTML = new Set(['checkout.html']);

export function getHomeLang() {
  try {
    return localStorage.getItem('mdr-home-lang') === 'en' ? 'en' : 'es';
  } catch (_) {
    return 'es';
  }
}

/**
 * Ruta relativa segura tras registro (solo allowlist).
 * @returns {string|null}
 */
export function getRegisterNextPath() {
  try {
    const raw = new URLSearchParams(window.location.search).get('next');
    if (!raw) return null;
    const dec = decodeURIComponent(raw).trim();
    if (dec === 'checkout') return 'checkout.html';
    if (ALLOWED_NEXT_HTML.has(dec)) return dec;
    return null;
  } catch (_) {
    return null;
  }
}

export function getCheckoutPageHref() {
  const p = FEATURES.proCheckoutPagePath || 'checkout.html';
  return p.startsWith('/') || p.includes(':') ? p : p;
}

export function buildRegisterUrlWithNextCheckout() {
  const next = encodeURIComponent('checkout.html');
  return `register.html?next=${next}`;
}

const TX_MODAL = {
  es: {
    title: 'Cuenta necesaria',
    body:
      'Para activar el plan Pro debe tener una cuenta en este navegador. Reg\u00edstrese gratis y a continuaci\u00f3n podr\u00e1 completar el pago.',
    goRegister: 'Ir al registro',
    cancel: 'Cancelar',
  },
  en: {
    title: 'Account required',
    body: 'To unlock Pro you need a free account in this browser. Register, then you can complete payment.',
    goRegister: 'Go to registration',
    cancel: 'Cancel',
  },
};

function openProGateModal(lang) {
  const t = TX_MODAL[lang] || TX_MODAL.es;
  const host = document.createElement('div');
  host.className = 'mdr-pro-gate mdr-pro-gate--toast';
  host.setAttribute('role', 'presentation');
  host.innerHTML = `
    <div class="mdr-pro-gate__backdrop" data-close="1" aria-hidden="true"></div>
    <div class="mdr-pro-gate__panel" role="alertdialog" aria-modal="true" aria-labelledby="mdr-pro-gate-title" aria-describedby="mdr-pro-gate-desc">
      <div class="mdr-pro-gate__icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
        </svg>
      </div>
      <div class="mdr-pro-gate__main">
        <h2 id="mdr-pro-gate-title" class="mdr-pro-gate__title">${t.title}</h2>
        <p id="mdr-pro-gate-desc" class="mdr-pro-gate__body">${t.body}</p>
        <div class="mdr-pro-gate__actions">
          <button type="button" class="button button--ghost" data-close="1">${t.cancel}</button>
          <button type="button" class="button button--primary" data-go-register>${t.goRegister}</button>
        </div>
      </div>
      <button type="button" class="mdr-pro-gate__x" data-close="1" aria-label="${t.cancel}">\u00d7</button>
    </div>
  `;
  const close = () => {
    document.removeEventListener('keydown', onKey);
    host.remove();
  };
  const onKey = (ev) => {
    if (ev.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKey);
  host.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', close);
  });
  host.querySelector('[data-go-register]')?.addEventListener('click', () => {
    close();
    window.location.href = buildRegisterUrlWithNextCheckout();
  });
  document.body.appendChild(host);
  queueMicrotask(() => {
    host.querySelector('[data-go-register]')?.focus();
  });
}

/**
 * Si hay sesion local, abre la pagina de pago. Si no, muestra aviso y ofrece ir al registro (con retorno a checkout).
 */
export function startProCheckoutFlow() {
  if (getCurrentUser()) {
    window.location.href = getCheckoutPageHref();
    return;
  }
  openProGateModal(getHomeLang());
}
