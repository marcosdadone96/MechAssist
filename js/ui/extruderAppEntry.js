/**
 * Entrada página extrusora de husillo — Pro salvo licencia.
 */

import { mountTierStatusBar } from './paywallMount.js';
import { mountMachineConfigBar } from './machineConfigMount.js';
import { runProMachineEntryGuard } from './proMachineEntryGuard.js';

mountTierStatusBar();
if (runProMachineEntryGuard()) {
  await import('./extruderPage.js');
  mountMachineConfigBar();
}
