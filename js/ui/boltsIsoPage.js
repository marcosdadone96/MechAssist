/**
 * Tornillería ISO 898-1 — verificación simplificada tracción + par de apriete catálogo.
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
import { BOLT_DIAMETERS, boltRowCatalog } from '../data/metricBoltGrades.js';
import { renderBoltedJointDiagram } from '../lab/diagramCatalogModules.js';
import { getLabLang } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { BOLTS_ISO_EN } from '../lab/i18n/pages/boltsIsoEn.js';
import { mountCompactLabFieldHelp, refreshCompactLabFieldHelp } from './labHelpCompact.js';

const BOLT_GRADES_TRY = ['8.8', '10.9', '12.9'];

function bx(es, en) {
  return getLabLang() === 'en' ? en : es;
}

function fillSelects() {
  const dSel = document.getElementById('blD');
  const gSel = document.getElementById('blGrade');
  if (dSel) {
    dSel.innerHTML = BOLT_DIAMETERS.map((d) => `<option value="${d}">M${d}</option>`).join('');
  }
  if (gSel) {
    gSel.innerHTML = BOLT_GRADES_TRY.map((g) => `<option value="${g}">${g}</option>`).join('');
  }
}

/** @returns {{ d: number; grade: string; row: NonNullable<ReturnType<typeof boltRowCatalog>> } | null} */
function suggestBoltForForce_kN(F_kN) {
  const F_N = F_kN * 1000;
  if (!(F_N > 0)) return null;
  for (const d of BOLT_DIAMETERS) {
    for (const grade of BOLT_GRADES_TRY) {
      const row = boltRowCatalog(d, grade);
      if (row && row.Ft_Rd_kN * 1000 >= F_N) return { d, grade, row };
    }
  }
  return null;
}

function syncBoltCalcModeUi() {
  const design = document.getElementById('blCalcMode')?.value === 'design';
  const dSel = document.getElementById('blD');
  const gSel = document.getElementById('blGrade');
  if (dSel instanceof HTMLSelectElement) dSel.disabled = design;
  if (gSel instanceof HTMLSelectElement) gSel.disabled = design;
  const help = document.getElementById('blCalcModeHelp');
  if (help instanceof HTMLElement) {
    help.querySelectorAll('[data-bolt-mode]').forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const on = el.getAttribute('data-bolt-mode') === (design ? 'design' : 'diagnostic');
      el.classList.toggle('bolt-calc-mode-help__line--active', on);
    });
  }
}

const BL_PRESETS = [
  {
    label: 'Diagnóstico M12 · 60 kN',
    labelKey: 'bolt.preset1',
    values: {
      blCalcMode: 'diagnostic',
      blD: 12,
      blGrade: '10.9',
      blF: 60,
      blMu: 0.12,
    },
  },
  {
    label: 'Diseño · 95 kN',
    labelKey: 'bolt.preset2',
    values: {
      blCalcMode: 'design',
      blD: 12,
      blGrade: '10.9',
      blF: 95,
      blMu: 0.14,
    },
  },
  {
    label: 'Junta seca μ 0.18',
    labelKey: 'bolt.preset3',
    values: {
      blCalcMode: 'diagnostic',
      blD: 16,
      blGrade: '8.8',
      blF: 42,
      blMu: 0.18,
    },
  },
];

const BL_URL_PARAM_TO_ID = {
  mode: 'blCalcMode',
  d: 'blD',
  g: 'blGrade',
  F: 'blF',
  mu: 'blMu',
};

const blUrl = createLabUrlSync(BL_URL_PARAM_TO_ID, {
  hydrateOrder: ['mode', 'd', 'g', 'F', 'mu'],
  afterHydrate: () => {
    syncBoltCalcModeUi();
  },
});

function render() {
  const mode = document.getElementById('blCalcMode')?.value === 'design' ? 'design' : 'diagnostic';
  let d = parseInt(document.getElementById('blD')?.value || '12', 10);
  let grade = document.getElementById('blGrade')?.value || '10.9';
  const F_kN = parseFloat(document.getElementById('blF')?.value || '0');
  const mu = parseFloat(document.getElementById('blMu')?.value || '0.12');

  let designSug = null;
  if (mode === 'design' && F_kN > 0) {
    designSug = suggestBoltForForce_kN(F_kN);
    if (designSug) {
      d = designSug.d;
      grade = designSug.grade;
      const dSel = document.getElementById('blD');
      const gSel = document.getElementById('blGrade');
      if (dSel instanceof HTMLSelectElement) dSel.value = String(d);
      if (gSel instanceof HTMLSelectElement) gSel.value = grade;
    }
  }
  const out = document.getElementById('blOut');
  const tbl = document.getElementById('blTable');
  if (!out || !tbl) return;

  renderBoltedJointDiagram(document.getElementById('blDiagram'), d);

  if (syncInputValidationResultsGate(document.getElementById('blResults'))) return;

  if (mode === 'design' && F_kN > 0 && !designSug) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err">${bx(
      `No hay combinación M6–M36 en grados 8.8/10.9/12.9 que cubra ${F_kN.toFixed(2)} kN en este modelo. Considere mayor diámetro fuera de tabla, rosca fina o más tornillos en paralelo.`,
      `No M6–M36 grade 8.8/10.9/12.9 combination covers ${F_kN.toFixed(2)} kN in this model. Consider larger diameter, fine thread, or more bolts in parallel.`,
    )}</p>`;
    tbl.innerHTML = '';
    updateLabShareVisibility('blShareLinkWrap', 'blOut');
    if (!blUrl.hydrating) blUrl.serializeToUrl();
    return;
  }

  const row = boltRowCatalog(d, grade);

  if (!row) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err">${bx('Combinación no disponible.', 'Combination not available.')}</p>`;
    updateLabShareVisibility('blShareLinkWrap', 'blOut');
    if (!blUrl.hydrating) blUrl.serializeToUrl();
    return;
  }

  const F_N = F_kN * 1000;
  const F_cap_N = row.Ft_Rd_kN * 1000;
  const SF = F_N > 0 ? F_cap_N / F_N : Infinity;
  const ok = F_N <= 0 || SF >= 1;
  const preloadN = row.F_preload_N;
  const ratioVsPreload = preloadN > 0 ? F_N / preloadN : 0;
  const K_mu = 0.9 * mu + 0.092;
  const T_mu_Nm = (K_mu * preloadN * d) / 1000;

  if (F_N <= 0) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--muted">${bx(
      'Introduzca la fuerza de tracción de cálculo en la unión (kN).',
      'Enter the design tension force on the joint (kN).',
    )}</p>`;
  } else if (ratioVsPreload > 1) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err"><strong>${bx('Riesgo de apertura de junta:', 'Joint opening risk:')}</strong> F = ${F_kN.toFixed(
      2,
    )} kN ${bx('supera la precarga orientativa', 'exceeds indicative preload')} F<sub>V</sub> = ${(preloadN / 1000).toFixed(2)} kN.</p>`;
  } else if (ratioVsPreload > 0.9) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--warn"><strong>${bx('Margen bajo:', 'Low margin:')}</strong> F = ${F_kN.toFixed(
      2,
    )} kN ${bx('supera el 90% de la precarga', 'exceeds 90% of preload')} (F/F<sub>V</sub> = ${ratioVsPreload.toFixed(2)}).</p>`;
  } else if (ok) {
    const designNote =
      mode === 'design'
        ? `<br/><span class="lab-small-print">${bx(
            'Modo diseño: propuesta mínima en tabla M6–M36 (prioriza menor diámetro con grado 8.8→12.9).',
            'Design mode: minimum proposal in M6–M36 table (smallest diameter, grades 8.8→12.9).',
          )}</span>`
        : '';
    out.innerHTML = `<p class="lab-verdict lab-verdict--ok">${bx('El tornillo', 'Bolt')} <strong>M${d} ${bx('grado', 'grade')} ${grade}</strong> ${bx('es', 'is')} <strong>${bx('APTO', 'OK')}</strong> ${bx('frente a', 'for')} ${F_kN.toFixed(2)} kN ${bx('con factor de seguridad', 'with safety factor')} <strong>≈ ${SF.toFixed(2)}</strong> (${bx('resistencia cálculo simplificada', 'simplified design resistance')}).<br/>
      <strong>${bx('Torque de apriete (con μ seleccionado):', 'Tightening torque (selected μ):')}</strong> ${T_mu_Nm.toFixed(1)} N·m (${bx('precarga ≈ 75% Rp·A', 'preload ≈ 75% Rp·A')}<sub>s</sub>).${designNote}</p>`;
  } else {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err">${bx('El tornillo', 'Bolt')} M${d} ${bx('grado', 'grade')} ${grade} <strong>${bx('no', 'does not')}</strong> ${bx('cumple:', 'meet:')} F<sub>req</sub> = ${F_kN.toFixed(2)} kN &gt; F<sub>Rd</sub> ≈ ${row.Ft_Rd_kN.toFixed(2)} kN. ${bx('Suba diámetro o grado.', 'Increase diameter or grade.')}</p>`;
  }

  tbl.innerHTML = `
    <table class="lab-catalog-table">
      <thead><tr><th>${bx('Dato', 'Item')}</th><th>${bx('Valor', 'Value')}</th></tr></thead>
      <tbody>
        <tr><td>${bx('Paso P', 'Pitch P')}</td><td>${row.pitch_mm} mm</td></tr>
        <tr><td>A<sub>s</sub></td><td>${row.As_mm2.toFixed(1)} mm²</td></tr>
        <tr><td>Rp (ISO 898-1)</td><td>${row.Rp_MPa} MPa</td></tr>
        <tr><td>μ (${bx('seleccionado', 'selected')})</td><td>${mu.toFixed(2)}</td></tr>
        <tr><td>${bx('Precarga orientativa', 'Indicative preload')} F<sub>V</sub></td><td>${(row.F_preload_N / 1000).toFixed(2)} kN</td></tr>
        <tr><td>T ${bx('apriete (μ sel.)', 'tighten (μ sel.)')}</td><td>${T_mu_Nm.toFixed(1)} N·m</td></tr>
        <tr><td>T ${bx('apriete (ref. K≈0,2)', 'tighten (ref. K≈0.2)')}</td><td>${row.T_tighten_Nm.toFixed(1)} N·m</td></tr>
        <tr><td>F<sub>Rd</sub> (${bx('simpl.', 'simpl.')})</td><td>${row.Ft_Rd_kN.toFixed(2)} kN</td></tr>
        <tr><td>F ${bx('requerida', 'required')}</td><td>${F_kN.toFixed(2)} kN</td></tr>
        <tr><td>F/F<sub>V</sub></td><td>${F_N > 0 ? ratioVsPreload.toFixed(2) : '—'}</td></tr>
      </tbody>
    </table>
    <p class="lab-small-print">${bx(
      'No sustituye EN 1993-1-8 ni instrucciones Würth/Bossard; valores de precarga/par son orientativos.',
      'Does not replace EN 1993-1-8 or manufacturer tightening specs; preload/torque values are indicative.',
    )}</p>`;

  updateLabShareVisibility('blShareLinkWrap', 'blOut');
  if (!blUrl.hydrating) blUrl.serializeToUrl();
}

fillSelects();

bindInputValidation([{ id: 'blF', min: 0, max: 1e9, label: 'Fuerza' }]);

blUrl.hydrateFromUrl();
syncBoltCalcModeUi();

mountLabPresetsBar('blPresetsBar', BL_PRESETS, render);

function scheduleBlRender() {
  if (!blUrl.hydrating) {
    document.querySelectorAll('#blPresetsBar .lab-preset-btn').forEach((b) => b.classList.remove('is-active'));
  }
  if (isCreditsSystemEnabled()) void withCalcCredits(() => render());
  else render();
}

['blCalcMode', 'blD', 'blGrade', 'blF', 'blMu'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleBlRender);
  document.getElementById(id)?.addEventListener('change', () => {
    if (id === 'blCalcMode') syncBoltCalcModeUi();
    scheduleBlRender();
  });
});

wireLabCopyLink('blCopyLinkBtn', 'blCopyToast');
wireLabCopyResultsButton('blCopyResults', {
  moduleTitle: bx('Torniller\u00eda ISO 898', 'ISO 898 bolts'),
});

mountCompactLabFieldHelp();

if (isCreditsSystemEnabled()) void withCalcCredits(() => render());
else render();
mountLabCloudSaveBar(bx('Torniller\u00eda ISO 898', 'ISO 898 bolts'), {
  norm: 'ISO 898-1 · propiedades mecánicas tornillos',
  svgSelector: '#blDiagram',
});
watchLangAndApply(BOLTS_ISO_EN, {
  reloadOnEs: false,
  onEnApplied: () => {
    refreshCompactLabFieldHelp();
    scheduleBlRender();
  },
  onEsRestored: () => {
    refreshCompactLabFieldHelp();
    scheduleBlRender();
  },
});
