/**
 * Slugs permitidos para desbloqueo puntual (webhook Lemon).
 * Mantener alineado con config/calc-unlock-catalog.json
 */
const catalog = require('../../../config/calc-unlock-catalog.json');

const SLUG_SET = new Set(
  catalog.map((row) => String(row.slug || '').trim()).filter(Boolean),
);

/**
 * @param {string} slug
 * @returns {boolean}
 */
function isAllowedCalcUnlockSlug(slug) {
  return SLUG_SET.has(String(slug || '').trim().slice(0, 80));
}

module.exports = { isAllowedCalcUnlockSlug, CALC_UNLOCK_SLUGS: [...SLUG_SET] };
