import { computeWormGear, suggestWormDesignFromRatio } from '../lab/wormGear.js';
import { renderWormGearDiagram } from '../lab/diagramWormGear.js';
import {
  bindLabUnitSelectors,
  formatLength,
  formatRotation,
  formatTorque,
  getLabUnitPrefs,
} from '../lab/labUnitPrefs.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import { mountCompactLabFieldHelp, refreshCompactLabFieldHelp } from './labHelpCompact.js';
import {
  bindInputValidation,
  debounce,
  executiveSummaryAlert,
  labAlert,
  metricHtml,
  mountLabPresetsBar,
  revalidateAllBoundInputs,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  runLabCalcBoot,
  syncInputValidationResultsGate,
  updateLabShareVisibility,
  uxCopy,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { getLabLang, LAB_LANG_EVENT } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { WORM_GEAR_PAGE_EN } from '../lab/i18n/pages/wormGearPageEn.js';

const WORM_PRESETS = [
  {
    label: 'Reductor lento 1:40',
    labelKey: 'worm.preset1',
    values: {
      wgCalcMode: 'diagnostic',
      wgMx: 3,
      wgNw: 1,
      wgZ2: 40,
      wgMat: 'steel_c45',
      wgN1: 1450,
      wgPower: 1.5,
      wgFriction: 0.05,
      wgTargetI: 40,
    },
  },
  {
    label: 'Servomotor 2 entradas',
    labelKey: 'worm.preset2',
    values: {
      wgCalcMode: 'diagnostic',
      wgMx: 2,
      wgNw: 2,
      wgZ2: 40,
      wgMat: 'steel_16mncr5',
      wgN1: 3000,
      wgPower: 0.75,
      wgFriction: 0.04,
      wgTargetI: 20,
    },
  },
  {
    label: 'Carga elevada 1:10',
    labelKey: 'worm.preset3',
    values: {
      wgCalcMode: 'diagnostic',
      wgMx: 4,
      wgNw: 1,
      wgZ2: 10,
      wgMat: 'bronze_al',
      wgN1: 720,
      wgPower: 3,
      wgFriction: 0.06,
      wgTargetI: 10,
    },
  },
];

const WORM_ES = {
  'worm.cardWorm': 'Tornillo (sin fin)',
  'worm.cardWheel': 'Corona',
  'worm.badgeSelfLock': 'Autoblocante \u26a0\ufe0f',
  'worm.badgeNotLock': 'No autoblocante',
  'worm.mRatio': 'Relaci\u00f3n de reducci\u00f3n i',
  'worm.mRatioHint': 'i = z\u2082/nw',
  'worm.mGamma': '\u00c1ngulo de avance \u03b3',
  'worm.mEta': 'Eficiencia directa \u03b7',
  'worm.mSelfLock': '\u00bfAutoblocante?',
  'worm.mCenter': 'Distancia entre ejes a',
  'worm.mD1': 'Di\u00e1metro primitivo tornillo d\u2081',
  'worm.mD2': 'Di\u00e1metro primitivo corona d\u2082',
  'worm.mT2': 'Par de salida T\u2082',
  'worm.mN2': 'Velocidad de salida n\u2082',
  'worm.mQ': 'Coeficiente de di\u00e1metro q',
  'worm.mPhi': '\u00c1ngulo de fricci\u00f3n \u03c6\u2032',
  'worm.mEtaInv': 'Eficiencia inversa \u03b7\u208b',
  'worm.alertSelfLock': 'Autoblocante: no se puede accionar desde la salida con este \u03b3 y \u03bc (orientativo).',
  'worm.alertLowEta': 'Eficiencia baja \u2014 revise calentamiento y material del tornillo.',
  'worm.alertOk': 'Par coherente para comprobaci\u00f3n orientativa; confirme con fabricante.',
  'worm.moduleLabel': 'Tornillo sin fin y corona',
};

function wormT(key) {
  const full = key.startsWith('worm.') ? key : `worm.${key}`;
  const en = getLabLang() === 'en';
  if (en && WORM_GEAR_PAGE_EN[full]) return WORM_GEAR_PAGE_EN[full];
  if (WORM_ES[full]) return WORM_ES[full];
  if (WORM_GEAR_PAGE_EN[full]) return WORM_GEAR_PAGE_EN[full];
  return full;
}

function read(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function elementCardHtml(title, rows) {
  const body = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  return `<article class="lab-element-card"><h4 class="lab-element-card__title">${esc(title)}</h4><dl class="lab-element-card__kv">${body}</dl></article>`;
}

function syncWormCalcModeUi() {
  const design = document.getElementById('wgCalcMode')?.value === 'design';
  const help = document.getElementById('wgCalcModeHelp');
  const targetField = document.getElementById('wgTargetField');
  if (targetField instanceof HTMLElement) targetField.hidden = !design;
  if (help instanceof HTMLElement) {
    help.querySelectorAll('[data-worm-mode]').forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      el.classList.toggle('worm-calc-mode-help__line--active', el.getAttribute('data-worm-mode') === (design ? 'design' : 'diagnostic'));
    });
  }
}

function applyDesignSuggestion(targetI) {
  const sug = suggestWormDesignFromRatio(targetI);
  const nwEl = document.getElementById('wgNw');
  const z2El = document.getElementById('wgZ2');
  const mxEl = document.getElementById('wgMx');
  if (nwEl instanceof HTMLSelectElement) nwEl.value = String(sug.nw);
  if (z2El instanceof HTMLInputElement) z2El.value = String(sug.z2);
  if (mxEl instanceof HTMLInputElement) mxEl.value = String(sug.mx_mm);
}

function refreshCore() {
  const u = getLabUnitPrefs();
  const mx = read('wgMx', 3);
  const nw = read('wgNw', 1);
  const z2 = read('wgZ2', 40);

  const r = computeWormGear({
    mx_mm: mx,
    nw,
    z2,
    friction: read('wgFriction', 0.05),
    n1_rpm: read('wgN1', 1450),
    power_kw: read('wgPower', 1.5),
  });

  const gammaEl = document.getElementById('wgGammaOut');
  if (gammaEl instanceof HTMLInputElement) {
    gammaEl.value = r.gammaDeg.toFixed(2);
  }

  renderWormGearDiagram(document.getElementById('wgDiagram'), r);

  if (syncInputValidationResultsGate(document.getElementById('wgResults'))) return;

  const hasCritical = r.selfLocking && r.etaDirectPct < 30;
  const hasWarn = r.selfLocking || r.etaDirectPct < 50;

  const heroEl = document.getElementById('wgHero');
  if (heroEl) {
    const gv = hasCritical ? 'error' : hasWarn ? 'warn' : 'ok';
    heroEl.innerHTML = renderResultHero(
      [
        {
          label: wormT('mRatio'),
          value: r.i.toFixed(2),
          hint: wormT('mRatioHint'),
        },
        {
          label: wormT('mGamma'),
          value: r.gammaDeg.toFixed(2),
          unit: '\u00b0',
        },
        {
          label: wormT('mEta'),
          value: r.etaDirectPct.toFixed(1),
          unit: '%',
        },
      ],
      { verdict: gv },
    );
  }

  const elementBox = document.getElementById('wgElementResults');
  if (elementBox) {
    elementBox.innerHTML = [
      elementCardHtml(wormT('cardWorm'), [
        ['nw', String(r.nw)],
        [wormT('mD1'), formatLength(r.d1_mm, u.length)],
        [wormT('mGamma'), `${r.gammaDeg.toFixed(2)}\u00b0`],
        ['n\u2081', formatRotation(read('wgN1', 0), u.rotation)],
      ]),
      elementCardHtml(wormT('cardWheel'), [
        ['z\u2082', String(r.z2)],
        [wormT('mD2'), formatLength(r.d2_mm, u.length)],
        [wormT('mN2'), r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '\u2014'],
        [wormT('mT2'), r.T2_Nm != null ? formatTorque(r.T2_Nm, u.torque) : '\u2014'],
      ]),
    ].join('');
  }

  const lockBadge = r.selfLocking
    ? `<span class="lab-badge lab-badge--beta">${wormT('badgeSelfLock')}</span>`
    : `<span class="lab-badge lab-badge--free">${wormT('badgeNotLock')}</span>`;

  const box = document.getElementById('wgResults');
  if (box) {
    box.innerHTML = [
      metricHtml(wormT('mRatio'), r.i.toFixed(4), wormT('mRatioHint')),
      metricHtml(wormT('mGamma'), `${r.gammaDeg.toFixed(2)}\u00b0`, `q = ${r.q}`),
      metricHtml(wormT('mEta'), `${r.etaDirectPct.toFixed(1)} %`, wormT('mPhi') + ` ${r.phiDeg.toFixed(2)}\u00b0`),
      metricHtml(wormT('mSelfLock'), lockBadge, r.selfLocking ? wormT('alertSelfLock') : ''),
      metricHtml(wormT('mCenter'), formatLength(r.a_mm, u.length), 'a = (d\u2081+d\u2082)/2'),
      metricHtml(wormT('mD1'), formatLength(r.d1_mm, u.length), 'd\u2081 = q\u00b7m\u2093'),
      metricHtml(wormT('mD2'), formatLength(r.d2_mm, u.length), 'd\u2082 = m\u2093\u00b7z\u2082'),
      metricHtml(
        wormT('mT2'),
        r.T2_Nm != null ? formatTorque(r.T2_Nm, u.torque) : '\u2014',
        r.T1_Nm != null ? `T\u2081 ${formatTorque(r.T1_Nm, u.torque)}` : '',
      ),
      metricHtml(wormT('mN2'), r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '\u2014', 'n\u2082 = n\u2081/i'),
      ...(r.etaInverse != null
        ? [metricHtml(wormT('mEtaInv'), `${(r.etaInverse * 100).toFixed(1)} %`, '')]
        : []),
    ].join('');
  }

  const alerts = document.getElementById('wgAlerts');
  if (alerts) {
    const parts = [];
    parts.push(
      executiveSummaryAlert({
        level: hasCritical ? 'danger' : hasWarn ? 'warn' : 'ok',
        titleEs: hasCritical
          ? 'Revise autobloqueo y eficiencia antes de liberar.'
          : hasWarn
            ? 'Dise\u00f1o usable con revisiones.'
            : 'Par tornillo\u2013corona coherente para iterar.',
        titleEn: hasCritical
          ? 'Review self-locking and efficiency before release.'
          : hasWarn
            ? 'Workable design with recommended checks.'
            : 'Worm pair baseline is consistent for iteration.',
        actionsEs: r.selfLocking
          ? ['No espere accionamiento reversible desde la corona.', 'Valore mayor \u03b3 (m\u00e1s entradas o menor q).']
          : ['Confirme \u03bc con lubricaci\u00f3n real.', 'Valide calentamiento en servicio.'],
        actionsEn: r.selfLocking
          ? ['Do not expect reversible drive from the wheel.', 'Consider higher \u03b3 (more starts or lower q).']
          : ['Confirm \u03bc with real lubrication.', 'Validate heating in service.'],
      }),
    );
    if (r.selfLocking) parts.push(labAlert('warn', esc(wormT('alertSelfLock'))));
    if (r.etaDirectPct < 50) parts.push(labAlert('warn', esc(wormT('alertLowEta'))));
    else parts.push(labAlert('ok', esc(wormT('alertOk'))));
    alerts.innerHTML = parts.join('');
  }

  updateLabShareVisibility('wgShareLinkWrap', 'wgResults');
}

const resultsWrap = document.getElementById('wgResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(resultsWrap, refreshCore), 55);

const wormPresets = mountLabPresetsBar('wgPresetsBar', WORM_PRESETS, debounced);

function scheduleRecalc() {
  if (!wormPresets.applying) wormPresets.clearActive();
  debounced();
}

injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();
bindInputValidation([
  { id: 'wgMx', min: 0.5, max: 50, label: 'mx' },
  { id: 'wgZ2', min: 20, max: 500, label: 'z2' },
  { id: 'wgN1', min: 0, max: 30000, label: 'n1' },
  { id: 'wgPower', min: 0.01, max: 1e4, label: 'P' },
  { id: 'wgFriction', min: 0.01, max: 0.2, label: 'mu' },
  { id: 'wgTargetI', min: 5, max: 200, label: 'i' },
]);

syncWormCalcModeUi();
bindLabUnitSelectors(scheduleRecalc);

[
  'wgCalcMode',
  'wgMx',
  'wgNw',
  'wgZ2',
  'wgMat',
  'wgN1',
  'wgPower',
  'wgFriction',
  'wgTargetI',
].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleRecalc);
  document.getElementById(id)?.addEventListener('change', scheduleRecalc);
});

document.getElementById('wgCalcMode')?.addEventListener('change', () => {
  syncWormCalcModeUi();
  if (document.getElementById('wgCalcMode')?.value === 'design') {
    applyDesignSuggestion(read('wgTargetI', 40));
  }
  scheduleRecalc();
});

document.getElementById('wgTargetI')?.addEventListener('change', () => {
  if (document.getElementById('wgCalcMode')?.value === 'design') {
    applyDesignSuggestion(read('wgTargetI', 40));
  }
});

watchLangAndApply(WORM_GEAR_PAGE_EN, {
  reloadOnEs: false,
  onEnApplied: () => {
    refreshCompactLabFieldHelp();
    syncWormCalcModeUi();
    scheduleRecalc();
  },
  onEsRestored: () => {
    refreshCompactLabFieldHelp();
    syncWormCalcModeUi();
    scheduleRecalc();
  },
});

wireLabCopyLink('wgCopyLinkBtn', 'wgCopyToast');
wireLabCopyResultsButton('wgCopyResults', {
  moduleTitle: wormT('moduleLabel'),
});

window.addEventListener(LAB_LANG_EVENT, () => {
  syncWormCalcModeUi();
  scheduleRecalc();
});

revalidateAllBoundInputs();
runLabCalcBoot(resultsWrap, refreshCore);
