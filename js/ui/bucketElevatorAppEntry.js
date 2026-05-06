import { mountTierStatusBar } from './paywallMount.js';
import { mountMachineConfigBar } from './machineConfigMount.js';
import { initBucketElevatorLangChrome } from './bucketElevatorStaticI18n.js';
import { runProMachineEntryGuard } from './proMachineEntryGuard.js';

mountTierStatusBar();
if (runProMachineEntryGuard()) {
  initBucketElevatorLangChrome();
  await import('./bucketElevatorPage.js');
  mountMachineConfigBar();
}
