/**
 * One-off: add data-i18n alongside data-sc-for / data-te-for; patch sidebar blocks.
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

const SC_KEYS = [
  'lblCap', 'lblCapUnit', 'lblDiam', 'lblDiamUnit', 'lblPitch', 'lblPitchUnit',
  'lblLength', 'lblAngle', 'lblRho', 'lblTrough', 'lblAbrasive', 'lblCorrosive',
  'lblMu', 'lblBearingEta', 'lblLoadDuty', 'lblSf', 'lblVBrand', 'lblVSearch', 'lblVModel',
  'accGeom', 'accMat', 'accFriction',
];

const TE_KEYS = [
  'lblQ', 'lblMc', 'lblH', 'lblV', 'lblDuty', 'lblReeving', 'lblKcw', 'lblCwManual',
  'lblMcpManual', 'lblD', 'lblAlpha', 'lblMu', 'lblMaxN', 'lblVBrand', 'lblVSearch', 'lblVModel',
  'accLoads', 'accCw', 'accSheave',
];

function patchScTeFor(file, prefix, keys) {
  let html = fs.readFileSync(file, 'utf8');
  const ns = prefix === 'sc' ? 'scConv' : 'teConv';
  for (const k of keys) {
    const re = new RegExp(`(data-${prefix}-for="${k}")(?![^>]*data-i18n)`, 'g');
    html = html.replace(re, `$1 data-i18n="${ns}.${k}"`);
  }
  fs.writeFileSync(file, html, 'utf8');
}

function patchScrewSidebar(file) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(
    /(<h2 class="flat-sidebar__title">)(Tornillo helicoidal)(<\/h2>)/,
    '$1<span data-i18n="scConv.h2">$2</span>$3',
  );
  html = html.replace(
    /(<p class="calc-seo-intro">)/,
    '$1'.replace('$1', '<p class="calc-seo-intro" data-i18n="scConv.calcSeoIntro">'),
  );
  if (!html.includes('data-i18n="scConv.calcSeoIntro"')) {
    html = html.replace('<p class="calc-seo-intro">', '<p class="calc-seo-intro" data-i18n="scConv.calcSeoIntro">');
  }
  if (!html.includes('data-i18n="scConv.heroLead"')) {
    html = html.replace('<p class="flat-sidebar__lead">', '<p class="flat-sidebar__lead" data-i18n="scConv.heroLead">');
  }
  html = html.replace(
    /<summary>Gu�a r�pida de cada magnitud<\/summary>/,
    '<summary data-i18n="scConv.helpSummary">Gu�a r�pida de cada magnitud</summary>',
  );
  if (!html.includes('scConv.helpBodyHtml')) {
    html = html.replace(
      '<div class="help-details__body">',
      '<div class="help-details__body" data-i18n="scConv.helpBodyHtml" data-i18n-html>',
    );
  }
  fs.writeFileSync(file, html, 'utf8');
}

function patchTractionSidebar(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-i18n="teConv.h2"')) {
    html = html.replace(
      /(<h2 class="flat-sidebar__title">)([^<]+)(<\/h2>)/,
      '$1<span data-i18n="teConv.h2">$2</span>$3',
    );
  }
  fs.writeFileSync(file, html, 'utf8');
}

function patchInclined(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-i18n="incConv.h2"')) {
    html = html.replace(
      /(<h2 class="flat-sidebar__title">)(Cinta inclinada)(<\/h2>)/,
      '$1<span data-i18n="incConv.h2">$2</span>$3',
    );
  }
  if (!html.includes('data-i18n="incConv.calcSeoIntro"')) {
    html = html.replace('<p class="calc-seo-intro">', '<p class="calc-seo-intro" data-i18n="incConv.calcSeoIntro">');
  }
  if (!html.includes('data-i18n="incConv.heroLead"')) {
    html = html.replace('<p class="flat-sidebar__lead">', '<p class="flat-sidebar__lead" data-i18n="incConv.heroLead">');
  }
  html = html.replace(
    /<summary>Gu�a r�pida de cada magnitud<\/summary>/,
    '<summary data-i18n="incConv.helpSummary">Gu�a r�pida de cada magnitud</summary>',
  );
  const acc = [
    ['Norma y factor de servicio', 'incConv.accNormSf'],
    ['Geometr�a y cinem�tica', 'incConv.accGeom'],
    ['Carga', 'incConv.accLoad'],
    ['Rozamiento y rendimiento', 'incConv.accFriction'],
  ];
  for (const [label, key] of acc) {
    html = html.replace(
      new RegExp(`<span class="flat-accordion__label">${label}</span>`),
      `<span class="flat-accordion__label" data-i18n="${key}">${label}</span>`,
    );
  }
  fs.writeFileSync(file, html, 'utf8');
}

patchScTeFor(path.join(root, 'screw-conveyor.html'), 'sc', SC_KEYS);
patchScTeFor(path.join(root, 'traction-elevator.html'), 'te', TE_KEYS);
patchScrewSidebar(path.join(root, 'screw-conveyor.html'));
patchTractionSidebar(path.join(root, 'traction-elevator.html'));
patchInclined(path.join(root, 'inclined-conveyor.html'));
console.log('patched machine HTML');
