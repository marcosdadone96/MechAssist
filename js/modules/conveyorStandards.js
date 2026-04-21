/**
 * Marco normativo declarado en UI (CEMA vs ISO/DIN).
 * El modelo numérico sigue siendo Coulomb + tracción; la diferencia es un margen práctico documentado.
 */

/** @typedef {'ISO5048'|'CEMA'} ConveyorDesignStandard */

/** Factor sobre la fuerza de régimen para acercar prácticas tipo CEMA (empírico, no sustituye norma completa). */
export const CEMA_STEADY_FORCE_MARGIN = 1.06;

export const STANDARD_INFO = Object.freeze({
  ISO5048: {
    id: 'ISO5048',
    shortLabel: 'ISO 5048 / DIN 22101 (enfoque analítico)',
    description:
      'Base de cálculo orientada al enfoque europeo: resistencias desglosadas y μ explícito, sin factores empíricos globales añadidos en este simulador.',
  },
  CEMA: {
    id: 'CEMA',
    shortLabel: 'CEMA (referencia EE. UU.)',
    description:
      'Se aplica un margen práctico del 6 % sobre la tracción de régimen para reflejar incertidumbres habituales en métodos empíricos CEMA; valide siempre con el manual CEMA y el fabricante de banda.',
  },
});

/**
 * @param {ConveyorDesignStandard} std
 * @returns {number} multiplicador sobre F régimen (arranque: solo se escala la parte de régimen en el modelo actual vía F_steady)
 */
export function steadyForceStandardMultiplier(std) {
  return std === 'CEMA' ? CEMA_STEADY_FORCE_MARGIN : 1;
}
