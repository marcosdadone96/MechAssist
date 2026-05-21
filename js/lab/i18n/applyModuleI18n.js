/**
 * Applies EN translations to `[data-i18n]` using a per-module dictionary.
 * ES is restored from snapshots captured on first load (no reload required).
 */
import { getLabLang } from './labLang.js';
import { HOME_NAV_EN } from './homeNavEn.js';
import { applyMachinePresetLabels } from './machineHubPresetLabels.js';

/** @type {Map<Element, { text?: string, html?: string, attr?: string, attrValue?: string, attrBundle?: Record<string, string> }>} */
const esSnapshots = new Map();
let snapshotsReady = false;

/** Texto visible del label sin el botón "?" compacto (evita snapshots corruptos). */
function labelPlainText(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('.lab-help-hover').forEach((n) => n.remove());
  return (clone.textContent || '').trim();
}

/** Aplica texto al label preservando .lab-help-hover si existe. */
function setElementI18nText(el, txt) {
  const isLabelRow =
    el instanceof HTMLLabelElement || el.classList?.contains('lab-field__label-row');
  if (isLabelRow) {
    const help = el.querySelector(':scope > .lab-help-hover');
    if (help) {
      [...el.childNodes].forEach((n) => {
        if (n !== help) el.removeChild(n);
      });
      el.insertBefore(document.createTextNode(txt), help);
      return;
    }
  }
  el.textContent = txt;
}

function captureEsSnapshots() {
  if (snapshotsReady) return;
  const capture = (el) => {
    if (esSnapshots.has(el)) return;
    const snap = {};
    const key = el.getAttribute('data-i18n');
    if (key) {
      const attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        snap.attr = attr;
        snap.attrValue = el.getAttribute(attr) || '';
      } else if (el.hasAttribute('data-i18n-html')) {
        snap.html = el.innerHTML;
      } else {
        snap.text =
          el instanceof HTMLLabelElement || el.classList?.contains('lab-field__label-row')
            ? labelPlainText(el)
            : el.textContent;
      }
    }
    const bundle = el.getAttribute('data-i18n-attrs');
    if (bundle) {
      snap.attrBundle = {};
      bundle
        .trim()
        .split(/\s+/)
        .forEach((chunk) => {
          const eq = chunk.indexOf('=');
          if (eq === -1) return;
          const attrName = chunk.slice(0, eq);
          snap.attrBundle[attrName] = el.getAttribute(attrName) || '';
        });
    }
    if (el.hasAttribute('data-be-i18n')) {
      snap.html = el.innerHTML;
    }
    if (Object.keys(snap).length) esSnapshots.set(el, snap);
  };

  document.querySelectorAll('[data-i18n], [data-i18n-attrs], [data-be-i18n]').forEach(capture);
  snapshotsReady = true;
}

/**
 * @param {Record<string, string>} dict
 */
export function applyModuleTranslations(dict) {
  captureEsSnapshots();
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
      setElementI18nText(el, txt);
    }
  });
}

/** Restore Spanish text from snapshots (for elements with data-i18n). */
export function restoreModuleTranslations() {
  captureEsSnapshots();
  if (getLabLang() !== 'es') return;
  esSnapshots.forEach((snap, el) => {
    if (snap.attrBundle) {
      Object.entries(snap.attrBundle).forEach(([attrName, value]) => {
        el.setAttribute(attrName, value);
      });
    }
    if (snap.attr != null && snap.attrValue != null) {
      el.setAttribute(snap.attr, snap.attrValue);
    } else if (snap.html != null) {
      el.innerHTML = snap.html;
    } else if (snap.text != null) {
      setElementI18nText(el, snap.text);
    }
  });
  applyMachinePresetLabels('es');
}

/**
 * @param {Record<string, string>} dict
 * @param {{ onEnApplied?: () => void, onEsRestored?: () => void, reloadOnEs?: boolean }} [opts]
 */
export function watchLangAndApply(dict, opts = {}) {
  const { onEnApplied, onEsRestored, reloadOnEs = true } = opts;

  captureEsSnapshots();

  function applyForLang() {
    if (getLabLang() === 'en') {
      applyModuleTranslations(dict);
      applyMachinePresetLabels('en');
      onEnApplied?.();
    } else {
      restoreModuleTranslations();
      onEsRestored?.();
    }
  }

  applyForLang();

  const onLangEvent = () => {
    if (getLabLang() === 'en') {
      applyModuleTranslations(dict);
      applyMachinePresetLabels('en');
      onEnApplied?.();
    } else if (reloadOnEs) {
      location.reload();
    } else {
      restoreModuleTranslations();
      onEsRestored?.();
    }
  };

  window.addEventListener('lab-language-changed', onLangEvent);
  window.addEventListener('home-language-changed', onLangEvent);
}
