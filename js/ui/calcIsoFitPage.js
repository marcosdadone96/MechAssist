import { mountTierStatusBar } from './paywallMount.js';
import {
  computeIsoFit,
  HOLE_LETTERS_SUPPORTED,
  IT_GRADE_KEYS,
  SHAFT_LETTERS_SUPPORTED,
} from '../lab/iso286Compute.js';
import { ISO286_FIT_RECOMMENDATIONS } from '../lab/iso286FitRecommendations.js';
import { renderIso286FitDiagram } from '../lab/diagramIso286Fit.js';
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
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';

mountTierStatusBar();
bootSmartDashboardIfEnabled('ISO 286 · ajustes');
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readNum(id, fallback) {
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

function readSelect(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLSelectElement)) return fallback;
  const v = String(el.value || '').trim();
  return v || fallback;
}

function fillSelect(id, options, selected) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLSelectElement)) return;
  el.innerHTML = options
    .map((o) => `<option value="${o}"${o === selected ? ' selected' : ''}>${o}</option>`)
    .join('');
}

function setSelectValue(id, value) {
  const el = document.getElementById(id);
  if (el instanceof HTMLSelectElement) el.value = value;
}

fillSelect('isoHoleLetter', HOLE_LETTERS_SUPPORTED, 'H');
fillSelect('isoHoleIt', IT_GRADE_KEYS, 'IT7');
fillSelect('isoShaftLetter', SHAFT_LETTERS_SUPPORTED, 'g');
fillSelect('isoShaftIt', IT_GRADE_KEYS, 'IT6');

function mountAppPresetSelect() {
  const presetSel = document.getElementById('isoAppPreset');
  if (!presetSel || !(presetSel instanceof HTMLSelectElement)) return;
  presetSel.innerHTML = [
    '<option value="">Elija una aplicación (manual o tabla)</option>',
    ...ISO286_FIT_RECOMMENDATIONS.map(
      (r) => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.label)}</option>`,
    ),
  ].join('');
}

function renderRecommendationTable() {
  const tbody = document.querySelector('#isoRecTable tbody');
  if (!tbody) return;
  tbody.innerHTML = ISO286_FIT_RECOMMENDATIONS.map(
    (r) => `
    <tr>
      <td class="lab-iso-rec-table__col-fit">
        <strong class="lab-iso-rec-table__code">${escapeHtml(r.fitCode)}</strong>
      </td>
      <td class="lab-iso-rec-table__col-fit">
        <span class="lab-iso-rec-table__meta">${escapeHtml(r.category)}</span>
      </td>
      <td class="lab-iso-rec-table__col-use">
        <span class="lab-iso-rec-table__title">${escapeHtml(r.comment)}</span>
        <span class="lab-iso-rec-table__note">${escapeHtml(r.label)}. Ej.: ${escapeHtml(r.examples)} &#183; &#216; sugerido ${r.dNomSuggestion} mm.</span>
      </td>
      <td class="lab-iso-rec-table__col-act">
        <button type="button" class="lab-btn lab-iso-rec-table__btn" data-iso-preset="${escapeHtml(
          r.id,
        )}" aria-label="Aplicar: ${escapeHtml(r.label)}">&#8594;</button>
      </td>
    </tr>`,
  ).join('');
}

function findMatchingRecommendationId() {
  const hL = readSelect('isoHoleLetter', '');
  const hI = readSelect('isoHoleIt', '');
  const sL = readSelect('isoShaftLetter', '');
  const sI = readSelect('isoShaftIt', '');
  const row = ISO286_FIT_RECOMMENDATIONS.find(
    (r) =>
      (r.applyHoleLetter || r.holeLetter) === hL &&
      (r.applyHoleIt || r.holeIt) === hI &&
      (r.applyShaftLetter || r.shaftLetter) === sL &&
      (r.applyShaftIt || r.shaftIt) === sI,
  );
  return row ? row.id : '';
}

function syncAppPresetSelect() {
  const presetSel = document.getElementById('isoAppPreset');
  if (!presetSel || !(presetSel instanceof HTMLSelectElement)) return;
  const id = findMatchingRecommendationId();
  presetSel.value = id;
}

/** @param {string} id */
function applyRecommendationById(id) {
  if (!id) return;
  const row = ISO286_FIT_RECOMMENDATIONS.find((r) => r.id === id);
  if (!row) return;
  const dEl = document.getElementById('isoD');
  if (dEl instanceof HTMLInputElement) dEl.value = String(row.dNomSuggestion);
  setSelectValue('isoHoleLetter', row.applyHoleLetter || row.holeLetter);
  setSelectValue('isoHoleIt', row.applyHoleIt || row.holeIt);
  setSelectValue('isoShaftLetter', row.applyShaftLetter || row.shaftLetter);
  setSelectValue('isoShaftIt', row.applyShaftIt || row.shaftIt);
  const presetSel = document.getElementById('isoAppPreset');
  if (presetSel instanceof HTMLSelectElement) presetSel.value = id;
}

mountAppPresetSelect();
renderRecommendationTable();

function fitVerdictAlert(kind) {
  if (kind === 'clearance') return labAlert('ok', '<strong>Ajuste con juego</strong> (azul). J<sub>min</sub> &ge; 0.');
  if (kind === 'interference') return labAlert('danger', '<strong>Ajuste con apriete</strong> (rojo). J<sub>max</sub> &le; 0.');
  return labAlert('warn', '<strong>Ajuste de transición</strong> (amarillo). J<sub>max</sub> &gt; 0 y J<sub>min</sub> &lt; 0.');
}

function refreshCore() {
  const dNom = readNum('isoD', 25);
  const validationMsgs = [];
  const dInvalid = !(Number.isFinite(dNom) && dNom >= 1 && dNom <= 500);
  markFieldInvalid('isoD', dInvalid, 'Nominal diameter must be between 1 and 500 mm');
  if (dInvalid) validationMsgs.push('Revise nominal diameter d: use a value between 1 and 500 mm.');

  const holeLetter = readSelect('isoHoleLetter', 'H');
  const holeIt = readSelect('isoHoleIt', 'IT7');
  const shaftLetter = readSelect('isoShaftLetter', 'g');
  const shaftIt = readSelect('isoShaftIt', 'IT6');

  const r = computeIsoFit(dNom, holeLetter, holeIt, shaftLetter, shaftIt);

  const heroEl = document.getElementById('isoHero');
  const verdictEl = document.getElementById('isoVerdict');
  const alertsEl = document.getElementById('isoAlerts');
  const box = document.getElementById('isoResults');

  syncAppPresetSelect();

  if (!r.ok) {
    if (heroEl) heroEl.innerHTML = '';
    if (verdictEl) verdictEl.innerHTML = labAlert('danger', r.err || uxCopy('Error de cálculo', 'Calculation error'));
    if (alertsEl) {
      const parts = [
        executiveSummaryAlert({
          level: 'danger',
          titleEs: 'Resumen ejecutivo: no se puede generar el ajuste.',
          titleEn: 'Executive summary: fit could not be generated.',
          actionsEs: ['Revisar diámetro nominal y calidad IT.', 'Volver a calcular.'],
          actionsEn: ['Review nominal diameter and IT grade.', 'Recalculate.'],
        }),
      ];
      validationMsgs.forEach((msg) => parts.push(labAlert('danger', escapeHtml(msg))));
      alertsEl.innerHTML = parts.join('');
    }
    if (box) box.innerHTML = '';
    renderIso286FitDiagram(document.getElementById('isoDiagram'), null);
    return;
  }

  const jMax = r.clearanceMax_um;
  const jMin = r.clearanceMin_um;
  const jMaxLabel = jMax >= 0 ? 'Juego max.' : 'Interferencia max. (|Jmax|)';
  const jMinLabel = jMin >= 0 ? 'Juego min.' : 'Interferencia min. (|Jmin|)';

  if (heroEl) {
    heroEl.innerHTML = renderResultHero([
      {
        label: jMaxLabel,
        display: `${jMax.toFixed(1)} um`,
        hint: 'Dmax - dmin (positivo = holgura; negativo = interferencia).',
      },
      {
        label: jMinLabel,
        display: `${jMin.toFixed(1)} um`,
        hint: 'Dmin - dmax.',
      },
      {
        label: 'Tipo de ajuste',
        display: r.fitLabelEs,
        hint: r.fitLabelEn,
      },
    ]);
  }

  if (verdictEl) verdictEl.innerHTML = fitVerdictAlert(r.fitKind);
  if (alertsEl) {
    const parts = [];
    parts.push(
      executiveSummaryAlert({
        level: validationMsgs.length ? 'danger' : r.fitKind === 'interference' ? 'warn' : 'ok',
        titleEs: validationMsgs.length
          ? 'Resumen ejecutivo: corregir entradas antes de cerrar tolerancias.'
          : `Resumen ejecutivo: ${r.fitLabelEs}.`,
        titleEn: validationMsgs.length
          ? 'Executive summary: fix inputs before closing tolerances.'
          : `Executive summary: ${r.fitLabelEn}.`,
        actionsEs: validationMsgs.length
          ? ['Corregir campos en rojo.', 'Recalcular y revisar juego/interferencia.']
          : ['Verificar método de montaje.', 'Comprobar expansión térmica y par de materiales.'],
        actionsEn: validationMsgs.length
          ? ['Fix fields marked in red.', 'Recalculate and review clearance/interference.']
          : ['Verify assembly method.', 'Check thermal expansion and material pairing.'],
      }),
    );
    validationMsgs.forEach((msg) => parts.push(labAlert('danger', escapeHtml(msg))));
    if (r.fitKind === 'interference') {
      parts.push(labAlert('warn', 'Interference fit selected: verify assembly method, material pair, and thermal expansion.'));
    } else if (r.fitKind === 'transition') {
      parts.push(labAlert('info', 'Transition fit: evaluate both worst-case clearance and worst-case interference.'));
    } else {
      parts.push(labAlert('ok', 'Clearance fit: review minimum clearance against lubrication and thermal expansion needs.'));
    }
    parts.push(
      labAlert(
        'info',
        uxCopy(
          'Validación simplificada ISO 286 (extracto 1-500 mm). Para condiciones especiales, confirmar con ISO 286-1 completa y proceso real de fabricación/metrología.',
          'Simplified ISO 286 validation. Confirm against real manufacturing and metrology process.',
        ),
      ),
    );
    alertsEl.innerHTML = parts.join('');
  }

  if (box) {
    const iStr = r.i_microns.toFixed(2);
    const dMStr = r.dGeo_mm.toFixed(3);
    box.innerHTML = [
      metricHtml('Unidad i (tabla)', `${iStr} um`, `i = 0.45 * cbrt(D_M) + 0.001*D_M; D_M = ${dMStr} mm (media geométrica del tramo).`),
      metricHtml('IT fundamental agujero', `${r.hole.it} = ${r.IT_hole_microns} um`, 'Valor útil para acotar en plano de fabricación.'),
      metricHtml('IT fundamental eje', `${r.shaft.it} = ${r.IT_shaft_microns} um`, 'Valor útil para acotar en plano de fabricación.'),
      metricHtml('Agujero EI / ES', `${r.hole.EI_um} / ${r.hole.ES_um} um`, 'Desviaciones fundamentales + IT (micras).'),
      metricHtml('Eje ei / es', `${r.shaft.ei_um} / ${r.shaft.es_um} um`, 'Desviaciones fundamentales + IT (micras).'),
      metricHtml('D max / D min', `${r.hole.dMax.toFixed(6)} / ${r.hole.dMin.toFixed(6)} mm`, 'Limites del agujero.'),
      metricHtml('d max / d min', `${r.shaft.dMax.toFixed(6)} / ${r.shaft.dMin.toFixed(6)} mm`, 'Limites del eje.'),
    ].join('');
  }

  renderIso286FitDiagram(document.getElementById('isoDiagram'), r);

  emitEngineeringSnapshot({
    page: 'calc-iso-fit',
    moduleLabel: 'ISO 286 ajustes',
    advisorContext: { fitKind: r.fitKind, nominal_mm: r.dNom },
    shoppingLines: [
      {
        commerceId: 'machining-tolerance-quote',
        qty: 1,
        note: `${r.hole.letter}${r.hole.it} / ${r.shaft.letter}${r.shaft.it} · Ø ${r.dNom} mm · ${r.fitLabelEs}`,
      },
    ],
    metrics: { energyEfficiencyPct: null, materialUtilizationPct: null },
  });
}

const wrap = document.getElementById('isoResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);

document.getElementById('isoAppPreset')?.addEventListener('change', () => {
  const sel = document.getElementById('isoAppPreset');
  const id = sel instanceof HTMLSelectElement ? sel.value : '';
  if (id) applyRecommendationById(id);
  runCalcWithIndustrialFeedback(wrap, refreshCore);
});

document.getElementById('isoRecTable')?.addEventListener('click', (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const btn = t.closest('[data-iso-preset]');
  if (!(btn instanceof HTMLElement)) return;
  const id = btn.getAttribute('data-iso-preset') || '';
  if (!id) return;
  applyRecommendationById(id);
  runCalcWithIndustrialFeedback(wrap, refreshCore);
});

document.querySelectorAll('[data-iso-chip]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const spec = btn.getAttribute('data-iso-chip') || '';
    const m = spec.match(/^([A-Z]{1,2})(\d+)\/([a-z]{1,2})(\d+)@(\d+(?:\.\d+)?)$/);
    if (!m) return;
    const [, hL, hItN, sL, sItN, dNom] = m;
    setSelectValue('isoHoleLetter', hL);
    setSelectValue('isoHoleIt', `IT${hItN}`);
    setSelectValue('isoShaftLetter', sL);
    setSelectValue('isoShaftIt', `IT${sItN}`);
    const dEl = document.getElementById('isoD');
    if (dEl instanceof HTMLInputElement) dEl.value = dNom;
    runCalcWithIndustrialFeedback(wrap, refreshCore);
  });
});

['isoD', 'isoHoleLetter', 'isoHoleIt', 'isoShaftLetter', 'isoShaftIt'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', debounced);
  document.getElementById(id)?.addEventListener('change', debounced);
});

runCalcWithIndustrialFeedback(wrap, refreshCore);
