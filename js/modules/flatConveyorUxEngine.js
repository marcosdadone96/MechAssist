/**
 * Field-level validation decoration and sizing verdict for flat conveyor UX.
 * Non-blocking: never alters computeFlatConveyor inputs beyond UI hints.
 */

import { getFlatProfile } from './flatConveyorUxConfig.js';

/** @typedef {'ok'|'warn'|'bad'} FieldUxState */

/**
 * @param {string} id
 */
function inputTrimmedEmpty(id) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement)) return false;
  return String(el.value).trim() === '';
}

const CORE_INPUT_IDS = [
  'beltLength',
  'rollerD',
  'beltSpeed',
  'loadMass',
  'friction',
  'efficiency',
];

/**
 * @returns {string[]}
 */
export function collectEmptyCoreFieldIds() {
  return CORE_INPUT_IDS.filter((id) => inputTrimmedEmpty(id));
}

/**
 * @param {object} raw � same shape as flat conveyor inputs
 * @param {string} profileId
 * @param {'es'|'en'} lang
 */
export function evaluateFlatConveyorFieldUx(raw, profileId, lang) {
  const prof = getFlatProfile(profileId);
  const en = lang === 'en';

  /** @type {Record<string, FieldUxState>} */
  const states = {};
  /** @type {Array<{ id: string; text: string }>} */
  const warnings = [];

  const inRange = (v, pair) => v >= pair[0] && v <= pair[1];

  const mark = (id, state) => {
    states[id] = state;
  };

  const checkNum = (id, v, pair) => {
    if (!Number.isFinite(v)) {
      mark(id, 'bad');
      return;
    }
    if (!inRange(v, pair)) {
      mark(id, 'bad');
      return;
    }
    mark(id, 'ok');
  };

  checkNum('beltLength', raw.beltLength_m, prof.beltLength_m);
  checkNum('rollerD', raw.rollerDiameter_mm, prof.rollerDiameter_mm);
  checkNum('beltSpeed', raw.beltSpeed_m_s, prof.beltSpeed_m_s);
  checkNum('loadMass', raw.loadMass_kg, prof.loadMass_kg);
  checkNum('friction', raw.frictionCoeff, prof.friction);

  const eta = raw.efficiency_pct;
  if (!Number.isFinite(eta)) mark('efficiency', 'bad');
  else if (eta > 100 || eta < 1) mark('efficiency', 'bad');
  else if (eta > 99 || eta < 45) mark('efficiency', 'warn');
  else mark('efficiency', 'ok');

  const Dm = raw.rollerDiameter_mm / 1000;
  const drumRpm =
    Dm > 0 && raw.beltSpeed_m_s > 0 ? (raw.beltSpeed_m_s / (Math.PI * Dm)) * 60 : 0;

  if (states.beltSpeed === 'ok' && raw.beltSpeed_m_s > prof.beltSpeedWarnAbove_m_s) {
    states.beltSpeed = 'warn';
    warnings.push({
      id: 'beltSpeed',
      text: en
        ? 'Belt speed is aggressive for this application class; confirm product stability, noise, and layout.'
        : 'Velocidad de banda alta para esta clase de aplicaci\u00f3n; confirme estabilidad del producto, ruido y layout.',
    });
  }

  if (
    states.rollerD === 'ok' &&
    Number.isFinite(drumRpm) &&
    drumRpm > prof.drumRpmWarnAbove
  ) {
    states.rollerD = 'warn';
    warnings.push({
      id: 'rollerD',
      text: en
        ? `Drum speed is high (~${drumRpm.toFixed(0)} rpm); check minimum drum diameter with the belt vendor and bearing life.`
        : `Revoluciones de tambor altas (~${drumRpm.toFixed(0)} rpm); revise di\u00e1metro m\u00ednimo de banda y vida de rodamientos.`,
    });
  }

  if (
    profileId === 'light' &&
    states.loadMass === 'ok' &&
    states.rollerD === 'ok' &&
    raw.loadMass_kg < 200 &&
    raw.rollerDiameter_mm > 320
  ) {
    states.rollerD = 'warn';
    warnings.push({
      id: 'rollerD',
      text: en
        ? 'Large drive drum for a very light load: unusual for checkout-style conveyors; verify against your layout.'
        : 'Tambor motriz grande para carga muy ligera: poco habitual en l\u00edneas tipo checkout; confirme con su layout.',
    });
  }

  if (
    profileId === 'heavy' &&
    states.beltSpeed === 'ok' &&
    raw.beltSpeed_m_s > 3.2
  ) {
    states.beltSpeed = 'warn';
    warnings.push({
      id: 'beltSpeed',
      text: en
        ? 'Very high belt speed for heavy bulk handling; validate belt rating, chutes, and safety guards.'
        : 'Velocidad muy alta para manejo pesado; valide capa de banda, tolvas y protecciones.',
    });
  }

  checkNum('beltWidth', raw.beltWidth_m ?? 0.65, [0.1, 3.5]);
  checkNum('beltMass', raw.beltMass_kg ?? 0, [0, 800]);
  checkNum('loadDistribution', raw.loadDistribution ?? 1, [0.05, 1]);
  checkNum('beltCarryFraction', raw.beltCarryFraction ?? 0.5, [0.1, 0.9]);
  checkNum('additionalResistance', raw.additionalResistance_N ?? 0, [0, 25000]);
  checkNum('accelTime', raw.accelTime_s ?? 3, [0.05, 45]);
  checkNum('inertiaFactor', raw.inertiaStartingFactor ?? 1.15, [1, 2]);

  return { states, warnings, drumRpm };
}

/**
 * @param {object} p
 * @param {string[]} p.missingIds
 * @param {boolean} p.calcOk
 * @param {Array<{ level: string; text: string }>} p.designAlerts
 * @param {Array<{ id: string; text: string }>} p.fieldWarnings
 * @param {object} p.raw
 * @param {object} p.result
 * @param {object} [p.r]
 * @param {'es'|'en'} p.lang
 */
export function buildFlatConveyorVerdict(p) {
  const en = p.lang === 'en';
  const result = p.result ?? p.r;
  const { missingIds, calcOk, designAlerts, fieldWarnings, raw } = p;

  const hasErrAlert = designAlerts.some((a) => a.level === 'error');
  const hasWarnFromAlerts = designAlerts.some((a) => a.level === 'warn');

  if (missingIds.length) {
    const labels = missingIds.map((id) => labelForField(id, en));
    return {
      kind: /** @type {const} */ ('incomplete'),
      title: en ? 'Incomplete inputs' : 'Entradas incompletas',
      body: en
        ? `Enter a value for: ${labels.join(', ')}. Other fields use defaults until you fill them.`
        : `Indique valor para: ${labels.join(', ')}. El resto usa valores por defecto hasta que los rellene.`,
    };
  }

  if (!calcOk || hasErrAlert) {
    return {
      kind: /** @type {const} */ ('out'),
      title: en ? 'Out of range' : 'Fuera de rango',
      body: en
        ? 'Fix efficiency (1\u201399%), service factor, or invalid geometry before relying on these numbers.'
        : 'Corrija rendimiento (1\u201399 %), factor de servicio o geometr\u00eda no v\u00e1lida antes de usar los resultados.',
    };
  }

  if (fieldWarnings.length || hasWarnFromAlerts) {
    return {
      kind: /** @type {const} */ ('check'),
      title: en ? 'Review parameters' : 'Revise par\u00e1metros',
      body: en
        ? 'Technically computable, but some values are aggressive or atypical; read the warnings below before freezing the design.'
        : 'El c\u00e1lculo es v\u00e1lido, pero hay avisos; revise advertencias antes de cerrar el dise\u00f1o.',
    };
  }

  const vOk =
    raw.beltSpeed_m_s >= 0.05 &&
    raw.beltSpeed_m_s <= 4.8 &&
    result.drumRpm < 500;
  const geomOk = raw.rollerDiameter_mm >= 80 && raw.beltLength_m >= 1;

  if (!vOk) {
    return {
      kind: /** @type {const} */ ('check'),
      title: en ? 'Check speed range' : 'Revise rango de velocidad',
      body: en
        ? 'Verify belt line speed and drum rpm against manufacturer limits and site constraints.'
        : 'Compruebe velocidad lineal y rpm de tambor frente a l\u00edmites del fabricante de banda y de planta.',
    };
  }

  if (!geomOk) {
    return {
      kind: /** @type {const} */ ('check'),
      title: en ? 'Check geometry' : 'Revise geometr\u00eda',
      body: en
        ? 'Drum diameter or loaded length look marginal; confirm against layout and belt minimum diameter tables.'
        : 'Di\u00e1metro de tambor o longitud de tramo parecen marginales; confirme con planos y tablas de fabricante.',
    };
  }

  return {
    kind: /** @type {const} */ ('ok'),
    title: en ? 'Design OK (indicative)' : 'Dise\u00f1o coherente (orientativo)',
    body: en
      ? 'Inputs sit in a realistic envelope for the selected application class. Still validate with vendor data and site measurements.'
      : 'Los datos encajan en un envolvente realista. Valide siempre con fabricante y mediciones en planta.',
  };
}

/**
 * @param {string} id
 * @param {boolean} en
 */
function labelForField(id, en) {
  const map = en
    ? {
        beltLength: 'loaded run L',
        rollerD: 'drive drum D',
        beltSpeed: 'belt speed v',
        loadMass: 'load mass m',
        friction: 'friction \u03bc',
        efficiency: 'efficiency \u03b7',
      }
    : {
        beltLength: 'tramo L',
        rollerD: 'tambor motriz D',
        beltSpeed: 'velocidad v',
        loadMass: 'masa m',
        friction: 'rozamiento \u03bc',
        efficiency: 'rendimiento \u03b7',
      };
  return map[id] || id;
}

/**
 * @param {string[]} ids
 * @param {'es'|'en'} lang
 */
export function missingFieldsHumanList(ids, lang) {
  const en = lang === 'en';
  return ids.map((id) => labelForField(id, en)).join(', ');
}
