/** Dynamic copy for calcChainsPage.js (ES default, EN when lab lang is en). */

const ES = {
  dashboardBoot: 'Cadenas \u00b7 laboratorio',
  moduleLabel: 'Cadenas de transmisi\u00f3n',
  heroOmega2: '\u03c9\u2082 \u2014 velocidad angular \u00b7 pi\u00f1\u00f3n 2 (conducido, z\u2082)',
  heroOmega2Hint: 'En el primitivo, proporcional a z\u2081/z\u2082.',
  heroChainSpeed: 'Velocidad de la cadena (primitivo \u00b7 pi\u00f1\u00f3n 1)',
  heroChainSpeedHint: 'Media en el primitivo del pi\u00f1\u00f3n motor (pi\u00f1\u00f3n 1, z\u2081).',
  card1: 'Pi\u00f1\u00f3n 1 \u00b7 Motor',
  card2: 'Pi\u00f1\u00f3n 2 \u00b7 Conducido',
  card3: 'Cadena \u00b7 Tramo',
  kvZ1: 'Dientes (z1)',
  kvZ2: 'Dientes (z2)',
  kvD1: 'Diam. primitivo (D1)',
  kvD2: 'Diam. primitivo (D2)',
  kvN1: 'Velocidad (n1)',
  kvN2: 'Velocidad (n2)',
  kvPitch: 'Paso (p)',
  kvLength: 'Longitud (L)',
  kvLinearV: 'Velocidad lineal (v)',
  lengthUnit: 'pasos',
  refManual: 'Paso manual',
  mChainRef: 'Referencia de cadena',
  mChainRefHint: (norm) => `${norm} Paso de cat\u00e1logo y norma definen carga admisible.`,
  mTeethRatio: 'Relaci\u00f3n de dientes (z\u2082/z\u2081)',
  mTeethRatioHint: (rp) => `En primitivos, D\u2082/D\u2081 = ${rp.toFixed(2)} (ligero desv\u00edo por pol\u00edgono).`,
  mLength: 'Longitud (pasos de cadena)',
  mLengthHint: (up) => `Redondeo pr\u00e1ctico al alza: ${up} pasos.`,
  mCenter: 'Distancia entre ejes',
  mCenterHint: (cp) => `Equivale a \u2248 ${cp.toFixed(2)} pasos de paso p.`,
  mD1: 'D\u2081 \u2014 di\u00e1metro primitivo \u00b7 pi\u00f1\u00f3n 1 (motor, z\u2081)',
  mD1Hint: 'F\u00f3rmula D = p / sin(\u03c0/z) en el pi\u00f1\u00f3n motriz.',
  mD2: 'D\u2082 \u2014 di\u00e1metro primitivo \u00b7 pi\u00f1\u00f3n 2 (conducido, z\u2082)',
  mD2Hint: 'Primitivo del pi\u00f1\u00f3n conducido.',
  mW1: '\u03c9\u2081 \u2014 velocidad angular \u00b7 pi\u00f1\u00f3n 1 (motor)',
  mW1Hint: 'Entrada del formulario en las unidades elegidas.',
  mW2: '\u03c9\u2082 \u2014 velocidad angular \u00b7 pi\u00f1\u00f3n 2 (conducido)',
  mW2Hint: 'Salida cinem\u00e1tica en primitivo.',
  mLinear: 'Velocidad lineal de cadena',
  mLinearHint: 'Tramos rectos; gu\u00eda lubricaci\u00f3n y desgaste.',
  mArtic: 'Frecuencia de articulaci\u00f3n \u00b7 pi\u00f1\u00f3n 1 (motor)',
  mArticHint: '\u2248 z\u2081 \u00d7 \u03c9\u2081/2\u03c0; m\u00e1s Hz suele exigir mejor lubricaci\u00f3n.',
  mLub: 'Lubricaci\u00f3n sugerida',
  mLubHint: (detail) => `${detail} Confirme con ISO 10823 y fabricante.`,
  alertZ1Low:
    'z\u2081 < 17: el efecto poligonal en el pi\u00f1\u00f3n motriz puede ser significativo y generar vibraciones. Se recomienda usar z\u2081 \u2265 17 siempre que sea posible.',
  alertArticHigh: (hz) =>
    `Frecuencia de articulaci\u00f3n alta (${hz.toFixed(2)} Hz): posible riesgo de resonancia. Requiere estudio din\u00e1mico del sistema.`,
  alertNormsSuffix: ' Articulaci\u00f3n y lubricaci\u00f3n son orientativas; confirme con ISO 10823 y fabricante.',
  alertModel:
    'Hip\u00f3tesis del modelo: no verifica la resistencia a tracci\u00f3n de la cadena ni su vida a fatiga; la selecci\u00f3n final debe cerrarse con cat\u00e1logo del fabricante.',
  polyEffect:
    'Efecto poligonal (z < 17 en el pi\u00f1\u00f3n m\u00e1s peque\u00f1o): la cadena se enrolla sobre un pol\u00edgono \u2014 velocidad angular y tensi\u00f3n fluct\u00faan. Se recomienda z \u2265 17\u201319 para marcha m\u00e1s uniforme; valide vibraci\u00f3n y ruido.',
  normsNote:
    'DIN 8187 (ISO 606) paso m\u00e9trico; ANSI B29.1 series inch \u2014 cat\u00e1logo de paso seg\u00fan referencia.',
  subTitle: 'Sustituci\u00f3n \u2014 cinem\u00e1tica en primitivo',
  subD: 'Di\u00e1metros primitivos:',
  subN2: 'Giro \u00b7 pi\u00f1\u00f3n 2 (RPM):',
  subUnits: 'Mismo resultado en sus unidades:',
  subV: 'Velocidad media de cadena:',
  subArtic: 'Articulaciones por segundo \u00b7 pi\u00f1\u00f3n 1:',
  asmTitle: 'Montaje \u00b7 eslabones de uni\u00f3n',
  asmNotes: 'Notas de montaje',
  asmBody: (a) =>
    `Eslab\u00f3n de uni\u00f3n (conector con clip): t\u00edpicamente <strong>${a.connectingLink_count_typical}</strong> unidad. Pasos al alza: <strong>${a.Lp_round_up}</strong> (${a.oddAfterRoundUp ? 'impar' : 'par'}). Alternativa par recomendada: <strong>${a.recommended_even_pitches}</strong> pasos.${a.offsetLink_recommended ? '<br /><strong>Eslab\u00f3n desplazado (\u00bd paso):</strong> valorar si cierra en bucle con longitud impar en pasos.' : ''}`,
  shopNoteManual: 'Paso manual \u00b7 kit orientativo',
  shopPinion: 'Pi\u00f1on cadena a juego',
  shopQ: 'pi\u00f1on cadena rodillos acero',
  valZ1: 'Revise z1: use at least 6 teeth.',
  valZ2: 'Revise z2: use at least 6 teeth.',
  valCenter: 'Revise center distance C: it must be greater than 0.',
  valN1: 'Revise input speed n1: it cannot be negative.',
  valPitch: 'Revise manual pitch p: it must be greater than 0.',
};

const EN = {
  dashboardBoot: 'Chains \u00b7 lab',
  moduleLabel: 'Roller chains',
  heroOmega2: '\u03c9\u2082 \u2014 angular speed \u00b7 sprocket 2 (driven, z\u2082)',
  heroOmega2Hint: 'At pitch; proportional to z\u2081/z\u2082.',
  heroChainSpeed: 'Chain speed (pitch \u00b7 sprocket 1)',
  heroChainSpeedHint: 'Mean at driver sprocket pitch (sprocket 1, z\u2081).',
  card1: 'Sprocket 1 \u00b7 Driver',
  card2: 'Sprocket 2 \u00b7 Driven',
  card3: 'Chain \u00b7 Strand',
  kvZ1: 'Teeth (z1)',
  kvZ2: 'Teeth (z2)',
  kvD1: 'Pitch dia. (D1)',
  kvD2: 'Pitch dia. (D2)',
  kvN1: 'Speed (n1)',
  kvN2: 'Speed (n2)',
  kvPitch: 'Pitch (p)',
  kvLength: 'Length (L)',
  kvLinearV: 'Line speed (v)',
  lengthUnit: 'pitches',
  refManual: 'Manual pitch',
  mChainRef: 'Chain reference',
  mChainRefHint: (norm) => `${norm} Catalogue pitch and standard define allowable load.`,
  mTeethRatio: 'Tooth ratio (z\u2082/z\u2081)',
  mTeethRatioHint: (rp) => `On pitch circles, D\u2082/D\u2081 = ${rp.toFixed(2)} (small polygon deviation).`,
  mLength: 'Length (chain pitches)',
  mLengthHint: (up) => `Practical round-up: ${up} pitches.`,
  mCenter: 'Centre distance',
  mCenterHint: (cp) => `\u2248 ${cp.toFixed(2)} pitch lengths.`,
  mD1: 'D\u2081 \u2014 pitch diameter \u00b7 sprocket 1 (driver, z\u2081)',
  mD1Hint: 'D = p / sin(\u03c0/z) on the driver sprocket.',
  mD2: 'D\u2082 \u2014 pitch diameter \u00b7 sprocket 2 (driven, z\u2082)',
  mD2Hint: 'Driven sprocket pitch diameter.',
  mW1: '\u03c9\u2081 \u2014 angular speed \u00b7 sprocket 1 (driver)',
  mW1Hint: 'Form input in selected units.',
  mW2: '\u03c9\u2082 \u2014 angular speed \u00b7 sprocket 2 (driven)',
  mW2Hint: 'Kinematic output at pitch.',
  mLinear: 'Chain line speed',
  mLinearHint: 'Straight runs; guides lubrication and wear.',
  mArtic: 'Articulation frequency \u00b7 sprocket 1 (driver)',
  mArticHint: '\u2248 z\u2081 \u00d7 \u03c9\u2081/2\u03c0; higher Hz usually needs better lubrication.',
  mLub: 'Suggested lubrication',
  mLubHint: (detail) => `${detail} Confirm with ISO 10823 and manufacturer.`,
  alertZ1Low:
    'z\u2081 < 17: polygonal effect on the driver sprocket can be significant and cause vibration. Use z\u2081 \u2265 17 where possible.',
  alertArticHigh: (hz) =>
    `High articulation frequency (${hz.toFixed(2)} Hz): possible resonance risk. Requires dynamic study of the system.`,
  alertNormsSuffix: ' Articulation and lubrication are indicative; confirm with ISO 10823 and manufacturer.',
  alertModel:
    'Model assumptions: does not verify chain tensile strength or fatigue life; final selection must use the manufacturer catalogue.',
  polyEffect:
    'Polygonal effect (z < 17 on the smaller sprocket): chain wraps a polygon \u2014 angular speed and tension fluctuate. Use z \u2265 17\u201319 for smoother running; check vibration and noise.',
  normsNote:
    'DIN 8187 (ISO 606) metric pitch; ANSI B29.1 inch series \u2014 pitch per catalogue reference.',
  subTitle: 'Substitution \u2014 pitch kinematics',
  subD: 'Pitch diameters:',
  subN2: 'Speed \u00b7 sprocket 2 (RPM):',
  subUnits: 'Same result in your units:',
  subV: 'Mean chain speed:',
  subArtic: 'Articulations per second \u00b7 sprocket 1:',
  asmTitle: 'Assembly \u00b7 connecting links',
  asmNotes: 'Assembly notes',
  asmBody: (a) =>
    `Connecting link (clip type): typically <strong>${a.connectingLink_count_typical}</strong> piece. Round-up pitches: <strong>${a.Lp_round_up}</strong> (${a.oddAfterRoundUp ? 'odd' : 'even'}). Recommended even alternative: <strong>${a.recommended_even_pitches}</strong> pitches.${a.offsetLink_recommended ? '<br /><strong>Offset link (\u00bd pitch):</strong> consider if an odd pitch count closes the loop.' : ''}`,
  shopNoteManual: 'Manual pitch \u00b7 indicative kit',
  shopPinion: 'Matching chain sprocket',
  shopQ: 'roller chain sprocket steel',
  valZ1: 'Check z1: use at least 6 teeth.',
  valZ2: 'Check z2: use at least 6 teeth.',
  valCenter: 'Check centre distance C: must be greater than 0.',
  valN1: 'Check input speed n1: cannot be negative.',
  valPitch: 'Check manual pitch p: must be greater than 0.',
};

const LUB_EN = {
  'Indique n\u2081 para recomendar': {
    label: 'Enter n\u2081 for recommendation',
    detail: '',
  },
  'Lubricaci\u00f3n manual o discontinua': {
    label: 'Manual or intermittent lubrication',
    detail: 'Very low v: spot re-lube; ISO 10823 / DIN 8187 guide type I for low speeds.',
  },
  'Goteo o ba\u00f1o parcial': {
    label: 'Drip or partial bath',
    detail: 'Low\u2013medium speed: light bath or drip per manufacturer.',
  },
  'Ba\u00f1o / salpicadura': {
    label: 'Bath / splash',
    detail: 'Medium v: type II oil bath common in industrial drives.',
  },
  'Circulaci\u00f3n forzada / chorro': {
    label: 'Forced circulation / jet',
    detail: 'High v: type III (pump, cooling) to avoid wear from poor lubrication.',
  },
};

/** @param {'es'|'en'} lang */
export function chainsRuntimeStrings(lang) {
  return lang === 'en' ? EN : ES;
}

/** @param {{ label: string, detail: string, class: string }} lub @param {'es'|'en'} lang */
export function localizeChainLubrication(lub, lang) {
  if (lang !== 'en') return lub;
  const hit = LUB_EN[lub.label];
  return hit ? { class: lub.class, label: hit.label, detail: hit.detail || lub.detail } : lub;
}
