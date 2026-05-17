/**
 * Bloqueo de entradas en calculadoras (visitante / sin creditos).
 */

export const CALC_LOCK_NAV_ALLOW =
  '.site-nav, .hub-lang, .guest-calc-banner, .no-credits-lock-banner, #credits-balance-bar, .credits-modal-backdrop, [data-credits-allow], [data-no-credits-allow]';

/**
 * @param {ParentNode} panel
 * @param {{ allowPresets?: boolean, useDisabled?: boolean }} [opts]
 */
export function lockCalcInputs(panel, opts = {}) {
  const presetAllow = opts.allowPresets
    ? '.lab-presets-bar, .lab-presets-row, [data-lab-preset], [data-guest-allow], '
    : '';
  const allowSelector = `${presetAllow}${CALC_LOCK_NAV_ALLOW}`;
  const hardLock = opts.useDisabled === true;

  panel.querySelectorAll('input, select, textarea, button').forEach((el) => {
    if (el.closest(allowSelector)) return;
    if (el instanceof HTMLInputElement && el.type === 'hidden') return;

    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      if (el.classList.contains('calc-input-locked')) return;
      if (hardLock) {
        el.dataset.calcLockPrevDisabled = el.disabled ? '1' : '0';
        el.disabled = true;
      } else {
        el.dataset.calcLockPrevReadonly = el.readOnly ? '1' : '0';
        el.readOnly = true;
        el.setAttribute('aria-readonly', 'true');
      }
      el.classList.add('calc-input-locked');
      return;
    }

    if (el instanceof HTMLButtonElement) {
      if (el.classList.contains('calc-input-locked')) return;
      el.dataset.calcLockPrevDisabled = el.disabled ? '1' : '0';
      el.disabled = true;
      el.classList.add('calc-input-locked');
    }
  });
}

/**
 * @param {ParentNode} panel
 */
export function unlockCalcInputs(panel) {
  panel.querySelectorAll('.calc-input-locked').forEach((el) => {
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      if ('calcLockPrevDisabled' in el.dataset) {
        el.disabled = el.dataset.calcLockPrevDisabled === '1';
        delete el.dataset.calcLockPrevDisabled;
      }
      if ('calcLockPrevReadonly' in el.dataset) {
        el.readOnly = el.dataset.calcLockPrevReadonly === '1';
        if (el.dataset.calcLockPrevReadonly !== '1') el.removeAttribute('aria-readonly');
        delete el.dataset.calcLockPrevReadonly;
      }
    } else if (el instanceof HTMLButtonElement) {
      el.disabled = el.dataset.calcLockPrevDisabled === '1';
      delete el.dataset.calcLockPrevDisabled;
    }
    el.classList.remove('calc-input-locked');
  });
}

/**
 * @returns {HTMLElement | null}
 */
export function findCalcInputsRoot() {
  return (
    document.querySelector('main.app-main .flat-sidebar') ||
    document.querySelector('main.app-main .lab-calc-layout__inputs') ||
    document.querySelector('main.lab-main .lab-calc-layout__inputs') ||
    document.querySelector('main.lab-main .lab-grid') ||
    document.querySelector('main.app-main .form-stack') ||
    document.querySelector('main.app-main') ||
    document.querySelector('main.lab-main') ||
    document.querySelector('main')
  );
}
