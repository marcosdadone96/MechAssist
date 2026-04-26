/**
 * Pagina cookie-preferences.html: cambiar analitica (GA4) sin borrar todo el sitio.
 */

import { COOKIE_CONSENT_LS_KEY, readCookieConsent, writeCookieConsent } from './cookieConsentKeys.js';

function getLang() {
  try {
    return localStorage.getItem('mdr-home-lang') === 'en' ? 'en' : 'es';
  } catch (_) {
    return 'es';
  }
}

const COPY = {
  es: {
    title: 'Preferencias de cookies',
    lead:
      'Puede activar o desactivar las cookies de anal\u00edtica (Google Analytics). Las cookies estrictamente necesarias (idioma, esta elecci\u00f3n) se mantienen para que el sitio funcione.',
    current: 'Estado actual',
    stateAnalytics: 'Anal\u00edtica aceptada',
    stateEssential: 'Solo necesarias (sin anal\u00edtica)',
    stateUnset: 'Sin elegir a\u00fan (ver\u00e1 el banner)',
    enable: 'Activar anal\u00edtica',
    disable: 'Desactivar anal\u00edtica',
    saved: 'Preferencia guardada. Recargando\u2026',
    note:
      'Si desactiva la anal\u00edtica, es posible que queden cookies de terceros previas hasta que las borre en su navegador.',
    backCookies: 'Volver a informaci\u00f3n de cookies',
    reset:
      'Borrar mi elecci\u00f3n y mostrar el banner de cookies de nuevo (volver\u00e1 a preguntar).',
  },
  en: {
    title: 'Cookie preferences',
    lead:
      'You can enable or disable analytics cookies (Google Analytics). Strictly necessary cookies (language, this choice) remain so the site works.',
    current: 'Current status',
    stateAnalytics: 'Analytics accepted',
    stateEssential: 'Essential only (no analytics)',
    stateUnset: 'Not chosen yet (banner will show)',
    enable: 'Enable analytics',
    disable: 'Disable analytics',
    saved: 'Preference saved. Reloading\u2026',
    note: 'If you disable analytics, third-party cookies from earlier sessions may remain until you clear them in your browser.',
    backCookies: 'Back to cookie information',
    reset: 'Clear my choice and show the cookie banner again (you will be asked again).',
  },
};

function navLabels(lang) {
  const l = lang === 'en';
  return {
    home: l ? 'Home' : 'Inicio',
    privacy: l ? 'Privacy' : 'Privacidad',
    terms: l ? 'Terms' : 'T\u00e9rminos',
    cookies: 'Cookies',
    prefs: l ? 'Preferences' : 'Preferencias',
  };
}

function render() {
  const lang = getLang();
  const t = COPY[lang];
  const n = navLabels(lang);
  const root = document.getElementById('cookie-prefs-root');
  if (!root) return;

  const consent = readCookieConsent();
  let stateLabel = t.stateUnset;
  if (consent === 'analytics') stateLabel = t.stateAnalytics;
  else if (consent === 'essential') stateLabel = t.stateEssential;

  document.title = t.title + ' \u2014 MechAssist';
  document.querySelectorAll('[data-cookie-prefs-nav]').forEach((el) => {
    const k = el.getAttribute('data-cookie-prefs-nav');
    if (k === 'home') el.textContent = n.home;
    if (k === 'privacy') el.textContent = n.privacy;
    if (k === 'terms') el.textContent = n.terms;
    if (k === 'cookies') el.textContent = n.cookies;
    if (k === 'prefs') el.textContent = n.prefs;
  });

  root.innerHTML =
    `<h1>${t.title}</h1>` +
    `<p class="legal-doc__meta">${t.lead}</p>` +
    `<h2>${t.current}</h2>` +
    `<p><strong>${stateLabel}</strong></p>` +
    `<div class="cookie-prefs__actions">` +
    `<button type="button" class="cookie-prefs__btn cookie-prefs__btn--primary" id="mdr-prefs-enable">${t.enable}</button>` +
    `<button type="button" class="cookie-prefs__btn cookie-prefs__btn--ghost" id="mdr-prefs-disable">${t.disable}</button>` +
    `</div>` +
    `<p class="cookie-prefs__note">${t.note}</p>` +
    `<p><a href="cookies.html">${t.backCookies}</a></p>` +
    `<p class="cookie-prefs__reset"><button type="button" class="cookie-prefs__btn cookie-prefs__btn--link" id="mdr-prefs-reset">${t.reset}</button></p>`;

  document.getElementById('mdr-prefs-enable')?.addEventListener('click', () => {
    writeCookieConsent('analytics');
    flashAndReload(t.saved);
  });
  document.getElementById('mdr-prefs-disable')?.addEventListener('click', () => {
    writeCookieConsent('essential');
    flashAndReload(t.saved);
  });
  document.getElementById('mdr-prefs-reset')?.addEventListener('click', () => {
    try {
      localStorage.removeItem(COOKIE_CONSENT_LS_KEY);
    } catch (_) {
      /* ignore */
    }
    window.location.href = 'index.html';
  });
}

function flashAndReload(msg) {
  const root = document.getElementById('cookie-prefs-root');
  if (root) {
    const p = document.createElement('p');
    p.className = 'cookie-prefs__saved';
    p.textContent = msg;
    root.prepend(p);
  }
  window.setTimeout(() => window.location.reload(), 400);
}

render();

document.querySelectorAll('[data-legal-lang]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const l = btn.getAttribute('data-legal-lang');
    try {
      localStorage.setItem('mdr-home-lang', l === 'en' ? 'en' : 'es');
    } catch (_) {
      /* ignore */
    }
    window.location.reload();
  });
  btn.classList.toggle('hub-lang__btn--active', btn.getAttribute('data-legal-lang') === getLang());
});

/** Para depuracion / enlaces externos */
window.__MDR_COOKIE_CONSENT_KEY = COOKIE_CONSENT_LS_KEY;
