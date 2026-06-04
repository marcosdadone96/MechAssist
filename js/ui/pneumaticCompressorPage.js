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
import { mountLabFluidPdfExportBar } from '../services/fluidLabPdfExport.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { collectLabInputRows, collectLabResultRows } from '../services/labPdfPayload.js';
import { bindFluidLabUnitSelectors, formatFlowLmin, formatPressureBar } from '../lab/fluidLabUnitPrefs.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import { wrapCalcRefresh } from './creditsPageBoot.js';
import { mountCompactLabFieldHelp, refreshCompactLabFieldHelp } from './labHelpCompact.js';
import { readLabNumber } from '../utils/labInputParse.js';
import { formatDateTimeLocale, getCurrentLang } from '../config/locales.js';
import { seedModuleEsFromDict, watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { PNEUMATIC_COMPRESSOR_EN } from '../lab/i18n/pages/pneumaticCompressorEn.js';
import { PNEUMATIC_COMPRESSOR_ES } from '../lab/i18n/pages/pneumaticCompressorEs.js';
import { FLUIDS_HUB_UX_EN } from '../lab/i18n/pages/fluidsHubUxEn.js';
import {
  COMPRESSOR_TYPES,
  calcPneumaticCompressor,
  specificPowerBadge,
} from '../lab/pneumaticCompressor.js';

/** @type {{ valid: boolean } & Record<string, unknown>} */
let compPdfSnapshot = { valid: false };

const COMP_PRESETS = [
  { labelKey: 'comp.preset1', values: { compQDem: 200, compQUnit: 'nlmin', compPTrabajo: 6, compPRed: 7, compFSim: 0.7, compFFug: 15, compTipo: 'piston', compEtaVol: 75, compNEtapas: 1, compPAsp: 1.013, compTAsp: 20, compEtaIso: 65, compTCiclo: 30, compDeltaP: '' } },
  { labelKey: 'comp.preset2', values: { compQDem: 1200, compQUnit: 'nlmin', compPTrabajo: 6.5, compPRed: 8, compFSim: 0.65, compFFug: 18, compTipo: 'screw', compEtaVol: 87, compNEtapas: 1, compPAsp: 1.013, compTAsp: 25, compEtaIso: 70, compTCiclo: 30, compDeltaP: '' } },
  { labelKey: 'comp.preset3', values: { compQDem: 600, compQUnit: 'nlmin', compPTrabajo: 10, compPRed: 12, compFSim: 0.8, compFFug: 12, compTipo: 'screw', compEtaVol: 84, compNEtapas: 2, compPAsp: 1.013, compTAsp: 20, compEtaIso: 72, compTCiclo: 25, compDeltaP: '' } },
];

function compT(key) {
  const full = key.startsWith('comp.') ? key : `comp.${key}`;
  const en = getCurrentLang() === 'en';
  if (en && PNEUMATIC_COMPRESSOR_EN[full]) return PNEUMATIC_COMPRESSOR_EN[full];
  return PNEUMATIC_COMPRESSOR_ES[full] || full;
}

function bx(es, en) {
  return getCurrentLang() === 'en' ? en : es;
}
function fmt(n, d = 2) {
  return Number.isFinite(n) ? n.toFixed(d) : '\u2014';
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function val(id, fallback = '') {
  const el = document.getElementById(id);
  return el ? (el.value ?? fallback) : fallback;
}

function syncTipoEtaVol() {
  const tipo = val('compTipo', 'piston');
  const meta = COMPRESSOR_TYPES[tipo] || COMPRESSOR_TYPES.piston;
  const etaEl = document.getElementById('compEtaVol');
  if (etaEl instanceof HTMLInputElement) {
    etaEl.value = String(Math.round(meta.etaCenter * 100));
  }
}

function syncDeltaPAuto() {
  const autoEl = document.getElementById('compDeltaPAuto');
  const deltaEl = document.getElementById('compDeltaP');
  if (!(deltaEl instanceof HTMLInputElement)) return;
  const useAuto = autoEl instanceof HTMLInputElement ? autoEl.checked : true;
  if (!useAuto) return;
  const pt = Number(val('compPTrabajo', '6'));
  const pr = Number(val('compPRed', '7'));
  if (Number.isFinite(pt) && Number.isFinite(pr) && pr > pt) {
    deltaEl.value = fmt(pr - pt, 2);
    deltaEl.readOnly = true;
    deltaEl.closest('.lab-field')?.classList.add('lab-field--auto');
  }
}

function syncDeltaPFieldState() {
  const autoEl = document.getElementById('compDeltaPAuto');
  const deltaEl = document.getElementById('compDeltaP');
  if (!(deltaEl instanceof HTMLInputElement)) return;
  const useAuto = autoEl instanceof HTMLInputElement ? autoEl.checked : true;
  deltaEl.readOnly = useAuto;
  deltaEl.closest('.lab-field')?.classList.toggle('lab-field--auto', useAuto);
  if (useAuto) syncDeltaPAuto();
}

/**
 * @param {SVGSVGElement} svg
 */
function renderCompressorDiagram(svg) {
  if (!(svg instanceof SVGSVGElement)) return;
  const ns = 'http://www.w3.org/2000/svg';
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.setAttribute('viewBox', '0 0 520 120');
  svg.style.width = '100%';
  svg.style.maxHeight = '140px';

  const mk = (tag, attrs, text) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    if (text) {
      const t = document.createElementNS(ns, 'text');
      t.textContent = text;
      t.setAttribute('x', attrs.x || '0');
      t.setAttribute('y', String(Number(attrs.y || 0) + 14));
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '9');
      t.setAttribute('fill', '#475569');
      t.setAttribute('font-weight', '700');
      el.appendChild(t);
    }
    return el;
  };

  const pipe = mk('path', {
    d: 'M20 60 H500',
    stroke: '#94a3b8',
    'stroke-width': 2,
    fill: 'none',
  });
  svg.appendChild(pipe);

  const boxes = [
    { x: 30, w: 70, label: compT('diagFilter'), fill: '#f1f5f9' },
    { x: 120, w: 90, label: compT('diagCompressor'), fill: '#dbeafe' },
    { x: 230, w: 70, label: compT('diagTank'), fill: '#e0f2fe' },
    { x: 320, w: 70, label: compT('diagDryer'), fill: '#fef3c7' },
    { x: 410, w: 90, label: compT('diagNet'), fill: '#f0fdf4' },
  ];

  boxes.forEach((b) => {
    svg.appendChild(
      mk('rect', {
        x: b.x,
        y: 35,
        width: b.w,
        height: 50,
        rx: 8,
        fill: b.fill,
        stroke: '#64748b',
        'stroke-width': 1.5,
      }),
    );
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', String(b.x + b.w / 2));
    t.setAttribute('y', '68');
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-size', '9');
    t.setAttribute('font-weight', '800');
    t.setAttribute('fill', '#0f172a');
    t.textContent = b.label;
    svg.appendChild(t);
  });

  [95, 205, 295, 385].forEach((x) => {
    svg.appendChild(
      mk('polygon', {
        points: `${x},60 ${x + 8},55 ${x + 8},65`,
        fill: '#0ea5e9',
      }),
    );
  });
}

function clearCompHero() {
  const hero = document.getElementById('compHero');
  if (hero instanceof HTMLElement) hero.innerHTML = '';
}

/** @param {ReturnType<typeof calcPneumaticCompressor> & { ok: true }} out */
function renderCompHero(out) {
  const hero = document.getElementById('compHero');
  if (!(hero instanceof HTMLElement) || !out.ok) return;
  hero.innerHTML = renderResultHero(
    [
      {
        label: compT('heroQ'),
        display: `${fmt(out.qRealNlMin, 0)} Nl/min`,
      },
      {
        label: compT('heroP'),
        display: `${fmt(out.pMotorIecKw, 1)} kW`,
      },
    ],
    { verdict: out.qRealNlMin > 0 && out.pMotorIecKw > 0 ? 'ok' : 'warn' },
  );
}

/** @param {ReturnType<typeof calcPneumaticCompressor> & { ok: true }} out */
function renderCompVerdictSummary(out) {
  const el = document.getElementById('compVerdictSummary');
  if (!(el instanceof HTMLElement) || !out.ok) return;

  const badgeMap = {
    excelente: 'comp.badgeExcelente',
    bueno: 'comp.badgeBueno',
    aceptable: 'comp.badgeAceptable',
    revisar: 'comp.badgeRevisar',
  };
  const hintMap = {
    excelente: 'comp.badgeHintExcelente',
    bueno: 'comp.badgeHintBueno',
    aceptable: 'comp.badgeHintAceptable',
    revisar: 'comp.badgeHintRevisar',
  };
  const bCls =
    out.badge === 'excelente' || out.badge === 'bueno'
      ? 'comp-eff-badge--good'
      : out.badge === 'aceptable'
        ? 'comp-eff-badge--warn'
        : 'comp-eff-badge--bad';

  const row = (ico, cls, label, sub) => `
    <div class="pc-vs-item pc-vs-item--${cls}">
      <span class="pc-vs-ico" aria-hidden="true">${ico}</span>
      <div>
        <div class="pc-vs-label">${escHtml(label)}</div>
        <div class="pc-vs-sub">${sub}</div>
      </div>
    </div>`;

  const qSub = `${fmt(out.qRealNlMin, 0)} Nl/min &nbsp;(<strong>${fmt(out.qRealM3Min, 2)}</strong> m\u00b3/min)`;

  el.innerHTML = `
    <div class="pc-verdict-summary__title">${escHtml(compT('verdictTitle'))}</div>
    <div class="comp-eff-badge ${bCls}" role="status">
      <span class="comp-eff-badge__label">${escHtml(compT(badgeMap[out.badge] || 'comp.badgeRevisar'))}</span>
      <span class="comp-eff-badge__hint">${escHtml(compT(hintMap[out.badge] || 'comp.badgeHintRevisar'))}</span>
    </div>
    ${row('\uD83D\uDD35', 'info', compT('resQCorr'), qSub)}
    ${row('\uD83D\uDD35', 'info', compT('resRComp'), `<strong>${fmt(out.r, 2)}</strong>`)}
    ${row('\uD83D\uDFE1', 'info', compT('resPIso'), `<strong>${fmt(out.pIsoKw, 2)}</strong> ${compT('unitKw')}`)}
    ${row('\uD83D\uDFE0', 'info', compT('resPEje'), `<strong>${fmt(out.pEjeKw, 2)}</strong> ${compT('unitKw')}`)}
    ${row('\uD83D\uDFE2', 'ok', compT('resMotorIEC'), `<strong>${fmt(out.pMotorIecKw, 1)}</strong> ${compT('unitKw')} <span class="pc-vs-sub">(${escHtml(compT('subMotorService'))})</span>`)}
    ${row('\uD83D\uDD35', 'info', compT('resCEsp'), `<strong>${fmt(out.cEsp, 2)}</strong> ${compT('unitKwM3')}`)}
    ${row('\uD83D\uDD35', 'info', compT('resCalderinCiclo'), `<strong>${fmt(out.vCycleL, 0)}</strong> ${compT('unitLitres')}`)}
    ${row('\uD83D\uDD35', 'info', compT('resCalderinRegla'), `<strong>${fmt(out.vRuleL, 0)}</strong> ${compT('unitLitres')}`)}
    ${row('\uD83D\uDFE2', 'ok', compT('resCalderinRec'), `<strong>${fmt(out.vRecL, 0)}</strong> ${compT('unitLitres')}`)}
  `;
}

/** @param {string[]} alertKeys */
function renderCompDesignAlerts(alertKeys) {
  const el = document.getElementById('compDesignAlerts');
  if (!(el instanceof HTMLElement)) return;
  const alertHtml = {
    etapas: { cls: 'lab-alert--warn', key: 'alertEtapas', icon: '\u26a0' },
    banda: { cls: 'lab-alert--warn', key: 'alertBanda', icon: '\u26a0' },
    fugas: { cls: 'lab-alert--danger', key: 'alertFugas', icon: '\u26a0' },
    temp: { cls: 'lab-alert--warn', key: 'alertTemp', icon: '\u26a0' },
    ok: { cls: 'lab-alert--success', key: 'alertOK', icon: '\u2705' },
  };
  el.innerHTML = alertKeys
    .map((k) => {
      const a = alertHtml[k] || alertHtml.ok;
      return `<div class="lab-alert ${a.cls}"><div class="lab-alert__body">${a.icon} ${escHtml(compT(a.key))}</div></div>`;
    })
    .join('');
}

function buildFormulaLines(out) {
  const en = getCurrentLang() === 'en';
  if (!out.ok) return '';
  return en
    ? `<ul class="lab-formula-lines">
      <li>Q<sub>corr</sub> = Q<sub>dem</sub> \u00d7 f<sub>sim</sub> \u00d7 (1 + f<sub>leak</sub>/100) = ${fmt(out.qRealNlMin, 1)} Nl/min</li>
      <li>r = (p<sub>red</sub> + 1.013) / p<sub>suc</sub> = ${fmt(out.r, 3)}</li>
      <li>P<sub>iso</sub> = Q[m\u00b3/s] \u00d7 p<sub>suc</sub>[Pa] \u00d7 ln(r) = ${fmt(out.pIsoKw, 3)} kW</li>
      <li>P<sub>shaft</sub> = P<sub>iso</sub> / (\u03b7<sub>iso</sub> \u00d7 0.92) = ${fmt(out.pEjeKw, 3)} kW</li>
      <li>V<sub>cycle</sub> = ${fmt(out.vCycleL, 0)} L \u00b7 V<sub>rule</sub> = ${fmt(out.vRuleL, 0)} L \u2192 use ${fmt(out.vRecL, 0)} L</li>
    </ul>`
    : `<ul class="lab-formula-lines">
      <li>Q<sub>corr</sub> = Q<sub>dem</sub> \u00d7 f<sub>sim</sub> \u00d7 (1 + f<sub>fug</sub>/100) = ${fmt(out.qRealNlMin, 1)} Nl/min</li>
      <li>r = (p<sub>red</sub> + 1.013) / p<sub>asp</sub> = ${fmt(out.r, 3)}</li>
      <li>P<sub>iso</sub> = Q[m\u00b3/s] \u00d7 p<sub>asp</sub>[Pa] \u00d7 ln(r) = ${fmt(out.pIsoKw, 3)} kW</li>
      <li>P<sub>eje</sub> = P<sub>iso</sub> / (\u03b7<sub>iso</sub> \u00d7 0.92) = ${fmt(out.pEjeKw, 3)} kW</li>
      <li>V<sub>ciclo</sub> = ${fmt(out.vCycleL, 0)} L \u00b7 V<sub>regla</sub> = ${fmt(out.vRuleL, 0)} L \u2192 usar ${fmt(out.vRecL, 0)} L</li>
    </ul>`;
}

function computeAndRenderCore() {
  const results = document.getElementById('compResults');
  const advisor = document.getElementById('compAdvisor');
  const verdict = document.getElementById('compVerdict');
  const formulaBody = document.getElementById('compFormulaBody');
  if (!(results instanceof HTMLElement) || !(verdict instanceof HTMLElement)) return;

  compPdfSnapshot = { valid: false };

  const svg = document.getElementById('compDiagram');
  renderCompressorDiagram(svg);

  syncDeltaPAuto();

  if (syncInputValidationResultsGate(results)) {
    document.getElementById('compVerdictSummary')?.replaceChildren();
    if (advisor instanceof HTMLElement) advisor.innerHTML = '';
    if (formulaBody instanceof HTMLElement) formulaBody.innerHTML = '';
    renderCompDesignAlerts([]);
    clearCompHero();
    return;
  }

  const errors = [];
  const need = (r) => {
    if (!r.ok) errors.push(r.error);
    return r.ok ? r.value : NaN;
  };

  const qDem = need(readLabNumber('compQDem', 0.1, 1e7, 'Q_dem'));
  const pTrabajo = need(readLabNumber('compPTrabajo', 0.1, 40, 'p_trabajo'));
  const pRed = need(readLabNumber('compPRed', 0.1, 40, 'p_red'));
  const fSim = need(readLabNumber('compFSim', 0.01, 1, 'f_sim'));
  const fFug = need(readLabNumber('compFFug', 0, 80, 'f_fug'));
  const etaVol = need(readLabNumber('compEtaVol', 10, 100, '\u03b7_vol'));
  const etaIso = need(readLabNumber('compEtaIso', 10, 100, '\u03b7_iso'));
  const pAsp = need(readLabNumber('compPAsp', 0.5, 1.5, 'p_asp'));
  const tAsp = need(readLabNumber('compTAsp', -40, 80, 'T_asp'));
  const tCiclo = need(readLabNumber('compTCiclo', 1, 600, 't_ciclo'));

  const qUnitEl = document.getElementById('compQUnit');
  const qUnit = qUnitEl instanceof HTMLSelectElement ? qUnitEl.value : 'nlmin';
  const tipoEl = document.getElementById('compTipo');
  const tipo = tipoEl instanceof HTMLSelectElement ? tipoEl.value : 'piston';
  const nEl = document.getElementById('compNEtapas');
  const nEtapas = nEl instanceof HTMLSelectElement ? Number(nEl.value) : 1;

  let deltaPBar = null;
  const autoEl = document.getElementById('compDeltaPAuto');
  const useAuto = autoEl instanceof HTMLInputElement ? autoEl.checked : true;
  if (!useAuto) {
    deltaPBar = need(readLabNumber('compDeltaP', 0.05, 20, '\u0394p'));
  }

  if (errors.length) {
    results.innerHTML = '';
    clearCompHero();
    updateLabShareVisibility('compShareLinkWrap', 'compResults');
    if (formulaBody instanceof HTMLElement) formulaBody.innerHTML = '';
    document.getElementById('compVerdictSummary')?.replaceChildren();
    renderCompDesignAlerts([]);
    if (advisor instanceof HTMLElement) {
      advisor.innerHTML = `<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>${escHtml(compT('errTitle'))}:</strong><ul style="margin:0.4em 0 0 1.1em;padding:0">${errors.map((e) => `<li>${escHtml(e)}</li>`).join('')}</ul></div></div>`;
    }
    verdict.className = 'lab-verdict lab-verdict--err';
    verdict.textContent = compT('errVerdict');
    return;
  }

  if (advisor instanceof HTMLElement) advisor.innerHTML = '';

  const out = calcPneumaticCompressor({
    qDem,
    qUnit,
    pTrabajoBar: pTrabajo,
    pRedBar: pRed,
    fSim,
    fFugPct: fFug,
    etaVolPct: etaVol,
    etaIsoPct: etaIso,
    pAspBar: pAsp,
    tAspC: tAsp,
    tCicloS: tCiclo,
    deltaPBar,
    nEtapas,
    tipo,
  });

  if (!out.ok) {
    results.innerHTML = '';
    clearCompHero();
    document.getElementById('compVerdictSummary')?.replaceChildren();
    renderCompDesignAlerts([]);
    if (advisor instanceof HTMLElement) {
      advisor.innerHTML = `<div class="lab-alert lab-alert--danger"><div class="lab-alert__body">${out.errors.map((e) => escHtml(e)).join('<br>')}</div></div>`;
    }
    verdict.className = 'lab-verdict lab-verdict--err';
    verdict.textContent = compT('errVerdict');
    return;
  }

  const flowPref = document.getElementById('labUnitFlow');
  const pressPref = document.getElementById('labUnitPressure');

  renderCompHero(out);

  results.innerHTML = `
    <article class="lab-metric"><div class="k">${escHtml(compT('resQCorr'))}</div><div class="v">${fmt(out.qRealNlMin, 0)} Nl/min</div><div class="lab-metric__si">${fmt(out.qRealM3Min, 2)} m\u00b3/min \u00b7 ${formatFlowLmin(out.qRealNlMin, flowPref instanceof HTMLSelectElement ? flowPref.value : undefined)}</div></article>
    <article class="lab-metric"><div class="k">${escHtml(compT('resRComp'))}</div><div class="v">${fmt(out.r, 2)}</div></article>
    <article class="lab-metric"><div class="k">${escHtml(compT('resPIso'))}</div><div class="v">${fmt(out.pIsoKw, 2)} kW</div></article>
    <article class="lab-metric"><div class="k">${escHtml(compT('resPEje'))}</div><div class="v">${fmt(out.pEjeKw, 2)} kW</div></article>
    <article class="lab-metric"><div class="k">${escHtml(compT('resMotorIEC'))}</div><div class="v">${fmt(out.pMotorIecKw, 1)} kW</div><div class="lab-metric__si">${escHtml(compT('subMotorService'))}</div></article>
    <article class="lab-metric"><div class="k">${escHtml(compT('resCEsp'))}</div><div class="v">${fmt(out.cEsp, 2)}</div><div class="lab-metric__si">kW/(m\u00b3/min)</div></article>
    <article class="lab-metric"><div class="k">${escHtml(compT('resCalderinRec'))}</div><div class="v">${fmt(out.vRecL, 0)} L</div><div class="lab-metric__si">${escHtml(compT('resCalderinCiclo'))}: ${fmt(out.vCycleL, 0)} L \u00b7 ${escHtml(compT('resCalderinRegla'))}: ${fmt(out.vRuleL, 0)} L</div></article>
  `;

  if (formulaBody instanceof HTMLElement) formulaBody.innerHTML = buildFormulaLines(out);
  renderCompVerdictSummary(out);
  renderCompDesignAlerts(out.alerts);
  verdict.className = 'lab-verdict lab-verdict--ok';
  verdict.textContent = compT('verdictOk');

  const langPdf = getCurrentLang();
  const ts = formatDateTimeLocale(new Date(), langPdf);
  compPdfSnapshot = {
    valid: true,
    title:
      langPdf === 'en' ? 'Report \u2014 Pneumatic compressor' : 'Informe \u2014 Compresor neum\u00e1tico',
    fileBase: `${langPdf === 'en' ? 'report-pneumatic-compressor' : 'informe-compresor-neumatico'}-${new Date().toISOString().slice(0, 10)}`,
    timestamp: ts,
    tierLabel: langPdf === 'en' ? 'Compressor sizing' : 'Dimensionado de compresor',
    kpis: [
      { title: 'Q', value: `${fmt(out.qRealNlMin, 0)} Nl/min`, subtitle: langPdf === 'en' ? 'corrected' : 'corregido' },
      { title: 'r', value: fmt(out.r, 2), subtitle: langPdf === 'en' ? 'ratio' : 'relaci\u00f3n' },
      { title: 'P motor', value: `${fmt(out.pMotorIecKw, 1)} kW`, subtitle: 'IEC' },
      { title: 'V tank', value: `${fmt(out.vRecL, 0)} L`, subtitle: langPdf === 'en' ? 'receiver' : 'calder\u00edn' },
    ],
    inputRows: buildInputsArray(),
    resultRows: buildResultsArray(),
    formulaLines: buildFormulaLines(out),
    assumptions: [
      langPdf === 'en'
        ? 'Isothermal ln(r) model; mechanical efficiency 92 %; motor service factor 15 %.'
        : 'Modelo isot\u00e9rmico ln(r); rendimiento mec\u00e1nico 92 %; factor de servicio motor 15 %.',
      langPdf === 'en'
        ? 'Receiver volume = max(cycle method, Q_Nl/10 rule).'
        : 'Volumen calder\u00edn = m\u00e1ximo (m\u00e9todo ciclo, regla Q_Nl/10).',
    ],
    verdict: compT('verdictOk'),
    disclaimer:
      langPdf === 'en'
        ? 'Indicative sizing; confirm with manufacturer curves and ISO 8573.'
        : 'Dimensionado orientativo; confirme con curvas de fabricante e ISO 8573.',
  };

  updateLabShareVisibility('compShareLinkWrap', 'compResults');
  refreshCompactLabFieldHelp();
}

const computeAndRender = wrapCalcRefresh(computeAndRenderCore);

[
  'compQDem',
  'compQUnit',
  'compPTrabajo',
  'compPRed',
  'compFSim',
  'compFFug',
  'compTipo',
  'compEtaVol',
  'compNEtapas',
  'compPAsp',
  'compTAsp',
  'compEtaIso',
  'compTCiclo',
  'compDeltaP',
  'compDeltaPAuto',
].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    if (id === 'compTipo') syncTipoEtaVol();
    if (id === 'compPTrabajo' || id === 'compPRed' || id === 'compDeltaPAuto') syncDeltaPFieldState();
    computeAndRender();
  });
  el.addEventListener('change', () => {
    if (id === 'compTipo') syncTipoEtaVol();
    if (id === 'compPTrabajo' || id === 'compPRed' || id === 'compDeltaPAuto') syncDeltaPFieldState();
    computeAndRender();
  });
});

document.getElementById('compTipo')?.addEventListener('change', syncTipoEtaVol);

injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();
bindFluidLabUnitSelectors(computeAndRender);

bindInputValidation([
  { id: 'compQDem', min: 1, max: 1e7, label: 'Q_dem' },
  { id: 'compPTrabajo', min: 0.1, max: 40, label: 'p_trabajo' },
  { id: 'compPRed', min: 0.1, max: 40, label: 'p_red' },
  { id: 'compFSim', min: 0.01, max: 1, label: 'f_sim' },
  { id: 'compFFug', min: 0, max: 80, label: 'f_fug' },
  { id: 'compEtaVol', min: 10, max: 100, label: '\u03b7_vol' },
  { id: 'compEtaIso', min: 10, max: 100, label: '\u03b7_iso' },
  { id: 'compPAsp', min: 0.5, max: 1.5, label: 'p_asp' },
  { id: 'compTAsp', min: -40, max: 80, label: 'T_asp' },
  { id: 'compTCiclo', min: 1, max: 600, label: 't_ciclo' },
  { id: 'compDeltaP', min: 0.05, max: 20, optional: true, label: '\u0394p' },
]);

revalidateAllBoundInputs();
mountLabPresetsBar('compPresetsBar', COMP_PRESETS, () => {
  syncTipoEtaVol();
  syncDeltaPFieldState();
  computeAndRender();
});
wireLabCopyResultsButton('compCopyResults', {
  moduleTitle: bx('Compresor neum\u00e1tico', 'Pneumatic compressor'),
  toastId: 'compCopyToast',
});
wireLabCopyLink('compCopyLinkBtn', 'compCopyLinkToast');

syncTipoEtaVol();
syncDeltaPFieldState();
if (typeof computeAndRender.runPreview === 'function') computeAndRender.runPreview();
else computeAndRender();

seedModuleEsFromDict(PNEUMATIC_COMPRESSOR_ES);

watchLangAndApply({ ...PNEUMATIC_COMPRESSOR_EN, ...FLUIDS_HUB_UX_EN }, {
  reloadOnEs: false,
  onEnApplied: () => {
    refreshCompactLabFieldHelp();
    syncDeltaPFieldState();
    computeAndRender();
  },
  onEsRestored: () => {
    refreshCompactLabFieldHelp();
    syncDeltaPFieldState();
    computeAndRender();
  },
});

function buildInputsArray() {
  return collectLabInputRows(document.querySelector('main'));
}

function buildResultsArray() {
  return collectLabResultRows(document.querySelector('main'));
}

mountLabFluidPdfExportBar(document.getElementById('labFluidPdfMountComp'), {
  getPayload: () => compPdfSnapshot,
  getDiagramElements: () => {
    const svg = document.getElementById('compDiagram');
    return svg instanceof SVGSVGElement ? [svg] : [];
  },
});

mountLabCloudSaveBar(bx('Compresor neum\u00e1tico', 'Pneumatic compressor'), {
  norm: 'ISO 1217 / DIN 1945 orientativo \u00b7 compresor neum\u00e1tico',
  svgSelector: '#compDiagram',
  getData: () => ({
    inputs: buildInputsArray(),
    results: buildResultsArray(),
  }),
});
