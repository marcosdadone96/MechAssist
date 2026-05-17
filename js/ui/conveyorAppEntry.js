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

if (isCreditsSystemEnabled() && !getCurrentUser()?.email) {
  const { initGuestCalcMode } = await import('./guestCalcMode.js');
  initGuestCalcMode();
}

function showConveyorModuleLoadError(err) {
  const msg = String(err?.message || err);
  console.error(err);
  const el = document.getElementById('runtimeError');
  if (el instanceof HTMLElement) {
    el.hidden = false;
    el.textContent =
      'No se pudo cargar el motor de la calculadora (revisar consola F12). Si la ruta no es flat-conveyor.html, pruebe esa URL o recargue. Detalle: ' +
      msg;
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
