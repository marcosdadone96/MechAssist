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
  debounce,
  executiveSummaryAlert,
  labAlert,
  metricHtml,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  uxCopy,
} from './labCalcUx.js';
import { commerceIdForBeltSelection } from '../data/commerceCatalog.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { setLabPurchaseFromShoppingLines } from './labPurchaseSuggestions.js';
import { metricsFromBeltType } from '../services/iaAdvisor.js';
import { bindCommerceFilteredSelect } from './commerceSelectBind.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';
import { LAB_AFFILIATE } from '../config/labAffiliate.js';

mountTierStatusBar();
bootSmartDashboardIfEnabled('Correas · laboratorio');
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();

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
  const sv = r.speedVerdict;
  if (!sv || sv.key === 'unknown') {
    wrap.innerHTML = '';
    return;
  }
  const level =
    sv.key === 'optimal' ? 'optimal' : sv.key === 'low' ? 'low' : sv.key === 'critical' ? 'critical' : 'info';
  wrap.innerHTML = `
    <div class="lab-belt-speed-verdict lab-belt-speed-verdict--${level}" role="status">
      <span class="lab-belt-speed-verdict__badge" aria-hidden="true">${
        level === 'optimal' ? '✓' : level === 'low' ? '!' : level === 'critical' ? '⚠' : '·'
      }</span>
      <div class="lab-belt-speed-verdict__text">
        <strong class="lab-belt-speed-verdict__title">${esc(sv.title)}</strong>
        <span class="lab-belt-speed-verdict__detail">${esc(sv.detail)}</span>
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
        ? 'Engrane de dientes: misma velocidad de correa, sin deslizamiento cinemático (modelo ideal).'
        : 'Incluye modelo de deslizamiento en la polea conducida (V / plana / Poly-V).';
    heroEl.innerHTML = renderResultHero([
      {
        label: 'ω₂ — velocidad angular · polea 2 (conducida)',
        display: r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—',
        hint: hint2,
      },
      {
        label: 'Velocidad lineal de correa (primitivo · polea 1)',
        display: formatLinearSpeed(r.beltSpeed_m_s, u.linear),
        hint: 'v = ω₁ · r₁ = π d₁ n₁ / 60 000 (d₁ en mm, n₁ en RPM → m/s).',
      },
    ]);
  }

  renderSpeedVerdictEl(r);

  const elementBox = document.getElementById('bElementResults');
  if (elementBox) {
    const p1Rows = [
      ['Diam. primitivo (d₁)', formatLength(r.d1, u.length)],
      ['Velocidad (n₁)', formatRotation(r.n1_rpm, u.rotation)],
      ['Velocidad correa (v)', formatLinearSpeed(r.beltSpeed_m_s, u.linear)],
    ];
    const p2Rows = [
      ['Diam. primitivo (d₂)', formatLength(r.d2, u.length)],
      ['Velocidad (n₂)', r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—'],
      ['Relación (i)', r.ratio_i.toFixed(2)],
    ];
    if (bt === 'synchronous' && r.Z1 != null && r.Z2 != null) {
      p1Rows.unshift(['Dientes (Z₁)', String(r.Z1)]);
      p2Rows.unshift(['Dientes (Z₂)', String(r.Z2)]);
    } else {
      p2Rows.push(['Deslizamiento (s)', `${r.slip_pct.toFixed(2)} %`]);
    }
    elementBox.innerHTML = [
      elementCardHtml('Polea 1 · Motriz', p1Rows),
      elementCardHtml('Polea 2 · Conducida', p2Rows),
    ].join('');
  }

  const box = document.getElementById('bResults');
  if (box) {
    const cells = [
      metricHtml(
        'Tipo y referencia',
        esc(r.profileNote),
        'Identificador de perfil o paso; la selección de servicio sigue catálogo y norma citada.',
      ),
      metricHtml(
        'Relación de transmisión i (≈ d₂/d₁ o Z₂/Z₁)',
        r.ratio_i.toFixed(2),
        'Reductor si i &gt; 1 (salida más lenta que entrada en el esquema habitual).',
      ),
      metricHtml(
        'Longitud primitiva de correa L (aprox.)',
        formatLength(r.beltLength_mm, u.length),
        'Correa abierta: L ≈ 2C + π(d₁+d₂)/2 + (d₂−d₁)²/(4C).',
      ),
      metricHtml(
        'Distancia entre centros C',
        formatLength(r.center_mm, u.length),
        'Condiciona ángulo de abrazamiento y flecha del tramo.',
      ),
    ];

    if (bt === 'synchronous' && r.Z1 != null && r.Z2 != null) {
      cells.push(
        metricHtml(
          'Z₁ — teeth · pulley 1 (driver)',
          String(r.Z1),
          `Diámetro primitivo D₁ = p·Z₁/π = ${formatLength(r.d1, u.length)}.`,
        ),
        metricHtml(
          'Z₂ — teeth · pulley 2 (driven)',
          String(r.Z2),
          `D₂ = p·Z₂/π = ${formatLength(r.d2, u.length)}.`,
        ),
      );
    } else {
      cells.push(
        metricHtml(
          'd₁ — primitive · pulley 1 (driver)',
          formatLength(r.d1, u.length),
          'Referencia de velocidad periférica.',
        ),
        metricHtml(
          'd₂ — primitive · pulley 2 (driven)',
          formatLength(r.d2, u.length),
          'Salida cinemática antes/después del deslizamiento según tipo de correa.',
        ),
      );
    }

    if (r.slipApplied) {
      cells.push(
        metricHtml(
          'Deslizamiento s (modelo)',
          `${r.slip_pct.toFixed(2)} %`,
          'Aplicado al n₂ teórico en correas flexibles.',
        ),
        metricHtml(
          'ω₂,th — polea 2 (sin deslizamiento)',
          r.n2_rpm_theoretical != null ? formatRotation(r.n2_rpm_theoretical, u.rotation) : '—',
          'n₂,th = n₁ · d₁/d₂.',
        ),
        metricHtml(
          'ω₂ — polea 2 (real)',
          r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—',
          'n₂,real = n₂,th · (1 − s).',
        ),
      );
    } else {
      cells.push(
        metricHtml(
          'ω₂ — polea 2 (síncrona)',
          r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—',
          'n₂ = n₁ · Z₁/Z₂ = n₁ · D₁/D₂.',
        ),
      );
    }

    cells.push(
      metricHtml(
        'Velocidad lineal v (primitivo motriz)',
        formatLinearSpeed(r.beltSpeed_m_s, u.linear),
        'Veredicto: verde en banda recomendada; amarillo fuera de banda; rojo si supera el máximo del tipo.',
      ),
      metricHtml(
        'Ángulo de abrazamiento · polea menor',
        `${r.wrapAngle_deg_small.toFixed(2)}°`,
        bt === 'flat' || bt === 'poly_v'
          ? 'Traction and power capacity depend strongly on wrap (flat / Poly-V).'
          : 'Suele ser la polea más exigente para tracción (correa flexible).',
      ),
      metricHtml(
        'Ángulo de abrazamiento · polea mayor',
        `${r.wrapAngle_deg_large.toFixed(2)}°`,
        'Belt contact on the larger pulley.',
      ),
      metricHtml(
        'ω₁ — polea 1 (motriz)',
        formatRotation(r.n1_rpm, u.rotation),
        'Dato de entrada del formulario.',
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
      parts.push(labAlert('danger', `${esc(r.geometryNote)} ${uxCopy('Ajuste C o diámetros antes de usar el resultado.', 'Adjust C or diameters before using the result.')}`));
    } else {
      if (hasCriticalSpeed) {
        parts.push(
          labAlert(
            'warn',
            uxCopy(
              'Velocidad de correa alta: revisar vibración, balanceo y límites del perfil.',
              'High belt speed: review vibration, balance, and profile limits.',
            ),
          ),
        );
      } else if (hasLowSpeed) {
        parts.push(
          labAlert(
            'info',
            uxCopy(
              'Velocidad de correa fuera de banda recomendada: validar con fabricante.',
              'Belt speed outside recommended band: validate with supplier.',
            ),
          ),
        );
      }
      parts.push(
        labAlert(
          'info',
          `${esc(r.profileNote)} · ${uxCopy(
            'Compruebe tensión, alineación y datos de catálogo para dimensionado final.',
            'Check tension, alignment, and catalogue data for final sizing.',
          )}`,
        ),
      );
    }
    parts.push(
      labAlert(
        'info',
        'Hipótesis del modelo: no calcula tensiones de correa ni número de correas necesarias; requiere catálogo del fabricante para el dimensionado final.',
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
          Primitivos: <code>D = p·Z/π</code> →
          <code>D₁ = ${p.toFixed(3)} × ${r.Z1} / π = ${D1.toFixed(2)} mm</code>,
          <code>D₂ = ${p.toFixed(3)} × ${r.Z2} / π = ${D2.toFixed(2)} mm</code>
        </p>
        <p class="calc-substitution__step">
          Velocidad angular motriz: <code>ω₁ = 2π n₁/60 = ${w1.toFixed(2)} rad/s</code>
        </p>
        <p class="calc-substitution__step">
          Velocidad lineal: <code>v = ω₁ · (D₁/2000) = ${r.beltSpeed_m_s.toFixed(2)} m/s</code> → <strong>${vDisp}</strong>
        </p>
        <p class="calc-substitution__step">
          Salida (sin deslizamiento): <code>n₂ = n₁ · D₁/D₂ = ${r.n1_rpm.toFixed(2)} × ${D1.toFixed(2)} / ${D2.toFixed(2)} = ${n2 != null ? n2.toFixed(2) : '—'} RPM</code>
        </p>`;
    } else {
      const d1 = r.d1;
      const d2 = r.d2;
      const s = r.slip_pct / 100;
      const n2t = r.n2_rpm_theoretical;
      const n2r = r.n2_rpm;
      body = `
        <p class="calc-substitution__step">
          Angular speed: <code>ω₁ = 2π n₁/60 = ${w1.toFixed(2)} rad/s</code>
        </p>
        <p class="calc-substitution__step">
          Velocidad lineal en el primitivo motriz: <code>v = ω₁ · (d₁/2000) = ${r.beltSpeed_m_s.toFixed(2)} m/s</code> → <strong>${vDisp}</strong>
          <span class="calc-substitution__muted">(equivalente a <code>v = π d₁ n₁ / 60 000</code> con d₁ en mm)</span>
        </p>
        <p class="calc-substitution__step">
          Velocidad de salida (teórica): <code>n₂,th = n₁ · d₁/d₂ = ${r.n1_rpm.toFixed(2)} × ${d1.toFixed(2)} / ${d2.toFixed(2)} = ${n2t != null ? n2t.toFixed(2) : '—'} RPM</code>
        </p>
        ${
          r.slipApplied
            ? `<p class="calc-substitution__step">
          Slip: <code>s = ${r.slip_pct.toFixed(2)} %</code> → <code>n₂,real = n₂,th · (1−s) = ${n2r != null ? n2r.toFixed(2) : '—'} RPM</code> → <strong>${formatRotation(n2r, u.rotation)}</strong>
        </p>`
            : ''
        }`;
    }

    sub.innerHTML = `
      <details class="calc-substitution">
        <summary class="calc-substitution__summary">
          <span class="calc-substitution__title">Sustitución — cinemática y velocidad</span>
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
    moduleLabel: 'Correas',
    advisorLang: 'es',
    advisorContext: {
      belt: { beltType: bt, powerKw: pKw },
    },
    shoppingLines,
    metrics: metricsFromBeltType(bt),
  });
  setLabPurchaseFromShoppingLines(document.getElementById('labPurchaseSuggestions'), shoppingLines, [], {
    title: 'Ideas de compra (orientativas)',
    linkLabel: 'Buscar en Amazon',
    disclosure: amzTag
      ? 'MechAssist is a participant in the Amazon EU Associates Programme: links may earn the site a commission at no extra cost to you. Always verify part numbers and seller.'
      : 'Amazon search links for information only. You can configure an associate ID in site settings.',
  });
}

syncBeltFormUi();

const wrap = document.getElementById('bResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);

bindLabUnitSelectors(debounced);

document.getElementById('bBeltType')?.addEventListener('change', () => {
  syncBeltFormUi();
  debounced();
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
  document.getElementById(id)?.addEventListener('input', debounced);
  document.getElementById(id)?.addEventListener('change', debounced);
});

runCalcWithIndustrialFeedback(wrap, refreshCore);
