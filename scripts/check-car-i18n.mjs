import fs from 'fs';

const html = fs.readFileSync('car-lift-screw.html', 'utf8');
const enSrc = fs.readFileSync('js/lab/i18n/pages/carLiftEn.js', 'utf8');
const uxSrc = fs.readFileSync('js/lab/i18n/pages/machineHubUxEn.js', 'utf8');
const attrs = [...html.matchAll(/data-i18n-attrs="title=([^"]+)"/g)].map((m) => m[1]);
const keys = new Set([
  ...[...enSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]),
  ...[...uxSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]),
]);
const missing = attrs.filter((k) => !keys.has(k));
const chips = (html.match(/class="info-chip"/g) || []).length;
const withAttrs = (html.match(/info-chip[^>]*data-i18n-attrs/g) || []).length;
const opts = (html.match(/<option[^>]+data-i18n=/g) || []).length;
const presets = (html.match(/data-cl-preset=/g) || []).length;
console.log('info-chips:', chips, 'with data-i18n-attrs:', withAttrs);
console.log('options with data-i18n:', opts);
console.log('presets:', presets);
console.log('missing EN keys for chip titles:', missing.length ? missing.join(', ') : 'none');
