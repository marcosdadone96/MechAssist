/**
 * Tornillería ISO 898-1 — verificación simplificada tracción + par de apriete catálogo.
 */

import { BOLT_DIAMETERS, boltRowCatalog } from '../data/metricBoltGrades.js';
import { renderBoltedJointDiagram } from '../lab/diagramCatalogModules.js';

const BOLT_GRADES_TRY = ['8.8', '10.9', '12.9'];

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
}

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

  if (mode === 'design' && F_kN > 0 && !designSug) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err">No hay combinación M6–M36 en grados 8.8/10.9/12.9 que cubra ${F_kN.toFixed(2)} kN en este modelo. Considere mayor diámetro fuera de tabla, rosca fina o más tornillos en paralelo.</p>`;
    tbl.innerHTML = '';
    renderBoltedJointDiagram(document.getElementById('blDiagram'), 12);
    return;
  }

  const row = boltRowCatalog(d, grade);
  renderBoltedJointDiagram(document.getElementById('blDiagram'), d);

  if (!row) {
    out.innerHTML = '<p class="lab-verdict lab-verdict--err">Combinación no disponible.</p>';
    return;
  }

  const F_N = F_kN * 1000;
  const F_cap_N = row.Ft_Rd_kN * 1000;
  const SF = F_N > 0 ? F_cap_N / F_N : Infinity;
  const ok = F_N <= 0 || SF >= 1;
  const preloadN = row.F_preload_N;
  const ratioVsPreload = preloadN > 0 ? F_N / preloadN : 0;
  const K_mu = 0.9 * mu + 0.092; // aproxima K para cambiar sensible con μ
  const T_mu_Nm = (K_mu * preloadN * d) / 1000;

  if (F_N <= 0) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--muted">Introduzca la fuerza de tracción de cálculo en la unión (kN).</p>`;
  } else if (ratioVsPreload > 1) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err"><strong>Riesgo de apertura de junta:</strong> F = ${F_kN.toFixed(
      2,
    )} kN supera la precarga orientativa F<sub>V</sub> = ${(preloadN / 1000).toFixed(2)} kN.</p>`;
  } else if (ratioVsPreload > 0.9) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--warn"><strong>Margen bajo:</strong> F = ${F_kN.toFixed(
      2,
    )} kN supera el 90% de la precarga (F/F<sub>V</sub> = ${ratioVsPreload.toFixed(2)}).</p>`;
  } else if (ok) {
    const designNote =
      mode === 'design'
        ? `<br/><span class="lab-small-print">Modo diseño: propuesta mínima en tabla M6–M36 (prioriza menor diámetro con grado 8.8→12.9).</span>`
        : '';
    out.innerHTML = `<p class="lab-verdict lab-verdict--ok">El tornillo <strong>M${d} grado ${grade}</strong> es <strong>APTO</strong> frente a ${F_kN.toFixed(2)} kN con factor de seguridad <strong>≈ ${SF.toFixed(2)}</strong> (resistencia cálculo simplificada).<br/>
      <strong>Torque de apriete (con μ seleccionado):</strong> ${T_mu_Nm.toFixed(1)} N·m (precarga ≈ 75% Rp·A<sub>s</sub>).${designNote}</p>`;
  } else {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err">El tornillo M${d} grado ${grade} <strong>no</strong> cumple: F<sub>req</sub> = ${F_kN.toFixed(2)} kN &gt; F<sub>Rd</sub> ≈ ${row.Ft_Rd_kN.toFixed(2)} kN. Suba diámetro o grado.</p>`;
  }

  tbl.innerHTML = `
    <table class="lab-catalog-table">
      <thead><tr><th>Dato</th><th>Valor</th></tr></thead>
      <tbody>
        <tr><td>Paso P</td><td>${row.pitch_mm} mm</td></tr>
        <tr><td>A<sub>s</sub></td><td>${row.As_mm2.toFixed(1)} mm²</td></tr>
        <tr><td>Rp (ISO 898-1)</td><td>${row.Rp_MPa} MPa</td></tr>
        <tr><td>μ (seleccionado)</td><td>${mu.toFixed(2)}</td></tr>
        <tr><td>Precarga orientativa F<sub>V</sub></td><td>${(row.F_preload_N / 1000).toFixed(2)} kN</td></tr>
        <tr><td>T apriete (μ sel.)</td><td>${T_mu_Nm.toFixed(1)} N·m</td></tr>
        <tr><td>T apriete (ref. K≈0,2)</td><td>${row.T_tighten_Nm.toFixed(1)} N·m</td></tr>
        <tr><td>F<sub>Rd</sub> (simpl.)</td><td>${row.Ft_Rd_kN.toFixed(2)} kN</td></tr>
        <tr><td>F requerida</td><td>${F_kN.toFixed(2)} kN</td></tr>
        <tr><td>F/F<sub>V</sub></td><td>${F_N > 0 ? ratioVsPreload.toFixed(2) : '—'}</td></tr>
      </tbody>
    </table>
    <p class="lab-small-print">No sustituye EN 1993-1-8 ni instrucciones Würth/Bossard; valores de precarga/par son orientativos.</p>`;
}

fillSelects();
['blCalcMode', 'blD', 'blGrade', 'blF', 'blMu'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', render);
  document.getElementById(id)?.addEventListener('change', () => {
    if (id === 'blCalcMode') syncBoltCalcModeUi();
    render();
  });
});
syncBoltCalcModeUi();
render();
