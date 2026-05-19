/**
 * Bloqueo de entradas en calculadoras (visitante / sin creditos).
 */

export const CALC_LOCK_NAV_ALLOW =
  '.site-nav, .hub-lang, .guest-calc-banner, .no-credits-lock-banner, #credits-balance-bar, .credits-modal-backdrop, [data-credits-allow], [data-no-credits-allow], .register-form, .register-panel, #registerForm, #registerLoginForm, .register-auth-tabs, .be-wizard-nav, [data-be-step], details.flat-accordion > summary, details.motors-details > summary, details.lab-results-details > summary, .checkout-page, .checkout-card, #coWithdrawalWrap';

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
  const appMain = document.querySelector('main.app-main');
  if (appMain instanceof HTMLElement) {
    const scoped =
      appMain.querySelector('.flat-sidebar') ||
      appMain.querySelector('.be-main-col') ||
      appMain.querySelector('.lab-calc-layout__inputs');
    if (scoped instanceof HTMLElement) return scoped;
    if (appMain.classList.contains('checkout-page') || appMain.classList.contains('register-page')) {
      return null;
    }
    return appMain;
  }
  return (
    document.querySelector('main.lab-main .lab-calc-layout__inputs') ||
    document.querySelector('main.lab-main .lab-grid') ||
    document.querySelector('main.app-main .form-stack') ||
    document.querySelector('main.app-main') ||
    document.querySelector('main.lab-main') ||
    document.querySelector('main')
  );
}
