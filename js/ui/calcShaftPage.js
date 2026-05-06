import { mountTierStatusBar } from './paywallMount.js';
import { renderShaftTorsionDiagram } from '../lab/diagramShaft.js';
import { bindLabUnitSelectors, formatLength, getLabUnitPrefs } from '../lab/labUnitPrefs.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import {
  debounce,
  executiveSummaryAlert,
  labAlert,
  metricHtml,
  renderResultHero,
  runCalcWithIndustrialFeedback,
} from './labCalcUx.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { setLabPurchaseFromShoppingLines } from './labPurchaseSuggestions.js';
import { metricsFromShaft } from '../services/iaAdvisor.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';

mountTierStatusBar();
bootSmartDashboardIfEnabled('Eje · laboratorio');
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
  if (!(el instanceof HTMLInputElement)) return;
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

function readSelect(id, fallback) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLSelectElement)) return fallback;
  return el.value || fallback;
}

function syncAdvancedUi() {
  const use = document.getElementById('shUseBending');
  const enabled = use instanceof HTMLInputElement && use.checked;
  ['shMRow', 'shCriterionRow', 'shKtRow'].forEach((id) => {
    const row = document.getElementById(id);
    if (!row) return;
    row.classList.toggle('sh-advanced-row--hidden', !enabled);
  });
}

function syncShCalcModeUi() {
  const diag = readSelect('shCalcMode', 'design') === 'diagnostic';
  const lbl = document.getElementById('shAvailableDLabel');
  const dh = document.getElementById('shAvailableDHelp');
  const th = document.getElementById('shTHelp');
  if (lbl) {
    lbl.textContent = diag
      ? 'Diámetro del eje instalado (mm)'
      : 'Diámetro disponible / comercial (mm)';
  }
  if (dh) {
    dh.textContent = diag
      ? 'Medida real de la sección resistente en el tramo analizado (sin filetear ni muescas).'
      : 'Para comprobar que un diámetro de compra o normalizado cubre el mínimo analítico.';
  }
  if (th) {
    th.textContent = diag
      ? 'Par de trabajo que aplica la transmisión sobre este eje (N·m).'
      : 'Par torsor de diseño que debe transmitir el eje (N·m). Entra en τ = 16T/(πd³) para sección circular maciza.';
  }
}

function refreshCore() {
  const u = getLabUnitPrefs();
  const validationMsgs = [];
  const mode = readSelect('shCalcMode', 'design');
  const tRaw = parseNumberInput('shT').value;
  const tauRaw = parseNumberInput('shTau').value;
  const mRaw = parseNumberInput('shM').value;
  const ktRaw = parseNumberInput('shKt').value;
  const dAvailRaw = parseNumberInput('shAvailableD').value;
  const useBendingEl = document.getElementById('shUseBending');
  const useBending = useBendingEl instanceof HTMLInputElement && useBendingEl.checked;
  const criterion = readSelect('shCriterion', 'von_mises');
  const torqueInvalid = !(tRaw != null && tRaw >= 0);
  const tauInvalid = !(tauRaw != null && tauRaw > 0);
  const mInvalid = useBending ? !(mRaw != null && mRaw >= 0) : false;
  const ktInvalid = useBending ? !(ktRaw != null && ktRaw >= 1) : false;
  const dAvailInvalid = !(dAvailRaw != null && dAvailRaw > 0);
  markFieldInvalid('shT', torqueInvalid, 'Torque must be >= 0');
  markFieldInvalid('shTau', tauInvalid, 'Allowable stress must be > 0');
  markFieldInvalid('shM', mInvalid, 'Bending moment must be >= 0');
  markFieldInvalid('shKt', ktInvalid, 'Kt must be >= 1');
  markFieldInvalid('shAvailableD', dAvailInvalid, 'Available diameter must be > 0');
  if (torqueInvalid) validationMsgs.push('Revise torque T: it must be zero or positive.');
  if (tauInvalid) validationMsgs.push('Revise allowable shear stress tau adm: it must be greater than 0.');
  if (mInvalid) validationMsgs.push('Revise bending moment M: it must be zero or positive.');
  if (ktInvalid) validationMsgs.push('Revise Kt: use Kt >= 1.');
  if (dAvailInvalid) validationMsgs.push('Revise available diameter: it must be greater than 0.');

  const T = read('shT', 480);
  const tauAllow_MPa = read('shTau', 40);
  const M = useBending ? read('shM', 0) : 0;
  const Kt = useBending ? read('shKt', 1.0) : 1.0;
  const dAvail_mm = read('shAvailableD', 40);
  const tauAllow_Pa = tauAllow_MPa * 1e6;
  const sigmaAllow_MPa = Math.sqrt(3) * tauAllow_MPa;

  let diameter_min_mm;
  let tauTor_MPa;
  let sigmaBend_MPa;
  let sigmaEq_MPa;
  let fitOk;
  let diagUtil = null;

  if (mode === 'diagnostic') {
    const d_m = dAvail_mm / 1000;
    tauTor_MPa = d_m > 0 ? (Kt * 16 * T) / (Math.PI * d_m ** 3) / 1e6 : 0;
    sigmaBend_MPa = d_m > 0 ? (Kt * 32 * M) / (Math.PI * d_m ** 3) / 1e6 : 0;
    sigmaEq_MPa =
      criterion === 'tresca'
        ? 2 * Math.sqrt((sigmaBend_MPa / 2) ** 2 + tauTor_MPa ** 2)
        : Math.sqrt(sigmaBend_MPa ** 2 + 3 * tauTor_MPa ** 2);
    diagUtil = useBending ? sigmaEq_MPa / sigmaAllow_MPa : tauTor_MPa / tauAllow_MPa;
    fitOk = diagUtil <= 1;
    diameter_min_mm = dAvail_mm;
  } else {
    const baseVm = Math.sqrt((32 * M) ** 2 + 3 * (16 * T) ** 2);
    const baseTresca = 16 * Math.sqrt(M ** 2 + T ** 2);
    const d_m =
      criterion === 'tresca'
        ? Math.pow((Kt * baseTresca) / (Math.PI * tauAllow_Pa), 1 / 3)
        : Math.pow((Kt * baseVm) / (Math.PI * Math.sqrt(3) * tauAllow_Pa), 1 / 3);
    diameter_min_mm = d_m * 1000;
    tauTor_MPa = d_m > 0 ? (Kt * 16 * T) / (Math.PI * d_m ** 3) / 1e6 : 0;
    sigmaBend_MPa = d_m > 0 ? (Kt * 32 * M) / (Math.PI * d_m ** 3) / 1e6 : 0;
    sigmaEq_MPa =
      criterion === 'tresca'
        ? 2 * Math.sqrt((sigmaBend_MPa / 2) ** 2 + tauTor_MPa ** 2)
        : Math.sqrt(sigmaBend_MPa ** 2 + 3 * tauTor_MPa ** 2);
    fitOk = dAvail_mm >= diameter_min_mm;
  }

  const r = {
    torque_Nm: T,
    tauAllow_MPa,
    diameter_min_mm,
    tauAtMinDiameter_MPa: tauTor_MPa,
  };

  const heroEl = document.getElementById('shHero');
  if (heroEl) {
    const heroItems =
      mode === 'diagnostic'
        ? [
            {
              label: useBending ? 'Utilización σeq / σadm' : 'Utilización τ / τadm',
              display:
                diagUtil != null && Number.isFinite(diagUtil)
                  ? `${(diagUtil * 100).toFixed(1)} %`
                  : '—',
              hint:
                diagUtil != null && Number.isFinite(diagUtil)
                  ? `FS nominal ≈ ${(1 / diagUtil).toFixed(2)} (modelo estático simplificado).`
                  : '—',
            },
            {
              label: useBending ? 'σeq en eje instalado' : 'τ en eje instalado',
              display: useBending ? `${sigmaEq_MPa.toFixed(2)} MPa` : `${tauTor_MPa.toFixed(2)} MPa`,
              hint: `Diámetro fijo ${dAvail_mm.toFixed(2)} mm · ${criterion === 'tresca' ? 'Tresca' : 'Von Mises'}.`,
            },
          ]
        : [
            {
              label: 'Diámetro mínimo (macizo)',
              display: formatLength(r.diameter_min_mm, u.length),
              hint: useBending ? 'Combinado T+M con Kt.' : 'Torsión pura; valide chaveteros, fatiga y medida comercial.',
            },
            {
              label: useBending ? 'σeq en diámetro mínimo' : 'Tensión a ese diámetro',
              display: useBending ? `${sigmaEq_MPa.toFixed(2)} MPa` : `${r.tauAtMinDiameter_MPa.toFixed(2)} MPa`,
              hint: useBending
                ? `${criterion === 'tresca' ? 'Tresca' : 'Von Mises'} con Kt = ${Kt.toFixed(2)}.`
                : `Comparar con su τ adm = ${r.tauAllow_MPa.toFixed(2)} MPa.`,
            },
          ];
    heroEl.innerHTML = renderResultHero(heroItems);
  }

  const fitVerdict = document.getElementById('shFitVerdict');
  if (fitVerdict) {
    fitVerdict.innerHTML =
      mode === 'diagnostic'
        ? `<div class="lab-verdict ${fitOk ? 'lab-verdict--ok' : 'lab-verdict--err'}">
      Veredicto eje instalado: <strong>${fitOk ? 'APTO' : 'REVISAR'}</strong> · d = ${dAvail_mm.toFixed(2)} mm
      ${diagUtil != null && Number.isFinite(diagUtil) ? `· utilización ${(diagUtil * 100).toFixed(1)} %` : ''}.
    </div>`
        : `<div class="lab-verdict ${fitOk ? 'lab-verdict--ok' : 'lab-verdict--err'}">
      Veredicto de diámetro disponible: <strong>${fitOk ? 'APTO' : 'INSUFICIENTE'}</strong> · requerido ≈ ${diameter_min_mm.toFixed(2)} mm, disponible = ${dAvail_mm.toFixed(2)} mm.
    </div>`;
  }

  const box = document.getElementById('shResults');
  if (box) {
    const rows =
      mode === 'diagnostic'
        ? [
            metricHtml(
              'Diámetro analizado',
              formatLength(dAvail_mm, u.length),
              'Geometría instalada introducida por el usuario.',
            ),
            metricHtml(
              useBending ? 'σ equivalente' : 'Tensión tangencial τ',
              useBending ? `${sigmaEq_MPa.toFixed(2)} MPa` : `${tauTor_MPa.toFixed(2)} MPa`,
              useBending ? `Límite ref. σadm = ${sigmaAllow_MPa.toFixed(2)} MPa.` : `Comparar con τadm = ${tauAllow_MPa.toFixed(2)} MPa.`,
            ),
            metricHtml(
              'Utilización',
              diagUtil != null && Number.isFinite(diagUtil) ? `${(diagUtil * 100).toFixed(1)} %` : '—',
              'Modelo estático; no sustituye fatiga ni velocidad crítica.',
            ),
            metricHtml(
              'Modo de cálculo',
              useBending ? `Avanzado · ${criterion === 'tresca' ? 'Tresca' : 'Von Mises'} · Kt = ${Kt.toFixed(2)}` : 'Básico · torsión pura',
              'Diagnóstico con diámetro fijo.',
            ),
            metricHtml(
              'Momento flector M',
              `${M.toFixed(2)} N·m`,
              'Solo aplica en modo avanzado.',
            ),
            metricHtml(
              'σ flexión',
              `${sigmaBend_MPa.toFixed(2)} MPa`,
              'Con Kt aplicado.',
            ),
            metricHtml(
              'Tensión admisible τ (entrada)',
              `${r.tauAllow_MPa.toFixed(2)} MPa`,
              'Criterio suyo según material y norma.',
            ),
          ]
        : [
            metricHtml(
              'Diámetro mínimo',
              formatLength(r.diameter_min_mm, u.length),
              'A partir de τ = 16T/(πd³); sin muescas ni concentradores.',
            ),
            metricHtml(
              'Tensión tangencial calculada',
              `${r.tauAtMinDiameter_MPa.toFixed(2)} MPa`,
              'Debería igualar τ adm si el cierre analítico es coherente.',
            ),
            metricHtml(
              'Modo de cálculo',
              useBending ? `Avanzado · ${criterion === 'tresca' ? 'Tresca' : 'Von Mises'} · Kt = ${Kt.toFixed(2)}` : 'Básico · torsión pura',
              'El modo avanzado combina flexión y torsión.',
            ),
            metricHtml(
              'Momento flector M',
              `${M.toFixed(2)} N·m`,
              'Solo aplica en modo avanzado.',
            ),
            metricHtml(
              'σ flexión en diámetro mínimo',
              `${sigmaBend_MPa.toFixed(2)} MPa`,
              'Con Kt aplicado.',
            ),
            metricHtml(
              'σ equivalente',
              `${sigmaEq_MPa.toFixed(2)} MPa`,
              useBending ? 'Comparar contra límite admisible del criterio elegido.' : 'En básico coincide con torsión equivalente.',
            ),
            metricHtml(
              'Tensión admisible (entrada)',
              `${r.tauAllow_MPa.toFixed(2)} MPa`,
              'Criterio suyo según material y norma.',
            ),
          ];
    box.innerHTML = rows.join('');
  }
  const alerts = document.getElementById('shAlerts');
  if (alerts) {
    const parts = [];
    parts.push(
      executiveSummaryAlert({
        level: validationMsgs.length ? 'danger' : !fitOk ? 'warn' : 'ok',
        titleEs: validationMsgs.length
          ? 'Resumen ejecutivo: revisar entradas antes de validar diámetro.'
          : mode === 'diagnostic' && !fitOk
            ? 'Resumen ejecutivo: el eje instalado supera el criterio admisible con la carga indicada.'
            : mode === 'diagnostic' && fitOk
              ? 'Resumen ejecutivo: tensiones coherentes con el diámetro instalado (modelo estático).'
              : !fitOk
                ? 'Resumen ejecutivo: el diámetro disponible no alcanza el mínimo calculado.'
                : 'Resumen ejecutivo: diámetro mínimo calculado y verificado contra disponible.',
        titleEn: validationMsgs.length
          ? 'Executive summary: review inputs before validating diameter.'
          : mode === 'diagnostic' && !fitOk
            ? 'Executive summary: installed shaft exceeds allowable criterion at stated load.'
            : mode === 'diagnostic' && fitOk
              ? 'Executive summary: stresses are consistent with installed diameter (static model).'
              : !fitOk
                ? 'Executive summary: available diameter is below required minimum.'
                : 'Executive summary: minimum diameter calculated and checked against available size.',
        actionsEs: validationMsgs.length
          ? ['Corregir campos en rojo.', 'Recalcular para emitir recomendación de compra.']
          : mode === 'diagnostic' && !fitOk
            ? ['Aumentar diámetro, reducir T o M, o revisar material (τadm).', 'Comprobar concentradores con Kt.']
            : !fitOk
              ? ['Aumentar diámetro disponible o reducir cargas.', 'Revisar Kt y criterio para cierre de diseño.']
              : ['Añadir margen comercial de diámetro.', 'Comprobar chavetero, fatiga y concentradores.'],
        actionsEn: validationMsgs.length
          ? ['Fix fields marked in red.', 'Recalculate before issuing purchase guidance.']
          : mode === 'diagnostic' && !fitOk
            ? ['Increase diameter, reduce T or M, or review material (tau adm).', 'Review stress concentrations with Kt.']
            : !fitOk
              ? ['Increase available diameter or reduce loads.', 'Review Kt and criterion before release.']
              : ['Add commercial diameter margin.', 'Check keyway, fatigue, and stress raisers.'],
      }),
    );
    validationMsgs.forEach((msg) => parts.push(labAlert('danger', msg)));
    if (validationMsgs.length === 0) {
      parts.push(
        labAlert(
          'info',
          useBending
            ? 'Modo avanzado activo: resultado combinado T+M con Kt. Verificar geometría real de entallas/chaveteros.'
            : 'Dimensionado en modo básico (torsión pura).',
        ),
      );
      if (mode === 'design' && diameter_min_mm < 15) {
        parts.push(
          labAlert(
            'warn',
            'Diámetro calculado < 15 mm: en diámetros pequeños los efectos de entalla son más críticos; conviene usar Kt > 1.',
          ),
        );
      }
      parts.push(
        labAlert(
          'info',
          'Hipótesis: este modelo no incluye fatiga detallada, análisis de frecuencias críticas (velocidad crítica), ni verificación de deflexión. Para ejes de transmisión industrial, usar método completo DIN 743 o equivalente.',
        ),
      );
    }
    alerts.innerHTML = parts.join('');
  }
  renderShaftTorsionDiagram(document.getElementById('shDiagram'), {
    diameter_mm: mode === 'diagnostic' ? dAvail_mm : r.diameter_min_mm,
    showBending: useBending,
    moment_Nm: M,
  });

  const shopD = mode === 'diagnostic' ? dAvail_mm : r.diameter_min_mm;
  const shoppingLines = [
    {
      commerceId: 'shaft-turned-quote',
      qty: 1,
      note:
        mode === 'diagnostic'
          ? `d instalado ${shopD.toFixed(2)} mm · util. ${diagUtil != null ? `${(diagUtil * 100).toFixed(0)} %` : '—'}`
          : `dₘᵢₙ macizo ≈ ${r.diameter_min_mm.toFixed(2)} mm · τ = ${r.tauAtMinDiameter_MPa.toFixed(1)} MPa`,
    },
  ];
  emitEngineeringSnapshot({
    page: 'calc-shaft',
    moduleLabel: 'Eje a torsión',
    advisorContext: {},
    shoppingLines,
    metrics: metricsFromShaft({
      tauAllow_MPa: r.tauAllow_MPa,
      tauAtMinDiameter_MPa: r.tauAtMinDiameter_MPa,
    }),
  });
  setLabPurchaseFromShoppingLines(document.getElementById('labPurchaseSuggestions'), shoppingLines, [
    {
      label: 'Barra acero torno',
      searchQuery: `barra redonda acero ${Math.ceil(shopD)} mm`,
    },
  ]);
}

const wrap = document.getElementById('shResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);
bindLabUnitSelectors(debounced);
['shCalcMode', 'shT', 'shTau', 'shM', 'shKt', 'shCriterion', 'shUseBending', 'shAvailableD'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', debounced);
  document.getElementById(id)?.addEventListener('change', () => {
    if (id === 'shCalcMode') syncShCalcModeUi();
    debounced();
  });
});
document.getElementById('shUseBending')?.addEventListener('change', () => {
  syncAdvancedUi();
  debounced();
});
document.querySelectorAll('#shTauChips [data-tau]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tau = Number(btn.getAttribute('data-tau'));
    const tauEl = document.getElementById('shTau');
    if (tauEl instanceof HTMLInputElement && Number.isFinite(tau)) {
      tauEl.value = String(tau);
      debounced();
    }
  });
});
syncAdvancedUi();
syncShCalcModeUi();
runCalcWithIndustrialFeedback(wrap, refreshCore);
