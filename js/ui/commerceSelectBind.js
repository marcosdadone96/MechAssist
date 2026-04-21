/**
 * Reconstruye <select> de catálogo cuando cambia el filtro «solo en stock».
 */

import { getCommerceItem, isImmediateStock } from '../data/commerceCatalog.js';
import { getInStockOnly } from '../services/commerceStockFilter.js';
import { MDR_STOCK_FILTER_CHANGED } from '../services/engineeringSnapshot.js';

/**
 * @template T
 * @param {string} selectId
 * @param {T[]} allRows
 * @param {keyof T} valueKey
 * @param {keyof T | ((row: T) => string)} labelKeyOrFn
 * @param {(row: T) => string} commerceIdForRow
 */
export function bindCommerceFilteredSelect(selectId, allRows, valueKey, labelKeyOrFn, commerceIdForRow) {
  const sel = document.getElementById(selectId);
  if (!(sel instanceof HTMLSelectElement)) return;

  const labelOf = typeof labelKeyOrFn === 'function' ? labelKeyOrFn : (row) => String(row[/** @type {keyof T} */ (labelKeyOrFn)]);

  const refill = () => {
    const only = getInStockOnly();
    const prev = sel.value;
    const filtered = only
      ? allRows.filter((row) => {
          const cid = commerceIdForRow(row);
          const it = getCommerceItem(cid);
          if (!it) return true;
          return isImmediateStock(it.stock);
        })
      : allRows;

    sel.innerHTML = filtered
      .map((row) => {
        const v = String(row[valueKey]);
        const lab = labelOf(row);
        return `<option value="${v.replace(/"/g, '&quot;')}">${lab.replace(/</g, '&lt;')}</option>`;
      })
      .join('');

    if (filtered.some((row) => String(row[valueKey]) === prev)) {
      sel.value = prev;
    } else if (filtered.length) {
      sel.value = String(filtered[0][valueKey]);
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  refill();
  window.addEventListener(MDR_STOCK_FILTER_CHANGED, refill);
}
