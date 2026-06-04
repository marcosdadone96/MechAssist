import { mountTierStatusBar } from './paywallMount.js';
import { computeBeamAnalysis } from '../lab/beamBending.js';
import { renderBeamDiagram } from '../lab/diagramBeam.js';
import { bindLabUnitSelectors } from '../lab/labUnitPrefs.js';
import {
  bindInputValidation,
  revalidateAllBoundInputs,
  syncInputValidationResultsGate,
  createLabUrlSync,
  debounce,
  executiveSummaryAlert,
  labAlert,
  metricHtml,
  mountLabPresetsBar,
  renderResultHero,
  renderLabAdvisorInsights,
  runCalcWithIndustrialFeedback,
  runLabCalcBoot,
  updateLabShareVisibility,
  uxCopy,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { buildBeamAdvisorInsights } from '../services/iaAdvisor.js';
import { getLabLang } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { BEAM_PAGE_EN } from '../lab/i18n/pages/beamPageEn.js';

function bx(es, en) {
  return getLabLang() === 'en' ? en : es;
}

mountTierStatusBar();
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'beamSpan', min: 0.001, max: 100, label: 'L' },
  { id: 'beamLoad', min: 0, max: 1e7, label: 'Carga' },
  { id: 'beamLoadPos', min: 0, max: 100, optional: true, label: 'a' },
  { id: 'beamLoadPosB', min: 0, max: 100, optional: true, label: 'b' },
  { id: 'beamWidth', min: 0.1, max: 5000, label: 'b' },
  { id: 'beamHeight', min: 0.1, max: 5000, label: 'h' },
  { id: 'beamDiam', min: 0.1, max: 5000, label: 'd' },
  { id: 'beamDiamExt', min: 0.1, max: 5000, label: 'd ext' },
  { id: 'beamDiamInt', min: 0, max: 5000, optional: true, label: 'd int' },
  { id: 'beamFlangeW', min: 0.1, max: 5000, label: 'bf' },
  { id: 'beamTotalH', min: 0.1, max: 5000, label: 'h' },
  { id: 'beamWebT', min: 0.1, max: 500, label: 'tw' },
  { id: 'beamFlangeT', min: 0.1, max: 500, label: 'tf' },
  { id: 'beamECustom', min: 1000, max: 500000, optional: true, label: 'E' },
  { id: 'beamSigAdm', min: 0, max: 5000, optional: true, label: 'sigma adm' },
]);

function readNum(id, fallback = 0) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function readSelect(id, fallback) {
  const el = document.getElementById(id);
  return el instanceof HTMLSelectElement ? el.value || fallback : fallback;
}

function formatForce(N) {
  const sel = document.getElementById('labUnitForce');
  const u = sel instanceof HTMLSelectElement ? sel.value : 'N';
  if (u === 'kN') return `${(N / 1000).toFixed(2)} kN`;
  return `${N.toFixed(0)} N`;
}

function formatStress(MPa) {
  const sel = document.getElementById('labUnitPressure');
  const u = sel instanceof HTMLSelectElement ? sel.value : 'MPa';
  if (u === 'kPa') return `${(MPa * 1000).toFixed(0)} kPa`;
  if (u === 'Nmm2') return `${MPa.toFixed(2)} N/mm\u00b2`;
  return `${MPa.toFixed(1)} MPa`;
}

function syncBeamFieldVisibility() {
  const load = readSelect('beamLoadType', 'point-center');
  const sec = readSelect('beamSection', 'rectangular');
  const mat = readSelect('beamE', 'steel');
  const show = (id, on) => {
    const el = document.getElementById(id);
    if (el) el.hidden = !on;
  };
  show('beamLoadPosRow', load === 'point-custom' || load === 'distributed-partial');
  show('beamLoadPosBRow', load === 'distributed-partial');
  show('beamRectRows', sec === 'rectangular');
  show('beamRectRows2', sec === 'rectangular');
  show('beamCircRow', sec === 'circular-solid');
  show('beamHollowRows', sec === 'circular-hollow');
  show('beamHollowRows2', sec === 'circular-hollow');
  const showI = sec === 'i-section' || sec === 't-section';
  show('beamISectionRows', showI);
  show('beamISectionRows2', showI);
  show('beamISectionRows3', showI);
  show('beamISectionRows4', showI);
  show('beamECustomRow', mat === 'custom');
}

function beamSectionHeightMm(state) {
  const d = state.dims;
  return d.height ?? d.h ?? d.diam ?? d.diamExt ?? 100;
}

function readBeamState() {
  const span_m = readNum('beamSpan', 3);
  return {
    beamType: readSelect('beamType', 'simply-supported'),
    loadType: readSelect('beamLoadType', 'point-center'),
    section: readSelect('beamSection', 'rectangular'),
    material: readSelect('beamE', 'steel'),
    span_m,
    load: readNum('beamLoad', 0),
    sigAdm_MPa: readNum('beamSigAdm', 0),
    loadPos_m: readNum('beamLoadPos', span_m / 2),
    loadPosB_m: readNum('beamLoadPosB', span_m),
    dims: {
      width: readNum('beamWidth', 100),
      height: readNum('beamHeight', 200),
      diam: readNum('beamDiam', 32),
      diamExt: readNum('beamDiamExt', 60),
      diamInt: readNum('beamDiamInt', 40),
      bf: readNum('beamFlangeW', 100),
      h: readNum('beamTotalH', 200),
      webT: readNum('beamWebT', 6),
      flangeT: readNum('beamFlangeT', 8),
    },
    E_custom_MPa: readNum('beamECustom', 210000),
  };
}

function paintBeamDiagram(state, extra = {}) {
  const svg = document.getElementById('beamDiagram');
  if (!svg) return;
  try {
    renderBeamDiagram(svg, {
      beamType: state.beamType,
      loadType: state.loadType,
      span_m: state.span_m,
      loadPos_m: state.loadPos_m,
      loadPosB_m: state.loadPosB_m,
      ...extra,
    });
  } catch (err) {
    console.error('[beam] diagram render failed', err);
  }
}

function openBeamResultsPanel() {
  const details = document.querySelector('#beamResultsWrap details.lab-results-details');
  if (details instanceof HTMLDetailsElement) details.open = true;
}

const BEAM_PRESETS = [
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
  const state = readBeamState();
  paintBeamDiagram(state);

  if (syncInputValidationResultsGate(results)) {
    renderLabAdvisorInsights('beamAdvisorPanel', []);
    return;
  }

  const r = computeBeamAnalysis({
    beamType: state.beamType,
    loadType: state.loadType,
    section: state.section,
    material: state.material,
    E_custom_MPa: state.E_custom_MPa,
    span_m: state.span_m,
    load: state.load,
    loadPos_m: state.loadPos_m,
    loadPosB_m: state.loadPosB_m,
    dims: state.dims,
    sigAdm_MPa: state.sigAdm_MPa,
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
    paintBeamDiagram(state);
    renderLabAdvisorInsights('beamAdvisorPanel', []);
    updateLabShareVisibility('beamShareLinkWrap', 'beamResults');
    if (!beamUrl.hydrating) beamUrl.serializeToUrl();
    return;
  }

  const deltaRatio = r.delta_ratio;
  const Lh = (state.span_m * 1000) / beamSectionHeightMm(state);
  let defVerdict = 'ok';
  if (deltaRatio > 1 / 100) defVerdict = 'error';
  else if (deltaRatio > 1 / 300) defVerdict = 'warn';

  let sigVerdict = 'ok';
  if (state.sigAdm_MPa > 0) {
    if (r.usageSigma > 1) sigVerdict = 'error';
    else if (r.usageSigma > 0.8) sigVerdict = 'warn';
  }

  if (hero) {
    hero.innerHTML = renderResultHero(
      [
        {
          label: bx('Flecha m\u00e1x. \u03b4', 'Max deflection \u03b4'),
          display: `${r.delta_max_mm.toFixed(2)} mm`,
          hint: bx(`\u03b4/L = ${(deltaRatio * 1000).toFixed(2)} \u2030`, `\u03b4/L = ${(deltaRatio * 1000).toFixed(2)} \u2030`),
        },
        {
          label: bx('Tensi\u00f3n normal \u03c3', 'Normal stress \u03c3'),
          display: formatStress(r.sigma_max),
          hint:
            state.sigAdm_MPa > 0
              ? `\u03c3/\u03c3<sub>adm</sub> = ${(r.usageSigma * 100).toFixed(0)}%`
              : bx('Sin \u03c3<sub>adm</sub>', 'No \u03c3<sub>allow</sub> set'),
        },
      ],
      { verdict: defVerdict === 'error' || sigVerdict === 'error' ? 'error' : defVerdict === 'warn' || sigVerdict === 'warn' ? 'warn' : 'ok' },
    );
  }

  const alertParts = [];
  if (Lh < 10) {
    alertParts.unshift(
      labAlert(
        'info',
        bx(
          'Viga corta (L/h < 10): la deformaci\u00f3n por cortante no es despreciable \u2014 Euler-Bernoulli puede subestimar la flecha real.',
          'Short beam (L/h < 10): shear deformation is not negligible \u2014 Euler-Bernoulli may underestimate true deflection.',
        ),
      ),
    );
  }
  if (r.partialDistApprox) {
    alertParts.push(
      labAlert(
        'info',
        bx(
          'Carga distribuida parcial en viga apoyada: flecha \u03b4 calculada con aproximaci\u00f3n orientativa. Para posiciones muy descentradas o cargas peque\u00f1as, el error puede superar el 15%.',
          'Partial distributed load on simply-supported beam: deflection \u03b4 uses an indicative approximation. For highly off-centre loads or small partial lengths, the error may exceed 15%.',
        ),
      ),
    );
  }
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
  if (state.sigAdm_MPa > 0 && r.sigma_max > state.sigAdm_MPa) {
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
      metricHtml(bx('Momento m\u00e1x. M', 'Max moment M'), `${r.M_max.toFixed(1)} N\u00b7m`),
      metricHtml(bx('Cortante m\u00e1x. V', 'Max shear V'), formatForce(r.V_max)),
      metricHtml(bx('Flecha m\u00e1x. \u03b4', 'Max deflection \u03b4'), `${r.delta_max_mm.toFixed(2)} mm`),
      metricHtml(bx('Tensi\u00f3n \u03c3', 'Stress \u03c3'), formatStress(r.sigma_max)),
      metricHtml(bx('Cortadura \u03c4', 'Shear \u03c4'), formatStress(r.tau_max)),
      metricHtml('I', `${r.I.toExponential(3)} mm<sup>4</sup>`),
      metricHtml('W', `${r.W.toExponential(3)} mm<sup>3</sup>`),
      metricHtml('A', `${r.A.toFixed(0)} mm<sup>2</sup>`),
      metricHtml('\u03b4/L', `1/${deltaRatio > 0 ? Math.round(1 / deltaRatio) : '\u2014'}`),
      state.sigAdm_MPa > 0
        ? metricHtml(bx('\u00cdndice uso \u03c3', 'Stress usage'), `${(r.usageSigma * 100).toFixed(0)} %`)
        : '',
      metricHtml(
        bx('L\u00edmite L/300 (servicio)', 'L/300 limit (service)'),
        `${((r.span_m * 1000) / 300).toFixed(1)} mm`,
        bx(
          'Flecha m\u00e1xima admisible orientativa para uso general (EN 1993).',
          'Indicative max deflection for general use (EN 1993).',
        ),
      ),
      metricHtml(
        bx('L\u00edmite L/500 (sensible)', 'L/500 limit (sensitive)'),
        `${((r.span_m * 1000) / 500).toFixed(1)} mm`,
        bx(
          'Uso sensible: maquinaria, tabiques, suelos con vibraci\u00f3n.',
          'Sensitive use: machinery, partitions, vibration-sensitive floors.',
        ),
      ),
    ].join('');
    openBeamResultsPanel();
  }

  paintBeamDiagram(state, { delta_mm: r.delta_max_mm, M_max: r.M_max });

  const advLang = getLabLang() === 'en' ? 'en' : 'es';
  renderLabAdvisorInsights(
    'beamAdvisorPanel',
    buildBeamAdvisorInsights(
      {
        deflection_mm: r.delta_max_mm,
        L_mm: state.span_m * 1000,
        sigma_MPa: r.sigma_max,
        sigma_adm: state.sigAdm_MPa,
        beamType: state.beamType,
        lang: advLang,
      },
      { lang: advLang },
    ),
  );

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
  'labUnitLength',
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
