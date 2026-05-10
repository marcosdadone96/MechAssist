/**
 * Selector acoplamientos — catálogo + par de diseño.
 */

import {
  bindInputValidation,
  mountLabPresetsBar,
  updateLabShareVisibility,
  wireLabCopyLink,
} from './labCalcUx.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { COUPLING_BRANDS } from '../data/couplingsCatalog.js';
import { renderCouplingAssemblyDiagram } from '../lab/diagramCatalogModules.js';

function torqueFromPower_kW_nm(P_kW, n_rpm) {
  if (!(Number.isFinite(P_kW) && P_kW >= 0 && Number.isFinite(n_rpm) && n_rpm > 0)) return NaN;
  const w = (2 * Math.PI * n_rpm) / 60;
  return (P_kW * 1000) / w;
}

function fillBrandSelect() {
  const sel = document.getElementById('cpBrand');
  if (!sel) return;
  sel.innerHTML = COUPLING_BRANDS.map((b) => `<option value="${b.id}">${b.label}</option>`).join('');
}

function fillSeriesSelect(brandId) {
  const sel = document.getElementById('cpSeries');
  const brand = COUPLING_BRANDS.find((b) => b.id === brandId);
  if (!sel || !brand) return;
  sel.innerHTML = brand.series.map((s) => `<option value="${s.model}">${s.model} · ${s.family} · ${s.T_nom_Nm} N·m</option>`).join('');
  updateSeriesPreview();
}

function updateSeriesPreview() {
  const brandId = document.getElementById('cpBrand')?.value;
  const model = document.getElementById('cpSeries')?.value;
  const preview = document.getElementById('cpSeriesPreview');
  const brand = COUPLING_BRANDS.find((b) => b.id === brandId);
  const row = brand?.series.find((s) => s.model === model);
  if (!preview) return;
  if (!row) {
    preview.textContent = '';
    return;
  }
  preview.innerHTML = `Catálogo demo seleccionado: <strong>${row.model}</strong> · T<sub>nom</sub> = <strong>${row.T_nom_Nm} N·m</strong>`;
}

function findSuggestedModel(brandId, T_req_Nm) {
  const brand = COUPLING_BRANDS.find((b) => b.id === brandId);
  if (!brand) return null;
  const ok = brand.series.filter((s) => s.T_nom_Nm >= T_req_Nm);
  if (!ok.length) return brand.series[brand.series.length - 1];
  return ok.reduce((a, b) => (a.T_nom_Nm < b.T_nom_Nm ? a : b));
}

let couplingUrlHydrating = false;

function serializeCouplingUrl() {
  if (couplingUrlHydrating) return;
  const params = new URLSearchParams();
  const pEl = document.getElementById('cpPower');
  const nEl = document.getElementById('cpRpm');
  const kEl = document.getElementById('cpK');
  const bEl = document.getElementById('cpBrand');
  const mEl = document.getElementById('cpSeries');
  if (pEl instanceof HTMLInputElement) params.set('P', pEl.value);
  if (nEl instanceof HTMLInputElement) params.set('n', nEl.value);
  if (kEl instanceof HTMLInputElement) params.set('K', kEl.value);
  if (bEl instanceof HTMLSelectElement) params.set('b', bEl.value);
  if (mEl instanceof HTMLSelectElement && mEl.value) params.set('m', mEl.value);
  const qs = params.toString();
  const path = `${location.pathname}${location.hash || ''}`;
  history.replaceState(null, '', qs ? `${path}?${qs}` : path);
}

function hydrateCouplingFromUrl() {
  const q = new URLSearchParams(location.search);
  if ([...q.keys()].length === 0) return;
  couplingUrlHydrating = true;
  try {
    const b = q.get('b');
    if (b && document.getElementById('cpBrand') instanceof HTMLSelectElement) {
      document.getElementById('cpBrand').value = b;
      fillSeriesSelect(b);
    }
    const p = q.get('P');
    const n = q.get('n');
    const K = q.get('K');
    if (p != null && document.getElementById('cpPower') instanceof HTMLInputElement) {
      document.getElementById('cpPower').value = p;
    }
    if (n != null && document.getElementById('cpRpm') instanceof HTMLInputElement) {
      document.getElementById('cpRpm').value = n;
    }
    if (K != null && document.getElementById('cpK') instanceof HTMLInputElement) {
      document.getElementById('cpK').value = K;
    }
    const m = q.get('m');
    const sEl = document.getElementById('cpSeries');
    if (m && sEl instanceof HTMLSelectElement) {
      sEl.value = m;
    }
    updateSeriesPreview();
  } finally {
    queueMicrotask(() => {
      couplingUrlHydrating = false;
    });
  }
}

const CP_PRESETS = [
  {
    label: 'Lovejoy · bomba 7.5 kW',
    values: {
      cpBrand: 'lovejoy',
      cpSeries: 'L095',
      cpPower: 7.5,
      cpRpm: 1455,
      cpK: 1.5,
    },
  },
  {
    label: 'KTR ROTEX · 15 kW',
    values: {
      cpBrand: 'ktr',
      cpSeries: 'ROTEX 24',
      cpPower: 15,
      cpRpm: 3000,
      cpK: 1.25,
    },
  },
  {
    label: 'Flender · pesado',
    values: {
      cpBrand: 'flender',
      cpSeries: 'N-Eupex 125',
      cpPower: 45,
      cpRpm: 750,
      cpK: 1.75,
    },
  },
];

function render() {
  const P = parseFloat((document.getElementById('cpPower')?.value || '0').replace(',', '.'));
  const n = parseFloat((document.getElementById('cpRpm')?.value || '0').replace(',', '.'));
  const K = parseFloat((document.getElementById('cpK')?.value || '1.25').replace(',', '.'));
  const brandId = document.getElementById('cpBrand')?.value;
  const model = document.getElementById('cpSeries')?.value;
  const out = document.getElementById('cpOut');
  const tbl = document.getElementById('cpTable');
  if (!out || !tbl) return;

  if (!(Number.isFinite(P) && P >= 0 && Number.isFinite(n) && n > 0 && Number.isFinite(K) && K >= 1)) {
    out.innerHTML = '<p class="lab-verdict lab-verdict--err"><strong>Entrada no válida:</strong> use P ≥ 0, n > 0 y K ≥ 1.</p>';
    tbl.innerHTML = '';
    updateLabShareVisibility('cpShareLinkWrap', 'cpOut');
    serializeCouplingUrl();
    return;
  }
  const T_ap = torqueFromPower_kW_nm(P, n);
  const T_des = T_ap * K;
  const brand = COUPLING_BRANDS.find((b) => b.id === brandId);
  const row = brand?.series.find((s) => s.model === model);

  if (!row) {
    out.innerHTML = '<p class="lab-verdict lab-verdict--muted">Seleccione fabricante y modelo.</p>';
    tbl.innerHTML = '';
    updateLabShareVisibility('cpShareLinkWrap', 'cpOut');
    serializeCouplingUrl();
    return;
  }

  const ok = row.T_nom_Nm >= T_des;
  const ratio = T_des / row.T_nom_Nm;
  const sug = ok ? null : findSuggestedModel(brandId, T_des);

  if (ratio <= 0.8) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--ok"><strong>Margen holgado:</strong> ${row.model} trabaja cómodo (${T_des.toFixed(1)} N·m ≤ 0.8·T<sub>nom</sub>).</p>`;
  } else if (ratio <= 1) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--warn"><strong>Margen justo:</strong> ${row.model} está cerca del límite (${(ratio * 100).toFixed(1)}% de T<sub>nom</sub>).</p>`;
  } else {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err"><strong>ERROR:</strong> El modelo <strong>${row.model}</strong> no soporta la carga (${T_des.toFixed(1)} N·m &gt; ${row.T_nom_Nm} N·m).<br/>
      <strong>Sugerido:</strong> modelo <strong>${sug?.model ?? '—'}</strong> (${sug ? `${sug.T_nom_Nm} N·m` : ''}).</p>`;
  }

  tbl.innerHTML = `
    <table class="lab-catalog-table">
      <thead><tr><th>Concepto</th><th>Aplicación</th><th>Catálogo (${brand?.label})</th></tr></thead>
      <tbody>
        <tr><td>Potencia</td><td>${P.toFixed(3)} kW</td><td>—</td></tr>
        <tr><td>Velocidad</td><td>${n.toFixed(0)} min⁻¹</td><td>—</td></tr>
        <tr><td>Factor servicio K</td><td>${K.toFixed(2)}</td><td>—</td></tr>
        <tr><td>Par en eje (entrada)</td><td>${T_ap.toFixed(2)} N·m</td><td>—</td></tr>
        <tr><td>Par de diseño</td><td><strong>${T_des.toFixed(2)} N·m</strong></td><td>T<sub>nom</sub> = ${row.T_nom_Nm} N·m</td></tr>
        <tr><td>Modelo</td><td>—</td><td>${row.model} · ${row.family}</td></tr>
        <tr><td>Ø máx. aloj. (ref.)</td><td>—</td><td>${row.bore_max_mm} mm</td></tr>
        <tr><td>Notas cat.</td><td colspan="2">${row.note}</td></tr>
      </tbody>
    </table>
    <p class="lab-small-print">Datos de catálogo demostrativos. La selección final debe hacerse con el catálogo oficial del fabricante y su condición real de servicio.</p>`;

  updateLabShareVisibility('cpShareLinkWrap', 'cpOut');
  serializeCouplingUrl();
}

renderCouplingAssemblyDiagram(document.getElementById('cpDiagram'));

bindInputValidation([
  { id: 'cpPower', min: 0, max: 1e7, label: 'Potencia' },
  { id: 'cpRpm', min: 1, max: 2e6, label: 'RPM' },
  { id: 'cpK', min: 1, max: 10, label: 'Factor K' },
]);

fillBrandSelect();
fillSeriesSelect(COUPLING_BRANDS[0].id);
updateSeriesPreview();

hydrateCouplingFromUrl();

function scheduleCouplingRender() {
  if (!couplingUrlHydrating) {
    document.querySelectorAll('#cpPresetsBar .lab-preset-btn').forEach((b) => b.classList.remove('is-active'));
  }
  render();
}

mountLabPresetsBar('cpPresetsBar', CP_PRESETS, () => {
  render();
});
document.getElementById('cpBrand')?.addEventListener('change', (e) => {
  fillSeriesSelect(e.target.value);
  updateSeriesPreview();
  scheduleCouplingRender();
});
document.getElementById('cpSeries')?.addEventListener('change', () => {
  updateSeriesPreview();
  scheduleCouplingRender();
});
['cpPower', 'cpRpm', 'cpK'].forEach((id) => document.getElementById(id)?.addEventListener('input', scheduleCouplingRender));
document.querySelectorAll('.cp-ka-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = document.getElementById('cpK');
    const ka = Number(btn.getAttribute('data-ka'));
    if (!(input instanceof HTMLInputElement) || !Number.isFinite(ka) || ka < 1) return;
    input.value = ka.toFixed(2);
    scheduleCouplingRender();
  });
});

wireLabCopyLink('cpCopyLinkBtn', 'cpCopyToast');

render();
mountLabCloudSaveBar('Acoplamientos');
