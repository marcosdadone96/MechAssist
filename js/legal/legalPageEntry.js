/**
 * Pùginas legales: privacy.html, terms.html, cookies.html (data-legal-doc en body).
 */

import { getCookiesDoc, getPrivacyDoc, getTermsDoc } from './legalCopy.js';

function getLang() {
  try {
    return localStorage.getItem('mdr-home-lang') === 'en' ? 'en' : 'es';
  } catch (_) {
    return 'es';
  }
}

const DOCS = {
  privacy: getPrivacyDoc,
  terms: getTermsDoc,
  cookies: getCookiesDoc,
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function linkifyPrivacyTerms(p) {
  let t = escapeHtml(p);
  t = t.replace(/Privacy policy/gi, '<a href="privacy.html">Privacy policy</a>');
  t = t.replace(/Pol\u00edtica de privacidad/gi, '<a href="privacy.html">Pol\u00edtica de privacidad</a>');
  return t;
}

function render(doc) {
  const root = document.getElementById('legal-main');
  if (!root) return;
  const lang = getLang();
  const back = lang === 'en' ? 'Home' : 'Inicio';
  const navPrivacy = lang === 'en' ? 'Privacy' : 'Privacidad';
  const navTerms = lang === 'en' ? 'Terms' : 'T\u00e9rminos';
  const navCookies = 'Cookies';
  const navPrefs = lang === 'en' ? 'Cookie settings' : 'Preferencias';
  const updated =
    lang === 'en' ? 'Last updated: set a firm date before launch.' : '\u00daltima actualizaci\u00f3n: fije una fecha firme antes del lanzamiento.';

  const sectionsHtml = doc.sections
    .map(
      (s) =>
        `<h2>${escapeHtml(s.title)}</h2>` +
        s.paragraphs.map((p) => `<p>${linkifyPrivacyTerms(p)}</p>`).join(''),
    )
    .join('');

  root.innerHTML =
    `<p class="legal-doc__meta">${escapeHtml(updated)}</p>` +
    `<div class="legal-disclaimer">${escapeHtml(doc.disclaimer)}</div>` +
    `<h1>${escapeHtml(doc.title)}</h1>` +
    sectionsHtml;

  document.title = doc.title + ' \u2014 MechAssist';

  document.querySelectorAll('[data-legal-nav]').forEach((a) => {
    const k = a.getAttribute('data-legal-nav');
    if (k === 'privacy') a.textContent = navPrivacy;
    if (k === 'terms') a.textContent = navTerms;
    if (k === 'cookies') a.textContent = navCookies;
    if (k === 'prefs') a.textContent = navPrefs;
    if (k === 'home') a.textContent = back;
  });
}

const key = document.body.getAttribute('data-legal-doc');
const loader = key && DOCS[key];
if (loader) {
  render(loader(getLang()));
}

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
