import fs from 'fs';

const html = fs.readFileSync('centrifugal-pump.html', 'utf8');
const enSrc = fs.readFileSync('js/lab/i18n/pages/centrifugalPumpEn.js', 'utf8');
const uxSrc = fs.readFileSync('js/lab/i18n/pages/machineHubUxEn.js', 'utf8');
const pageSrc = fs.readFileSync('js/ui/centrifugalPumpPage.js', 'utf8');
const attrs = [...html.matchAll(/data-i18n-attrs="title=([^"]+)"/g)].map((m) => m[1]);
const keys = new Set([
  ...[...enSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]),
  ...[...uxSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]),
]);
const missing = attrs.filter((k) => !keys.has(k));
const chips = (html.match(/class="info-chip"/g) || []).length;
const withAttrs = (html.match(/info-chip[^>]*data-i18n-attrs/g) || []).length;
const alertKeys = [...pageSrc.matchAll(/pumpPageStr\(\s*'([^']+)'/g)].map((m) => m[1]);
const missingAlerts = alertKeys.filter((k) => !keys.has(k));
console.log('info-chips:', chips, 'with data-i18n-attrs:', withAttrs);
console.log('missing chip EN keys:', missing.length ? missing.join(', ') : 'none');
console.log('pumpPageStr keys:', alertKeys.length, 'missing:', missingAlerts.length ? missingAlerts.join(', ') : 'none');
