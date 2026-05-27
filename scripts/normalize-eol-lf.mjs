/**
 * Normalize text files to LF line endings.
 * Usage: node scripts/normalize-eol-lf.mjs [paths...]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.join(root, '..');

const files =
  process.argv.length > 2
    ? process.argv.slice(2)
    : ['calc-beam.html', 'calc-weld-joint.html', 'calc-power-screw.html'];

let failed = false;

for (const rel of files) {
  const p = path.isAbsolute(rel) ? rel : path.join(repo, rel);
  let raw = fs.readFileSync(p, 'utf8');
  const crCount = (raw.match(/\r/g) || []).length;
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (normalized !== raw) {
    fs.writeFileSync(p, normalized, 'utf8');
    console.log(`${rel}: normalized (${crCount} CR removed)`);
  } else {
    console.log(`${rel}: already LF`);
  }

  if (normalized.includes('\uFFFD')) {
    console.error(`${rel}: contains U+FFFD replacement character`);
    failed = true;
  }
  if (/\\x[0-9a-fA-F]{2}/.test(normalized)) {
    console.error(`${rel}: contains literal \\x escape sequences`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
