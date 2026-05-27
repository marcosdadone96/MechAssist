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

// Reuse structure from existing file (IDs intact); main text uses unicode in template
const pscrewMain = fs.readFileSync(path.join(root, 'calc-power-screw.html'), 'utf8')
  .split('<main class="lab-main">')[1]
  .split('</main>')[0]
  .replace(/\uFFFD/g, '')
  .replace(/Tornillo de potencia  trapezoidal/g, 'Tornillo de potencia \u00b7 trapezoidal')
  .replace(/rendimiento ,/g, 'rendimiento \u03b7,')
  .replace(/fricci\u00f3n \?/g, 'fricci\u00f3n \u03bc')
  .replace(/Coeficiente de friccin /g, 'Coeficiente de fricci\u00f3n \u03bc')
  .replace(/\? personalizado/g, '\u03bc personalizado')
  .replace(/\? \(personalizado\)/g, '\u03bc (personalizado)')
  .replace(/\? orientativo/g, '\u03bc orientativo')
  .replace(/rendimiento \? y/g, 'rendimiento \u03b7 y')
  .replace(/\(\? &lt; \?\?\)/g, '(\u03bb &lt; \u03c6\u2032)')
  .replace(/nmero/g, 'n\u00famero')
  .replace(/Nm/g, 'n\u00b7p')
  .replace(/L = np/g, 'L = n\u00b7p')
  .replace(/d  d /g, 'd\u2082 \u2248 d \u2212 ')
  .replace(/0,5p/g, '0,5\u00b7p')
  .replace(/Tr 30/g, 'Tr 30\u00b0')
  .replace(/Tr 8/g, 'Tr 8\u00d7')
  .replace(/Tr 10/g, 'Tr 10\u00d7')
  .replace(/Tr 12/g, 'Tr 12\u00d7')
  .replace(/Tr 16/g, 'Tr 16\u00d7')
  .replace(/Tr 20/g, 'Tr 20\u00d7')
  .replace(/Tr 24/g, 'Tr 24\u00d7')
  .replace(/Tr 32/g, 'Tr 32\u00d7')
  .replace(/Tr 40/g, 'Tr 40\u00d7')
  .replace(/Tr 50/g, 'Tr 50\u00d7')
  .replace(/Designacin/g, 'Designaci\u00f3n')
  .replace(/Dimetro/g, 'Di\u00e1metro')
  .replace(/d 16/g, 'd = 16')
  .replace(/elevacin/g, 'elevaci\u00f3n')
  .replace(/presin/g, 'presi\u00f3n')
  .replace(/comprobacin/g, 'comprobaci\u00f3n')
  .replace(/Limit/g, 'L\u00edmite')
  .replace(/vehculos/g, 'veh\u00edculos')
  .replace(/Elevacin/g, 'Elevaci\u00f3n')
  .replace(/Enlace copiado/g, '\u00a1Enlace copiado!')
  .replace(/torsin/g, 'torsi\u00f3n')
  .replace(/aplicacin/g, 'aplicaci\u00f3n')
  .replace(/tpica/g, 't\u00edpica')
  .replace(/tcnicos/g, 't\u00edpicos')
  .replace(/Metodologa/g, 'Metodolog\u00eda')
  .replace(/lmites/g, 'l\u00edmites')
  .replace(/clculo/g, 'c\u00e1lculo')
  .replace(/ngulo/g, '\u00e1ngulo')
  .replace(/T = F/g, 'T = F\u00b7')
  .replace(/\)tan/g, ')\u00b7tan')
  .replace(/\? \?\?/g, '\u03bb \u00b1 \u03c6\u2032')
  .replace(/\? = arctan/g, '\u03bb = arctan')
  .replace(/\(L\/\(\?/g, '(L/(\u03c0\u00b7')
  .replace(/tornillotuerca/g, 'tornillo\u2013tuerca')
  .replace(/diseo/g, 'dise\u00f1o')
  .replace(/mecnicos/g, 'mec\u00e1nicos')
  .replace(/segn/g, 'seg\u00fan');

fs.writeFileSync(path.join(root, 'calc-power-screw.html'), page(pscrewHead, pscrewMain, 'calcPowerScrewPage.js'), 'utf8');

// Weld + beam: same approach
function repairMain(file, extra) {
  let m = fs.readFileSync(path.join(root, file), 'utf8').split('<main class="lab-main">')[1].split('</main>')[0];
  m = m.replace(/\uFFFD/g, '');
  for (const [a, b] of extra) m = m.replace(a, b);
  return m;
}

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

const weldMain = repairMain('calc-weld-joint.html', [
  [/Uniones soldadas  filete/g, 'Uniones soldadas \u00b7 filete'],
  [/diseo/g, 'dise\u00f1o'],
  [/Comprobacin/g, 'Comprobaci\u00f3n'],
  [/Vigas  flexin/g, 'Vigas \u00b7 flexi\u00f3n'],
  [/cordn/g, 'cord\u00f3n'],
  [/cordones/g, 'cordones'],
  [/Nmero/g, 'N\u00famero'],
  [/Enlace copiado/g, '\u00a1Enlace copiado!'],
]);

fs.writeFileSync(path.join(root, 'calc-weld-joint.html'), page(weldHead, weldMain, 'calcWeldJointPage.js'), 'utf8');

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

const beamMain = repairMain('calc-beam.html', [
  [/Vigas  flexin/g, 'Vigas \u00b7 flexi\u00f3n'],
  [/mxima/g, 'm\u00e1xima'],
  [/tensin/g, 'tensi\u00f3n'],
  [/esttica/g, 'est\u00e1tica'],
  [/Empotradaempotrada/g, 'Empotrada\u2013empotrada'],
  [/posicin/g, 'posici\u00f3n'],
  [/Mdulo/g, 'M\u00f3dulo'],
  [/elstico/g, 'el\u00e1stico'],
  [/\? admisible/g, '\u03c3 admisible'],
  [/Nmm/g, 'N/mm\u00b2'],
  [/Enlace copiado/g, '\u00a1Enlace copiado!'],
]);

fs.writeFileSync(path.join(root, 'calc-beam.html'), page(beamHead, beamMain, 'calcBeamPage.js'), 'utf8');

for (const f of ['calc-power-screw.html', 'calc-weld-joint.html', 'calc-beam.html']) {
  const s = fs.readFileSync(path.join(root, f), 'utf8');
  console.log(f, 'replacement chars:', (s.match(/\uFFFD/g) || []).length);
}
