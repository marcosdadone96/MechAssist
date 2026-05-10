import { mountTierStatusBar } from './paywallMount.js';
import { computeRollerChain } from '../lab/chains.js';
import { CHAIN_CATALOG } from '../lab/chainCatalog.js';
import { renderChainDriveDiagram } from '../lab/diagramChains.js';
import {
  bindLabUnitSelectors,
  formatLength,
  formatLinearSpeed,
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
  labHelpTooltipMarkup,
  metricHtml,
  mountLabPresetsBar,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  updateLabShareVisibility,
  uxCopy,
  wireLabCopyLink,
} from './labCalcUx.js';
import { commerceIdForChainRef } from '../data/commerceCatalog.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { setLabPurchaseFromShoppingLines } from './labPurchaseSuggestions.js';
import { bindCommerceFilteredSelect } from './commerceSelectBind.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';

mountTierStatusBar();
bootSmartDashboardIfEnabled('Cadenas · laboratorio');
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();

function readInput(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
  const n = parseFloat(raw.replace(',', '.'));
  return { value: Number.isFinite(n) ? n : null, empty: false };
}

function elementCardHtml(title, rows) {
  const body = rows
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
    .join('');
  return `<article class="lab-element-card"><h4 class="lab-element-card__title">${esc(title)}</h4><dl class="lab-element-card__kv">${body}</dl></article>`;
}

const CHAIN_PRESETS = [
  {
    label: 'ISO 12B · centrado',
    values: {
      cManualPitch: false,
      cChainRef: 'iso-12b-1',
      cPitch: 19.05,
      cZ1: 17,
      cZ2: 25,
      cCenter: 450,
      cN1: 1455,
    },
  },
  {
    label: 'ISO 08B · lento',
    values: {
      cManualPitch: false,
      cChainRef: 'iso-08b-1',
      cPitch: 12.7,
      cZ1: 15,
      cZ2: 38,
      cCenter: 380,
      cN1: 900,
    },
  },
  {
    label: 'Paso manual 15 mm',
    values: {
      cManualPitch: true,
      cPitch: 15,
      cZ1: 19,
      cZ2: 57,
      cCenter: 520,
      cN1: 720,
    },
  },
];

const CHAIN_URL_PARAM_TO_ID = {
  mp: 'cManualPitch',
  chain: 'cChainRef',
  p: 'cPitch',
  z1: 'cZ1',
  z2: 'cZ2',
  a: 'cCenter',
  n1: 'cN1',
};

const chainUrl = createLabUrlSync(CHAIN_URL_PARAM_TO_ID, {
  hydrateOrder: ['mp', 'chain', 'p', 'z1', 'z2', 'a', 'n1'],
  afterHydrate: () => {
    syncPitchDisabled();
  },
});

bindCommerceFilteredSelect(
  'cChainRef',
  CHAIN_CATALOG,
  'id',
  (row) => `${row.label} · ${row.norm} · p = ${row.pitch_mm} mm`,
  (row) => `chain-${row.id}`,
);
const sel = document.getElementById('cChainRef');
if (sel instanceof HTMLSelectElement) sel.value = 'iso-12b-1';

mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'cPitch', min: 4, max: 200, label: 'Paso p' },
  { id: 'cZ1', min: 6, max: 200, label: 'z₁' },
  { id: 'cZ2', min: 6, max: 200, label: 'z₂' },
  { id: 'cCenter', min: 50, max: 50000, label: 'Distancia entre centros' },
  { id: 'cN1', min: 0, max: 30000, label: 'RPM n₁' },
]);

const manualEl = document.getElementById('cManualPitch');
const pitchEl = document.getElementById('cPitch');
const chainRefEl = document.getElementById('cChainRef');
function syncPitchDisabled() {
  const manual = manualEl instanceof HTMLInputElement && manualEl.checked;
  if (pitchEl instanceof HTMLInputElement) pitchEl.disabled = !manual;
  if (chainRefEl instanceof HTMLSelectElement) chainRefEl.disabled = manual;
  if (chainRefEl instanceof HTMLSelectElement) {
    chainRefEl.closest('.lab-field')?.classList.toggle('chain-ref--disabled', manual);
  }
  if (pitchEl instanceof HTMLInputElement) {
    pitchEl.closest('.lab-field')?.classList.toggle('chain-pitch--active', manual);
  }
}
manualEl?.addEventListener('change', syncPitchDisabled);
syncPitchDisabled();

function refreshCore() {
  const u = getLabUnitPrefs();
  const useManual = manualEl instanceof HTMLInputElement && manualEl.checked;
  const validationMsgs = [];
  const z1Raw = parseNumberInput('cZ1').value;
  const z2Raw = parseNumberInput('cZ2').value;
  const cRaw = parseNumberInput('cCenter').value;
  const n1Raw = parseNumberInput('cN1').value;
  const pRaw = parseNumberInput('cPitch').value;

  const z1Invalid = !(z1Raw >= 6);
  const z2Invalid = !(z2Raw >= 6);
  const centerInvalid = !(cRaw > 0);
  const n1Invalid = !(n1Raw != null && n1Raw >= 0);
  const pitchInvalid = useManual ? !(pRaw > 0) : false;
  markFieldInvalid('cZ1', z1Invalid, 'Use z1 >= 6 teeth');
  markFieldInvalid('cZ2', z2Invalid, 'Use z2 >= 6 teeth');
  markFieldInvalid('cCenter', centerInvalid, 'Center distance must be > 0');
  markFieldInvalid('cN1', n1Invalid, 'Input speed cannot be negative');
  markFieldInvalid('cPitch', pitchInvalid, 'Manual pitch must be > 0');
  if (z1Invalid) validationMsgs.push('Revise z1: use at least 6 teeth.');
  if (z2Invalid) validationMsgs.push('Revise z2: use at least 6 teeth.');
  if (centerInvalid) validationMsgs.push('Revise center distance C: it must be greater than 0.');
  if (n1Invalid) validationMsgs.push('Revise input speed n1: it cannot be negative.');
  if (pitchInvalid) validationMsgs.push('Revise manual pitch p: it must be greater than 0.');

  const chainRefId = sel instanceof HTMLSelectElement ? sel.value : '';
  const n1 = readInput('cN1', 0);
  const p = {
    chainRefId: useManual ? '' : chainRefId,
    useManualPitch: useManual,
    pitch_mm: readInput('cPitch', 19.05),
    z1: readInput('cZ1', 17),
    z2: readInput('cZ2', 25),
    center_mm: readInput('cCenter', 450),
    n1_rpm: n1 > 0 ? n1 : undefined,
  };
  const r = computeRollerChain(p);

  const hasPolyWarn = Boolean(r.polygonalEffect?.active);
  const articDanger = r.articulationFrequency_Hz != null && r.articulationFrequency_Hz > 50;
  const chainVerdict =
    validationMsgs.length || articDanger ? 'error' : hasPolyWarn ? 'warn' : 'ok';

  const heroEl = document.getElementById('cHero');
  if (heroEl) {
    heroEl.innerHTML = renderResultHero(
      [
      {
        label: 'ω₂ — velocidad angular · piñón 2 (conducido, z₂)',
        display: r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—',
        hint: 'En el primitivo, proporcional a z₁/z₂.',
      },
      {
        label: 'Velocidad de la cadena (primitivo · piñón 1)',
        display: formatLinearSpeed(r.linearSpeed_m_s, u.linear),
        hint: 'Media en el primitivo del piñón motor (piñón 1, z₁).',
      },
    ],
      { verdict: chainVerdict },
    );
  }

  const box = document.getElementById('cResults');
  const elementBox = document.getElementById('cElementResults');
  if (elementBox) {
    elementBox.innerHTML = [
      elementCardHtml('Piñón 1 · Motor', [
        ['Dientes (z1)', String(r.z1)],
        ['Diam. primitivo (D1)', formatLength(r.pitchDiameter1_mm, u.length)],
        ['Velocidad (n1)', formatRotation(r.n1_rpm, u.rotation)],
      ]),
      elementCardHtml('Piñón 2 · Conducido', [
        ['Dientes (z2)', String(r.z2)],
        ['Diam. primitivo (D2)', formatLength(r.pitchDiameter2_mm, u.length)],
        ['Velocidad (n2)', r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—'],
      ]),
      elementCardHtml('Cadena · Tramo', [
        ['Paso (p)', formatLength(r.pitch_mm, u.length)],
        ['Longitud (L)', `${r.chainLength_pitches.toFixed(2)} pasos`],
        ['Velocidad lineal (v)', formatLinearSpeed(r.linearSpeed_m_s, u.linear)],
      ]),
    ].join('');
  }

  if (box) {
    const refLine = r.chainRefLabel ? `${r.chainRefLabel}` : 'Paso manual';
    const cells = [
      metricHtml(
        'Referencia de cadena',
        refLine,
        `${r.chainNorm || r.normsNote || ''} Paso de catálogo y norma definen carga admisible.`,
      ),
      metricHtml(
        'Relación de dientes (z₂/z₁)',
        r.ratio_teeth.toFixed(2),
        `En primitivos, D₂/D₁ = ${r.ratio_primitive.toFixed(2)} (ligero desvío por polígono).`,
      ),
      metricHtml(
        'Longitud (pasos de cadena)',
        `${r.chainLength_pitches.toFixed(2)} pasos`,
        `Redondeo práctico al alza: ${r.chainLength_pitches_roundUp} pasos.`,
      ),
      metricHtml(
        'Distancia entre ejes',
        formatLength(r.center_mm, u.length),
        `Equivale a ≈ ${r.center_pitches.toFixed(2)} pasos de paso p.`,
      ),
      metricHtml(
        'D₁ — diámetro primitivo · piñón 1 (motor, z₁)',
        formatLength(r.pitchDiameter1_mm, u.length),
        'Fórmula D = p / sin(π/z) en el piñón motriz.',
      ),
      metricHtml(
        'D₂ — diámetro primitivo · piñón 2 (conducido, z₂)',
        formatLength(r.pitchDiameter2_mm, u.length),
        'Primitivo del piñón conducido.',
      ),
      metricHtml(
        'ω₁ — velocidad angular · piñón 1 (motor)',
        formatRotation(r.n1_rpm, u.rotation),
        'Entrada del formulario en las unidades elegidas.',
      ),
      metricHtml(
        'ω₂ — velocidad angular · piñón 2 (conducido)',
        formatRotation(r.n2_rpm, u.rotation),
        'Salida cinemática en primitivo.',
      ),
      metricHtml(
        'Velocidad lineal de cadena',
        formatLinearSpeed(r.linearSpeed_m_s, u.linear),
        'Tramos rectos; guía lubricación y desgaste.',
      ),
      metricHtml(
        'Frecuencia de articulación · piñón 1 (motor)',
        r.articulationFrequency_Hz != null ? `${r.articulationFrequency_Hz.toFixed(2)} Hz` : '—',
        '≈ z₁ × ω₁/2π; más Hz suele exigir mejor lubricación.',
      ),
      metricHtml(
        'Lubricación sugerida',
        `${r.chainLubrication.class} — ${r.chainLubrication.label}`,
        `${r.chainLubrication.detail} Confirme con ISO 10823 y fabricante.`,
      ),
    ];
    box.innerHTML = cells.join('');
  }

  const alerts = document.getElementById('cAlerts');
  if (alerts) {
    const parts = [];
    const hasValidation = validationMsgs.length > 0;
    parts.push(
      executiveSummaryAlert({
        level: hasValidation ? 'danger' : hasPolyWarn ? 'warn' : 'ok',
        titleEs: hasValidation
          ? 'Resumen ejecutivo: complete y corrija entradas para cerrar el cálculo.'
          : hasPolyWarn
            ? 'Resumen ejecutivo: cinemática válida con advertencias por efecto poligonal.'
            : 'Resumen ejecutivo: resultado válido como base de selección.',
        titleEn: hasValidation
          ? 'Executive summary: complete/fix inputs to close the calculation.'
          : hasPolyWarn
            ? 'Executive summary: valid kinematics with polygonal-effect warnings.'
            : 'Executive summary: valid baseline result for component selection.',
        actionsEs: hasValidation
          ? ['Corregir campos en rojo.', 'Recalcular antes de seleccionar componentes.']
          : ['Confirmar lubricación y paso con catálogo real.', 'Validar cierre de longitud y montaje.'],
        actionsEn: hasValidation
          ? ['Fix fields marked in red.', 'Recalculate before selecting components.']
          : ['Confirm lubrication and pitch with real catalogue.', 'Validate chain length closure and assembly.'],
      }),
    );
    validationMsgs.forEach((msg) => parts.push(labAlert('danger', esc(msg))));
    if (r.polygonalEffect?.active) {
      parts.push(labAlert('warn', esc(r.polygonalEffect.text)));
    }
    if (r.z1 < 17) {
      parts.push(
        labAlert(
          'warn',
          'z₁ < 17: el efecto poligonal en el piñón motriz puede ser significativo y generar vibraciones. Se recomienda usar z₁ ≥ 17 siempre que sea posible.',
        ),
      );
    }
    if (r.articulationFrequency_Hz != null && r.articulationFrequency_Hz > 50) {
      parts.push(
        labAlert(
          'danger',
          `Frecuencia de articulación alta (${r.articulationFrequency_Hz.toFixed(2)} Hz): posible riesgo de resonancia. Requiere estudio dinámico del sistema.`,
        ),
      );
    }
    if (parts.length === 0) {
      parts.push(
        labAlert(
          'info',
          `${esc(r.normsNote)} Articulación y lubricación son orientativas; confirme con ISO 10823 y fabricante.`,
        ),
      );
    } else {
      parts.push(labAlert('info', esc(r.normsNote)));
    }
    parts.push(
      labAlert(
        'info',
        'Hipótesis del modelo: no verifica la resistencia a tracción de la cadena ni su vida a fatiga; la selección final debe cerrarse con catálogo del fabricante.',
      ),
    );
    alerts.innerHTML = parts.join('');
  }

  const sub = document.getElementById('cSubstitution');
  if (sub && r.n1_rpm != null && r.omega2_rad_s != null) {
    const D1 = r.pitchDiameter1_mm;
    const D2 = r.pitchDiameter2_mm;
    const vDisp = formatLinearSpeed(r.linearSpeed_m_s, u.linear);
    sub.innerHTML = `
      <details class="calc-substitution">
        <summary class="calc-substitution__summary">
          <span class="calc-substitution__title">Sustitución — cinemática en primitivo</span>
        </summary>
        <div class="calc-substitution__inner">
          <p class="calc-substitution__step">
            Diámetros primitivos: <code>D = p / sin(π/z)</code> →
            <code>D₁ = ${D1.toFixed(2)} mm</code> (piñón 1), <code>D₂ = ${D2.toFixed(2)} mm</code> (piñón 2)
          </p>
          <p class="calc-substitution__step">
            Giro · piñón 2 (RPM): <code>n₂ = n₁ · D₁/D₂ = ${r.n1_rpm.toFixed(2)} × ${D1.toFixed(2)} / ${D2.toFixed(2)} = ${r.n2_rpm != null ? r.n2_rpm.toFixed(2) : '—'} RPM</code>
          </p>
          <p class="calc-substitution__step">
            Mismo resultado en sus unidades: <strong>${formatRotation(r.n2_rpm, u.rotation)}</strong>
          </p>
          <p class="calc-substitution__step">
            Velocidad media de cadena: <strong>${vDisp}</strong>
          </p>
          <p class="calc-substitution__step">
            Articulaciones por segundo · piñón 1: <strong>${r.articulationFrequency_Hz != null ? `${r.articulationFrequency_Hz.toFixed(2)} Hz` : '—'}</strong>
          </p>
        </div>
      </details>`;
  } else if (sub) {
    sub.innerHTML = '';
  }

  const assem = document.getElementById('cAssembly');
  if (assem && r.assembly) {
    const a = r.assembly;
    assem.innerHTML = `
      <div class="lab-metric lab-metric--wide">
        <div class="lab-metric__head">
          <span class="k">Montaje · eslabones de unión</span>
          ${labHelpTooltipMarkup(a.notes, 'Notas de montaje')}
        </div>
        <div class="v lab-metric__text">
          Eslabón de unión (conector con clip): típicamente <strong>${a.connectingLink_count_typical}</strong> unidad.
          Pasos al alza: <strong>${a.Lp_round_up}</strong> (${a.oddAfterRoundUp ? 'impar' : 'par'}).
          Alternativa par recomendada: <strong>${a.recommended_even_pitches}</strong> pasos.
          ${a.offsetLink_recommended ? '<br /><strong>Eslabón desplazado (½ paso):</strong> valorar si cierra en bucle con longitud impar en pasos.' : ''}
        </div>
      </div>
    `;
  }

  renderChainDriveDiagram(document.getElementById('cDiagram'), p);

  const cref = !useManual && chainRefId ? chainRefId : 'iso-12b-1';
  const shoppingLines = [
    {
      commerceId: commerceIdForChainRef(cref),
      qty: 1,
      note: useManual ? 'Paso manual · kit orientativo' : r.chainRefLabel || cref,
    },
  ];
  emitEngineeringSnapshot({
    page: 'calc-chains',
    moduleLabel: 'Cadenas',
    advisorContext: {},
    shoppingLines,
    metrics: { energyEfficiencyPct: 97, materialUtilizationPct: null },
  });
  setLabPurchaseFromShoppingLines(document.getElementById('labPurchaseSuggestions'), shoppingLines, [
    { label: 'Piñon cadena a juego', searchQuery: 'piñon cadena rodillos acero' },
  ]);

  updateLabShareVisibility('cShareLinkWrap', 'cResults');
  chainUrl.serializeToUrl();
}

const wrap = document.getElementById('cResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);

const chainPresets = mountLabPresetsBar('cPresetsBar', CHAIN_PRESETS, debounced);

function scheduleChainRecalc() {
  if (!chainPresets.applying && !chainUrl.hydrating) {
    chainPresets.clearActive();
  }
  debounced();
}

chainUrl.hydrateFromUrl();
syncPitchDisabled();

bindLabUnitSelectors(scheduleChainRecalc);
['cPitch', 'cZ1', 'cZ2', 'cCenter', 'cN1', 'cChainRef', 'cManualPitch'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleChainRecalc);
  document.getElementById(id)?.addEventListener('change', scheduleChainRecalc);
});
manualEl?.addEventListener('change', scheduleChainRecalc);
wireLabCopyLink('cCopyLinkBtn', 'cCopyToast');
runCalcWithIndustrialFeedback(wrap, refreshCore);
mountLabCloudSaveBar('Cadenas de transmisi\u00f3n');
