/**
 * Insert Supabase globals immediately BEFORE the first homeI18n module script only.
 * Skips files that already define globalThis.__SUPABASE_URL__.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const NEEDLE = '    <script type="module" src="js/ui/homeI18n.js"></script>';
const BLOCK = `    <script>
      globalThis.__SUPABASE_URL__ = 'https://ytdtsqxhqfuzzcblidiy.supabase.co';
      globalThis.__SUPABASE_ANON_KEY__ = 'sb_publishable_HQqMGXjb5zO1Jp_Hn9eXmA_NA0Htl41';
    </script>

${NEEDLE}`;

const MARKER = 'globalThis.__SUPABASE_URL__';

for (const name of fs.readdirSync(root)) {
  if (!name.endsWith('.html')) continue;
  const p = path.join(root, name);
  let c = fs.readFileSync(p, 'utf8');
  if (c.includes(MARKER)) continue;
  const n = c.split(NEEDLE).length - 1;
  if (n === 0) continue;
  if (n !== 1) {
    console.warn('skip (multiple homeI18n needles):', name);
    continue;
  }
  c = c.replace(NEEDLE, BLOCK);
  fs.writeFileSync(p, c, 'utf8');
  console.log('patched', name);
}
