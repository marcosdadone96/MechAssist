/**
 * Punto de entrada de las páginas de cinta: freemium + carga dinámica del módulo de cálculo.
 */

import { isToolUnlocked } from '../services/accessTier.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import { getCurrentUser } from '../services/localAuth.js';
import { mountPaywall, mountTierStatusBar } from './paywallMount.js';
import { mountMachineConfigBar } from './machineConfigMount.js';

const toolAttr = document.documentElement.getAttribute('data-conveyor-tool');
const tool = toolAttr === 'inclined' ? 'inclined' : 'flat';

mountTierStatusBar();

if (!getCurrentUser()?.email) {
  const { initGuestCalcMode } = await import('./guestCalcMode.js');
  initGuestCalcMode();
}

async function showConveyorModuleLoadError(err) {
  console.error(err);
  const el = document.getElementById('runtimeError');
  if (el instanceof HTMLElement) {
    const { genericReloadErrorMessage } = await import('./runtimeErrorMessages.js');
    const en = (() => {
      try {
        return localStorage.getItem('mdr-home-lang') === 'en';
      } catch (_) {
        return false;
      }
    })();
    el.hidden = false;
    el.textContent = genericReloadErrorMessage(en);
  }
}

if (!isToolUnlocked(tool)) {
  mountPaywall(tool);
} else if (tool === 'flat') {
  try {
    await import('./flatConveyorPage.js');
    mountMachineConfigBar();
  } catch (e) {
    showConveyorModuleLoadError(e);
  }
} else {
  try {
    await import('./inclinedConveyorPage.js');
    mountMachineConfigBar();
  } catch (e) {
    showConveyorModuleLoadError(e);
  }
}
