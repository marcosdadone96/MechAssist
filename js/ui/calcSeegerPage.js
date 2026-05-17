import { mountTierStatusBar } from './paywallMount.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import {
  bindInputValidation,
  createLabUrlSync,
  debounce,
  executiveSummaryAlert,
  metricHtml,
  mountLabPresetsBar,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  updateLabShareVisibility,
  uxCopy,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';
import { lookupSeeger } from '../lab/seegerDinTables.js';
import { renderSeegerDiagram } from '../lab/diagramSeeger.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { getLabLang } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { SEEGER_PAGE_EN } from '../lab/i18n/pages/seegerPageEn.js';
import { localizeSeegerHint } from '../lab/i18n/runtime/seegerHintRuntime.js';

function bx(es, en) {
  return getLabLang() === 'en' ? en : es;
}

mountTierStatusBar();
bootSmartDashboardIfEnabled(bx('Anillos Seeger \u00b7 laboratorio', 'Seeger rings \u00b7 lab'));
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'sgD', min: 3, max: 1000, label: 'Diámetro d' },
  { id: 'sgFaxWork', min: 0, max: 1e9, label: 'Fax trabajo' },
]);

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
    kind === 'shaft'
      ? bx(`Anillo Seeger DIN 471 - ${d}`, `Seeger ring DIN 471 - ${d}`)
      : bx(`Anillo Seeger DIN 472 - ${d}`, `Seeger ring DIN 472 - ${d}`);
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
  const alertsEl = document.getElementById('sgAlerts');
  const box = document.getElementById('sgResults');
  const svg = document.getElementById('sgDiagram');

  if (!hit.row || !Number.isFinite(d)) {
    if (heroEl) heroEl.innerHTML = '';
    if (alertsEl) {
      alertsEl.innerHTML = executiveSummaryAlert({
        level: 'danger',
        titleEs: 'Resumen ejecutivo: datos insuficientes para seleccionar anillo.',
        titleEn: 'Executive summary: insufficient data to select retaining ring.',
        actionsEs: ['Introducir diámetro nominal válido.', 'Elegir eje (DIN 471) o agujero (DIN 472).'],
        actionsEn: ['Enter a valid nominal diameter.', 'Choose shaft (DIN 471) or bore (DIN 472).'],
      });
    }
    if (box) {
      box.innerHTML = `<div class="lab-metric lab-metric--wide"><div class="lab-metric__text">${uxCopy(
        'Introduzca un diámetro válido (mm) y el tipo de alojamiento.',
        'Enter a valid diameter (mm) and housing type.',
      )}</div></div>`;
    }
    if (svg) {
      svg.removeAttribute('viewBox');
      svg.innerHTML = '';
    }
    emitEngineeringSnapshot({
      page: 'calc-seeger',
      moduleLabel: bx('Anillos Seeger', 'Seeger rings'),
      advisorContext: {},
      shoppingLines: [],
      metrics: [],
    });
    updateLabShareVisibility('sgShareLinkWrap', 'sgResults');
    sgUrl.serializeToUrl();
    return;
  }

  const row = hit.row;
  const norm = kind === 'shaft' ? 'DIN 471' : 'DIN 472';
  const form = bx('Forma A (referencia)', 'Form A (reference)');
  const pedido = orderCodeSeeger(kind, row.d1, inox);
  const pedidoCompacto = `${norm} - ${row.d1}${inox ? ' - INOX' : ''}`;
  const refCorta = techRef(kind, row.d1);
  const faxAdm = interpFaxOrient(row.d1);
  const hintPedido = `${refCorta} \u00b7 ${norm} ${form}. ${bx(
    'En comercio tambi\u00e9n: circlip, anillo de retenci\u00f3n. Confirme referencia en cat\u00e1logo.',
    'Also sold as circlip / snap ring. Confirm reference in catalogue.',
  )}`;

  const sgVerdict =
    faxWork != null && Number.isFinite(faxAdm) && faxWork > faxAdm ? 'error' : 'ok';

  if (heroEl) {
    heroEl.innerHTML = renderResultHero(
      [
      {
        label: bx('C\u00f3digo de pedido (referencia)', 'Order code (reference)'),
        display: pedidoCompacto,
        hint: hintPedido,
      },
      {
        label: bx('Norma principal', 'Main standard'),
        display: norm,
        hint:
          kind === 'shaft'
            ? bx('Anillos de seguridad exteriores para ejes (DIN 471).', 'External retaining rings for shafts (DIN 471).')
            : bx('Anillos de seguridad interiores para alojamientos (DIN 472).', 'Internal retaining rings for bores (DIN 472).'),
      },
      {
        label: bx('Fax admisible orient.', 'Orient. allowable Fax'),
        display: Number.isFinite(faxAdm) ? `${Math.round(faxAdm)} N` : bx('No disponible', 'Not available'),
        hint: bx(
          'Escalado orientativo con tabla DIN 471 (acero est\u00e1ndar). Confirmar en fabricante.',
          'Indicative scaling from DIN 471 table (standard steel). Confirm with manufacturer.',
        ),
      },
    ],
      { verdict: sgVerdict },
    );
  }

  if (alertsEl) {
    const alertParts = [];
    alertParts.push(
      executiveSummaryAlert({
        level: sgVerdict === 'error' ? 'danger' : 'ok',
        titleEs:
          sgVerdict === 'error'
            ? 'Resumen ejecutivo: revise la carga axial frente a la referencia orientativa.'
            : 'Resumen ejecutivo: referencia DIN localizada para preselección.',
        titleEn:
          sgVerdict === 'error'
            ? 'Executive summary: review axial load against the orientation reference.'
            : 'Executive summary: DIN reference found for preselection.',
        actionsEs:
          sgVerdict === 'error'
            ? ['Reducir Fax de trabajo o seleccionar mayor capacidad.', 'Confirmar en tabla completa del fabricante.']
            : ['Verificar tolerancias y material final.', 'Confirmar referencia exacta en catálogo de proveedor.'],
        actionsEn:
          sgVerdict === 'error'
            ? ['Reduce working Fax or pick a higher-capacity ring.', 'Confirm with the manufacturer full table.']
            : ['Verify final tolerances and material.', 'Confirm exact reference in supplier catalogue.'],
      }),
    );
    if (hit.hint) {
      alertParts.push(
        `<div class="lab-alert lab-alert--info">${esc(localizeSeegerHint(hit.hint, getLabLang() === 'en' ? 'en' : 'es')).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`,
      );
    }
    alertsEl.innerHTML = alertParts.join('');
  }

  if (box) {
    const parts = [];
    parts.push(
      metricHtml(
        bx('Referencia t\u00e9cnica compacta', 'Compact technical ref.'),
        refCorta,
        bx('\u00datil en fichas y dibujos; no sustituye el texto completo de pedido.', 'Useful on drawings; not a full order text.'),
      ),
    );
    if (Number.isFinite(faxAdm)) {
      parts.push(
        metricHtml(
          bx('Fax admisible orientativa', 'Orient. allowable Fax'),
          `${Math.round(faxAdm)} N`,
          bx('Tabla resumida DIN 471; valor solo orientativo.', 'Summary DIN 471 table; indicative only.'),
        ),
      );
      if (faxWork != null) {
        const ok = faxWork <= faxAdm;
        parts.push(
          `<div class="lab-alert lab-alert--${ok ? 'ok' : 'danger'}"><strong>${ok ? bx('APTO', 'OK') : bx('NO APTO', 'NOT OK')} axial:</strong> ${bx('Fax trabajo', 'Working Fax')} = ${Math.round(
            faxWork,
          )} N vs ${bx('Fax adm orient.', 'Orient. Fax adm')} = ${Math.round(faxAdm)} N.</div>`,
        );
      }
    }
    if (kind === 'shaft') {
      const ex = /** @type {import('../lab/seegerDinTables.js').SeegerExternalRow} */ (row);
      parts.push(
        metricHtml(bx('Di\u00e1metro nominal eje d1', 'Nominal shaft diameter d1'), `${ex.d1} mm`, bx('Talla del anillo y del eje de referencia.', 'Ring and reference shaft size.')),
        metricHtml(bx('Espesor s', 'Thickness s'), `${ex.s} mm`, bx('Espesor del anillo.', 'Ring thickness.')),
        metricHtml(bx('Di\u00e1metro fondo ranura d3', 'Groove bottom diameter d3'), `${ex.d3} mm`, bx('Cota de mecanizado de la garganta en el eje (tabla demo).', 'Shaft groove machining dimension (demo table).')),
        metricHtml(bx('Anchura ranura m', 'Groove width m'), `${ex.m} mm`, bx('Anchura axial de la ranura en el eje.', 'Axial groove width on shaft.')),
        metricHtml(bx('Di\u00e1m. exterior libre (aprox.)', 'Free OD (approx.)'), `${ex.dFree} mm`, bx('Anillo sin montar; ver tolerancias de fabricante.', 'Unmounted ring; see manufacturer tolerances.')),
      );
    } else {
      const inn = /** @type {import('../lab/seegerDinTables.js').SeegerInternalRow} */ (row);
      parts.push(
        metricHtml(bx('Di\u00e1metro nominal agujero d1', 'Nominal bore diameter d1'), `${inn.d1} mm`, bx('Talla del anillo y alojamiento de referencia.', 'Ring and reference bore size.')),
        metricHtml(bx('Espesor s', 'Thickness s'), `${inn.s} mm`, bx('Espesor del anillo.', 'Ring thickness.')),
        metricHtml(bx('Di\u00e1metro fondo ranura dG', 'Groove bottom diameter dG'), `${inn.dG} mm`, bx('Garganta en la pared del agujero (tabla demo).', 'Groove in bore wall (demo table).')),
        metricHtml(bx('Anchura ranura m', 'Groove width m'), `${inn.m} mm`, bx('Anchura axial de la ranura.', 'Axial groove width.')),
        metricHtml(bx('Di\u00e1m. exterior libre (aprox.)', 'Free OD (approx.)'), `${inn.odFree} mm`, bx('Anillo expandido; montaje con pinzas.', 'Expanded ring; install with pliers.')),
        metricHtml(bx('Anchura anillo b (aprox.)', 'Ring width b (approx.)'), `${inn.b} mm`, bx('Seg\u00fan tabulaci\u00f3n de referencia.', 'Per reference tabulation.')),
      );
    }
    parts.push(
      `<div class="lab-metric lab-metric--wide"><div class="lab-metric__head"><span class="k">${bx('Pedido en cat\u00e1logo', 'Catalogue order')}</span></div><div class="lab-metric__text">${bx('Solicite', 'Request')} <strong>${esc(
        pedido,
      )}</strong> ${bx(
        'o equivalente comercial (p. ej. ref. Seeger / circlip). Verifique acero',
        'or commercial equivalent (e.g. Seeger / circlip). Check steel',
      )}${inox ? bx(' inoxidable', ' stainless') : ''}, ${bx('bisel y empaque.', 'chamfer and packaging.')} ${bx(
        'Hip\u00f3tesis: no sustituye ensayo de carga axial ni c\u00e1lculo de asentamiento din\u00e1mico.',
        'Assumption: does not replace axial load test or dynamic seating calculation.',
      )}</div></div>`,
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
    moduleLabel: bx('Anillos Seeger DIN', 'Seeger rings DIN'),
    advisorContext: {
      seeger: { kind, dNom: row.d1, norm, orderCode: pedido, inox },
    },
    shoppingLines: [],
    metrics: [
      { label: bx('Pedido', 'Order'), value: pedido },
      { label: 'd1 mm', value: String(row.d1) },
    ],
  });

  updateLabShareVisibility('sgShareLinkWrap', 'sgResults');
  sgUrl.serializeToUrl();
}

const SG_PRESETS = [
  {
    label: 'Eje Ø25 · acero',
    labelKey: 'seeger.preset1',
    values: { sgKind: 'shaft', sgD: 25, sgMaterial: 'carbon', sgFaxWork: '' },
  },
  {
    label: 'Eje Ø40 + Fax',
    labelKey: 'seeger.preset2',
    values: { sgKind: 'shaft', sgD: 40, sgMaterial: 'carbon', sgFaxWork: 2500 },
  },
  {
    label: 'Agujero Ø62',
    labelKey: 'seeger.preset3',
    values: { sgKind: 'bore', sgD: 62, sgMaterial: 'carbon', sgFaxWork: '' },
  },
];

const SG_URL_PARAM_TO_ID = {
  kind: 'sgKind',
  d: 'sgD',
  mat: 'sgMaterial',
  fax: 'sgFaxWork',
};

const sgUrl = createLabUrlSync(SG_URL_PARAM_TO_ID, {
  hydrateOrder: ['kind', 'd', 'mat', 'fax'],
});

const wrap = document.getElementById('sgResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);

const sgPresets = mountLabPresetsBar('sgPresetsBar', SG_PRESETS, debounced);

function scheduleSgRecalc() {
  if (!sgPresets.applying && !sgUrl.hydrating) {
    sgPresets.clearActive();
  }
  debounced();
}

sgUrl.hydrateFromUrl();

document.getElementById('sgSizePreset')?.addEventListener('change', () => {
  const sel = document.getElementById('sgSizePreset');
  const dInput = document.getElementById('sgD');
  if (sel instanceof HTMLSelectElement && dInput instanceof HTMLInputElement && sel.value) {
    dInput.value = sel.value;
  }
  scheduleSgRecalc();
});
document.getElementById('sgD')?.addEventListener('input', scheduleSgRecalc);
document.getElementById('sgD')?.addEventListener('change', () => {
  const dInput = document.getElementById('sgD');
  const preset = document.getElementById('sgSizePreset');
  if (dInput instanceof HTMLInputElement && preset instanceof HTMLSelectElement) {
    const v = String(Math.round(parseFloat(dInput.value || '')));
    preset.value = Array.from(preset.options).some((o) => o.value === v) ? v : '';
  }
  scheduleSgRecalc();
});
document.getElementById('sgKind')?.addEventListener('change', scheduleSgRecalc);
document.getElementById('sgMaterial')?.addEventListener('change', scheduleSgRecalc);
document.getElementById('sgFaxWork')?.addEventListener('input', scheduleSgRecalc);
document.getElementById('sgFaxWork')?.addEventListener('change', scheduleSgRecalc);
wireLabCopyLink('sgCopyLinkBtn', 'sgCopyToast');
wireLabCopyResultsButton('sgCopyResults', {
  moduleTitle: uxCopy('Anillos el\u00e1sticos (Seeger)', 'Seeger retaining rings'),
});
runCalcWithIndustrialFeedback(wrap, refreshCore);
mountLabCloudSaveBar(bx('Anillos el\u00e1sticos (Seeger)', 'Seeger retaining rings'));
watchLangAndApply(SEEGER_PAGE_EN, { onEnApplied: () => scheduleSgRecalc() });
