/**
 * Pagina extrusora de husillo  caudal, presion boquilla, potencia motor (Pro).
 */

import { isPremiumViaQueryProUiAllowed } from '../config/features.js';
import { isPremiumEffective } from '../services/accessTier.js';
import { buildRegisterUrlWithNextCheckout } from '../services/proCheckoutFlow.js';
import { computeExtruder, POLYMER_DATA } from '../modules/extruder.js';
import { LOAD_DUTY_OPTIONS, LOAD_DUTY_OPTIONS_EN } from '../modules/serviceFactorByDuty.js';
import { renderFullEngineeringAside } from './engineeringReport.js';
import { renderExtruderDiagram } from './diagramExtruder.js';
import { mountPremiumPdfExportBar, buildExtruderPdfPayload } from '../services/reportPdfExport.js';
import { getI18nLabels } from '../config/i18nLabels.js';
import { escapeCsvCell, wireMachineRfqExport } from './machineRfqExport.js';
import { bootMachineCalcView, wrapCalcRefresh } from './creditsPageBoot.js';
import { bindInputValidation, syncInputValidationResultsGate, renderMotorPowerRuler } from './labCalcUx.js';
import { EXTRUDER_VALIDATION } from './machineCalcInputValidation.js';
import { seedModuleEsFromDict, watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { MACHINE_HUB_UX_EN } from '../lab/i18n/pages/machineHubUxEn.js';
import { EXTRUDER_EN } from '../lab/i18n/pages/extruderEn.js';
import { EXTRUDER_ES } from '../lab/i18n/pages/extruderEs.js';
import { incrementCalcCounter } from '../services/calcCounter.js';
import { EXTRUDER_PRESET_BY_ID } from '../modules/machineHubPresets.js';
import { applyMachinePremiumGates } from './machinePremiumGates.js';
import { foldAllMachineDetailsOncePerPageLoad } from './machineDetailsFold.js';
import { initInfoChipPopovers } from './infoChipPopover.js';
import { getCurrentLang } from '../config/locales.js';

const EXT_PAGE_I18N_EN = { ...MACHINE_HUB_UX_EN, ...EXTRUDER_EN };
const EXT_DOC_TITLE_ES = 'Extrusora de husillo \u2014 TheMechAssist';

const WARN_COPY = Object.freeze({
  'danger:gamma_high': {
    es: 'Tasa de cizalla muy alta (\u03b3\u0307 &gt; 1000 s\u207b\u00b9): riesgo de degradaci\u00f3n t\u00e9rmica del pol\u00edmero.',
    en: 'Very high shear rate (\u03b3\u0307 &gt; 1000 s\u207b\u00b9): thermal degradation risk.',
    level: 'error',
  },
  'warn:gamma_elevated': {
    es: 'Cizalla elevada (\u03b3\u0307 &gt; 500 s\u207b\u00b9): revise temperatura o geometr\u00eda de boquilla.',
    en: 'Elevated shear (\u03b3\u0307 &gt; 500 s\u207b\u00b9): review temperature or die geometry.',
    level: 'warn',
  },
  'warn:pressure_high': {
    es: 'Contrapresi\u00f3n &gt; 300 bar: confirme l\u00edmites del extrusor y del material.',
    en: 'Back-pressure &gt; 300 bar: confirm extruder and material limits.',
    level: 'warn',
  },
  'danger:negative_flow': {
    es: 'Caudal neto nulo o negativo: la boquilla exige m\u00e1s caudal del que arrastra el husillo.',
    en: 'Zero or negative net throughput: die demands more flow than screw drag provides.',
    level: 'error',
  },
  'tip:shear_heating': {
    es: 'Calentamiento por cizalla estimado &gt; 30 K: controle temperatura de bandas.',
    en: 'Estimated shear heating &gt; 30 K: monitor barrel zone temperatures.',
    level: 'info',
  },
});

const extInputIds = [
  'extD',
  'extLD',
  'extH',
  'extPhi',
  'extN',
  'extTb',
  'extK',
  'extN_idx',
  'extRho',
  'extDieD',
  'extDieL',
  'extDieDi',
  'extServiceFactor',
  'extDailyHours',
];

const extSelectIds = ['extMaterial', 'extDieType', 'extLoadDuty'];

function applyExtruderDocumentChrome() {
  const en = getCurrentLang() === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
  document.title = en ? EXT_PAGE_I18N_EN['ext.docTitle'] : EXT_DOC_TITLE_ES;
}

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

function readInputs() {
  const premium = isPremiumEffective();
  const duty = /** @type {'uniform'|'moderate'|'heavy'|'custom'} */ (readSelect('extLoadDuty', 'moderate'));
  const dieType = /** @type {'circular'|'annular'} */ (readSelect('extDieType', 'circular'));
  return {
    D_mm: readNum('extD', 45),
    LD: readNum('extLD', 25),
    h_mm: readNum('extH', 3.5),
    phi_deg: readNum('extPhi', 17.7),
    N_rpm: readNum('extN', 60),
    Tb_C: readNum('extTb', 200),
    material: readSelect('extMaterial', 'hdpe'),
    K: readNum('extK', 7000),
    n_idx: readNum('extN_idx', 0.45),
    rho_melt: readNum('extRho', 760),
    die_type: dieType,
    die_D_mm: readNum('extDieD', 20),
    die_L_mm: readNum('extDieL', 80),
    die_Di_mm: dieType === 'annular' ? readNum('extDieDi', 10) : '',
    sf: premium ? readNum('extServiceFactor', 1.35) : readNum('extServiceFactor', 1.35),
    daily_hours: premium ? readNum('extDailyHours', 16) : 16,
    loadDuty: duty,
    proDriveActive: premium,
  };
}

function syncLoadDutyUi() {
  const dutyEl = document.getElementById('extLoadDuty');
  const sfIn = document.getElementById('extServiceFactor');
  if (!(dutyEl instanceof HTMLSelectElement) || !(sfIn instanceof HTMLInputElement)) return;
  const lang = getCurrentLang();
  const duty = dutyEl.value;
  const row = LOAD_DUTY_OPTIONS.find((o) => o.id === duty);
  if (duty === 'custom') {
    sfIn.readOnly = false;
    sfIn.classList.remove('input-synced');
  } else {
    sfIn.readOnly = true;
    sfIn.classList.add('input-synced');
    if (row && row.sf != null) sfIn.value = String(row.sf);
  }
  if (lang === 'en' && row) {
    const opt = dutyEl.querySelector(`option[value="${row.id}"]`);
    if (opt) opt.textContent = LOAD_DUTY_OPTIONS_EN[row.id].label;
  }
}

function syncMaterialUi() {
  const matEl = document.getElementById('extMaterial');
  const kEl = document.getElementById('extK');
  const nEl = document.getElementById('extN_idx');
  const rhoEl = document.getElementById('extRho');
  if (!(matEl instanceof HTMLSelectElement)) return;
  const val = matEl.value;
  const mat = POLYMER_DATA[val] ?? POLYMER_DATA.hdpe;
  if (kEl instanceof HTMLInputElement) kEl.value = String(mat.K);
  if (nEl instanceof HTMLInputElement) nEl.value = String(mat.n);
  if (rhoEl instanceof HTMLInputElement) rhoEl.value = String(mat.rho);
  const isCustom = val === 'custom';
  [kEl, nEl, rhoEl].forEach((el) => {
    if (el instanceof HTMLInputElement) el.readOnly = !isCustom;
  });
}

function syncDieTypeUi() {
  const dieType = readSelect('extDieType', 'circular');
  const row = document.getElementById('extDieDiRow');
  if (row instanceof HTMLElement) row.hidden = dieType !== 'annular';
}

function writeFormValue(id, val) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLSelectElement)) return;
  el.value = val === '' || val == null ? '' : String(val);
}

function applyExtruderPresetFromId(presetId) {
  const def = EXTRUDER_PRESET_BY_ID[presetId];
  if (!def) return;
  for (const [k, v] of Object.entries(def.values)) writeFormValue(k, v);
  syncMaterialUi();
  syncDieTypeUi();
  syncLoadDutyUi();
  refresh();
}

function patchProDriveTeaserCheckoutLink() {
  const t = document.getElementById('extProDriveTeaser');
  if (!t) return;
  const a = t.querySelector('a');
  if (!(a instanceof HTMLAnchorElement)) return;
  if (!isPremiumViaQueryProUiAllowed()) a.href = buildRegisterUrlWithNextCheckout();
}

function syncProDriveUi() {
  const wrap = document.getElementById('extProDriveWrap');
  const fields = document.getElementById('extProDriveFields');
  const teaser = document.getElementById('extProDriveTeaser');
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

function formatNum(x, d = 2) {
  if (!Number.isFinite(x)) return '\u2014';
  return x.toFixed(d);
}

function buildVerdict(r, en) {
  if (r.Q_net_kg_h <= 0) {
    return { level: 'error', text: en ? 'NO GO \u2014 zero net throughput' : 'NO APTO \u2014 caudal neto nulo' };
  }
  if (r.dP_die_bar >= 500) {
    return {
      level: 'error',
      text: en ? 'NO GO \u2014 die pressure very high' : 'NO APTO \u2014 presi\u00f3n de boquilla muy alta',
    };
  }
  if (r.dP_die_bar >= 300) {
    return {
      level: 'warn',
      text: en ? 'CAUTION \u2014 high back-pressure' : 'PRECAUCI\u00d3N \u2014 contrapresi\u00f3n elevada',
    };
  }
  if (!r.iter_converged) {
    return { level: 'warn', text: en ? 'Check inputs \u2014 flow iteration did not converge' : 'Revise entradas \u2014 iteraci\u00f3n sin converger' };
  }
  return { level: 'ok', text: en ? 'OK \u2014 indicative duty point' : 'OK \u2014 punto orientativo' };
}

function buildExtruderSteps(raw, r, en) {
  return [
    {
      title: en ? 'Drag flow channel width W' : 'Ancho canal W',
      formula: 'W = \u03c0D cos\u03c6 \u2212 e',
      substitution: `D=${formatNum(raw.D_mm, 1)} mm, \u03c6=${formatNum(raw.phi_deg, 1)}\u00b0`,
      value: r.W_m * 1000,
      unit: 'mm',
      meaning: en ? 'Effective channel width for drag flow.' : 'Ancho efectivo del canal de arrastre.',
    },
    {
      title: en ? 'Drag throughput Q_drag' : 'Caudal arrastre Q_drag',
      formula: 'Q_drag = \u00bd W h V_z F_D',
      substitution: `h=${formatNum(raw.h_mm, 2)} mm, N=${formatNum(raw.N_rpm, 0)} rpm`,
      value: r.Q_drag_kg_h,
      unit: 'kg/h',
      meaning: en ? 'Ideal drag flow before die back-flow.' : 'Caudal de arrastre antes del retorno por presi\u00f3n.',
    },
    {
      title: en ? 'Net throughput Q_net' : 'Caudal neto Q_net',
      formula: 'Q_net = Q_drag \u2212 Q_p (iterative)',
      substitution: en ? 'Power-law die + pressure flow in metering zone' : 'Boquilla Power-Law + flujo de presi\u00f3n',
      value: r.Q_net_kg_h,
      unit: 'kg/h',
      meaning: en ? 'Mass flow at die exit.' : 'Caudal m\u00e1sico en salida de boquilla.',
    },
    {
      title: en ? 'Die back-pressure \u0394P' : 'Contrapresi\u00f3n boquilla \u0394P',
      formula: en ? 'Laminar Power-Law in die land' : 'Power-Law laminar en canal boquilla',
      substitution: `L_die=${formatNum(raw.die_L_mm, 0)} mm, d=${formatNum(raw.die_D_mm, 1)} mm`,
      value: r.dP_die_bar,
      unit: 'bar',
      meaning: en ? 'Pressure drop across die land.' : 'Ca\u00edda de presi\u00f3n en la boquilla.',
    },
    {
      title: en ? 'Motor power (model)' : 'Potencia motor (modelo)',
      formula: 'P \u2248 \u03c0\u00b2 D\u00b2 L n \u03c4_s / h',
      substitution: `SF=${formatNum(r.serviceFactorUsed ?? raw.sf, 2)}`,
      value: r.P_design_kW,
      unit: 'kW',
      meaning: en ? 'Mechanical power with service factor.' : 'Potencia mec\u00e1nica con factor de servicio.',
    },
  ];
}

function buildExtruderRfqPlainText(raw, r, lang) {
  const en = lang === 'en';
  const when = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const head = en
    ? 'TheMechAssist \u2014 Single-screw extruder (indicative duty)'
    : 'TheMechAssist \u2014 Extrusora de husillo (punto orientativo)';
  return [
    head,
    `${en ? 'Timestamp (UTC)' : 'Fecha (UTC)'}: ${when}`,
    url ? `${en ? 'Source' : 'Origen'}: ${url}` : '',
    '',
    en ? '== Inputs ==' : '== Entradas ==',
    `D (mm): ${formatNum(raw.D_mm, 2)}, L/D: ${formatNum(raw.LD, 1)}`,
    `h (mm): ${formatNum(raw.h_mm, 2)}, \u03c6 (deg): ${formatNum(raw.phi_deg, 2)}`,
    `N (rpm): ${formatNum(raw.N_rpm, 1)}, T_b (\u00b0C): ${formatNum(raw.Tb_C, 1)}`,
    `Material: ${raw.material}, K: ${formatNum(raw.K, 0)}, n: ${formatNum(raw.n_idx, 3)}, \u03c1: ${formatNum(raw.rho_melt, 0)} kg/m\u00b3`,
    `Die: ${raw.die_type}, d=${formatNum(raw.die_D_mm, 1)} mm, L=${formatNum(raw.die_L_mm, 0)} mm`,
    raw.die_type === 'annular' ? `d_i=${formatNum(raw.die_Di_mm, 1)} mm` : '',
    `SF: ${formatNum(r.serviceFactorUsed ?? raw.sf, 3)}`,
    '',
    en ? '== Results ==' : '== Resultados ==',
    `Q_net (kg/h): ${formatNum(r.Q_net_kg_h, 2)}`,
    `\u0394P_die (bar): ${formatNum(r.dP_die_bar, 2)}`,
    `v_extrudate (mm/s): ${formatNum(r.v_extrudate_mms, 3)}`,
    `P_motor (kW): ${formatNum(r.P_design_kW, 3)}`,
    `P_IEC (kW): ${formatNum(r.P_iec_kW, 2)}`,
    `\u0394T_shear (K): ${formatNum(r.deltaT_K, 1)}`,
    en
      ? 'Disclaimer: drag-flow + Power-Law die model; validate with rheology and OEM data.'
      : 'Aviso: modelo arrastre + boquilla Power-Law; valide con reolog\u00eda y datos del fabricante.',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildExtruderRfqCsv(raw, r) {
  const headers = [
    'product',
    'generated_utc',
    'page_url',
    'D_mm',
    'LD',
    'h_mm',
    'phi_deg',
    'N_rpm',
    'Tb_C',
    'material',
    'K',
    'n_idx',
    'rho_kg_m3',
    'die_type',
    'die_D_mm',
    'die_L_mm',
    'die_Di_mm',
    'service_factor',
    'Q_net_kg_h',
    'dP_die_bar',
    'v_extrudate_mms',
    'P_design_kW',
    'P_iec_kW',
    'deltaT_K',
  ];
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const values = [
    'TheMechAssist_extruder',
    new Date().toISOString(),
    url,
    raw.D_mm,
    raw.LD,
    raw.h_mm,
    raw.phi_deg,
    raw.N_rpm,
    raw.Tb_C,
    raw.material,
    raw.K,
    raw.n_idx,
    raw.rho_melt,
    raw.die_type,
    raw.die_D_mm,
    raw.die_L_mm,
    raw.die_Di_mm || '',
    r.serviceFactorUsed ?? raw.sf,
    r.Q_net_kg_h,
    r.dP_die_bar,
    r.v_extrudate_mms,
    r.P_design_kW,
    r.P_iec_kW,
    r.deltaT_K,
  ];
  return `${headers.map(escapeCsvCell).join(',')}\n${values.map(escapeCsvCell).join(',')}`;
}

function refreshCore() {
  const LBL = getI18nLabels();
  const lang = getCurrentLang();
  const en = lang === 'en';
  const resultsEl = document.getElementById('extResultsGrid');
  if (syncInputValidationResultsGate(resultsEl)) return;

  try {
    const raw = readInputs();
    const params = {
      D_mm: raw.D_mm,
      LD: raw.LD,
      h_mm: raw.h_mm,
      phi_deg: raw.phi_deg,
      N_rpm: raw.N_rpm,
      K: raw.K,
      n_idx: raw.n_idx,
      rho_melt: raw.rho_melt,
      die_D_mm: raw.die_D_mm,
      die_L_mm: raw.die_L_mm,
      die_Di_mm: raw.die_Di_mm,
      die_type: raw.die_type,
      sf: raw.sf,
      daily_hours: raw.daily_hours,
    };
    const r = computeExtruder(params);
    if (Number.isFinite(r.Q_net_kg_h)) incrementCalcCounter();

    const verdict = buildVerdict(r, en);
    const premium = isPremiumEffective();

    renderExtruderDiagram('extDiagram', { ...raw, LD: raw.LD, Tb_C: raw.Tb_C, N_rpm: raw.N_rpm }, r);

    const alertsEl = document.getElementById('extDesignAlerts');
    if (alertsEl) {
      const alerts = (r.warnings || []).map((key) => {
        const copy = WARN_COPY[key] || { es: key, en: key, level: 'warn' };
        return { level: copy.level, text: en ? copy.en : copy.es };
      });
      alertsEl.innerHTML = alerts
        .map((a) => `<p class="design-alert design-alert--${a.level}">${a.text}</p>`)
        .join('');
    }

    if (resultsEl) {
      const proPowerBlock = premium
        ? `
      <article class="flat-kpi flat-kpi--power">
        <span class="flat-kpi__eyebrow">${en ? 'IEC motor power' : 'Potencia motor IEC'}</span>
        <p class="flat-kpi__value">${formatNum(r.P_iec_kW, 2)}<span class="flat-kpi__unit">kW</span></p>
        <p class="flat-kpi__hint">${en ? 'Class' : 'Clase'} ${r.ie_class} \u00b7 P=${formatNum(r.P_design_kW, 2)} kW</p>
      </article>`
        : '';

      resultsEl.innerHTML = `
    <div class="design-alert design-alert--${verdict.level}" role="status">${escHtml(verdict.text)}</div>
    <div class="flat-kpi-row" role="group" aria-label="${LBL.resultsMain}">
      <article class="flat-kpi flat-kpi--speed">
        <span class="flat-kpi__eyebrow">${en ? 'Net throughput' : 'Caudal neto'}</span>
        <p class="flat-kpi__value">${formatNum(r.Q_net_kg_h, 1)}<span class="flat-kpi__unit">kg/h</span></p>
        <p class="flat-kpi__hint">${en ? 'Drag' : 'Arrastre'} ${formatNum(r.Q_drag_kg_h, 1)} kg/h</p>
      </article>
      <article class="flat-kpi flat-kpi--torque">
        <span class="flat-kpi__eyebrow">${en ? 'Die back-pressure' : 'Contrapresi\u00f3n boquilla'}</span>
        <p class="flat-kpi__value">${formatNum(r.dP_die_bar, 1)}<span class="flat-kpi__unit">bar</span></p>
        <p class="flat-kpi__hint">\u03b3\u0307 \u2248 ${formatNum(r.gamma_app_s, 0)} s\u207b\u00b9</p>
      </article>
      <article class="flat-kpi flat-kpi--power">
        <span class="flat-kpi__eyebrow">${en ? 'Extrudate speed' : 'Velocidad extruido'}</span>
        <p class="flat-kpi__value">${formatNum(r.v_extrudate_mms, 2)}<span class="flat-kpi__unit">mm/s</span></p>
        <p class="flat-kpi__hint">N=${formatNum(raw.N_rpm, 0)} rpm</p>
      </article>
      ${proPowerBlock}
    </div>
    <div class="result-focus-grid flat-kpi-secondary">
      <div class="metric"><div class="label">${en ? 'Shear heating \u0394T' : 'Calent. cizalla \u0394T'}</div><div class="value">${premium ? `${formatNum(r.deltaT_K, 1)} K` : 'Pro'}</div></div>
      <div class="metric"><div class="label">${LBL.serviceFactor}</div><div class="value">${formatNum(r.serviceFactorUsed ?? raw.sf, 3)}</div></div>
      <div class="metric"><div class="label">${en ? 'Wall shear stress' : 'Tensi\u00f3n pared'}</div><div class="value">${formatNum(r.tau_w_Pa / 1e6, 2)} MPa</div></div>
      <div class="metric"><div class="label">${en ? 'Converged' : 'Convergencia'}</div><div class="value">${r.iter_converged ? (en ? 'Yes' : 'S\u00ed') : (en ? 'No' : 'No')}</div></div>
    </div>`;
    }

    const rulerMount = document.getElementById('extMotorRulerMount');
    if (rulerMount) {
      if (premium && r.P_iec_kW > 0) {
        rulerMount.hidden = false;
        rulerMount.innerHTML = renderMotorPowerRuler(r.P_iec_kW);
      } else {
        rulerMount.hidden = true;
        rulerMount.innerHTML = '';
      }
    }

    const engEl = document.getElementById('extEngineeringReport');
    if (engEl) {
      const engR = {
        ...r,
        steps: buildExtruderSteps(raw, r, en),
        explanations: en
          ? [
              'Isothermal metering-zone drag-flow model with uniform channel depth.',
              'Die treated as straight circular or annular land with Power-Law fluid.',
            ]
          : [
              'Modelo isotermo de arrastre en zona de dosificaci\u00f3n con profundidad uniforme.',
              'Boquilla como canal recto circular o anular con fluido Power-Law.',
            ],
      };
      engEl.innerHTML = renderFullEngineeringAside(engR, {
        lang,
        shaftLabel: en ? 'screw' : 'husillo',
        shaftOutLabel: en ? 'Motor / screw shaft' : 'Motor / eje husillo',
        motorSubtitle: en
          ? 'Direct screw drive reference; adjust if a gearbox is used.'
          : 'Referencia acoplamiento directo al husillo; ajuste si hay reductor.',
      });
    }

    const assumptionsEl = document.getElementById('extAssumptionsList');
    if (assumptionsEl) {
      const items = en
        ? [
            'Single-screw, fully molten polymer in metering zone.',
            'Channel depth h and width W constant in metering section.',
            'Barrel temperature uniform; no detailed heat transfer balance.',
            'Die land only; no calibrator or downstream draw-down.',
            'Power-Law rheology; K and n from table or custom inputs.',
          ]
        : [
            'Extrusora monohusillo; pol\u00edmero completamente fundido en dosificaci\u00f3n.',
            'Profundidad h y ancho W constantes en zona de dosificaci\u00f3n.',
            'Temperatura de cilindro uniforme; sin balance t\u00e9rmico detallado.',
            'Solo canal de boquilla; sin calibrador ni estirado posterior.',
            'Reolog\u00eda Power-Law; K y n de tabla o entradas personalizadas.',
          ];
      assumptionsEl.innerHTML = items.map((a) => `<li>${escHtml(a)}</li>`).join('');
    }

    const pdfMount = document.getElementById('premiumPdfExportMount');
    if (pdfMount) {
      mountPremiumPdfExportBar(pdfMount, {
        getPayload: () => buildExtruderPdfPayload(raw, r),
        getDiagramElement: () => document.getElementById('extDiagram'),
        diagramTitle: en ? 'Extruder schematic' : 'Esquema extrusora',
      });
    }

    applyMachinePremiumGates();
    syncProDriveUi();
    foldAllMachineDetailsOncePerPageLoad();
  } catch (err) {
    console.error(err);
    const box = document.getElementById('runtimeError');
    if (box) {
      box.hidden = false;
      box.textContent = en
        ? `Calculation error: ${String(err.message || err)}`
        : `Error al calcular: ${String(err.message || err)}`;
    }
  }
}

const refresh = wrapCalcRefresh(refreshCore);

extInputIds.forEach((id) => {
  document.getElementById(id)?.addEventListener('input', refresh);
  document.getElementById(id)?.addEventListener('change', refresh);
});

extSelectIds.forEach((id) => {
  document.getElementById(id)?.addEventListener('change', () => {
    if (id === 'extMaterial') syncMaterialUi();
    if (id === 'extDieType') syncDieTypeUi();
    if (id === 'extLoadDuty') syncLoadDutyUi();
    refresh();
  });
});

document.getElementById('btnExtCalc')?.addEventListener('click', refresh);

document.querySelector('.flat-sidebar')?.addEventListener('click', (e) => {
  const t = e.target instanceof Element ? e.target.closest('[data-ext-preset]') : null;
  if (!(t instanceof HTMLButtonElement)) return;
  const id = t.getAttribute('data-ext-preset');
  if (id) applyExtruderPresetFromId(id);
});

wireMachineRfqExport({
  textButtonId: 'extRfqCopyText',
  csvButtonId: 'extRfqCopyCsv',
  getPayload: () => {
    const raw = readInputs();
    const r = computeExtruder({
      D_mm: raw.D_mm,
      LD: raw.LD,
      h_mm: raw.h_mm,
      phi_deg: raw.phi_deg,
      N_rpm: raw.N_rpm,
      K: raw.K,
      n_idx: raw.n_idx,
      rho_melt: raw.rho_melt,
      die_D_mm: raw.die_D_mm,
      die_L_mm: raw.die_L_mm,
      die_Di_mm: raw.die_Di_mm,
      die_type: raw.die_type,
      sf: raw.sf,
      daily_hours: raw.daily_hours,
    });
    return { raw, result: r, mount: {} };
  },
  buildPlainText: (raw, r, _mount, lang) => buildExtruderRfqPlainText(raw, r, lang),
  buildCsv: (raw, r) => buildExtruderRfqCsv(raw, r),
  toastCopiedEn: MACHINE_HUB_UX_EN['machineHub.toastRfqCopied'],
  toastErrEn: MACHINE_HUB_UX_EN['machineHub.toastRfqErr'],
});

syncMaterialUi();
syncDieTypeUi();
syncLoadDutyUi();
syncProDriveUi();
patchProDriveTeaserCheckoutLink();
applyExtruderDocumentChrome();
initInfoChipPopovers(document.body);
bindInputValidation(EXTRUDER_VALIDATION);
bootMachineCalcView(refresh);

seedModuleEsFromDict(EXTRUDER_ES);

watchLangAndApply(EXT_PAGE_I18N_EN, {
  reloadOnEs: false,
  onEnApplied: () => {
    applyExtruderDocumentChrome();
    patchProDriveTeaserCheckoutLink();
    syncLoadDutyUi();
    initInfoChipPopovers(document.body);
    refresh();
  },
  onEsRestored: () => {
    applyExtruderDocumentChrome();
    patchProDriveTeaserCheckoutLink();
    syncLoadDutyUi();
    initInfoChipPopovers(document.body);
    refresh();
  },
});

refresh();
