import { FEATURES } from '../config/features.js';
import { mountSmartDashboard } from './smartDashboard.js';

/** Desactivación temporal del panel lateral (ver `wireAdvisorPowerField` en calculadoras afectadas). */
const SMART_DASH_FORCE_OFF = true;

/** @returns {boolean} */
export function isSmartLabDashboardActive() {
  return FEATURES.smartLabDashboard === true && !SMART_DASH_FORCE_OFF;
}

/**
 * @param {string} [pageHint]
 */
export function bootSmartDashboardIfEnabled(pageHint) {
  if (!isSmartLabDashboardActive()) return;
  mountSmartDashboard({ pageHint });
}
