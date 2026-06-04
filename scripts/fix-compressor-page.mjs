import fs from 'fs';

const htmlPath = 'calc-pneumatic-compressor.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(
  /\.pc-more-details > summary::before \{\s*content: '[^']*';/,
  ".pc-more-details > summary::before {\n        content: '\\25B8';",
);
html = html.replace(
  /\.pc-more-details\[open\] > summary::before \{\s*content: '[^']*';/,
  ".pc-more-details[open] > summary::before {\n        content: '\\25BE';",
);
html = html.replace(
  /<span data-i18n="comp\.hintDeltaPAuto">[\s\S]*?<p class="lab-field-help" data-i18n="comp\.helpDeltaP">/,
  '<span data-i18n="comp.hintDeltaPAuto">Autom\u00e1tico: p_red \u2212 p_trabajo</span>\n                </label>\n                <p class="lab-field-help" data-i18n="comp.helpDeltaP">',
);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('HTML markup fixed');
