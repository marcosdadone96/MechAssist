import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'js/ui/calcBeamPage.js');
const head = fs.readFileSync(target, 'utf8').split('const BEAM_PRESETS = [')[0];

const body = String.raw`const BEAM_PRESETS = [
  {
    label: 'Viga pasillo - carga puntual central',
    labelKey: 'beam.preset1',
    values: {
      beamType: 'simply-supported',
      beamLoadType: 'point-center',
      beamSection: 'rectangular',
      beamE: 'steel',
      beamSpan: 4,
      beamWidth: 100,
      beamHeight: 200,
      beamLoad: 8000,
      beamSigAdm: 160,
    },
  },
  {
    label: 'Voladizo estanter\u00eda \u2014 distribuida',
    labelKey: 'beam.preset2',
    values: {
      beamType: 'cantilever',
      beamLoadType: 'distributed',
      beamSection: 'rectangular',
      beamE: 'steel',
      beamSpan: 1.5,
      beamWidth: 80,
      beamHeight: 160,
      beamLoad: 2000,
      beamSigAdm: 160,
    },
  },
  {
    label: 'Perfil IPE 200 \u2014 carga puntual',
    labelKey: 'beam.preset3',
    values: {
      beamType: 'simply-supported',
      beamLoadType: 'point-center',
      beamSection: 'i-section',
      beamE: 'steel',
      beamSpan: 6,
      beamFlangeW: 100,
      beamTotalH: 200,
      beamWebT: 5.6,
      beamFlangeT: 8.5,
      beamLoad: 15000,
      beamSigAdm: 235,
    },
  },
];

const BEAM_URL_PARAMS = {
  type: 'beamType',
  load: 'beamLoadType',
  section: 'beamSection',
  mat: 'beamE',
  L: 'beamSpan',
  F: 'beamLoad',
  a: 'beamLoadPos',
  b: 'beamLoadPosB',
  bw: 'beamWidth',
  bh: 'beamHeight',
  d: 'beamDiam',
  dex: 'beamDiamExt',
  din: 'beamDiamInt',
  bf: 'beamFlangeW',
  h: 'beamTotalH',
  tw: 'beamWebT',
  tf: 'beamFlangeT',
  E: 'beamECustom',
  sadm: 'beamSigAdm',
};

const beamUrl = createLabUrlSync(BEAM_URL_PARAMS, {
  hydrateOrder: ['type', 'load', 'section', 'mat', 'L', 'F'],
  afterHydrate: () => scheduleBeamRecalc(),
});

function refreshCore() {
  syncBeamFieldVisibility();
  const results = document.getElementById('beamResults');
  if (syncInputValidationResultsGate(results)) return;

  const beamType = readSelect('beamType', 'simply-supported');
  const loadType = readSelect('beamLoadType', 'point-center');
  const section = readSelect('beamSection', 'rectangular');
  const material = readSelect('beamE', 'steel');
  const span_m = readNum('beamSpan', 3);
  const load = readNum('beamLoad', 0);
  const sigAdm_MPa = readNum('beamSigAdm', 0);

  const dims = {
    width: readNum('beamWidth', 100),
    height: readNum('beamHeight', 200),
    diam: readNum('beamDiam', 32),
    diamExt: readNum('beamDiamExt', 60),
    diamInt: readNum('beamDiamInt', 40),
    bf: readNum('beamFlangeW', 100),
    h: readNum('beamTotalH', 200),
    webT: readNum('beamWebT', 6),
    flangeT: readNum('beamFlangeT', 8),
  };

  const r = computeBeamAnalysis({
    beamType,
    loadType,
    section,
    material,
    E_custom_MPa: readNum('beamECustom', 210000),
    span_m,
    load,
    loadPos_m: readNum('beamLoadPos', span_m / 2),
    loadPosB_m: readNum('beamLoadPosB', span_m),
    dims,
    sigAdm_MPa,
  });

  const hero = document.getElementById('beamHero');
  const alerts = document.getElementById('beamAlerts');

  if (!r.ok) {
    if (hero) hero.innerHTML = '';
    if (alerts) {
      alerts.innerHTML = executiveSummaryAlert({
        level: 'danger',
        titleEs: 'Datos insuficientes o secci\u00f3n no v\u00e1lida.',
        titleEn: 'Insufficient data or invalid section.',
        actionsEs: ['Revise dimensiones de la secci\u00f3n.', 'Compruebe di\u00e1metros interior/exterior.'],
        actionsEn: ['Check section dimensions.', 'Verify inner/outer diameters.'],
      });
    }
    if (results) results.innerHTML = '';
    renderBeamDiagram(document.getElementById('beamDiagram'), { beamType, loadType, span_m });
    updateLabShareVisibility('beamShareLinkWrap', 'beamResults');
    if (!beamUrl.hydrating) beamUrl.serializeToUrl();
    return;
  }

  const deltaRatio = r.delta_ratio;
  let defVerdict = 'ok';
  if (deltaRatio > 1 / 100) defVerdict = 'error';
  else if (deltaRatio > 1 / 300) defVerdict = 'warn';

  let sigVerdict = 'ok';
  if (sigAdm_MPa > 0) {
    if (r.usageSigma > 1) sigVerdict = 'error';
    else if (r.usageSigma > 0.8) sigVerdict = 'warn';
  }

  if (hero) {
    hero.innerHTML = renderResultHero(
      [
        {
          label: bx('Flecha m\u00e1x. \u03b4', 'Max deflection \u03b4'),
          display: \`\${r.delta_max_mm.toFixed(2)} mm\`,
          hint: bx(\`\u03b4/L = \${(deltaRatio * 1000).toFixed(2)} \u2030\`, \`\u03b4/L = \${(deltaRatio * 1000).toFixed(2)} \u2030\`),
        },
        {
          label: bx('Tensi\u00f3n normal \u03c3', 'Normal stress \u03c3'),
          display: formatStress(r.sigma_max),
          hint:
            sigAdm_MPa > 0
              ? \`\u03c3/\u03c3<sub>adm</sub> = \${(r.usageSigma * 100).toFixed(0)}%\`
              : bx('Sin \u03c3<sub>adm</sub>', 'No \u03c3<sub>allow</sub> set'),
        },
      ],
      { verdict: defVerdict === 'error' || sigVerdict === 'error' ? 'error' : defVerdict === 'warn' || sigVerdict === 'warn' ? 'warn' : 'ok' },
    );
  }

  const alertParts = [];
  if (deltaRatio > 1 / 300) {
    alertParts.push(
      labAlert(
        'warn',
        bx(
          'Flecha elevada \u2014 verificar limitaci\u00f3n de servicio (L/300\u2013L/500 habitual).',
          'High deflection \u2014 check serviceability limits (typical L/300\u2013L/500).',
        ),
      ),
    );
  }
  if (sigAdm_MPa > 0 && r.sigma_max > sigAdm_MPa) {
    alertParts.push(
      labAlert('error', bx('Tensi\u00f3n sobre l\u00edmite admisible indicado.', 'Stress above indicated allowable limit.')),
    );
  }
  if (r.fixedIndeterminate) {
    alertParts.push(
      labAlert(
        'info',
        bx(
          'Viga empotrada en ambos extremos: modelo est\u00e1ticamente indeterminado simplificado.',
          'Fixed\u2013fixed beam: simplified indeterminate model.',
        ),
      ),
    );
  }
  if (alerts) alerts.innerHTML = alertParts.join('');

  if (results) {
    results.innerHTML = [
      metricHtml(bx('Momento m\u00e1x. M', 'Max moment M'), \`\${r.M_max.toFixed(1)} N\u00b7m\`),
      metricHtml(bx('Cortante m\u00e1x. V', 'Max shear V'), formatForce(r.V_max)),
      metricHtml(bx('Flecha m\u00e1x. \u03b4', 'Max deflection \u03b4'), \`\${r.delta_max_mm.toFixed(2)} mm\`),
      metricHtml(bx('Tensi\u00f3n \u03c3', 'Stress \u03c3'), formatStress(r.sigma_max)),
      metricHtml(bx('Cortadura \u03c4', 'Shear \u03c4'), formatStress(r.tau_max)),
      metricHtml('I', \`\${r.I.toExponential(3)} mm<sup>4</sup>\`),
      metricHtml('W', \`\${r.W.toExponential(3)} mm<sup>3</sup>\`),
      metricHtml('A', \`\${r.A.toFixed(0)} mm<sup>2</sup>\`),
      metricHtml('\u03b4/L', \`1/\${deltaRatio > 0 ? Math.round(1 / deltaRatio) : '\u2014'}\`),
      sigAdm_MPa > 0
        ? metricHtml(bx('\u00cdndice uso \u03c3', 'Stress usage'), \`\${(r.usageSigma * 100).toFixed(0)} %\`)
        : '',
    ].join('');
  }

  renderBeamDiagram(document.getElementById('beamDiagram'), {
    beamType,
    loadType,
    span_m,
    loadPos_m: readNum('beamLoadPos', span_m / 2),
    loadPosB_m: readNum('beamLoadPosB', span_m),
    delta_mm: r.delta_max_mm,
    M_max: r.M_max,
  });

  updateLabShareVisibility('beamShareLinkWrap', 'beamResults');
  if (!beamUrl.hydrating) beamUrl.serializeToUrl();
}

const resultsWrap = document.getElementById('beamResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(resultsWrap, refreshCore), 55);
const beamPresets = mountLabPresetsBar('beamPresetsBar', BEAM_PRESETS, debounced);

function scheduleBeamRecalc() {
  if (!beamPresets.applying && !beamUrl.hydrating) beamPresets.clearActive();
  debounced();
}

beamUrl.hydrateFromUrl();
bindLabUnitSelectors(scheduleBeamRecalc);

[
  'beamType',
  'beamLoadType',
  'beamSection',
  'beamE',
  'beamSpan',
  'beamLoad',
  'beamLoadPos',
  'beamLoadPosB',
  'beamWidth',
  'beamHeight',
  'beamDiam',
  'beamDiamExt',
  'beamDiamInt',
  'beamFlangeW',
  'beamTotalH',
  'beamWebT',
  'beamFlangeT',
  'beamECustom',
  'beamSigAdm',
  'labUnitForce',
  'labUnitPressure',
].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleBeamRecalc);
  document.getElementById(id)?.addEventListener('change', scheduleBeamRecalc);
});

watchLangAndApply(BEAM_PAGE_EN, {
  reloadOnEs: false,
  onEnApplied: scheduleBeamRecalc,
  onEsRestored: scheduleBeamRecalc,
});

wireLabCopyLink('beamCopyLinkBtn', 'beamCopyToast');
wireLabCopyResultsButton('beamCopyResults', {
  moduleTitle: bx('Vigas \u00b7 flexi\u00f3n', 'Beams \u00b7 bending'),
});

revalidateAllBoundInputs();
runLabCalcBoot(resultsWrap, refreshCore);
mountLabCloudSaveBar(bx('Vigas \u00b7 flexi\u00f3n', 'Beams \u00b7 bending'), {
  norm: 'Euler-Bernoulli \u00b7 vigas est\u00e1ticas',
  svgSelector: '#beamDiagram',
  scopeSelector: '.lab-calc-layout__out',
});
`;

fs.writeFileSync(target, head + body, 'utf8');
console.log('Fixed', target);
