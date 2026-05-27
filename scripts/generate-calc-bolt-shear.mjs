/**
 * Generate calc-bolt-shear.html (UTF-8 safe).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'calc-bolt-shear.html');

const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title data-i18n="bshear.docTitle">Cortante en torniller\u00eda \u2014 TheMechAssist</title>
    <meta name="description" data-i18n="bshear.metaDesc" data-i18n-attr="content" content="Cortante, aplastamiento y deslizamiento en uniones atornilladas." />
    <link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any" />
    <link rel="icon" href="favicon-32x32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180" />
    <link rel="canonical" href="https://www.themechassist.com/calc-bolt-shear.html" id="mdr-canonical" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.themechassist.com/calc-bolt-shear.html" />
    <meta property="og:title" data-i18n="bshear.docTitle" data-i18n-attr="content" content="Cortante en torniller\u00eda \u2014 TheMechAssist" />
    <meta property="og:description" data-i18n="bshear.metaDesc" data-i18n-attr="content" content="Cortante y aplastamiento en tornillos." />
    <meta property="og:image" content="https://www.themechassist.com/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/lab.css" />
    <script defer src="js/legal/cookiesAndAnalyticsBoot.js"></script>
  </head>
  <body class="lab-body">
    <header class="site-nav site-nav--sticky">
      <a class="site-nav__brand" href="index.html" aria-label="Inicio \u2014 TheMechAssist" data-i18n="nav.brandHome" data-i18n-attr="aria-label">
        <img class="site-nav__logo" src="logo-themechassist.svg" width="40" height="40" alt="TheMechAssist" decoding="async" />
        <span class="site-nav__title" aria-hidden="true">The<em>MechAssist</em></span>
      </a>
      <nav class="site-nav__center" data-i18n="aria.siteNav" data-i18n-attr="aria-label">
        <a class="site-nav__link site-nav__link--hub" href="transmission-lab.html" data-i18n="nav.hubLab">Laboratorio de transmisi\u00f3n</a>
        <a class="site-nav__link site-nav__link--hub" href="machines-hub.html" data-i18n="nav.hubMachines">M\u00e1quinas</a>
        <a class="site-nav__link site-nav__link--hub" href="fluids-hub.html" data-i18n="nav.hubFluids">Hidr\u00e1ulica</a>
        <a class="site-nav__link" href="my-gearmotors.html"><span data-i18n="nav.myGearmotors">Mis motorreductores</span> <span class="premium-flag">Pro</span></a>
      </nav>
      <div class="site-nav__end">
        <a class="site-nav__link site-nav__link--plans" href="index.html#hub-pricing" data-nav-plans data-i18n="nav.plans">Planes</a>
        <div id="hub-header-auth-slot" class="site-nav__auth"></div>
        <a class="site-nav__link site-nav__link--feedback" href="feedback.html" data-i18n="nav.feedback">Sugerencias</a>
        <div class="site-nav__lang hub-lang" role="group" aria-label="Selector de idioma" data-i18n="aria.langSelector" data-i18n-attr="aria-label">
          <button type="button" class="hub-lang__btn site-nav__lang-btn" data-lang="es">ES</button>
          <span class="site-nav__lang-sep" aria-hidden="true">\u00b7</span>
          <button type="button" class="hub-lang__btn site-nav__lang-btn" data-lang="en">EN</button>
        </div>
      </div>
    </header>
    <main class="lab-main">
      <section class="lab-panel lab-panel--accent">
        <header class="lab-calc-page-head">
          <h2 data-i18n="bshear.h2">Cortante en torniller\u00eda \u00b7 aplastamiento</h2>
          <p class="lab-safety-notice" data-i18n="bshear.safetyNotice">C\u00e1lculo orientativo. Valide con EN 1993-1-8 y datos de fabricante.</p>
          <p class="lab-calc-hero-lead" data-i18n="bshear.heroLead">Complementa la calculadora ISO 898-1 (tracci\u00f3n): cortante en tornillo, aplastamiento en chapa y deslizamiento con pretensado.</p>
          <details class="lab-calc-seo">
            <summary data-i18n="bshear.seoSummary">Contexto ampliado y notas de uso</summary>
            <p class="calc-seo-intro" data-i18n="bshear.calcSeoIntro">Uniones cortadas: bridas, cartelas y chapas unidas. Diagrama del patr\u00f3n con reparto por tornillo.</p>
          </details>
          <details class="lab-calc-help">
            <summary class="lab-calc-help__summary" data-i18n="bshear.methodSummary">Metodolog\u00eda y l\u00edmites del modelo</summary>
            <div class="lab-calc-help__body">
              <p class="lab-lead lab-lead--in-help" data-i18n="bshear.methodBodyHtml" data-i18n-html>\u03c4_adm = 0,577\u00b7R_p0,2; aplastamiento y deslizamiento seg\u00fan modelo simplificado.</p>
            </div>
          </details>
        </header>
        <nav class="lab-next-steps" data-i18n="bshear.nextStepsAria" data-i18n-attr="aria-label" aria-label="Siguiente paso habitual">
          <h3 class="lab-next-steps__title" data-i18n="bshear.nextStepsTitle">Siguiente paso habitual</h3>
          <ul class="lab-next-steps__list">
            <li data-i18n="bshear.nextLi1Html" data-i18n-html><a href="calc-bolts-iso898.html">Torniller\u00eda ISO 898-1</a> \u2014 tracci\u00f3n y par de apriete.</li>
            <li data-i18n="bshear.nextLi2Html" data-i18n-html><a href="calc-weld-joint.html">Uniones soldadas</a> \u2014 alternativa soldada.</li>
            <li data-i18n="bshear.nextLi3Html" data-i18n-html><a href="calc-iso-fit.html">Ajustes ISO 286</a> \u2014 tolerancias de agujero.</li>
          </ul>
        </nav>
        <div class="lab-presets-row">
          <span class="lab-presets-row__label" data-i18n="bshear.presetsLabel">Ejemplos t\u00edpicos:</span>
          <div class="lab-presets-bar" id="bsPresetsBar"></div>
        </div>
        <div class="lab-calc-layout lab-calc-layout--with-diag lab-calc-layout--panelled">
          <div class="lab-calc-layout__diagram">
            <div class="lab-diagram-wrap lab-diagram-wrap--elevated">
              <p class="lab-diagram-wrap__title" data-i18n="bshear.diagTitle">Vista superior \u00b7 patr\u00f3n y carga por tornillo</p>
              <svg id="bsDiagram" xmlns="http://www.w3.org/2000/svg" data-i18n="bshear.diagAriaLabel" data-i18n-attr="aria-label" aria-label="Diagrama patr\u00f3n tornillos cortante"></svg>
              <p class="lab-diagram-caption" data-i18n="bshear.diagCaptionHtml" data-i18n-html>Tama\u00f1o y etiquetas = cortante por tornillo. <strong>C</strong> = centroide.</p>
            </div>
          </div>
          <div class="lab-calc-layout__inputs lab-calc-layout__inputs--panel">
            <div class="lab-grid lab-grid--2">
              <div class="lab-field">
                <label for="bsDiam" data-i18n="bshear.labelDiam">Di\u00e1metro nominal d (mm)</label>
                <input inputmode="decimal" id="bsDiam" type="number" min="4" step="1" value="12" />
                <p class="lab-field-help" data-i18n="bshear.helpDiamHtml" data-i18n-html>\u00c1rea bruta <strong>A = \u03c0d\u00b2/4</strong>.</p>
              </div>
              <div class="lab-field">
                <label for="bsClass" data-i18n="bshear.labelClass">Clase ISO</label>
                <select id="bsClass">
                  <option value="4.6">4.6</option>
                  <option value="5.6">5.6</option>
                  <option value="6.8">6.8</option>
                  <option value="8.8" selected>8.8</option>
                  <option value="10.9">10.9</option>
                  <option value="12.9">12.9</option>
                </select>
                <p class="lab-field-help" data-i18n="bshear.helpClassHtml" data-i18n-html><strong>R_p0,2</strong> y <strong>f_ub</strong> (ISO 898-1).</p>
              </div>
              <div class="lab-field">
                <label for="bsN" data-i18n="bshear.labelN">N\u00ba de tornillos n</label>
                <input id="bsN" type="number" min="1" max="24" value="4" />
                <p class="lab-field-help" data-i18n="bshear.helpNHtml" data-i18n-html>Tornillos en el patr\u00f3n.</p>
              </div>
              <div class="lab-field">
                <label for="bsShearPlanes" data-i18n="bshear.labelShearPlanes">Planos de corte</label>
                <select id="bsShearPlanes">
                  <option value="single" data-i18n="bshear.optSingle">Corte simple</option>
                  <option value="double" selected data-i18n="bshear.optDouble">Corte doble</option>
                </select>
                <p class="lab-field-help" data-i18n="bshear.helpShearPlanesHtml" data-i18n-html>Simple o doble corte por tornillo.</p>
              </div>
              <div class="lab-field">
                <label for="bsForce" data-i18n="bshear.labelForce">Fuerza de corte total F</label>
                <input inputmode="decimal" id="bsForce" type="number" min="0" value="20000" />
                <p class="lab-field-help" data-i18n="bshear.helpForceHtml" data-i18n-html>Cortante total en la uni\u00f3n.</p>
              </div>
              <div class="lab-field">
                <label for="bsThickness" data-i18n="bshear.labelThickness">Espesor chapas t (mm)</label>
                <input inputmode="decimal" id="bsThickness" type="number" min="0.5" value="10" />
                <p class="lab-field-help" data-i18n="bshear.helpThicknessHtml" data-i18n-html>Espesor para aplastamiento.</p>
              </div>
              <div class="lab-field">
                <label for="bsMu" data-i18n="bshear.labelMu">Coef. rozamiento \u03bc</label>
                <input inputmode="decimal" id="bsMu" type="number" step="0.01" min="0" max="0.5" value="0" />
                <span class="hint" data-i18n="bshear.hintMu">0 = sin pretensado</span>
                <p class="lab-field-help" data-i18n="bshear.helpMuHtml" data-i18n-html>Deslizamiento con pretensado si \u03bc &gt; 0.</p>
              </div>
              <div class="lab-field">
                <label for="bsMaterial" data-i18n="bshear.labelMaterial">Material chapa</label>
                <select id="bsMaterial">
                  <option value="s235" data-i18n="bshear.optS235">Acero S235</option>
                  <option value="s275" data-i18n="bshear.optS275">Acero S275</option>
                  <option value="s355" selected data-i18n="bshear.optS355">Acero S355</option>
                  <option value="al6061" data-i18n="bshear.optAl6061">Aluminio 6061</option>
                </select>
                <p class="lab-field-help" data-i18n="bshear.helpMaterialHtml" data-i18n-html><strong>f_u</strong> para aplastamiento.</p>
              </div>
              <div class="lab-field">
                <label for="bsEcc" data-i18n="bshear.labelEcc">Excentricidad e (mm)</label>
                <input inputmode="decimal" id="bsEcc" type="number" min="0" value="0" />
                <p class="lab-field-help" data-i18n="bshear.helpEccHtml" data-i18n-html>0 = reparto sim\u00e9trico; &gt;0 = patr\u00f3n exc\u00e9ntrico.</p>
              </div>
            </div>
          </div>
          <div class="lab-calc-layout__out lab-calc-layout__out--panel">
            <div class="lab-units-bar" role="group" data-i18n-attrs="aria-label=bshear.unitsAriaLabel data-lab-convert-title=bshear.convertTitle data-lab-convert-tip=bshear.convertTip" aria-label="Unidades" data-lab-convert-categories="force pressure" data-lab-convert-title="Conversor (cortante tornillos)" data-lab-convert-tip="Fuerza y tensi\u00f3n.">
              <span class="lab-units-bar__title" data-i18n="bshear.unitsBarTitle">C\u00f3mo ver los valores</span>
              <label class="lab-units-bar__field">
                <span class="lab-units-bar__lbl" data-i18n="bshear.lblForce">Fuerza</span>
                <select id="labUnitForce" class="lab-units-bar__select">
                  <option value="N" data-i18n="bshear.optN">N</option>
                  <option value="kN" data-i18n="bshear.optkN">kN</option>
                </select>
              </label>
              <label class="lab-units-bar__field">
                <span class="lab-units-bar__lbl" data-i18n="bshear.lblPressure">Tensi\u00f3n</span>
                <select id="labUnitPressure" class="lab-units-bar__select">
                  <option value="MPa" data-i18n="bshear.optMpa">MPa</option>
                  <option value="ksi" data-i18n="bshear.optKsi">ksi</option>
                </select>
              </label>
            </div>
            <div id="bsHero"></div>
            <h3 class="lab-subsection-title" data-i18n="bshear.tableTitle">Resumen de comprobaciones</h3>
            <div id="bsCheckTable"></div>
            <div id="bsAlerts" class="lab-alerts"></div>
            <div class="lab-results-wrap" id="bsResultsWrap">
              <div class="lab-results-computing" aria-hidden="true">
                <svg class="lab-gear-spin" viewBox="0 0 64 64" aria-hidden="true"><path fill="#0f766e" d="M32 8l2.2 4.4 4.9-1.3 1.3 4.9 4.4 2.2-2.2 4.4 1.3 4.9-4.9 1.3-2.2 4.4-4.4-2.2-4.9 1.3-1.3-4.9-4.4-2.2 2.2-4.4-1.3-4.9 4.9-1.3 4.4-2.2zm0 10a14 14 0 100 28 14 14 0 000-28z"/></svg>
                <span class="lab-results-computing__label" data-i18n="bshear.recalculating">Recalculando</span>
              </div>
              <details class="lab-results-details lab-results-details--chevron-end lab-results-details--stacked">
                <summary data-i18n="bshear.summaryFull">Resultado completo</summary>
                <div class="lab-results" id="bsResults"></div>
              </details>
              <div class="lab-results-actions">
                <button type="button" class="lab-btn lab-btn--block" id="bsCopyResults" data-i18n="bshear.copyResults">Copiar resultados</button>
              </div>
            </div>
            <div class="lab-results-share lab-results-share--footer" id="bsShareLinkWrap" aria-live="polite">
              <button type="button" class="lab-btn lab-btn--text" id="bsCopyLinkBtn" data-i18n="bshear.copyLink">Copiar enlace</button>
              <div class="lab-copy-toast" id="bsCopyToast" role="status" data-i18n="bshear.copyToast">\u00a1Enlace copiado!</div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <script>
      globalThis.__SUPABASE_URL__ = 'https://ytdtsqxhqfuzzcblidiy.supabase.co';
      globalThis.__SUPABASE_ANON_KEY__ = 'sb_publishable_HQqMGXjb5zO1Jp_Hn9eXmA_NA0Htl41';
    </script>
    <script type="module" src="js/ui/homeI18n.js"></script>
    <script type="module" src="js/ui/hubFreemium.js"></script>
    <script type="module" src="js/ui/calcBoltShearPage.js"></script>
    <script type="module" src="js/ui/labDonationFooter.js"></script>
  </body>
</html>
`;

fs.writeFileSync(out, html, 'utf8');
console.log('Wrote', out);
