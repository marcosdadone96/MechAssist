import fs from 'fs';

const html = fs.readFileSync('inclined-conveyor.html', 'utf8');
const enSrc = fs.readFileSync('js/lab/i18n/pages/inclinedConveyorEn.js', 'utf8');
const attrs = [...html.matchAll(/data-i18n-attrs="title=([^"]+)"/g)].map((m) => m[1]);
const keys = new Set([...enSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]));
const missing = attrs.filter((k) => !keys.has(k));
const chips = (html.match(/class="info-chip"/g) || []).length;
const withAttrs = (html.match(/info-chip[^>]*data-i18n-attrs/g) || []).length;
console.log('info-chips:', chips, 'with data-i18n-attrs:', withAttrs);
console.log('missing EN keys:', missing.length ? missing.join(', ') : 'none');
