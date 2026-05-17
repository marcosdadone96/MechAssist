/**
 * English copy for ISO 286 fit recommendation rows (by id).
 * @param {string} id
 * @param {'label'|'category'|'comment'|'examples'} field
 */
const EN = {
  'rodamiento-deslizante': {
    label: 'Sliding bearing fit',
    category: 'Clearance',
    comment: 'Rotating shaft in sliding bearing, precise running fit.',
    examples: 'Shaft in sliding bush with fine guidance.',
  },
  'intercambiable-minimo-juego': {
    label: 'Interchangeable parts, no noticeable play',
    category: 'Minimum clearance',
    comment: 'Positioning without noticeable clearance.',
    examples: 'Demountable assemblies with precise centring.',
  },
  'engranajes-poleas-bujes': {
    label: 'Gears, pulleys and hubs (occasional removal)',
    category: 'Transition',
    comment: 'Classic transition fit for hubs on shafts.',
    examples: 'Pulleys and gears with keys.',
  },
  'acoplamientos-cubos-chaveta': {
    label: 'Couplings/hubs transmitting torque with key',
    category: 'Transition-interference',
    comment: 'Tends toward light interference.',
    examples: 'Drive coupling hubs.',
  },
  'casquillos-anillos-apriete': {
    label: 'Bronze bushes and rings (light press)',
    category: 'Light interference',
    comment: 'Assembly with light press or mild thermal fit.',
    examples: 'Retention bushes in housings.',
  },
  'alojamiento-rodamiento-fijo': {
    label: 'Fixed housing bearing outer ring',
    category: 'Medium interference',
    comment: 'Outer rings of bearings in fixed housings.',
    examples: 'In this demo approximated with H7/p6 due to reduced extract.',
  },
  'precision-h6k5': {
    label: 'Precision bearings on shaft (IT5)',
    category: 'Fine transition',
    comment: 'Fine fit with IT5 quality.',
    examples: 'Precision assemblies.',
  },
  'bridas-js7h6': {
    label: 'Centring flanges and gearbox covers',
    category: 'Transition',
    comment: 'Symmetric centring about zero line.',
    examples: 'Gearbox cover plates.',
  },
};

/**
 * @param {import('../../iso286FitRecommendations.js').IsoFitRecommendation} r
 * @param {'es'|'en'} lang
 */
export function localizedIsoFitRec(r, lang) {
  const en = lang === 'en' ? EN[r.id] : null;
  return {
    label: en?.label ?? r.label,
    category: en?.category ?? r.category,
    comment: en?.comment ?? r.comment,
    examples: en?.examples ?? r.examples,
  };
}

/** @param {'es'|'en'} lang */
export function isoRecTableNoteSuffix(lang) {
  return lang === 'en' ? 'Suggested Ø' : 'Ø sugerido';
}
