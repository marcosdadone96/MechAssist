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
  bindInputValidation,
  createLabUrlSync,
  debounce,
  executiveSummaryAlert,
  labAlert,
  metricHtml,
  mountLabPresetsBar,
  renderLabFinalVerdictBanner,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  updateLabShareVisibility,
  uxCopy,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { getLabLang } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { ISO_FIT_PAGE_EN } from '../lab/i18n/pages/isoFitPageEn.js';
import { isoRecTableNoteSuffix, localizedIsoFitRec } from '../lab/i18n/runtime/iso286RecRuntime.js';

function bx(es, en) {
  return getLabLang() === 'en' ? en : es;
}

function langCode() {
  return getLabLang() === 'en' ? 'en' : 'es';
}

mountTierStatusBar();
bootSmartDashboardIfEnabled(bx('ISO 286 \u00b7 ajustes', 'ISO 286 \u00b7 fits'));
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

bindInputValidation([{ id: 'isoD', min: 1, max: 500, label: 'Diámetro nominal d' }]);

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
    `<option value="">${bx('Elija una aplicaci\u00f3n (manual o tabla)', 'Choose an application (manual or table)')}</option>`,
    ...ISO286_FIT_RECOMMENDATIONS.map((r) => {
      const loc = localizedIsoFitRec(r, langCode());
      return `<option value="${escapeHtml(r.id)}">${escapeHtml(loc.label)}</option>`;
    }),
  ].join('');
}

function renderRecommendationTable() {
  const tbody = document.querySelector('#isoRecTable tbody');
  if (!tbody) return;
  const exLabel = bx('Ej.', 'e.g.');
  const applyLabel = bx('Aplicar:', 'Apply:');
  const suffix = isoRecTableNoteSuffix(langCode());
  tbody.innerHTML = ISO286_FIT_RECOMMENDATIONS.map((r) => {
    const loc = localizedIsoFitRec(r, langCode());
    return `
    <tr>
      <td class="lab-iso-rec-table__col-fit">
        <strong class="lab-iso-rec-table__code">${escapeHtml(r.fitCode)}</strong>
      </td>
      <td class="lab-iso-rec-table__col-fit">
        <span class="lab-iso-rec-table__meta">${escapeHtml(loc.category)}</span>
      </td>
      <td class="lab-iso-rec-table__col-use">
        <span class="lab-iso-rec-table__title">${escapeHtml(loc.comment)}</span>
        <span class="lab-iso-rec-table__note">${escapeHtml(loc.label)}. ${exLabel} ${escapeHtml(loc.examples)} &#183; &#216; ${suffix} ${r.dNomSuggestion} mm.</span>
      </td>
      <td class="lab-iso-rec-table__col-act">
        <button type="button" class="lab-btn lab-iso-rec-table__btn" data-iso-preset="${escapeHtml(
          r.id,
        )}" aria-label="${applyLabel} ${escapeHtml(loc.label)}">&#8594;</button>
      </td>
    </tr>`;
  }).join('');
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

function refreshCore() {
  const dNom = readNum('isoD', 25);
  const validationMsgs = [];
  const dInvalid = !(Number.isFinite(dNom) && dNom >= 1 && dNom <= 500);
  markFieldInvalid(
    'isoD',
    dInvalid,
    bx('El diámetro nominal debe estar entre 1 y 500 mm', 'Nominal diameter must be between 1 and 500 mm'),
  );
  if (dInvalid) {
    validationMsgs.push(
      bx(
        'Revise el diámetro nominal d: use un valor entre 1 y 500 mm.',
        'Check nominal diameter d: use a value between 1 and 500 mm.',
      ),
    );
  }

  const holeLetter = readSelect('isoHoleLetter', 'H');
  const holeIt = readSelect('isoHoleIt', 'IT7');
  const shaftLetter = readSelect('isoShaftLetter', 'g');
  const shaftIt = readSelect('isoShaftIt', 'IT6');

  const r = computeIsoFit(dNom, holeLetter, holeIt, shaftLetter, shaftIt);

  const heroEl = document.getElementById('isoHero');
  const alertsEl = document.getElementById('isoAlerts');
  const box = document.getElementById('isoResults');

  syncAppPresetSelect();

  if (!r.ok) {
    if (heroEl) heroEl.innerHTML = '';
    if (alertsEl) {
      const parts = [
        renderLabFinalVerdictBanner('error'),
        executiveSummaryAlert({
          level: 'danger',
          titleEs: 'Resumen ejecutivo: no se puede generar el ajuste.',
          titleEn: 'Executive summary: fit could not be generated.',
          actionsEs: ['Revisar diámetro nominal y calidad IT.', 'Volver a calcular.'],
          actionsEn: ['Review nominal diameter and IT grade.', 'Recalculate.'],
        }),
      ];
      validationMsgs.forEach((msg) => parts.push(labAlert('danger', escapeHtml(msg))));
      parts.push(labAlert('danger', escapeHtml(r.err || uxCopy('Error de cálculo', 'Calculation error'))));
      alertsEl.innerHTML = parts.join('');
    }
    if (box) box.innerHTML = '';
    renderIso286FitDiagram(document.getElementById('isoDiagram'), null);
    updateLabShareVisibility('isoShareLinkWrap', 'isoResults');
    isoUrl.serializeToUrl();
    return;
  }

  const jMax = r.clearanceMax_um;
  const jMin = r.clearanceMin_um;
  const jMaxLabel =
    jMax >= 0
      ? bx('Juego max.', 'Max. clearance')
      : bx('Interferencia max. (|Jmax|)', 'Max. interference (|Jmax|)');
  const jMinLabel =
    jMin >= 0
      ? bx('Juego min.', 'Min. clearance')
      : bx('Interferencia min. (|Jmin|)', 'Min. interference (|Jmin|)');

  const isoFitVerdict =
    validationMsgs.length ? 'error' : r.fitKind === 'clearance' ? 'ok' : 'warn';

  if (heroEl) {
    heroEl.innerHTML = renderResultHero(
      [
      {
        label: jMaxLabel,
        display: `${jMax.toFixed(1)} um`,
        hint: bx(
          'Dmax - dmin (positivo = holgura; negativo = interferencia).',
          'Dmax - dmin (positive = clearance; negative = interference).',
        ),
      },
      {
        label: jMinLabel,
        display: `${jMin.toFixed(1)} um`,
        hint: bx('Dmin - dmax.', 'Dmin - dmax.'),
      },
      {
        label: bx('Tipo de ajuste', 'Fit type'),
        display: getLabLang() === 'en' ? r.fitLabelEn : r.fitLabelEs,
        hint: getLabLang() === 'en' ? r.fitLabelEs : r.fitLabelEn,
      },
    ],
      { verdict: isoFitVerdict },
    );
  }

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
      parts.push(
        labAlert(
          'warn',
          bx(
            'Ajuste con interferencia: verifique método de montaje, par de materiales y dilatación térmica.',
            'Interference fit: verify assembly method, material pair, and thermal expansion.',
          ),
        ),
      );
    } else if (r.fitKind === 'transition') {
      parts.push(
        labAlert(
          'info',
          bx(
            'Ajuste de transición: evalúe holgura e interferencia en el peor caso.',
            'Transition fit: evaluate worst-case clearance and interference.',
          ),
        ),
      );
    } else {
      parts.push(
        labAlert(
          'ok',
          bx(
            'Ajuste con holgura: revise holgura mínima frente a lubricación y dilatación térmica.',
            'Clearance fit: review minimum clearance vs lubrication and thermal expansion.',
          ),
        ),
      );
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
      metricHtml(
        bx('Unidad i (tabla)', 'Unit i (table)'),
        `${iStr} um`,
        bx(
          `i = 0.45 * cbrt(D_M) + 0.001*D_M; D_M = ${dMStr} mm (media geométrica del tramo).`,
          `i = 0.45 * cbrt(D_M) + 0.001*D_M; D_M = ${dMStr} mm (geometric mean of span).`,
        ),
      ),
      metricHtml(
        bx('IT fundamental agujero', 'Fundamental IT hole'),
        `${r.hole.it} = ${r.IT_hole_microns} um`,
        bx('Valor útil para acotar en plano de fabricación.', 'Useful for drawing tolerances.'),
      ),
      metricHtml(
        bx('IT fundamental eje', 'Fundamental IT shaft'),
        `${r.shaft.it} = ${r.IT_shaft_microns} um`,
        bx('Valor útil para acotar en plano de fabricación.', 'Useful for drawing tolerances.'),
      ),
      metricHtml(
        bx('Agujero EI / ES', 'Hole EI / ES'),
        `${r.hole.EI_um} / ${r.hole.ES_um} um`,
        bx('Desviaciones fundamentales + IT (micras).', 'Fundamental deviations + IT (microns).'),
      ),
      metricHtml(
        bx('Eje ei / es', 'Shaft ei / es'),
        `${r.shaft.ei_um} / ${r.shaft.es_um} um`,
        bx('Desviaciones fundamentales + IT (micras).', 'Fundamental deviations + IT (microns).'),
      ),
      metricHtml(
        bx('D max / D min', 'D max / D min'),
        `${r.hole.dMax.toFixed(6)} / ${r.hole.dMin.toFixed(6)} mm`,
        bx('Límites del agujero.', 'Hole limits.'),
      ),
      metricHtml(
        bx('d max / d min', 'd max / d min'),
        `${r.shaft.dMax.toFixed(6)} / ${r.shaft.dMin.toFixed(6)} mm`,
        bx('Límites del eje.', 'Shaft limits.'),
      ),
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

  updateLabShareVisibility('isoShareLinkWrap', 'isoResults');
  isoUrl.serializeToUrl();
}

const ISO_PRESETS = [
  {
    label: 'H7/g6 · Ø25',
    labelKey: 'iso.preset1',
    values: {
      isoD: 25,
      isoHoleLetter: 'H',
      isoHoleIt: 'IT7',
      isoShaftLetter: 'g',
      isoShaftIt: 'IT6',
    },
  },
  {
    label: 'H7/k6 · Ø40',
    labelKey: 'iso.preset2',
    values: {
      isoD: 40,
      isoHoleLetter: 'H',
      isoHoleIt: 'IT7',
      isoShaftLetter: 'k',
      isoShaftIt: 'IT6',
    },
  },
  {
    label: 'JS7/h6 · Ø28',
    labelKey: 'iso.preset3',
    values: {
      isoD: 28,
      isoHoleLetter: 'JS',
      isoHoleIt: 'IT7',
      isoShaftLetter: 'h',
      isoShaftIt: 'IT6',
    },
  },
];

const ISO_URL_PARAM_TO_ID = {
  d: 'isoD',
  hL: 'isoHoleLetter',
  hI: 'isoHoleIt',
  sL: 'isoShaftLetter',
  sI: 'isoShaftIt',
};

const isoUrl = createLabUrlSync(ISO_URL_PARAM_TO_ID, {
  hydrateOrder: ['d', 'hL', 'hI', 'sL', 'sI'],
});

const wrap = document.getElementById('isoResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);

const isoPresets = mountLabPresetsBar('isoPresetsBar', ISO_PRESETS, debounced);

function scheduleIsoRecalc() {
  if (!isoPresets.applying && !isoUrl.hydrating) {
    isoPresets.clearActive();
  }
  debounced();
}

isoUrl.hydrateFromUrl();
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
  document.getElementById(id)?.addEventListener('input', scheduleIsoRecalc);
  document.getElementById(id)?.addEventListener('change', scheduleIsoRecalc);
});

wireLabCopyLink('isoCopyLinkBtn', 'isoCopyToast');
wireLabCopyResultsButton('isoCopyResults', {
  moduleTitle: uxCopy('Ajustes ISO 286', 'ISO 286 fits'),
});
runCalcWithIndustrialFeedback(wrap, refreshCore);
mountLabCloudSaveBar(bx('Ajustes ISO 286', 'ISO 286 fits'));
watchLangAndApply(ISO_FIT_PAGE_EN, {
  onEnApplied: () => {
    mountAppPresetSelect();
    renderRecommendationTable();
    scheduleIsoRecalc();
  },
});
