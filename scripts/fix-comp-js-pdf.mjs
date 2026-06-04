import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'js/ui/pneumaticCompressorPage.js');
let s = fs.readFileSync(p, 'utf8');
s = s.replace(
  /title:\s*\n\s*langPdf === 'en' \?[^\n]+/,
  "title:\n      langPdf === 'en' ? 'Report \\u2014 Pneumatic compressor' : 'Informe \\u2014 Compresor neum\\u00e1tico'",
);
fs.writeFileSync(p, s);
console.log('fixed pdf title');
