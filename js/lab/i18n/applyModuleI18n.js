/**
 * Applies EN translations to `[data-i18n]` using a per-module dictionary.
 * ES is restored by reloading (source HTML is Spanish).
 */
import { getLabLang } from './labLang.js';
import { HOME_NAV_EN } from './homeNavEn.js';
import { applyMachinePresetLabels } from './machineHubPresetLabels.js';

/**
 * @param {Record<string, string>} dict
 */
export function applyModuleTranslations(dict) {
  if (getLabLang() !== 'en') return;
  const merged = { ...HOME_NAV_EN, ...dict };

  document.querySelectorAll('[data-be-i18n]').forEach((el) => {
    const key = el.getAttribute('data-be-i18n');
    if (!key) return;
    const txt = merged[key];
    if (txt == null) return;
    el.innerHTML = txt;
  });

  document.querySelectorAll('[data-i18n], [data-i18n-attrs]').forEach((el) => {
    const bundle = el.getAttribute('data-i18n-attrs');
    if (bundle) {
      bundle
        .trim()
        .split(/\s+/)
        .forEach((chunk) => {
          const eq = chunk.indexOf('=');
          if (eq === -1) return;
          const attrName = chunk.slice(0, eq);
          const mapKey = chunk.slice(eq + 1);
          const mapped = merged[mapKey];
          if (mapped != null) el.setAttribute(attrName, mapped);
        });
    }

    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const txt = merged[key];
    if (txt == null) return;
    const attr = el.getAttribute('data-i18n-attr');
    if (attr) {
      el.setAttribute(attr, txt);
    } else if (el.hasAttribute('data-i18n-html')) {
      el.innerHTML = txt;
    } else {
      el.textContent = txt;
    }
  });
}

/**
 * @param {Record<string, string>} dict
 * @param {{ onEnApplied?: () => void, reloadOnEs?: boolean }} [opts]
 */
export function watchLangAndApply(dict, opts = {}) {
  const { onEnApplied, reloadOnEs = true } = opts;

  function applyEn() {
    if (getLabLang() !== 'en') return;
    applyModuleTranslations(dict);
    applyMachinePresetLabels('en');
    onEnApplied?.();
  }

  applyEn();

  const onLangEvent = () => {
    if (getLabLang() === 'en') {
      applyEn();
    } else if (reloadOnEs) {
      location.reload();
    }
  };

  window.addEventListener('lab-language-changed', onLangEvent);
  window.addEventListener('home-language-changed', onLangEvent);
}
