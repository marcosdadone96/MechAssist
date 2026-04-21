/**
 * Secciones de motorreductores plegables (máquinas y líneas).
 */

/**
 * Abre el bloque de recomendaciones y hace scroll a la sección contenedora.
 * @param {string} sectionId — p. ej. section-motores, section-pump-motores
 */
export function openMotorsRecommendationsAndScroll(sectionId) {
  const det = document.getElementById('motoresRecommendations');
  if (det instanceof HTMLDetailsElement) det.open = true;
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
