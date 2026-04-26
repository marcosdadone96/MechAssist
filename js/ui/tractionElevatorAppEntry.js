import { mountTierStatusBar } from './paywallMount.js';
import { mountMachineConfigBar } from './machineConfigMount.js';
import { initTractionElevatorLangChrome } from './tractionElevatorStaticI18n.js';

mountTierStatusBar();
initTractionElevatorLangChrome();
await import('./tractionElevatorPage.js');
mountMachineConfigBar();
