import { mountTierStatusBar } from './paywallMount.js';
import { computeSpurGearPair } from '../lab/gears.js';
import { computeAgmaSimplifiedCheck } from '../lab/agmaSpurSimplified.js';
import { renderGearPairDiagram } from '../lab/diagramGears.js';
import {
  bindLabUnitSelectors,
  formatLength,
  formatLinearSpeed,
  formatRotation,
  getLabUnitPrefs,
} from '../lab/labUnitPrefs.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import { setLabPurchaseFromShoppingLines } from './labPurchaseSuggestions.js';
import {
  debounce,
  labAlert,
  metricHtml,
  renderMotorPowerRuler,
  renderResultHero,
  runCalcWithIndustrialFeedback,
} from './labCalcUx.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { metricsFromGears } from '../services/iaAdvisor.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';
import { LAB_LANG_EVENT, getLabLang } from '../lab/i18n/labLang.js';
import { gearsRuntimeStrings } from '../lab/i18n/runtime/gearsRuntime.js';

mountTierStatusBar();
bootSmartDashboardIfEnabled(gearsRuntimeStrings(getLabLang()).dashboardBoot);
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

function read(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function readOptional(id) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return null;
  const s = el.value.trim();
  if (s === '') return null;
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
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

function powerKwFromInputs(n1_rpm, Topt, Popt) {
  if (Topt != null && Topt > 0 && n1_rpm > 0) {
    const omega = (2 * Math.PI * n1_rpm) / 60;
    return (Topt * omega) / 1000;
  }
  if (Popt != null && Popt > 0) return Popt;
  return null;
}

function refreshCore() {
  const t = gearsRuntimeStrings(getLabLang());
  const u = getLabUnitPrefs();
  const lubeEl = document.getElementById('gLube');
  const lube = lubeEl instanceof HTMLSelectElement && lubeEl.value === 'grease' ? 'grease' : 'oil';

  const n1In = read('gN1', 1455);
  const p = {
    z1: read('gZ1', 20),
    z2: read('gZ2', 45),
    module_mm: read('gM', 2.5),
    pressureAngle_deg: read('gAlpha', 20),
    n1: n1In,
    faceWidth_mm: read('gFace', 28),
  };
  const r = computeSpurGearPair(p);

  const Topt = readOptional('gTorque');
  const Popt = readOptional('gPower');
  const P_kw = powerKwFromInputs(n1In, Topt, Popt);

  const agma = computeAgmaSimplifiedCheck({
    z1: r.z1,
    z2: r.z2,
    module_mm: r.module_mm,
    d1_mm: r.d1,
    faceWidth_mm: r.faceWidth_mm ?? read('gFace', 28),
    n1_rpm: r.n1 ?? 0,
    torquePinion_Nm: Topt ?? undefined,
    powerPinion_kW: Topt != null ? undefined : Popt ?? undefined,
    lubrication: lube,
  });

  const heroEl = document.getElementById('gHero');
  if (heroEl) {
    const heroItems = [];
    heroItems.push({
      label: 'ω₂ — velocidad angular · rueda 2 (conducida)',
      display: r.n2 != null ? formatRotation(r.n2, u.rotation) : '—',
      hint:
        r.n2 != null
          ? 'Salida en el primitivo; ω₂/ω₁ = z₁/z₂.'
          : 'Indique giro de entrada &gt; 0 para obtener la salida.',
    });
    if (P_kw != null) {
      heroItems.push({
        label: 'Potencia en piñón',
        display: `${P_kw.toFixed(2)} kW`,
        hint: Topt != null ? 'Calculada a partir del par y el giro.' : 'Valor introducido o estimado.',
      });
    } else {
      heroItems.push({
        label: 'Potencia en piñón',
        display: '—',
        hint: 'Opcional: potencia o par para AGMA y regla de motor.',
      });
    }
    heroEl.innerHTML = renderResultHero(heroItems);
  }

  const motorEl = document.getElementById('gMotorCompare');
  if (motorEl) {
    motorEl.innerHTML = P_kw != null && P_kw > 0 ? renderMotorPowerRuler(P_kw) : '';
  }

  const i = r.ratio_transmission;
  const elementBox = document.getElementById('gElementResults');
  if (elementBox) {
    elementBox.innerHTML = [
      elementCardHtml(t.card1, [
        [t.kvZ, String(r.z1)],
        [t.kvDp, formatLength(r.d1, u.length)],
        [t.kvDa, formatLength(r.da1, u.length)],
        [t.kvDf, formatLength(r.db1, u.length)],
        [t.kvN, formatRotation(r.n1, u.rotation)],
      ]),
      elementCardHtml(t.card2, [
        [t.kvZ, String(r.z2)],
        [t.kvDp, formatLength(r.d2, u.length)],
        [t.kvDa, formatLength(r.da2, u.length)],
        [t.kvDf, formatLength(r.db2, u.length)],
        [t.kvN, formatRotation(r.n2, u.rotation)],
      ]),
    ].join('');
  }

  const box = document.getElementById('gResults');
  if (box) {
    box.innerHTML = [
      metricHtml(t.mRatio, i.toFixed(2), t.mRatioHint(1 / i)),
      metricHtml(t.mVp1, formatLinearSpeed(r.v_pitch_m_s, u.linear), t.mVp1Hint),
      metricHtml(t.mCenter, formatLength(r.centerDistance_mm, u.length), t.mCenterHint),
      metricHtml(t.mD1, formatLength(r.d1, u.length), t.mD1Hint),
      metricHtml(t.mD2, formatLength(r.d2, u.length), t.mD2Hint),
      metricHtml(t.mFace, formatLength(r.faceWidth_mm ?? 0, u.length), t.mFaceHint),
      metricHtml(t.mDa1, formatLength(r.da1, u.length), t.mDa1Hint),
      metricHtml(t.mDa2, formatLength(r.da2, u.length), t.mDa2Hint),
      metricHtml(t.mDb1, formatLength(r.db1, u.length), t.mDb1Hint),
      metricHtml(t.mDb2, formatLength(r.db2, u.length), t.mDb2Hint),
      metricHtml(t.mW1, formatRotation(r.n1, u.rotation), t.mW1Hint),
      metricHtml(t.mW2, formatRotation(r.n2, u.rotation), t.mW2Hint),
    ].join('');

    if (agma.hasLoad) {
      box.innerHTML += [
        metricHtml(t.mFt, `${agma.tangentialLoad_N.toFixed(2)} N`, t.mFtHint(agma.lewisY)),
        metricHtml(t.mSigF, `${agma.bendingStress_MPa.toFixed(2)} MPa`, t.mSigFHint),
        metricHtml(t.mSigH, `${agma.contactStress_MPa.toFixed(2)} MPa`, t.mSigHHint),
        metricHtml(t.mSF, agma.bendingSafety_SF.toFixed(2), t.mSFHint(agma.allowableBending_MPa)),
        metricHtml(t.mSH, agma.contactSafety_SH.toFixed(2), t.mSHHint(agma.allowableContact_MPa)),
      ].join('');
    }
  }

  const alerts = document.getElementById('gAlerts');
  if (alerts) {
    const parts = [];
    agma.velocityAlerts.forEach((a) => {
      parts.push(labAlert(a.level === 'danger' ? 'danger' : 'warn', esc(a.text)));
    });
    if (agma.hasLoad) {
      if (agma.bendingSafety_SF < 1.05) {
        parts.push(labAlert('danger', t.alertSfLow));
      } else if (agma.bendingSafety_SF < 1.4) {
        parts.push(labAlert('warn', t.alertSfMod));
      }
      if (agma.contactSafety_SH < 1.05) {
        parts.push(labAlert('danger', t.alertShLow));
      } else if (agma.contactSafety_SH < 1.2) {
        parts.push(labAlert('warn', t.alertShMod));
      }
      if (agma.bendingSafety_SF >= 1.4 && agma.contactSafety_SH >= 1.2) {
        parts.push(labAlert('ok', t.alertOk));
      }
    } else {
      parts.push(labAlert('info', t.alertNeedLoad(esc(agma.disclaimer))));
    }
    alerts.innerHTML = parts.join('');
  }

  const sub = document.getElementById('gSubstitution');
  if (sub && r.n1 != null) {
    const n2 = (r.n1 * r.z1) / r.z2;
    const vps = formatLinearSpeed(r.v_pitch_m_s, u.linear);
    const d1s = formatLength(r.d1, u.length);
    sub.innerHTML = `
      <details class="calc-substitution">
        <summary class="calc-substitution__summary">
          <span class="calc-substitution__title">Sustitución — de dientes a velocidad de salida</span>
        </summary>
        <div class="calc-substitution__inner">
          <p class="calc-substitution__step">
            Relación cinemática en el primitivo: <code>n₂ = n₁ · z₁ / z₂</code>
          </p>
          <p class="calc-substitution__step">
            En <strong>RPM</strong> (cálculo numérico, rueda 2): <code>n₂ = ${r.n1.toFixed(2)} × ${r.z1} / ${r.z2} = ${n2.toFixed(2)} RPM</code>
          </p>
          <p class="calc-substitution__step">
            Mismo giro de salida en sus unidades elegidas: <strong>${formatRotation(n2, u.rotation)}</strong>
          </p>
          <p class="calc-substitution__step">
            Velocidad en primitivo · rueda 1 (piñón): <strong>${vps}</strong> (<code>d₁ = ${d1s}</code>).
          </p>
        </div>
      </details>`;
  } else if (sub) {
    sub.innerHTML = '';
  }

  renderGearPairDiagram(document.getElementById('gDiagram'), p);

  const shoppingLines = [
    {
      commerceId: 'gear-pair-quote',
      qty: 1,
      note: `m = ${r.module_mm} mm · z₁/z₂ = ${r.z1}/${r.z2}`,
    },
  ];
  emitEngineeringSnapshot({
    page: 'calc-gears',
    moduleLabel: t.moduleLabel,
    advisorContext: {
      safetyMargins: agma.hasLoad
        ? [
            { label: t.snapSf, value: agma.bendingSafety_SF },
            { label: t.snapSh, value: agma.contactSafety_SH },
          ]
        : [],
    },
    shoppingLines,
    metrics: metricsFromGears(agma),
  });
  setLabPurchaseFromShoppingLines(document.getElementById('labPurchaseSuggestions'), shoppingLines, [
    {
      label: t.shopLabel,
      searchQuery: t.shopQ(r.module_mm),
    },
  ]);
}

const resultsWrap = document.getElementById('gResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(resultsWrap, refreshCore), 55);

bindLabUnitSelectors(debounced);

['gZ1', 'gZ2', 'gM', 'gFace', 'gAlpha', 'gN1', 'gPower', 'gTorque', 'gLube'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', debounced);
  document.getElementById(id)?.addEventListener('change', debounced);
});
window.addEventListener(LAB_LANG_EVENT, () => {
  bootSmartDashboardIfEnabled(gearsRuntimeStrings(getLabLang()).dashboardBoot);
  debounced();
});
runCalcWithIndustrialFeedback(resultsWrap, refreshCore);
