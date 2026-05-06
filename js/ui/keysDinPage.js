/**
 * Chavetas paralelas DIN 6885-1 (extracto) + aplastamiento.
 */

import {
  DIN6885_FORM_A_ROWS,
  DIN6885_STANDARD_LENGTHS,
  KEY_MATERIAL_ALLOWABLE_MPA,
} from '../data/din6885ParallelKeys.js';
import { renderParallelKeyShaftDiagram } from '../lab/diagramCatalogModules.js';

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

  if (!row) {
    out.innerHTML = '<p class="lab-verdict lab-verdict--err">Diámetro fuera de tabla (mín. 6 mm en este extracto).</p>';
    tbl.innerHTML = '';
    return;
  }

  const l_use = Number.isFinite(lUser) && lUser > 0 ? lUser : nextStandardLength(row.b * 4);
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

  renderParallelKeyShaftDiagram(document.getElementById('kyDiagram'), {
    d,
    b: row.b,
    h: row.h,
    t1: row.t1,
    t2: row.t2,
    L: l_use,
  });

  if (ok) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--ok"><strong>APTO</strong> criterio de aplastamiento orientativo frente a ${KEY_MATERIAL_ALLOWABLE_MPA[mat].label} (σ<sub>ap</sub> ≈ ${sigma.toFixed(1)} MPa ≤ σ<sub>adm</sub> ${sigAdm} MPa).<br/>
      <strong>Referencia norma:</strong> dimensiones según tabla paralela tipo DIN 6885-1 (extracto educativo).</p>`;
  } else {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err"><strong>INSUFICIENTE</strong> en aplastamiento (σ<sub>ap</sub> ≈ ${sigma.toFixed(1)} MPa &gt; σ<sub>adm</sub> ${sigAdm} MPa).<br/>
      ${suggestL ? `<strong>Recomendado:</strong> longitud comercial ≥ <strong>${suggestL} mm</strong> (verificar ranura en eje/cubo).` : ''}</p>`;
  }
  if (overLengthAdvisory) {
    out.innerHTML += `<p class="lab-verdict lab-verdict--warn"><strong>Aviso orientativo:</strong> L = ${l_use.toFixed(1)} mm supera 1.5·d ≈ ${lLimit.toFixed(1)} mm. Para chavetas estándar, revise la recomendación L ≤ 1.5·d.</p>`;
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
      <thead><tr><th>Ø eje (mm)</th><th>b × h (mm)</th><th>t₁ (mm)</th><th>t₂ (mm)</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <table class="lab-catalog-table" style="margin-top:.55rem">
      <thead><tr><th>Parámetro de cálculo</th><th>Valor</th></tr></thead>
      <tbody>
        <tr><td>Longitud analizada L</td><td>${l_use} mm</td></tr>
        <tr><td>Par aplicado |T|</td><td>${T.toFixed(2)} N·m</td></tr>
        <tr><td>σap (modelo simplificado)</td><td>${sigma.toFixed(1)} MPa</td></tr>
        <tr><td>σadm material</td><td>${sigAdm} MPa (${KEY_MATERIAL_ALLOWABLE_MPA[mat].label})</td></tr>
        <tr><td>Veredicto aplastamiento</td><td><strong>${ok ? 'APTO' : 'INSUFICIENTE'}</strong></td></tr>
      </tbody>
    </table>`;
}

['kyD', 'kyT', 'kyL', 'kyMat'].forEach((id) => document.getElementById(id)?.addEventListener('input', render));
document.getElementById('kyMat')?.addEventListener('change', render);

render();
