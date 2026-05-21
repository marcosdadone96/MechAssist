import fs from 'fs';

const path = 'bucket-elevator.html';
let html = fs.readFileSync(path, 'utf8');

html = html.replaceAll('data-be-i18n-html', 'data-i18n-html');
html = html.replaceAll('data-be-i18n=', 'data-i18n=');

const chipMap = {
  h: 'beConv.tipH',
  q: 'beConv.tipQ',
  bucket: 'beConv.tipBucket',
  rho: 'beConv.tipRho',
  fluidity: 'beConv.tipFluidity',
  nature: 'beConv.tipNature',
  vbelt: 'beConv.tipVbelt',
  pitch: 'beConv.tipPitch',
  dhead: 'beConv.tipDhead',
  dboot: 'beConv.tipDboot',
  width: 'beConv.tipWidth',
  sigma: 'beConv.tipSigma',
  eta: 'beConv.tipEta',
  kboot: 'beConv.tipKboot',
  etatrans: 'beConv.tipEtatrans',
  vbrand: 'beConv.tipVerifyBrand',
  vsearch: 'beConv.tipVerifySearch',
  vmodel: 'beConv.tipVerifyModel',
};

for (const [chip, tip] of Object.entries(chipMap)) {
  html = html.replaceAll(`data-be-chip="${chip}"`, `data-i18n-attrs="title=${tip}"`);
}

// Discharge chip (no data-be-chip)
html = html.replace(
  /<span class="info-chip" title="Centrífuga para materiales fluidos/,
  '<span class="info-chip" data-i18n-attrs="title=beConv.tipDischarge" title="Centrífuga para materiales fluidos',
);

fs.writeFileSync(path, html);
