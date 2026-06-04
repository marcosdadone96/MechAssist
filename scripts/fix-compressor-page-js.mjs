import fs from 'fs';

const p = 'js/ui/pneumaticCompressorPage.js';
let s = fs.readFileSync(p, 'utf8');

s = s.replace(
  /const COMP_PRESETS = \[[\s\S]*?\];\n\nconst COMP_ES/,
  `const COMP_PRESETS = [
  {
    label: 'Taller peque\\u00f1o',
    labelKey: 'comp.preset1',
    values: {
      compQDem: 200,
      compQUnit: 'nlmin',
      compPTrabajo: 6,
      compPRed: 7,
      compFSim: 0.7,
      compFFug: 15,
      compTipo: 'piston',
      compEtaVol: 75,
      compNEtapas: 1,
      compPAsp: 1.013,
      compTAsp: 20,
      compEtaIso: 65,
      compTCiclo: 30,
      compDeltaP: '',
    },
  },
  {
    label: 'L\\u00ednea de montaje',
    labelKey: 'comp.preset2',
    values: {
      compQDem: 1200,
      compQUnit: 'nlmin',
      compPTrabajo: 6.5,
      compPRed: 8,
      compFSim: 0.65,
      compFFug: 18,
      compTipo: 'screw',
      compEtaVol: 87,
      compNEtapas: 1,
      compPAsp: 1.013,
      compTAsp: 25,
      compEtaIso: 70,
      compTCiclo: 30,
      compDeltaP: '',
    },
  },
  {
    label: 'Alta presi\\u00f3n 2 etapas',
    labelKey: 'comp.preset3',
    values: {
      compQDem: 600,
      compQUnit: 'nlmin',
      compPTrabajo: 10,
      compPRed: 12,
      compFSim: 0.8,
      compFFug: 12,
      compTipo: 'screw',
      compEtaVol: 84,
      compNEtapas: 2,
      compPAsp: 1.013,
      compTAsp: 20,
      compEtaIso: 72,
      compTCiclo: 25,
      compDeltaP: '',
    },
  },
];

const COMP_ES`,
);

s = s.replace(
  /const qSub = `[^`]+`;/,
  'const qSub = `${fmt(out.qRealNlMin, 0)} Nl/min &nbsp;(<strong>${fmt(out.qRealM3Min, 2)}</strong> m\\u00b3/min)`;',
);

s = s.replace(/\$\{row\('\?\?'/g, "${row('\\uD83D\\uDD35'");
s = s.replace(/\$\{row\('\?\?', 'ok'/g, "${row('\\uD83D\\uDFE2', 'ok'");

s = s.replace(
  /const alertHtml = \{[\s\S]*?\};/,
  `const alertHtml = {
    etapas: { cls: 'lab-alert--warn', key: 'alertEtapas', icon: '\\u26a0' },
    banda: { cls: 'lab-alert--warn', key: 'alertBanda', icon: '\\u26a0' },
    fugas: { cls: 'lab-alert--danger', key: 'alertFugas', icon: '\\u26a0' },
    temp: { cls: 'lab-alert--warn', key: 'alertTemp', icon: '\\u26a0' },
    ok: { cls: 'lab-alert--success', key: 'alertOK', icon: '\\u2705' },
  };`,
);

s = s.replace(
  /function buildFormulaLines\(out\) \{[\s\S]*?\n\}\n\nfunction computeAndRenderCore/,
  `function buildFormulaLines(out) {
  const en = getCurrentLang() === 'en';
  if (!out.ok) return '';
  return en
    ? \`<ul class="lab-formula-lines">
      <li>Q<sub>corr</sub> = Q<sub>dem</sub> \\u00d7 f<sub>sim</sub> \\u00d7 (1 + f<sub>leak</sub>/100) = \${fmt(out.qRealNlMin, 1)} Nl/min</li>
      <li>r = (p<sub>red</sub> + 1.013) / p<sub>suc</sub> = \${fmt(out.r, 3)}</li>
      <li>P<sub>iso</sub> = Q[m\\u00b3/s] \\u00d7 p<sub>suc</sub>[Pa] \\u00d7 ln(r) = \${fmt(out.pIsoKw, 3)} kW</li>
      <li>P<sub>shaft</sub> = P<sub>iso</sub> / (\\u03b7<sub>iso</sub> \\u00d7 0.92) = \${fmt(out.pEjeKw, 3)} kW</li>
      <li>V<sub>cycle</sub> = \${fmt(out.vCycleL, 0)} L \\u00b7 V<sub>rule</sub> = \${fmt(out.vRuleL, 0)} L \\u2192 use \${fmt(out.vRecL, 0)} L</li>
    </ul>\`
    : \`<ul class="lab-formula-lines">
      <li>Q<sub>corr</sub> = Q<sub>dem</sub> \\u00d7 f<sub>sim</sub> \\u00d7 (1 + f<sub>fug</sub>/100) = \${fmt(out.qRealNlMin, 1)} Nl/min</li>
      <li>r = (p<sub>red</sub> + 1.013) / p<sub>asp</sub> = \${fmt(out.r, 3)}</li>
      <li>P<sub>iso</sub> = Q[m\\u00b3/s] \\u00d7 p<sub>asp</sub>[Pa] \\u00d7 ln(r) = \${fmt(out.pIsoKw, 3)} kW</li>
      <li>P<sub>eje</sub> = P<sub>iso</sub> / (\\u03b7<sub>iso</sub> \\u00d7 0.92) = \${fmt(out.pEjeKw, 3)} kW</li>
      <li>V<sub>ciclo</sub> = \${fmt(out.vCycleL, 0)} L \\u00b7 V<sub>regla</sub> = \${fmt(out.vRuleL, 0)} L \\u2192 usar \${fmt(out.vRecL, 0)} L</li>
    </ul>\`;
}

function computeAndRenderCore`,
);

s = s.replace(
  /results\.innerHTML = `[\s\S]*?`;\n\n  if \(formulaBody/,
  `results.innerHTML = \`
    <article class="lab-metric"><div class="k">\${escHtml(compT('resQCorr'))}</div><div class="v">\${fmt(out.qRealNlMin, 0)} Nl/min</div><div class="lab-metric__si">\${fmt(out.qRealM3Min, 2)} m\\u00b3/min \\u00b7 \${formatFlowLmin(out.qRealNlMin, flowPref instanceof HTMLSelectElement ? flowPref.value : undefined)}</div></article>
    <article class="lab-metric"><div class="k">\${escHtml(compT('resRComp'))}</div><div class="v">\${fmt(out.r, 2)}</div></article>
    <article class="lab-metric"><div class="k">\${escHtml(compT('resPIso'))}</div><div class="v">\${fmt(out.pIsoKw, 2)} kW</div></article>
    <article class="lab-metric"><div class="k">\${escHtml(compT('resPEje'))}</div><div class="v">\${fmt(out.pEjeKw, 2)} kW</div></article>
    <article class="lab-metric"><div class="k">\${escHtml(compT('resMotorIEC'))}</div><div class="v">\${fmt(out.pMotorIecKw, 1)} kW</div><div class="lab-metric__si">\${escHtml(compT('subMotorService'))}</div></article>
    <article class="lab-metric"><div class="k">\${escHtml(compT('resCEsp'))}</div><div class="v">\${fmt(out.cEsp, 2)}</div><div class="lab-metric__si">kW/(m\\u00b3/min)</div></article>
    <article class="lab-metric"><div class="k">\${escHtml(compT('resCalderinRec'))}</div><div class="v">\${fmt(out.vRecL, 0)} L</div><div class="lab-metric__si">\${escHtml(compT('resCalderinCiclo'))}: \${fmt(out.vCycleL, 0)} L \\u00b7 \${escHtml(compT('resCalderinRegla'))}: \${fmt(out.vRuleL, 0)} L</div></article>
  \`;

  if (formulaBody`,
);

s = s.replace(
  /const COMP_ES = \{[\s\S]*?\};\n\nfunction compT/,
  `const COMP_ES = {
  'comp.verdictTitle': 'Resumen de dimensionado',
  'comp.resQCorr': 'Caudal corregido',
  'comp.resRComp': 'Relaci\\u00f3n de compresi\\u00f3n',
  'comp.resPIso': 'Potencia isot\\u00e9rmica ideal',
  'comp.resPEje': 'Potencia en el eje',
  'comp.resMotorIEC': 'Motor IEC recomendado',
  'comp.resCEsp': 'Consumo espec\\u00edfico',
  'comp.resCalderinCiclo': 'Calder\\u00edn (m\\u00e9todo ciclo)',
  'comp.resCalderinRegla': 'Calder\\u00edn (regla Q/10)',
  'comp.resCalderinRec': 'Calder\\u00edn recomendado (mayor)',
  'comp.subMotorService': 'incluye factor de servicio 15 %',
  'comp.badgeExcelente': 'EXCELENTE',
  'comp.badgeBueno': 'BUENO',
  'comp.badgeAceptable': 'ACEPTABLE',
  'comp.badgeRevisar': 'REVISAR',
  'comp.badgeHintExcelente': 'c_esp < 5,5 kW/(m\\u00b3/min)',
  'comp.badgeHintBueno': '5,5 \\u2013 7,0 kW/(m\\u00b3/min)',
  'comp.badgeHintAceptable': '7,0 \\u2013 8,5 kW/(m\\u00b3/min)',
  'comp.badgeHintRevisar': '> 8,5 kW/(m\\u00b3/min)',
  'comp.alertEtapas': 'Considere compresor de 2 etapas (r > 8 con una sola etapa).',
  'comp.alertBanda': 'Banda de presi\\u00f3n muy estrecha: ciclos frecuentes de carga/descarga.',
  'comp.alertFugas': 'Fugas excesivas: audite la red antes de dimensionar.',
  'comp.alertTemp': 'Alta temperatura de aspiraci\\u00f3n reduce el rendimiento volum\\u00e9trico.',
  'comp.alertOK': 'Par\\u00e1metros dentro de rangos normales.',
  'comp.errTitle': 'Entrada no v\\u00e1lida',
  'comp.errVerdict': 'Revise los valores del formulario.',
  'comp.verdictOk': 'Dimensionado completado \\u2014 revise alertas',
  'comp.unitKw': 'kW',
  'comp.unitKwM3': 'kW/(m\\u00b3/min)',
  'comp.unitLitres': 'L',
  'comp.hintDeltaPAuto': 'Autom\\u00e1tico: p_red \\u2212 p_trabajo',
  'comp.diagFilter': 'Filtro',
  'comp.diagCompressor': 'Compresor',
  'comp.diagTank': 'Calder\\u00edn',
  'comp.diagDryer': 'Secador',
  'comp.diagNet': 'Red',
};

function compT`,
);

fs.writeFileSync(p, s, 'utf8');
console.log('pneumaticCompressorPage.js fixed');
