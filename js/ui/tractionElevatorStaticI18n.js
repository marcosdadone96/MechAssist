/**
 * Static ES/EN for traction-elevator.html. Same language key as hub (mdr-home-lang).
 */

import { getCurrentLang, setCurrentLang } from '../config/locales.js';
import { refreshMountingConfigSection } from './mountingConfigSection.js';

export const TRACTION_LANG_EVENT = 'mdr-home-lang-changed';

/** @param {'es'|'en'} lang */
function chipAria(prefix, lang) {
  return `${lang === 'en' ? 'Help:' : 'Ayuda'} ${prefix}.`;
}

/** @type {Record<string, { es: { title: string; aria: string }; en: { title: string; aria: string } }>} */
const CHIPS = {
  q: {
    es: {
      title:
        'Carga \u00fatil nominal en kg. Determina SF y carga total sobre el sistema de tracci\u00f3n.',
      aria: 'carga \u00fatil',
    },
    en: {
      title: 'Rated useful load in kg. Drives safety factor and total load on the traction system.',
      aria: 'useful load',
    },
  },
  mc: {
    es: {
      title: 'Masa propia de cabina sin carga. Junto con Q fija masas en cada rama.',
      aria: 'peso cabina',
    },
    en: {
      title: 'Empty car mass. Together with Q it fixes masses on each rope branch.',
      aria: 'empty car weight',
    },
  },
  h: {
    es: {
      title: 'Recorrido vertical \u00fatil. Entra en energ\u00eda de ciclo y representaci\u00f3n del hueco.',
      aria: 'altura de viaje',
    },
    en: {
      title: 'Useful vertical travel. Affects cycle energy and shaft schematic.',
      aria: 'travel height',
    },
  },
  v: {
    es: {
      title: 'Velocidad lineal cabina. Condiciona rpm de polea y potencia de tracci\u00f3n.',
      aria: 'velocidad nominal',
    },
    en: {
      title: 'Car line speed. Sets sheave rpm and traction power.',
      aria: 'rated speed',
    },
  },
  duty: {
    es: {
      title: 'Define factor de seguridad de selecci\u00f3n demo: carga ~10, personas ~12.',
      aria: 'tipo de servicio',
    },
    en: {
      title: 'Sets demo selection safety factor: freight ~10, passenger ~12.',
      aria: 'duty type',
    },
  },
  reeving: {
    es: {
      title: '1:1 o 2:1. Cambia relaci\u00f3n de movimiento, esfuerzos y rpm en polea.',
      aria: 'arrollamiento',
    },
    en: {
      title: '1:1 or 2:1. Changes motion ratio, forces and sheave rpm.',
      aria: 'reeving',
    },
  },
  kcw: {
    es: {
      title: 'Rango t\u00edpico 0,40\u20130,50 para Mcp\u2248Mc+k\u00b7Q.',
      aria: 'fracci\u00f3n de contrapeso',
    },
    en: {
      title: 'Typical range 0.40\u20130.50 for Mcp\u2248Mc+k\u00b7Q.',
      aria: 'counterweight fraction',
    },
  },
  mcpManual: {
    es: {
      title: 'Use valor manual si ya existe dise\u00f1o de contrapeso; si no, mantenga el \u00f3ptimo autom\u00e1tico.',
      aria: 'masa contrapeso manual',
    },
    en: {
      title: 'Use a manual value if counterweight is already fixed; otherwise keep auto optimal.',
      aria: 'manual counterweight mass',
    },
  },
  d: {
    es: {
      title: 'Di\u00e1metro primitivo de polea (m). Influye en rpm, par y curvatura del cable.',
      aria: 'di\u00e1metro polea tractora',
    },
    en: {
      title: 'Traction sheave pitch diameter (m). Affects rpm, torque and rope bending.',
      aria: 'traction sheave diameter',
    },
  },
  alpha: {
    es: {
      title: '\u00c1ngulo de contacto cable-polea. Mayor \u03b1 mejora l\u00edmite e^(\u03bc\u03b1).',
      aria: '\u00e1ngulo de abrazamiento',
    },
    en: {
      title: 'Rope wrap angle on sheave. Larger \u03b1 improves e^(\u03bc\u03b1) limit.',
      aria: 'wrap angle',
    },
  },
  mu: {
    es: {
      title: 'Coeficiente efectivo de tracci\u00f3n. Orientativo 0,08\u20130,15 seg\u00fan canal/estado.',
      aria: 'coeficiente de fricci\u00f3n cable canal',
    },
    en: {
      title: 'Effective traction coefficient. Typical 0.08\u20130.15 depending on groove condition.',
      aria: 'rope-groove friction coefficient',
    },
  },
  maxN: {
    es: {
      title: 'Tope de dise\u00f1o para selecci\u00f3n demo de cables. Si se supera, revise di\u00e1metro/cargas.',
      aria: 'm\u00e1ximo de cables',
    },
    en: {
      title: 'Design cap for demo rope selection. If exceeded, review diameter/loads.',
      aria: 'maximum rope strands',
    },
  },
  vBrand: {
    es: {
      title: 'Fabricante del cat\u00e1logo demo para comprobaci\u00f3n r\u00e1pida.',
      aria: 'marca comprobador',
    },
    en: {
      title: 'Demo catalog make for quick verification.',
      aria: 'verifier brand',
    },
  },
  vSearch: {
    es: {
      title: 'B\u00fasqueda por c\u00f3digo o texto para acotar modelos disponibles.',
      aria: 'filtro de modelo',
    },
    en: {
      title: 'Text/code search to narrow available models.',
      aria: 'model filter',
    },
  },
  vModel: {
    es: {
      title: 'Se compara contra potencia, par y rpm de polea calculados.',
      aria: 'modelo cat\u00e1logo',
    },
    en: {
      title: 'Compared to calculated motor power, torque and sheave rpm.',
      aria: 'catalog model',
    },
  },
};

/** @param {'es'|'en'} lang */
function applyChips(lang) {
  const en = lang === 'en';
  document.querySelectorAll('[data-te-chip]').forEach((el) => {
    const k = el.getAttribute('data-te-chip');
    if (!k || !CHIPS[k]) return;
    const t = CHIPS[k][en ? 'en' : 'es'];
    el.setAttribute('title', t.title);
    el.setAttribute('aria-label', chipAria(t.aria, lang));
  });
}

/** @param {'es'|'en'} lang */
function applyNav(lang) {
  const en = lang === 'en';
  const map = {
    'index.html': en ? 'Home' : 'Inicio',
    'flat-conveyor.html': en ? 'Flat belt' : 'Cinta plana',
    'inclined-conveyor.html': en ? 'Inclined belt' : 'Cinta inclinada',
    'bucket-elevator.html': en ? 'Bucket elevator' : 'Elevador cangilones',
    'traction-elevator.html': en ? 'Traction elevator' : 'Ascensor tracci\u00f3n',
    'screw-conveyor.html': en ? 'Screw conveyor' : 'Tornillo',
    'centrifugal-pump.html': en ? 'Pump' : 'Bomba',
    'transmission-lab.html': en ? 'Laboratory' : 'Laboratorio',
    'transmission-canvas.html': en ? 'Pro canvas' : 'Lienzo Pro',
  };
  document.querySelectorAll('.app-header__nav-start a[href], .app-header__nav-end a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (map[href]) a.textContent = map[href];
  });
  const canvas = document.querySelector('.app-header__nav-end a[href="transmission-canvas.html"]');
  if (canvas) {
    canvas.setAttribute('title', en ? 'Multi-shaft technical canvas (Pro)' : 'Lienzo t\u00e9cnico multieje (Pro)');
  }
  const nav = document.querySelector('header nav[aria-label]');
  if (nav) nav.setAttribute('aria-label', en ? 'Main navigation' : 'Navegaci\u00f3n principal');
}

/** @type {Record<string, { es: string; en: string }>} */
const LBL = {
  accLoads: { es: 'Cargas y recorrido', en: 'Loads and travel' },
  accCw: { es: 'Contrapeso', en: 'Counterweight' },
  accSheave: { es: 'Polea y adherencia (Euler-Eytelwein)', en: 'Sheave and traction (Euler\u2013Eytelwein)' },
  lblQ: { es: 'Carga \u00fatil', en: 'Payload' },
  lblMc: { es: 'Masa cabina', en: 'Cabin mass' },
  lblH: { es: 'Altura de viaje', en: 'Travel height' },
  lblV: { es: 'Velocidad nominal', en: 'Rated speed' },
  lblDuty: { es: 'Tipo de servicio', en: 'Service type' },
  lblReeving: { es: 'Relaci\u00f3n de eslingado', en: 'Roping ratio' },
  lblKcw: { es: 'Fracci\u00f3n de Q en contrapeso \u00f3ptimo', en: 'Q fraction in optimal counterweight' },
  lblCwManual: { es: 'Fijar contrapeso manualmente (kg)', en: 'Fix counterweight manually (kg)' },
  lblMcpManual: { es: 'Contrapeso sugerido (editable)', en: 'Suggested counterweight (editable)' },
  lblD: { es: '\u00d8 primitivo polea tractora', en: 'Traction sheave pitch \u00d8' },
  lblAlpha: { es: '\u00c1ngulo de abrazamiento', en: 'Wrap angle' },
  lblMu: { es: 'Coef. fricci\u00f3n cable\u2013canal \u03bc', en: 'Rope\u2013groove friction \u03bc' },
  lblMaxN: { es: 'M\u00e1x. cables / tiras', en: 'Max. ropes / strands' },
  lblVBrand: { es: 'Marca', en: 'Brand' },
  lblVSearch: { es: 'Filtrar modelo (texto)', en: 'Filter model (text)' },
  lblVModel: { es: 'Modelo del cat\u00e1logo ejemplo', en: 'Sample catalog model' },
};

/** @param {'es'|'en'} lang */
function applyLabels(lang) {
  const t = lang === 'en' ? 'en' : 'es';
  document.querySelectorAll('[data-te-for]').forEach((el) => {
    const k = el.getAttribute('data-te-for');
    if (k && LBL[k]) el.textContent = LBL[k][t];
  });
}

/** @param {'es'|'en'} lang */
function applySelectsAndHints(lang) {
  const en = lang === 'en';
  const duty = document.getElementById('teDuty');
  if (duty) {
    const o = /** @type {HTMLSelectElement} */ (duty).options;
    if (o[0]) o[0].textContent = en ? 'Freight / load (SF \u2248 10)' : 'Montacargas / carga (SF \u2248 10)';
    if (o[1]) o[1].textContent = en ? 'Passenger (SF \u2248 12)' : 'Personas (SF \u2248 12)';
  }
  const hintKcw = document.getElementById('teHintKcw');
  if (hintKcw) {
    hintKcw.textContent = en
      ? 'typ. 0.40\u20130.50 \u2192 Mcp \u2248 Mc + k\u00b7Q'
      : 't\u00edp. 0,40\u20130,50 \u2192 Mcp \u2248 Mc + k\u00b7Q';
  }
  const hintMu = document.getElementById('teHintMu');
  if (hintMu) hintMu.textContent = en ? 'indicative' : 'orientativo';
  const hintMaxN = document.getElementById('teHintMaxn');
  if (hintMaxN) hintMaxN.textContent = en ? 'design limit' : 'l\u00edmite dise\u00f1o';
  const ph = document.getElementById('teVerifySearch');
  if (ph instanceof HTMLInputElement) ph.placeholder = '';
}

/** @param {'es'|'en'} lang */
function applyBlocks(lang) {
  const en = lang === 'en';
  const mainH2 = document.querySelector('.app-main > .panel > h2');
  if (mainH2) {
    mainH2.innerHTML = en
      ? '<span class="panel-icon">\u21c5</span> Traction elevator (freight / passenger)'
      : '<span class="panel-icon">\u21c5</span> Ascensor de tracci\u00f3n (montacargas / personas)';
  }
  const lead = document.querySelector('.app-main > .panel > .form-lead');
  if (lead) {
    lead.innerHTML = en
      ? 'Indicative <strong>ropes and counterweight</strong> model: tension ratio vs <strong>Euler\u2013Eytelwein</strong>, counterweight mass (car + 40\u201350% useful load), <strong>diameter and rope count</strong> with safety factor (\u224810 freight / 12 passenger), and <strong>braking torque</strong> at the sheave. The <strong>shaft schematic</strong> is on the right, like flat belt and bucket elevator tools. Does not replace EN 81 or a full installation study.'
      : 'Modelo orientativo de <strong>cables y contrapeso</strong>: relaci\u00f3n de tensiones vs <strong>Euler-Eytelwein</strong>, masa de contrapeso (cabina + 40\u201350% carga \u00fatil), elecci\u00f3n de <strong>\u00d8 y n\u00famero de cables</strong> con factor de seguridad (10 carga / 12 personas), y <strong>par de frenado</strong> en polea. El <strong>esquema del hueco</strong> est\u00e1 a la derecha, como en cinta plana y elevador de cangilones. No sustituye EN 81 ni memoria de instalaci\u00f3n.';
  }
  const helpSum = document.querySelector('.help-details.flat-help > summary');
  if (helpSum) helpSum.textContent = en ? 'Quick guide to each quantity' : 'Gu\u00eda r\u00e1pida de cada magnitud';
  const helpBody = document.querySelector('.help-details.flat-help .help-details__body');
  if (helpBody) {
    helpBody.innerHTML = en
      ? `<p class="help-details__lead muted">
      Every label has a <span class="info-chip info-chip--static" aria-hidden="true">?</span>: on desktop hover; on touch, tap to read help.
    </p><ul>
      <li><strong>Q and Mc:</strong> set mass imbalance, indicative power and sheave torque.</li>
      <li><strong>Optimal counterweight:</strong> starting point Mc + 45%\u00b7Q, then tune to project duty.</li>
      <li><strong>Euler (T1/T2):</strong> checks groove traction against e^(\u03bc\u00b7\u03b1) limit.</li>
      <li><strong>Ropes and SF:</strong> indicative rope pick by breaking load and minimum safety factor.</li>
    </ul>`
      : `<p class="help-details__lead muted">
      Junto a cada etiqueta hay un <span class="info-chip info-chip--static" aria-hidden="true">?</span>: en escritorio use hover; en m\u00f3vil, pulse para abrir la ayuda.
    </p><ul>
      <li><strong>Q y Mc:</strong> fijan desequilibrio de masas, potencia y par en la polea tractora.</li>
      <li><strong>Contrapeso \u00f3ptimo:</strong> referencia inicial Mc + 45%\u00b7Q; luego ajuste seg\u00fan servicio real.</li>
      <li><strong>Euler (T1/T2):</strong> valida adherencia en canal con el l\u00edmite e^(\u03bc\u00b7\u03b1).</li>
      <li><strong>Cables y SF:</strong> selecci\u00f3n orientativa por carga de rotura y factor m\u00ednimo seg\u00fan normativa.</li>
    </ul>`;
  }
  const btn = document.getElementById('btnTeCalc');
  if (btn) btn.textContent = en ? 'View suggested gearmotors' : 'Ver motorreductores sugeridos';
  const calcHint = document.querySelector('.app-main > .panel .flat-calc-hint');
  if (calcHint) {
    calcHint.innerHTML = en
      ? 'Results and the diagram <strong>update when inputs change</strong>. This button expands the gearmotor block.'
      : 'Los resultados y el diagrama se <strong>actualizan al cambiar los datos</strong>. Este bot\u00f3n despliega el bloque de motorreductores.';
  }
  const resH2 = document.querySelector('.layout-right > .panel:first-child h2');
  if (resH2) {
    resH2.innerHTML = en
      ? '<span class="panel-icon">\u2211</span> Results and verdicts'
      : '<span class="panel-icon">\u2211</span> Resultados y veredictos';
  }
  const diagH2 = document.querySelector('.be-diag-panel h2');
  if (diagH2) {
    diagH2.innerHTML = en
      ? '<span class="panel-icon">\u25c7</span> Shaft \u00b7 side view'
      : '<span class="panel-icon">\u25c7</span> Hueco \u00b7 vista lateral';
  }
  const diagLead = document.querySelector('.te-diag-lead');
  if (diagLead) {
    diagLead.innerHTML = en
      ? 'Traction sheave, car, counterweight, guides and <strong>1:1</strong> or <strong>2:1</strong> reeving. Vertical scale follows travel height <em>H</em>.'
      : 'Polea tractora, cabina, contrapeso, gu\u00edas y arrollamiento <strong>1:1</strong> o <strong>2:1</strong>. La escala vertical sigue la altura de viaje <em>H</em>.';
  }
  const svg = document.getElementById('teDiagram');
  if (svg) {
    svg.setAttribute('aria-label', en ? 'Traction elevator diagram' : 'Diagrama ascensor tracci\u00f3n');
  }
  const fig = document.querySelector('.be-diag-panel img');
  if (fig) {
    fig.setAttribute('alt', en ? 'Traction elevator in a building (reference)' : 'Ascensor de tracci\u00f3n real en edificio');
  }
  const cap = document.querySelector('.be-diag-panel figcaption');
  if (cap) {
    cap.innerHTML = en
      ? 'Real-world traction elevator reference. <a href="https://commons.wikimedia.org/wiki/File:Elevator_machine_room.jpg" target="_blank" rel="noopener">Wikimedia Commons</a>.'
      : 'Referencia real de ascensor de tracci\u00f3n. <a href="https://commons.wikimedia.org/wiki/File:Elevator_machine_room.jpg" target="_blank" rel="noopener">Wikimedia Commons</a>.';
  }
  const vh2 = document.querySelector('#teVerifyPanel h2');
  if (vh2) {
    vh2.innerHTML = en
      ? '<span class="panel-icon">\u2713</span> Check a gearmotor I already have'
      : '<span class="panel-icon">\u2713</span> Comprobar un motorreductor que ya tengo';
  }
  const vlead = document.querySelector('.te-verify-lead');
  if (vlead) {
    vlead.textContent = en
      ? 'Compare motor power, output torque and rpm with the calculated traction sheave duty above.'
      : 'Compare potencia de motor, par de salida y rpm con el punto de polea tractora calculado arriba.';
  }
  const vrun = document.querySelector('#teVerifyPanel [data-verify-run]');
  if (vrun) vrun.textContent = en ? 'Check for this elevator' : 'Comprobar para este ascensor';
  const motTitle = document.querySelector('#section-te-motores .motors-details__title');
  const motHint = document.querySelector('#section-te-motores .motors-details__hint');
  if (motTitle) {
    motTitle.textContent = en
      ? 'Gearmotors (sample catalog \u00b7 SEW, Siemens, Nord\u2026)'
      : 'Motorreductores (cat\u00e1logo ejemplo \u00b7 SEW, Siemens, Nord\u2026)';
  }
  if (motHint) {
    motHint.textContent = en
      ? 'Collapsed by default \u2014 open for brand cards and verifier'
      : 'Plegado por defecto \u2014 pulse para ver tarjetas por marca y comprobador';
  }
  const eng = document.querySelector('#teEngineeringReport')?.closest('.motors-details');
  if (eng) {
    const title = eng.querySelector('.motors-details__title');
    const hint = eng.querySelector('.motors-details__hint');
    if (title) title.textContent = en ? 'Engineering breakdown' : 'Desglose de ingenier\u00eda';
    if (hint) {
      hint.textContent = en
        ? 'Collapsed by default \u2014 ratio, strategies and model steps'
        : 'Plegado por defecto \u2014 relaci\u00f3n, estrategias y pasos del modelo';
    }
  }
  const hypTitle = document.querySelector('#traction-assumptions .motors-details__title');
  const hypHint = document.querySelector('#traction-assumptions .motors-details__hint');
  if (hypTitle) hypTitle.textContent = en ? 'Model assumptions' : 'Hip\u00f3tesis del modelo';
  if (hypHint) {
    hypHint.textContent = en
      ? 'Indicative limits (not a certified lift calculation)'
      : 'Supuestos y l\u00edmites del c\u00e1lculo orientativo';
  }
  const pdfH2 = document.querySelector('#premiumPdfExportMount')?.closest('section.panel')?.querySelector('h2');
  if (pdfH2) pdfH2.innerHTML = en ? '<span class="panel-icon">PDF</span> Export report' : '<span class="panel-icon">PDF</span> Exportar informe';
}

/** @param {'es'|'en'} lang */
export function applyTractionElevatorStaticI18n(lang = getCurrentLang()) {
  const en = lang === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
  document.title = en ? 'Traction elevator \u2014 MechAssist' : 'Ascensor de tracci\u00f3n \u2014 MechAssist';

  const fpw = document.getElementById('fileProtoWarn');
  if (fpw) {
    fpw.textContent = en
      ? 'Tip: open via a local server (in the project folder: npx --yes serve . and use the URL shown, e.g. http://localhost:3000). Opening the HTML directly may block JavaScript and hide results/diagrams.'
      : 'Recomendaci\u00f3n: abrir con un servidor local (en la carpeta del proyecto: npx --yes serve . y use la URL que muestre, p. ej. http://localhost:3000). Si abre el HTML con doble clic, el navegador puede bloquear el JavaScript y no ver\u00e1 resultados ni diagramas.';
  }

  applyNav(lang);
  applyLabels(lang);
  applySelectsAndHints(lang);
  applyChips(lang);
  applyBlocks(lang);

  const host = document.getElementById('teLangHost');
  if (host) host.setAttribute('aria-label', en ? 'Language selector' : 'Selector de idioma');
}

function syncTractionLangButtons() {
  const lang = getCurrentLang();
  document.querySelectorAll('#teLangHost [data-lang]').forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    const l = btn.getAttribute('data-lang');
    btn.classList.toggle('hub-lang__btn--active', l === lang);
    btn.setAttribute('aria-pressed', l === lang ? 'true' : 'false');
  });
}

export function applyTractionElevatorPageLanguage() {
  applyTractionElevatorStaticI18n(getCurrentLang());
  refreshMountingConfigSection();
  syncTractionLangButtons();
  window.dispatchEvent(new CustomEvent(TRACTION_LANG_EVENT, { detail: { lang: getCurrentLang() } }));
}

export function initTractionElevatorLangChrome() {
  const host = document.getElementById('teLangHost');
  if (!host) return;
  host.innerHTML = `
    <div class="hub-lang" role="group" aria-label="">
      <button type="button" class="hub-lang__btn" data-lang="es" aria-pressed="false">ES</button>
      <button type="button" class="hub-lang__btn" data-lang="en" aria-pressed="false">EN</button>
    </div>`;
  host.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const l = btn.getAttribute('data-lang');
      if (l !== 'es' && l !== 'en') return;
      setCurrentLang(l);
      applyTractionElevatorPageLanguage();
    });
  });
  applyTractionElevatorPageLanguage();
}
