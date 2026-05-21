/**
 * Página elevador de cangilones — asistente 3 pasos + diagrama + motorreductores.
 */

import { readMountingPreferences } from '../modules/mountingPreferences.js';
import {
  BUCKET_CATALOG,
  computeBucketElevator,
  displayBucketLabel,
} from '../modules/bucketElevator.js';
import {
  renderBrandRecommendationCards,
  initMotorVerification,
  refreshMotorVerificationManual,
} from './driveSelection.js';
import {
  injectMountingConfigSection,
  MOUNTING_INPUT_IDS,
  refreshMountingConfigSection,
} from './mountingConfigSection.js';
import { openMotorsRecommendationsAndScroll } from './motorsCollapsible.js';
import { renderBucketElevatorDiagram } from './diagramBucketElevator.js';
import { applyMachinePremiumGates } from './machinePremiumGates.js';
import { foldAllMachineDetailsOncePerPageLoad } from './machineDetailsFold.js';
import { isPremiumEffective } from '../services/accessTier.js';
import { mountPremiumPdfExportBar, buildBucketPdfPayload } from '../services/reportPdfExport.js';
import { renderFullEngineeringAside } from './engineeringReport.js';
import { initInfoChipPopovers } from './infoChipPopover.js';
import { getI18nLabels } from '../config/i18nLabels.js';
import { getCurrentLang } from '../config/locales.js';
import { escapeCsvCell, wireMachineRfqExport } from './machineRfqExport.js';
import { bootMachineCalcView, wrapCalcRefresh } from './creditsPageBoot.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { MACHINE_HUB_UX_EN } from '../lab/i18n/pages/machineHubUxEn.js';
import { BUCKET_ELEVATOR_EN } from '../lab/i18n/pages/bucketElevatorEn.js';
import { BUCKET_PRESET_BY_ID } from '../modules/machineHubPresets.js';
import { incrementCalcCounter } from '../services/calcCounter.js';

const BUCKET_PAGE_EN = { ...MACHINE_HUB_UX_EN, ...BUCKET_ELEVATOR_EN };
const BE_DOC_TITLE_ES = 'Elevador de cangilones \u2014 TheMechAssist';

function applyBucketDocumentChrome() {
  const en = getCurrentLang() === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
  document.title = en ? BUCKET_PAGE_EN['beConv.docTitle'] : BE_DOC_TITLE_ES;
}

function onBucketLangChanged() {
  refreshMountingConfigSection();
  fillBucketSelect();
  refreshMotorVerificationManual(document.getElementById('beVerifyPanel'), getDriveRequirements);
  document.getElementById('beVerifyBrand')?.dispatchEvent(new Event('change'));
  computeAndRender();
}

let animPhase = 0;
let animId = 0;
let collapsedOnce = false;
/** @type {any} */
let lastR = null;
/** @type {any} */
let lastP = null;

function readNum(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function readSelect(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLSelectElement)) return fallback;
  return el.value || fallback;
}

function selectedBucket() {
  const id = readSelect('beBucket', 'b2');
  return BUCKET_CATALOG.find((b) => b.id === id) || BUCKET_CATALOG[3];
}

/** Requisito de accionamiento para catálogo demo (potencia motor, par y rpm en tambor de cabeza). */
function getDriveRequirements() {
  const p = buildParams();
  let r;
  try {
    r = computeBucketElevator(p, getCurrentLang());
  } catch {
    return {
      power_kW: 0,
      torque_Nm: 0,
      drum_rpm: 0.01,
      ...readMountingPreferences(),
    };
  }
  const v = Math.max(0.05, p.beltSpeed_m_s);
  const D = Math.max(0.15, p.headDrumDiameter_m);
  const drum_rpm = (60 * v) / (Math.PI * D);
  const P_drum_kW = r.power.pureLift_kW + r.power.dragBoot_kW;
  const torque_Nm = drum_rpm > 0.02 ? (9550 * P_drum_kW) / drum_rpm : 0;
  return {
    power_kW: r.power.shaft_kW,
    torque_Nm,
    drum_rpm: Math.max(0.01, drum_rpm),
    ...readMountingPreferences(),
  };
}

function buildParams() {
  const b = selectedBucket();
  return {
    bulkDensity_kg_m3: readNum('beRho', 850),
    particle_mm: readNum('beParticle', 8),
    fluidity: /** @type {'poor'|'medium'|'good'} */ (readSelect('beFluidity', 'medium')),
    materialNature: /** @type {'fragile_abrasive'|'normal'|'fluid_light'} */ (readSelect('beNature', 'normal')),
    liftHeight_m: readNum('beH', 28),
    centerDistance_m: readNum('beC', 30),
    capacity_tph: readNum('beQ', 45),
    headDrumDiameter_m: readNum('beDhead', 0.65),
    bootDrumDiameter_m: readNum('beDboot', 0.55),
    beltSpeed_m_s: readNum('beVbelt', 1.9),
    bucketVolume_L: b.volume_L,
    minBeltFromCatalog_mm: b.minBelt_mm,
    beltWidth_mm: readNum('beWidth', b.minBelt_mm),
    beltStrength_N_per_mm: readNum('beSigma', 315),
    etaElev: readNum('beEta', 0.78),
    kBootDrag: readNum('beKboot', 0.18),
    etaTransmission: readNum('beEtaTrans', 0.96),
    dischargeType: /** @type {'centrifugal'|'gravity'|'mixed'} */ (readSelect('beDischargeType', 'mixed')),
    manualPitch_mm: readNum('bePitchManual', b.typicalPitch_mm),
  };
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function formatMounting(pref, lang = getCurrentLang()) {
  const en = lang === 'en';
  const typeMap = en
    ? { B3: 'B3 foot mount', B5: 'B5 flange', B14: 'B14 flange', hollowShaft: 'Hollow shaft' }
    : { B3: 'B3 patas', B5: 'B5 brida', B14: 'B14 brida', hollowShaft: 'Eje hueco' };
  const ori = pref.orientation === 'vertical' ? 'Vertical' : 'Horizontal';
  return `${typeMap[pref.mountingType] || pref.mountingType} \u00b7 ${ori}`;
}

function beRfqFmt(x, d = 2) {
  return Number.isFinite(x) ? x.toFixed(d) : '\u2014';
}

/**
 * @param {ReturnType<typeof buildParams>} raw
 * @param {ReturnType<typeof computeBucketElevator>} r
 * @param {ReturnType<typeof readMountingPreferences>} mount
 * @param {'es'|'en'} lang
 */
function buildBucketRfqPlainText(raw, r, mount, lang) {
  const en = lang === 'en';
  const inp = r.inputs || {};
  const pw = r.power || {};
  const ten = r.tension || {};
  const ce = r.centrifugal || {};
  const when = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const head = en
    ? 'TheMechAssist — Bucket elevator (indicative CEMA-style)'
    : 'TheMechAssist — Elevador de cangilones (orientativo CEMA)';
  const hIn = en ? '== Inputs (summary) ==' : '== Entradas (resumen) ==';
  const hOut = en ? '== Results (indicative) ==' : '== Resultados (orientativos) ==';
  const hMount = en ? '== Mounting preference (for RFQ) ==' : '== Preferencia de montaje (RFQ) ==';
  const disc = typeof r.disclaimer === 'string' ? r.disclaimer : '';

  const parts = [
    head,
    `${en ? 'Timestamp (UTC)' : 'Fecha (UTC)'}: ${when}`,
  ];
  if (url) parts.push(`${en ? 'Source' : 'Origen'}: ${url}`);
  parts.push(
    '',
    hIn,
    `rho: ${beRfqFmt(inp.rho, 0)} kg/m³ · H: ${beRfqFmt(inp.H, 2)} m · C: ${beRfqFmt(inp.C, 2)} m`,
    `Q: ${beRfqFmt(inp.Q, 2)} t/h · v: ${beRfqFmt(inp.v, 2)} m/s · D_head: ${beRfqFmt(inp.D_head, 3)} m`,
    `B: ${beRfqFmt(inp.B, 0)} mm · sigma: ${beRfqFmt(inp.sigma, 1)} N/mm · ${en ? 'discharge' : 'descarga'}: ${raw.dischargeType}`,
    `${en ? 'Fill factor (model)' : 'Llenado (modelo)'}: ${beRfqFmt(r.fillFactor, 3)}`,
    `etaElev: ${beRfqFmt(pw.etaElev, 3)} · kBoot: ${beRfqFmt(pw.kBootDrag, 3)} · etaTrans: ${beRfqFmt(pw.etaTransmission, 3)}`,
    '',
    hOut,
    `pitch: ${beRfqFmt(r.pitch_mm, 1)} mm · fill: ${beRfqFmt(r.fillFactor, 3)} · Q_check: ${beRfqFmt(r.capacity_check_tph, 2)} t/h`,
    `P_lift: ${beRfqFmt(pw.pureLift_kW, 3)} kW · P_boot: ${beRfqFmt(pw.dragBoot_kW, 3)} kW · P_shaft: ${beRfqFmt(pw.shaft_kW, 3)} kW`,
    `T_work/T_adm: ${beRfqFmt(ten.working_N, 0)} / ${beRfqFmt(ten.admissible_N, 0)} N · ratio: ${beRfqFmt(ten.ratio, 3)} · ok: ${ten.ok ? (en ? 'yes' : 'sí') : en ? 'no' : 'no'}`,
    `K_cent: ${beRfqFmt(ce.K, 4)} · D_drum: ${beRfqFmt(ce.drumDiameter_m, 3)} m`,
    '',
    hMount,
    formatMounting(mount, lang) +
      (mount.machineShaftDiameter_mm != null
        ? ` · ${en ? 'Machine shaft Ø' : 'Ø eje máquina'} ${beRfqFmt(mount.machineShaftDiameter_mm, 1)} mm`
        : ''),
    '',
    disc,
  );
  return parts.join('\n');
}

/**
 * @param {ReturnType<typeof buildParams>} raw
 * @param {ReturnType<typeof computeBucketElevator>} r
 * @param {ReturnType<typeof readMountingPreferences>} mount
 */
function buildBucketRfqCsv(raw, r, mount) {
  const inp = r.inputs || {};
  const pw = r.power || {};
  const ten = r.tension || {};
  const ce = r.centrifugal || {};
  const headers = [
    'product',
    'generated_utc',
    'page_url',
    'rho',
    'H_m',
    'C_m',
    'Q_tph',
    'v_m_s',
    'D_head_m',
    'B_mm',
    'sigma_N_mm',
    'discharge_type',
    'fill_model',
    'eta_elev',
    'k_boot',
    'eta_trans',
    'mounting',
    'orientation',
    'machine_shaft_d_mm',
    'pitch_mm',
    'Q_check_tph',
    'P_lift_kW',
    'P_boot_kW',
    'P_shaft_kW',
    'T_work_N',
    'T_adm_N',
    'tension_ratio',
    'tension_ok',
    'K_cent',
    'D_drum_m',
  ];
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const when = new Date().toISOString();
  const values = [
    'TheMechAssist_bucket_elevator',
    when,
    url,
    inp.rho,
    inp.H,
    inp.C,
    inp.Q,
    inp.v,
    inp.D_head,
    inp.B,
    inp.sigma,
    raw.dischargeType,
    r.fillFactor,
    pw.etaElev,
    pw.kBootDrag,
    pw.etaTransmission,
    mount.mountingType,
    mount.orientation,
    mount.machineShaftDiameter_mm ?? '',
    r.pitch_mm,
    r.capacity_check_tph,
    pw.pureLift_kW,
    pw.dragBoot_kW,
    pw.shaft_kW,
    ten.working_N,
    ten.admissible_N,
    ten.ratio,
    ten.ok ? '1' : '0',
    ce.K,
    ce.drumDiameter_m,
  ];
  return `${headers.map(escapeCsvCell).join(',')}\n${values.map(escapeCsvCell).join(',')}`;
}

function writeBeFormValue(id, val) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLSelectElement)) return;
  el.value = val === '' || val == null ? '' : String(val);
}

function applyBePresetFromId(presetId) {
  const def = BUCKET_PRESET_BY_ID[presetId];
  if (!def) return;
  for (const [k, v] of Object.entries(def.values)) {
    writeBeFormValue(k, v);
  }
  computeAndRender();
}

/**
 * @param {ReturnType<typeof computeBucketElevator>} r
 * @param {ReturnType<typeof buildParams>} p
 * @param {ReturnType<typeof getDriveRequirements>} drive
 * @param {'es'|'en'} lang
 */
function renderBeAsideKpi(r, p, drive, lang) {
  const el = document.getElementById('beAsideKpi');
  if (!el) return;
  const en = lang === 'en';
  const pw = r.power || {};
  el.innerHTML = `
    <p class="be-aside-kpi__lead">${en ? 'Live summary — open step 3 for full results' : 'Resumen en vivo — paso 3 para el detalle completo'}</p>
    <div class="be-aside-kpi__grid">
      <div>
        <span class="be-aside-kpi__lbl">${en ? 'Motor power' : 'Potencia motor'}</span>
        <strong>${drive.power_kW.toFixed(3)} kW</strong>
      </div>
      <div>
        <span class="be-aside-kpi__lbl">${en ? 'Head drum torque' : 'Par tambor cabeza'}</span>
        <strong>${drive.torque_Nm.toFixed(0)} N·m</strong>
      </div>
      <div>
        <span class="be-aside-kpi__lbl">${en ? 'Belt speed' : 'Velocidad cinta'}</span>
        <strong>${p.beltSpeed_m_s.toFixed(2)} m/s</strong>
      </div>
      <div>
        <span class="be-aside-kpi__lbl">${en ? 'Shaft power (model)' : 'Potencia eje (modelo)'}</span>
        <strong>${(pw.shaft_kW ?? 0).toFixed(3)} kW</strong>
      </div>
    </div>`;
}

function drawDiagramOnly() {
  const svg = document.getElementById('beDiagram');
  if (!(svg instanceof SVGSVGElement)) return;
  let p = lastP;
  let pitch_mm = lastR?.pitch_mm;
  if (!p) {
    try {
      p = buildParams();
    } catch {
      return;
    }
  }
  if (pitch_mm == null || !Number.isFinite(pitch_mm)) {
    try {
      pitch_mm = computeBucketElevator(p, getCurrentLang()).pitch_mm;
    } catch {
      pitch_mm = readNum('bePitchManual', 380);
    }
  }
  renderBucketElevatorDiagram(svg, {
    liftHeight_m: p.liftHeight_m,
    centerDistance_m: p.centerDistance_m,
    headDrumDiameter_m: p.headDrumDiameter_m,
    bootDrumDiameter_m: p.bootDrumDiameter_m,
    pitch_mm,
    beltSpeed_m_s: p.beltSpeed_m_s,
    animPhase,
    lang: getCurrentLang(),
  });
}

function mountBePdfExport() {
  const pdfMount = document.getElementById('premiumPdfExportMount');
  if (!pdfMount) return;
  const lang = getCurrentLang();
  const en = lang === 'en';
  let p;
  let r;
  try {
    p = lastP ?? buildParams();
    r = lastR ?? computeBucketElevator(p, lang);
  } catch {
    return;
  }
  const driveReq = getDriveRequirements();
  mountPremiumPdfExportBar(pdfMount, {
    getPayload: () => buildBucketPdfPayload(p, r, driveReq),
    getDiagramElement: () => {
      const el = document.getElementById('beDiagram');
      return el instanceof SVGSVGElement ? el : null;
    },
    diagramTitle: en ? 'Bucket elevator diagram' : 'Diagrama elevador de cangilones',
  });
}

function computeAndRenderCore() {
  const lang = getCurrentLang();
  const en = lang === 'en';
  const LBL = getI18nLabels();
  const p = buildParams();
  let r;
  try {
    r = computeBucketElevator(p, lang);
  } catch (e) {
    console.error(e);
    drawDiagramOnly();
    mountBePdfExport();
    const errEl = document.getElementById('runtimeError');
    if (errEl instanceof HTMLElement) {
      errEl.hidden = false;
      errEl.textContent = e instanceof Error ? e.message : String(e);
    }
    return;
  }
  lastP = p;
  lastR = r;
  if (Number.isFinite(r.power?.shaft_kW)) incrementCalcCounter();

  const recoCopyBucketElevator = en
    ? {
        torqueLabel: 'torque at head drum',
        rpmLabel: 'head drum rpm',
        contextHtml: `Recommendations from <strong>motor power</strong> (gearbox side), <strong>torque at the head drum</strong> and <strong>head drum rpm</strong>
    from the elevator model (step 3). Each card links to manufacturer documentation \u2014 always confirm with your supplier.`,
      }
    : {
        torqueLabel: 'par en tambor de cabeza',
        rpmLabel: 'rpm del tambor de cabeza',
        contextHtml: `Recomendaciones seg\u00fan la <strong>potencia de motor</strong> (lado reductor), <strong>par en el tambor de cabeza</strong> y <strong>rpm del tambor</strong>
    obtenidos del modelo de elevador (paso 3). Cada tarjeta enlaza a documentaci\u00f3n del fabricante \u2014 valide siempre con su proveedor.`,
      };

  const step2 = document.getElementById('beStep2Hints');
  if (step2) {
    const sr = r.speedRecommendation;
    step2.innerHTML = en
      ? `
      <div class="be-hints__card">
        <strong>Recommended speed</strong> (${esc(sr.label)}): <strong>${sr.vMin.toFixed(1)} \u2013 ${sr.vMax.toFixed(1)} m/s</strong>
        (nominal \u2248 ${sr.vNominal.toFixed(1)} m/s).
      </div>
      <div class="be-hints__card">
        <strong>Fill factor \u03c6</strong> (indicative): <strong>${r.fillFactor.toFixed(2)}</strong>
      </div>
      <div class="be-hints__card">
        <strong>Minimum bucket spacing</strong> for the requested <em>Q</em> with this <em>v</em> and bucket:
        <strong>${r.pitch_mm.toFixed(0)} mm</strong>
        (check commercial pitch vs. CEMA / vendor).
      </div>
      <div class="be-hints__card">
        <strong>Minimum belt width</strong> (demo catalog): <strong>${r.minBeltWidth_mm} mm</strong>
      </div>
      <div class="be-hints__card muted">
        Check capacity with computed pitch: <strong>${r.capacity_check_tph.toFixed(2)} t/h</strong>
      </div>`
      : `
      <div class="be-hints__card">
        <strong>Velocidad recomendada</strong> (${esc(sr.label)}): <strong>${sr.vMin.toFixed(1)} \u2013 ${sr.vMax.toFixed(1)} m/s</strong>
        (nominal \u2248 ${sr.vNominal.toFixed(1)} m/s).
      </div>
      <div class="be-hints__card">
        <strong>Factor de llenado \u03c6</strong> (orientativo): <strong>${r.fillFactor.toFixed(2)}</strong>
      </div>
      <div class="be-hints__card">
        <strong>Paso m\u00ednimo entre cangilones</strong> para la <em>Q</em> solicitada con este <em>v</em> y cangil\u00f3n:
        <strong>${r.pitch_mm.toFixed(0)} mm</strong>
        (comprobar paso comercial CEMA / fabricante).
      </div>
      <div class="be-hints__card">
        <strong>Ancho m\u00ednimo de banda</strong> (cat\u00e1logo demo): <strong>${r.minBeltWidth_mm} mm</strong>
      </div>
      <div class="be-hints__card muted">
        Capacidad de comprobaci\u00f3n con paso calculado: <strong>${r.capacity_check_tph.toFixed(2)} t/h</strong>
      </div>`;
  }

  const res = document.getElementById('beResults');
  if (res) {
    const pw = r.power;
    const drive = getDriveRequirements();
    const mount = readMountingPreferences();
    const withSfHint = en ? 'With service factor applied' : 'Con factor de servicio aplicado';
    const sizingHint = en ? '(T×ω)/η · sizing' : '(T×ω)/η · dimensionamiento';
    const torqueEyebrow = en ? `${LBL.designTorque} · head drum` : `${LBL.designTorque} · tambor cabeza`;
    const speedComboLabel = en ? 'Belt · drum speed' : 'Velocidad cinta / tambor';
    const mechLabel = en ? 'Mechanical details' : 'Detalles mecánicos';
    const drumRpmHint = en
      ? `${drive.drum_rpm.toFixed(2)} drum rpm`
      : `${drive.drum_rpm.toFixed(2)} rpm tambor`;
    const mechanicalSummary = en
      ? [
          `Head drum Ø${p.headDrumDiameter_m.toFixed(2)} m`,
          `belt ${p.beltWidth_mm.toFixed(0)} mm`,
          mount.machineShaftDiameter_mm != null ? `shaft ${mount.machineShaftDiameter_mm.toFixed(0)} mm` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : [
          `Tambor cabeza Ø${p.headDrumDiameter_m.toFixed(2)} m`,
          `banda ${p.beltWidth_mm.toFixed(0)} mm`,
          mount.machineShaftDiameter_mm != null ? `eje ${mount.machineShaftDiameter_mm.toFixed(0)} mm` : null,
        ]
          .filter(Boolean)
          .join(' · ');
    const vLine = `${p.beltSpeed_m_s.toFixed(2)} m/s · ${drive.drum_rpm.toFixed(2)} rpm`;
    res.innerHTML = `
      <div class="flat-kpi-row" role="group" aria-label="${LBL.resultsMain}">
        <article class="flat-kpi flat-kpi--torque">
          <span class="flat-kpi__eyebrow">${torqueEyebrow}</span>
          <p class="flat-kpi__value">${drive.torque_Nm.toFixed(0)}<span class="flat-kpi__unit">N·m</span></p>
          <p class="flat-kpi__hint">${withSfHint}</p>
        </article>
        <article class="flat-kpi flat-kpi--power">
          <span class="flat-kpi__eyebrow">${LBL.motorPower}</span>
          <p class="flat-kpi__value">${drive.power_kW.toFixed(3)}<span class="flat-kpi__unit">kW</span></p>
          <p class="flat-kpi__hint">${sizingHint}</p>
        </article>
        <article class="flat-kpi flat-kpi--speed">
          <span class="flat-kpi__eyebrow">${LBL.speed}</span>
          <p class="flat-kpi__value">${p.beltSpeed_m_s.toFixed(2)}<span class="flat-kpi__unit">m/s</span></p>
          <p class="flat-kpi__hint">${drumRpmHint}</p>
        </article>
      </div>
      <div class="result-focus-grid flat-kpi-secondary">
        <div class="metric"><div class="label">${LBL.serviceFactor}</div><div class="value">1.00</div></div>
        <div class="metric metric--text"><div class="label">${LBL.mountingType}</div><div class="value">${formatMounting(mount)}</div></div>
        <div class="metric metric--text"><div class="label">${speedComboLabel}</div><div class="value">${vLine}</div></div>
        <div class="metric metric--text"><div class="label">${mechLabel}</div><div class="value">${mechanicalSummary}</div></div>
      </div>
      <details class="motors-details result-focus-extra">
        <summary class="motors-details__summary">
          <span class="motors-details__summary-main">
            <span class="panel-icon">≡</span>
            <span class="motors-details__text">
              <span class="motors-details__title">Resultado completo</span>
              <span class="motors-details__hint">Potencias internas, tensión y chequeo centrífugo</span>
            </span>
          </span>
        </summary>
        <div class="motors-details__body">
          <div class="results-grid">
            <div class="metric"><div class="label">Potencia elevación pura <em>P</em>ₑ</div><div class="value">${pw.pureLift_kW.toFixed(3)} kW</div></div>
            <div class="metric"><div class="label">Potencia arrastre bota</div><div class="value">${pw.dragBoot_kW.toFixed(3)} kW</div></div>
            <div class="metric"><div class="label">${LBL.shaftPower} (reductor)</div><div class="value">${pw.shaft_kW.toFixed(3)} kW · ${pw.shaft_HP.toFixed(2)} HP</div></div>
            <div class="metric"><div class="label">Tensión trabajo / admisible</div><div class="value">${r.tension.working_N.toFixed(0)} / ${r.tension.admissible_N.toFixed(0)} N</div></div>
            <div class="metric"><div class="label">Uso tensión τ/τ<sub>adm</sub></div><div class="value">${(r.tension.ratio * 100).toFixed(1)} % · ${r.tension.ok ? 'OK' : 'revisar'}</div></div>
            <div class="metric"><div class="label">${en ? 'Centrifugal K = v\u00b2/(gR)' : 'K centr\u00edfugo = v\u00b2/(gR)'}</div><div class="value">${r.centrifugal.K.toFixed(2)}</div></div>
            <div class="metric"><div class="label">Paso cangilones (calc.)</div><div class="value">${r.pitch_mm.toFixed(0)} mm</div></div>
          </div>
        </div>
      </details>
    `;
  }

  const ver = document.getElementById('beVerdicts');
  if (ver) {
    const extraVerdicts = [];
    if (p.dischargeType === 'gravity' && p.beltSpeed_m_s > 1.0) {
      extraVerdicts.push({
        level: 'warn',
        text: en
          ? 'Gravity discharge selected with speed above 1.0 m/s: validate carry-over and fallback risk.'
          : 'Descarga por gravedad con velocidad mayor a 1.0 m/s: validar riesgo de arrastre y recirculación.',
      });
    }
    if (Number.isFinite(p.manualPitch_mm) && Math.abs(p.manualPitch_mm - r.pitch_mm) > 120) {
      extraVerdicts.push({
        level: 'warn',
        text: en
          ? `Manual bucket pitch (${p.manualPitch_mm.toFixed(0)} mm) differs significantly from indicative pitch (${r.pitch_mm.toFixed(0)} mm).`
          : `El paso manual (${p.manualPitch_mm.toFixed(0)} mm) difiere de forma significativa del paso orientativo (${r.pitch_mm.toFixed(0)} mm).`,
      });
    }
    ver.innerHTML = [...r.verdicts, ...extraVerdicts]
      .map(
        (v) =>
          `<p class="design-alert design-alert--${v.level === 'err' ? 'error' : v.level === 'warn' ? 'warn' : 'info'}">${esc(v.text)}</p>`,
      )
      .join('');
  }

  const disc = document.getElementById('beDisclaimer');
  if (disc) disc.textContent = r.disclaimer;

  const eng = document.getElementById('beEngineeringReport');
  if (eng) {
    const rEng = {
      drumRpm: getDriveRequirements().drum_rpm,
      torqueWithService_Nm: getDriveRequirements().torque_Nm,
      requiredMotorPower_kW: getDriveRequirements().power_kW,
      steps: r.steps || [],
      explanations: r.explanations || [],
    };
    eng.innerHTML = renderFullEngineeringAside(rEng, {
      lang,
      shaftLabel: en ? 'head drum' : 'tambor de cabeza',
      shaftOutLabel: en ? 'Gearbox output / drum' : 'Salida reductora / tambor',
      motorSubtitle: en
        ? 'Indicative reference for bucket elevators; validate with CEMA and your vendor.'
        : 'Referencia orientativa para elevador de cangilones; validar con CEMA y fabricante.',
    });
  }

  const asu = document.getElementById('beAssumptionsList');
  if (asu) {
    const extra = en
      ? ['This model does not replace belt/chain tension design or structural casing verification.']
      : ['Este modelo no sustituye el cálculo de tensión de banda/cadena ni la verificación estructural de la carcasa.'];
    asu.innerHTML = [...(r.assumptions || []), ...extra].map((a) => `<li>${esc(a)}</li>`).join('');
  }

  try {
    drawDiagramOnly();
  } catch (e) {
    console.error('Bucket elevator diagram:', e);
  }

  try {
    renderBeAsideKpi(r, p, getDriveRequirements(), lang);
  } catch (e) {
    console.error('Bucket elevator aside KPI:', e);
  }

  const mb = document.getElementById('beMotorBlock');
  if (mb) {
    try {
      mb.innerHTML = renderBrandRecommendationCards(getDriveRequirements(), recoCopyBucketElevator);
    } catch (err) {
      console.error(err);
      mb.innerHTML = en
        ? `<div class="motor-error"><strong>Gearmotors:</strong> ${String(err.message || err)}. Use an HTTP server if you opened this page as <code>file://</code>.</div>`
        : `<div class="motor-error"><strong>Motorreductores:</strong> ${String(err.message || err)}. Use servidor HTTP si abre en <code>file://</code>.</div>`;
    }
  }
  mountBePdfExport();
  applyMachinePremiumGates();
  foldAllMachineDetailsOncePerPageLoad();
}

function animLoop() {
  animPhase = (performance.now() / 14000) % 1;
  drawDiagramOnly();
  animId = requestAnimationFrame(animLoop);
}

function fillBucketSelect() {
  const sel = document.getElementById('beBucket');
  if (!(sel instanceof HTMLSelectElement)) return;
  const lang = getCurrentLang();
  const en = lang === 'en';
  const minWord = en ? 'min.' : 'm\u00edn.';
  const cur = sel.value;
  sel.innerHTML = BUCKET_CATALOG.map(
    (b) =>
      `<option value="${b.id}">${esc(displayBucketLabel(b, lang))} \u00b7 ${minWord} ${b.minBelt_mm} mm</option>`,
  ).join('');
  sel.value = BUCKET_CATALOG.some((b) => b.id === cur) ? cur : 'b2';
}

function panelVisibleForWizardStep(panelNum, step) {
  if (step === 1) return panelNum === 1;
  if (step === 2) return panelNum === 1 || panelNum === 2;
  return true;
}

function openBeAccordionByLabelKey(panelRoot, labelKey) {
  if (!(panelRoot instanceof HTMLElement)) return;
  panelRoot.querySelectorAll('details.flat-accordion').forEach((d) => {
    if (d instanceof HTMLDetailsElement) d.open = false;
  });
  const label = panelRoot.querySelector(`[data-i18n="${labelKey}"]`);
  const details = label?.closest('details.flat-accordion');
  if (details instanceof HTMLDetailsElement) details.open = true;
}

function setStep(n) {
  const step = Math.max(1, Math.min(3, n));
  document.querySelectorAll('[data-be-panel]').forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const panelNum = Number(el.getAttribute('data-be-panel'));
    el.hidden = !panelVisibleForWizardStep(panelNum, step);
  });
  document.querySelectorAll('[data-be-step]').forEach((btn) => {
    if (!(btn instanceof HTMLElement)) return;
    const b = Number(btn.getAttribute('data-be-step')) === step;
    btn.classList.toggle('be-wizard-nav__btn--active', b);
  });

  const panel1 = document.querySelector('[data-be-panel="1"]');
  if (step === 1) openBeAccordionByLabelKey(panel1, 'beAccGeom');
  if (step === 2) {
    openBeAccordionByLabelKey(panel1, 'beAccMat');
    const panel2 = document.querySelector('[data-be-panel="2"]');
    openBeAccordionByLabelKey(panel2, 'beAccSel');
  }
  if (step === 3) {
    openBeAccordionByLabelKey(panel1, 'beAccKin');
    const panel3 = document.querySelector('[data-be-panel="3"]');
    panel3?.querySelectorAll('details.flat-accordion').forEach((d, i) => {
      if (d instanceof HTMLDetailsElement) d.open = i === 0;
    });
  }

  if (step === 3) {
    if (!animId) animId = requestAnimationFrame(animLoop);
  } else {
    cancelAnimationFrame(animId);
    animId = 0;
    animPhase = 0;
    drawDiagramOnly();
  }
  computeAndRender();
}

fillBucketSelect();
injectMountingConfigSection();

document.getElementById('beOpenMotors')?.addEventListener('click', () => {
  openMotorsRecommendationsAndScroll('section-be-motores');
});

document.querySelectorAll('[data-be-step]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const n = Number(btn.getAttribute('data-be-step'));
    if (Number.isFinite(n)) setStep(n);
  });
});

const inputs = [
  'beRho',
  'beParticle',
  'beFluidity',
  'beNature',
  'beQ',
  'beH',
  'beC',
  'beDhead',
  'beDboot',
  'beBucket',
  'beVbelt',
  'bePitchManual',
  'beDischargeType',
  'beWidth',
  'beSigma',
  'beEta',
  'beKboot',
  'beEtaTrans',
];
const computeAndRender = wrapCalcRefresh(computeAndRenderCore);
inputs.forEach((id) => {
  document.getElementById(id)?.addEventListener('input', computeAndRender);
  document.getElementById(id)?.addEventListener('change', computeAndRender);
});

function onMountingHostInput(ev) {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  if (!MOUNTING_INPUT_IDS.includes(/** @type {string} */ (t.id))) return;
  computeAndRender();
}

document.getElementById('mountingConfigHost')?.addEventListener('input', onMountingHostInput);
document.getElementById('mountingConfigHost')?.addEventListener('change', onMountingHostInput);

try {
  initMotorVerification(document.getElementById('beVerifyPanel'), getDriveRequirements);
} catch (e) {
  console.error(e);
}

setStep(1);
applyBucketDocumentChrome();
bootMachineCalcView(computeAndRender);
computeAndRender.runPreview();
initInfoChipPopovers(document.body);

document.querySelector('main.app-main--be')?.addEventListener('click', (e) => {
  const t = e.target instanceof Element ? e.target.closest('[data-be-preset]') : null;
  if (!(t instanceof HTMLButtonElement)) return;
  const id = t.getAttribute('data-be-preset');
  if (id) applyBePresetFromId(id);
});

wireMachineRfqExport({
  getPayload: () => {
    const raw = buildParams();
    const lang = getCurrentLang();
    try {
      return { raw, result: computeBucketElevator(raw, lang), mount: readMountingPreferences() };
    } catch {
      const stub = {
        inputs: { rho: 0, H: 0, C: 0, Q: 0, D_head: 0, D_boot: 0, v: 0, V_L: 0, B: 0, sigma: 0, phi: 0, fluidity: '', nature: '' },
        fillFactor: 0,
        pitch_mm: 0,
        capacity_check_tph: 0,
        power: { pureLift_kW: 0, dragBoot_kW: 0, shaft_kW: 0, etaElev: 0, kBootDrag: 0, etaTransmission: 0 },
        tension: { working_N: 0, admissible_N: 0, ratio: 0, ok: false },
        centrifugal: { K: 0, drumDiameter_m: 0 },
        disclaimer: '',
      };
      return { raw, result: stub, mount: readMountingPreferences() };
    }
  },
  buildPlainText: buildBucketRfqPlainText,
  buildCsv: buildBucketRfqCsv,
  toastCopiedEn: MACHINE_HUB_UX_EN['machineHub.toastRfqCopied'],
  toastErrEn: MACHINE_HUB_UX_EN['machineHub.toastRfqErr'],
});

watchLangAndApply(BUCKET_PAGE_EN, {
  reloadOnEs: false,
  onEnApplied: () => {
    applyBucketDocumentChrome();
    initInfoChipPopovers(document.body);
    onBucketLangChanged();
  },
  onEsRestored: () => {
    applyBucketDocumentChrome();
    initInfoChipPopovers(document.body);
    onBucketLangChanged();
  },
});


