import {
  bindInputValidation,
  mountLabPresetsBar,
  revalidateAllBoundInputs,
  syncInputValidationResultsGate,
} from './labCalcUx.js';
import { wrapCalcRefresh } from './creditsPageBoot.js';
import { mountCompactLabFieldHelp, refreshCompactLabFieldHelp } from './labHelpCompact.js';
import { readLabNumber } from '../utils/labInputParse.js';
import { mountLabFluidPdfExportBar } from '../services/fluidLabPdfExport.js';
import { formatDateTimeLocale, getCurrentLang } from '../config/locales.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { HYDRAULIC_PRESS_EN } from '../lab/i18n/pages/hydraulicPressEn.js';
import { FLUIDS_HUB_UX_EN } from '../lab/i18n/pages/fluidsHubUxEn.js';
const PRESS_PAGE_I18N = { ...HYDRAULIC_PRESS_EN, ...FLUIDS_HUB_UX_EN };

function applyHydraulicPressDocumentChrome() {
  const en = getCurrentLang() === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
}

const HPP_PRESETS = [
  {
    label: '120 t · conformado',
    labelKey: 'hpress.preset1',
    values: {
      hppMode: 'design',
      hppLabTier: 'basic',
      hppForceTon: 120,
      hppPressureBar: 210,
      hppStrokeMm: 450,
      hppCycleS: 12,
      hppApproachFactor: 2.5,
      hppPumpFlowLmin: 120,
      hppColumns: '4',
      hppSteelMpa: 160,
    },
  },
  {
    label: '50 t · carrera corta',
    labelKey: 'hpress.preset2',
    values: {
      hppMode: 'design',
      hppLabTier: 'basic',
      hppForceTon: 50,
      hppPressureBar: 180,
      hppStrokeMm: 220,
      hppCycleS: 8,
      hppApproachFactor: 2,
      hppPumpFlowLmin: 75,
      hppColumns: '2',
      hppSteelMpa: 160,
    },
  },
  {
    label: 'Diagnóstico · instalada',
    labelKey: 'hpress.preset3',
    values: {
      hppMode: 'diagnostic',
      hppLabTier: 'basic',
      hppPressureBar: 200,
      hppDiagPistonMm: 250,
      hppDiagColumnMm: 110,
      hppStrokeMm: 400,
      hppCycleS: 10,
      hppPumpFlowLmin: 100,
      hppColumns: '4',
    },
  },
];

function pressLang() {
  return getCurrentLang() === 'en';
}

/** @param {string} es @param {string} enStr */
function pressLbl(es, enStr) {
  return pressLang() ? enStr : es;
}

const G = 9.81;
const PI = Math.PI;
const ISO_PISTON_MM = [40, 50, 63, 80, 100, 125, 160, 200, 250, 320, 400];
const ETA_DIAG = 0.92;
/** Plato móvil a fracción de carrera (0 = junto al cilindro, 1 = cerca de mesa) — posición intermedia representativa */
const PLATEN_STROKE_RATIO = 0.44;

/** @type {object | null} */
let pressPdfSnapshot = null;

function fmt(n, d = 2) {
  return Number.isFinite(n) ? n.toFixed(d) : '--';
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

function nearestIsoAtOrAbove(mm) {
  for (let i = 0; i < ISO_PISTON_MM.length; i += 1) {
    if (ISO_PISTON_MM[i] >= mm) return ISO_PISTON_MM[i];
  }
  return ISO_PISTON_MM[ISO_PISTON_MM.length - 1];
}

/**
 * @param {SVGElement | null} svg
 * @param {number} pistonMm
 * @param {number} forceTon
 * @param {2|4} nCols
 */
function renderPressDiagram(svg, pistonMm, forceTon, nCols) {
  if (!(svg instanceof SVGSVGElement)) return;
  const cylW = Math.max(34, Math.min(70, pistonMm * 0.16));
  const cx = 380;
  const yBeam = 38;
  const beamH = 20;
  const yColTop = 58;
  const yTable = 226;
  const colH = yTable - yColTop;
  const colW = 12;
  const yCyl = 58;
  const cylH = 52;
  const yCylBottom = yCyl + cylH;
  const platenH = 20;
  const yTableInner = yTable - 6;
  const yPlaten = yCylBottom + PLATEN_STROKE_RATIO * Math.max(8, yTableInner - platenH - yCylBottom - 4);
  const rodW = 24;
  const rodTop = yCyl + cylH - 4;
  const rodH = Math.max(12, yPlaten - rodTop);

  const colXs = nCols === 2 ? [cx - 205, cx + 205 - colW] : [164, 236, 512, 584];
  const colRects = colXs
    .map((x) => `<rect x="${x}" y="${yColTop}" width="${colW}" height="${colH}" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1"/>`)
    .join('');

  const en = pressLang();
  const titleDiag = nCols === 2
    ? en
      ? '2-column hydraulic press \u2014 functional view'
      : 'Prensa hidr\u00e1ulica de 2 columnas \u2014 vista funcional'
    : en
      ? '4-column hydraulic press \u2014 functional view'
      : 'Prensa hidr\u00e1ulica de 4 columnas \u2014 vista funcional';
  const lblCols = nCols === 2
    ? en
      ? 'Columns (sides)'
      : 'Columnas (laterales)'
    : en
      ? 'Columns'
      : 'Columnas';

  svg.setAttribute('viewBox', '0 0 760 300');
  svg.innerHTML = `
    <defs>
      <marker id="hppArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#0d9488"/>
      </marker>
    </defs>
    <rect width="760" height="300" fill="#f4f7fb"/>
    <text x="24" y="26" font-size="12" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">${titleDiag}</text>

    <rect x="125" y="${yBeam}" width="510" height="${beamH}" rx="5" fill="#e8eef5" stroke="#94a3b8" stroke-width="1.2"/>
    <rect x="102" y="${yTable}" width="556" height="24" rx="5" fill="#e8eef5" stroke="#94a3b8" stroke-width="1.2"/>
    ${colRects}
    <rect x="${cx - cylW / 2}" y="${yCyl}" width="${cylW}" height="${cylH}" rx="8" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.25"/>
    <rect x="${cx - rodW / 2}" y="${rodTop}" width="${rodW}" height="${rodH}" rx="4" fill="#d4d4d8" stroke="#64748b" stroke-width="1.1"/>
    <rect x="244" y="${yPlaten}" width="272" height="${platenH}" rx="4" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.25"/>
    <rect x="292" y="${yPlaten + platenH + 8}" width="176" height="18" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-dasharray="5 4"/>
    <text x="380" y="${yPlaten + platenH + 20}" class="fluid-svg-lbl" font-size="9" fill="#475569" font-family="Inter,system-ui,sans-serif" text-anchor="middle">${en ? 'Pressing zone' : 'Zona de prensado'}</text>
    <path d="M${cx} ${yCyl + 22} L${cx} ${yPlaten - 2}" stroke="#0d9488" stroke-width="2.6" marker-end="url(#hppArrow)"/>

    <g font-family="Inter,system-ui,sans-serif">
      <text x="556" y="88" class="fluid-svg-lbl" font-size="9.5" font-weight="700" fill="#0369a1">${en ? 'Applied pressure' : 'Presi\u00f3n aplicada'}</text>
      <text x="556" y="104" class="fluid-svg-lbl" font-size="9.5" fill="#334155">F \u2248 ${fmt(forceTon, 1)} t</text>
      <text x="556" y="126" class="fluid-svg-lbl" font-size="9" fill="#475569">${en ? 'Cylinder \u00b7 rod \u00b7 platen' : 'Cilindro \u00b7 v\u00e1stago \u00b7 plato'}</text>
      <text x="556" y="142" class="fluid-svg-lbl" font-size="9" fill="#475569">${en ? 'Fixed table (reference)' : 'Mesa fija (referencia)'}</text>
      <text x="556" y="160" class="fluid-svg-lbl" font-size="8.8" fill="#64748b">${lblCols}</text>
    </g>
  `;
}

function syncLabTierUi() {
  const tier = document.getElementById('hppLabTier') instanceof HTMLSelectElement
    ? document.getElementById('hppLabTier').value
    : 'basic';
  const panel = document.getElementById('hppProjectPanel');
  if (panel instanceof HTMLElement) panel.hidden = tier !== 'project';
}

function productivityBadgeHtml(cycleS) {
  const cph = 3600 / Math.max(0.01, cycleS);
  let cls = 'hpp-prod-badge--low';
  const en = pressLang();
  let label = en ? 'Low productivity' : 'Baja productividad';
  if (cph > 30) {
    cls = 'hpp-prod-badge--high';
    label = en ? 'High productivity' : 'Alta productividad';
  } else if (cph >= 10) {
    cls = 'hpp-prod-badge--mid';
    label = en ? 'Medium productivity' : 'Media productividad';
  }
  const cyclesText = en
    ? `\u2248 ${fmt(cph, 1)} cycles/h (cycle time ${fmt(cycleS, 1)} s)`
    : `\u2248 ${fmt(cph, 1)} ciclos/h (seg\u00fan tiempo de ciclo ${fmt(cycleS, 1)} s)`;
  return `
    <div class="hpp-prod-row">
      <span class="hpp-prod-badge ${cls}">${label}</span>
      <span class="hpp-prod-text">${cyclesText}</span>
    </div>
  `;
}

function buildPressAlerts(en, ctx) {
  const {
    pBar, mode, labTier, fsEulerCol, fmt, userColMm, colDiaSafeMm, nCols,
    pumpFlowLmin, qReqLmin, tApproach, motorKwFromPump, motorKw, cycleRealS,
    tonReal, diagColMm, maxTonByCols,
  } = ctx;
  const alerts = [];
  const wrap = (cls, title, body) =>
    `<div class="lab-alert lab-alert--${cls}"><div class="lab-alert__body"><strong>${title}</strong> ${body}</div></div>`;

  if (pBar > 350) {
    alerts.push(
      wrap(
        'danger',
        en ? 'Extreme pressure:' : 'Presi\u00f3n extrema:',
        en
          ? 'Requires high-end components and special seals. Consider increasing piston bore to work at standard pressures (210\u2013250 bar).'
          : 'Requiere componentes de alta gama y sellos especiales. Considere aumentar el di\u00e1metro del pist\u00f3n para trabajar a presiones est\u00e1ndar (210\u2013250 bar).',
      ),
    );
  }
  if (mode === 'diagnostic' && pBar > 250) {
    alerts.push(
      wrap(
        'danger',
        en ? 'Warning:' : 'Peligro:',
        en
          ? 'exceeding design pressure. Risk of column fatigue or seal failure.'
          : 'est\u00e1 superando la presi\u00f3n de dise\u00f1o. Riesgo de fatiga en columnas o rotura de sellos.',
      ),
    );
  }
  if (labTier === 'project' && Number.isFinite(fsEulerCol) && fsEulerCol < 2) {
    alerts.push(
      wrap(
        'danger',
        en ? 'Column buckling:' : 'Pandeo columnas:',
        en
          ? `Euler FS ${fmt(fsEulerCol, 2)} &lt; 2. Increase diameter, bracing or reduce L/K.`
          : `FS Euler ${fmt(fsEulerCol, 2)} &lt; 2. Aumente di\u00e1metro, arriostre o reduzca L/K.`,
      ),
    );
  }
  if (Number.isFinite(userColMm)) {
    if (userColMm + 0.01 >= colDiaSafeMm) {
      alerts.push(
        wrap(
          'info',
          en ? 'Available column:' : 'Columna disponible:',
          en
            ? `\u00d8 ${fmt(userColMm, 1)} mm \u2265 indicative minimum ${fmt(colDiaSafeMm, 1)} mm (axial stress \u00d71.2).`
            : `\u00d8 ${fmt(userColMm, 1)} mm \u2265 m\u00ednimo orientativo ${fmt(colDiaSafeMm, 1)} mm (tensi\u00f3n axial \u00d71,2).`,
        ),
      );
    } else {
      alerts.push(
        wrap(
          'warn',
          en ? 'Available column:' : 'Columna disponible:',
          en
            ? `\u00d8 ${fmt(userColMm, 1)} mm is below indicative minimum ${fmt(colDiaSafeMm, 1)} mm for load split across ${nCols} columns.`
            : `\u00d8 ${fmt(userColMm, 1)} mm es inferior al m\u00ednimo orientativo ${fmt(colDiaSafeMm, 1)} mm para la carga repartida en ${nCols} columnas.`,
        ),
      );
    }
  }
  if (pumpFlowLmin < qReqLmin) {
    alerts.push(
      wrap(
        'warn',
        en ? 'Optimization:' : 'Optimizaci\u00f3n:',
        en
          ? `To lower the platen in ${fmt(tApproach, 1)} s, current pump flow is insufficient. You need ${fmt(qReqLmin, 1)} L/min.`
          : `Para bajar el plato en ${fmt(tApproach, 1)} s, su bomba actual es insuficiente. Necesita un caudal de ${fmt(qReqLmin, 1)} L/min.`,
      ),
    );
  }
  if (motorKwFromPump < motorKw) {
    alerts.push(
      wrap(
        'danger',
        en ? 'Power warning:' : 'Advertencia de potencia:',
        en
          ? `To meet your cycle-time target you need ${fmt(motorKw, 2)} kW. With ${fmt(motorKwFromPump, 2)} kW available (from current flow), cycle time will rise to ${fmt(cycleRealS, 2)} s.`
          : `Para cumplir su objetivo de tiempo de ciclo necesita ${fmt(motorKw, 2)} kW. Con una potencia disponible de ${fmt(motorKwFromPump, 2)} kW (equivalente al caudal actual), el tiempo de ciclo aumentar\u00e1 a ${fmt(cycleRealS, 2)} s.`,
      ),
    );
  }
  alerts.push(
    wrap(
      'info',
      en ? 'Safety:' : 'Seguridad:',
      en
        ? `At ${fmt(tonReal, 1)} tonnes, columns need a minimum diameter of ${fmt(colDiaSafeMm, 1)} mm to limit elastic deformation (axial stress).`
        : `Con ${fmt(tonReal, 1)} toneladas, las columnas deben tener un di\u00e1metro m\u00ednimo de ${fmt(colDiaSafeMm, 1)} mm para evitar deformaci\u00f3n el\u00e1stica (tensi\u00f3n axial).`,
    ),
  );
  if (mode === 'diagnostic') {
    alerts.push(
      wrap(
        'info',
        en ? 'Structural verdict:' : 'Veredicto estructural:',
        en
          ? `your ${fmt(diagColMm, 1)} mm columns support up to ${fmt(maxTonByCols, 1)} tonnes before yielding (axial).`
          : `sus columnas de ${fmt(diagColMm, 1)} mm soportan un m\u00e1ximo de ${fmt(maxTonByCols, 1)} toneladas antes de deformarse (axial).`,
      ),
    );
  }
  return alerts;
}

function updateApproachNote(strokeMm, cycleS, approachFactor) {
  const el = document.getElementById('hppApproachDynamicNote');
  if (!(el instanceof HTMLElement)) return;
  const tWork = cycleS * 0.55;
  const vWork = (strokeMm / 1000) / Math.max(0.1, tWork);
  const denom = vWork * approachFactor;
  const tEst = denom > 0 ? (strokeMm / 1000) / denom : NaN;
  const en = pressLang();
  el.textContent = Number.isFinite(tEst)
    ? en
      ? `With factor ${fmt(approachFactor, 2)}, the platen descends ${fmt(approachFactor, 2)}\u00d7 faster in idle than under load. Estimated approach time: ${fmt(tEst, 2)} s.`
      : `Con factor ${fmt(approachFactor, 2)}, el plato baja ${fmt(approachFactor, 2)} veces m\u00e1s r\u00e1pido en vac\u00edo que bajo carga. Tiempo estimado de aproximaci\u00f3n: ${fmt(tEst, 2)} s.`
    : '';
}

function updatePressDiagramTitle(nCols) {
  const en = pressLang();
  const diagTitle = document.getElementById('hppDiagramTitle');
  if (!diagTitle) return;
  diagTitle.textContent =
    nCols === 2
      ? en
        ? '2-column hydraulic press (functional schematic)'
        : 'Prensa hidráulica de 2 columnas (esquema funcional)'
      : en
        ? '4-column hydraulic press (functional schematic)'
        : 'Prensa hidráulica de 4 columnas (esquema funcional)';
}

function computeAndRenderCore() {
  const en = pressLang();
  const mode = document.getElementById('hppMode') instanceof HTMLSelectElement
    ? document.getElementById('hppMode').value
    : 'design';
  const labTier = document.getElementById('hppLabTier') instanceof HTMLSelectElement
    ? document.getElementById('hppLabTier').value
    : 'basic';

  const colsEl = document.getElementById('hppColumns');
  const nColsRaw = colsEl instanceof HTMLSelectElement ? Number(colsEl.value) : 4;
  const nCols = nColsRaw === 2 ? 2 : 4;
  const forceParsed = parseFloat(String(document.getElementById('hppForceTon')?.value || '120').replace(',', '.'));
  const forceTonPreview = Number.isFinite(forceParsed) && forceParsed > 0 ? forceParsed : 120;
  const pistonPreview =
    mode === 'diagnostic'
      ? parseFloat(String(document.getElementById('hppDiagPistonMm')?.value || '250').replace(',', '.')) || 250
      : 250;
  updatePressDiagramTitle(nCols);
  renderPressDiagram(document.getElementById('hpPressDiagram'), pistonPreview, forceTonPreview, nCols);

  if (syncInputValidationResultsGate(document.getElementById('hppResults'))) return;

  const results = document.getElementById('hppResults');
  const advisor = document.getElementById('hppAdvisor');
  const verdict = document.getElementById('hppVerdict');
  const formulaBody = document.getElementById('hppFormulaBody');
  if (!(results instanceof HTMLElement) || !(advisor instanceof HTMLElement) || !(verdict instanceof HTMLElement)) return;

  pressPdfSnapshot = { valid: false };

  const errors = [];
  const need = (r) => {
    if (!r.ok) errors.push(r.error);
    return r.ok ? r.value : NaN;
  };

  const forceTon = need(readLabNumber('hppForceTon', 1, undefined, pressLbl('Fuerza de prensado (t)', 'Pressing force (t)')));
  const pBar = need(readLabNumber('hppPressureBar', 50, undefined, pressLbl('Presi\u00f3n m\u00e1xima (bar)', 'Maximum pressure (bar)')));
  const strokeMm = need(readLabNumber('hppStrokeMm', 20, undefined, pressLbl('Carrera (mm)', 'Stroke (mm)')));
  const cycleS = need(readLabNumber('hppCycleS', 1, undefined, pressLbl('Tiempo de ciclo (s)', 'Cycle time (s)')));
  const approachFactor = need(readLabNumber('hppApproachFactor', 1, 6, pressLbl('Factor velocidad aproximaci\u00f3n', 'Approach speed factor')));
  const pumpFlowLmin = need(readLabNumber('hppPumpFlowLmin', 1, undefined, pressLbl('Caudal de bomba (L/min)', 'Pump flow (L/min)')));
  const sigmaAllowMpa = need(readLabNumber('hppSteelMpa', 80, undefined, pressLbl('Tensi\u00f3n admisible columna (MPa)', 'Allowable column stress (MPa)')));

  let nColsValid = nCols;
  const nColsRawValidate = colsEl instanceof HTMLSelectElement ? Number(colsEl.value) : NaN;
  if (nColsRawValidate === 2 || nColsRawValidate === 4) nColsValid = nColsRawValidate;
  else errors.push(pressLbl('N\u00famero de columnas: valor no v\u00e1lido.', 'Number of columns: invalid value.'));

  const userColEl = document.getElementById('hppUserColumnMm');
  let userColMm = NaN;
  if (userColEl instanceof HTMLInputElement && String(userColEl.value).trim() !== '') {
    const ru = readLabNumber('hppUserColumnMm', 20, 2000, pressLbl('Di\u00e1metro de columna disponible (mm)', 'Available column diameter (mm)'));
    if (!ru.ok) errors.push(ru.error);
    else userColMm = ru.value;
  }

  let diagPistonMm = 250;
  let diagColMm = 110;
  if (mode === 'diagnostic') {
    const dp = readLabNumber('hppDiagPistonMm', 20, undefined, pressLbl('Di\u00e1metro pist\u00f3n existente (mm)', 'Existing piston diameter (mm)'));
    const dc = readLabNumber('hppDiagColumnMm', 20, undefined, pressLbl('Di\u00e1metro real de columnas (mm)', 'Actual column diameter (mm)'));
    if (!dp.ok) errors.push(dp.error);
    else diagPistonMm = dp.value;
    if (!dc.ok) errors.push(dc.error);
    else diagColMm = dc.value;
  }

  let colLengthMm = 2200;
  let colK = 0.7;
  let eGpa = 210;
  if (labTier === 'project') {
    const rL = readLabNumber('hppColLengthMm', 200, 20000, pressLbl('Longitud libre columna (mm)', 'Column free length (mm)'));
    const rE = readLabNumber('hppEGpa', 70, 220, pressLbl('M\u00f3dulo E (GPa)', 'Modulus E (GPa)'));
    if (!rL.ok) errors.push(rL.error);
    else colLengthMm = rL.value;
    if (!rE.ok) errors.push(rE.error);
    else eGpa = rE.value;
    const kEl = document.getElementById('hppColK');
    colK = kEl instanceof HTMLSelectElement ? Number(kEl.value) : 0.7;
    if (!Number.isFinite(colK) || colK <= 0) errors.push(pressLbl('Coeficiente K: valor no v\u00e1lido.', 'K factor: invalid value.'));
  }

  if (!errors.length && Number.isFinite(strokeMm) && Number.isFinite(cycleS) && Number.isFinite(approachFactor)) {
    updateApproachNote(strokeMm, cycleS, approachFactor);
  }

  if (errors.length) {
    results.innerHTML = '';
    const note = document.getElementById('hppApproachDynamicNote');
    if (note instanceof HTMLElement) note.textContent = '';
    if (formulaBody instanceof HTMLElement) formulaBody.innerHTML = '';
    advisor.innerHTML = `<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>${en ? 'Invalid input:' : 'Entrada no v\u00e1lida:'}</strong><ul style="margin:0.4em 0 1.1em;padding:0">${errors.map((e) => `<li>${e}</li>`).join('')}</ul></div></div>`;
    verdict.className = 'lab-verdict lab-verdict--err';
    verdict.textContent = en ? 'Check form values.' : 'Revise los valores del formulario.';
    return;
  }

  const forceNDesign = forceTon * 1000 * G;
  const pPa = pBar * 1e5;

  const areaReqM2 = forceNDesign / pPa;
  const pistonReqM = Math.sqrt((4 * areaReqM2) / PI);
  const pistonReqMm = pistonReqM * 1000;
  const pistonIsoMm = nearestIsoAtOrAbove(pistonReqMm);
  const pistonUseMm = mode === 'diagnostic' ? diagPistonMm : pistonIsoMm;
  const areaUseM2 = (PI * Math.pow(pistonUseMm / 1000, 2)) / 4;
  const forceN = mode === 'diagnostic' ? pPa * areaUseM2 * ETA_DIAG : pPa * areaUseM2;
  const tonReal = forceN / (1000 * G);

  const tApproach = cycleS * 0.45;
  const tWork = cycleS * 0.55;
  const vWork = (strokeMm / 1000) / Math.max(0.1, tWork);
  const vApproach = vWork * approachFactor;
  const qWorkLmin = areaUseM2 * vWork * 60000;
  const qApproachLmin = areaUseM2 * vApproach * 60000;
  const qReqLmin = Math.max(qWorkLmin, qApproachLmin);

  const motorKw = (pBar * qReqLmin) / (600 * 0.85);
  const motorKwFromPump = (pBar * pumpFlowLmin) / (600 * 0.85);
  const motorStd = [5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315, 355, 400];
  const motorRec = motorStd.find((k) => k >= motorKw) || motorStd[motorStd.length - 1];
  const cycleScale = Math.max(1, qReqLmin / Math.max(0.1, pumpFlowLmin));
  const cycleRealS = cycleS * cycleScale;

  const forcePerColN = forceN / nCols;
  const sigmaAllowPa = sigmaAllowMpa * 1e6;
  const areaColM2 = forcePerColN / sigmaAllowPa;
  const colDiaMm = Math.sqrt((4 * areaColM2) / PI) * 1000;
  const colDiaSafeMm = colDiaMm * 1.2;
  const diagColAreaM2 = (PI * Math.pow(diagColMm / 1000, 2)) / 4;
  const maxTonByCols = (diagColAreaM2 * sigmaAllowPa * nCols) / (1000 * G);

  const dColEulerMm = mode === 'diagnostic' ? diagColMm : colDiaSafeMm;
  const Lcol = colLengthMm / 1000;
  const Epa = eGpa * 1e9;
  const dM = dColEulerMm / 1000;
  const Icol = (PI * Math.pow(dM, 4)) / 64;
  const pCrColN = labTier === 'project'
    ? (PI * PI * Epa * Icol) / Math.pow(Math.max(0.01, colK * Lcol), 2)
    : NaN;
  const fsEulerCol = labTier === 'project' && Number.isFinite(pCrColN) ? pCrColN / Math.max(1, forcePerColN) : NaN;

  renderPressDiagram(document.getElementById('hpPressDiagram'), pistonUseMm, tonReal, nColsValid);

  const mainCards = [
    metric(
      en ? 'Actual tonnage' : 'Tonelaje real',
      `${fmt(tonReal, 1)} t`,
      mode === 'diagnostic'
        ? en
          ? `estimated from D = ${fmt(diagPistonMm, 1)} mm`
          : `estimado por D = ${fmt(diagPistonMm, 1)} mm`
        : en
          ? `target ${fmt(forceTon, 1)} t`
          : `objetivo ${fmt(forceTon, 1)} t`,
    ),
    metric(
      en ? 'Suggested piston diameter (ISO)' : 'Di\u00e1metro pist\u00f3n sugerido (ISO)',
      `${fmt(pistonIsoMm, 0)} mm`,
      en ? `theoretical req. ${fmt(pistonReqMm, 1)} mm` : `req. te\u00f3rico ${fmt(pistonReqMm, 1)} mm`,
    ),
    metric(
      en ? 'Required pump flow' : 'Caudal bomba necesario',
      `${fmt(qReqLmin, 1)} L/min`,
      en
        ? `approach ${fmt(qApproachLmin, 1)} / work ${fmt(qWorkLmin, 1)}`
        : `aprox. ${fmt(qApproachLmin, 1)} / trabajo ${fmt(qWorkLmin, 1)}`,
    ),
    metric(
      en ? 'Electric motor power' : 'Potencia motor el\u00e9ctrico',
      `${fmt(motorKw, 2)} kW`,
      en ? `standardized ${fmt(motorRec, 1)} kW` : `normalizado ${fmt(motorRec, 1)} kW`,
    ),
  ].join('');

  const secondaryCards = [
    metric(
      en ? 'Approach flow' : 'Caudal de aproximaci\u00f3n',
      `${fmt(qApproachLmin, 1)} L/min`,
      en ? `approach factor ${fmt(approachFactor, 2)}\u00d7` : `factor aprox. ${fmt(approachFactor, 2)}\u00d7`,
    ),
    metric(
      en ? 'Working flow' : 'Caudal de trabajo',
      `${fmt(qWorkLmin, 1)} L/min`,
      en ? 'pressing phase' : 'fase de prensado',
    ),
    metric(
      en ? 'Available power (current pump)' : 'Potencia disponible (bomba actual)',
      `${fmt(motorKwFromPump, 2)} kW`,
      en ? `current Q ${fmt(pumpFlowLmin, 1)} L/min` : `Q actual ${fmt(pumpFlowLmin, 1)} L/min`,
    ),
    metric(
      en ? 'Estimated cycle time (current pump)' : 'Tiempo de ciclo estimado con bomba actual',
      `${fmt(cycleRealS, 2)} s`,
      en ? `target ${fmt(cycleS, 2)} s` : `objetivo ${fmt(cycleS, 2)} s`,
    ),
  ];
  if (labTier === 'project' && Number.isFinite(pCrColN)) {
    secondaryCards.push(
      metric(
        en ? 'Column Euler critical load' : 'Carga cr\u00edt. Euler columna',
        `${fmt(pCrColN / 1000, 1)} kN`,
        `FS ${fmt(fsEulerCol, 2)} (D = ${fmt(dColEulerMm, 0)} mm)`,
      ),
    );
  }

  results.innerHTML = `
    ${mainCards}
    ${productivityBadgeHtml(cycleS)}
    <details class="hpp-more-details">
      <summary>${en ? 'Secondary technical data' : 'Datos t\u00e9cnicos secundarios'}</summary>
      <div class="hpp-more-details__body">
        <div class="lab-results">${secondaryCards.join('')}</div>
      </div>
    </details>
  `;

  const formulaLines = en
    ? [
        'Target force (design): F = m_t \u00d7 1000 \u00d7 g with m_t in metric tons (~kN/g).',
        'Required piston area: A_req = F / p with p in Pa (bar \u00d7 1e5).',
        'Theoretical diameter: d = \u221a(4\u00d7A_req/\u03c0). Normalized to ISO piston bore.',
        `Working flow: Q = A \u00d7 v \u00d7 60000 L/min with v = stroke_m / t_work (t_work = 0.55 \u00d7 t_cycle).`,
        'Approach flow: Q_approach = A \u00d7 v_approach \u00d7 60000 with v_approach = factor \u00d7 v_work.',
        'Approx. hydraulic power: P_kW = (p_bar \u00d7 Q_Lmin) / (600 \u00d7 \u03b7) with \u03b7 = 0.85.',
        'Columns (axial stress): A_col = (F/n) / \u03c3_allow; d_min = \u221a(4\u00d7A_col/\u03c0); suggested \u00d71.2.',
      ]
    : [
        'Fuerza objetivo (dise\u00f1o): F = m_t \u00d7 1000 \u00d7 g con m_t en toneladas m\u00e9tricas (equiv. ~kN/g).',
        '\u00c1rea pist\u00f3n requerida: A_req = F / p con p en Pa (bar \u00d7 1e5).',
        'Di\u00e1metro te\u00f3rico: d = \u221a(4\u00d7A_req/\u03c0). Se normaliza a carrera ISO de pist\u00f3n.',
        `Caudal trabajo: Q = A \u00d7 v \u00d7 60000 L/min con v = carrera_m / t_trabajo (t_trabajo = 0,55 \u00d7 t_ciclo).`,
        'Caudal aproximaci\u00f3n: Q_aprox = A \u00d7 v_aprox \u00d7 60000 con v_aprox = factor \u00d7 v_trabajo.',
        'Potencia hidr\u00e1ulica aprox.: P_kW = (p_bar \u00d7 Q_Lmin) / (600 \u00d7 \u03b7) con \u03b7 = 0,85.',
        'Columnas (tensi\u00f3n axial): A_col = (F/n) / \u03c3_adm; d_min = \u221a(4\u00d7A_col/\u03c0); sugerido \u00d71,2.',
      ];
  if (labTier === 'project' && Number.isFinite(pCrColN)) {
    formulaLines.push(
      en
        ? 'Euler buckling: I = \u03c0\u00d7d\u2074/64, P_cr = \u03c0\u00b2\u00d7E\u00d7I/(K\u00d7L)\u00b2 with L in m, E in Pa, K effective-length factor.'
        : 'Pandeo Euler: I = \u03c0\u00d7d\u2074/64, P_cr = \u03c0\u00b2\u00d7E\u00d7I/(K\u00d7L)\u00b2 con L en m, E en Pa, K coef. longitud efectiva.',
    );
    formulaLines.push(
      en
        ? `D used in I: ${mode === 'diagnostic' ? 'actual column diameter' : 'minimum diameter \u00d71.2 (design)'}.`
        : `D usado en I: ${mode === 'diagnostic' ? 'di\u00e1metro real columnas' : 'di\u00e1metro m\u00ednimo \u00d71,2 (dise\u00f1o)'}.`,
    );
  } else if (labTier === 'basic') {
    formulaLines.push(
      en
        ? 'Classroom mode: column buckling is not evaluated; axial check is indicative only.'
        : 'Modo aula: no se eval\u00faa pandeo de columnas; el chequeo axial es orientativo.',
    );
  }

  const assumptions = en
    ? [
        'g = 9.81 m/s\u00b2. Uniform pressure on piston; dynamic pressure drop not modeled.',
        'Aggregate mechanical/hydraulic efficiency 0.85 for motor power.',
        mode === 'diagnostic'
          ? `Diagnostic mode: effective force ~ \u03b7_diag = ${ETA_DIAG} on p\u00d7A.`
          : 'Design mode: nominal force p\u00d7A without diagnostic \u03b7.',
        labTier === 'project'
          ? `Buckling: solid circular column, E = ${fmt(eGpa, 0)} GPa, L = ${fmt(colLengthMm, 0)} mm, K = ${fmt(colK, 2)}.`
          : 'No column buckling check in classroom mode.',
        'The model does not compute frame stiffness (top beam deflection) or load sharing between columns under part eccentricity.',
        'Does not replace FEA, fatigue or platen guidance analysis.',
      ]
    : [
        'g = 9,81 m/s\u00b2. Presi\u00f3n uniforme en pist\u00f3n sin ca\u00edda din\u00e1mica modelada.',
        'Rendimiento mec\u00e1nico/hidr\u00e1ulico agregado 0,85 en potencia de motor.',
        mode === 'diagnostic'
          ? `Modo diagn\u00f3stico: fuerza efectiva ~ \u03b7_diag = ${ETA_DIAG} sobre p\u00d7A.`
          : 'Modo dise\u00f1o: fuerza nominal p\u00d7A sin \u03b7 de diagn\u00f3stico.',
        labTier === 'project'
          ? `Pandeo: columna circular maciza, E = ${fmt(eGpa, 0)} GPa, L = ${fmt(colLengthMm, 0)} mm, K = ${fmt(colK, 2)}.`
          : 'Sin verificaci\u00f3n de pandeo de columnas en modo aula.',
        'El modelo no calcula la rigidez del bastidor (deflexi\u00f3n del travesa\u00f1o superior) ni la distribuci\u00f3n de carga entre columnas ante excentricidad de la pieza.',
        'No sustituye an\u00e1lisis FEM, fatiga ni guiado de plato.',
      ];

  if (formulaBody instanceof HTMLElement) {
    const lead =
      labTier === 'project'
        ? en
          ? 'Project mode: includes Euler buckling on columns.'
          : 'Modo proyecto: incluye pandeo Euler en columnas.'
        : en
          ? 'Classroom mode: basic formulas and axial stress on columns.'
          : 'Modo aula: f\u00f3rmulas b\u00e1sicas y tensi\u00f3n axial en columnas.';
    formulaBody.innerHTML = `
      <p class="lab-fluid-formulas__lead">${lead}</p>
      <ol class="lab-fluid-formulas__list">
        ${formulaLines.map((x) => `<li>${x}</li>`).join('')}
      </ol>
      <p class="lab-fluid-formulas__sub"><strong>${en ? 'Assumptions' : 'Supuestos'}</strong></p>
      <ul class="lab-fluid-formulas__list">
        ${assumptions.map((x) => `<li>${x}</li>`).join('')}
      </ul>
    `;
  }

  const alerts = buildPressAlerts(en, {
    pBar, mode, labTier, fsEulerCol, fmt, userColMm, colDiaSafeMm, nCols,
    pumpFlowLmin, qReqLmin, tApproach, motorKwFromPump, motorKw, cycleRealS,
    tonReal, diagColMm, maxTonByCols,
  });
  advisor.innerHTML = alerts.join('');

  const pumpOk = pumpFlowLmin >= qReqLmin * 0.95;
  const columnsOk =
    !(labTier === 'project' && Number.isFinite(fsEulerCol) && fsEulerCol < 2) &&
    !(Number.isFinite(userColMm) && userColMm + 0.01 < colDiaSafeMm);
  const balanced = pBar <= 300 && pumpOk && motorRec <= motorKw * 1.3 && (mode !== 'diagnostic' || maxTonByCols >= tonReal) &&
    columnsOk;
  renderHppVerdictSummary({ pumpOk, columnsOk, balanced });

  verdict.className = balanced ? 'lab-verdict lab-verdict--ok' : 'lab-verdict lab-verdict--muted';
  verdict.textContent = balanced
    ? en
      ? 'BALANCED CONFIGURATION \u2014 Productivity and power cost in a reasonable range.'
      : 'CONFIGURACI\u00d3N EQUILIBRADA \u2014 Productividad y coste de potencia en rango razonable.'
    : en
      ? 'TUNABLE CONFIGURATION \u2014 Review pump flow, working pressure and installed power to balance productivity vs. cost.'
      : 'CONFIGURACI\u00d3N AJUSTABLE \u2014 Revise caudal de bomba, presi\u00f3n de trabajo y potencia instalada para equilibrar productividad frente a coste.';

  const lang = getCurrentLang();
  const ts = formatDateTimeLocale(new Date(), lang);
  pressPdfSnapshot = {
    valid: true,
    title: lang === 'en' ? 'Report \u2014 Industrial hydraulic press' : 'Informe \u2014 Prensa hidr\u00e1ulica industrial',
    fileBase: `${lang === 'en' ? 'report-hydraulic-press' : 'informe-prensa-hidraulica'}-${new Date().toISOString().slice(0, 10)}`,
    timestamp: ts,
    tierLabel: labTier === 'project' ? (lang === 'en' ? 'Mode: Project (detailed)' : 'Modo: Proyecto (detallado)') : (lang === 'en' ? 'Mode: Classroom (basic)' : 'Modo: Aula (básico)'),
    kpis: [
      { title: lang === 'en' ? 'Real tonnage' : 'Tonelaje real', value: `${fmt(tonReal, 1)} t`, subtitle: 'F/g' },
      { title: lang === 'en' ? 'ISO piston' : 'Pistón ISO', value: `${fmt(pistonIsoMm, 0)} mm`, subtitle: lang === 'en' ? 'Suggested' : 'Sugerido' },
      { title: 'Q', value: `${fmt(qReqLmin, 1)} L/min`, subtitle: lang === 'en' ? 'Pump flow' : 'Caudal bomba' },
      { title: 'P motor', value: `${fmt(motorKw, 2)} kW`, subtitle: `${fmt(motorRec, 1)} kW nom.` },
    ],
    inputRows: [
      { label: lang === 'en' ? 'Mode' : 'Modo cálculo', value: mode },
      { label: lang === 'en' ? 'Detail tier' : 'Nivel memoria', value: labTier },
      { label: lang === 'en' ? 'Force' : 'Fuerza', value: `${fmt(forceTon, 1)} t` },
      { label: 'p', value: `${fmt(pBar, 1)} bar` },
      { label: 'Stroke', value: `${fmt(strokeMm, 0)} mm` },
      { label: lang === 'en' ? 'Cycle' : 'Ciclo', value: `${fmt(cycleS, 1)} s` },
      { label: 'n cols', value: String(nCols) },
      { label: 'sigma', value: `${fmt(sigmaAllowMpa, 0)} MPa` },
    ],
    resultRows: [
      { label: 'F', value: `${fmt(forceN / 1000, 1)} kN` },
      { label: 'A pistón', value: `${fmt(areaUseM2 * 1e6, 0)} mm²` },
      { label: 'Q req', value: `${fmt(qReqLmin, 1)} L/min` },
      { label: lang === 'en' ? 'Column d min' : 'D col mín.', value: `${fmt(colDiaSafeMm, 1)} mm` },
    ],
    formulaLines,
    assumptions,
    verdict: verdict.textContent,
    disclaimer: lang === 'en'
      ? 'Educational pre-design. Verify columns for buckling and buckling-restrained lengths with qualified engineering.'
      : 'Predimensionado educativo. Verificar pandeo de columnas y arriostramientos con ingeniería cualificada.',
  };
  if (labTier === 'project' && Number.isFinite(pCrColN)) {
    pressPdfSnapshot.resultRows.push({ label: 'Pcr col', value: `${fmt(pCrColN / 1000, 1)} kN` });
    pressPdfSnapshot.resultRows.push({ label: 'FS Euler', value: fmt(fsEulerCol, 2) });
  }
}

/** @param {{ pumpOk: boolean, columnsOk: boolean, balanced: boolean }} opts */
function renderHppVerdictSummary(opts) {
  const el = document.getElementById('hppVerdictSummary');
  if (!(el instanceof HTMLElement)) return;
  const en = getCurrentLang() === 'en';
  const row = (ok, label, sub) =>
    `<div class="hc-vs-item ${ok ? 'hc-vs-item--ok' : 'hc-vs-item--bad'}">
      <span class="hc-vs-ico" aria-hidden="true">${ok ? '\u2713' : '\u2717'}</span>
      <div><div class="hc-vs-label">${label}</div><div class="hc-vs-sub">${sub}</div></div>
    </div>`;
  const t = (k, es) => (en ? HYDRAULIC_PRESS_EN[`hpress.${k}`] : es);
  el.innerHTML = `
    <div class="hc-verdict-summary__title">${t('vsTitle', 'Resumen de comprobaciones')}</div>
    ${row(opts.pumpOk, t('vsPump', 'Caudal de bomba'), opts.pumpOk ? t('vsPumpOk', 'Caudal instalado cubre el ciclo.') : t('vsPumpBad', 'Caudal por debajo del requerido.'))}
    ${row(opts.columnsOk, t('vsColumns', 'Columnas'), opts.columnsOk ? t('vsColumnsOk', 'Secci\u00f3n de columna adecuada (orientativo).') : t('vsColumnsBad', 'Di\u00e1metro o pandeo de columnas insuficiente.'))}
    ${row(opts.balanced, t('vsBalance', 'Conjunto'), opts.balanced ? t('vsBalanceOk', 'Configuraci\u00f3n equilibrada.') : t('vsBalanceBad', 'Ajuste caudal, presi\u00f3n y potencia.'))}
  `;
}

function syncModeUi() {
  const mode = document.getElementById('hppMode') instanceof HTMLSelectElement
    ? document.getElementById('hppMode').value
    : 'design';
  const forceField = document.getElementById('hppForceTon')?.closest('.lab-field');
  const diagPistonField = document.getElementById('hppDiagPistonField');
  const diagColField = document.getElementById('hppDiagColField');
  if (diagPistonField instanceof HTMLElement) diagPistonField.hidden = mode !== 'diagnostic';
  if (diagColField instanceof HTMLElement) diagColField.hidden = mode !== 'diagnostic';
  if (forceField instanceof HTMLElement) forceField.classList.toggle('lab-field--auto', mode === 'diagnostic');
}

const computeAndRender = wrapCalcRefresh(computeAndRenderCore);

[
  'hppForceTon',
  'hppPressureBar',
  'hppStrokeMm',
  'hppCycleS',
  'hppApproachFactor',
  'hppPumpFlowLmin',
  'hppColumns',
  'hppSteelMpa',
  'hppUserColumnMm',
  'hppDiagPistonMm',
  'hppDiagColumnMm',
  'hppMode',
  'hppLabTier',
  'hppColLengthMm',
  'hppColK',
  'hppEGpa',
].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', computeAndRender);
  el.addEventListener('change', computeAndRender);
});

document.getElementById('hppMode')?.addEventListener('change', () => {
  syncModeUi();
  computeAndRender();
});

document.getElementById('hppLabTier')?.addEventListener('change', () => {
  syncLabTierUi();
  computeAndRender();
});

syncLabTierUi();
syncModeUi();
mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'hppColLengthMm', min: 50, max: 50000, label: pressLbl('Longitud columna', 'Column length') },
  { id: 'hppEGpa', min: 70, max: 220, label: pressLbl('E m\u00f3dulo', 'E modulus') },
  { id: 'hppForceTon', min: 0.01, max: 50000, label: pressLbl('Fuerza', 'Force') },
  { id: 'hppDiagPistonMm', min: 10, max: 5000, label: pressLbl('\u00d8 pist\u00f3n', 'Piston \u00d8') },
  { id: 'hppPressureBar', min: 1, max: 600, label: pressLbl('Presi\u00f3n', 'Pressure') },
  { id: 'hppStrokeMm', min: 10, max: 100000, label: pressLbl('Carrera', 'Stroke') },
  { id: 'hppCycleS', min: 0.1, max: 86400, label: pressLbl('Tiempo ciclo', 'Cycle time') },
  { id: 'hppApproachFactor', min: 1, max: 20, label: pressLbl('Factor aproximaci\u00f3n', 'Approach factor') },
  { id: 'hppPumpFlowLmin', min: 0.01, max: 500000, label: pressLbl('Caudal bomba', 'Pump flow') },
  { id: 'hppSteelMpa', min: 50, max: 2000, label: pressLbl('\u03c3 acero', 'Steel \u03c3') },
  { id: 'hppUserColumnMm', min: 10, max: 5000, optional: true, label: pressLbl('Columna usuario', 'User column') },
  { id: 'hppDiagColumnMm', min: 10, max: 5000, label: pressLbl('\u00d8 columna', 'Column \u00d8') },
]);
revalidateAllBoundInputs();

mountLabPresetsBar('hppPresetsBar', HPP_PRESETS, computeAndRender);

if (typeof computeAndRender.runPreview === 'function') computeAndRender.runPreview();
else computeAndRender();

mountLabFluidPdfExportBar(document.getElementById('labFluidPdfMount'), {
  getPayload: () => pressPdfSnapshot,
  getDiagramElements: () => {
    const svg = document.getElementById('hpPressDiagram');
    return svg instanceof SVGSVGElement ? [svg] : [];
  },
});

applyHydraulicPressDocumentChrome();

watchLangAndApply(PRESS_PAGE_I18N, {
  reloadOnEs: false,
  onEnApplied: () => {
    applyHydraulicPressDocumentChrome();
    refreshCompactLabFieldHelp();
    syncModeUi();
    computeAndRender();
  },
  onEsRestored: () => {
    applyHydraulicPressDocumentChrome();
    refreshCompactLabFieldHelp();
    syncModeUi();
    computeAndRender();
  },
});