/**
 * Recomendaciones orientativas de ajustes ISO 286 para aplicaciones habituales.
 * Solo combinaciones soportadas por iso286Compute (agujero A-H/JS, eje a-h/js/k/m/n/p).
 */

/** @typedef {{ id: string, label: string, fitCode: string, holeLetter: string, holeIt: string, shaftLetter: string, shaftIt: string, applyHoleLetter?: string, applyHoleIt?: string, applyShaftLetter?: string, applyShaftIt?: string, dNomSuggestion: number, category: string, comment: string, examples: string }} IsoFitRecommendation */

/** @type {IsoFitRecommendation[]} */
export const ISO286_FIT_RECOMMENDATIONS = [
  { id: 'rodamiento-deslizante', label: 'Rodamiento deslizante', fitCode: 'H7/g6', holeLetter: 'H', holeIt: 'IT7', shaftLetter: 'g', shaftIt: 'IT6', dNomSuggestion: 25, category: 'Juego', comment: 'Eje giratorio en rodamiento deslizante, ajuste móvil preciso.', examples: 'Eje en buje deslizante con guiado fino.' },
  { id: 'intercambiable-minimo-juego', label: 'Piezas intercambiables sin holgura apreciable', fitCode: 'H7/h6', holeLetter: 'H', holeIt: 'IT7', shaftLetter: 'h', shaftIt: 'IT6', dNomSuggestion: 20, category: 'Juego mínimo', comment: 'Posicionamiento sin holgura apreciable.', examples: 'Conjuntos desmontables con centrado preciso.' },
  { id: 'engranajes-poleas-bujes', label: 'Ruedas dentadas, poleas y bujes (desmontaje ocasional)', fitCode: 'H7/k6', holeLetter: 'H', holeIt: 'IT7', shaftLetter: 'k', shaftIt: 'IT6', dNomSuggestion: 40, category: 'Transición', comment: 'Transición clásica para cubos sobre eje.', examples: 'Poleas y engranes con chaveta.' },
  { id: 'acoplamientos-cubos-chaveta', label: 'Acoplamientos/cubos que transmiten par con chaveta', fitCode: 'H7/n6', holeLetter: 'H', holeIt: 'IT7', shaftLetter: 'n', shaftIt: 'IT6', dNomSuggestion: 35, category: 'Transición-apriete', comment: 'Con tendencia a interferencia ligera.', examples: 'Cubos de acople de transmisión.' },
  { id: 'casquillos-anillos-apriete', label: 'Casquillos de bronce y anillos (apriete ligero)', fitCode: 'H7/p6', holeLetter: 'H', holeIt: 'IT7', shaftLetter: 'p', shaftIt: 'IT6', dNomSuggestion: 30, category: 'Apriete ligero', comment: 'Montaje con prensa ligera o térmico suave.', examples: 'Casquillos de retención en alojamiento.' },
  { id: 'alojamiento-rodamiento-fijo', label: 'Aro exterior de rodamiento en alojamiento fijo', fitCode: 'H7/s6', holeLetter: 'H', holeIt: 'IT7', shaftLetter: 's', shaftIt: 'IT6', applyShaftLetter: 'p', applyShaftIt: 'IT6', dNomSuggestion: 50, category: 'Apriete medio', comment: 'Anillos exteriores de rodamientos en alojamiento fijo.', examples: 'En esta demo se aproxima con H7/p6 por extracto reducido.' },
  { id: 'precision-h6k5', label: 'Rodamientos de precisión sobre eje (IT5)', fitCode: 'H6/k5', holeLetter: 'H', holeIt: 'IT6', shaftLetter: 'k', shaftIt: 'IT5', dNomSuggestion: 25, category: 'Transición fino', comment: 'Ajuste fino con calidad IT5.', examples: 'Conjuntos de precisión.' },
  { id: 'bridas-js7h6', label: 'Bridas de centrado y tapas de caja', fitCode: 'JS7/h6', holeLetter: 'JS', holeIt: 'IT7', shaftLetter: 'h', shaftIt: 'IT6', dNomSuggestion: 28, category: 'Transición', comment: 'Centrado simétrico respecto a línea cero.', examples: 'Tapas de caja de engranajes.' },
];
