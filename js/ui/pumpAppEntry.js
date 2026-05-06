/**
 * Entrada página bomba centrífuga — Pro salvo licencia; plana y rodillos gratis en el hub.
 */

import { mountTierStatusBar } from './paywallMount.js';
import { mountMachineConfigBar } from './machineConfigMount.js';
import { runProMachineEntryGuard } from './proMachineEntryGuard.js';

mountTierStatusBar();
if (runProMachineEntryGuard()) {
  await import('./centrifugalPumpPage.js');
  mountMachineConfigBar();
}
