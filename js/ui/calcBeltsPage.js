import { mountTierStatusBar } from './paywallMount.js';
import {
  V_BELT_PROFILES,
  SYNC_PITCH_PRESETS,
  POLY_V_PROFILES,
  computeBeltDriveTransmission,
} from '../lab/beltDrives.js';
import { renderBeltDriveDiagram } from '../lab/diagramBelts.js';
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
  metricHtml,
  mountLabPresetsBar,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  updateLabShareVisibility,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { commerceIdForBeltSelection } from '../data/commerceCatalog.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { setLabPurchaseFromShoppingLines } from './labPurchaseSuggestions.js';
import { metricsFromBeltType } from '../services/iaAdvisor.js';
import { bindCommerceFilteredSelect } from './commerceSelectBind.js';
import { bootSmartDashboardIfEnabled, isSmartLabDashboardActive } from './smartDashboardBoot.js';
import { LAB_AFFILIATE } from '../config/labAffiliate.js';
import { getLabLang } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { BELTS_PAGE_EN } from '../lab/i18n/pages/beltsEn.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';

function bx(es, en) {
  return getLabLang() === 'en' ? en : es;
}

/** Mirrors `beltLinearSpeedVerdict` bands with EN copy for the UI. */
function beltSpeedVerdictUi(r) {
  const sv = r.speedVerdict;
  if (!sv || sv.key === 'unknown') return null;
  if (getLabLang() !== 'en') return { title: sv.title, detail: sv.detail };
  const bt = r.beltType;
  const bands =
    bt === 'synchronous'
      ? { min: 5, maxRec: 40, max: 50, label: 'Synchronous' }
      : bt === 'poly_v'
        ? { min: 10, maxRec: 40, max: 60, label: 'Poly-V' }
        : bt === 'flat'
          ? { min: 5, maxRec: 30, max: 50, label: 'Flat' }
          : { min: 10, maxRec: 25, max: 30, label: 'Trapezoidal (V)' };
  const v = r.beltSpeed_m_s;
  if (v == null || !Number.isFinite(v)) {
    return {
      title: 'No data',
      detail: 'Enter n\u2081 > 0 and diameters to estimate v.',
    };
  }
  if (v > bands.max) {
    return {
      title: `Exceeds ${bands.label} limit`,
      detail: `v > ${bands.max} m/s. Above the indicative maximum for ${bands.label}; validate with manufacturer data.`,
    };
  }
  if (v < bands.min || v > bands.maxRec) {
    return {
      title: 'Outside recommended band',
      detail: `Recommended band for ${bands.label}: ${bands.min}\u2013${bands.maxRec} m/s.`,
    };
  }
  return {
    title: 'Recommended band',
    detail: `${bands.min} m/s \u2264 v \u2264 ${bands.maxRec} m/s for ${bands.label}.`,
  };
}

function beltLabFinalVerdict(r) {
  if (r.geometryValid === false) return 'error';
  const sk = r.speedVerdict?.key;
  if (sk === 'critical') return 'error';
  if (sk === 'low') return 'warn';
  if (sk === 'optimal') return 'ok';
  return undefined;
}

const BELT_PRESETS = [
  {
    label: 'Motor → ventilador industrial',
    labelKey: 'belt.preset1',
    values: {
      bBeltType: 'v_trapezoidal',
      bVProfile: 'SPA',
      bD1: 125,
      bD2: 280,
      bC: 520,
      bN1: 1455,
      bPowerKw: 7.5,
      bSlip: 1.5,
    },
  },
  {
    label: 'Servomotor → husillo CNC',
    labelKey: 'belt.preset2',
    values: {
      bBeltType: 'synchronous',
      bSyncPitch: '5',
      bZ1: 20,
      bZ2: 40,
      bC: 300,
      bN1: 3000,
    },
  },
  {
    label: 'Motor → bomba centrífuga',
    labelKey: 'belt.preset3',
    values: {
      bBeltType: 'v_trapezoidal',
      bVProfile: 'SPB',
      bD1: 160,
      bD2: 315,
      bC: 600,
      bN1: 1450,
      bPowerKw: 15,
      bSlip: 1.5,
    },
  },
];

mountTierStatusBar();
bootSmartDashboardIfEnabled('Correas · laboratorio');
wireAdvisorPowerField();
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();

function wireAdvisorPowerField() {
  const active = isSmartLabDashboardActive();
  const cta = document.getElementById('bPowerAdvisorCta');
  const inactive = document.getElementById('bPowerAdvisorInactive');
  const details = document.getElementById('bPowerAdvisorDetails');
  const openBtn = document.getElementById('bPowerAdvisorOpenBtn');
  const summary = details?.querySelector('summary');

  if (cta instanceof HTMLElement) cta.hidden = active;
  if (inactive instanceof HTMLElement) inactive.hidden = active;
  if (details instanceof HTMLDetailsElement) {
    details.classList.toggle('lab-advisor-field-details--panel-on', active);
  }
  if (summary) {
    summary.setAttribute('data-i18n', active ? 'belt.advisorPowerSummary' : 'belt.advisorPowerSummaryOff');
    summary.textContent = active
      ? bx('Asesor IA · comparación de pérdidas (opcional)', 'AI advisor · loss comparison (optional)')
      : bx('Asesor IA (inactivo) · potencia opcional', 'AI advisor (off) · optional power');
  }

  openBtn?.addEventListener('click', () => {
    if (details instanceof HTMLDetailsElement) {
      details.open = true;
      document.getElementById('bPowerKw')?.focus();
    }
  });
}

function read(id, fallback) {
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

function readOptionalNonNeg(id) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return null;
  const s = el.value.trim();
  if (s === '') return null;
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function elementCardHtml(title, rows) {
  const body = rows
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
    .join('');
  return `<article class="lab-element-card"><h4 class="lab-element-card__title">${esc(title)}</h4><dl class="lab-element-card__kv">${body}</dl></article>`;
}

bindCommerceFilteredSelect('bVProfile', V_BELT_PROFILES, 'id', 'label', (o) => `belt-v-${o.id}`);
bindCommerceFilteredSelect('bPolyProfile', POLY_V_PROFILES, 'id', 'label', (o) => `belt-poly-${o.id}`);
bindCommerceFilteredSelect(
  'bSyncPitch',
  SYNC_PITCH_PRESETS.map((o) => ({ id: o.id, label: o.label })),
  'id',
  'label',
  (o) => `belt-sync-${o.id}`,
);
const vProf = document.getElementById('bVProfile');
if (vProf instanceof HTMLSelectElement) vProf.value = 'SPA';
const syncSel = document.getElementById('bSyncPitch');
if (syncSel instanceof HTMLSelectElement) syncSel.value = '5';

mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'bD1', min: 10, max: 2000, label: 'Diámetro motriz d₁' },
  { id: 'bD2', min: 10, max: 2000, label: 'Diámetro conducida d₂' },
  { id: 'bC', min: 50, max: 5000, label: 'Distancia entre centros C' },
  { id: 'bN1', min: 0, max: 30000, label: 'RPM motrices n₁' },
  { id: 'bPowerKw', min: 0, max: 10000, label: 'Potencia' },
  { id: 'bSlip', min: 0, max: 15, label: 'Deslizamiento' },
  { id: 'bZ1', min: 6, max: 200, label: 'Dientes Z₁' },
  { id: 'bZ2', min: 6, max: 200, label: 'Dientes Z₂' },
]);

/** @returns {import('../lab/beltDrives.js').BeltDriveType} */
function currentBeltType() {
  const el = document.getElementById('bBeltType');
  return /** @type {import('../lab/beltDrives.js').BeltDriveType} */ (
    el instanceof HTMLSelectElement ? el.value : 'v_trapezoidal'
  );
}

function syncBeltFormUi() {
  const t = currentBeltType();
  document.querySelectorAll('[data-belt-show]').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const modes = (node.getAttribute('data-belt-show') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const visible = modes.includes(t);
    node.classList.add('belt-row--anim');
    if (visible) {
      node.classList.remove('belt-row--display-hidden');
      // Force reflow so transition from hidden state runs reliably.
      void node.offsetHeight;
      node.classList.remove('belt-row--hidden');
      node.setAttribute('aria-hidden', 'false');
    } else {
      node.classList.add('belt-row--hidden');
      node.setAttribute('aria-hidden', 'true');
      const onEnd = (ev) => {
        if (ev.propertyName !== 'max-height' && ev.propertyName !== 'opacity') return;
        node.classList.add('belt-row--display-hidden');
        node.removeEventListener('transitionend', onEnd);
      };
      node.addEventListener('transitionend', onEnd);
      // Fallback in case transitionend is skipped.
      window.setTimeout(() => {
        if (node.classList.contains('belt-row--hidden')) node.classList.add('belt-row--display-hidden');
      }, 240);
    }
  });

  const slipEl = document.getElementById('bSlip');
  if (slipEl instanceof HTMLInputElement) {
    if (t === 'synchronous') {
      if (!slipEl.disabled) slipEl.dataset.prevSlip = slipEl.value;
      slipEl.value = '0';
      slipEl.disabled = true;
      slipEl.setAttribute('aria-readonly', 'true');
    } else {
      slipEl.disabled = false;
      slipEl.removeAttribute('aria-readonly');
      const prev = slipEl.dataset.prevSlip;
      if (prev != null && prev !== '' && prev !== '0') slipEl.value = prev;
      else if (slipEl.value === '0') slipEl.value = '2';
    }
  }
}

function buildParams() {
  const beltType = currentBeltType();
  const C = read('bC', 520);
  const n1 = read('bN1', 0);
  const base = {
    beltType,
    center_mm: C,
    n1_rpm: n1 > 0 ? n1 : undefined,
    vBeltProfileId: readSelect('bVProfile', 'SPA'),
    polyVProfileId: readSelect('bPolyProfile', 'PK'),
    syncPitchId: readSelect('bSyncPitch', '5'),
  };

  if (beltType === 'synchronous') {
    return {
      ...base,
      Z1: read('bZ1', 20),
      Z2: read('bZ2', 40),
      slip_pct: 0,
    };
  }

  return {
    ...base,
    d1_mm: read('bD1', 125),
    d2_mm: read('bD2', 280),
    slip_pct: read('bSlip', 2),
  };
}

function renderSpeedVerdictEl(r) {
  const wrap = document.getElementById('bSpeedVerdict');
  if (!wrap) return;
  const svIn = r.speedVerdict;
  if (!svIn || svIn.key === 'unknown') {
    wrap.innerHTML = '';
    return;
  }
  const ui = beltSpeedVerdictUi(r);
  const title = ui ? ui.title : svIn.title;
  const detail = ui ? ui.detail : svIn.detail;
  const level =
    svIn.key === 'optimal' ? 'optimal' : svIn.key === 'low' ? 'low' : svIn.key === 'critical' ? 'critical' : 'info';
  wrap.innerHTML = `
    <div class="lab-belt-speed-verdict lab-belt-speed-verdict--${level}" role="status">
      <span class="lab-belt-speed-verdict__badge" aria-hidden="true">${
        level === 'optimal' ? '✓' : level === 'low' ? '!' : level === 'critical' ? '⚠' : '·'
      }</span>
      <div class="lab-belt-speed-verdict__text">
        <strong class="lab-belt-speed-verdict__title">${esc(title)}</strong>
        <span class="lab-belt-speed-verdict__detail">${esc(detail)}</span>
      </div>
      <span class="lab-belt-speed-verdict__v">v ≈ ${r.beltSpeed_m_s != null && Number.isFinite(r.beltSpeed_m_s) ? `${r.beltSpeed_m_s.toFixed(2)} m/s` : '—'}</span>
    </div>`;
}

function refreshCore() {
  const u = getLabUnitPrefs();
  const p = buildParams();
  const r = computeBeltDriveTransmission(p);
  const bt = r.beltType;

  const heroEl = document.getElementById('bHero');
  if (heroEl) {
    const hint2 =
      bt === 'synchronous'
        ? bx(
            'Engranaje de dientes: misma velocidad de correa, sin deslizamiento cinemático (modelo ideal).',
            'Tooth meshing: same belt speed, no kinematic slip (ideal model).',
          )
        : bx(
            'Incluye modelo de deslizamiento en la polea conducida (V / plana / Poly-V).',
            'Includes slip model on the driven pulley (V / flat / Poly-V).',
          );
    const bv = beltLabFinalVerdict(r);
    heroEl.innerHTML = renderResultHero(
      [
      {
        label: bx(
          'ω₂ — velocidad angular · polea 2 (conducida)',
          '\u03c9\u2082 — angular speed · pulley 2 (driven)',
        ),
        display: r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—',
        hint: hint2,
      },
      {
        label: bx(
          'Velocidad lineal de correa (primitivo · polea 1)',
          'Belt linear speed (pitch circle · pulley 1)',
        ),
        display: formatLinearSpeed(r.beltSpeed_m_s, u.linear),
        hint: bx(
          'v = ω₁ · r₁ = π d₁ n₁ / 60 000 (d₁ en mm, n₁ en RPM → m/s).',
          'v = \u03c9\u2081 · r\u2081 = \u03c0 d\u2081 n\u2081 / 60 000 (d\u2081 in mm, n\u2081 in RPM \u2192 m/s).',
        ),
      },
    ],
      bv ? { verdict: bv } : {},
    );
  }

  renderSpeedVerdictEl(r);

  const elementBox = document.getElementById('bElementResults');
  if (elementBox) {
    const p1Rows = [
      [bx('Diam. primitivo (d₁)', 'Prim. dia. (d\u2081)'), formatLength(r.d1, u.length)],
      [bx('Velocidad (n₁)', 'Speed (n\u2081)'), formatRotation(r.n1_rpm, u.rotation)],
      [bx('Velocidad correa (v)', 'Belt speed (v)'), formatLinearSpeed(r.beltSpeed_m_s, u.linear)],
    ];
    const p2Rows = [
      [bx('Diam. primitivo (d₂)', 'Prim. dia. (d\u2082)'), formatLength(r.d2, u.length)],
      [bx('Velocidad (n₂)', 'Speed (n\u2082)'), r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—'],
      [bx('Relación (i)', 'Ratio (i)'), r.ratio_i.toFixed(2)],
    ];
    if (bt === 'synchronous' && r.Z1 != null && r.Z2 != null) {
      p1Rows.unshift([bx('Dientes (Z₁)', 'Teeth (Z\u2081)'), String(r.Z1)]);
      p2Rows.unshift([bx('Dientes (Z₂)', 'Teeth (Z\u2082)'), String(r.Z2)]);
    }
    p2Rows.push([bx('Deslizamiento (s)', 'Slip (s)'), `${r.slip_pct.toFixed(2)} %`]);
    elementBox.innerHTML = [
      elementCardHtml(bx('Polea 1 · Motriz', 'Pulley 1 · Driving'), p1Rows),
      elementCardHtml(bx('Polea 2 · Conducida', 'Pulley 2 · Driven'), p2Rows),
    ].join('');
  }

  const box = document.getElementById('bResults');
  if (box) {
    const cells = [
      metricHtml(
        bx('Tipo y referencia', 'Type & reference'),
        esc(r.profileNote),
        bx(
          'Identificador de perfil o paso; la selección de servicio sigue catálogo y norma citada.',
          'Profile or pitch identifier; service selection follows catalogue and cited standard.',
        ),
      ),
      metricHtml(
        bx('Relación de transmisión i (≈ d₂/d₁ o Z₂/Z₁)', 'Transmission ratio i (\u2248 d\u2082/d\u2081 or Z\u2082/Z\u2081)'),
        r.ratio_i.toFixed(2),
        bx(
          'Reductor si i > 1 (salida más lenta que entrada en el esquema habitual).',
          'Reducer if i > 1 (output slower than input in the usual layout).',
        ),
      ),
      metricHtml(
        bx('Longitud primitiva de correa L (aprox.)', 'Primitive belt length L (approx.)'),
        formatLength(r.beltLength_mm, u.length),
        bx(
          'Correa abierta: L ≈ 2C + π(d₁+d₂)/2 + (d₂−d₁)²/(4C).',
          'Open belt: L \u2248 2C + \u03c0(d\u2081+d\u2082)/2 + (d\u2082\u2212d\u2081)\xb2/(4C).',
        ),
      ),
      metricHtml(
        bx('Distancia entre centros C', 'Centre distance C'),
        formatLength(r.center_mm, u.length),
        bx(
          'Condiciona ángulo de abrazamiento y flecha del tramo.',
          'Sets wrap angle and span sag.',
        ),
      ),
    ];

    if (bt === 'synchronous' && r.Z1 != null && r.Z2 != null) {
      cells.push(
        metricHtml(
          bx('Z₁ · dientes · polea 1 (motriz)', 'Z\u2081 · teeth · pulley 1 (driving)'),
          String(r.Z1),
          bx(
            `Diámetro primitivo D₁ = p·Z₁/π = ${formatLength(r.d1, u.length)}.`,
            `Primitive diameter D\u2081 = p\u00b7Z\u2081/\u03c0 = ${formatLength(r.d1, u.length)}.`,
          ),
        ),
        metricHtml(
          bx('Z₂ · dientes · polea 2 (conducida)', 'Z\u2082 · teeth · pulley 2 (driven)'),
          String(r.Z2),
          bx(
            `D₂ = p·Z₂/π = ${formatLength(r.d2, u.length)}.`,
            `D\u2082 = p\u00b7Z\u2082/\u03c0 = ${formatLength(r.d2, u.length)}.`,
          ),
        ),
      );
    } else {
      cells.push(
        metricHtml(
          bx('d₁ · primitivo · polea 1 (motriz)', 'd\u2081 · primitive · pulley 1 (driving)'),
          formatLength(r.d1, u.length),
          bx('Referencia de velocidad periférica.', 'Reference for peripheral speed.'),
        ),
        metricHtml(
          bx('d₂ · primitivo · polea 2 (conducida)', 'd\u2082 · primitive · pulley 2 (driven)'),
          formatLength(r.d2, u.length),
          bx(
            'Salida cinemática antes/después del deslizamiento según tipo de correa.',
            'Kinematic output before/after slip depending on belt type.',
          ),
        ),
      );
    }

    if (r.slipApplied) {
      cells.push(
        metricHtml(
          bx('Deslizamiento s (modelo)', 'Slip s (model)'),
          `${r.slip_pct.toFixed(2)} %`,
          bx(
            'Aplicado al n₂ teórico en correas flexibles.',
            'Applied to theoretical n\u2082 on flexible belts.',
          ),
        ),
        metricHtml(
          bx('ω₂,th — polea 2 (sin deslizamiento)', '\u03c9\u2082,th — pulley 2 (no slip)'),
          r.n2_rpm_theoretical != null ? formatRotation(r.n2_rpm_theoretical, u.rotation) : '—',
          bx('n₂,th = n₁ · d₁/d₂.', 'n\u2082,th = n\u2081 \u00b7 d\u2081/d\u2082.'),
        ),
        metricHtml(
          bx('ω₂ — polea 2 (real)', '\u03c9\u2082 — pulley 2 (actual)'),
          r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—',
          bx('n₂,real = n₂,th · (1 − s).', 'n\u2082,real = n\u2082,th \u00b7 (1 \u2212 s).'),
        ),
      );
    } else {
      cells.push(
        metricHtml(
          bx('Deslizamiento s (síncrona)', 'Slip s (synchronous)'),
          `${r.slip_pct.toFixed(2)} %`,
          bx(
            'Sin deslizamiento cinemático en el modelo ideal; el valor del formulario no aplica.',
            'No kinematic slip in the ideal model; the form field value is ignored.',
          ),
        ),
        metricHtml(
          bx('ω₂ — polea 2 (síncrona)', '\u03c9\u2082 — pulley 2 (synchronous)'),
          r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—',
          bx('n₂ = n₁ · Z₁/Z₂ = n₁ · D₁/D₂.', 'n\u2082 = n\u2081 \u00b7 Z\u2081/Z\u2082 = n\u2081 \u00b7 D\u2081/D\u2082.'),
        ),
      );
    }

    cells.push(
      metricHtml(
        bx('Velocidad lineal v (primitivo motriz)', 'Linear speed v (driving primitive)'),
        formatLinearSpeed(r.beltSpeed_m_s, u.linear),
        bx(
          'Veredicto: verde en banda recomendada; amarillo fuera de banda; rojo si supera el máximo del tipo.',
          'Verdict: green in recommended band; yellow outside band; red if above type maximum.',
        ),
      ),
      metricHtml(
        bx('Ángulo de abrazamiento · polea menor', 'Wrap angle · smaller pulley'),
        `${r.wrapAngle_deg_small.toFixed(2)}°`,
        bt === 'flat' || bt === 'poly_v'
          ? bx(
              'La tracción y la capacidad de potencia dependen fuertemente del abrazamiento (plana / Poly-V).',
              'Traction and power capacity depend strongly on wrap (flat / Poly-V).',
            )
          : bx(
              'Suele ser la polea más exigente para tracción (correa flexible).',
              'Often the most demanding pulley for traction (flexible belt).',
            ),
      ),
      metricHtml(
        bx('Ángulo de abrazamiento · polea mayor', 'Wrap angle · larger pulley'),
        `${r.wrapAngle_deg_large.toFixed(2)}°`,
        bx('Contacto de correa en la polea mayor.', 'Belt contact on the larger pulley.'),
      ),
      metricHtml(
        bx('ω₁ — polea 1 (motriz)', '\u03c9\u2081 — pulley 1 (driving)'),
        formatRotation(r.n1_rpm, u.rotation),
        bx('Dato de entrada del formulario.', 'Input from the form.'),
      ),
    );

    box.innerHTML = cells.join('');
  }

  const alerts = document.getElementById('bAlerts');
  if (alerts) {
    const parts = [];
    const speedKey = r.speedVerdict?.key || '';
    const hasCriticalSpeed = speedKey === 'critical';
    const hasLowSpeed = speedKey === 'low';
    parts.push(
      executiveSummaryAlert({
        level: r.geometryValid === false ? 'danger' : hasCriticalSpeed ? 'warn' : 'ok',
        titleEs:
          r.geometryValid === false
            ? 'Resumen ejecutivo: geometría inválida para cálculo fiable.'
            : hasCriticalSpeed
              ? 'Resumen ejecutivo: geometría válida con velocidad de correa exigente.'
              : 'Resumen ejecutivo: resultado válido para preselección.',
        titleEn:
          r.geometryValid === false
            ? 'Executive summary: invalid geometry for reliable results.'
            : hasCriticalSpeed
              ? 'Executive summary: valid geometry with demanding belt speed.'
              : 'Executive summary: valid result for preselection.',
        actionsEs:
          r.geometryValid === false
            ? ['Ajustar distancia entre ejes o diámetros.', 'Recalcular antes de seleccionar referencia comercial.']
            : ['Confirmar tensión/alineación reales.', 'Cerrar selección con catálogo del fabricante.'],
        actionsEn:
          r.geometryValid === false
            ? ['Adjust center distance or pulley diameters.', 'Recalculate before selecting a commercial reference.']
            : ['Confirm real tension/alignment.', 'Close selection with supplier catalogue data.'],
      }),
    );
    if (r.geometryValid === false) {
      parts.push(
        labAlert(
          'danger',
          `${esc(
            bx(
              r.geometryNote,
              'Non-physical geometry: centre distance C must be greater than |d\u2082\u2212d\u2081|/2.',
            ),
          )} ${bx(
            'Ajuste C o diámetros antes de usar el resultado.',
            'Adjust C or diameters before using the result.',
          )}`,
        ),
      );
    } else {
      if (hasCriticalSpeed) {
        parts.push(
          labAlert(
            'warn',
            bx(
              'Velocidad de correa alta: revisar vibración, balanceo y límites del perfil.',
              'High belt speed: check vibration, balance and profile limits.',
            ),
          ),
        );
      } else if (hasLowSpeed) {
        parts.push(
          labAlert(
            'info',
            bx(
              'Velocidad de correa fuera de banda recomendada: validar con fabricante.',
              'Belt speed outside recommended band: validate with manufacturer.',
            ),
          ),
        );
      }
      parts.push(
        labAlert(
          'info',
          `${esc(r.profileNote)} · ${bx(
            'Compruebe tensión, alineación y datos de catálogo para dimensionado final.',
            'Check tension, alignment and catalogue data for final sizing.',
          )}`,
        ),
      );
    }
    parts.push(
      labAlert(
        'info',
        bx(
          'Hipótesis del modelo: no calcula tensiones de correa ni número de correas necesarias; requiere catálogo del fabricante para el dimensionado final.',
          'Model assumptions: does not compute belt tensions or number of belts; manufacturer catalogue required for final sizing.',
        ),
      ),
    );
    alerts.innerHTML = parts.join('');
  }

  const sub = document.getElementById('bSubstitution');
  if (sub && r.n1_rpm != null && r.beltSpeed_m_s != null) {
    const w1 = ((2 * Math.PI) / 60) * r.n1_rpm;
    const vDisp = formatLinearSpeed(r.beltSpeed_m_s, u.linear);
    let body = '';

    if (bt === 'synchronous' && r.pitch_mm != null && r.Z1 != null && r.Z2 != null) {
      const p = r.pitch_mm;
      const D1 = r.d1;
      const D2 = r.d2;
      const n2 = r.n2_rpm;
      body = `
        <p class="calc-substitution__step">
          ${bx('Primitivos:', 'Pitch circles:')} <code>D = p\u00b7Z/\u03c0</code> \u2192
          <code>D\u2081 = ${p.toFixed(3)} \u00d7 ${r.Z1} / \u03c0 = ${D1.toFixed(2)} mm</code>,
          <code>D\u2082 = ${p.toFixed(3)} \u00d7 ${r.Z2} / \u03c0 = ${D2.toFixed(2)} mm</code>
        </p>
        <p class="calc-substitution__step">
          ${bx('Velocidad angular motriz:', 'Driving angular speed:')} <code>\u03c9\u2081 = 2\u03c0 n\u2081/60 = ${w1.toFixed(2)} rad/s</code>
        </p>
        <p class="calc-substitution__step">
          ${bx('Velocidad lineal:', 'Linear speed:')} <code>v = \u03c9\u2081 \u00b7 (D\u2081/2000) = ${r.beltSpeed_m_s.toFixed(2)} m/s</code> \u2192 <strong>${vDisp}</strong>
        </p>
        <p class="calc-substitution__step">
          ${bx('Deslizamiento (síncrona):', 'Slip (synchronous):')} <code>s = ${r.slip_pct.toFixed(2)} %</code> \u2192 ${bx(
            'sin modelo de deslizamiento cinemático',
            'no kinematic slip model',
          )}
        </p>
        <p class="calc-substitution__step">
          ${bx('Salida (sin deslizamiento):', 'Output (no slip):')} <code>n\u2082 = n\u2081 \u00b7 D\u2081/D\u2082 = ${r.n1_rpm.toFixed(2)} \u00d7 ${D1.toFixed(2)} / ${D2.toFixed(2)} = ${n2 != null ? n2.toFixed(2) : '\u2014'} RPM</code>
        </p>`;
    } else {
      const d1 = r.d1;
      const d2 = r.d2;
      const n2t = r.n2_rpm_theoretical;
      const n2r = r.n2_rpm;
      body = `
        <p class="calc-substitution__step">
          ${bx('Velocidad angular:', 'Angular speed:')} <code>\u03c9\u2081 = 2\u03c0 n\u2081/60 = ${w1.toFixed(2)} rad/s</code>
        </p>
        <p class="calc-substitution__step">
          ${bx('Velocidad lineal en el primitivo motriz:', 'Linear speed at driving primitive:')} <code>v = \u03c9\u2081 \u00b7 (d\u2081/2000) = ${r.beltSpeed_m_s.toFixed(2)} m/s</code> \u2192 <strong>${vDisp}</strong>
          <span class="calc-substitution__muted">(${bx(
            'equivalente a',
            'same as',
          )} <code>v = \u03c0 d\u2081 n\u2081 / 60 000</code> ${bx('con d\u2081 en mm', 'with d\u2081 in mm')})</span>
        </p>
        <p class="calc-substitution__step">
          ${bx('Velocidad de salida (teórica):', 'Output speed (theoretical):')} <code>n\u2082,th = n\u2081 \u00b7 d\u2081/d\u2082 = ${r.n1_rpm.toFixed(2)} \u00d7 ${d1.toFixed(2)} / ${d2.toFixed(2)} = ${n2t != null ? n2t.toFixed(2) : '\u2014'} RPM</code>
        </p>
        ${
          r.slipApplied
            ? `<p class="calc-substitution__step">
          ${bx('Deslizamiento:', 'Slip:')} <code>s = ${r.slip_pct.toFixed(2)} %</code> \u2192 <code>n\u2082,real = n\u2082,th \u00b7 (1\u2212s) = ${n2r != null ? n2r.toFixed(2) : '\u2014'} RPM</code> \u2192 <strong>${formatRotation(n2r, u.rotation)}</strong>
        </p>`
            : ''
        }`;
    }

    sub.innerHTML = `
      <details class="calc-substitution">
        <summary class="calc-substitution__summary">
          <span class="calc-substitution__title">${bx(
            'Sustitución — cinemática y velocidad',
            'Substitution \u2014 kinematics & speed',
          )}</span>
        </summary>
        <div class="calc-substitution__inner">
          ${body}
        </div>
      </details>`;
  } else if (sub) {
    sub.innerHTML = '';
  }

  renderBeltDriveDiagram(document.getElementById('bDiagram'), r);

  const pKw = readOptionalNonNeg('bPowerKw');
  const beltCommerceId = commerceIdForBeltSelection(bt, {
    vProfileId: readSelect('bVProfile', 'SPA'),
    polyProfileId: readSelect('bPolyProfile', 'PK'),
    syncPitchId: readSelect('bSyncPitch', '5'),
  });
  const shoppingLines = [{ commerceId: beltCommerceId, qty: 1, note: esc(r.profileNote) }];
  const amzTag = Boolean(LAB_AFFILIATE.amazonAssociateTag?.trim());
  emitEngineeringSnapshot({
    page: 'calc-belts',
    moduleLabel: bx('Correas', 'Belts'),
    advisorLang: getLabLang(),
    advisorContext: {
      belt: { beltType: bt, powerKw: pKw },
    },
    shoppingLines,
    metrics: metricsFromBeltType(bt),
  });
  setLabPurchaseFromShoppingLines(document.getElementById('labPurchaseSuggestions'), shoppingLines, [], {
    title: bx('Ideas de compra (orientativas)', 'Shopping ideas (indicative)'),
    linkLabel: bx('Buscar en Amazon', 'Search on Amazon'),
    disclosure: amzTag
      ? bx(
          'TheMechAssist participa en el programa de afiliados de Amazon EU: los enlaces pueden generar una comisión sin coste adicional. Verifique siempre referencias de pieza y vendedor.',
          'TheMechAssist participates in the Amazon EU affiliate programme: links may earn a commission at no extra cost. Always verify part references and seller.',
        )
      : bx(
          'Enlaces de búsqueda a Amazon solo con fines informativos. Puede configurar un ID de afiliado en los ajustes del sitio.',
          'Amazon search links are informational only. You can configure an affiliate ID in site settings.',
        ),
  });

  updateLabShareVisibility('bShareLinkWrap', 'bResults');
  beltUrl.serializeToUrl();
}

/** Query param → element id (short keys for shareable URLs). */
const BELT_URL_PARAM_TO_ID = {
  beltType: 'bBeltType',
  vProfile: 'bVProfile',
  polyProfile: 'bPolyProfile',
  syncPitch: 'bSyncPitch',
  d1: 'bD1',
  d2: 'bD2',
  C: 'bC',
  n1: 'bN1',
  slip: 'bSlip',
  powerKw: 'bPowerKw',
  z1: 'bZ1',
  z2: 'bZ2',
};

const beltUrl = createLabUrlSync(BELT_URL_PARAM_TO_ID, {
  hydrateOrder: [
    'beltType',
    'vProfile',
    'polyProfile',
    'syncPitch',
    'd1',
    'd2',
    'C',
    'n1',
    'slip',
    'powerKw',
    'z1',
    'z2',
  ],
  afterHydrate: () => {
    syncBeltFormUi();
  },
});

beltUrl.hydrateFromUrl();
syncBeltFormUi();

const wrap = document.getElementById('bResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);

const beltPresets = mountLabPresetsBar('bPresetsBar', BELT_PRESETS, debounced);

function scheduleBeltRecalc() {
  if (!beltPresets.applying && !beltUrl.hydrating) {
    beltPresets.clearActive();
  }
  debounced();
}

bindLabUnitSelectors(scheduleBeltRecalc);

document.getElementById('bBeltType')?.addEventListener('change', () => {
  syncBeltFormUi();
  scheduleBeltRecalc();
});

[
  'bVProfile',
  'bPolyProfile',
  'bSyncPitch',
  'bZ1',
  'bZ2',
  'bD1',
  'bD2',
  'bC',
  'bN1',
  'bSlip',
  'bPowerKw',
].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleBeltRecalc);
  document.getElementById(id)?.addEventListener('change', scheduleBeltRecalc);
});

watchLangAndApply(BELTS_PAGE_EN, { onEnApplied: () => scheduleBeltRecalc() });

wireLabCopyLink('bCopyLinkBtn', 'bCopyToast');
wireLabCopyResultsButton('bCopyResults', {
  moduleTitle: bx('Correas de transmisi\u00f3n', 'Transmission belts'),
});

runCalcWithIndustrialFeedback(wrap, refreshCore);
mountLabCloudSaveBar('Correas de transmisi\u00f3n');
