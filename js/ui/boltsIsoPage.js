/**
 * Tornillería ISO 898-1 — verificación simplificada tracción + par de apriete catálogo.
 */

import { BOLT_DIAMETERS, boltRowCatalog, GRADE_PROOF_MPA } from '../data/metricBoltGrades.js';
import { renderBoltedJointDiagram } from '../lab/diagramCatalogModules.js';

function fillSelects() {
  const dSel = document.getElementById('blD');
  const gSel = document.getElementById('blGrade');
  if (dSel) {
    dSel.innerHTML = BOLT_DIAMETERS.map((d) => `<option value="${d}">M${d}</option>`).join('');
  }
  if (gSel) {
    gSel.innerHTML = Object.keys(GRADE_PROOF_MPA).map((g) => `<option value="${g}">${g}</option>`).join('');
  }
}

function render() {
  const d = parseInt(document.getElementById('blD')?.value || '12', 10);
  const grade = document.getElementById('blGrade')?.value || '10.9';
  const F_kN = parseFloat(document.getElementById('blF')?.value || '0');
  const out = document.getElementById('blOut');
  const tbl = document.getElementById('blTable');
  if (!out || !tbl) return;

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

  if (F_N <= 0) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--muted">Introduzca la fuerza de tracción de cálculo en la unión (kN).</p>`;
  } else if (ok) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--ok">El tornillo <strong>M${d} grado ${grade}</strong> es <strong>APTO</strong> frente a ${F_kN.toFixed(2)} kN con factor de seguridad <strong>≈ ${SF.toFixed(2)}</strong> (resistencia cálculo simplificada).<br/>
      <strong>Torque de apriete recomendado (catálogo genérico):</strong> ${row.T_tighten_Nm.toFixed(1)} N·m (precarga ≈ 75% Rp·A<sub>s</sub>).</p>`;
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
        <tr><td>Precarga orientativa F<sub>V</sub></td><td>${(row.F_preload_N / 1000).toFixed(2)} kN</td></tr>
        <tr><td>T apriete (K≈0,2)</td><td>${row.T_tighten_Nm.toFixed(1)} N·m</td></tr>
        <tr><td>F<sub>Rd</sub> (simpl.)</td><td>${row.Ft_Rd_kN.toFixed(2)} kN</td></tr>
        <tr><td>F requerida</td><td>${F_kN.toFixed(2)} kN</td></tr>
      </tbody>
    </table>
    <p class="lab-small-print">No sustituye EN 1993-1-8 ni instrucciones Würth/Bossard; valores de precarga/par son orientativos.</p>`;
}

fillSelects();
['blD', 'blGrade', 'blF'].forEach((id) => document.getElementById(id)?.addEventListener('input', render));
document.getElementById('blGrade')?.addEventListener('change', render);

render();
