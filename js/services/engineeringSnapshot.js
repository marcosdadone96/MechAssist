/**
 * Eventos transversales para el Smart Dashboard y filtros de catálogo.
 */

export const MDR_ENGINEERING_SNAPSHOT = 'mdr:engineering-snapshot';
export const MDR_STOCK_FILTER_CHANGED = 'mdr:stock-filter-changed';

/**
 * @param {object} detail
 * @param {string} detail.page
 * @param {string} detail.moduleLabel
 * @param {'en'|'es'} [detail.advisorLang] — hints for Advisor copy (e.g. belt lab in English)
 * @param {object} [detail.advisorContext]
 * @param {Array<{ commerceId: string, qty?: number, note?: string }>} [detail.shoppingLines]
 * @param {{ energyEfficiencyPct?: number | null, materialUtilizationPct?: number | null }} [detail.metrics]
 */
export function emitEngineeringSnapshot(detail) {
  window.dispatchEvent(new CustomEvent(MDR_ENGINEERING_SNAPSHOT, { detail }));
}
