import { mountTierStatusBar } from './paywallMount.js';
import { computeBearingL10, requiredDynamicLoadC_N } from '../lab/bearings.js';
import { renderBearingSectionDiagram } from '../lab/diagramBearings.js';
import {
  bindLabUnitSelectors,
  formatBearingLifeDisplay,
  formatRotation,
  getLabUnitPrefs,
} from '../lab/labUnitPrefs.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import {
  bindInputValidation,
  createLabUrlSync,
  debounce,
  executiveSummaryAlert,
  labAlert,
  metricHtml,
  mountLabPresetsBar,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  updateLabShareVisibility,
  uxCopy,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { commerceIdForBearingC } from '../data/commerceCatalog.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';
import { setLabPurchaseFromShoppingLines } from './labPurchaseSuggestions.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { getLabLang } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { BEARINGS_PAGE_EN } from '../lab/i18n/pages/bearingsPageEn.js';

function bx(es, en) {
  return getLabLang() === 'en' ? en : es;
}

mountTierStatusBar();
bootSmartDashboardIfEnabled(bx('Rodamientos · laboratorio', 'Bearings · lab'));
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'brgC', min: 100, max: 2e9, label: 'C dinámica' },
  { id: 'brgL10TargetH', min: 100, max: 1e9, label: 'L₁₀ objetivo (h)' },
  { id: 'brgP', min: 0.01, max: 1e9, label: 'Carga P' },
  { id: 'brgN', min: 0, max: 1e6, label: 'RPM' },
  { id: 'brgDuty', min: 0, max: 24, label: 'Horas/día' },
]);

function read(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function markFieldInvalid(id, invalid, msg = '') {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
  el.classList.toggle('field-input--danger', Boolean(invalid));
  el.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  if (invalid && msg) el.title = msg;
  else el.removeAttribute('title');
}

function parseNumberInput(id) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement)) return { value: null, empty: true };
  const raw = el.value.trim();
  if (!raw) return { value: null, empty: true };
  const n = parseFloat(String(raw).replace(',', '.'));
  return { value: Number.isFinite(n) ? n : null, empty: false };
}

function lifeMetricTitle(life) {
  if (life === 'Mrev') return bx('Vida L₁₀ (millones de vueltas)', 'L\u2081\u2080 life (millions of revolutions)');
  if (life === 'rev') return bx('Vida L₁₀ (vueltas totales)', 'L\u2081\u2080 life (total revolutions)');
  return bx('Vida L₁₀ (horas de servicio)', 'L\u2081\u2080 life (service hours)');
}

function syncBrgCalcModeUi() {
  const sel = document.getElementById('brgCalcMode');
  const design = sel instanceof HTMLSelectElement && sel.value === 'design';
  const fc = document.getElementById('brgFieldC');
  const fl = document.getElementById('brgFieldL10Target');
  if (fc instanceof HTMLElement) fc.hidden = design;
  if (fl instanceof HTMLElement) fl.hidden = !design;
}

const BRG_PRESETS = [
  {
    label: 'Diagnóstico · servicio',
    labelKey: 'brg.preset1',
    values: {
      brgCalcMode: 'diagnostic',
      brgC: 52000,
      brgP: 8200,
      brgN: 1455,
      brgType: 'ball',
      brgDuty: 8,
      brgL10TargetH: 20000,
    },
  },
  {
    label: 'Diseño · 20 kh',
    labelKey: 'brg.preset2',
    values: {
      brgCalcMode: 'design',
      brgC: 32500,
      brgP: 6500,
      brgN: 750,
      brgType: 'roller',
      brgDuty: 16,
      brgL10TargetH: 20000,
    },
  },
  {
    label: 'Rodillos · carga alta',
    labelKey: 'brg.preset3',
    values: {
      brgCalcMode: 'diagnostic',
      brgC: 98000,
      brgP: 18500,
      brgN: 600,
      brgType: 'roller',
      brgDuty: 12,
      brgL10TargetH: 40000,
    },
  },
];

const BRG_URL_PARAM_TO_ID = {
  mode: 'brgCalcMode',
  C: 'brgC',
  P: 'brgP',
  n: 'brgN',
  typ: 'brgType',
  duty: 'brgDuty',
  L10: 'brgL10TargetH',
};

const brgUrl = createLabUrlSync(BRG_URL_PARAM_TO_ID, {
  hydrateOrder: ['mode', 'C', 'P', 'n', 'typ', 'duty', 'L10'],
  afterHydrate: () => {
    syncBrgCalcModeUi();
  },
});

function refreshCore() {
  const u = getLabUnitPrefs();
  const lifePref = u.life ?? 'hours';
  const validationMsgs = [];
  const modeEl = document.getElementById('brgCalcMode');
  const mode = modeEl instanceof HTMLSelectElement && modeEl.value === 'design' ? 'design' : 'diagnostic';

  const cRaw = parseNumberInput('brgC').value;
  const pRaw = parseNumberInput('brgP').value;
  const nRaw = parseNumberInput('brgN').value;
  const dutyParsed = parseNumberInput('brgDuty');
  const l10TargetParsed = parseNumberInput('brgL10TargetH');

  const pInvalid = !(pRaw != null && pRaw > 0);
  const nInvalid = !(nRaw != null && nRaw >= 0);
  const dutyInvalid = !dutyParsed.empty && !(dutyParsed.value != null && dutyParsed.value >= 0 && dutyParsed.value <= 24);
  const cInvalidDiag = mode === 'diagnostic' && !(cRaw != null && cRaw > 0);
  const l10InvalidDesign =
    mode === 'design' &&
    (l10TargetParsed.empty || l10TargetParsed.value == null || l10TargetParsed.value <= 0);
  const nInvalidDesign = mode === 'design' && !(nRaw != null && nRaw > 0);

  markFieldInvalid(
    'brgC',
    cInvalidDiag,
    bx('La carga dinámica C debe ser mayor que 0', 'Dynamic load C must be greater than 0'),
  );
  markFieldInvalid(
    'brgP',
    pInvalid,
    bx('La carga equivalente P debe ser mayor que 0', 'Equivalent load P must be greater than 0'),
  );
  markFieldInvalid(
    'brgN',
    nInvalid || nInvalidDesign,
    bx(
      'Revise velocidad n: no puede ser negativa; en modo diseño se requiere n > 0.',
      'Check speed n: cannot be negative; design mode requires n > 0.',
    ),
  );
  markFieldInvalid(
    'brgDuty',
    dutyInvalid,
    bx('Horas/día de servicio: use un valor entre 0 y 24.', 'Duty hours/day must be between 0 and 24.'),
  );
  markFieldInvalid(
    'brgL10TargetH',
    l10InvalidDesign,
    bx('L\u2081\u2080 objetivo (horas) debe ser mayor que 0.', 'Target L\u2081\u2080 hours must be > 0.'),
  );
  if (cInvalidDiag)
    validationMsgs.push(
      bx('Revise C (carga dinámica): indique un valor mayor que 0 N.', 'Check C (dynamic load): enter a value > 0 N.'),
    );
  if (pInvalid)
    validationMsgs.push(
      bx('Revise P (carga equivalente): indique un valor mayor que 0 N.', 'Check P (equivalent load): enter a value > 0 N.'),
    );
  if (nInvalid) validationMsgs.push(bx('Revise velocidad n: no puede ser negativa.', 'Check speed n: it cannot be negative.'));
  if (nInvalidDesign)
    validationMsgs.push(
      bx(
        'En modo diseño indique velocidad n > 0 para la conversión horas–revoluciones.',
        'In design mode enter speed n > 0 for the hours–revolutions conversion.',
      ),
    );
  if (l10InvalidDesign)
    validationMsgs.push(
      bx('Revise L\u2081\u2080 objetivo (horas): debe ser mayor que 0.', 'Check target L\u2081\u2080 (hours): must be > 0.'),
    );
  if (dutyInvalid)
    validationMsgs.push(
      bx('Revise horas/día de servicio: use un valor de 0 a 24.', 'Check duty hours/day: use a value from 0 to 24.'),
    );

  const typeEl = document.getElementById('brgType');
  const type = typeEl instanceof HTMLSelectElement && typeEl.value === 'roller' ? 'roller' : 'ball';

  let r;
  let cRequired_N = null;
  if (mode === 'design') {
    const targetH = l10TargetParsed.value != null ? l10TargetParsed.value : 20000;
    cRequired_N =
      !pInvalid && !nInvalidDesign
        ? requiredDynamicLoadC_N({
            equivalentLoad_N: pRaw,
            type,
            L10_target_hours: targetH,
            speed_rpm: nRaw,
          })
        : null;
    const Cuse = cRequired_N != null && Number.isFinite(cRequired_N) ? Math.max(100, cRequired_N) : 32500;
    r = computeBearingL10({
      dynamicLoad_N: Cuse,
      equivalentLoad_N: read('brgP', 8200),
      type,
      speed_rpm: read('brgN', 1455),
    });
  } else {
    const p = {
      dynamicLoad_N: read('brgC', 32500),
      equivalentLoad_N: read('brgP', 8200),
      type,
      speed_rpm: read('brgN', 1455),
    };
    r = computeBearingL10(p);
  }

  const pOverC =
    mode === 'diagnostic' && pRaw != null && cRaw != null && pRaw > cRaw;
  const lowLife =
    mode === 'diagnostic' && r.nominalLife_hours != null && r.nominalLife_hours < 2000;
  const brgVerdict =
    validationMsgs.length || pOverC ? 'error' : lowLife ? 'warn' : 'ok';

  const heroEl = document.getElementById('brgHero');
  if (heroEl) {
    const heroItems =
      mode === 'design' && cRequired_N != null && Number.isFinite(cRequired_N)
        ? [
            {
              label: bx('C dinámica mínima (catálogo ≥)', 'Minimum dynamic C (catalogue \u2265)'),
              display: `${cRequired_N.toFixed(0)} N`,
              hint: bx(
                'ISO 281 básica: seleccione en catálogo C ≥ este valor para el L₁₀ objetivo indicado.',
                'Basic ISO 281: pick catalogue C \u2265 this value for the stated L\u2081\u2080 target.',
              ),
            },
            {
              label: bx('L₁₀ objetivo (entrada)', 'Target L\u2081\u2080 (input)'),
              display: `${(l10TargetParsed.value ?? read('brgL10TargetH', 20000)).toFixed(0)} h`,
              hint: bx('A n y P constantes; sin factores térmicos ni a_ISO.', 'At constant n and P; no thermal factors or a_ISO.'),
            },
          ]
        : [
            {
              label: bx('Vida básica L₁₀', 'Basic rating life L\u2081\u2080'),
              display: formatBearingLifeDisplay(r, lifePref),
              hint:
                lifePref === 'hours' && r.nominalLife_hours == null
                  ? bx(
                      'Indique giro > 0 para estimar horas a partir de las revoluciones.',
                      'Enter speed > 0 to estimate hours from revolutions.',
                    )
                  : bx(
                      '90% de confiabilidad, ISO 281 simplificada (sin factores térmicos).',
                      '90% reliability, simplified ISO 281 (no thermal factors).',
                    ),
            },
            {
              label: bx('ω — velocidad angular del eje', '\u03c9 \u2014 shaft angular speed'),
              display: formatRotation(r.speed_rpm, u.rotation),
              hint: bx('Velocidad del eje que usa la conversión a horas.', 'Shaft speed used for the hours conversion.'),
            },
          ];
    heroEl.innerHTML = renderResultHero(heroItems, { verdict: brgVerdict });
  }

  const box = document.getElementById('brgResults');
  if (box) {
    const metrics =
      mode === 'design' && cRequired_N != null && Number.isFinite(cRequired_N)
        ? [
            metricHtml(
              bx('C requerida (mín.)', 'Required C (min.)'),
              `${cRequired_N.toFixed(0)} N`,
              bx(
                'Elija rodamiento con C del catálogo igual o superior.',
                'Select a bearing with catalogue C equal or higher.',
              ),
            ),
            metricHtml(
              bx('L₁₀ objetivo', 'Target L\u2081\u2080'),
              `${(l10TargetParsed.value ?? read('brgL10TargetH', 20000)).toFixed(0)} h`,
              bx(
                'Verificación: con C = C_req, L₁₀ coincide con este objetivo en el modelo básico.',
                'Check: at C = C_req, L\u2081\u2080 matches this target in the basic model.',
              ),
            ),
            metricHtml(
              bx('Carga equivalente P', 'Equivalent load P'),
              `${r.equivalentLoad_N.toFixed(2)} N`,
              bx('Caso de carga de su cálculo (simplificado).', 'Your duty case (simplified).'),
            ),
            metricHtml(
              bx('Exponente de vida p', 'Life exponent p'),
              type === 'roller' ? '10/3' : '3',
              bx('En L = (C/P)^p: rodillos ≠ bolas.', 'In L = (C/P)^p: rollers \u2260 balls.'),
            ),
            metricHtml(
              bx('ω — velocidad angular del eje', '\u03c9 \u2014 shaft angular speed'),
              formatRotation(r.speed_rpm, u.rotation),
              bx('Misma entrada en las unidades elegidas arriba.', 'Same input in the units selected above.'),
            ),
          ]
        : [
            metricHtml(
              lifeMetricTitle(lifePref),
              formatBearingLifeDisplay(r, lifePref),
              bx(
                'Cambie “Vida L₁₀” en la barra superior para ver el mismo dato en horas, millones de vueltas o vueltas totales.',
                'Change \u201cL\u2081\u2080 life\u201d in the bar above to view the same value in hours, millions of revolutions or total revolutions.',
              ),
            ),
            metricHtml(
              bx('Carga dinámica C (catálogo)', 'Dynamic load C (catalogue)'),
              `${r.dynamicLoad_N.toFixed(2)} N`,
              bx('Capacidad de referencia del rodamiento elegido.', 'Reference capacity of the selected bearing.'),
            ),
            metricHtml(
              bx('Carga equivalente P', 'Equivalent load P'),
              `${r.equivalentLoad_N.toFixed(2)} N`,
              bx('Caso de carga de su cálculo (simplificado).', 'Your duty case (simplified).'),
            ),
            metricHtml(
              bx('Exponente de vida p', 'Life exponent p'),
              type === 'roller' ? '10/3' : '3',
              bx('En L = (C/P)^p: rodillos ≠ bolas.', 'In L = (C/P)^p: rollers \u2260 balls.'),
            ),
            metricHtml(
              bx('ω — velocidad angular del eje', '\u03c9 \u2014 shaft angular speed'),
              formatRotation(r.speed_rpm, u.rotation),
              bx('Misma entrada en las unidades elegidas arriba.', 'Same input in the units selected above.'),
            ),
          ];
    box.innerHTML = metrics.join('');
  }

  const resultsW = document.getElementById('brgResultsWrap');
  let noteEl = document.getElementById('brgNote');
  if (resultsW?.parentElement) {
    if (!noteEl) {
      noteEl = document.createElement('div');
      noteEl.id = 'brgNote';
      noteEl.className = 'lab-alerts';
      resultsW.parentElement.insertBefore(noteEl, resultsW);
    }
    const parts = [];
    const designOk = mode === 'design' && cRequired_N != null && Number.isFinite(cRequired_N) && !validationMsgs.length;
    parts.push(
      executiveSummaryAlert({
        level: validationMsgs.length || pOverC ? 'danger' : lowLife ? 'warn' : 'ok',
        titleEs:
          validationMsgs.length || pOverC
            ? 'Resumen ejecutivo: resultado no apto para decisión todavía.'
            : mode === 'design' && designOk
              ? 'Resumen ejecutivo: C mínima calculada; busque en catálogo C ≥ valor indicado.'
              : lowLife
                ? 'Resumen ejecutivo: vida baja para servicio continuo.'
                : 'Resumen ejecutivo: vida L10 coherente para seguir selección.',
        titleEn:
          validationMsgs.length || pOverC
            ? 'Executive summary: result not ready for decision.'
            : mode === 'design' && designOk
              ? 'Executive summary: minimum C computed; select catalogue C ≥ value shown.'
              : lowLife
                ? 'Executive summary: low life for continuous duty.'
                : 'Executive summary: L10 is consistent to continue selection.',
        actionsEs:
          validationMsgs.length || pOverC
            ? ['Corregir entradas C/P/n.', 'Asegurar que P no supere C para comparar opciones.']
            : mode === 'design'
              ? ['Compare C_req con fichas de fabricante.', 'Aplicar factores térmicos y de confiabilidad si aplica.']
              : ['Contrastar con objetivo de vida del proyecto.', 'Validar con catálogo OEM y factor de servicio.'],
        actionsEn:
          validationMsgs.length || pOverC
            ? ['Fix C/P/n inputs.', 'Ensure P does not exceed C before comparing options.']
            : mode === 'design'
              ? ['Compare C_req with manufacturer datasheets.', 'Apply thermal/reliability factors if required.']
              : ['Compare against project life target.', 'Validate with OEM catalogue and service factor.'],
      }),
    );
    validationMsgs.forEach((msg) => parts.push(labAlert('danger', msg)));
    if (pOverC) {
      parts.push(
        labAlert(
          'warn',
          bx(
            'P equivalente supera C. Espere L₁₀ muy bajo; revise tamaño de rodamiento o hipótesis de carga.',
            'Equivalent load P exceeds C. Expect very low L\u2081\u2080; check bearing size or loading assumptions.',
          ),
        ),
      );
    }
    if (mode === 'design' && designOk) {
      parts.push(
        labAlert(
          'info',
          bx(
            `Selección: cualquier rodamiento con C ≥ ${cRequired_N.toFixed(0)} N (mismo tipo bolas/rodillos) alcanza al menos el L₁₀ objetivo en este modelo básico.`,
            `Selection: any bearing with C \u2265 ${cRequired_N.toFixed(0)} N (same ball/roller type) meets at least the target L\u2081\u2080 in this basic model.`,
          ),
        ),
      );
    }

    if (mode === 'diagnostic' && r.nominalLife_hours == null) {
      parts.push(
        labAlert(
          'info',
          bx(
            'Indique giro n > 0 para estimar L₁₀ en horas (puede revisar la vida en revoluciones).',
            'Set speed n > 0 to estimate L\u2081\u2080 in hours (you can still review life in revolutions).',
          ),
        ),
      );
    } else if (mode === 'diagnostic' && r.nominalLife_hours < 2000) {
      parts.push(
        labAlert(
          'warn',
          bx(
            'L₁₀ baja en horas: considere reducir P, cambiar tipo de rodamiento o elegir mayor C.',
            'L\u2081\u2080 is low in hours: consider reducing P, changing bearing type or selecting higher C.',
          ),
        ),
      );
    } else if (mode === 'diagnostic' && r.nominalLife_hours > 50000) {
      parts.push(
        labAlert(
          'ok',
          bx(
            'L₁₀ alta para estas entradas. Confirme que P y n reflejan el punto real de servicio.',
            'High L\u2081\u2080 for these inputs. Confirm that P and n reflect your real duty point.',
          ),
        ),
      );
    } else if (mode === 'diagnostic') {
      parts.push(
        labAlert(
          'info',
          bx(
            'Compare L₁₀ con el objetivo de su aplicación y criterios OEM/proveedor.',
            'Compare L\u2081\u2080 with your application target and supplier/OEM criteria.',
          ),
        ),
      );
    }
    parts.push(
      labAlert(
        'info',
        uxCopy(
          'Este módulo usa ISO 281 simplificada; para diseño final, aplicar factores de servicio y temperatura del fabricante.',
          'This module uses simplified ISO 281; for final design, apply supplier service and temperature factors.',
        ),
      ),
    );
    noteEl.innerHTML = parts.join('');
  }

  renderBearingSectionDiagram(document.getElementById('brgDiagram'), { type });

  const dutyEl = document.getElementById('brgDuty');
  let dutyHours = null;
  if (dutyEl instanceof HTMLInputElement && dutyEl.value.trim() !== '') {
    const d = parseFloat(String(dutyEl.value).replace(',', '.'));
    if (Number.isFinite(d) && d >= 0) dutyHours = d;
  }
  const cShop = mode === 'design' && cRequired_N != null && Number.isFinite(cRequired_N) ? cRequired_N : r.dynamicLoad_N;
  const shoppingLines = [
    { commerceId: commerceIdForBearingC(cShop), qty: 1, note: `C ≈ ${cShop.toFixed(0)} N` },
  ];
  emitEngineeringSnapshot({
    page: 'calc-bearings',
    moduleLabel: 'Rodamientos L₁₀',
    advisorContext: {
      bearing: {
        L10_hours: r.nominalLife_hours ?? undefined,
        speed_rpm: r.speed_rpm,
      },
      machineDuty: { dutyHoursPerDay: dutyHours },
    },
    shoppingLines,
    metrics: { energyEfficiencyPct: null, materialUtilizationPct: null },
  });
  setLabPurchaseFromShoppingLines(document.getElementById('labPurchaseSuggestions'), shoppingLines);

  updateLabShareVisibility('brgShareLinkWrap', 'brgResults');
  brgUrl.serializeToUrl();
}

const wrap = document.getElementById('brgResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);

const brgPresets = mountLabPresetsBar('brgPresetsBar', BRG_PRESETS, debounced);

function scheduleBrgRecalc() {
  if (!brgPresets.applying && !brgUrl.hydrating) {
    brgPresets.clearActive();
  }
  debounced();
}

brgUrl.hydrateFromUrl();
syncBrgCalcModeUi();

bindLabUnitSelectors(scheduleBrgRecalc, { life: true });
['brgCalcMode', 'brgC', 'brgP', 'brgN', 'brgType', 'brgDuty', 'brgL10TargetH'].forEach((id) => {
  const el = document.getElementById(id);
  el?.addEventListener('input', scheduleBrgRecalc);
  el?.addEventListener('change', () => {
    if (id === 'brgCalcMode') syncBrgCalcModeUi();
    scheduleBrgRecalc();
  });
});
wireLabCopyLink('brgCopyLinkBtn', 'brgCopyToast');
wireLabCopyResultsButton('brgCopyResults', {
  moduleTitle: uxCopy('Rodamientos (ISO 281)', 'Bearings (ISO 281)'),
});
watchLangAndApply(BEARINGS_PAGE_EN, {
  reloadOnEs: false,
  onEnApplied: () => scheduleBrgRecalc(),
  onEsRestored: () => scheduleBrgRecalc(),
});
runCalcWithIndustrialFeedback(wrap, refreshCore);
mountLabCloudSaveBar(bx('Rodamientos (ISO 281)', 'Bearings (ISO 281)'));

window.addEventListener('home-language-changed', () => {
  scheduleBrgRecalc();
});
