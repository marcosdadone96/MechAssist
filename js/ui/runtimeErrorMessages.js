/**
 * Mensajes de error genéricos para el usuario (sin detalles técnicos).
 */

/** @param {boolean} [en] */
export function genericReloadErrorMessage(en) {
  return en
    ? 'Something went wrong. Try reloading the page.'
    : 'Algo salió mal. Intenta recargar la página.';
}

/**
 * @param {HTMLElement | null} el
 * @param {boolean} [en]
 */
export function showGenericRuntimeError(el, en) {
  if (!el) return;
  el.hidden = false;
  el.textContent = genericReloadErrorMessage(en);
}
