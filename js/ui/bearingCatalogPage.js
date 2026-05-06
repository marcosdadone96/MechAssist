/**
 * Selector catálogo SKF/FAG simulado + L10h ISO 281 simplificada (bolas p=3).
 */

import { DEEP_GROOVE_SERIES } from '../data/skfFagDeepGroove.js';
import { renderCatalogDeepGrooveSection } from '../lab/diagramCatalogModules.js';

function l10_revolutions(C, P) {
  if (P <= 0) return Infinity;
  // ISO 281: L10 [revoluciones] = (C/P)^p * 10^6 (bolas p=3)
  return Math.pow(C / P, 3) * 1e6;
}

function l10_hours(L10_rev, n_rpm) {
  if (n_rpm <= 0) return Infinity;
  return L10_rev / (60 * n_rpm);
}

function fillSeriesSelect() {
  const sel = document.getElementById('bcSeries');
  if (!sel) return;
  sel.innerHTML = DEEP_GROOVE_SERIES.map((s) => `<option value="${s.id}">${s.label}</option>`).join('');
}

function fillBearingSelect(seriesId) {
  const sel = document.getElementById('bcBearing');
  const ser = DEEP_GROOVE_SERIES.find((s) => s.id === seriesId);
  if (!sel || !ser) return;
  sel.innerHTML = ser.bearings
    .map((b) => `<option value="${b.designation}">${b.designation} · d=${b.d} / D=${b.D} / B=${b.B} · C=${b.C_N} N</option>`)
    .join('');
}

function render() {
  const seriesId = document.getElementById('bcSeries')?.value;
  const des = document.getElementById('bcBearing')?.value;
  const P = parseFloat(document.getElementById('bcP')?.value || '0');
  const n = parseFloat(document.getElementById('bcN')?.value || '0');
  const Lreq = parseFloat(document.getElementById('bcLreq')?.value || '20000');
  const hpd = parseFloat(document.getElementById('bcHpd')?.value || '16');
  const out = document.getElementById('bcOut');
  const tbl = document.getElementById('bcTable');
  const autoGeom = document.getElementById('bcAutoGeom');
  if (!out || !tbl) return;

  const ser = DEEP_GROOVE_SERIES.find((s) => s.id === seriesId);
  const b = ser?.bearings.find((x) => x.designation === des);
  if (!b) {
    out.innerHTML = '';
    tbl.innerHTML = '';
    if (autoGeom) autoGeom.textContent = 'Geometría y C del rodamiento seleccionado.';
    return;
  }
  if (autoGeom) {
    autoGeom.textContent = `${b.designation}: d=${b.d} mm · D=${b.D} mm · B=${b.B} mm · C=${b.C_N.toLocaleString('es-ES')} N`;
  }

  renderCatalogDeepGrooveSection(document.getElementById('bcDiagram'), {
    d: b.d,
    D: b.D,
    B: b.B,
    designation: b.designation,
  });

  const C = b.C_N;
  const Puse = Math.max(1, P);
  const Lrev = l10_revolutions(C, Puse);
  const nUse = Number.isFinite(n) && n > 0 ? n : null;
  const hpdUse = Number.isFinite(hpd) && hpd > 0 ? Math.min(24, hpd) : null;
  const Lh = nUse != null ? l10_hours(Lrev, nUse) : NaN;
  if (nUse == null || hpdUse == null) {
    out.innerHTML = '<p class=\"lab-verdict lab-verdict--err\">Entrada no válida: use n &gt; 0 min⁻¹ y horas/día &gt; 0.</p>';
    tbl.innerHTML = '';
    return;
  }
  const Lyears = Lh / (hpdUse * 365);
  const reqYears = Lreq / (hpdUse * 365);
  const margin = Lreq > 0 ? (Lh - Lreq) / Lreq : 0;
  const ok = Lh >= Lreq;

  if (ok && margin >= 0.5) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--ok"><strong>APTO con margen</strong>: ${b.designation} supera las ${Lreq.toLocaleString(
      'es-ES',
    )} h con margen ≥ 50% (L<sub>10h</sub> ≈ ${Lh.toFixed(0)} h; ${Lyears.toFixed(2)} años).</p>`;
  } else if (ok) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--warn"><strong>APTO ajustado</strong>: ${b.designation} supera el objetivo, pero con margen < 50% (L<sub>10h</sub> ≈ ${Lh.toFixed(
      0,
    )} h; ${Lyears.toFixed(2)} años).</p>`;
  } else {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err"><strong>INSUFICIENTE</strong>: ${b.designation} no alcanza ${Lreq.toLocaleString(
      'es-ES',
    )} h (L<sub>10h</sub> ≈ ${Lh.toFixed(0)} h; ${Lyears.toFixed(2)} años). Elija mayor C o menor P.</p>`;
  }

  tbl.innerHTML = `
    <table class="lab-catalog-table">
      <thead><tr><th>Catálogo</th><th>Aplicación</th></tr></thead>
      <tbody>
        <tr><td>Designación</td><td>${b.designation}</td></tr>
        <tr><td>d × D × B</td><td>${b.d} × ${b.D} × ${b.B} mm</td></tr>
        <tr><td>C (dinámica)</td><td>${C.toLocaleString('es-ES')} N</td></tr>
        <tr><td>C₀</td><td>${b.Co_N.toLocaleString('es-ES')} N</td></tr>
        <tr><td>P equivalente</td><td>${Puse.toLocaleString('es-ES')} N</td></tr>
        <tr><td>n trabajo</td><td>${nUse.toFixed(0)} min⁻¹</td></tr>
        <tr><td>Horas servicio por día</td><td>${hpdUse.toFixed(0)} h/día</td></tr>
        <tr><td>L<sub>10</sub> (mill. rev)</td><td>${(Lrev / 1e6).toFixed(3)}</td></tr>
        <tr><td>L<sub>10h</sub></td><td><strong>${Lh.toFixed(0)} h</strong></td></tr>
        <tr><td>Vida en años</td><td><strong>${Lyears.toFixed(2)} años</strong></td></tr>
        <tr><td>Horas requeridas</td><td>${Lreq.toLocaleString('es-ES')} h (${reqYears.toFixed(2)} años)</td></tr>
      </tbody>
    </table>
    <p class="lab-small-print">C y C₀ son valores demostrativos (±10%). Vida según L = (C/P)³ y horas = L/(60n).</p>`;
}

fillSeriesSelect();
fillBearingSelect(DEEP_GROOVE_SERIES[0].id);

document.getElementById('bcSeries')?.addEventListener('change', (e) => {
  fillBearingSelect(e.target.value);
  render();
});
document.getElementById('bcBearing')?.addEventListener('change', render);
['bcP', 'bcN', 'bcLreq', 'bcHpd'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', render);
  document.getElementById(id)?.addEventListener('change', render);
});

render();
