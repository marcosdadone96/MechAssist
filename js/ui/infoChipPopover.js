/**
 * Ayuda en .info-chip: hover en escritorio (ratón), clic/pulse en táctil.
 * El atributo title se mantiene como respaldo; el globo usa el mismo texto.
 */

import { getCurrentLang, HOME_LANG_CHANGED_EVENT } from '../config/locales.js';

let activeEl = null;
let hoverHideTimer = null;
let langListenersBound = false;

const canHoverUi = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function removePopover() {
  if (hoverHideTimer) {
    clearTimeout(hoverHideTimer);
    hoverHideTimer = null;
  }
  if (activeEl) {
    const c = activeEl._cleanup;
    if (typeof c === 'function') c();
    activeEl.remove();
    activeEl = null;
  }
}

function positionPopover(bubble, anchor) {
  const rect = anchor.getBoundingClientRect();
  const margin = 8;
  const gap = 6;
  bubble.style.position = 'fixed';
  bubble.style.visibility = 'hidden';
  bubble.style.left = '0';
  bubble.style.top = '0';
  const bw = bubble.offsetWidth;
  const bh = bubble.offsetHeight;
  let left = rect.left + rect.width / 2 - bw / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - bw - margin));
  let top = rect.bottom + gap;
  if (top + bh > window.innerHeight - margin) {
    top = rect.top - bh - gap;
  }
  top = Math.max(margin, top);
  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;
  bubble.style.visibility = '';
}

/**
 * @param {Element} chip
 * @returns {string}
 */
export function getChipFieldLabel(chip) {
  const label = chip.closest('label');
  if (!label) return '';
  const clone = label.cloneNode(true);
  clone.querySelectorAll('.info-chip, [aria-hidden="true"]').forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} fieldName
 * @param {'es'|'en'} [lang]
 */
export function chipHelpAriaLabel(fieldName, lang = getCurrentLang()) {
  const name = fieldName.trim();
  if (!name) return '';
  return lang === 'en' ? `Help about ${name}` : `Ayuda sobre ${name}`;
}

/**
 * @param {Element} chip
 * @param {'es'|'en'} [lang]
 * @param {{ fieldName?: string, force?: boolean }} [opts]
 */
export function syncInfoChipA11y(chip, lang = getCurrentLang(), opts = {}) {
  if (!(chip instanceof HTMLElement) || chip.classList.contains('info-chip--static')) return;
  const cur = (chip.getAttribute('aria-label') || '').trim();
  if (cur && !opts.force) return;

  const fieldName = (opts.fieldName || getChipFieldLabel(chip)).trim();
  const label = chipHelpAriaLabel(fieldName, lang);
  if (label) chip.setAttribute('aria-label', label);
}

/**
 * @param {ParentNode} [root]
 * @param {'es'|'en'} [lang]
 * @param {{ force?: boolean }} [opts]
 */
export function syncAllInfoChipA11y(root = document.body, lang = getCurrentLang(), opts = {}) {
  root.querySelectorAll('.info-chip').forEach((chip) => {
    syncInfoChipA11y(chip, lang, opts);
  });
}

function bindLangResync() {
  if (langListenersBound) return;
  langListenersBound = true;
  const resync = () => syncAllInfoChipA11y(document.body, getCurrentLang(), { force: true });
  window.addEventListener(HOME_LANG_CHANGED_EVENT, resync);
  window.addEventListener('lab-language-changed', resync);
  window.addEventListener('home-language-changed', resync);
}

/**
 * @param {HTMLElement} chip
 * @param {{ toggle?: boolean }} [opts]
 */
function showChipPopover(chip, opts = {}) {
  const text = (chip.getAttribute('title') || '').trim();
  if (!text) return;

  if (
    opts.toggle &&
    activeEl?.dataset.anchorId === chip.dataset.popoverAnchorId &&
    chip.dataset.popoverAnchorId
  ) {
    removePopover();
    return;
  }
  removePopover();
  if (!chip.dataset.popoverAnchorId) {
    chip.dataset.popoverAnchorId = `ic-${Math.random().toString(36).slice(2, 9)}`;
  }

  const bubble = document.createElement('div');
  bubble.className = 'info-chip-popover';
  bubble.setAttribute('role', 'tooltip');
  bubble.dataset.anchorId = chip.dataset.popoverAnchorId;
  bubble.textContent = text;
  document.body.appendChild(bubble);
  activeEl = bubble;
  positionPopover(bubble, chip);

  const onReposition = () => {
    if (document.body.contains(bubble) && document.body.contains(chip)) {
      positionPopover(bubble, chip);
    }
  };
  window.addEventListener('scroll', onReposition, true);
  window.addEventListener('resize', onReposition);
  bubble._cleanup = () => {
    window.removeEventListener('scroll', onReposition, true);
    window.removeEventListener('resize', onReposition);
  };

  bubble.addEventListener('mouseenter', () => {
    if (hoverHideTimer) {
      clearTimeout(hoverHideTimer);
      hoverHideTimer = null;
    }
  });
  bubble.addEventListener('mouseleave', () => {
    hoverHideTimer = window.setTimeout(removePopover, 80);
  });
}

/**
 * @param {ParentNode} [root]
 */
export function initInfoChipPopovers(root = document.body) {
  if (root.dataset.infoChipPopoverInit === '1') {
    syncAllInfoChipA11y(root);
    return;
  }
  root.dataset.infoChipPopoverInit = '1';

  root.querySelectorAll('.info-chip').forEach((chip) => {
    if (!chip.hasAttribute('tabindex')) chip.setAttribute('tabindex', '0');
    if (!chip.hasAttribute('role')) chip.setAttribute('role', 'button');
  });
  syncAllInfoChipA11y(root);
  bindLangResync();

  const hoverUi = canHoverUi();

  document.addEventListener(
    'mousedown',
    (e) => {
      const t = /** @type {HTMLElement} */ (e.target);
      if (t.closest('.info-chip') || t.closest('.info-chip-popover')) return;
      removePopover();
    },
    true,
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') removePopover();
  });

  if (hoverUi) {
    root.addEventListener('mouseover', (e) => {
      const chip = /** @type {HTMLElement | null} */ (e.target)?.closest?.('.info-chip');
      if (!chip || !root.contains(chip) || chip.classList.contains('info-chip--static')) return;
      if (chip.contains(/** @type {Node} */ (e.relatedTarget))) return;
      if (hoverHideTimer) {
        clearTimeout(hoverHideTimer);
        hoverHideTimer = null;
      }
      showChipPopover(chip);
    });

    root.addEventListener('mouseout', (e) => {
      const chip = /** @type {HTMLElement | null} */ (e.target)?.closest?.('.info-chip');
      if (!chip || !root.contains(chip)) return;
      const to = /** @type {Node | null} */ (e.relatedTarget);
      if (to && (chip.contains(to) || activeEl?.contains(to))) return;
      hoverHideTimer = window.setTimeout(removePopover, 120);
    });
  }

  root.addEventListener('click', (e) => {
    if (hoverUi) return;
    const chip = /** @type {HTMLElement | null} */ (e.target)?.closest?.('.info-chip');
    if (!chip || !root.contains(chip)) return;
    if (chip.classList.contains('info-chip--static')) return;
    e.preventDefault();
    e.stopPropagation();
    showChipPopover(chip, { toggle: true });
  });

  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const chip = /** @type {HTMLElement | null} */ (e.target)?.closest?.('.info-chip');
    if (!chip || !root.contains(chip) || chip.classList.contains('info-chip--static')) return;
    e.preventDefault();
    showChipPopover(chip, { toggle: true });
  });
}
