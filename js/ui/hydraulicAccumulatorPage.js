import {
  bindInputValidation,
  labAlert,
  mountLabPresetsBar,
  revalidateAllBoundInputs,
  renderResultHero,
  syncInputValidationResultsGate,
  updateLabShareVisibility,
  uxCopy,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { collectLabInputRows, collectLabResultRows } from '../services/labPdfPayload.js';
import { bindFluidLabUnitSelectors, formatPressureBar } from '../lab/fluidLabUnitPrefs.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import { wrapCalcRefresh } from './creditsPageBoot.js';
import { mountCompactLabFieldHelp, refreshCompactLabFieldHelp } from './labHelpCompact.js';
import { readLabNumber } from '../utils/labInputParse.js';
import { getCurrentLang } from '../config/locales.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { HYDRAULIC_ACCUMULATOR_EN } from '../lab/i18n/pages/hydraulicAccumulatorEn.js';
import { FLUIDS_HUB_UX_EN } from '../lab/i18n/pages/fluidsHubUxEn.js';
import { calcAccumulator, buildAccumulatorFormulaLines } from '../lab/hydraulicAccumulator.js';

const HA_PRESETS = [
  {
    label: 'Prensa ciclo lento 5 L',
    labelKey: 'hacc.preset1',
    values: {
      haCalcMode: 'design',
      haType: 'bladder',
      haProcess: 'isothermal',
      haP0: 75,
      haP1: 100,
      haP2: 200,
      haDeltaV: 5,
      haTempC: 40,
    },
  },
  {
    label: 'Emergencia adiab\u00e1tico 3 L',
    labelKey: 'hacc.preset2',
    values: {
      haCalcMode: 'design',
      haType: 'diaphragm',
      haProcess: 'adiabatic',
      haP0: 85,
      haP1: 100,
      haP2: 250,
      haDeltaV: 3,
      haTempC: 50,
    },
  },
  {
    label: 'Diagn\u00f3stico \u00e9mbolo 20 L',
    labelKey: 'hacc.preset3',
    values: {
      haCalcMode: 'diagnostic',
      haType: 'piston',
      haProcess: 'isothermal',
      haP0: 90,
      haP1: 120,
      haP2: 300,
      haVnom: 20,
      haTempC: 45,
    },
  },
];

const VOL_CONV = { L: 1, gal: 0.264172 };

/** @type {ReturnType<typeof calcAccumulator> | null} */
let lastResultRaw = null;

function getLang() {
  return getCurrentLang();
}

function bx(es, en) {
  return getLang() === 'en' ? en : es;
}

function haT(key) {
  const full = key.startsWith('hacc.') ? key : `hacc.${key}`;
  const en = getLang() === 'en';
  if (en && HYDRAULIC_ACCUMULATOR_EN[full]) return HYDRAULIC_ACCUMULATOR_EN[full];
  const ES = {
    'hacc.heroVol': 'Volumen nominal',
    'hacc.heroVolHint': 'Tama\u00f1o nominal comercial elegido',
    'hacc.heroE': 'Energ\u00eda almacenada E',
    'hacc.heroEHint': 'Modelo de gas politr\u00f3pico (orientativo)',
  };
  return ES[full] || HYDRAULIC_ACCUMULATOR_EN[full] || full;
}

function val(id, fallback = '') {
  const el = document.getElementById(id);
  return el ? (el.value ?? fallback) : fallback;
}

function fmt(n, d = 2) {
  return typeof n === 'number' && Number.isFinite(n) ? n.toFixed(d) : '\u2014';
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

function syncCalcModeUi() {
  const mode = val('haCalcMode', 'design');
  const deltaVField = document.getElementById('haDeltaVField');
  const vnomField = document.getElementById('haVnomField');
  const helpLines = document.querySelectorAll('#haCalcModeHelp .hp-calc-mode-help__line');

  if (deltaVField instanceof HTMLElement) deltaVField.hidden = mode !== 'design';
  if (vnomField instanceof HTMLElement) vnomField.hidden = mode !== 'diagnostic';

  helpLines.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const active = el.dataset.haMode === mode;
    el.classList.toggle('hp-calc-mode-help__line--active', active);
  });
}

function renderAccumulatorDiagram(svgEl, type, ratioOk) {
  if (!(svgEl instanceof SVGSVGElement)) return;
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
  svgEl.setAttribute('viewBox', '0 0 200 320');
  svgEl.style.maxHeight = '280px';
  svgEl.style.width = '100%';

  const borderColor = ratioOk ? '#059669' : '#dc2626';
  const ns = 'http://www.w3.org/2000/svg';

  const makeEl = (tag, attrs) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    return el;
  };

  if (type === 'bladder') {
    svgEl.appendChild(
      makeEl('rect', {
        x: 60,
        y: 20,
        width: 80,
        height: 240,
        rx: 40,
        fill: 'none',
        stroke: borderColor,
        'stroke-width': 3,
      }),
    );
    svgEl.appendChild(
      makeEl('ellipse', {
        cx: 100,
        cy: 140,
        rx: 28,
        ry: 80,
        fill: '#dbeafe',
        stroke: '#3b82f6',
        'stroke-width': 2,
      }),
    );
    svgEl.appendChild(
      makeEl('rect', {
        x: 88,
        y: 6,
        width: 24,
        height: 18,
        rx: 4,
        fill: '#f1f5f9',
        stroke: '#94a3b8',
        'stroke-width': 1.5,
      }),
    );
    svgEl.appendChild(
      makeEl('rect', {
        x: 88,
        y: 256,
        width: 24,
        height: 18,
        rx: 4,
        fill: '#bfdbfe',
        stroke: '#3b82f6',
        'stroke-width': 1.5,
      }),
    );
    const tGas = makeEl('text', {
      x: 100,
      y: 3,
      'text-anchor': 'middle',
      'font-size': 9,
      fill: '#475569',
    });
    tGas.textContent = 'N\u2082';
    svgEl.appendChild(tGas);
    const tOil = makeEl('text', {
      x: 100,
      y: 286,
      'text-anchor': 'middle',
      'font-size': 9,
      fill: '#1d4ed8',
    });
    tOil.textContent = 'Oil';
    svgEl.appendChild(tOil);
  } else if (type === 'piston') {
    svgEl.appendChild(
      makeEl('rect', {
        x: 55,
        y: 30,
        width: 90,
        height: 240,
        rx: 8,
        fill: 'none',
        stroke: borderColor,
        'stroke-width': 3,
      }),
    );
    svgEl.appendChild(
      makeEl('rect', {
        x: 60,
        y: 130,
        width: 80,
        height: 16,
        rx: 2,
        fill: '#e2e8f0',
        stroke: '#64748b',
        'stroke-width': 2,
      }),
    );
    svgEl.appendChild(
      makeEl('rect', {
        x: 60,
        y: 35,
        width: 80,
        height: 90,
        fill: '#fef3c7',
        stroke: 'none',
        opacity: 0.7,
      }),
    );
    svgEl.appendChild(
      makeEl('rect', {
        x: 60,
        y: 150,
        width: 80,
        height: 115,
        fill: '#dbeafe',
        stroke: 'none',
        opacity: 0.7,
      }),
    );
    const tGas = makeEl('text', {
      x: 100,
      y: 88,
      'text-anchor': 'middle',
      'font-size': 9,
      fill: '#92400e',
    });
    tGas.textContent = 'N\u2082';
    svgEl.appendChild(tGas);
    const tOil = makeEl('text', {
      x: 100,
      y: 210,
      'text-anchor': 'middle',
      'font-size': 9,
      fill: '#1d4ed8',
    });
    tOil.textContent = 'Oil';
    svgEl.appendChild(tOil);
  } else {
    svgEl.appendChild(
      makeEl('circle', {
        cx: 100,
        cy: 150,
        r: 80,
        fill: 'none',
        stroke: borderColor,
        'stroke-width': 3,
      }),
    );
    svgEl.appendChild(
      makeEl('path', {
        d: 'M 20 150 Q 100 90 180 150',
        fill: '#fef3c7',
        stroke: '#f59e0b',
        'stroke-width': 2,
      }),
    );
    svgEl.appendChild(
      makeEl('path', {
        d: 'M 20 150 Q 100 210 180 150',
        fill: '#dbeafe',
        stroke: '#3b82f6',
        'stroke-width': 2,
      }),
    );
    const tGas = makeEl('text', {
      x: 100,
      y: 125,
      'text-anchor': 'middle',
      'font-size': 9,
      fill: '#92400e',
    });
    tGas.textContent = 'N\u2082';
    svgEl.appendChild(tGas);
    const tOil = makeEl('text', {
      x: 100,
      y: 178,
      'text-anchor': 'middle',
      'font-size': 9,
      fill: '#1d4ed8',
    });
    tOil.textContent = 'Oil';
    svgEl.appendChild(tOil);
  }
}

function renderAccVerdictSummary(r) {
  const el = document.getElementById('haVerdictSummary');
  if (!(el instanceof HTMLElement)) return;
  const en = getLang() === 'en';
  const row = (ok, label, sub) => `
    <div class="hc-vs-item ${ok ? 'hc-vs-item--ok' : 'hc-vs-item--bad'}">
      <span class="hc-vs-ico" aria-hidden="true">${ok ? '\u2713' : '\u2717'}</span>
      <div>
        <div class="hc-vs-label">${label}</div>
        <div class="hc-vs-sub">${sub}</div>
      </div>
    </div>`;
  const title = en ? 'Design checks' : 'Verificaciones de dise\u00f1o';
  const l1 = en ? 'Pressure ratio p\u2082/p\u2081' : 'Ratio p\u2082/p\u2081';
  const s1 = r.ratioOk
    ? `${r.ratioP2P1.toFixed(2)} \u2264 4 \u2014 OK`
    : en
      ? `${r.ratioP2P1.toFixed(2)} > 4 \u2014 Risk of bladder damage`
      : `${r.ratioP2P1.toFixed(2)} > 4 \u2014 Riesgo de da\u00f1o en vejiga`;
  const l2 = en ? 'Pre-charge p\u2080/p\u2081' : 'Precarga p\u2080/p\u2081';
  const s2 = r.p0Ok
    ? en
      ? `${r.p0Ratio.toFixed(2)} in 0.85\u20130.90 range`
      : `${r.p0Ratio.toFixed(2)} en rango 0,85\u20130,90`
    : en
      ? `${r.p0Ratio.toFixed(2)} outside 0.85\u20130.90 \u2014 Check`
      : `${r.p0Ratio.toFixed(2)} fuera de 0,85\u20130,90 \u2014 Revisar`;
  const l3 = en ? 'Useful volume \u0394V' : 'Volumen \u00fatil \u0394V';
  const s3 = r.deltaVOk
    ? en
      ? 'Nominal size covers required \u0394V'
      : 'Tama\u00f1o nominal cubre \u0394V requerido'
    : en
      ? 'Nominal size does not cover \u0394V \u2014 increase size'
      : 'Tama\u00f1o nominal no cubre \u0394V \u2014 aumentar';
  el.innerHTML = `
    <div class="hc-verdict-summary__title">${title}</div>
    ${row(r.ratioOk, l1, s1)}
    ${row(r.p0Ok, l2, s2)}
    ${row(r.deltaVOk, l3, s3)}
  `;
}

function getVolumeUnit() {
  const el = document.getElementById('labUnitVolume');
  return el instanceof HTMLSelectElement ? el.value : 'L';
}

function getPressurePref() {
  const el = document.getElementById('labUnitPressure');
  return el instanceof HTMLSelectElement ? el.value : 'bar';
}

function formatVolL(litres) {
  const u = getVolumeUnit();
  const f = VOL_CONV[u] ?? 1;
  const v = litres * f;
  if (u === 'gal') return `${v.toFixed(2)} gal`;
  return `${v.toFixed(2)} L`;
}

function renderResultsFromRaw(r) {
  const resultsEl = document.getElementById('haResults');
  if (!(resultsEl instanceof HTMLElement)) return;

  const en = getLang() === 'en';
  const pPref = getPressurePref();

  resultsEl.innerHTML = [
    r.v0MinL !== null
      ? metric(
          en ? 'Minimum nominal volume' : 'Volumen nominal m\u00ednimo',
          `<strong>${formatVolL(r.v0MinL)}</strong>`,
          '',
        )
      : '',
    metric(
      en ? 'Selected nominal volume' : 'Volumen nominal elegido',
      `<strong>${formatVolL(r.vnomUsedL)}</strong>`,
      '',
    ),
    metric(
      en ? 'Actual useful volume \u0394V' : 'Volumen \u00fatil real \u0394V',
      `<strong>${formatVolL(r.deltaVRealL)}</strong>`,
      '',
    ),
    metric(
      en ? 'Stored energy E' : 'Energ\u00eda almacenada E',
      `<strong>${r.energyKJ.toFixed(2)}</strong>`,
      'kJ',
    ),
    metric(
      en ? 'Est. discharge flow' : 'Caudal descarga est.',
      `<strong>${r.qEstLmin.toFixed(1)}</strong>`,
      'L/min',
    ),
    r.dischargeTimeS !== null
      ? metric(
          en ? 'Est. discharge time' : 'Tiempo descarga est.',
          `<strong>${r.dischargeTimeS.toFixed(1)}</strong>`,
          's',
        )
      : '',
    metric(
      en ? 'Ratio p\u2082/p\u2081' : 'Ratio p\u2082/p\u2081',
      `<strong>${r.ratioP2P1.toFixed(2)}</strong>`,
      '',
    ),
    metric(
      en ? 'p\u2080 / p\u2081 / p\u2082' : 'p\u2080 / p\u2081 / p\u2082',
      `${formatPressureBar(r.p0Bar, pPref)} / ${formatPressureBar(r.p1Bar, pPref)} / ${formatPressureBar(r.p2Bar, pPref)}`,
      '',
    ),
  ].join('');
}

function applyUnitConversions() {
  if (lastResultRaw?.ok) renderResultsFromRaw(lastResultRaw);
}

const computeAndRender = wrapCalcRefresh(function computeAndRenderCore() {
  if (syncInputValidationResultsGate(document.getElementById('haResults'))) return;

  const parseErrors = [];
  const need = (r) => {
    if (!r.ok) {
      parseErrors.push(r.error);
      return NaN;
    }
    return r.value;
  };

  const mode = val('haCalcMode', 'design');
  const type = val('haType', 'bladder');
  const process = val('haProcess', 'isothermal');
  const p0Bar = need(readLabNumber('haP0', 1, 500, 'p\u2080 (bar)'));
  const p1Bar = need(readLabNumber('haP1', 1, 500, 'p\u2081 (bar)'));
  const p2Bar = need(readLabNumber('haP2', 1, 700, 'p\u2082 (bar)'));
  const deltaVL = need(readLabNumber('haDeltaV', 0.01, 10000, '\u0394V (L)'));
  const vnomL = mode === 'diagnostic' ? parseFloat(val('haVnom', '10')) : null;
  const tempC = need(readLabNumber('haTempC', -20, 150, 'T (\u00b0C)'));

  const advisor = document.getElementById('haAdvisor');
  const verdict = document.getElementById('haVerdict');

  if (!(advisor instanceof HTMLElement) || !(verdict instanceof HTMLElement)) return;

  if (parseErrors.length) {
    lastResultRaw = null;
    const vsErr = document.getElementById('haVerdictSummary');
    if (vsErr instanceof HTMLElement) vsErr.innerHTML = '';
    advisor.innerHTML = labAlert(
      'danger',
      `<strong>${uxCopy('Errores en los datos:', 'Input errors:')}</strong>
       <ul style="margin:.4em 0 0 1.1em;padding:0">${parseErrors.map((e) => `<li>${e}</li>`).join('')}</ul>`,
    );
    verdict.className = 'lab-verdict lab-verdict--err';
    verdict.textContent = uxCopy('Revise los valores.', 'Check input values.');
    const resultsEl = document.getElementById('haResults');
    if (resultsEl instanceof HTMLElement) resultsEl.innerHTML = '';
    clearHaHero();
    updateLabShareVisibility('haShareLinkWrap', 'haResults');
    return;
  }

  const result = calcAccumulator({
    type,
    process,
    p0Bar,
    p1Bar,
    p2Bar,
    deltaVL,
    vnomL,
    tempC,
    mode,
  });

  if (!result.ok) {
    lastResultRaw = null;
    const vsErr = document.getElementById('haVerdictSummary');
    if (vsErr instanceof HTMLElement) vsErr.innerHTML = '';
    advisor.innerHTML = labAlert(
      'danger',
      `<strong>${uxCopy('Errores en los datos:', 'Input errors:')}</strong>
       <ul style="margin:.4em 0 0 1.1em;padding:0">${result.errors.map((e) => `<li>${e}</li>`).join('')}</ul>`,
    );
    verdict.className = 'lab-verdict lab-verdict--err';
    verdict.textContent = uxCopy('Revise los valores.', 'Check input values.');
    const resultsEl = document.getElementById('haResults');
    if (resultsEl instanceof HTMLElement) resultsEl.innerHTML = '';
    clearHaHero();
    updateLabShareVisibility('haShareLinkWrap', 'haResults');
    return;
  }

  lastResultRaw = result;
  renderResultsFromRaw(result);

  const alerts = [];
  if (!result.ratioOk) {
    alerts.push(
      labAlert(
        'warning',
        uxCopy(
          `<strong>Ratio p\u2082/p\u2081 = ${result.ratioP2P1.toFixed(2)} &gt; 4.</strong> En acumuladores de vejiga puede da\u00f1ar la membrana. Considere aumentar p\u2081 o reducir p\u2082.`,
          `<strong>Ratio p\u2082/p\u2081 = ${result.ratioP2P1.toFixed(2)} &gt; 4.</strong> In bladder accumulators this may damage the bladder. Consider raising p\u2081 or lowering p\u2082.`,
        ),
      ),
    );
  }
  if (!result.p0Ok) {
    alerts.push(
      labAlert(
        'info',
        uxCopy(
          `<strong>Precarga p\u2080/p\u2081 = ${result.p0Ratio.toFixed(2)}.</strong> El rango recomendado es 0,85\u20130,90 \u00d7 p\u2081.`,
          `<strong>Pre-charge p\u2080/p\u2081 = ${result.p0Ratio.toFixed(2)}.</strong> Recommended range is 0.85\u20130.90 \u00d7 p\u2081.`,
        ),
      ),
    );
  }
  if (!result.deltaVOk) {
    alerts.push(
      labAlert(
        'warning',
        uxCopy(
          '<strong>El volumen \u00fatil real es inferior al requerido.</strong> Seleccione el tama\u00f1o nominal superior.',
          '<strong>Actual useful volume is below the required \u0394V.</strong> Select the next nominal size up.',
        ),
      ),
    );
  }
  advisor.innerHTML = alerts.join('');

  const allOk = result.ratioOk && result.p0Ok && result.deltaVOk;
  verdict.className = allOk ? 'lab-verdict lab-verdict--ok' : 'lab-verdict lab-verdict--muted';
  verdict.textContent = allOk
    ? uxCopy(
        'ACUMULADOR V\u00c1LIDO \u2014 Par\u00e1metros dentro de los l\u00edmites recomendados.',
        'ACCUMULATOR VALID \u2014 Parameters within recommended limits.',
      )
    : uxCopy(
        'REVISAR \u2014 Uno o m\u00e1s par\u00e1metros fuera del rango recomendado.',
        'REVIEW \u2014 One or more parameters outside recommended range.',
      );

  renderAccVerdictSummary(result);

  const svgEl = document.getElementById('haDiagram');
  if (svgEl instanceof SVGSVGElement) renderAccumulatorDiagram(svgEl, type, result.ratioOk);

  const formulaBody = document.getElementById('haFormulaBody');
  if (formulaBody instanceof HTMLElement) {
    const lines = buildAccumulatorFormulaLines({ result, lang: getLang() });
    formulaBody.innerHTML = `
      <ol class="lab-fluid-formulas__list">${lines.map((l) => `<li>${l}</li>`).join('')}</ol>
      <p class="lab-fluid-formulas__sub"><strong>${uxCopy('Supuestos', 'Assumptions')}</strong></p>
      <ul class="lab-fluid-formulas__list">
        <li>${uxCopy('Modelo de gas ideal.', 'Ideal gas model.')}</li>
        <li>${uxCopy('Sin p\u00e9rdidas de fricci\u00f3n ni calor en descarga.', 'No friction or heat losses in discharge.')}</li>
        <li>${uxCopy('Tiempo de descarga orientativo.', 'Discharge time is indicative only.')}</li>
      </ul>`;
  }

  updateLabShareVisibility('haShareLinkWrap', 'haResults');
  refreshCompactLabFieldHelp();
});

injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'haP0', min: 1, max: 500, label: 'p\u2080' },
  { id: 'haP1', min: 1, max: 500, label: 'p\u2081' },
  { id: 'haP2', min: 1, max: 700, label: 'p\u2082' },
  { id: 'haDeltaV', min: 0.01, max: 10000, label: '\u0394V' },
  { id: 'haTempC', min: -20, max: 150, label: 'T' },
]);

bindFluidLabUnitSelectors(applyUnitConversions);
document.getElementById('labUnitVolume')?.addEventListener('change', applyUnitConversions);

[
  'haCalcMode',
  'haType',
  'haProcess',
  'haP0',
  'haP1',
  'haP2',
  'haDeltaV',
  'haVnom',
  'haTempC',
].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', computeAndRender);
  el.addEventListener('change', computeAndRender);
});

document.getElementById('haCalcMode')?.addEventListener('change', () => {
  syncCalcModeUi();
  computeAndRender();
});

mountLabPresetsBar('haPresetsBar', HA_PRESETS, () => {
  syncCalcModeUi();
  computeAndRender();
});

wireLabCopyResultsButton('haCopyResults', {
  moduleTitle: uxCopy(
    'Acumulador hidr\u00e1ulico \u2014 TheMechAssist',
    'Hydraulic accumulator \u2014 TheMechAssist',
  ),
});
wireLabCopyLink('haCopyLinkBtn', 'haCopyLinkToast');

watchLangAndApply({ ...HYDRAULIC_ACCUMULATOR_EN, ...FLUIDS_HUB_UX_EN }, {
  reloadOnEs: false,
  onEnApplied: () => {
    refreshCompactLabFieldHelp();
    computeAndRender();
  },
  onEsRestored: () => {
    refreshCompactLabFieldHelp();
    computeAndRender();
  },
});

syncCalcModeUi();
revalidateAllBoundInputs();
computeAndRender();

function buildInputsArray() {
  return collectLabInputRows(document.querySelector('main'));
}

function buildResultsArray() {
  return collectLabResultRows(document.querySelector('main'));
}

mountLabCloudSaveBar(bx('Acumulador hidr\u00e1ulico', 'Hydraulic accumulator'), {
  norm: 'ISO 4126 orientativo \u00b7 acumuladores hidr\u00e1ulicos',
  svgSelector: '#haDiagram',
  getData: () => ({
    inputs: buildInputsArray(),
    results: buildResultsArray(),
  }),
});
