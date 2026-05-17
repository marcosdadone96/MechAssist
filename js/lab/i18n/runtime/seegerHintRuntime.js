/** Localize lookupSeeger hint strings (ES source from seegerDinTables). */

/**
 * @param {string} hintEs
 * @param {'es'|'en'} lang
 */
export function localizeSeegerHint(hintEs, lang) {
  if (!hintEs || lang !== 'en') return hintEs;
  if (hintEs === 'Introduzca un di\u00e1metro positivo (mm).') return 'Enter a positive diameter (mm).';
  if (hintEs === 'Sin datos.') return 'No data.';
  if (hintEs.includes('fuera del rango \u00fatil') && hintEs.includes('DIN 471')) {
    return 'Diameter outside useful range of this demo (approx. 3\u2013100 mm). See DIN 471 or catalogue.';
  }
  if (hintEs.includes('fuera del rango \u00fatil') && hintEs.includes('DIN 472')) {
    return 'Diameter outside useful range of this demo (approx. 8\u2013100 mm). See DIN 472 or catalogue.';
  }
  const m = hintEs.match(
    /^No hay talla exacta en la demo: nominal \*\*(\d+(?:\.\d+)?) mm\*\* \(delta ([\d.]+) mm\)\. Confirme en cat\u00e1logo\.$/,
  );
  if (m) {
    return `No exact size in demo: nominal **${m[1]} mm** (delta ${m[2]} mm). Confirm in catalogue.`;
  }
  return hintEs;
}
