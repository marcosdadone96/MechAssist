/**
 * Entrada de calculadoras de m\u00e1quinas catalogadas como Pro.
 *
 * El m\u00f3dulo siempre se carga; en plan gratuito el bloqueo de formulario lo aplica
 * `applyMachinePremiumGates` (acordeones / bloques `<details>`) en cada p\u00e1gina.
 */

/**
 * @returns {boolean} siempre true: cargar el bundle de la calculadora
 */
export function runProMachineEntryGuard() {
  return true;
}
