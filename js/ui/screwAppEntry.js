/**
 * Entrada — transportador de tornillo (Pro).
 */

import { mountTierStatusBar } from './paywallMount.js';
import { mountMachineConfigBar } from './machineConfigMount.js';
import { runProMachineEntryGuard } from './proMachineEntryGuard.js';

mountTierStatusBar();
if (runProMachineEntryGuard()) {
  await import('./screwConveyorPage.js');
  mountMachineConfigBar();
}
