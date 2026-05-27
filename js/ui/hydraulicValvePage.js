import {
  bindInputValidation,
  mountLabPresetsBar,
  revalidateAllBoundInputs,
  renderResultHero,
  syncInputValidationResultsGate,
  updateLabShareVisibility,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { bindFluidLabUnitSelectors, formatFlowLmin, formatPressureBar } from '../lab/fluidLabUnitPrefs.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import { wrapCalcRefresh } from './creditsPageBoot.js';
import { mountCompactLabFieldHelp, refreshCompactLabFieldHelp } from './labHelpCompact.js';
import { readLabNumber } from '../utils/labInputParse.js';
import { getCurrentLang } from '../config/locales.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { HYDRAULIC_VALVE_EN } from '../lab/i18n/pages/hydraulicValveEn.js';
import { FLUIDS_HUB_UX_EN } from '../lab/i18n/pages/fluidsHubUxEn.js';
import {
  computeHydraulicValve,
  HV_DN_KV_TABLE,
  renderValveDiagram,
} from '../lab/hydraulicValve.js';

const HV_PRESETS = [
  {
    label: 'Limitadora industrial 200 bar',
    labelKey: 'hvalve.preset1',
    values: {
      hvCalcMode: 'design',
      hvType: 'relief',
      hvQ: 40,
      hvPmax: 200,
      hvPset: 150,
      hvVisc: 46,
      hvActuation: 'hydraulic',
    },
  },
  {
    label: 'Reductora circuito secundario',
    labelKey: 'hvalve.preset2',
    values: {
      hvCalcMode: 'design',
      hvType: 'reducing',
      hvQ: 25,
      hvPmax: 180,
      hvPset: 120,
      hvVisc: 46,
      hvActuation: 'mechanical',
    },
  },
  {
    label: 'Caudal proporcional servo',
    labelKey: 'hvalve.preset3',
    values: {
      hvCalcMode: 'diagnostic',
      hvType: 'proportional',
      hvQ: 18,
      hvPmax: 210,
      hvPset: 140,
      hvVisc: 32,
      hvActuation: 'electric',
      hvDn: 10,
    },
  },
];

const HV_ES = {
  'hvalve.mDeltaP': 'Ca\u00edda de presi\u00f3n en v\u00e1lvula',
  'hvalve.mKv': 'Coeficiente Kv',
  'hvalve.mKvReq': 'Kv requerido (dise\u00f1o)',
  'hvalve.mHeat': 'Potencia disipada (calor)',
  'hvalve.mZone': 'Zona de trabajo',
  'hvalve.mDn': 'Tama\u00f1o nominal orientativo',
  'hvalve.mCracking': 'Presi\u00f3n de cracking (orient.)',
  'hvalve.mHyst': 'Banda de hist\u00e9resis (orient.)',
  'hvalve.zoneGreen': 'Zona eficiente \u2014 \u0394P &lt; 5 bar',
  'hvalve.zoneYellow': 'Zona moderada \u2014 5\u201315 bar',
  'hvalve.zoneRed': 'Zona cr\u00edtica \u2014 \u0394P &gt; 15 bar',
  'hvalve.detailsTitle': 'Datos t\u00e9cnicos secundarios',
  'hvalve.detailsHint': 'Tabla DN, cracking e hist\u00e9resis',
  'hvalve.errTitle': 'Entrada no v\u00e1lida',
  'hvalve.errVerdict': 'Revise los valores del formulario.',
  'hvalve.verdictOk': 'Ca\u00edda en zona eficiente',
  'hvalve.verdictWarn': 'Aceptable con vigilancia',
  'hvalve.verdictErr': 'Revise tama\u00f1o de v\u00e1lvula',
  'hvalve.alertRed':
    'Ca\u00edda de presi\u00f3n muy alta \u2014 valore un DN mayor o compruebe obstrucci\u00f3n.',
  'hvalve.alertYellow': 'Probable calentamiento moderado \u2014 verifique refrigeraci\u00f3n de aceite.',
  'hvalve.hintKvUnit': 'L/min\u00b7bar\u207b\u2070\u00b7\u2075',
  'hvalve.hintKvFormula': '\u0394P = (Q / Kv)\u00b2',
  'hvalve.hintHeatFormula': 'P = Q\u00b7\u0394P / 600',
  'hvalve.diagIn': 'P (alta)',
  'hvalve.diagOut': 'A / trabajo',
  'hvalve.diagTank': 'T',
};

const TYPE_NAMES = {
  es: {
    relief: 'Limitadora',
    reducing: 'Reductora',
    flow: 'Caudal',
    check: 'Antirretorno',
    proportional: 'Proporcional',
  },
  en: {
    relief: 'Relief',
    reducing: 'Reducing',
    flow: 'Flow',
    check: 'Check',
    proportional: 'Proportional',
  },
};

function hvT(key) {
  const full = `hvalve.${key}`;
  const en = getCurrentLang() === 'en';
  if (en && HYDRAULIC_VALVE_EN[full]) return HYDRAULIC_VALVE_EN[full];
  return HV_ES[full] || full;
}

function fmt(n, d = 2) {
  return Number.isFinite(n) ? n.toFixed(d) : '\u2014';
}

function metric(label, value, unit = '') {
  return `
    <article class="lab-metric">
      <div class="k">${label}</div>
      <div class="v">${value}</div>
      ${unit ? `<div class="lab-metric__si">${unit}</div>` : ''}
    </article>
  `;
}

function getHvCalcMode() {
  const el = document.getElementById('hvCalcMode');
  return el instanceof HTMLSelectElement ? el.value : 'design';
}

/** @param {{ zone: string, deltaPBar: number, dnRec: number, kvUsed: number, mode: string }} out */
function renderHvVerdictSummary(out) {
  const el = document.getElementById('hvVerdictSummary');
  if (!(el instanceof HTMLElement)) return;
  const en = getCurrentLang() === 'en';
  const row = (ok, label, sub) => `
    <div class="hc-vs-item ${ok ? 'hc-vs-item--ok' : 'hc-vs-item--bad'}">
      <span class="hc-vs-ico" aria-hidden="true">${ok ? '\u2713' : '\u2717'}</span>
      <div>
        <div class="hc-vs-label">${label}</div>
        <div class="hc-vs-sub">${sub}</div>
      </div>
    </div>`;
  const zoneOk = out.zone === 'green';
  const dpOk = out.zone !== 'red';
  const title = en ? 'Design checks' : 'Comprobaciones de dise\u00f1o';
  const l1 = en ? 'Pressure drop zone' : 'Zona de ca\u00edda';
  const l2 = en ? 'Pressure drop \u0394P' : 'Ca\u00edda \u0394P';
  const l3 = en ? 'Nominal size DN' : 'Tama\u00f1o nominal DN';
  const s3 =
    out.mode === 'design'
      ? en
        ? `DN ${out.dnRec} \u00b7 Kv ${fmt(out.kvUsed, 1)}`
        : `DN ${out.dnRec} \u00b7 Kv ${fmt(out.kvUsed, 1)}`
      : en
        ? `Installed DN ${out.dnRec}`
        : `DN instalado ${out.dnRec}`;
  el.innerHTML = `
    <div class="hc-verdict-summary__title">${title}</div>
    ${row(zoneOk, l1, zoneLabel(out.zone))}
    ${row(dpOk, l2, `${fmt(out.deltaPBar, 2)} bar`)}
    ${row(true, l3, s3)}
  `;
}

function syncHvCalcModeUi() {
  const mode = getHvCalcMode();
  const isDesign = mode === 'design';
  const dnField = document.getElementById('hvDnField');
  if (dnField instanceof HTMLElement) dnField.hidden = isDesign;
  const helpWrap = document.getElementById('hvCalcModeHelp');
  if (helpWrap instanceof HTMLElement) {
    helpWrap.querySelectorAll('[data-hvalve-mode]').forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      el.classList.toggle('hvalve-calc-mode-help__line--active', el.getAttribute('data-hvalve-mode') === mode);
    });
  }
  revalidateAllBoundInputs();
}

function zoneLabel(zone) {
  if (zone === 'green') return hvT('zoneGreen');
  if (zone === 'yellow') return hvT('zoneYellow');
  return hvT('zoneRed');
}

function zoneVerdict(zone) {
  if (zone === 'green') return 'ok';
  if (zone === 'yellow') return 'warn';
  return 'error';
}

function computeAndRenderCore() {
  const results = document.getElementById('hvResults');
  const hero = document.getElementById('hvResultsHero');
  const advisor = document.getElementById('hvAdvisor');
  const verdict = document.getElementById('hvVerdict');
  const formulaBody = document.getElementById('hvFormulaBody');
  if (!(results instanceof HTMLElement) || !(advisor instanceof HTMLElement) || !(verdict instanceof HTMLElement)) return;

  if (syncInputValidationResultsGate(results)) {
    if (hero instanceof HTMLElement) hero.innerHTML = '';
    return;
  }

  const errors = [];
  const need = (r) => {
    if (!r.ok) errors.push(r.error);
    return r.ok ? r.value : NaN;
  };

  const mode = getHvCalcMode();
  const typeEl = document.getElementById('hvType');
  const valveType = typeEl instanceof HTMLSelectElement ? typeEl.value : 'relief';
  const qLmin = need(readLabNumber('hvQ', 0.1, 1e6, 'Q (L/min)'));
  const pMaxBar = need(readLabNumber('hvPmax', 1, 600, 'Pmax (bar)'));
  const pSetBar = need(readLabNumber('hvPset', 0, 600, 'Pset (bar)'));
  const viscCst = need(readLabNumber('hvVisc', 1, 2000, 'Visc (cSt)'));

  let dnInstalled = 10;
  if (mode === 'diagnostic') {
    const dnEl = document.getElementById('hvDn');
    dnInstalled = dnEl instanceof HTMLSelectElement ? Number(dnEl.value) : 10;
  }

  if (errors.length) {
    results.innerHTML = '';
    if (hero instanceof HTMLElement) hero.innerHTML = '';
    updateLabShareVisibility('hvShareLinkWrap', 'hvResults');
    if (formulaBody instanceof HTMLElement) formulaBody.innerHTML = '';
    const vsErr = document.getElementById('hvVerdictSummary');
    if (vsErr instanceof HTMLElement) vsErr.innerHTML = '';
    advisor.innerHTML = `<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>${hvT('errTitle')}:</strong><ul style="margin:0.4em 0 0 1.1em;padding:0">${errors.map((e) => `<li>${e}</li>`).join('')}</ul></div></div>`;
    verdict.className = 'lab-verdict lab-verdict--err';
    verdict.textContent = hvT('errVerdict');
    return;
  }

  const out = computeHydraulicValve({
    mode,
    valveType,
    qLmin,
    pMaxBar,
    pSetBar,
    viscCst,
    dnInstalled,
  });

  const lang = getCurrentLang() === 'en' ? 'en' : 'es';
  const en = lang === 'en';
  renderValveDiagram(document.getElementById('hvDiagram'), {
    valveType,
    deltaPBar: out.deltaPBar,
    qLmin,
    pMaxBar,
    pSetBar,
    zone: out.zone,
    labels: {
      in: hvT('diagIn'),
      out: hvT('diagOut'),
      tank: hvT('diagTank'),
      spring: 'Pset',
      typeName: TYPE_NAMES[lang][valveType] || valveType,
    },
  });

  const kvLabel = mode === 'design' ? hvT('mKvReq') : hvT('mKv');
  const kvDisplay = `${fmt(out.kvUsed, 2)} ${hvT('hintKvUnit')}`;
  const dpDisplay = formatPressureBar(out.deltaPBar);
  const heatDisplay = `${fmt(out.heatKw, 3)} kW`;

  if (hero instanceof HTMLElement) {
    hero.innerHTML = renderResultHero(
      [
        { label: hvT('mDeltaP'), value: fmt(out.deltaPBar, 1), unit: 'bar', display: dpDisplay },
        { label: kvLabel, value: fmt(out.kvUsed, 2), unit: hvT('hintKvUnit'), hint: hvT('hintKvFormula') },
        { label: hvT('mHeat'), value: fmt(out.heatKw, 3), unit: 'kW', hint: hvT('hintHeatFormula') },
      ],
      { verdict: zoneVerdict(out.zone) },
    );
  }

  const dnTable = HV_DN_KV_TABLE.map((r) => `DN${r.dn} \u2192 Kv ${r.kv}`).join(' \u00b7 ');
  const secondary = [
    metric(hvT('mZone'), zoneLabel(out.zone), `\u0394P = ${fmt(out.deltaPBar, 2)} bar`),
    metric(hvT('mDn'), `DN ${out.dnRec}`, dnTable),
    metric(kvLabel, fmt(out.kvUsed, 2), hvT('hintKvFormula')),
    metric(hvT('mHeat'), heatDisplay, hvT('hintHeatFormula')),
    metric(hvT('mDeltaP'), dpDisplay, `Q = ${formatFlowLmin(qLmin)}`),
  ];

  if (out.crackingBar != null) {
    secondary.push(
      metric(hvT('mCracking'), formatPressureBar(out.crackingBar), `Pset ${fmt(pSetBar, 0)} bar`),
      metric(hvT('mHyst'), `\u00b1 ${fmt(out.hysteresisBar, 1)} bar`, en ? 'indicative' : 'orientativo'),
    );
  }

  results.innerHTML = `
    <details class="hv-more-details">
      <summary>
        <span class="hv-more-details__title">${hvT('detailsTitle')}</span>
        <span class="hv-more-details__hint">${hvT('detailsHint')}</span>
      </summary>
      <div class="hv-more-details__body">
        <div class="lab-results">${secondary.join('')}</div>
      </div>
    </details>
  `;

  if (formulaBody instanceof HTMLElement) {
    formulaBody.innerHTML = en
      ? `<ol class="lab-fluid-formulas__list">
          <li>\u0394P = (Q / Kv)\u00b2 with Q in L/min and Kv in L/min\u00b7bar\u207b\u2070\u00b7\u2075.</li>
          <li>P<sub>heat</sub> = Q\u00b7\u0394P / 600 [kW].</li>
          <li>Design target \u0394P \u2248 ${fmt(out.targetDeltaP, 1)} bar for this case.</li>
        </ol>`
      : `<ol class="lab-fluid-formulas__list">
          <li>\u0394P = (Q / Kv)\u00b2 con Q en L/min y Kv en L/min\u00b7bar\u207b\u2070\u00b7\u2075.</li>
          <li>P<sub>calor</sub> = Q\u00b7\u0394P / 600 [kW].</li>
          <li>Objetivo dise\u00f1o \u0394P \u2248 ${fmt(out.targetDeltaP, 1)} bar en este caso.</li>
        </ol>`;
  }

  const alerts = [];
  if (out.zone === 'red') {
    alerts.push(`<div class="lab-alert lab-alert--danger"><div class="lab-alert__body">${hvT('alertRed')}</div></div>`);
  } else if (out.zone === 'yellow') {
    alerts.push(`<div class="lab-alert lab-alert--warn"><div class="lab-alert__body">${hvT('alertYellow')}</div></div>`);
  }
  advisor.innerHTML = alerts.join('');

  renderHvVerdictSummary({ ...out, mode });

  verdict.className = `lab-verdict lab-verdict--${out.zone === 'green' ? 'ok' : out.zone === 'yellow' ? 'muted' : 'err'}`;
  verdict.textContent =
    out.zone === 'green' ? hvT('verdictOk') : out.zone === 'yellow' ? hvT('verdictWarn') : hvT('verdictErr');

  updateLabShareVisibility('hvShareLinkWrap', 'hvResults');
}

const computeAndRender = wrapCalcRefresh(computeAndRenderCore);

[
  'hvCalcMode',
  'hvType',
  'hvQ',
  'hvPmax',
  'hvPset',
  'hvVisc',
  'hvActuation',
  'hvDn',
].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', computeAndRender);
    el.addEventListener('change', computeAndRender);
  }
});

document.getElementById('hvCalcMode')?.addEventListener('change', () => {
  syncHvCalcModeUi();
  computeAndRender();
});

syncHvCalcModeUi();
mountCompactLabFieldHelp();
bindInputValidation([
  { id: 'hvQ', min: 0.1, max: 1e6, label: 'Q' },
  { id: 'hvPmax', min: 1, max: 600, label: 'Pmax' },
  { id: 'hvPset', min: 0, max: 600, label: 'Pset' },
  { id: 'hvVisc', min: 1, max: 2000, label: 'Visc' },
]);
revalidateAllBoundInputs();
mountLabPresetsBar('hvPresetsBar', HV_PRESETS, computeAndRender);
computeAndRender();

watchLangAndApply({ ...HYDRAULIC_VALVE_EN, ...FLUIDS_HUB_UX_EN }, {
  reloadOnEs: false,
  onEnApplied: () => {
    refreshCompactLabFieldHelp();
    syncHvCalcModeUi();
    computeAndRender();
  },
  onEsRestored: () => {
    refreshCompactLabFieldHelp();
    syncHvCalcModeUi();
    computeAndRender();
  },
});

injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
bindFluidLabUnitSelectors(computeAndRender);

wireLabCopyLink('hvCopyLinkBtn', 'hvCopyLinkToast');
wireLabCopyResultsButton('hvCopyResults', {
  moduleTitle: getCurrentLang() === 'en' ? 'Hydraulic valve' : 'V\u00e1lvula hidr\u00e1ulica',
  toastId: 'hvCopyToast',
});
