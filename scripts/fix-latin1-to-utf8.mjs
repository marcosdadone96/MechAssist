/**
 * Convierte archivos guardados en Latin-1/Windows-1252 (bytes 0x80?0xFF sueltos)
 * a UTF-8 vùlido. Solo toca archivos sin secuencias UTF-8 multibyte ya correctas.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'docs']);
const SKIP_FILES = new Set(['js/lab/pdfExportLab.js']);
const EXT = new Set(['.js', '.html', '.css', '.mjs']);

/**
 * @param {Buffer} buf
 */
function analyze(buf) {
  let invalid = 0;
  let valid = 0;
  let i = 0;
  while (i < buf.length) {
    const x = buf[i];
    if (x < 0x80) {
      i += 1;
      continue;
    }
    let len = 0;
    if ((x & 0xe0) === 0xc0) len = 2;
    else if ((x & 0xf0) === 0xe0) len = 3;
    else if ((x & 0xf8) === 0xf0) len = 4;
    if (len && i + len <= buf.length) {
      let ok = true;
      for (let j = 1; j < len; j += 1) {
        if ((buf[i + j] & 0xc0) !== 0x80) ok = false;
      }
      if (ok) {
        valid += 1;
        i += len;
        continue;
      }
    }
    invalid += 1;
    i += 1;
  }
  const converted = Buffer.from(buf.toString('latin1'), 'utf8');
  const convOk = !converted.toString('utf8').includes('\uFFFD');
  return { invalid, valid, convOk, converted };
}

/**
 * @param {string} dir
 * @param {string[]} acc
 */
function walk(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (EXT.has(path.extname(p))) acc.push(p);
  }
}

const files = [];
walk(ROOT, files);
const fixed = [];

for (const abs of files) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
  if (rel.startsWith('netlify/')) continue;
  if (SKIP_FILES.has(rel)) continue;
  const buf = fs.readFileSync(abs);
  const { invalid, valid, convOk, converted } = analyze(buf);
  if (invalid > 0 && valid === 0 && convOk) {
    fs.writeFileSync(abs, converted);
    fixed.push(rel);
  }
}

console.log(`UTF-8 fix: ${fixed.length} file(s)`);
fixed.forEach((f) => console.log(`  ${f}`));
