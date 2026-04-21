/**
 * Referencias de cadena de rodillos — pasos según ISO 606 (serie B) y equivalencias ANSI habituales.
 * Valores de paso p (distancia entre pasadores) en mm; Ø rodillo orientativo para dibujo.
 *
 * Nota: dimensiones completas (ancho, carga) en catálogo del fabricante.
 */

/**
 * @typedef {Object} ChainCatalogRow
 * @property {string} id
 * @property {string} label
 * @property {string} norm — referencia normativa / familia
 * @property {number} pitch_mm — p (mm)
 * @property {number} rollerDiameter_mm — diámetro rodillo aproximado (mm)
 */

/** @type {ChainCatalogRow[]} */
export const CHAIN_CATALOG = [
  { id: 'iso-04b-1', label: '04B-1 simplex', norm: 'ISO 606 · serie B', pitch_mm: 6.0, rollerDiameter_mm: 4.0 },
  { id: 'iso-05b-1', label: '05B-1 simplex', norm: 'ISO 606 · serie B', pitch_mm: 8.0, rollerDiameter_mm: 5.08 },
  { id: 'iso-06b-1', label: '06B-1 simplex', norm: 'ISO 606 · serie B', pitch_mm: 9.525, rollerDiameter_mm: 6.35 },
  { id: 'iso-08b-1', label: '08B-1 simplex', norm: 'ISO 606 · serie B', pitch_mm: 12.7, rollerDiameter_mm: 8.51 },
  { id: 'iso-10b-1', label: '10B-1 simplex', norm: 'ISO 606 · serie B', pitch_mm: 15.875, rollerDiameter_mm: 10.16 },
  { id: 'iso-12b-1', label: '12B-1 simplex', norm: 'ISO 606 · serie B', pitch_mm: 19.05, rollerDiameter_mm: 12.07 },
  { id: 'iso-16b-1', label: '16B-1 simplex', norm: 'ISO 606 · serie B', pitch_mm: 25.4, rollerDiameter_mm: 15.88 },
  { id: 'iso-20b-1', label: '20B-1 simplex', norm: 'ISO 606 · serie B', pitch_mm: 31.75, rollerDiameter_mm: 19.05 },
  { id: 'iso-24b-1', label: '24B-1 simplex', norm: 'ISO 606 · serie B', pitch_mm: 38.1, rollerDiameter_mm: 25.4 },
  { id: 'ansi-35', label: 'ANSI 35-1 (≈ 06B)', norm: 'ANSI B29.1 · ref. comercial', pitch_mm: 9.525, rollerDiameter_mm: 5.33 },
  { id: 'ansi-40', label: 'ANSI 40-1 (≈ 08B)', norm: 'ANSI B29.1 · ref. comercial', pitch_mm: 12.7, rollerDiameter_mm: 7.92 },
  { id: 'ansi-50', label: 'ANSI 50-1 (≈ 10B)', norm: 'ANSI B29.1 · ref. comercial', pitch_mm: 15.875, rollerDiameter_mm: 10.16 },
  { id: 'ansi-60', label: 'ANSI 60-1 (≈ 12B)', norm: 'ANSI B29.1 · ref. comercial', pitch_mm: 19.05, rollerDiameter_mm: 11.91 },
  { id: 'ansi-80', label: 'ANSI 80-1 (≈ 16B)', norm: 'ANSI B29.1 · ref. comercial', pitch_mm: 25.4, rollerDiameter_mm: 15.88 },
];

/**
 * @param {string} id
 * @returns {ChainCatalogRow | undefined}
 */
export function getChainById(id) {
  return CHAIN_CATALOG.find((r) => r.id === id);
}

/**
 * Montaje: eslabón de unión + recomendación par/impar (bucle cerrado).
 * @param {number} LpFloat — longitud en pasos (puede ser fraccionaria)
 */
export function chainAssemblyHints(LpFloat) {
  const LpCeil = Math.ceil(LpFloat);
  const LpFloor = Math.floor(LpFloat);
  const nearest = Math.round(LpFloat);
  const evenUp = LpCeil % 2 === 0 ? LpCeil : LpCeil + 1;
  const oddUp = LpCeil % 2 === 1;

  return {
    Lp_exact: LpFloat,
    Lp_round_up: LpCeil,
    Lp_round_down: LpFloor,
    Lp_nearest_integer: nearest,
    oddAfterRoundUp: oddUp,
    /** Para cerrar con eslabones estándar sin desplazado, suele buscarse número **par** de pasos en bucle. */
    recommended_even_pitches: evenUp,
    /** Eslabón de unión / clip (conector) típico al montar tramo a medida: 1 ud. */
    connectingLink_count_typical: 1,
    /** Si el entero al alza es impar, en bucle cerrado a menudo hace falta **eslabón desplazado** (½ paso) o variar C. */
    offsetLink_recommended: oddUp,
    notes: oddUp
      ? 'Longitud al alza impar en pasos: valore eslabón desplazado (offset / media eslabón) o ajuste C hasta obtener un número par de pasos.'
      : 'Longitud al alza par en pasos: encaje habitual con eslabón de unión (con clip) respetando interior/exterior alterno.',
  };
}
