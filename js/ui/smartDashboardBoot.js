import { isFeatureEnabled } from '../config/features.js';
import { mountSmartDashboard } from './smartDashboard.js';

/**
 * @param {string} [pageHint]
 */
export function bootSmartDashboardIfEnabled(pageHint) {
  if (!isFeatureEnabled('smartLabDashboard')) return;
  mountSmartDashboard({ pageHint });
}
