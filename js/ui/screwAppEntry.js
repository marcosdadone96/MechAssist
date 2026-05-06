/**
 * Entrada — transportador de tornillo (Pro).
 */

import { mountTierStatusBar } from './paywallMount.js';
import { mountMachineConfigBar } from './machineConfigMount.js';
import { initScrewConveyorLangChrome } from './screwConveyorStaticI18n.js';
import { runProMachineEntryGuard } from './proMachineEntryGuard.js';

mountTierStatusBar();
if (runProMachineEntryGuard()) {
  initScrewConveyorLangChrome();
  await import('./screwConveyorPage.js');
  mountMachineConfigBar();
}
