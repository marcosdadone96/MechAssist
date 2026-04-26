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

export function setLabLang(lang) {
  const l = lang === 'en' ? 'en' : 'es';
  try {
    localStorage.setItem('mdr-home-lang', l);
  } catch (_) {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(LAB_LANG_EVENT, { detail: { lang: l } }));
}
