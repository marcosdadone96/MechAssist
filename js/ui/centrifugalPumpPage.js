/**
 * Página bomba centrífuga — mismo patrón que cintas: resultados, informe, motorreductores, PDF Pro.
 */

import { FEATURES } from '../config/features.js';
import { isPremiumEffective } from '../services/accessTier.js';
import { buildRegisterUrlWithNextCheckout } from '../services/proCheckoutFlow.js';
import {
  computeCentrifugalPump,
  buildPumpInstallationAlerts,
  FLUID_TYPE_PRESETS,
} from '../modules/centrifugalPump.js';
import { LOAD_DUTY_OPTIONS, LOAD_DUTY_OPTIONS_EN } from '../modules/serviceFactorByDuty.js';
import { renderBrandRecommendationCards, initMotorVerification } from './driveSelection.js';
import { renderFullEngineeringAside } from './engineeringReport.js';
import { renderCentrifugalPumpDiagram } from './diagramPump.js';
import { mountPremiumPdfExportBar, buildPumpPdfPayload } from '../services/reportPdfExport.js';
import { readMountingPreferences } from '../modules/mountingPreferences.js';
import { injectMountingConfigSection, MOUNTING_INPUT_IDS, refreshMountingConfigSection } from './mountingConfigSection.js';
import { getCurrentLang, HOME_LANG_CHANGED_EVENT } from '../config/locales.js';
import { openMotorsRecommendationsAndScroll } from './motorsCollapsible.js';
import { applyMachinePremiumGates } from './machinePremiumGates.js';
import { foldAllMachineDetailsOncePerPageLoad } from './machineDetailsFold.js';
import { initInfoChipPopovers } from './infoChipPopover.js';
import { getI18nLabels } from '../config/i18nLabels.js';

const pumpInputIds = [
  'pumpFlow',
  'pumpHead',
  'pumpEta',
  'rho',
  'viscosity',
  'tempC',
  'pumpSpeedRpm',
  'pumpServiceFactor',
  'suctionKpa',
  'pipeDiamMm',
  'dailyHours',
  'pumpVoltage',
  'pumpFreq',
];

const pumpSelectIds = ['pumpFlowUnit', 'fluidType', 'pumpLoadDuty', 'couplingType'];

/** @type {Record<string, string>} */
const FLUID_TYPE_LABEL_EN = Object.freeze({
  water: 'Water',
  oil: 'Oil',
  brine: 'Brine',
  slurry: 'Slurry / pulp',
});
const PHYSICAL_LIMITS = Object.freeze({
  pumpFlow: { min: 0.001, max: 200000 },
  pumpHead: { min: 0.1, max: 3000 },
  pumpEta: { min: 1, max: 99 },
  rho: { min: 400, max: 2500 },
  viscosity: { min: 0.1, max: 100000 },
  tempC: { min: -30, max: 220 },
  pumpSpeedRpm: { min: 100, max: 12000 },
  pumpServiceFactor: { min: 1, max: 3 },
  suctionKpa: { min: -95, max: 1000 },
  pipeDiamMm: { min: 10, max: 3000 },
  dailyHours: { min: 0.5, max: 24 },
  pumpVoltage: { min: 24, max: 15000 },
  pumpFreq: { min: 10, max: 400 },
});

function readNum(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function readSelect(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLSelectElement)) return fallback;
  const v = el.value;
  return v || fallback;
}

function readInputs() {
  const premium = isPremiumEffective();
  const duty = /** @type {'uniform'|'moderate'|'heavy'|'custom'} */ (
    readSelect('pumpLoadDuty', 'moderate')
  );
  return {
    flowValue: readNum('pumpFlow', 48),
    flowUnit: /** @type {'m3h'|'lmin'} */ (readSelect('pumpFlowUnit', 'm3h')),
    head_m: readNum('pumpHead', 32),
    etaPump_pct: readNum('pumpEta', 75),
    fluidType: /** @type {'water'|'oil'|'brine'|'slurry'} */ (readSelect('fluidType', 'water')),
    rho_kg_m3: readNum('rho', 1000),
    viscosity_mm2_s: readNum('viscosity', 1),
    temp_C: readNum('tempC', 20),
    pumpSpeed_rpm: readNum('pumpSpeedRpm', 1455),
    loadDuty: duty,
    serviceFactor: readNum('pumpServiceFactor', 1.35),
    couplingType: /** @type {'direct'|'gearmotor'} */ (readSelect('couplingType', 'gearmotor')),
    voltage_V: readNum('pumpVoltage', 400),
    frequency_Hz: readNum('pumpFreq', 50),
    installationProActive: premium,
    suctionPressure_kPa_gauge: premium ? readNum('suctionKpa', 0) : undefined,
    pipeDiameter_mm: premium ? readNum('pipeDiamMm', 100) : undefined,
    dailyRunHours: premium ? readNum('dailyHours', 8) : undefined,
  };
}

function syncPumpDutySelectLabelsEn() {
  const dutyEl = document.getElementById('pumpLoadDuty');
  if (!(dutyEl instanceof HTMLSelectElement)) return;
  LOAD_DUTY_OPTIONS.forEach((o) => {
    const opt = dutyEl.querySelector(`option[value="${o.id}"]`);
    if (!(opt instanceof HTMLOptionElement)) return;
    const L = LOAD_DUTY_OPTIONS_EN[o.id];
    opt.textContent = o.sf != null ? `${L.label} \u2014 SF \u2248 ${o.sf}` : L.label;
  });
}

function syncLoadDutyUi() {
  const dutyEl = document.getElementById('pumpLoadDuty');
  const sfIn = document.getElementById('pumpServiceFactor');
  const hint = document.getElementById('pumpLoadDutyHint');
  if (!(dutyEl instanceof HTMLSelectElement) || !(sfIn instanceof HTMLInputElement)) return;

  const duty = dutyEl.value;
  const row = LOAD_DUTY_OPTIONS.find((o) => o.id === duty);
  const lang = getCurrentLang();
  if (hint && row) {
    hint.textContent = lang === 'en' ? LOAD_DUTY_OPTIONS_EN[row.id].hint : row.hint;
  }

  if (duty === 'custom') {
    sfIn.readOnly = false;
    sfIn.classList.remove('input-synced');
  } else {
    sfIn.readOnly = true;
    sfIn.classList.add('input-synced');
    if (row && row.sf != null) sfIn.value = String(row.sf);
  }
}

function applyFluidPresetFromSelect() {
  const type = readSelect('fluidType', 'water');
  const p = FLUID_TYPE_PRESETS[type];
  if (!p) return;
  const rhoEl = document.getElementById('rho');
  const nuEl = document.getElementById('viscosity');
  if (rhoEl instanceof HTMLInputElement) rhoEl.value = String(p.rho);
  if (nuEl instanceof HTMLInputElement) nuEl.value = String(p.nu_default);
}

function patchProInstallTeaserCheckoutLink() {
  if (FEATURES.allowPremiumViaQueryPro) return;
  const t = document.getElementById('proInstallTeaser');
  if (!t) return;
  const a = t.querySelector('a');
  if (!(a instanceof HTMLAnchorElement)) return;
  a.href = buildRegisterUrlWithNextCheckout();
  if (getCurrentLang() === 'en') {
    a.textContent = 'Get Pro (sign in & checkout)';
  } else {
    a.textContent = 'Obtener Pro (registro y pago)';
  }
}

function syncProInstallUi() {
  const wrap = document.getElementById('proInstallWrap');
  const fields = document.getElementById('proInstallFields');
  const teaser = document.getElementById('proInstallTeaser');
  const ok = isPremiumEffective();
  if (wrap) wrap.classList.toggle('pro-install-wrap--locked', !ok);
  if (fields) {
    fields.querySelectorAll('input, select').forEach((el) => {
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) el.disabled = !ok;
    });
  }
  if (teaser) teaser.hidden = ok;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getEls() {
  return {
    diagram: /** @type {SVGSVGElement | null} */ (document.getElementById('diagramPump')),
    results: document.getElementById('pumpResultsGrid'),
    engineeringReport: document.getElementById('pumpEngineeringReport'),
    motorBlock: document.getElementById('pumpMotorBlock'),
    premiumPdfMount: document.getElementById('premiumPdfExportMount'),
    premiumOpt: document.getElementById('pumpPremiumOptBlock'),
    assumptions: document.getElementById('pumpAssumptionsList'),
    runtimeError: document.getElementById('runtimeError'),
    designAlerts: document.getElementById('pumpDesignAlerts'),
    qualityChecklist: document.getElementById('pumpQualityChecklist'),
  };
}

function applyPhysicalLimitsToInputs() {
  Object.entries(PHYSICAL_LIMITS).forEach(([id, lim]) => {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLInputElement)) return;
    el.min = String(lim.min);
    el.max = String(lim.max);
  });
}

function normalizePhysicalInputs() {
  Object.entries(PHYSICAL_LIMITS).forEach(([id, lim]) => {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLInputElement)) return;
    const raw = parseFloat(String(el.value).replace(',', '.'));
    if (!Number.isFinite(raw)) return;
    const v = Math.min(lim.max, Math.max(lim.min, raw));
    if (v !== raw) el.value = String(v);
  });
}

function localizePumpStaticContent() {
  if (getCurrentLang() !== 'en') return;
  document.documentElement.lang = 'en';
  document.title = 'Centrifugal pump — MechAssist';
  const fp = document.getElementById('fileProtoWarn');
  if (fp) {
    fp.textContent =
      'Open this site over HTTP (not by double-clicking the file). From the project folder run: npx --yes serve .';
  }
  const setText = (sel, t) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = t;
  };
  const setHtml = (sel, h) => {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = h;
  };
  document.querySelector('header nav')?.setAttribute('aria-label', 'Main navigation');
  setText('.app-header nav a[href="index.html"]', 'Home');
  setText('.app-header nav a[href="flat-conveyor.html"]', 'Flat conveyor');
  setText('.app-header nav a[href="inclined-conveyor.html"]', 'Inclined conveyor');
  setText('.app-header nav a[href="roller-conveyor.html"]', 'Rollers');
  setText('.app-header nav a[href="centrifugal-pump.html"]', 'Pump');
  setText('.app-header nav a[href="screw-conveyor.html"]', 'Screw conveyor');
  setText('.app-header nav a[href="transmission-lab.html"]', 'Lab');
  setText('.app-header nav a[href="transmission-canvas.html"]', 'Pro canvas');
  setText('.flat-sidebar__title', 'Centrifugal pump');
  setText(
    '.flat-sidebar__lead',
    'Duty point Q–H, efficiency, fluid and drive. Results, schematic and gearmotor checker are on the right.',
  );
  setText('.flat-accordion:nth-of-type(1) .flat-accordion__label', 'Operating parameters');
  setText('.flat-accordion:nth-of-type(2) .flat-accordion__label', 'Fluid properties');
  setHtml(
    '#proInstallTeaser',
    `Enable <strong>Pro</strong> to enter suction, line and daily hours; you get <strong>installation alerts</strong> and a more realistic <strong>service factor</strong> for continuous duty.
            <a href="?pro=1">Try Pro (?pro=1)</a>`,
  );
  setHtml(
    '.flat-accordion:nth-of-type(3) .flat-accordion__label',
    '<span class="premium-flag">Pro</span> Installation layout',
  );
  setText('.flat-accordion:nth-of-type(4) .flat-accordion__label', 'Drive duty and electrical data');
  setHtml(
    'label[for="pumpFlow"]',
    `Flow Q <span class="info-chip" title="Volumetric flow at the duty point. Must match the same condition used for H and \u03b7." aria-label="Help: flow.">?</span>`,
  );
  setHtml(
    'label[for="pumpFlowUnit"]',
    `Flow unit <span class="info-chip" title="Choose m\u00b3/h or L/min; converted internally to m\u00b3/s." aria-label="Help: flow unit.">?</span>`,
  );
  setText('.field:has(#pumpFlowUnit) .field-hint', 'Converted to m\u00b3/s in the calculation.');
  setHtml(
    'label[for="pumpHead"]',
    `Total head H <span class="info-chip" title="Total equivalent head (static + losses per your definition). Linear impact on power." aria-label="Help: head.">?</span>`,
  );
  setText('.field:has(#pumpHead) .field-hint', 'm fluid column (static + losses already in your definition).');
  setHtml(
    'label[for="pumpEta"]',
    `Pump efficiency \u03b7 <span class="info-chip" title="Pump efficiency at (Q, H). Typical 60\u201385%." aria-label="Help: efficiency.">?</span>`,
  );
  setText('.field:has(#pumpEta) .field-hint', '% at (Q, H); typically ~60\u201385 depending on machine.');
  setHtml(
    'label[for="fluidType"]',
    `Fluid type <span class="info-chip" title="Sets indicative density and viscosity presets; you can override below." aria-label="Help: fluid type.">?</span>`,
  );
  setText('.field:has(#fluidType) .field-hint', 'Adjusts default density and viscosity; you can edit below.');
  const ft = document.getElementById('fluidType');
  if (ft) {
    const m = { water: 'Water', oil: 'Oil', brine: 'Brine', slurry: 'Slurry / pulp' };
    Object.entries(m).forEach(([v, lab]) => {
      const o = ft.querySelector(`option[value="${v}"]`);
      if (o) o.textContent = lab;
    });
  }
  setHtml(
    'label[for="rho"]',
    `Density \u03c1 <span class="info-chip" title="Fluid density in kg/m\u00b3. Higher \u03c1 increases hydraulic power for the same Q and H." aria-label="Help: density.">?</span>`,
  );
  setHtml(
    'label[for="viscosity"]',
    `Kinematic viscosity <span class="info-chip" title="mm\u00b2/s (cSt). Used for an indicative power correction." aria-label="Help: viscosity.">?</span>`,
  );
  setText('.field:has(#viscosity) .field-hint', 'mm\u00b2/s (cSt). Indicative power correction.');
  setHtml(
    'label[for="tempC"]',
    `Operating temperature <span class="info-chip" title="For documentation and NPSH risk (alerts with Pro suction data)." aria-label="Help: temperature.">?</span>`,
  );
  setText('.field:has(#tempC) .field-hint', '\u00b0C \u2014 documentation and NPSH risk (Pro suction alerts).');
  setHtml(
    'label[for="suctionKpa"]',
    `Suction gauge pressure <span class="info-chip" title="kPa gauge at suction. Negative values mean vacuum." aria-label="Help: suction pressure.">?</span>`,
  );
  setText('.field:has(#suctionKpa) .field-hint', 'kPa \u2014 negative = vacuum (lift).');
  setHtml(
    'label[for="pipeDiamMm"]',
    `Pipe ID (discharge) <span class="info-chip" title="Internal diameter used to estimate line velocity." aria-label="Help: pipe diameter.">?</span>`,
  );
  setText('.field:has(#pipeDiamMm) .field-hint', 'mm \u2014 to estimate velocity and high/low warnings.');
  setHtml(
    'label[for="dailyHours"]',
    `Hours per day <span class="info-chip" title="Estimated daily use. Long runtimes can harden the service factor." aria-label="Help: daily hours.">?</span>`,
  );
  setText('.field:has(#dailyHours) .field-hint', '24/7 duty hardens service factor (indicative).');
  setHtml(
    'label[for="pumpLoadDuty"]',
    `Load class \u2192 service factor <span class="info-chip" title="Duty class for base SF suggestion." aria-label="Help: load duty.">?</span>`,
  );
  setHtml(
    'label[for="pumpServiceFactor"]',
    `Service factor SF <span class="info-chip" title="Design margin on torque/power for drive selection." aria-label="Help: service factor.">?</span>`,
  );
  setHtml(
    'label[for="pumpSpeedRpm"]',
    `Nominal pump shaft speed <span class="info-chip" title="Pump shaft rpm for torque T = P/\u03c9." aria-label="Help: pump speed.">?</span>`,
  );
  setText('.field:has(#pumpSpeedRpm) .field-hint', 'min\u207b\u00b9 \u2014 direct coupling or gearbox output.');
  setHtml(
    'label[for="couplingType"]',
    `Coupling type <span class="info-chip" title="Direct or geared motor. Changes how the suggested drive is read." aria-label="Help: coupling.">?</span>`,
  );
  const cp = document.getElementById('couplingType');
  if (cp) {
    const d = cp.querySelector('option[value="direct"]');
    const g = cp.querySelector('option[value="gearmotor"]');
    if (d) d.textContent = 'Direct motor\u2013pump (same shaft / ~1:1)';
    if (g) g.textContent = 'Geared motor (gearbox between motor and pump)';
  }
  setHtml(
    'label[for="pumpVoltage"]',
    `Nominal voltage <span class="info-chip" title="Supply data for documentation. Demo catalog does not filter by voltage." aria-label="Help: voltage.">?</span>`,
  );
  setText('.field:has(#pumpVoltage) .field-hint', 'V \u2014 documentation; demo catalog does not filter by supply.');
  setHtml(
    'label[for="pumpFreq"]',
    `Frequency <span class="info-chip" title="Mains frequency (Hz). For consistency with nominal motor speed." aria-label="Help: frequency.">?</span>`,
  );
  syncPumpDutySelectLabelsEn();
  refreshMountingConfigSection();
  document.getElementById('btnPumpCalc')?.setAttribute(
    'title',
    'Refresh results and scroll to gearmotor suggestions',
  );
  setText('#btnPumpCalc', 'Calculate and show gearmotor');
  setText(
    '.calc-hint',
    'Values update when you change enabled fields. Use an HTTP server, not file://.',
  );
  const resultsPanel = document.querySelector('.layout-right > section.panel:first-of-type');
  const resultsH2 = resultsPanel?.querySelector('h2');
  if (resultsH2) {
    resultsH2.innerHTML = '<span class="panel-icon">\u2211</span> Results (hydraulics and shaft)';
  }
  const resultsLead = resultsPanel?.querySelector(':scope > p.muted');
  if (resultsLead) {
    resultsLead.textContent =
      'Hydraulic power, shaft power and design quantities with service factor.';
  }
  const duo = document.querySelector('.diagram-duo.flat-visual');
  if (duo) duo.setAttribute('aria-label', 'Centrifugal pump schematic');
  const img = document.querySelector('.diagram-duo__real img');
  if (img) img.alt = 'Centrifugal pump installed in a pumping station';
  setHtml(
    '.diagram-duo__real figcaption',
    `Real-world pumping station photo (example).
              <a href="https://commons.wikimedia.org/wiki/File:Pump_station.jpg" target="_blank" rel="noopener">Wikimedia Commons</a>
              \u2014 replace with your own in <code>assets/centrifugal-pump-reference.png</code>.`,
  );
  setHtml(
    '#pumpVerifyPanel h2',
    '<span class="panel-icon">\u2713</span> Check a gearmotor I already have',
  );
  setText(
    '#pumpVerifyPanel > p.muted',
    'Same check as belt tools: power, output torque and speed vs. pump duty.',
  );
  setHtml(
    'label[for="pumpVerifyBrand"]',
    `Brand <span class="info-chip" title="Demo catalog manufacturer for quick verification." aria-label="Help: verify brand.">?</span>`,
  );
  setHtml(
    'label[for="pumpVerifySearch"]',
    `Filter model <span class="info-chip" title="Text search on the catalog list." aria-label="Help: verify filter.">?</span>`,
  );
  const pvs = document.getElementById('pumpVerifySearch');
  if (pvs instanceof HTMLInputElement) pvs.placeholder = 'e.g. R47\u2026';
  setHtml(
    'label[for="pumpVerifyModel"]',
    `Model <span class="info-chip" title="Catalog model compared to required power, torque and rpm." aria-label="Help: verify model.">?</span>`,
  );
  const vrun = document.querySelector('#pumpVerifyPanel button[data-verify-run]');
  if (vrun) vrun.textContent = 'Check for this pump';
  setText('.motors-details:has(#pumpEngineeringReport) .motors-details__title', 'Engineering breakdown');
  setText(
    '.motors-details:has(#pumpEngineeringReport) .motors-details__hint',
    'Collapsed by default \u2014 open for gearbox, strategies and steps',
  );
  setText(
    '.motors-details:has(#pumpEngineeringReport) .motors-details__body > p.muted',
    'Indicative gearbox, motor strategies and model steps.',
  );
  setText('#motoresRecommendations .motors-details__title', 'Geared motors (demo catalog)');
  setText(
    '#motoresRecommendations .motors-details__hint',
    'Collapsed by default \u2014 open for recommendations, export and checker',
  );
  setText(
    '.motors-details:has(#pumpAssumptionsList) .motors-details__title',
    'Model assumptions',
  );
  setText(
    '.motors-details:has(#pumpAssumptionsList) .motors-details__hint',
    'Assumptions and limits used in the calculation',
  );
  const pdfH2 = document.getElementById('premiumPdfExportMount')?.closest('section.panel')?.querySelector('h2');
  if (pdfH2) pdfH2.innerHTML = '<span class="panel-icon">PDF</span> Export report';
}

function buildQualityChecklist(raw, r, en) {
  const d = r.detail || {};
  const checks = [];
  const vPipe = raw.pipeDiameter_mm && raw.pipeDiameter_mm > 0
    ? (d.Q_m3s ?? 0) / (Math.PI * (raw.pipeDiameter_mm / 1000 / 2) ** 2)
    : null;
  const specificEnergy = d.H_m != null ? d.H_m * 9.81 : 0;

  if (en) {
    checks.push(
      r.efficiency_pct_effective < 35
        ? {
            level: 'warn',
            text: `\u03b7=${formatNum(r.efficiency_pct_effective, 1)}% very low for a centrifugal pump; check duty or equipment condition.`,
          }
        : {
            level: 'info',
            text: `\u03b7=${formatNum(r.efficiency_pct_effective, 1)}% plausible for preliminary sizing.`,
          },
    );
    checks.push(
      raw.rho_kg_m3 < 700 || raw.rho_kg_m3 > 1800
        ? {
            level: 'warn',
            text: `\u03c1=${formatNum(raw.rho_kg_m3, 0)} kg/m\u00b3 outside typical water/light-process range.`,
          }
        : { level: 'info', text: `\u03c1=${formatNum(raw.rho_kg_m3, 0)} kg/m\u00b3 looks consistent.` },
    );
    checks.push(
      raw.pumpSpeed_rpm > 3600
        ? {
            level: 'warn',
            text: `Shaft speed ${formatNum(raw.pumpSpeed_rpm, 0)} rpm high; confirm curve, NPSH and rotor balance.`,
          }
        : {
            level: 'info',
            text: `Shaft speed ${formatNum(raw.pumpSpeed_rpm, 0)} rpm in a common industrial band.`,
          },
    );
    if (vPipe != null) {
      checks.push(
        vPipe > 3.5
          ? {
              level: 'warn',
              text: `Discharge velocity \u2248 ${formatNum(vPipe, 2)} m/s high; expect extra loss/noise.`,
            }
          : vPipe < 0.4
            ? {
                level: 'warn',
                text: `Discharge velocity \u2248 ${formatNum(vPipe, 2)} m/s low; sedimentation or oversizing risk.`,
              }
            : {
                level: 'info',
                text: `Discharge velocity \u2248 ${formatNum(vPipe, 2)} m/s in a recommended band.`,
              },
      );
    }
    checks.push(
      raw.serviceFactor > 2.2
        ? {
            level: 'warn',
            text: `SF=${formatNum(raw.serviceFactor, 2)} high; may oversize the drive.`,
          }
        : {
            level: 'info',
            text: `SF=${formatNum(r.serviceFactorUsed ?? raw.serviceFactor, 2)} reasonable for a first pass.`,
          },
    );
    checks.push(
      specificEnergy > 12000
        ? {
            level: 'warn',
            text: `High specific energy (${formatNum(specificEnergy, 0)} J/kg). Review H and assumed losses.`,
          }
        : {
            level: 'info',
            text: `Specific energy ${formatNum(specificEnergy, 0)} J/kg in a usual range.`,
          },
    );
    return checks;
  }

  checks.push(
    r.efficiency_pct_effective < 35
      ? { level: 'warn', text: `η=${formatNum(r.efficiency_pct_effective, 1)}% muy baja para bomba centrífuga; revise punto o estado del equipo.` }
      : { level: 'info', text: `η=${formatNum(r.efficiency_pct_effective, 1)}% en rango plausible para predimensionado.` },
  );
  checks.push(
    raw.rho_kg_m3 < 700 || raw.rho_kg_m3 > 1800
      ? { level: 'warn', text: `Densidad ρ=${formatNum(raw.rho_kg_m3, 0)} kg/m³ fuera de rango típico de agua/proceso ligero.` }
      : { level: 'info', text: `Densidad ρ=${formatNum(raw.rho_kg_m3, 0)} kg/m³ coherente.` },
  );
  checks.push(
    raw.pumpSpeed_rpm > 3600
      ? { level: 'warn', text: `Velocidad de eje ${formatNum(raw.pumpSpeed_rpm, 0)} rpm alta; confirme curva, NPSH y equilibrio dinámico.` }
      : { level: 'info', text: `Velocidad de eje ${formatNum(raw.pumpSpeed_rpm, 0)} rpm en rango habitual industrial.` },
  );
  if (vPipe != null) {
    checks.push(
      vPipe > 3.5
        ? { level: 'warn', text: `Velocidad en impulsión ≈ ${formatNum(vPipe, 2)} m/s alta; posibles pérdidas/ruido elevados.` }
        : vPipe < 0.4
          ? { level: 'warn', text: `Velocidad en impulsión ≈ ${formatNum(vPipe, 2)} m/s baja; riesgo de sedimentación/sobredimensionado.` }
          : { level: 'info', text: `Velocidad en impulsión ≈ ${formatNum(vPipe, 2)} m/s en banda recomendada.` },
    );
  }
  checks.push(
    raw.serviceFactor > 2.2
      ? { level: 'warn', text: `SF=${formatNum(raw.serviceFactor, 2)} elevado; puede sobredimensionar en exceso el accionamiento.` }
      : { level: 'info', text: `SF=${formatNum(r.serviceFactorUsed ?? raw.serviceFactor, 2)} razonable para selección preliminar.` },
  );
  checks.push(
    specificEnergy > 12000
      ? { level: 'warn', text: `Energía específica alta (${formatNum(specificEnergy, 0)} J/kg). Revise H y pérdidas asumidas.` }
      : { level: 'info', text: `Energía específica ${formatNum(specificEnergy, 0)} J/kg dentro de rango habitual.` },
  );
  return checks;
}

function getDriveRequirements() {
  const lang = getCurrentLang();
  const r = computeCentrifugalPump(readInputs(), lang);
  return {
    power_kW: r.requiredMotorPower_kW,
    torque_Nm: r.torqueWithService_Nm,
    drum_rpm: r.drumRpm,
    ...readMountingPreferences(),
  };
}

function formatNum(x, d = 2) {
  if (!Number.isFinite(x)) return '—';
  return x.toFixed(d);
}

function formatMounting(pref) {
  const en = getCurrentLang() === 'en';
  const typeMap = en
    ? { B3: 'B3 foot', B5: 'B5 flange', B14: 'B14 flange', hollowShaft: 'Hollow shaft' }
    : { B3: 'B3 patas', B5: 'B5 brida', B14: 'B14 brida', hollowShaft: 'Eje hueco' };
  const ori = pref.orientation === 'vertical' ? 'Vertical' : 'Horizontal';
  return `${typeMap[pref.mountingType] || pref.mountingType} \u00b7 ${ori}`;
}

function getRecoCopyPump() {
  const en = getCurrentLang() === 'en';
  return en
    ? {
        torqueLabel: 'torque at pump shaft',
        rpmLabel: 'pump shaft rpm',
        rpmShortLabel: 'n shaft',
        contextHtml: `Starting points from required <strong>shaft power</strong>, <strong>design torque</strong> at the shaft and <strong>speed</strong>.
        Same demo-catalog logic as belt tools; validate full curve and NPSH with the pump vendor.`,
      }
    : {
        torqueLabel: 'par en eje bomba',
        rpmLabel: 'rpm del eje de la bomba',
        rpmShortLabel: 'n eje',
        contextHtml: `Puntos de partida según la <strong>potencia de eje</strong> exigida por la bomba, el <strong>par de diseño</strong> en el eje y la <strong>velocidad de giro</strong>.
        Misma lógica de catálogo que en cintas; valide curva completa y NPSH con el fabricante de la bomba.`,
      };
}

function showRuntimeError(msg) {
  const box = document.getElementById('runtimeError');
  if (!box) return;
  box.hidden = false;
  box.textContent = msg;
}

function clearRuntimeError() {
  const box = document.getElementById('runtimeError');
  if (!box) return;
  box.hidden = true;
  box.textContent = '';
}

function refresh() {
  const LBL = getI18nLabels();
  const lang = getCurrentLang();
  const en = lang === 'en';
  const els = getEls();
  try {
    clearRuntimeError();
    normalizePhysicalInputs();
    const raw = readInputs();
    const r = computeCentrifugalPump(raw, lang);
    const d = r.detail || {};

    const etaEl = document.getElementById('pumpEta');
    if (etaEl instanceof HTMLInputElement) {
      const bad = (r.efficiency_pct_raw ?? 0) > 99 || (r.efficiency_pct_raw ?? 0) < 25;
      etaEl.classList.toggle('field-input--danger', bad);
    }

    if (els.diagram) {
      const flowUnitLabel = raw.flowUnit === 'lmin' ? 'L/min' : 'm³/h';
      const flowLabel = `${raw.flowValue} ${flowUnitLabel}`;
      const preset = FLUID_TYPE_PRESETS[raw.fluidType];
      const fluidLabel = preset ? (en ? FLUID_TYPE_LABEL_EN[raw.fluidType] || preset.label : preset.label) : '';
      const fluidShort = fluidLabel
        ? `${fluidLabel} \u00b7 ${raw.rho_kg_m3} kg/m\u00b3`
        : `${raw.rho_kg_m3} kg/m\u00b3`;
      renderCentrifugalPumpDiagram(els.diagram, {
        flowLabel,
        head_m: raw.head_m,
        pumpSpeed_rpm: raw.pumpSpeed_rpm,
        hydraulicPower_kW: r.hydraulicPower_kW,
        shaftPower_kW: r.shaftPower_kW,
        etaPump_pct: raw.etaPump_pct,
        couplingType: raw.couplingType,
        fluidShort,
        lang,
      });
    }

    if (els.designAlerts) {
      const alerts = [];
      const η = r.efficiency_pct_raw ?? raw.etaPump_pct;
      if (η > 92) {
        alerts.push({
          level: /** @type {const} */ ('warn'),
          text: en
            ? 'Efficiency \u03b7 very high for a single point: confirm on the manufacturer curve (\u03b7 usually varies with Q).'
            : 'Rendimiento η muy alto para un punto único: confirme en la curva del fabricante (η suele variar con Q).',
        });
      }
      if (η < 35) {
        alerts.push({
          level: /** @type {const} */ ('warn'),
          text: en
            ? 'Low efficiency: check if the point is extrapolated or if there is wear / recirculation.'
            : 'Rendimiento bajo: revise si el punto es extrapolado o si hay desgaste / recirculación.',
        });
      }
      if (raw.installationProActive) {
        alerts.push(
          ...buildPumpInstallationAlerts(
            {
              Q_m3s: d.Q_m3s ?? 0,
              pipeDiameter_mm: raw.pipeDiameter_mm,
              suctionPressure_kPa_gauge: raw.suctionPressure_kPa_gauge,
              temp_C: raw.temp_C,
            },
            lang,
          ),
        );
      }
      if (FEATURES.safetyOptimization && raw.installationProActive && raw.dailyRunHours != null && raw.dailyRunHours >= 20) {
        alerts.push({
          level: 'info',
          text: en
            ? `Extended duty (${raw.dailyRunHours} h/day): service factor was hardened vs. the base duty class.`
            : `Servicio prolongado (${raw.dailyRunHours} h/día): se ha endurecido el factor de servicio respecto al valor base del tipo de carga.`,
        });
      }
      els.designAlerts.innerHTML = alerts
        .map((a) => `<p class="design-alert design-alert--${a.level}">${escHtml(a.text)}</p>`)
        .join('');
    }

    if (els.results) {
      const mount = readMountingPreferences();
      const mechanicalSummary = en
        ? [
            `${raw.couplingType === 'direct' ? 'Direct' : 'Geared'} coupling`,
            raw.pipeDiameter_mm ? `line ${formatNum(raw.pipeDiameter_mm, 0)} mm` : null,
            mount.machineShaftDiameter_mm != null ? `shaft ${formatNum(mount.machineShaftDiameter_mm, 0)} mm` : null,
          ]
            .filter(Boolean)
            .join(' \u00b7 ')
        : [
            `Acople ${raw.couplingType === 'direct' ? 'directo' : 'motorreductor'}`,
            raw.pipeDiameter_mm ? `tubería ${formatNum(raw.pipeDiameter_mm, 0)} mm` : null,
            mount.machineShaftDiameter_mm != null ? `eje ${formatNum(mount.machineShaftDiameter_mm, 0)} mm` : null,
          ]
            .filter(Boolean)
            .join(' \u00b7 ');
      const instNote = raw.installationProActive
        ? ''
        : en
          ? `<div class="metric"><div class="label">Installation (Pro)</div><div class="value muted">Enable Pro for suction, line and schedule</div></div>`
          : `<div class="metric"><div class="label">Instalación (Pro)</div><div class="value muted">Actíve Pro para succión, tubería y horario</div></div>`;
      const fullTitle = en ? 'Full result' : 'Resultado completo';
      const fullHint = en
        ? 'Hydraulics, corrections and process data'
        : 'Hidráulica, correcciones y datos de proceso';
      const pHyd = en ? 'Hydraulic power P_h' : 'Potencia hidráulica P_h';
      const shaftNoSf = en ? `${LBL.shaftPower} pump (no SF)` : `${LBL.shaftPower} bomba (sin SF)`;
      const nuFac = en ? 'Viscosity / fluid correction factor' : 'Factor corrección ν / fluido';
      const torqueRun = en ? 'Torque at shaft (steady)' : 'Par en eje (régimen)';

      els.results.innerHTML = `
    <div class="result-focus-grid">
      <div class="metric"><div class="label">${LBL.requiredTorque}</div><div class="value">${formatNum(r.torqueWithService_Nm, 2)} N\u00b7m</div></div>
      <div class="metric"><div class="label">${LBL.serviceFactor}</div><div class="value">${formatNum(r.serviceFactorUsed ?? 1, 3)}</div></div>
      <div class="metric metric--text"><div class="label">${LBL.mountingType}</div><div class="value">${formatMounting(mount)}</div></div>
      <div class="metric"><div class="label">${LBL.speed}</div><div class="value">${formatNum(r.drumRpm, 2)} rpm</div></div>
      <div class="metric"><div class="label">${LBL.motorPower}</div><div class="value">${formatNum(r.requiredMotorPower_kW, 3)} kW</div></div>
      <div class="metric metric--text"><div class="label">${en ? 'Mechanical details' : 'Detalles mecánicos'}</div><div class="value">${mechanicalSummary}</div></div>
    </div>
    <details class="motors-details result-focus-extra">
      <summary class="motors-details__summary">
        <span class="motors-details__summary-main">
          <span class="panel-icon">\u2261</span>
          <span class="motors-details__text">
            <span class="motors-details__title">${fullTitle}</span>
            <span class="motors-details__hint">${fullHint}</span>
          </span>
        </span>
      </summary>
      <div class="motors-details__body">
        <div class="results-grid">
          <div class="metric"><div class="label">${pHyd}</div><div class="value">${formatNum(r.hydraulicPower_kW, 3)} kW</div></div>
          <div class="metric"><div class="label">${shaftNoSf}</div><div class="value">${formatNum(r.shaftPower_kW, 3)} kW</div></div>
          <div class="metric"><div class="label">${nuFac}</div><div class="value">${formatNum(r.viscosityFactor ?? 1, 3)}</div></div>
          <div class="metric"><div class="label">${LBL.massFlow}</div><div class="value">${formatNum(r.massFlow_kg_s, 3)} kg/s</div></div>
          <div class="metric"><div class="label">${torqueRun}</div><div class="value">${formatNum(r.torqueAtDrum_Nm, 2)} N\u00b7m</div></div>
          ${instNote}
        </div>
      </div>
    </details>
  `;
    }

    if (els.qualityChecklist) {
      const checks = buildQualityChecklist(raw, r, en);
      const bad = checks.filter((c) => c.level === 'error').length;
      const warn = checks.filter((c) => c.level === 'warn').length;
      const ok = checks.length - bad - warn;
      const qcLead = en
        ? `<strong>Quick technical checklist</strong> \u00b7 ${ok} OK \u00b7 ${warn} warnings \u00b7 ${bad} critical`
        : `<strong>Checklist técnica rápida</strong> \u00b7 ${ok} OK \u00b7 ${warn} avisos \u00b7 ${bad} críticos`;
      els.qualityChecklist.innerHTML = `
        <p class="muted" style="margin:0 0 0.5rem;font-size:0.83rem">${qcLead}</p>
        ${checks.map((c) => `<p class="design-alert design-alert--${c.level}">${escHtml(c.text)}</p>`).join('')}
      `;
    }

    if (els.engineeringReport) {
      try {
        els.engineeringReport.innerHTML = renderFullEngineeringAside(r, {
          lang,
          shaftLabel: en ? 'pump shaft' : 'eje bomba',
          shaftOutLabel: en ? 'Gearbox output / pump shaft' : 'Salida reductor / eje bomba',
          motorSubtitle: en
            ? '~4-pole motor reference at 50 Hz; if using a VFD or other poles, adjust nominal pump shaft speed in the form.'
            : 'Referencia motor ~4 polos a 50 Hz; si usa variador o otro polo, ajuste el régimen nominal del eje bomba en el formulario.',
        });
      } catch (err) {
        console.error(err);
        els.engineeringReport.innerHTML = `<div class="motor-error">${en ? 'Report error:' : 'Error informe:'} ${String(err.message || err)}</div>`;
      }
    }

    if (els.motorBlock) {
      try {
        els.motorBlock.innerHTML = renderBrandRecommendationCards(getDriveRequirements(), getRecoCopyPump());
      } catch (err) {
        console.error(err);
        const gearLabel = en ? 'Geared motors:' : 'Motorreductores:';
        const fileHint = en
          ? 'If using file://, run the site with an HTTP server.'
          : 'Si usa file://, abra con servidor HTTP.';
        els.motorBlock.innerHTML = `<div class="motor-error"><strong>${gearLabel}</strong> ${String(err.message || err)}. ${fileHint}</div>`;
      }
    }

    if (els.premiumPdfMount) {
      mountPremiumPdfExportBar(els.premiumPdfMount, {
        isPremium: isPremiumEffective(),
        getPayload: () => buildPumpPdfPayload(raw, r),
        getDiagramElement: () => els.diagram,
        diagramTitle: en ? 'Machine diagram' : 'Diagrama de la máquina',
      });
    }

    if (els.assumptions) {
      els.assumptions.innerHTML = (r.assumptions || []).map((a) => `<li>${escHtml(a)}</li>`).join('');
    }

    if (els.premiumOpt) {
      if (isPremiumEffective() && FEATURES.safetyOptimization && raw.installationProActive) {
        els.premiumOpt.innerHTML = en
          ? `
      <section class="panel premium-block">
        <h2><span class="panel-icon">\u2605</span> Safety and duty (Pro)</h2>
        <p class="muted" style="margin:0 0 0.5rem">
          Hours/day and suction feed alerts and SF hardening. For detailed available NPSH use the vendor method or applicable standard.
        </p>
        <ul class="assumptions">
          <li>Suction pressure entered: <strong>${raw.suctionPressure_kPa_gauge != null ? `${raw.suctionPressure_kPa_gauge} kPa` : '\u2014'}</strong></li>
          <li>Schedule: <strong>${raw.dailyRunHours != null ? `${raw.dailyRunHours} h/day` : '\u2014'}</strong></li>
        </ul>
      </section>
    `
          : `
      <section class="panel premium-block">
        <h2><span class="panel-icon">\u2605</span> Seguridad y servicio (Pro)</h2>
        <p class="muted" style="margin:0 0 0.5rem">
          Horas/día y succión alimentan avisos y el endurecimiento del SF. Para NPSH disponible detallado use el método del fabricante o norma aplicable.
        </p>
        <ul class="assumptions">
          <li>Presión succión introducida: <strong>${raw.suctionPressure_kPa_gauge != null ? `${raw.suctionPressure_kPa_gauge} kPa` : '\u2014'}</strong></li>
          <li>Horario: <strong>${raw.dailyRunHours != null ? `${raw.dailyRunHours} h/día` : '\u2014'}</strong></li>
        </ul>
      </section>
    `;
      } else {
        els.premiumOpt.innerHTML = '';
      }
    }
    applyMachinePremiumGates();
    foldAllMachineDetailsOncePerPageLoad();
  } catch (err) {
    console.error(err);
    showRuntimeError(
      en
        ? `Calculation error: ${String(err.message || err)}. Use a local server (npx serve) and check the console (F12).`
        : `Error al calcular: ${String(err.message || err)}. Use servidor local (npx serve) y revise la consola (F12).`,
    );
  }
}

pumpInputIds.forEach((id) => {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement) {
    el.addEventListener('input', refresh);
    el.addEventListener('change', refresh);
  }
});

pumpSelectIds.forEach((id) => {
  const el = document.getElementById(id);
  if (el instanceof HTMLSelectElement) {
    el.addEventListener('change', () => {
      if (id === 'fluidType') applyFluidPresetFromSelect();
      if (id === 'pumpLoadDuty') syncLoadDutyUi();
      refresh();
    });
  }
});

try {
  initMotorVerification(document.getElementById('pumpVerifyPanel'), getDriveRequirements);
} catch (e) {
  console.error(e);
}

document.getElementById('btnPumpCalc')?.addEventListener('click', () => {
  refresh();
  openMotorsRecommendationsAndScroll('section-pump-motores');
});

injectMountingConfigSection();
MOUNTING_INPUT_IDS.forEach((id) => {
  document.getElementById(id)?.addEventListener('input', refresh);
  document.getElementById(id)?.addEventListener('change', refresh);
});

syncProInstallUi();
applyPhysicalLimitsToInputs();
localizePumpStaticContent();
patchProInstallTeaserCheckoutLink();
syncLoadDutyUi();
initInfoChipPopovers(document.body);
refresh();

window.addEventListener(HOME_LANG_CHANGED_EVENT, () => {
  location.reload();
});



