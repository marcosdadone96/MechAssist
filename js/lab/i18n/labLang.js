/**
 * Idioma del laboratorio: alinea con `mdr-home-lang` del hub.
 */

export const LAB_LANG_EVENT = 'lab-language-changed';

export function getLabLang() {
  try {
    return localStorage.getItem('mdr-home-lang') === 'en' ? 'en' : 'es';
  } catch (_) {
    return 'es';
  }
}

/**
 * Marca el botón ES/EN activo en la barra de navegación.
 * @param {string} [lang]
 */
export function syncLangToggleButtons(lang) {
  const currentLang = lang === 'en' ? 'en' : lang === 'es' ? 'es' : getLabLang();
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    const on = btn.getAttribute('data-lang') === currentLang;
    btn.classList.toggle('is-active', on);
    btn.classList.toggle('hub-lang__btn--active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

export function setLabLang(lang) {
  const l = lang === 'en' ? 'en' : 'es';
  try {
    localStorage.setItem('mdr-home-lang', l);
  } catch (_) {
    /* ignore */
  }
  syncLangToggleButtons(l);
  window.dispatchEvent(new CustomEvent(LAB_LANG_EVENT, { detail: { lang: l } }));
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => syncLangToggleButtons());
}
