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
  debounce,
  executiveSummaryAlert,
  labAlert,
  metricHtml,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  uxCopy,
} from './labCalcUx.js';
import { commerceIdForBearingC } from '../data/commerceCatalog.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';
import { setLabPurchaseFromShoppingLines } from './labPurchaseSuggestions.js';

mountTierStatusBar();
bootSmartDashboardIfEnabled('Rodamientos · laboratorio');
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

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
  if (life === 'Mrev') return 'Vida L₁₀ (millones de vueltas)';
  if (life === 'rev') return 'Vida L₁₀ (vueltas totales)';
  return 'Vida L₁₀ (horas de servicio)';
}

function syncBrgCalcModeUi() {
  const sel = document.getElementById('brgCalcMode');
  const design = sel instanceof HTMLSelectElement && sel.value === 'design';
  const fc = document.getElementById('brgFieldC');
  const fl = document.getElementById('brgFieldL10Target');
  if (fc instanceof HTMLElement) fc.hidden = design;
  if (fl instanceof HTMLElement) fl.hidden = !design;
}

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

  markFieldInvalid('brgC', cInvalidDiag, 'Dynamic load C must be greater than 0');
  markFieldInvalid('brgP', pInvalid, 'Equivalent load P must be greater than 0');
  markFieldInvalid('brgN', nInvalid || nInvalidDesign, 'Speed must be > 0 in design mode');
  markFieldInvalid('brgDuty', dutyInvalid, 'Duty hours/day must be between 0 and 24');
  markFieldInvalid('brgL10TargetH', l10InvalidDesign, 'Target L10 hours must be > 0');
  if (cInvalidDiag) validationMsgs.push('Revise C (dynamic load): enter a value greater than 0 N.');
  if (pInvalid) validationMsgs.push('Revise P (equivalent load): enter a value greater than 0 N.');
  if (nInvalid) validationMsgs.push('Revise speed n: it cannot be negative.');
  if (nInvalidDesign) validationMsgs.push('En modo diseño indique velocidad n > 0 para la conversión horas–revoluciones.');
  if (l10InvalidDesign) validationMsgs.push('Revise L₁₀ objetivo (horas): debe ser mayor que 0.');
  if (dutyInvalid) validationMsgs.push('Revise duty hours/day: use a value from 0 to 24.');

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

  const heroEl = document.getElementById('brgHero');
  if (heroEl) {
    const heroItems =
      mode === 'design' && cRequired_N != null && Number.isFinite(cRequired_N)
        ? [
            {
              label: 'C dinámica mínima (catálogo ≥)',
              display: `${cRequired_N.toFixed(0)} N`,
              hint: 'ISO 281 básica: seleccione en catálogo C ≥ este valor para el L₁₀ objetivo indicado.',
            },
            {
              label: 'L₁₀ objetivo (entrada)',
              display: `${(l10TargetParsed.value ?? read('brgL10TargetH', 20000)).toFixed(0)} h`,
              hint: 'A n y P constantes; sin factores térmicos ni a_ISO.',
            },
          ]
        : [
            {
              label: 'Vida básica L₁₀',
              display: formatBearingLifeDisplay(r, lifePref),
              hint:
                lifePref === 'hours' && r.nominalLife_hours == null
                  ? 'Indique giro &gt; 0 para estimar horas a partir de las revoluciones.'
                  : '90% de confiabilidad, ISO 281 simplificada (sin factores térmicos).',
            },
            {
              label: 'ω — velocidad angular del eje',
              display: formatRotation(r.speed_rpm, u.rotation),
              hint: 'Velocidad del eje que usa la conversión a horas.',
            },
          ];
    heroEl.innerHTML = renderResultHero(heroItems);
  }

  const box = document.getElementById('brgResults');
  if (box) {
    const metrics =
      mode === 'design' && cRequired_N != null && Number.isFinite(cRequired_N)
        ? [
            metricHtml(
              'C requerida (mín.)',
              `${cRequired_N.toFixed(0)} N`,
              'Elija rodamiento con C del catálogo igual o superior.',
            ),
            metricHtml(
              'L₁₀ objetivo',
              `${(l10TargetParsed.value ?? read('brgL10TargetH', 20000)).toFixed(0)} h`,
              'Verificación: con C = C_req, L₁₀ coincide con este objetivo en el modelo básico.',
            ),
            metricHtml(
              'Carga equivalente P',
              `${r.equivalentLoad_N.toFixed(2)} N`,
              'Caso de carga de su cálculo (simplificado).',
            ),
            metricHtml(
              'Exponente de vida p',
              type === 'roller' ? '10/3' : '3',
              'En L = (C/P)^p: rodillos ≠ bolas.',
            ),
            metricHtml(
              'ω — velocidad angular del eje',
              formatRotation(r.speed_rpm, u.rotation),
              'Misma entrada en las unidades elegidas arriba.',
            ),
          ]
        : [
            metricHtml(
              lifeMetricTitle(lifePref),
              formatBearingLifeDisplay(r, lifePref),
              'Cambie “Vida L₁₀” en la barra superior para ver el mismo dato en horas, millones de vueltas o vueltas totales.',
            ),
            metricHtml(
              'Carga dinámica C (catálogo)',
              `${r.dynamicLoad_N.toFixed(2)} N`,
              'Capacidad de referencia del rodamiento elegido.',
            ),
            metricHtml(
              'Carga equivalente P',
              `${r.equivalentLoad_N.toFixed(2)} N`,
              'Caso de carga de su cálculo (simplificado).',
            ),
            metricHtml(
              'Exponente de vida p',
              type === 'roller' ? '10/3' : '3',
              'En L = (C/P)^p: rodillos ≠ bolas.',
            ),
            metricHtml(
              'ω — velocidad angular del eje',
              formatRotation(r.speed_rpm, u.rotation),
              'Misma entrada en las unidades elegidas arriba.',
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
      resultsW.after(noteEl);
    }
    const parts = [];
    const pOverC =
      mode === 'diagnostic' && pRaw != null && cRaw != null && pRaw > cRaw;
    const lowLife =
      mode === 'diagnostic' && r.nominalLife_hours != null && r.nominalLife_hours < 2000;
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
      parts.push(labAlert('warn', 'Equivalent load P exceeds C. Expect very low L10; check bearing size or loading assumptions.'));
    }
    if (mode === 'design' && designOk) {
      parts.push(
        labAlert(
          'info',
          `Selección: cualquier rodamiento con C ≥ ${cRequired_N.toFixed(0)} N (mismo tipo bolas/rodillos) alcanza al menos el L₁₀ objetivo en este modelo básico.`,
        ),
      );
    }

    if (mode === 'diagnostic' && r.nominalLife_hours == null) {
      parts.push(
        labAlert(
          'info',
          'Set speed n > 0 to estimate L10 in hours (you can still review life in revolutions).',
        ),
      );
    } else if (mode === 'diagnostic' && r.nominalLife_hours < 2000) {
      parts.push(labAlert('warn', 'L10 is low in hours: consider reducing P, changing bearing type, or selecting a higher C.'));
    } else if (mode === 'diagnostic' && r.nominalLife_hours > 50000) {
      parts.push(labAlert('ok', 'High L10 for these inputs. Confirm that P and n reflect your real duty point.'));
    } else if (mode === 'diagnostic') {
      parts.push(labAlert('info', 'Compare L10 with your application target and supplier/OEM criteria.'));
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
}

const wrap = document.getElementById('brgResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);
bindLabUnitSelectors(debounced, { life: true });
['brgCalcMode', 'brgC', 'brgP', 'brgN', 'brgType', 'brgDuty', 'brgL10TargetH'].forEach((id) => {
  const el = document.getElementById(id);
  el?.addEventListener('input', debounced);
  el?.addEventListener('change', () => {
    if (id === 'brgCalcMode') syncBrgCalcModeUi();
    debounced();
  });
});
syncBrgCalcModeUi();
runCalcWithIndustrialFeedback(wrap, refreshCore);
