import { mountTierStatusBar } from './paywallMount.js';
import { computeWeldJoint } from '../lab/weldJoint.js';
import { renderWeldDiagram } from '../lab/diagramWeld.js';
import {
  bindInputValidation,
  revalidateAllBoundInputs,
  syncInputValidationResultsGate,
  createLabUrlSync,
  debounce,
  labAlert,
  metricHtml,
  mountLabPresetsBar,
  renderResultHero,
  renderLabAdvisorInsights,
  runCalcWithIndustrialFeedback,
  runLabCalcBoot,
  updateLabShareVisibility,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { getLabLang } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { WELD_JOINT_PAGE_EN } from '../lab/i18n/pages/weldJointPageEn.js';
import { buildWeldJointAdvisorInsights } from '../services/iaAdvisor.js';

function bx(es, en) {
  return getLabLang() === 'en' ? en : es;
}

mountTierStatusBar();
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'weldCateto', min: 1, max: 50, label: 'h' },
  { id: 'weldLength', min: 5, max: 50000, label: 'l' },
  { id: 'weldThickness', min: 0.5, max: 200, label: 't' },
  { id: 'weldForce', min: 0, max: 1e9, label: 'F' },
  { id: 'weldShear', min: 0, max: 1e9, optional: true, label: 'V' },
  { id: 'weldMoment', min: 0, max: 1e9, optional: true, label: 'M' },
  { id: 'weldMomentArm', min: 1, max: 5000, optional: true, label: 'z' },
  { id: 'weldCustomAdm', min: 10, max: 1000, optional: true, label: 'tau adm' },
]);

function readNum(id, fb = 0) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement)) return fb;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fb;
}

function readSelect(id, fb) {
  const el = document.getElementById(id);
  return el instanceof HTMLSelectElement ? el.value || fb : fb;
}

function syncWeldUi() {
  const mode = readSelect('weldMode', 'fillet');
  document.querySelectorAll('[data-weld-fillet]').forEach((el) => {
    el.hidden = mode !== 'fillet';
  });
  document.querySelectorAll('[data-weld-butt]').forEach((el) => {
    el.hidden = mode !== 'butt';
  });
  const M = readNum('weldMoment', 0);
  const zRow = document.getElementById('weldMomentArmRow');
  if (zRow) zRow.hidden = M <= 0 || mode !== 'fillet';
}

const WELD_PRESETS = [
  {
    label: 'Uni\u00f3n en T \u2014 carga puntual (filete)',
    labelKey: 'weld.preset1',
    values: {
      weldMode: 'fillet',
      weldJointType: 'T',
      weldElectrode: 'E42',
      weldCateto: 6,
      weldLength: 120,
      weldThickness: 10,
      weldForce: 25000,
      weldCords: '2',
    },
  },
  {
    label: 'Placa en solape \u2014 tracci\u00f3n (filete)',
    labelKey: 'weld.preset2',
    values: {
      weldMode: 'fillet',
      weldJointType: 'lap',
      weldElectrode: 'E35',
      weldCateto: 4,
      weldLength: 80,
      weldThickness: 8,
      weldForce: 12000,
      weldCords: '1',
    },
  },
  {
    label: 'Junta a tope \u2014 tracci\u00f3n pura',
    labelKey: 'weld.preset3',
    values: {
      weldMode: 'butt',
      weldJointType: 'butt',
      weldElectrode: 'E42',
      weldThickness: 10,
      weldLength: 100,
      weldForce: 40000,
    },
  },
];

const weldUrl = createLabUrlSync(
  {
    mode: 'weldMode',
    joint: 'weldJointType',
    el: 'weldElectrode',
    h: 'weldCateto',
    l: 'weldLength',
    t: 'weldThickness',
    F: 'weldForce',
    V: 'weldShear',
    M: 'weldMoment',
    z: 'weldMomentArm',
    c: 'weldCords',
  },
  { hydrateOrder: ['mode', 'joint', 'F'], afterHydrate: () => scheduleWeldRecalc() },
);

function refreshCore() {
  syncWeldUi();
  const results = document.getElementById('weldResults');
  if (syncInputValidationResultsGate(results)) return;

  const mode = readSelect('weldMode', 'fillet');
  const electrode = readSelect('weldElectrode', 'E42');

  const r = computeWeldJoint({
    mode,
    jointType: readSelect('weldJointType', 'T'),
    electrode,
    tauAdm_custom: readNum('weldCustomAdm', 100),
    cathetus_mm: readNum('weldCateto', 6),
    length_mm: readNum('weldLength', 100),
    plateThickness_mm: readNum('weldThickness', 10),
    force_N: readNum('weldForce', 0),
    shear_N: readNum('weldShear', 0),
    moment_Nm: readNum('weldMoment', 0),
    momentArm_mm: readNum('weldMomentArm', 50),
    cords: parseInt(readSelect('weldCords', '1'), 10) || 1,
  });

  const hero = document.getElementById('weldHero');
  const alerts = document.getElementById('weldAlerts');

  if (!r.ok) {
    if (hero) hero.innerHTML = '';
    if (alerts) alerts.innerHTML = labAlert('error', bx('Geometr\u00eda de cord\u00f3n no v\u00e1lida.', 'Invalid weld geometry.'));
    if (results) results.innerHTML = '';
    renderWeldDiagram(document.getElementById('weldDiagram'), { mode, jointType: 'T', cathetus_mm: 6 });
    renderLabAdvisorInsights('weldAdvisorPanel', []);
    updateLabShareVisibility('weldShareLinkWrap', 'weldResults');
    if (!weldUrl.hydrating) weldUrl.serializeToUrl();
    return;
  }

  const stress = mode === 'fillet' ? r.tau_r : r.sigma_eq;
  const adm = mode === 'fillet' ? r.tauAdm : r.sigAdm;
  const usage = r.usage ?? 0;
  let verdict = 'ok';
  if (usage > 1) verdict = 'error';
  else if (usage > 0.8) verdict = 'warn';

  if (hero) {
    hero.innerHTML = renderResultHero(
      [
        {
          label: mode === 'fillet' ? bx('\u03c4<sub>r</sub> (MPa)', 'Resultant \u03c4 (MPa)') : bx('\u03c3<sub>eq</sub> (MPa)', 'Equivalent \u03c3 (MPa)'),
          display: `${stress.toFixed(1)} MPa`,
          hint: `${bx('L\u00edmite orientativo', 'Indicative limit')} ${adm.toFixed(0)} MPa`,
        },
        {
          label: bx('Factor de uso', 'Usage factor'),
          display: usage > 0 ? `${(usage * 100).toFixed(0)} %` : '\u2014',
          hint:
            mode === 'fillet' && r.hMin
              ? `h<sub>min</sub> ${bx('recom.', 'rec.')} ${r.hMin} mm (t = ${r.t} mm)`
              : '',
        },
      ],
      { verdict },
    );
  }

  const alertParts = [
    labAlert(
      'info',
      bx(
        'Modelo orientativo. El dise\u00f1o final requiere c\u00e1lculo certificado EN 1993-1-8 / AWS D1.1.',
        'Indicative model. Final design requires certified EN 1993-1-8 / AWS D1.1 calculation.',
      ),
    ),
  ];
  if (usage > 1) {
    alertParts.push(
      labAlert(
        'error',
        bx('CR\u00cdTICO: tensi\u00f3n sobre el l\u00edmite admisible orientativo.', 'CRITICAL: stress above indicative allowable limit.'),
      ),
    );
  }
  if (mode === 'fillet' && r.h < r.hMin) {
    alertParts.push(
      labAlert(
        'warn',
        bx('Cateto inferior al m\u00ednimo recomendado para este espesor.', 'Leg size below recommended minimum for this thickness.'),
      ),
    );
  }
  if (mode === 'fillet' && r.shortLength) {
    alertParts.push(
      labAlert(
        'warn',
        bx('Longitud de cord\u00f3n muy corta \u2014 verificar con normativa (EN 1993).', 'Very short weld length \u2014 verify per code (EN 1993).'),
      ),
    );
  }
  if (alerts) alerts.innerHTML = alertParts.join('');

  if (results) {
    if (mode === 'fillet') {
      results.innerHTML = [
        metricHtml('a', `${r.a.toFixed(2)} mm`),
        metricHtml('l<sub>eff</sub>', `${r.lEff.toFixed(0)} mm`),
        metricHtml('\u03c4<sub>r</sub>', `${r.tau_r.toFixed(1)} MPa`),
        metricHtml('\u03c4<sub>adm</sub>', `${r.tauAdm.toFixed(0)} MPa`),
        metricHtml(bx('Cateto h', 'Leg h'), `${r.h} mm`),
        metricHtml('h<sub>min</sub>', `${r.hMin} mm`),
        metricHtml(bx('Factor de uso', 'Usage factor'), `${(usage * 100).toFixed(0)} %`),
      ].join('');
    } else {
      results.innerHTML = [
        metricHtml('\u03c3', `${r.sigma.toFixed(1)} MPa`),
        metricHtml('\u03c4', `${r.tau.toFixed(1)} MPa`),
        metricHtml('\u03c3<sub>eq</sub>', `${r.sigma_eq.toFixed(1)} MPa`),
        metricHtml('\u03c3<sub>adm</sub>', `${r.sigAdm.toFixed(0)} MPa`),
        metricHtml(bx('Factor de uso', 'Usage factor'), `${(usage * 100).toFixed(0)} %`),
      ].join('');
    }
  }

  renderWeldDiagram(document.getElementById('weldDiagram'), {
    mode,
    jointType: readSelect('weldJointType', 'T'),
    cathetus_mm: readNum('weldCateto', 6),
    length_mm: readNum('weldLength', 120),
    plateThickness_mm: readNum('weldThickness', 10),
    force_N: readNum('weldForce', 0),
  });

  const hintEl = document.querySelector('.lab-related-hint');
  if (hintEl) {
    hintEl.removeAttribute('data-i18n');
    hintEl.removeAttribute('data-i18n-html');
    if (mode === 'butt') {
      hintEl.innerHTML = bx(
        '\u00bfVerificar la plancha? <a href="calc-beam.html">Vigas \u00b7 flexi\u00f3n \u2192</a>',
        'Check the plate? <a href="calc-beam.html">Beams \u00b7 bending \u2192</a>',
      );
    } else {
      hintEl.innerHTML = bx(
        '\u00bfUni\u00f3n desmontable? <a href="calc-bolts-iso898.html">Torniller\u00eda ISO 898 \u2192</a>',
        'Detachable joint? <a href="calc-bolts-iso898.html">ISO 898 bolts \u2192</a>',
      );
    }
  }

  const advLang = getLabLang() === 'en' ? 'en' : 'es';
  renderLabAdvisorInsights(
    'weldAdvisorPanel',
    buildWeldJointAdvisorInsights(
      {
        utilisation: usage,
        cateto_mm: mode === 'fillet' ? r.h : readNum('weldCateto', 6),
        weld_type: mode,
        lang: advLang,
      },
      { lang: advLang },
    ),
  );

  updateLabShareVisibility('weldShareLinkWrap', 'weldResults');
  if (!weldUrl.hydrating) weldUrl.serializeToUrl();
}

const wrap = document.getElementById('weldResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);
const weldPresets = mountLabPresetsBar('weldPresetsBar', WELD_PRESETS, debounced);

function scheduleWeldRecalc() {
  if (!weldPresets.applying && !weldUrl.hydrating) weldPresets.clearActive();
  debounced();
}

weldUrl.hydrateFromUrl();
syncWeldUi();

[
  'weldMode',
  'weldJointType',
  'weldElectrode',
  'weldCateto',
  'weldLength',
  'weldThickness',
  'weldForce',
  'weldShear',
  'weldMoment',
  'weldMomentArm',
  'weldCords',
  'weldCustomAdm',
].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleWeldRecalc);
  document.getElementById(id)?.addEventListener('change', scheduleWeldRecalc);
});

watchLangAndApply(WELD_JOINT_PAGE_EN, {
  reloadOnEs: false,
  onEnApplied: scheduleWeldRecalc,
  onEsRestored: scheduleWeldRecalc,
});

wireLabCopyLink('weldCopyLinkBtn', 'weldCopyToast');
wireLabCopyResultsButton('weldCopyResults', {
  moduleTitle: bx('Uniones soldadas', 'Welded joints'),
});

revalidateAllBoundInputs();
runLabCalcBoot(wrap, refreshCore);
mountLabCloudSaveBar(bx('Uniones soldadas', 'Welded joints'), {
  norm: 'EN 1993-1-8 orientativo \u00b7 uniones soldadas',
  svgSelector: '#weldDiagram',
  scopeSelector: '.lab-calc-layout__out',
});
