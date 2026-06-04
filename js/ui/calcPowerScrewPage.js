import { mountTierStatusBar } from './paywallMount.js';
import { computePowerScrew } from '../lab/powerScrew.js';
import { renderPowerScrewDiagram } from '../lab/diagramPowerScrew.js';
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
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import { getCurrentUser } from '../services/localAuth.js';
import { getLabLang } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { POWER_SCREW_PAGE_EN } from '../lab/i18n/pages/powerScrewPageEn.js';
import { buildPowerScrewAdvisorInsights } from '../services/iaAdvisor.js';

function bx(es, en) {
  return getLabLang() === 'en' ? en : es;
}

mountTierStatusBar();
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'pscrewDiam', min: 4, max: 500, label: 'd' },
  { id: 'pscrewLoad', min: 0, max: 1e9, label: 'F' },
  { id: 'pscrewN', min: 0, max: 20000, optional: true, label: 'RPM' },
  { id: 'pscrewNutTurns', min: 1, max: 50, label: 'espiras' },
  { id: 'pscrewPadm', min: 0, max: 500, optional: true, label: 'p adm' },
  { id: 'pscrewFrictionCustom', min: 0.01, max: 0.5, optional: true, label: 'mu' },
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

function syncPscrewUi() {
  const fr = readSelect('pscrewFriction', 'bronze-dry');
  const row = document.getElementById('pscrewFrictionCustomRow');
  if (row) row.hidden = fr !== 'custom';
}

function readPscrewState() {
  const pitch_mm = parseFloat(readSelect('pscrewPitch', '4'));
  const muKey = readSelect('pscrewFriction', 'bronze-dry');
  const starts = parseInt(readSelect('pscrewStarts', '1'), 10) || 1;
  return {
    pitch_mm,
    muKey,
    mu_custom: muKey === 'custom' ? readNum('pscrewFrictionCustom', 0.12) : undefined,
    starts,
    diameter_mm: readNum('pscrewDiam', 16),
    load_N: readNum('pscrewLoad', 0),
    rpm: readNum('pscrewN', 0),
    nutTurns: readNum('pscrewNutTurns', 5),
    padm_MPa: readNum('pscrewPadm', 0),
  };
}

function paintPscrewDiagram(st) {
  renderPowerScrewDiagram(document.getElementById('pscrewDiagram'), {
    pitch_mm: st.pitch_mm,
    diameter_mm: st.diameter_mm,
    load_N: st.load_N,
    starts: st.starts,
  });
}

function openPscrewResultsPanel() {
  const details = document.querySelector('#pscrewResultsWrap details.lab-results-details');
  if (details instanceof HTMLDetailsElement) details.open = true;
}

const PSCREW_PRESETS = [
  {
    label: 'Gato de taller peque\u00f1o',
    labelKey: 'pscrew.preset1',
    values: { pscrewPitch: '4', pscrewDiam: 16, pscrewStarts: '1', pscrewFriction: 'bronze-dry', pscrewLoad: 20000, pscrewNutTurns: 5 },
  },
  {
    label: 'Husillo fresadora columna',
    labelKey: 'pscrew.preset2',
    values: { pscrewPitch: '6', pscrewDiam: 32, pscrewStarts: '1', pscrewFriction: 'bronze-lub', pscrewLoad: 5000, pscrewN: 300, pscrewNutTurns: 6 },
  },
  {
    label: 'Husillo paso fino alta precisi\u00f3n',
    labelKey: 'pscrew.preset3',
    values: { pscrewPitch: '3', pscrewDiam: 12, pscrewStarts: '1', pscrewFriction: 'bronze-lub', pscrewLoad: 8000, pscrewNutTurns: 8 },
  },
];

const pscrewUrl = createLabUrlSync(
  {
    p: 'pscrewPitch',
    d: 'pscrewDiam',
    n: 'pscrewStarts',
    mu: 'pscrewFriction',
    F: 'pscrewLoad',
    rpm: 'pscrewN',
    turns: 'pscrewNutTurns',
    padm: 'pscrewPadm',
  },
  { hydrateOrder: ['p', 'd', 'F'], afterHydrate: () => schedulePscrewRecalc() },
);

function refreshCore() {
  syncPscrewUi();
  const results = document.getElementById('pscrewResults');
  const st = readPscrewState();
  paintPscrewDiagram(st);

  if (syncInputValidationResultsGate(results)) return;

  const r = computePowerScrew({
    pitch_mm: st.pitch_mm,
    diameter_mm: st.diameter_mm,
    starts: st.starts,
    load_N: st.load_N,
    mu_key: st.muKey,
    mu_custom: st.mu_custom,
    rpm: st.rpm,
    nutTurns: st.nutTurns,
    padm_MPa: st.padm_MPa,
  });

  const hero = document.getElementById('pscrewHero');
  const alerts = document.getElementById('pscrewAlerts');

  if (!r.ok) {
    if (hero) hero.innerHTML = '';
    if (alerts) {
      alerts.innerHTML = executiveSummaryAlert({
        level: 'danger',
        titleEs: 'Revise paso, di\u00e1metro y carga axial.',
        titleEn: 'Check pitch, diameter and axial load.',
        actionsEs: [],
        actionsEn: [],
      });
    }
    if (results) results.innerHTML = '';
    paintPscrewDiagram(st);
    renderLabAdvisorInsights('pscrewAdvisorPanel', []);
    updateLabShareVisibility('pscrewShareLinkWrap', 'pscrewResults');
    if (!pscrewUrl.hydrating) pscrewUrl.serializeToUrl();
    return;
  }

  const etaPct = r.eta_raise * 100;
  let etaVerdict = 'ok';
  if (etaPct < 25) etaVerdict = 'error';
  else if (etaPct < 40) etaVerdict = 'warn';

  const lockTxt = r.selfLocking
    ? bx('Autobloqueante (\u03bb < \u03c6\u2032)', 'Self-locking (\u03bb < \u03c6\u2032)')
    : bx('No autobloqueante', 'Not self-locking');

  if (hero) {
    hero.innerHTML = renderResultHero(
      [
        {
          label: bx('Par subida T', 'Raising torque T'),
          display: `${r.T_raise_Nm.toFixed(2)} N\u00b7m`,
          hint: bx(`\u03bc = ${r.mu} \u00b7 ${lockTxt}`, `\u03bc = ${r.mu} \u00b7 ${lockTxt}`),
        },
        {
          label: bx('Rendimiento \u03b7 (subida)', 'Efficiency \u03b7 (raise)'),
          display: `${etaPct.toFixed(1)} %`,
          hint: bx(`\u03bb = ${r.lambdaDeg.toFixed(2)}\u00b0 \u00b7 L = ${r.L_mm.toFixed(1)} mm`, `\u03bb = ${r.lambdaDeg.toFixed(2)}\u00b0 \u00b7 L = ${r.L_mm.toFixed(1)} mm`),
        },
      ],
      { verdict: etaVerdict },
    );
  }

  const alertParts = [];
  if (r.eta_raise < 0.3) {
    alertParts.push(
      labAlert('warn', bx('Rendimiento muy bajo \u2014 considere tornillo a bolas.', 'Very low efficiency \u2014 consider ball screw.')),
    );
  }
  if (!r.selfLocking) {
    alertParts.push(
      labAlert('warn', bx('Sin autobloqueo \u2014 requiere freno en elevaci\u00f3n.', 'No self-locking \u2014 brake required for lifting.')),
    );
  }
  if (r.usageP != null && r.usageP > 1) {
    alertParts.push(labAlert('error', bx('Presi\u00f3n en tuerca sobre l\u00edmite orientativo.', 'Nut pressure above indicative limit.')));
  }
  if (r.lambdaDeg > 35) {
    alertParts.push(
      labAlert('info', bx('\u00c1ngulo de avance alto \u2014 verifique pandeo del husillo.', 'High lead angle \u2014 check screw buckling.')),
    );
  }
  if (alerts) alerts.innerHTML = alertParts.join('');

  if (results) {
    results.innerHTML = [
      metricHtml(bx('Avance L = n\u00b7p', 'Lead L = n\u00b7p'), `${r.L_mm.toFixed(2)} mm`),
      metricHtml('d<sub>2</sub>', `${r.d2.toFixed(2)} mm`),
      metricHtml('d<sub>1</sub>', `${r.d1.toFixed(2)} mm`),
      metricHtml(bx('\u00c1ngulo de avance \u03bb', 'Lead angle \u03bb'), `${r.lambdaDeg.toFixed(2)}\u00b0`),
      metricHtml(bx('Par bajada T', 'Lowering torque T'), `${r.T_lower_Nm.toFixed(2)} N\u00b7m`),
      metricHtml('\u03b7 (subida)', `${etaPct.toFixed(1)} %`),
      r.P_kW != null && st.rpm > 0
        ? metricHtml(bx('Potencia P', 'Power P'), `${r.P_kW.toFixed(2)} kW`)
        : '',
      r.P_kW != null && st.rpm > 0
        ? metricHtml(
            bx('Velocidad avance v', 'Linear feed rate v'),
            `${((r.L_mm * st.rpm) / 60).toFixed(1)} mm/s`,
            bx('L \u00d7 n / 60 (mm/s). Avance lineal del husillo.', 'L \u00d7 n / 60 (mm/s). Linear feed of the screw.'),
          )
        : '',
      metricHtml(bx('Presi\u00f3n superficial tuerca', 'Nut bearing pressure'), `${r.p_surf.toFixed(1)} MPa`),
      r.usageP != null && st.padm_MPa > 0
        ? metricHtml(bx('Uso p / p<sub>adm</sub>', 'p / p<sub>adm</sub> usage'), `${(r.usageP * 100).toFixed(0)} %`)
        : '',
      metricHtml(bx('Autobloqueo', 'Self-locking'), r.selfLocking ? bx('S\u00ed', 'Yes') : bx('No', 'No')),
    ].join('');
    openPscrewResultsPanel();
  }

  paintPscrewDiagram(st);

  const advLang = getLabLang() === 'en' ? 'en' : 'es';
  renderLabAdvisorInsights(
    'pscrewAdvisorPanel',
    buildPowerScrewAdvisorInsights(
      {
        autoblocking: r.selfLocking,
        efficiency: r.eta_raise,
        pressure_ratio: r.usageP,
        lang: advLang,
      },
      { lang: advLang },
    ),
  );

  updateLabShareVisibility('pscrewShareLinkWrap', 'pscrewResults');
  if (!pscrewUrl.hydrating) pscrewUrl.serializeToUrl();
}

const wrap = document.getElementById('pscrewResultsWrap');

function runPscrewCalc() {
  const useCredits = isCreditsSystemEnabled() && Boolean(getCurrentUser()?.email);
  if (useCredits) {
    runCalcWithIndustrialFeedback(wrap, refreshCore);
  } else {
    runLabCalcBoot(wrap, refreshCore);
  }
}

const debounced = debounce(runPscrewCalc, 55);
const pscrewPresets = mountLabPresetsBar('pscrewPresetsBar', PSCREW_PRESETS, debounced);

function schedulePscrewRecalc() {
  if (!pscrewPresets.applying && !pscrewUrl.hydrating) pscrewPresets.clearActive();
  debounced();
}

pscrewUrl.hydrateFromUrl();
syncPscrewUi();

['pscrewPitch', 'pscrewDiam', 'pscrewStarts', 'pscrewFriction', 'pscrewFrictionCustom', 'pscrewLoad', 'pscrewN', 'pscrewNutTurns', 'pscrewPadm'].forEach(
  (id) => {
    document.getElementById(id)?.addEventListener('input', schedulePscrewRecalc);
    document.getElementById(id)?.addEventListener('change', schedulePscrewRecalc);
  },
);

watchLangAndApply(POWER_SCREW_PAGE_EN, {
  reloadOnEs: false,
  onEnApplied: schedulePscrewRecalc,
  onEsRestored: schedulePscrewRecalc,
});

wireLabCopyLink('pscrewCopyLinkBtn', 'pscrewCopyToast');
wireLabCopyResultsButton('pscrewCopyResults', {
  moduleTitle: bx('Tornillo de potencia trapezoidal', 'Trapezoidal power screw'),
});

revalidateAllBoundInputs();
runLabCalcBoot(wrap, refreshCore);
mountLabCloudSaveBar(bx('Tornillo de potencia', 'Power screw'), {
  norm: 'ISO 2904 (Tr) \u00b7 tornillo de potencia trapezoidal',
  svgSelector: '#pscrewDiagram',
  scopeSelector: '.lab-calc-layout__out',
});
