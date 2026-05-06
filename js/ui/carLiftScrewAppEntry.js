/**
 * Entrada — elevador de coches por husillo (2 columnas, Pro).
 */

import { mountTierStatusBar } from './paywallMount.js';
import { mountMachineConfigBar } from './machineConfigMount.js';
import { runProMachineEntryGuard } from './proMachineEntryGuard.js';

mountTierStatusBar();
if (runProMachineEntryGuard()) {
  await import('./carLiftScrewPage.js');
  mountMachineConfigBar();
}

