import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { statSync, copyFileSync, unlinkSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'og-image.png');
const dst = path.join(root, 'og-image.png');

await sharp(src)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .webp({ quality: 85 })
  .toFile(path.join(root, 'og-image.webp'));

await sharp(src)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true, colors: 128, effort: 10 })
  .toFile(path.join(root, 'og-image-compressed.png'));

const webpSize = (statSync(path.join(root, 'og-image.webp')).size / 1024).toFixed(0);
const pngSize = (statSync(path.join(root, 'og-image-compressed.png')).size / 1024).toFixed(0);
console.log(`og-image.webp:  ${webpSize} KB`);
console.log(`og-image-compressed.png: ${pngSize} KB`);

if (Number(pngSize) < 200) {
  copyFileSync(path.join(root, 'og-image-compressed.png'), dst);
  unlinkSync(path.join(root, 'og-image-compressed.png'));
  console.log(`og-image.png reemplazado con versin comprimida (${pngSize} KB)`);
} else {
  console.warn(`ATENCIN: PNG comprimido sigue siendo grande (${pngSize} KB). Revisar manualmente.`);
}
