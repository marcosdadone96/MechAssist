/**
 * Generate calc-worm-gear.html (UTF-8 safe).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'calc-worm-gear.html');

const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title data-i18n="worm.docTitle">Tornillo sin fin y corona \u2014 TheMechAssist</title>
    <meta name="description" data-i18n="worm.metaDesc" data-i18n-attr="content" content="Relaci\u00f3n i, \u00e1ngulo de avance, eficiencia y autobloqueo en tornillo sin fin y corona." />
    <link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any" />
    <link rel="icon" href="favicon-32x32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180" />
    <link rel="canonical" href="https://www.themechassist.com/calc-worm-gear.html" id="mdr-canonical" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.themechassist.com/calc-worm-gear.html" />
    <meta property="og:title" data-i18n="worm.docTitle" data-i18n-attr="content" content="Tornillo sin fin y corona \u2014 TheMechAssist" />
    <meta property="og:description" data-i18n="worm.metaDesc" data-i18n-attr="content" content="Relaci\u00f3n, \u03b3, eficiencia y autobloqueo." />
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
          <h2 data-i18n="worm.h2">Tornillo sin fin y corona \u00b7 cinem\u00e1tica</h2>
          <p class="lab-safety-notice" data-i18n="worm.safetyNotice">C\u00e1lculo orientativo. Confirme geometr\u00eda, materiales y eficiencia con datos del fabricante.</p>
          <p class="lab-calc-hero-lead" data-i18n="worm.heroLead">Relaci\u00f3n i, \u00e1ngulo de avance \u03b3, eficiencia, autobloqueo, distancia entre ejes y par de salida.</p>
          <details class="lab-calc-seo">
            <summary data-i18n="worm.seoSummary">Contexto ampliado y notas de uso</summary>
            <p class="calc-seo-intro" data-i18n="worm.calcSeoIntro">Predimensionado de reductor tornillo\u2013corona con m\u00f3dulo axial, entradas del tornillo y dientes de corona.</p>
          </details>
          <details class="lab-calc-help">
            <summary class="lab-calc-help__summary" data-i18n="worm.methodSummary">Metodolog\u00eda y l\u00edmites del modelo</summary>
            <div class="lab-calc-help__body">
              <p class="lab-lead lab-lead--in-help" data-i18n="worm.methodBodyHtml" data-i18n-html>i = z\u2082/nw; \u03b3 = arctan(nw\u00b7mx/d\u2081); \u03b7 = tan\u03b3/tan(\u03b3+\u03c6\u2032).</p>
            </div>
          </details>
        </header>
        <nav class="lab-next-steps" data-i18n="worm.nextStepsAria" data-i18n-attr="aria-label" aria-label="Siguiente paso habitual">
          <h3 class="lab-next-steps__title" data-i18n="worm.nextStepsTitle">Siguiente paso habitual</h3>
          <ul class="lab-next-steps__list">
            <li data-i18n="worm.nextLi1Html" data-i18n-html><a href="calc-shaft.html">Eje \u00b7 torsi\u00f3n</a> \u2014 di\u00e1metro con T\u2082.</li>
            <li data-i18n="worm.nextLi2Html" data-i18n-html><a href="calc-bearings.html">Rodamientos \u00b7 L10</a> \u2014 apoyos axiales.</li>
            <li data-i18n="worm.nextLi3Html" data-i18n-html><a href="calc-gears.html">Engranajes cil\u00edndricos</a> \u2014 comparar reducci\u00f3n paralela.</li>
          </ul>
        </nav>
        <div class="lab-presets-row">
          <span class="lab-presets-row__label" data-i18n="worm.presetsLabel">Ejemplos t\u00edpicos:</span>
          <div class="lab-presets-bar" id="wgPresetsBar"></div>
        </div>
        <div class="lab-calc-layout lab-calc-layout--with-diag lab-calc-layout--panelled">
          <div class="lab-calc-layout__diagram">
            <div class="lab-diagram-wrap lab-diagram-wrap--elevated">
              <p class="lab-diagram-wrap__title" data-i18n="worm.diagTitle">Vista esquem\u00e1tica \u00b7 se actualiza al cambiar los datos</p>
              <svg id="wgDiagram" xmlns="http://www.w3.org/2000/svg" data-i18n="worm.diagAriaLabel" data-i18n-attr="aria-label" aria-label="Diagrama tornillo y corona"></svg>
              <p class="lab-diagram-caption" data-i18n="worm.diagCaptionHtml" data-i18n-html>Cotas <strong>d\u2081</strong>, <strong>d\u2082</strong> y <strong>a</strong> orientativas.</p>
            </div>
          </div>
          <div class="lab-calc-layout__inputs lab-calc-layout__inputs--panel">
            <div class="lab-grid lab-grid--2">
              <div class="lab-field lab-field--wide">
                <label for="wgCalcMode" data-i18n="worm.labelCalcMode">Modo de trabajo</label>
                <select id="wgCalcMode">
                  <option value="design" data-i18n="worm.optDesign">Dise\u00f1o \u2014 objetivo de reducci\u00f3n \u2192 m\u00f3dulo y entradas</option>
                  <option value="diagnostic" selected data-i18n="worm.optDiagnostic">Diagn\u00f3stico \u2014 par instalado \u2192 verificar \u03b3 y eficiencia</option>
                </select>
                <div class="lab-field-help lab-field-help--worm-modes" id="wgCalcModeHelp">
                  <p class="worm-calc-mode-help__line" data-worm-mode="design" data-i18n="worm.helpCalcModeDesignHtml" data-i18n-html><strong>Dise\u00f1o:</strong> relaci\u00f3n objetivo \u2192 sugiere nw, z\u2082 y m\u00f3dulo.</p>
                  <p class="worm-calc-mode-help__line worm-calc-mode-help__line--active" data-worm-mode="diagnostic" data-i18n="worm.helpCalcModeDiagnosticHtml" data-i18n-html><strong>Diagn\u00f3stico:</strong> m\u00f3dulo y geometr\u00eda instalados \u2192 \u03b3, \u03b7 y autobloqueo.</p>
                </div>
              </div>
              <div class="lab-field" id="wgTargetField">
                <label for="wgTargetI" data-i18n="worm.labelTargetI">Relaci\u00f3n objetivo i (dise\u00f1o)</label>
                <input inputmode="decimal" id="wgTargetI" type="number" min="5" step="any" value="40" />
                <p class="lab-field-help" data-i18n="worm.helpTargetIHtml" data-i18n-html>Objetivo <strong>i = z\u2082/nw</strong>.</p>
              </div>
              <div class="lab-field">
                <label for="wgMx" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="worm.icoMx" data-i18n-attr="title" title="M\u00f3dulo">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h16M7 18V9M12 18V6M17 18v-5"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="worm.labelMx">M\u00f3dulo axial m\u2093 (mm)</span>
                </label>
                <input inputmode="decimal" id="wgMx" type="number" step="0.5" min="0.5" value="3" />
                <p class="lab-field-help" data-i18n="worm.helpMxHtml" data-i18n-html><strong>m\u2093</strong> axial con coeficiente <strong>q</strong> ISO 3408.</p>
              </div>
              <div class="lab-field">
                <label for="wgNw" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="worm.icoNw" data-i18n-attr="title" title="Entradas">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16"/><path d="M12 4v16"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="worm.labelNw">Entradas del tornillo n<sub>w</sub></span>
                </label>
                <select id="wgNw">
                  <option value="1" selected>1</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                </select>
                <p class="lab-field-help" data-i18n="worm.helpNwHtml" data-i18n-html><strong>i = z\u2082/nw</strong>.</p>
              </div>
              <div class="lab-field">
                <label for="wgZ2" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="worm.icoZ2" data-i18n-attr="title" title="Corona">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="worm.labelZ2">Dientes de corona z\u2082</span>
                </label>
                <input id="wgZ2" type="number" min="20" value="40" />
                <p class="lab-field-help" data-i18n="worm.helpZ2Html" data-i18n-html>M\u00ednimo ~20 dientes en este modelo.</p>
              </div>
              <div class="lab-field">
                <label for="wgMat" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="worm.icoMat" data-i18n-attr="title" title="Material">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18c2-4 10-4 12 0"/><path d="M8 10c2-2 6-2 8 0"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="worm.labelMat">Material tornillo</span>
                </label>
                <select id="wgMat">
                  <option value="steel_c45" selected data-i18n="worm.optMatC45">Acero templado C45</option>
                  <option value="steel_16mncr5" data-i18n="worm.optMat16Mn">Acero 16MnCr5</option>
                  <option value="bronze_al" data-i18n="worm.optMatBronze">Bronce Al / acero</option>
                </select>
                <p class="lab-field-help" data-i18n="worm.helpMatHtml" data-i18n-html>Orientativo; ajuste \u03bc seg\u00fan lubricaci\u00f3n.</p>
              </div>
              <div class="lab-field">
                <label for="wgN1" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="worm.icoN1" data-i18n-attr="title" title="RPM">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M16 8l2-4M12 8v4l3 2"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="worm.labelN1">Velocidad entrada n\u2081 (RPM)</span>
                </label>
                <input inputmode="decimal" id="wgN1" type="number" min="0" value="1450" />
                <p class="lab-field-help" data-i18n="worm.helpN1Html" data-i18n-html><strong>n\u2082 = n\u2081/i</strong>.</p>
              </div>
              <div class="lab-field">
                <label for="wgPower" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="worm.icoPower" data-i18n-attr="title" title="Potencia">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="worm.labelPower">Potencia entrada P (kW)</span>
                </label>
                <input inputmode="decimal" id="wgPower" type="number" step="0.01" min="0.01" value="1.5" />
                <p class="lab-field-help" data-i18n="worm.helpPowerHtml" data-i18n-html><strong>T\u2081 = 9550\u00b7P/n\u2081</strong> N\u00b7m.</p>
              </div>
              <div class="lab-field">
                <label for="wgGammaOut" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="worm.icoGamma" data-i18n-attr="title" title="Gamma">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18h12"/><path d="M5 18L15 8"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="worm.labelGamma">\u00c1ngulo de avance \u03b3 (\u00b0) \u2014 calculado</span>
                </label>
                <input id="wgGammaOut" type="text" readonly value="5.71" class="lab-field--readonly" />
                <p class="lab-field-help" data-i18n="worm.helpGammaHtml" data-i18n-html><strong>\u03b3 = arctan(nw\u00b7mx/d\u2081)</strong>.</p>
              </div>
              <div class="lab-field">
                <label for="wgFriction" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="worm.icoFriction" data-i18n-attr="title" title="Fricci\u00f3n">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18c2-4 10-4 12 0"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="worm.labelFriction">Coef. fricci\u00f3n \u03bc</span>
                </label>
                <input inputmode="decimal" id="wgFriction" type="number" step="0.01" min="0.01" max="0.2" value="0.05" />
                <span class="hint" data-i18n="worm.hintFriction">0,03\u20130,12 seg\u00fan lubricaci\u00f3n</span>
                <p class="lab-field-help" data-i18n="worm.helpFrictionHtml" data-i18n-html>Autobloqueo si <strong>\u03b3 \u2264 arctan(\u03bc)</strong>.</p>
              </div>
            </div>
          </div>
          <div class="lab-calc-layout__out lab-calc-layout__out--panel">
            <div class="lab-units-bar" role="group" data-i18n-attrs="aria-label=worm.unitsAriaLabel data-lab-convert-title=worm.convertTitle data-lab-convert-tip=worm.convertTip" aria-label="Unidades" data-lab-convert-categories="length" data-lab-convert-title="Conversor (tornillo sin fin)" data-lab-convert-tip="Longitudes en mm; pares en N\u00b7m.">
              <span class="lab-units-bar__title" data-i18n="worm.unitsBarTitle">C\u00f3mo ver los resultados</span>
              <label class="lab-units-bar__field">
                <span class="lab-units-bar__lbl" data-i18n="worm.lblLength">Distancias</span>
                <select id="labUnitLength" class="lab-units-bar__select">
                  <option value="mm" data-i18n="worm.optMmShop">mm (taller)</option>
                  <option value="cm" data-i18n="worm.optCm">cm</option>
                  <option value="in" data-i18n="worm.optIn">in</option>
                </select>
              </label>
              <label class="lab-units-bar__field">
                <span class="lab-units-bar__lbl" data-i18n="worm.lblTorque">Par</span>
                <select id="labUnitTorque" class="lab-units-bar__select">
                  <option value="Nm" data-i18n="worm.optNm">N\u00b7m</option>
                  <option value="Nmm" data-i18n="worm.optNmm">N\u00b7mm</option>
                  <option value="lbfft" data-i18n="worm.optLbfft">lbf\u00b7ft</option>
                </select>
              </label>
            </div>
            <div id="wgHero"></div>
            <details class="lab-results-details lab-results-details--chevron-end">
              <summary data-i18n="worm.summaryPerElement">Resultados por elemento</summary>
              <div id="wgElementResults" class="lab-element-columns"></div>
            </details>
            <div id="wgAlerts" class="lab-alerts"></div>
            <div id="wgAdvisorPanel" hidden></div>
            <div class="lab-results-wrap" id="wgResultsWrap">
              <div class="lab-results-computing" aria-hidden="true">
                <svg class="lab-gear-spin" viewBox="0 0 64 64" aria-hidden="true"><path fill="#0f766e" d="M32 8l2.2 4.4 4.9-1.3 1.3 4.9 4.4 2.2-2.2 4.4 1.3 4.9-4.9 1.3-2.2 4.4-4.4-2.2-4.9 1.3-1.3-4.9-4.4-2.2 2.2-4.4-1.3-4.9 4.9-1.3 4.4-2.2zm0 10a14 14 0 100 28 14 14 0 000-28z"/></svg>
                <span class="lab-results-computing__label" data-i18n="worm.recalculating">Recalculando</span>
              </div>
              <details class="lab-results-details lab-results-details--chevron-end lab-results-details--stacked">
                <summary data-i18n="worm.summaryFull">Resultado completo</summary>
                <div class="lab-results" id="wgResults"></div>
              </details>
              <div class="lab-results-actions">
                <button type="button" class="lab-btn lab-btn--block" id="wgCopyResults" data-i18n="worm.copyResults">Copiar resultados</button>
              </div>
            </div>
            <div class="lab-results-share lab-results-share--footer" id="wgShareLinkWrap" aria-live="polite">
              <button type="button" class="lab-btn lab-btn--text" id="wgCopyLinkBtn" data-i18n="worm.copyLink">Copiar enlace</button>
              <div class="lab-copy-toast" id="wgCopyToast" role="status" data-i18n="worm.copyToast">\u00a1Enlace copiado!</div>
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
    <script type="module" src="js/ui/calcWormGearPage.js"></script>
    <script type="module" src="js/ui/labDonationFooter.js"></script>
  </body>
</html>
`;

fs.writeFileSync(out, html, 'utf8');
console.log('Wrote', out);
