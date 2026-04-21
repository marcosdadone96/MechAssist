/**
 * Preferencia global «solo piezas en stock inmediato» — afecta desplegables de catálogo demo.
 */

import { MDR_STOCK_FILTER_CHANGED } from './engineeringSnapshot.js';

const LS_KEY = 'mdr.commerce.inStockOnly';

/**
 * @returns {boolean}
 */
export function getInStockOnly() {
  try {
    return window.localStorage.getItem(LS_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {boolean} v
 */
export function setInStockOnly(v) {
  try {
    if (v) window.localStorage.setItem(LS_KEY, '1');
    else window.localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(MDR_STOCK_FILTER_CHANGED, { detail: { inStockOnly: v } }));
}
