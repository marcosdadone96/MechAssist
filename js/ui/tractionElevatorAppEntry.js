import { mountTierStatusBar } from './paywallMount.js';
import { mountMachineConfigBar } from './machineConfigMount.js';
import { initTractionElevatorLangChrome } from './tractionElevatorStaticI18n.js';
import { runProMachineEntryGuard } from './proMachineEntryGuard.js';

mountTierStatusBar();
if (runProMachineEntryGuard()) {
  initTractionElevatorLangChrome();
  await import('./tractionElevatorPage.js');
  mountMachineConfigBar();
}
