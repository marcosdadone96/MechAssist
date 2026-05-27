import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function injectMeta(file, { metaDescKey, docTitleKey, ogDescContent, twitterTitleContent }) {
  let s = fs.readFileSync(path.join(root, file), 'utf8');
  s = s.replace(/\uFFFD/g, '');

  if (!s.includes('favicon-32x32.png')) {
    s = s.replace(
      /(<link rel="icon" href="favicon\.svg"[^>]*>)/,
      `$1\n    <link rel="icon" href="favicon-32x32.png" type="image/png" sizes="32x32" />\n    <link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180" />`,
    );
  }

  if (!s.includes('property="og:description"')) {
    s = s.replace(
      /(<meta property="og:title"[^>]*\/>)/,
      `$1\n    <meta\n      property="og:description"\n      data-i18n="${metaDescKey}"\n      data-i18n-attr="content"\n      content="${ogDescContent}"\n    />`,
    );
  }

  if (!s.includes('name="twitter:title"')) {
    s = s.replace(
      /(<meta name="twitter:card" content="summary_large_image" \/>)/,
      `$1\n    <meta\n      name="twitter:title"\n      data-i18n="${docTitleKey}"\n      data-i18n-attr="content"\n      content="${twitterTitleContent}"\n    />`,
    );
  }

  fs.writeFileSync(path.join(root, file), s, 'utf8');
  console.log(file, {
    fav32: s.includes('favicon-32x32'),
    ogDesc: s.includes('og:description'),
    twTitle: s.includes('twitter:title'),
    fffd: (s.match(/\uFFFD/g) || []).length,
  });
}

injectMeta('calc-beam.html', {
  metaDescKey: 'beam.metaDesc',
  docTitleKey: 'beam.docTitle',
  ogDescContent:
    'Max deflection, bending moment, shear and normal stress for simply-supported, cantilever and fixed beams. Free online.',
  twitterTitleContent: 'Beam bending & deflection calculator \u2014 TheMechAssist',
});

injectMeta('calc-weld-joint.html', {
  metaDescKey: 'weld.metaDesc',
  docTitleKey: 'weld.docTitle',
  ogDescContent:
    'Indicative fillet and butt weld checks: throat stress, usage factor and minimum leg size. EN 1993-1-8 oriented predesign. Free online.',
  twitterTitleContent: 'Welded joint calculator \u2014 TheMechAssist',
});
