/**
 * Chavetas paralelas DIN 6885-1 (extracto) + aplastamiento.
 */

import {
  bindInputValidation,
  syncInputValidationResultsGate,
  createLabUrlSync,
  mountLabPresetsBar,
  updateLabShareVisibility,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { withCalcCredits } from '../services/creditSession.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import {
  DIN6885_FORM_A_ROWS,
  DIN6885_STANDARD_LENGTHS,
  KEY_MATERIAL_ALLOWABLE_MPA,
} from '../data/din6885ParallelKeys.js';
import { renderParallelKeyShaftDiagram } from '../lab/diagramCatalogModules.js';
import { getLabLang } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { KEYS_DIN_EN } from '../lab/i18n/pages/keysDinEn.js';

function bx(es, en) {
  return getLabLang() === 'en' ? en : es;
}

function lookupKey(d_shaft) {
  const d = Number(d_shaft);
  if (!Number.isFinite(d) || d < 6) return null;
  for (const r of DIN6885_FORM_A_ROWS) {
    if (d >= r.d_min && d < r.d_max) return r;
  }
  return DIN6885_FORM_A_ROWS[DIN6885_FORM_A_ROWS.length - 1];
}

/** Tensión de aplastamiento en contacto chaveta-eje (modelo simplificado): 2T / (d * l * (h/2)) */
function sigmaCrush_MPa(T_Nm, d_mm, h_mm, l_mm) {
  const eff = Math.max(0.1, h_mm / 2);
  const denom = d_mm * l_mm * eff * 1e-9;
  if (denom <= 0) return Infinity;
  return (2 * Math.abs(T_Nm)) / denom / 1e6;
}

function nextStandardLength(l_need_mm) {
  for (const L of DIN6885_STANDARD_LENGTHS) {
    if (L >= l_need_mm - 1e-6) return L;
  }
  return DIN6885_STANDARD_LENGTHS[DIN6885_STANDARD_LENGTHS.length - 1];
}

const KY_PRESETS = [
  {
    label: 'Eje Ø32 · C45',
    labelKey: 'keys.preset1',
    values: { kyD: 32, kyT: 180, kyL: '', kyMat: 'c45' },
  },
  {
    label: 'Eje Ø50 · alto par',
    labelKey: 'keys.preset2',
    values: { kyD: 50, kyT: 420, kyL: 70, kyMat: 'c45' },
  },
  {
    label: 'Eje Ø25 · ac.inox',
    labelKey: 'keys.preset3',
    values: { kyD: 25, kyT: 95, kyL: '', kyMat: 'inox' },
  },
];

const KY_URL_PARAM_TO_ID = {
  d: 'kyD',
  T: 'kyT',
  L: 'kyL',
  mat: 'kyMat',
};

const kyUrl = createLabUrlSync(KY_URL_PARAM_TO_ID, {
  hydrateOrder: ['d', 'T', 'L', 'mat'],
});

function render() {
  const d = parseFloat(document.getElementById('kyD')?.value || '0');
  const T = parseFloat(document.getElementById('kyT')?.value || '0');
  const lUser = parseFloat(document.getElementById('kyL')?.value || '0');
  const mat = document.getElementById('kyMat')?.value || 'c45';
  const out = document.getElementById('kyOut');
  const tbl = document.getElementById('kyTable');
  if (!out || !tbl) return;

  const row = lookupKey(d);
  const sigAdm = KEY_MATERIAL_ALLOWABLE_MPA[mat]?.sigma_lim_MPa ?? 100;
  const l_use = Number.isFinite(lUser) && lUser > 0 ? lUser : row ? nextStandardLength(row.b * 4) : 0;

  renderParallelKeyShaftDiagram(document.getElementById('kyDiagram'), {
    d,
    b: row?.b ?? 0,
    h: row?.h ?? 0,
    t1: row?.t1 ?? 0,
    t2: row?.t2 ?? 0,
    L: l_use,
  });

  if (syncInputValidationResultsGate(document.getElementById('kyResults'))) return;

  if (!row) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err">${bx(
      'Di\u00e1metro fuera de tabla (m\u00edn. 6 mm en este extracto).',
      'Diameter outside table (min. 6 mm in this extract).',
    )}</p>`;
    tbl.innerHTML = '';
    updateLabShareVisibility('kyShareLinkWrap', 'kyOut');
    if (!kyUrl.hydrating) kyUrl.serializeToUrl();
    return;
  }

  const sigma = sigmaCrush_MPa(T, d, row.h, l_use);
  const ok = sigma <= sigAdm;
  const lLimit = 1.5 * d;
  const overLengthAdvisory = Number.isFinite(l_use) && Number.isFinite(d) && l_use > lLimit;
  let suggestL = null;
  if (!ok && T !== 0) {
    const l_need = (2 * Math.abs(T)) / (d * (row.h / 2) * 1e-9) / (sigAdm * 1e6);
    suggestL = nextStandardLength(l_need * 1.05);
  }

  document.getElementById('kyB') && (document.getElementById('kyB').textContent = String(row.b));
  document.getElementById('kyH') && (document.getElementById('kyH').textContent = String(row.h));
  document.getElementById('kyT1') && (document.getElementById('kyT1').textContent = row.t1.toFixed(1));
  document.getElementById('kyT2') && (document.getElementById('kyT2').textContent = row.t2.toFixed(1));

  const matLabel = KEY_MATERIAL_ALLOWABLE_MPA[mat]?.label ?? mat;
  if (ok) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--ok"><strong>${bx('APTO', 'OK')}</strong> ${bx(
      `criterio de aplastamiento orientativo frente a ${matLabel}`,
      `indicative crushing criterion vs ${matLabel}`,
    )} (\u03c3<sub>ap</sub> \u2248 ${sigma.toFixed(1)} MPa \u2264 \u03c3<sub>adm</sub> ${sigAdm} MPa).<br/>
      <strong>${bx('Referencia norma:', 'Standard ref.:')}</strong> ${bx(
      'dimensiones seg\u00fan tabla paralela tipo DIN 6885-1 (extracto educativo).',
      'dimensions per DIN 6885-1 parallel key table (educational extract).',
    )}</p>`;
  } else {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err"><strong>${bx('INSUFICIENTE', 'INSUFFICIENT')}</strong> ${bx(
      'en aplastamiento',
      'in crushing',
    )} (\u03c3<sub>ap</sub> \u2248 ${sigma.toFixed(1)} MPa &gt; \u03c3<sub>adm</sub> ${sigAdm} MPa).<br/>
      ${suggestL ? `<strong>${bx('Recomendado:', 'Suggested:')}</strong> ${bx('longitud comercial', 'commercial length')} \u2265 <strong>${suggestL} mm</strong> (${bx('verificar ranura en eje/cubo', 'check groove in shaft/hub')}).` : ''}</p>`;
  }
  if (overLengthAdvisory) {
    out.innerHTML += `<p class="lab-verdict lab-verdict--warn"><strong>${bx('Aviso orientativo:', 'Advisory:')}</strong> L = ${l_use.toFixed(1)} mm ${bx('supera', 'exceeds')} 1.5\u00b7d \u2248 ${lLimit.toFixed(1)} mm. ${bx(
      'Para chavetas est\u00e1ndar, revise la recomendaci\u00f3n L \u2264 1.5\u00b7d.',
      'For standard keys, review recommendation L \u2264 1.5\u00b7d.',
    )}</p>`;
  }

  const rowsHtml = DIN6885_FORM_A_ROWS.map((r) => {
    const active = d >= r.d_min && d < r.d_max;
    return `<tr${active ? ' class="ky-row--active"' : ''}>
      <td>${r.d_min} – ${r.d_max}</td>
      <td>${r.b} × ${r.h}</td>
      <td>${r.t1.toFixed(1)}</td>
      <td>${r.t2.toFixed(1)}</td>
    </tr>`;
  }).join('');
  tbl.innerHTML = `
    <table class="lab-catalog-table">
      <thead><tr><th>${bx('\u00d8 eje (mm)', 'Shaft \u00d8 (mm)')}</th><th>b \u00d7 h (mm)</th><th>t\u2081 (mm)</th><th>t\u2082 (mm)</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <table class="lab-catalog-table" style="margin-top:.55rem">
      <thead><tr><th>${bx('Par\u00e1metro de c\u00e1lculo', 'Parameter')}</th><th>${bx('Valor', 'Value')}</th></tr></thead>
      <tbody>
        <tr><td>${bx('Longitud analizada L', 'Analysed length L')}</td><td>${l_use} mm</td></tr>
        <tr><td>${bx('Par aplicado |T|', 'Applied torque |T|')}</td><td>${T.toFixed(2)} N\u00b7m</td></tr>
        <tr><td>\u03c3<sub>ap</sub> (${bx('modelo simplificado', 'simplified model')})</td><td>${sigma.toFixed(1)} MPa</td></tr>
        <tr><td>\u03c3<sub>adm</sub> ${bx('material', 'material')}</td><td>${sigAdm} MPa (${matLabel})</td></tr>
        <tr><td>${bx('Veredicto aplastamiento', 'Crushing verdict')}</td><td><strong>${ok ? bx('APTO', 'OK') : bx('INSUFICIENTE', 'INSUFFICIENT')}</strong></td></tr>
      </tbody>
    </table>`;

  updateLabShareVisibility('kyShareLinkWrap', 'kyOut');
  if (!kyUrl.hydrating) kyUrl.serializeToUrl();
}

bindInputValidation([
  { id: 'kyD', min: 6, max: 500, label: 'Ø eje' },
  { id: 'kyT', min: 0, max: 1e9, label: 'Par' },
  { id: 'kyL', min: 1, max: 5000, label: 'Longitud L' },
]);

kyUrl.hydrateFromUrl();

mountLabPresetsBar('kyPresetsBar', KY_PRESETS, render);

function scheduleKyRender() {
  if (!kyUrl.hydrating) {
    document.querySelectorAll('#kyPresetsBar .lab-preset-btn').forEach((b) => b.classList.remove('is-active'));
  }
  if (isCreditsSystemEnabled()) void withCalcCredits(() => render());
  else render();
}

['kyD', 'kyT', 'kyL', 'kyMat'].forEach((id) => document.getElementById(id)?.addEventListener('input', scheduleKyRender));
document.getElementById('kyMat')?.addEventListener('change', scheduleKyRender);

wireLabCopyLink('kyCopyLinkBtn', 'kyCopyToast');
wireLabCopyResultsButton('kyCopyResults', {
  moduleTitle: bx('Chavetas paralelas DIN 6885', 'Parallel keys DIN 6885'),
});

if (isCreditsSystemEnabled()) void withCalcCredits(() => render());
else render();
mountLabCloudSaveBar(bx('Chavetas paralelas DIN 6885', 'Parallel keys DIN 6885'), {
  norm: 'DIN 6885 · chavetas paralelas',
  svgSelector: '#kyDiagram',
});
watchLangAndApply(KEYS_DIN_EN, {
  reloadOnEs: false,
  onEnApplied: () => scheduleKyRender(),
  onEsRestored: () => scheduleKyRender(),
});
