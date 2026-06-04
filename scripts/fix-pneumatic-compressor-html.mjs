/**
 * Rewrite calc-pneumatic-compressor.html: UTF-8 fallbacks + layout parity with fluid calcs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const FLUIDS_ES = {
  'fluids.presetsLabel': 'Ejemplos t\u00edpicos:',
  'fluids.unitsBarTitle': 'C\u00f3mo ver los resultados',
  'fluids.lblPressure': 'Presi\u00f3n',
  'fluids.optBar': 'bar',
  'fluids.optMpa': 'MPa',
  'fluids.optPsi': 'psi',
  'fluids.lblFlow': 'Caudal',
  'fluids.optLmin': 'L/min',
  'fluids.optM3h': 'm\u00b3/h',
};

function loadEsDict(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const out = {};
  const re = /'([^']+)':\s*("(?:[^"\\]|\\.)*")/g;
  let m;
  while ((m = re.exec(src))) out[m[1]] = JSON.parse(m[2]);
  return out;
}

const DICT = {
  ...loadEsDict(path.join(root, 'js/lab/i18n/pages/pneumaticCompressorEs.js')),
  ...FLUIDS_ES,
};

function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function applyDict(html) {
  for (const [key, val] of Object.entries(DICT)) {
    const k = key.replace('.', '\\.');
    html = html.replace(
      new RegExp(`(<[^>]*data-i18n="${k}"[^>]*data-i18n-html[^>]*>)([\\s\\S]*?)(</(?:p|li)>)`, 'g'),
      `$1${val}$3`,
    );
    html = html.replace(
      new RegExp(`(<[^>]*data-i18n="${k}"[^>]*data-i18n-attr="aria-label"[^>]*aria-label=")([^"]*)(")`, 'g'),
      `$1${escAttr(val)}$3`,
    );
    html = html.replace(
      new RegExp(`(<[^>]*data-i18n="${k}"(?![^>]*data-i18n-html)[^>]*>)([^<]*)(</)`, 'g'),
      `$1${val}$3`,
    );
    html = html.replace(
      new RegExp(`(<option[^>]*data-i18n="${k}"[^>]*>)([^<]*)(</option>)`, 'g'),
      `$1${val}$3`,
    );
    html = html.replace(
      new RegExp(`(data-i18n-attrs="title=${k}"[^>]*title=")([^"]*)(")`, 'g'),
      `$1${escAttr(val)}$3`,
    );
  }
  return html;
}

const htmlPath = path.join(root, 'calc-pneumatic-compressor.html');
const cylPath = path.join(root, 'calc-hydraulic-cylinder.html');

const cyl = fs.readFileSync(cylPath, 'utf8');
const navMatch = cyl.match(/<header class="site-nav site-nav--sticky">[\s\S]*?<\/header>/);
if (!navMatch) throw new Error('nav block not found');

let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/<header class="site-nav site-nav--sticky">[\s\S]*?<\/header>/, navMatch[0]);

const outPanel = `          <div class="lab-calc-layout__out lab-calc-layout__out--panel">
            <div
              class="lab-units-bar"
              role="group"
              data-i18n-attrs="aria-label=fluids.unitsAriaLabel data-lab-convert-title=fluids.convertTitle data-lab-convert-tip=fluids.convertTip"
              aria-label="Unidades de los resultados"
              data-lab-convert-categories="pressure"
              data-lab-convert-title="Conversor (fluidos)"
              data-lab-convert-tip="Presi\u00f3n en bar, MPa o psi; caudal en L/min o m\u00b3/h en los resultados."
            >
              <span class="lab-units-bar__title" data-i18n="fluids.unitsBarTitle">X</span>
              <label class="lab-units-bar__field">
                <span class="lab-units-bar__lbl" data-i18n="fluids.lblPressure">X</span>
                <select id="labUnitPressure" class="lab-units-bar__select">
                  <option value="bar" data-i18n="fluids.optBar">bar</option>
                  <option value="mpa" data-i18n="fluids.optMpa">MPa</option>
                  <option value="psi" data-i18n="fluids.optPsi">psi</option>
                </select>
              </label>
              <label class="lab-units-bar__field">
                <span class="lab-units-bar__lbl" data-i18n="fluids.lblFlow">X</span>
                <select id="labUnitFlow" class="lab-units-bar__select">
                  <option value="Lmin" data-i18n="fluids.optLmin">L/min</option>
                  <option value="m3h" data-i18n="fluids.optM3h">X</option>
                </select>
              </label>
            </div>

            <details class="lab-fluid-formulas" id="compFormulasBlock">
              <summary data-i18n="comp.formulasSummary">X</summary>
              <div id="compFormulaBody" class="lab-fluid-formulas__body"></div>
            </details>
            <div id="compHero" class="lab-results-hero-mount" aria-live="polite"></div>
            <div id="compResults" class="lab-results"></div>
            <div class="lab-results-actions">
              <button type="button" class="lab-btn lab-btn--block" id="compCopyResults" data-i18n="comp.copyResults">X</button>
              <div class="lab-copy-toast" id="compCopyToast" role="status" data-i18n="comp.copyToast">X</div>
            </div>

            <div id="compAdvisor" class="lab-alerts"></div>
            <div id="compDesignAlerts" class="lab-alerts" aria-live="polite"></div>
            <div id="compVerdictSummary" class="pc-verdict-summary" aria-live="polite"></div>
            <p id="compVerdict" class="lab-verdict lab-verdict--ok"></p>
            <div id="labFluidPdfMountComp" class="premium-pdf-mount"></div>
            <div class="lab-results-share lab-results-share--footer" id="compShareLinkWrap" aria-live="polite">
              <button type="button" class="lab-btn lab-btn--text" id="compCopyLinkBtn" data-i18n="comp.copyLink">X</button>
              <span class="lab-copy-toast" id="compCopyLinkToast" role="status" data-i18n="comp.copyToast">X</span>
            </div>
          </div>`;

html = html.replace(
  /<div class="lab-calc-layout__out lab-calc-layout__out--panel">[\s\S]*?<\/div>\s*<\/div>\s*<nav class="lab-next-steps"/,
  `${outPanel}\n        </div>\n        <nav class="lab-next-steps"`,
);

html = html.replace(/id="pcHero"/, 'id="compHero"');
html = html.replace(
  /pneumaticCompressorPage\.js\?v=[^"']+/,
  'pneumaticCompressorPage.js?v=20260519c',
);

html = applyDict(html);

// SVG must not contain text children; aria-label only
html = html.replace(
  /<svg id="compDiagram"[^>]*>[\s\S]*?<\/svg>/,
  `<svg id="compDiagram" xmlns="http://www.w3.org/2000/svg" data-i18n="comp.diagramSvgAria" data-i18n-attr="aria-label" aria-label="${escAttr(DICT['comp.diagramSvgAria'])}"></svg>`,
);

// Labels with nested info-chip: refresh opening text before inner span
for (const key of ['comp.labelPTrabajo', 'comp.labelTCiclo', 'comp.labelDeltaP']) {
  const val = DICT[key];
  if (!val) continue;
  const k = key.replace('.', '\\.');
  html = html.replace(
    new RegExp(`(data-i18n="${k}"[^>]*>)([^<]+)(\\s*<span class="info-chip")`, 'g'),
    `$1${val}$3`,
  );
}

const chipTitles = {
  compQDem:
    'Caudal libre de aire (Nl/min o m\u00b3/h) a condiciones normales ISO (0 \u00b0C, 1 bar). Suma consumo de todos los actuadores con factor de simultaneidad 0,6\u20130,8.',
  compPTrabajo:
    'Presi\u00f3n manom\u00e9trica de trabajo (bar). Incluye ca\u00eddas en red: a\u00f1adir 1\u20131,5 bar sobre presi\u00f3n en punto de consumo.',
  compTCiclo:
    'Tiempo de marcha en un ciclo carga/descarga. El volumen de calder\u00edn se calcula con este m\u00e9todo y la regla Q_Nl/10.',
};
html = html.replace(/title="Caudal libre[^"]*"/, `title="${escAttr(chipTitles.compQDem)}"`);
html = html.replace(/title="Presi[^"]*trabajo[^"]*"/i, `title="${escAttr(chipTitles.compPTrabajo)}"`);
html = html.replace(/title="[^"]*caldeir[^"]*"/i, `title="${escAttr(chipTitles.compTCiclo)}"`);
html = html.replace(
  /aria-label="Ayuda volumen[^"]*"/i,
  `aria-label="${escAttr('Ayuda volumen de calder\u00edn')}"`,
);

const bad = (html.match(/\uFFFD/g) || []).length;
if (bad) console.warn(`Warning: ${bad} U+FFFD characters remain`);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Wrote', htmlPath);
