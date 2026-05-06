import { mountTierStatusBar } from './paywallMount.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import {
  debounce,
  executiveSummaryAlert,
  metricHtml,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  uxCopy,
} from './labCalcUx.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';
import { lookupSeeger } from '../lab/seegerDinTables.js';
import { renderSeegerDiagram } from '../lab/diagramSeeger.js';

mountTierStatusBar();
bootSmartDashboardIfEnabled('Anillos Seeger \u00b7 laboratorio');
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

function readD() {
  const el = document.getElementById('sgD');
  if (!el || !(el instanceof HTMLInputElement)) return NaN;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

function readKind() {
  const el = document.getElementById('sgKind');
  if (!el || !(el instanceof HTMLSelectElement)) return 'shaft';
  return el.value === 'bore' ? 'bore' : 'shaft';
}
function readFaxWork() {
  const el = document.getElementById('sgFaxWork');
  if (!el || !(el instanceof HTMLInputElement)) return null;
  const raw = String(el.value || '').trim();
  if (!raw) return null;
  const n = parseFloat(raw.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** @returns {boolean} true = inoxidable */
function readInox() {
  const el = document.getElementById('sgMaterial');
  if (!el || !(el instanceof HTMLSelectElement)) return false;
  return el.value === 'inox';
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * @param {'shaft'|'bore'} kind
 * @param {number} d1
 * @param {boolean} inox
 */
function orderCodeSeeger(kind, d1, inox) {
  const d = Number.isInteger(d1) ? String(d1) : String(d1);
  const base =
    kind === 'shaft' ? `Anillo Seeger DIN 471 - ${d}` : `Anillo Seeger DIN 472 - ${d}`;
  return inox ? `${base} - INOX` : base;
}

function techRef(kind, d1) {
  return kind === 'shaft' ? `DIN 471-A${d1}` : `DIN 472-J${d1}`;
}

const FAX_ORIENT_DIN471 = [
  { d1: 10, faxN: 800 },
  { d1: 20, faxN: 2800 },
  { d1: 30, faxN: 6500 },
  { d1: 40, faxN: 11000 },
  { d1: 50, faxN: 16000 },
];

function interpFaxOrient(d1) {
  const x = Number(d1);
  if (!Number.isFinite(x) || x <= 0) return NaN;
  if (x <= FAX_ORIENT_DIN471[0].d1) return FAX_ORIENT_DIN471[0].faxN;
  const last = FAX_ORIENT_DIN471[FAX_ORIENT_DIN471.length - 1];
  if (x >= last.d1) return last.faxN;
  for (let i = 0; i < FAX_ORIENT_DIN471.length - 1; i += 1) {
    const a = FAX_ORIENT_DIN471[i];
    const b = FAX_ORIENT_DIN471[i + 1];
    if (x >= a.d1 && x <= b.d1) {
      const t = (x - a.d1) / (b.d1 - a.d1);
      return a.faxN + (b.faxN - a.faxN) * t;
    }
  }
  return NaN;
}

function refreshCore() {
  const d = readD();
  const kind = readKind();
  const inox = readInox();
  const hit = lookupSeeger(d, kind);
  const faxWork = readFaxWork();

  const heroEl = document.getElementById('sgHero');
  const box = document.getElementById('sgResults');
  const svg = document.getElementById('sgDiagram');

  if (!hit.row || !Number.isFinite(d)) {
    if (heroEl) heroEl.innerHTML = '';
    if (box) {
      box.innerHTML = [
        executiveSummaryAlert({
          level: 'danger',
          titleEs: 'Resumen ejecutivo: datos insuficientes para seleccionar anillo.',
          titleEn: 'Executive summary: insufficient data to select retaining ring.',
          actionsEs: ['Introducir diámetro nominal válido.', 'Elegir eje (DIN 471) o agujero (DIN 472).'],
          actionsEn: ['Enter a valid nominal diameter.', 'Choose shaft (DIN 471) or bore (DIN 472).'],
        }),
        `<div class="lab-metric lab-metric--wide"><div class="lab-metric__text">${uxCopy(
          'Introduzca un diámetro válido (mm) y el tipo de alojamiento.',
          'Enter a valid diameter (mm) and housing type.',
        )}</div></div>`,
      ].join('');
    }
    if (svg) {
      svg.removeAttribute('viewBox');
      svg.innerHTML = '';
    }
    emitEngineeringSnapshot({
      page: 'calc-seeger',
      moduleLabel: 'Anillos Seeger',
      advisorContext: {},
      shoppingLines: [],
      metrics: [],
    });
    return;
  }

  const row = hit.row;
  const norm = kind === 'shaft' ? 'DIN 471' : 'DIN 472';
  const form = 'Forma A (referencia)';
  const pedido = orderCodeSeeger(kind, row.d1, inox);
  const pedidoCompacto = `${norm} - ${row.d1}${inox ? ' - INOX' : ''}`;
  const refCorta = techRef(kind, row.d1);
  const faxAdm = interpFaxOrient(row.d1);
  const hintPedido = `${refCorta} \u00b7 ${norm} ${form}. En comercio tambi\u00e9n: circlip, anillo de retenci\u00f3n. Confirme referencia en cat\u00e1logo.`;

  if (heroEl) {
    heroEl.innerHTML = renderResultHero([
      {
        label: 'C\u00f3digo de pedido (referencia)',
        display: pedidoCompacto,
        hint: hintPedido,
      },
      {
        label: 'Norma principal',
        display: norm,
        hint:
          kind === 'shaft'
            ? 'Anillos de seguridad exteriores para ejes (DIN 471).'
            : 'Anillos de seguridad interiores para alojamientos (DIN 472).',
      },
      {
        label: 'Fax admisible orient.',
        display: Number.isFinite(faxAdm) ? `${Math.round(faxAdm)} N` : 'No disponible',
        hint: 'Escalado orientativo con tabla DIN 471 (acero estándar). Confirmar en fabricante.',
      },
    ]);
  }

  if (box) {
    const parts = [];
    parts.push(
      executiveSummaryAlert({
        level: 'ok',
        titleEs: 'Resumen ejecutivo: referencia DIN localizada para preselección.',
        titleEn: 'Executive summary: DIN reference found for preselection.',
        actionsEs: ['Verificar tolerancias y material final.', 'Confirmar referencia exacta en catálogo de proveedor.'],
        actionsEn: ['Verify final tolerances and material.', 'Confirm exact reference in supplier catalogue.'],
      }),
    );
    if (hit.hint) {
      parts.push(
        `<div class="lab-alert lab-alert--info">${esc(hit.hint).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`,
      );
    }
    parts.push(
      metricHtml(
        'Referencia t\u00e9cnica compacta',
        refCorta,
        '\u00datil en fichas y dibujos; no sustituye el texto completo de pedido.',
      ),
    );
    if (Number.isFinite(faxAdm)) {
      parts.push(metricHtml('Fax admisible orientativa', `${Math.round(faxAdm)} N`, 'Tabla resumida DIN 471; valor solo orientativo.'));
      if (faxWork != null) {
        const ok = faxWork <= faxAdm;
        parts.push(
          `<div class="lab-alert lab-alert--${ok ? 'ok' : 'danger'}"><strong>${ok ? 'APTO' : 'NO APTO'} axial:</strong> Fax trabajo = ${Math.round(
            faxWork,
          )} N vs Fax adm orient. = ${Math.round(faxAdm)} N.</div>`,
        );
      }
    }
    if (kind === 'shaft') {
      const ex = /** @type {import('../lab/seegerDinTables.js').SeegerExternalRow} */ (row);
      parts.push(
        metricHtml('Di\u00e1metro nominal eje d1', `${ex.d1} mm`, 'Talla del anillo y del eje de referencia.'),
        metricHtml('Espesor s', `${ex.s} mm`, 'Espesor del anillo.'),
        metricHtml('Di\u00e1metro fondo ranura d3', `${ex.d3} mm`, 'Cota de mecanizado de la garganta en el eje (tabla demo).'),
        metricHtml('Anchura ranura m', `${ex.m} mm`, 'Anchura axial de la ranura en el eje.'),
        metricHtml('Di\u00e1m. exterior libre (aprox.)', `${ex.dFree} mm`, 'Anillo sin montar; ver tolerancias de fabricante.'),
      );
    } else {
      const inn = /** @type {import('../lab/seegerDinTables.js').SeegerInternalRow} */ (row);
      parts.push(
        metricHtml('Di\u00e1metro nominal agujero d1', `${inn.d1} mm`, 'Talla del anillo y alojamiento de referencia.'),
        metricHtml('Espesor s', `${inn.s} mm`, 'Espesor del anillo.'),
        metricHtml('Di\u00e1metro fondo ranura dG', `${inn.dG} mm`, 'Garganta en la pared del agujero (tabla demo).'),
        metricHtml('Anchura ranura m', `${inn.m} mm`, 'Anchura axial de la ranura.'),
        metricHtml('Di\u00e1m. exterior libre (aprox.)', `${inn.odFree} mm`, 'Anillo expandido; montaje con pinzas.'),
        metricHtml('Anchura anillo b (aprox.)', `${inn.b} mm`, 'Seg\u00fan tabulaci\u00f3n de referencia.'),
      );
    }
    parts.push(
      `<div class="lab-metric lab-metric--wide"><div class="lab-metric__head"><span class="k">Pedido en cat\u00e1logo</span></div><div class="lab-metric__text">Solicite <strong>${esc(
        pedido,
      )}</strong> o equivalente comercial (p. ej. ref. Seeger / circlip). Verifique acero${inox ? ' inoxidable' : ''}, bisel y empaque. Hipótesis: no sustituye ensayo de carga axial ni cálculo de asentamiento dinámico.</div></div>`,
    );
    box.innerHTML = parts.join('');
  }

  if (svg) {
    if (kind === 'shaft') {
      renderSeegerDiagram(svg, { kind: 'shaft', row: /** @type {any} */ (row) });
    } else {
      renderSeegerDiagram(svg, { kind: 'bore', row: /** @type {any} */ (row) });
    }
  }

  emitEngineeringSnapshot({
    page: 'calc-seeger',
    moduleLabel: 'Anillos Seeger DIN',
    advisorContext: {
      seeger: { kind, dNom: row.d1, norm, orderCode: pedido, inox },
    },
    shoppingLines: [],
    metrics: [
      { label: 'Pedido', value: pedido },
      { label: 'd1 mm', value: String(row.d1) },
    ],
  });
}

const wrap = document.getElementById('sgResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);
document.getElementById('sgSizePreset')?.addEventListener('change', () => {
  const sel = document.getElementById('sgSizePreset');
  const dInput = document.getElementById('sgD');
  if (sel instanceof HTMLSelectElement && dInput instanceof HTMLInputElement && sel.value) {
    dInput.value = sel.value;
  }
  debounced();
});
document.getElementById('sgD')?.addEventListener('input', debounced);
document.getElementById('sgD')?.addEventListener('change', () => {
  const dInput = document.getElementById('sgD');
  const preset = document.getElementById('sgSizePreset');
  if (dInput instanceof HTMLInputElement && preset instanceof HTMLSelectElement) {
    const v = String(Math.round(parseFloat(dInput.value || '')));
    preset.value = Array.from(preset.options).some((o) => o.value === v) ? v : '';
  }
  debounced();
});
document.getElementById('sgKind')?.addEventListener('change', debounced);
document.getElementById('sgMaterial')?.addEventListener('change', debounced);
document.getElementById('sgFaxWork')?.addEventListener('input', debounced);
document.getElementById('sgFaxWork')?.addEventListener('change', debounced);
runCalcWithIndustrialFeedback(wrap, refreshCore);
