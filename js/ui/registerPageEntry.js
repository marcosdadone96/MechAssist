import { mountRegisterPage } from './registerPage.js';
import { FEATURES } from '../config/features.js';

mountRegisterPage();

if (FEATURES.useServerAuth) {
  queueMicrotask(() => {
    import('../services/userCloudSync.js').then((m) => {
      void m.initUserCloudSync();
    });
  });
}
