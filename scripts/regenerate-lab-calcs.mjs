/**
 * Regenera calc-beam, calc-power-screw y calc-weld-joint:
 * - UTF-8 limpio (sin U+FFFD)
 * - Sin info-chip (solo lab-field-help + botùn ? compacto)
 * - Textos y sùmbolos corregidos
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const gears = fs.readFileSync(path.join(root, 'calc-gears.html'), 'utf8');
const nav = gears.slice(gears.indexOf('<header class="site-nav'), gears.indexOf('</header>') + 9);

const footer = (pageJs) => `    <script>
      globalThis.__SUPABASE_URL__ = 'https://ytdtsqxhqfuzzcblidiy.supabase.co';
      globalThis.__SUPABASE_ANON_KEY__ = 'sb_publishable_HQqMGXjb5zO1Jp_Hn9eXmA_NA0Htl41';
    </script>
    <script type="module" src="js/ui/homeI18n.js"></script>
    <script type="module" src="js/ui/hubFreemium.js"></script>
    <script type="module" src="js/ui/${pageJs}"></script>
    <script type="module" src="js/ui/labDonationFooter.js"></script>`;

function page(headLines, main, pageJs) {
  return `<!DOCTYPE html>
<html lang="es">
  <head>
${headLines}
  </head>
  <body class="lab-body">
    ${nav}
    <main class="lab-main">
${main}
    </main>
${footer(pageJs)}
  </body>
</html>
`;
}

const headCommon = `    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />`;

function cleanMain(file, fixes = []) {
  let m = fs.readFileSync(path.join(root, file), 'utf8').split('<main class="lab-main">')[1].split('</main>')[0];
  m = m.replace(/\uFFFD/g, '');
  m = m.replace(/<span class="info-chip"[^>]*>[\s\S]*?<\/span>/gi, '');
  for (const [a, b] of fixes) {
    if (a instanceof RegExp) m = m.replace(a, b);
    else m = m.split(a).join(b);
  }
  return m;
}

const globalFixes = [
  [/segn/g, 'seg\u00fan'],
  [/lmites/g, 'l\u00edmites'],
  [/LMITES/g, 'L\u00cdMITES'],
  [/Metodologa/g, 'Metodolog\u00eda'],
  [/didctico/g, 'did\u00e1ctico'],
  [/ngulo/g, '\u00e1ngulo'],
  [/penetracin/g, 'penetraci\u00f3n'],
  [/unin /g, 'uni\u00f3n '],
  [/unin</g, 'uni\u00f3n<'],
  [/ms /g, 'm\u00e1s '],
  [/mnimo/g, 'm\u00ednimo'],
  [/comprobacin/g, 'comprobaci\u00f3n'],
  [/nmero/g, 'n\u00famero'],
  [/npero/g, 'n\u00famero'],
  [/Nmero/g, 'N\u00famero'],
  [/Dimetro/g, 'Di\u00e1metro'],
  [/dimetro/g, 'di\u00e1metro'],
  [/Presin/g, 'Presi\u00f3n'],
  [/presin/g, 'presi\u00f3n'],
  [/friccin/g, 'fricci\u00f3n'],
  [/Coeficiente de friccin \?\?\?/g, 'Coeficiente de fricci\u00f3n \u03bc'],
  [/Coeficiente de friccin /g, 'Coeficiente de fricci\u00f3n \u03bc'],
  [/\? personalizado/g, '\u03bc personalizado'],
  [/\? \(personalizado\)/g, '\u03bc (personalizado)'],
  [/\? orientativo/g, '\u03bc orientativo'],
  [/rendimiento \?/g, 'rendimiento \u03b7'],
  [/friccin \?/g, 'fricci\u00f3n \u03bc'],
  [/vehculos/g, 'veh\u00edculos'],
  [/aplicacin/g, 'aplicaci\u00f3n'],
  [/tpica/g, 't\u00edpica'],
  [/tpicos/g, 't\u00edpicos'],
  [/torsin/g, 'torsi\u00f3n'],
  [/designacin/g, 'designaci\u00f3n'],
  [/Designacin/g, 'Designaci\u00f3n'],
  [/catlogo/g, 'cat\u00e1logo'],
  [/elevacin/g, 'elevaci\u00f3n'],
  [/clculo/g, 'c\u00e1lculo'],
  [/diseo/g, 'dise\u00f1o'],
  [/mecnicos/g, 'mec\u00e1nicos'],
  [/clsico/g, 'cl\u00e1sico'],
  [/til /g, '\u00fatil '],
  [/verificacin/g, 'verificaci\u00f3n'],
  [/Limit/g, 'L\u00edmite'],
  [/n\?p/g, 'n\u00b7p'],
  [/L = n.p/g, 'L = n\u00b7p'],
  [/L = np/g, 'L = n\u00b7p'],
  [/d  d /g, 'd\u2082 \u2248 d \u2212 '],
  [/d\? d/g, 'd\u2082 \u2248 d'],
  [/0,5.p/g, '0,5\u00b7p'],
  [/0,5p/g, '0,5\u00b7p'],
  [/Tr 30\./g, 'Tr 30\u00b0'],
  [/Tr (\d+)./g, 'Tr $1\u00d7'],
  [/tan\(\?/g, 'tan(\u03bb'],
  [/\? &lt; \?\?/g, '\u03bb &lt; \u03c6\u2032'],
  [/\? &lt; \?\)/g, '\u03bb &lt; \u03c6\u2032)'],
  [/\? = arctan/g, '\u03bb = arctan'],
  [/\(L\/\(\?/g, '(L/(\u03c0\u00b7'],
  [/a \? 0/g, 'a \u2248 0'],
  [/l \? 2h/g, 'l \u2212 2h'],
  [/\? = M/g, '\u03c3 = M'],
  [/\? = 1/g, '\u03c4 = 1'],
  [/\?<sub>r<\/sub>/g, '\u03c4<sub>r</sub>'],
  [/\?<sub>eq<\/sub>/g, '\u03c3<sub>eq</sub>'],
  [/\? y \?/g, '\u03c4 y \u03c3'],
  [/\? y/g, '\u03c4 y'],
  [/\? admisibles/g, '\u03c4 y \u03c3 admisibles'],
  [/Enlace copiado!!+/g, '\u00a1Enlace copiado!'],
  [/Eje  torsi/g, 'Eje \u00b7 torsi'],
  [/Rodamientos  L10/g, 'Rodamientos \u00b7 L10'],
];

// --- Power screw ---
const pscrewHead = `${headCommon}
    <title data-i18n="pscrew.docTitle">Tornillo de potencia trapezoidal ISO 2904 \u2014 TheMechAssist</title>
    <meta name="description" data-i18n="pscrew.metaDesc" data-i18n-attr="content" content="Par de avance, rendimiento y autobloqueo en husillo trapezoidal ISO 2904 (Tr). Predimensionado orientativo." />
    <link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any" />
    <link rel="icon" href="favicon-32x32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180" />
    <link rel="canonical" href="https://www.themechassist.com/calc-power-screw.html" id="mdr-canonical" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.themechassist.com/calc-power-screw.html" />
    <meta property="og:title" data-i18n="pscrew.docTitle" data-i18n-attr="content" content="Tornillo de potencia trapezoidal ISO 2904 \u2014 TheMechAssist" />
    <meta property="og:description" data-i18n="pscrew.metaDesc" data-i18n-attr="content" content="Par de avance, rendimiento y autobloqueo en husillo trapezoidal ISO 2904 (Tr)." />
    <meta property="og:image" content="https://www.themechassist.com/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" data-i18n="pscrew.docTitle" data-i18n-attr="content" content="Tornillo de potencia trapezoidal ISO 2904 \u2014 TheMechAssist" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/lab.css" />
    <script defer src="js/legal/cookiesAndAnalyticsBoot.js"></script>`;

let pscrewMain = cleanMain('calc-power-screw.html', [
  ...globalFixes,
  [/Tornillo de potencia  trapezoidal/g, 'Tornillo de potencia \u00b7 trapezoidal'],
  [/Paso p \(mm\) /g, 'Paso p (mm)'],
  [/Di.metro nominal d \(mm\)/g, 'Di\u00e1metro nominal d (mm)'],
  [/N.mero de entradas n/g, 'N\u00famero de entradas n'],
  [/T = F.\(/g, 'T = F\u00b7('],
  [/\).tan/g, ')\u00b7tan'],
  [/tan\(\u03bb  \u03c6\u2032\)/g, 'tan(\u03bb \u00b1 \u03c6\u2032)'],
]);

fs.writeFileSync(path.join(root, 'calc-power-screw.html'), page(pscrewHead, pscrewMain, 'calcPowerScrewPage.js'), 'utf8');

// --- Beam ---
const beamHead = `${headCommon}
    <title data-i18n="beam.docTitle">Vigas \u00b7 flexi\u00f3n y flecha \u2014 TheMechAssist</title>
    <meta name="description" data-i18n="beam.metaDesc" data-i18n-attr="content" content="Flecha, momento y tensi\u00f3n en vigas est\u00e1ticas. Secciones rectangular, circular, I y T." />
    <link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any" />
    <link rel="canonical" href="https://www.themechassist.com/calc-beam.html" id="mdr-canonical" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.themechassist.com/calc-beam.html" />
    <meta property="og:title" data-i18n="beam.docTitle" data-i18n-attr="content" content="Vigas \u00b7 flexi\u00f3n y flecha \u2014 TheMechAssist" />
    <meta property="og:image" content="https://www.themechassist.com/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/lab.css" />
    <script defer src="js/legal/cookiesAndAnalyticsBoot.js"></script>`;

let beamMain = cleanMain('calc-beam.html', [
  ...globalFixes,
  [/Vigas  flexin/g, 'Vigas \u00b7 flexi\u00f3n'],
  [/mxima \?/g, 'm\u00e1xima \u03b4'],
  [/normal \?/g, 'normal \u03c3'],
  [/esttica/g, 'est\u00e1tica'],
  [/esquemtica  se/g, 'esquem\u00e1tica \u00b7 se'],
  [/flecha <strong>\?<\/strong>/g, 'flecha <strong>\u03b4</strong>'],
  [/Longitud L \(m\) /g, 'Longitud L (m)'],
  [/\? admisible/g, '\u03c3 admisible'],
  [/Cmo /g, 'C\u00f3mo '],
  [/Transmisin/g, 'Transmisi\u00f3n'],
  [/mquina/g, 'm\u00e1quina'],
  [/accionada \?/g, 'accionada \u2192'],
  [/Rectangular b  h/g, 'Rectangular b \u00d7 h'],
  [/tambin/g, 'tambi\u00e9n'],
  [/value="N\/mmù2"/g, 'value="Nmm2"'],
  [/data-i18n="beam.optN\/mmù2"/g, 'data-i18n="beam.optNmm2"'],
]);

// Ayuda sigma (sin info-chip)
beamMain = beamMain.replace(
  `<input inputmode="decimal" id="beamSigAdm" type="number" step="any" min="0" value="160" placeholder="0 = omitir" />
              </div>`,
  `<input inputmode="decimal" id="beamSigAdm" type="number" step="any" min="0" value="160" placeholder="0 = omitir" />
                <p class="lab-field-help" data-i18n="beam.helpSigAdmHtml" data-i18n-html>
                  Tensi\u00f3n normal m\u00e1xima admisible orientativa. <strong>0</strong> omite la comprobaci\u00f3n de uso.
                </p>
              </div>`,
);

const beamHelpInserts = [
  ['beamWidth', 'beam.helpWidthHtml', 'Anchura <strong>b</strong> de la secci\u00f3n rectangular (mm).'],
  ['beamHeight', 'beam.helpHeightHtml', 'Altura <strong>h</strong> de la secci\u00f3n rectangular (mm).'],
  ['beamDiam', 'beam.helpDiamHtml', 'Di\u00e1metro de la secci\u00f3n circular maciza (mm).'],
  ['beamLoadPos', 'beam.helpLoadPosHtml', 'Distancia <strong>a</strong> desde el apoyo izquierdo hasta la carga (m).'],
  ['beamE', 'beam.helpMaterialHtml', 'M\u00f3dulo el\u00e1stico <strong>E</strong> del material. Elija <em>personalizado</em> para otro valor.'],
];

for (const [id, key, text] of beamHelpInserts) {
  if (beamMain.includes(key)) continue;
  const re = new RegExp(`(<input[^>]*id="${id}"[^>]*\\/>)\\s*\\n\\s*</div>`, 'm');
  beamMain = beamMain.replace(
    re,
    `$1
                <p class="lab-field-help" data-i18n="${key}" data-i18n-html>${text}</p>
              </div>`,
  );
}

if (!beamMain.includes('open>')) {
  beamMain = beamMain.replace(
    '<details class="lab-results-details lab-results-details--chevron-end lab-results-details--stacked">',
    '<details class="lab-results-details lab-results-details--chevron-end lab-results-details--stacked" open>',
  );
}

fs.writeFileSync(path.join(root, 'calc-beam.html'), page(beamHead, beamMain, 'calcBeamPage.js'), 'utf8');

// --- Weld ---
const weldHead = `${headCommon}
    <title data-i18n="weld.docTitle">Uniones soldadas filete y a tope \u2014 TheMechAssist</title>
    <meta name="description" data-i18n="weld.metaDesc" data-i18n-attr="content" content="Comprobaci\u00f3n orientativa de cordones de filete y soldaduras a tope. Modelo educativo EN 1993-1-8." />
    <link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any" />
    <link rel="canonical" href="https://www.themechassist.com/calc-weld-joint.html" id="mdr-canonical" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.themechassist.com/calc-weld-joint.html" />
    <meta property="og:title" data-i18n="weld.docTitle" data-i18n-attr="content" content="Uniones soldadas filete y a tope \u2014 TheMechAssist" />
    <meta property="og:image" content="https://www.themechassist.com/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/lab.css" />
    <script defer src="js/legal/cookiesAndAnalyticsBoot.js"></script>`;

let weldMain = cleanMain('calc-weld-joint.html', [
  ...globalFixes,
  [/Uniones soldadas  filete/g, 'Uniones soldadas \u00b7 filete'],
  [/Tipo de junta /g, 'Tipo de junta'],
  [/Electrodo /g, 'Electrodo'],
  [/ELECTRODOS ORIENTATIVOS \(LMITES/g, 'ELECTRODOS ORIENTATIVOS (L\u00cdMITES'],
]);

if (!weldMain.includes('weld.helpJointTypeHtml')) {
  weldMain = weldMain.replace(
    /(<select id="weldJointType">[\s\S]*?<\/select>)\s*<\/div>\s*<div class="lab-field">\s*<label for="weldElectrode"/m,
    `$1
                <p class="lab-field-help" data-i18n="weld.helpJointTypeHtml" data-i18n-html>
                  <strong>T</strong>: placa vertical sobre base. <strong>Solape</strong>: chapas superpuestas. <strong>Esquina</strong> o <strong>a tope</strong> seg\u00fan geometr\u00eda.
                </p>
              </div>
              <div class="lab-field">
                <label for="weldElectrode"`,
  );
}
if (!weldMain.includes('weld.helpElectrodeHtml')) {
  weldMain = weldMain.replace(
    /(<select id="weldElectrode">[\s\S]*?<\/select>)\s*<\/div>\s*<div class="lab-field" data-weld-fillet/m,
    `$1
                <p class="lab-field-help" data-i18n="weld.helpElectrodeHtml" data-i18n-html>
                  Categor\u00eda <strong>E35/E42/E50</strong> con l\u00edmites orientativos de <strong>\u03c4</strong> y <strong>\u03c3</strong>.
                </p>
              </div>
              <div class="lab-field" data-weld-fillet`,
  );
}

weldMain = weldMain.replace(
  `<input inputmode="decimal" id="weldForce" type="number" step="any" min="0" value="25000" />
              </div>`,
  `<input inputmode="decimal" id="weldForce" type="number" step="any" min="0" value="25000" />
                <p class="lab-field-help" data-i18n="weld.helpForceHtml" data-i18n-html>
                  Fuerza <strong>F</strong> perpendicular o axial sobre la junta (N).
                </p>
              </div>`,
);

weldMain = weldMain.replace(
  `placeholder="0 = omitir" />
              </div>
              <div class="lab-field" id="weldMomentArmRow"`,
  `placeholder="0 = omitir" />
                <p class="lab-field-help" data-i18n="weld.helpMomentHtml" data-i18n-html>
                  Momento flector <strong>M</strong> (N\u00b7m). <strong>0</strong> si no aplica.
                </p>
              </div>
              <div class="lab-field" id="weldMomentArmRow"`,
);

fs.writeFileSync(path.join(root, 'calc-weld-joint.html'), page(weldHead, weldMain, 'calcWeldJointPage.js'), 'utf8');

for (const f of ['calc-power-screw.html', 'calc-beam.html', 'calc-weld-joint.html']) {
  const s = fs.readFileSync(path.join(root, f), 'utf8');
  const chips = (s.match(/info-chip/g) || []).length;
  console.log(f, 'FFFD:', (s.match(/\uFFFD/g) || []).length, 'info-chip:', chips);
}
