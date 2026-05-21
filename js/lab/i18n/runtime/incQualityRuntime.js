/** Dynamic quality-checklist copy for inclinedConveyorPage.js */

function fmt(x, d = 2) {
  if (!Number.isFinite(x)) return '\u2014';
  return x.toFixed(d);
}

/**
 * @param {'es'|'en'} lang
 */
export function incQualityStrings(lang) {
  const en = lang === 'en';
  return {
    efficiencyError: (rawPct, effPct) =>
      en
        ? `Efficiency eta=${fmt(rawPct, 1)}% invalid (>100). Calculation uses safe cap ${fmt(effPct, 1)}%.`
        : `Rendimiento \u03b7=${fmt(rawPct, 1)} % inv\u00e1lido (>100). El c\u00e1lculo usa l\u00edmite seguro de ${fmt(effPct, 1)} %.`,
    efficiencyWarn: (pct) =>
      en
        ? `Efficiency eta=${fmt(pct, 1)}% is low for motor+transmission; review mechanical losses.`
        : `Rendimiento \u03b7=${fmt(pct, 1)} % bajo para conjunto motor+transmisi\u00f3n; revise p\u00e9rdidas mec\u00e1nicas.`,
    efficiencyOk: (pct) =>
      en
        ? `Efficiency eta=${fmt(pct, 1)}% in a reasonable range for pre-sizing.`
        : `Rendimiento \u03b7=${fmt(pct, 1)} % dentro de rango razonable para predimensionado.`,
    frictionWarn: (mu) =>
      en
        ? `mu=${fmt(mu, 2)} outside typical range (0.20-0.65). Verify belt/roller conditions.`
        : `\u03bc=${fmt(mu, 2)} fuera del rango t\u00edpico (0.20\u20130.65). Verifique condici\u00f3n real de banda/rodillos.`,
    frictionOk: (mu) =>
      en
        ? `mu=${fmt(mu, 2)} in indicative range.`
        : `\u03bc=${fmt(mu, 2)} en rango orientativo.`,
    startWarn: (ratio) =>
      en
        ? `High startup peak (T_start/T_steady ~ ${fmt(ratio, 2)}). Consider longer ramp, VFD, or inertia tuning.`
        : `Pico de arranque alto (Tarranque/Tr\u00e9gimen \u2248 ${fmt(ratio, 2)}). Considere rampa mayor, variador o ajuste de inercia.`,
    startOk: (ratio) =>
      en
        ? `Controlled startup ratio (T_start/T_steady ~ ${fmt(ratio, 2)}).`
        : `Relaci\u00f3n de arranque controlada (Tarranque/Tr\u00e9gimen \u2248 ${fmt(ratio, 2)}).`,
    sfWarn: (sf) =>
      en
        ? `Manual service factor low (SF=${fmt(sf, 2)}). Industrial conveyors often use >= 1.15.`
        : `Factor de servicio manual bajo (SF=${fmt(sf, 2)}). Para transporte industrial suele usarse >= 1.15.`,
    sfOk: (sf) =>
      en
        ? `Service factor applied: SF=${fmt(sf, 2)}.`
        : `Factor de servicio aplicado: SF=${fmt(sf, 2)}.`,
    powerWarn: (wkg) =>
      en
        ? `High specific power (${fmt(wkg, 1)} W/kg load). Review geometry, mu, and safety margin.`
        : `Potencia espec\u00edfica elevada (${fmt(wkg, 1)} W/kg de carga). Revise geometr\u00eda, \u03bc y sobredimensionado de seguridad.`,
    powerOk: (wkg) =>
      en
        ? `Specific power in a typical belt range (${fmt(wkg, 1)} W/kg load).`
        : `Potencia espec\u00edfica en banda normal (${fmt(wkg, 1)} W/kg de carga).`,
    gravityDom: (gN, fN) =>
      en
        ? `Gravity dominates resistance (${fmt(gN, 0)} N > ${fmt(fN, 0)} N).`
        : `Predomina gravedad en la resistencia (${fmt(gN, 0)} N > ${fmt(fN, 0)} N).`,
    frictionDom: (fN, gN) =>
      en
        ? `Friction dominates resistance (${fmt(fN, 0)} N >= ${fmt(gN, 0)} N).`
        : `Predomina rozamiento en la resistencia (${fmt(fN, 0)} N >= ${fmt(gN, 0)} N).`,
  };
}
