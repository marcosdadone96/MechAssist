import { mountTierStatusBar } from './paywallMount.js';
import { mountMachineConfigBar } from './machineConfigMount.js';
import { initBucketElevatorLangChrome } from './bucketElevatorStaticI18n.js';
import { runProMachineEntryGuard } from './proMachineEntryGuard.js';

mountTierStatusBar();
initBucketElevatorLangChrome();
if (runProMachineEntryGuard()) {
  await import('./bucketElevatorPage.js');
  mountMachineConfigBar();
}
