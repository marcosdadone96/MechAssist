/**
 * Calculadoras elegibles para desbloqueo puntual (1 € / 30 días).
 * Fuente: config/calc-unlock-catalog.json (mantener sincronizado con el webhook).
 */
import catalogJson from '../../config/calc-unlock-catalog.json' with { type: 'json' };

/** @typedef {{ slug: string, es: string, en: string }} CalcUnlockCatalogEntry */

/** @type {CalcUnlockCatalogEntry[]} */
export const CALC_UNLOCK_CATALOG = Object.freeze(
  catalogJson.map((row) => ({
    slug: String(row.slug || '').trim(),
    es: String(row.es || row.slug || ''),
    en: String(row.en || row.es || row.slug || ''),
  })).filter((row) => row.slug),
);

const SLUG_SET = new Set(CALC_UNLOCK_CATALOG.map((row) => row.slug));

/**
 * @param {string} slug
 * @returns {boolean}
 */
export function isCalcUnlockCatalogSlug(slug) {
  return SLUG_SET.has(String(slug || '').trim());
}

/**
 * @param {string} slug
 * @returns {CalcUnlockCatalogEntry | undefined}
 */
export function getCalcUnlockCatalogEntry(slug) {
  const s = String(slug || '').trim();
  return CALC_UNLOCK_CATALOG.find((row) => row.slug === s);
}
