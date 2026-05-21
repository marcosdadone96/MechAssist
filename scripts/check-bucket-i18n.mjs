import fs from 'fs';

const html = fs.readFileSync('bucket-elevator.html', 'utf8');
const enSrc = fs.readFileSync('js/lab/i18n/pages/bucketElevatorEn.js', 'utf8');
const mainSrc = fs.readFileSync('js/lab/i18n/pages/bucketElevatorMainEn.js', 'utf8');
const uxSrc = fs.readFileSync('js/lab/i18n/pages/machineHubUxEn.js', 'utf8');
const attrs = [...html.matchAll(/data-i18n-attrs="title=([^"]+)"/g)].map((m) => m[1]);
const keys = new Set([
  ...[...enSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]),
  ...[...mainSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]),
  ...[...mainSrc.matchAll(/^\s+(be\w+):/gm)].map((m) => m[1]),
  ...[...uxSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]),
]);
const missing = attrs.filter((k) => !keys.has(k));
const legacyBe = (html.match(/data-be-i18n/g) || []).length;
const legacyChip = (html.match(/data-be-chip/g) || []).length;
const chips = (html.match(/class="info-chip"/g) || []).length;
const withAttrs = (html.match(/info-chip[^>]*data-i18n-attrs/g) || []).length;
const opts = (html.match(/<option[^>]+data-i18n=/g) || []).length;
const presets = (html.match(/data-be-preset=/g) || []).length;
console.log('legacy data-be-i18n:', legacyBe, 'data-be-chip:', legacyChip);
console.log('info-chips:', chips, 'with data-i18n-attrs:', withAttrs);
console.log('options data-i18n:', opts, 'presets:', presets);
console.log('missing tip EN keys:', missing.length ? missing.join(', ') : 'none');
