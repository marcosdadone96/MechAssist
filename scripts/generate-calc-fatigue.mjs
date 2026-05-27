/**
 * Generate calc-fatigue.html (UTF-8 safe).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'calc-fatigue.html');

const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title data-i18n="fatigue.docTitle">Fatiga \u2014 diagrama de Goodman \u2014 TheMechAssist</title>
    <meta name="description" data-i18n="fatigue.metaDesc" data-i18n-attr="content" content="Goodman, Gerber y Soderberg con diagrama interactivo \u03c3_a vs \u03c3_m." />
    <link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any" />
    <link rel="icon" href="favicon-32x32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180" />
    <link rel="canonical" href="https://www.themechassist.com/calc-fatigue.html" id="mdr-canonical" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.themechassist.com/calc-fatigue.html" />
    <meta property="og:title" data-i18n="fatigue.docTitle" data-i18n-attr="content" content="Fatiga \u2014 Goodman \u2014 TheMechAssist" />
    <meta property="og:description" data-i18n="fatigue.metaDesc" data-i18n-attr="content" content="Diagrama de Goodman interactivo." />
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
          <h2 data-i18n="fatigue.h2">Fatiga \u00b7 Goodman / Gerber / Soderberg</h2>
          <p class="lab-safety-notice" data-i18n="fatigue.safetyNotice">C\u00e1lculo orientativo. Confirme con datos certificados del material y normativa aplicable.</p>
          <p class="lab-calc-hero-lead" data-i18n="fatigue.heroLead">L\u00edmite a fatiga corregido S_e, factores n_f y diagrama \u03c3_a\u2013\u03c3_m en tiempo real.</p>
          <details class="lab-calc-seo">
            <summary data-i18n="fatigue.seoSummary">Contexto ampliado y notas de uso</summary>
            <p class="calc-seo-intro" data-i18n="fatigue.calcSeoIntro">Comprobaci\u00f3n de fatiga con criterios de Goodman, Gerber y Soderberg y factores de superficie, tama\u00f1o y concentraci\u00f3n.</p>
          </details>
          <details class="lab-calc-help">
            <summary class="lab-calc-help__summary" data-i18n="fatigue.methodSummary">Metodolog\u00eda y l\u00edmites del modelo</summary>
            <div class="lab-calc-help__body">
              <p class="lab-lead lab-lead--in-help" data-i18n="fatigue.methodBodyHtml" data-i18n-html>S\u2032 = 0,5\u00b7S_u; S_e = K_a K_b K_c S\u2032; \u03c3_a,eff = K_f\u00b7\u03c3_a.</p>
            </div>
          </details>
        </header>
        <nav class="lab-next-steps" data-i18n="fatigue.nextStepsAria" data-i18n-attr="aria-label" aria-label="Siguiente paso habitual">
          <h3 class="lab-next-steps__title" data-i18n="fatigue.nextStepsTitle">Siguiente paso habitual</h3>
          <ul class="lab-next-steps__list">
            <li data-i18n="fatigue.nextLi1Html" data-i18n-html><a href="calc-shaft.html">Eje \u00b7 torsi\u00f3n</a> \u2014 di\u00e1metro m\u00ednimo.</li>
            <li data-i18n="fatigue.nextLi2Html" data-i18n-html><a href="calc-beam.html">Viga en flexi\u00f3n</a> \u2014 tensiones.</li>
            <li data-i18n="fatigue.nextLi3Html" data-i18n-html><a href="calc-weld-joint.html">Uniones soldadas</a> \u2014 garganta.</li>
          </ul>
        </nav>
        <div class="lab-presets-row">
          <span class="lab-presets-row__label" data-i18n="fatigue.presetsLabel">Ejemplos t\u00edpicos:</span>
          <div class="lab-presets-bar" id="ftPresetsBar"></div>
        </div>
        <div class="lab-calc-layout lab-calc-layout--with-diag lab-calc-layout--panelled">
          <div class="lab-calc-layout__diagram">
            <div class="lab-diagram-wrap lab-diagram-wrap--elevated">
              <p class="lab-diagram-wrap__title" data-i18n="fatigue.diagTitle">Diagrama de fatiga \u00b7 se actualiza al cambiar los datos</p>
              <svg id="ftDiagram" xmlns="http://www.w3.org/2000/svg" data-i18n="fatigue.diagAriaLabel" data-i18n-attr="aria-label" aria-label="Diagrama Goodman Gerber Soderberg"></svg>
              <p class="lab-diagram-caption" data-i18n="fatigue.diagCaptionHtml" data-i18n-html>Rojo: Goodman; naranja: Gerber; azul: Soderberg. Color del punto seg\u00fan <strong>n_f</strong>.</p>
            </div>
          </div>
          <div class="lab-calc-layout__inputs lab-calc-layout__inputs--panel">
            <div class="lab-grid lab-grid--2">
              <div class="lab-field lab-field--wide">
                <label for="ftCalcMode" data-i18n="fatigue.labelCalcMode">Modo de trabajo</label>
                <select id="ftCalcMode">
                  <option value="design" data-i18n="fatigue.optDesign">Dise\u00f1o \u2014 dado \u03c3_m \u2192 \u03c3_a m\u00e1xima admisible</option>
                  <option value="diagnostic" selected data-i18n="fatigue.optDiagnostic">Diagn\u00f3stico \u2014 \u00bfaguanta?</option>
                </select>
                <div class="lab-field-help lab-field-help--fatigue-modes" id="ftCalcModeHelp">
                  <p class="fatigue-calc-mode-help__line" data-fatigue-mode="design" data-i18n="fatigue.helpCalcModeDesignHtml" data-i18n-html><strong>Dise\u00f1o:</strong> \u03c3_m \u2192 \u03c3_a admisible.</p>
                  <p class="fatigue-calc-mode-help__line fatigue-calc-mode-help__line--active" data-fatigue-mode="diagnostic" data-i18n="fatigue.helpCalcModeDiagnosticHtml" data-i18n-html><strong>Diagn\u00f3stico:</strong> \u03c3_m y \u03c3_a \u2192 factores de seguridad.</p>
                </div>
              </div>
              <div class="lab-field">
                <label for="ftLoadType" data-i18n="fatigue.labelLoadType">Tipo de carga</label>
                <select id="ftLoadType">
                  <option value="bending" selected data-i18n="fatigue.optBending">Flexi\u00f3n rotativa</option>
                  <option value="axial" data-i18n="fatigue.optAxial">Axial</option>
                  <option value="torsion" data-i18n="fatigue.optTorsion">Torsi\u00f3n</option>
                  <option value="combined" data-i18n="fatigue.optCombined">Combinada</option>
                </select>
                <p class="lab-field-help" data-i18n="fatigue.helpLoadTypeHtml" data-i18n-html>Informativo; introduzca \u03c3_m y \u03c3_a equivalentes.</p>
              </div>
              <div class="lab-field">
                <label for="ftSigmaM" data-i18n="fatigue.labelSigmaM">Tensi\u00f3n media \u03c3_m (MPa)</label>
                <input inputmode="decimal" id="ftSigmaM" type="number" min="0" value="80" />
                <p class="lab-field-help" data-i18n="fatigue.helpSigmaMHtml" data-i18n-html><strong>\u03c3_m</strong> en la secci\u00f3n cr\u00edtica.</p>
              </div>
              <div class="lab-field" id="ftSigmaAField">
                <label for="ftSigmaA" data-i18n="fatigue.labelSigmaA">Tensi\u00f3n alternante \u03c3_a (MPa)</label>
                <input inputmode="decimal" id="ftSigmaA" type="number" min="0" value="120" />
                <span class="hint" data-i18n="fatigue.hintSigmaADesign">Opcional en dise\u00f1o</span>
                <p class="lab-field-help" data-i18n="fatigue.helpSigmaAHtml" data-i18n-html><strong>\u03c3_a</strong> alternante (MPa).</p>
              </div>
              <div class="lab-field">
                <label for="ftMaterial" data-i18n="fatigue.labelMaterial">Material</label>
                <select id="ftMaterial">
                  <option value="s235" data-i18n="fatigue.optMatS235">Acero S235</option>
                  <option value="s355" selected data-i18n="fatigue.optMatS355">Acero S355</option>
                  <option value="cr42" data-i18n="fatigue.optMatCr42">Acero 42CrMo4</option>
                  <option value="custom" data-i18n="fatigue.optMatCustom">Personalizado</option>
                </select>
                <p class="lab-field-help" data-i18n="fatigue.helpMaterialHtml" data-i18n-html>Rellena <strong>S_u</strong> y <strong>S_y</strong>; personalizado para editar.</p>
              </div>
              <div class="lab-field">
                <label for="ftSu" data-i18n="fatigue.labelSu">Resistencia a tracci\u00f3n S_u (MPa)</label>
                <input inputmode="decimal" id="ftSu" type="number" min="50" value="510" />
                <p class="lab-field-help" data-i18n="fatigue.helpSuHtml" data-i18n-html>S\u2032 \u2248 0,5\u00b7S_u.</p>
              </div>
              <div class="lab-field">
                <label for="ftSy" data-i18n="fatigue.labelSy">L\u00edmite el\u00e1stico S_y (MPa)</label>
                <input inputmode="decimal" id="ftSy" type="number" min="30" value="355" />
                <p class="lab-field-help" data-i18n="fatigue.helpSyHtml" data-i18n-html>Soderberg y fluencia.</p>
              </div>
              <div class="lab-field">
                <label for="ftKa" data-i18n="fatigue.labelKa">Factor acabado K_a</label>
                <input inputmode="decimal" id="ftKa" type="number" step="0.01" min="0.1" max="2" value="0.8" />
                <p class="lab-field-help" data-i18n="fatigue.helpKaHtml" data-i18n-html>Factor de superficie (Marin).</p>
                <table class="lab-catalog-table" style="margin-top:0.45rem">
                  <thead><tr><th data-i18n="fatigue.kaThRa">R_a (\u03bcm)</th><th data-i18n="fatigue.kaThKa">K_a (orient.)</th></tr></thead>
                  <tbody>
                    <tr><td>0,4</td><td data-i18n="fatigue.kaRowGround">Rectificado ~0,9</td></tr>
                    <tr><td>1,6</td><td data-i18n="fatigue.kaRowMachined">Mecanizado ~0,8</td></tr>
                    <tr><td>6,3</td><td data-i18n="fatigue.kaRowHot">Laminado ~0,7</td></tr>
                    <tr><td>12,5</td><td data-i18n="fatigue.kaRowForged">Forjado ~0,6</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="lab-field">
                <label for="ftKb" data-i18n="fatigue.labelKb">Factor tama\u00f1o K_b</label>
                <input inputmode="decimal" id="ftKb" type="number" step="0.01" min="0.1" max="2" value="0.9" />
                <p class="lab-field-help" data-i18n="fatigue.helpKbHtml" data-i18n-html>Factor de tama\u00f1o (0,6\u20131).</p>
              </div>
              <div class="lab-field">
                <label for="ftKc" data-i18n="fatigue.labelKc">Factor confiabilidad K_c</label>
                <input inputmode="decimal" id="ftKc" type="number" step="0.001" min="0.1" max="2" value="0.814" />
                <p class="lab-field-help" data-i18n="fatigue.helpKcHtml" data-i18n-html>0,814 \u2248 99 % fiabilidad.</p>
              </div>
              <div class="lab-field">
                <label for="ftKf" data-i18n="fatigue.labelKf">Factor concentraci\u00f3n K_f</label>
                <input inputmode="decimal" id="ftKf" type="number" step="0.01" min="1" max="6" value="1.5" />
                <p class="lab-field-help" data-i18n="fatigue.helpKfHtml" data-i18n-html>Sobre <strong>\u03c3_a</strong> (entalla, radio, chaveta).</p>
              </div>
              <div class="lab-field">
                <label for="ftKd" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="fatigue.icoKd" data-i18n-attr="title" title="Factor temperatura">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2v12"/><circle cx="12" cy="18" r="4"/>
                    </svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="fatigue.labelKd">Factor temperatura K_d</span>
                </label>
                <input inputmode="decimal" id="ftKd" type="number" step="0.01" min="0.1" max="2" value="1" />
                <span class="hint" data-i18n="fatigue.hintKd">1,0 para T \u2264 70\u00b0C</span>
                <p class="lab-field-help" data-i18n="fatigue.helpKdHtml" data-i18n-html>
                  Factor de temperatura de Shigley: <strong>K_d = 1</strong> para T \u2264 70\u00b0C.
                  A 200\u00b0C \u2248 0,90; a 300\u00b0C \u2248 0,83. Reduce S_e a temperaturas elevadas.
                </p>
              </div>
            </div>
          </div>
          <div class="lab-calc-layout__out lab-calc-layout__out--panel">
            <div class="lab-units-bar" role="group" data-i18n-attrs="aria-label=fatigue.unitsAriaLabel data-lab-convert-title=fatigue.convertTitle data-lab-convert-tip=fatigue.convertTip" aria-label="Unidades de tensi\u00f3n" data-lab-convert-categories="pressure" data-lab-convert-title="Conversor (fatiga)" data-lab-convert-tip="Tensiones en MPa o ksi.">
              <span class="lab-units-bar__title" data-i18n="fatigue.unitsBarTitle">C\u00f3mo ver las tensiones</span>
              <label class="lab-units-bar__field">
                <span class="lab-units-bar__lbl" data-i18n="fatigue.lblPressure">Tensi\u00f3n</span>
                <select id="labUnitPressure" class="lab-units-bar__select">
                  <option value="MPa" data-i18n="fatigue.optMpa">MPa</option>
                  <option value="ksi" data-i18n="fatigue.optKsi">ksi</option>
                </select>
              </label>
            </div>
            <div id="ftHero"></div>
            <div id="ftAlerts" class="lab-alerts"></div>
            <div class="lab-results-wrap" id="ftResultsWrap">
              <div class="lab-results-computing" aria-hidden="true">
                <svg class="lab-gear-spin" viewBox="0 0 64 64" aria-hidden="true"><path fill="#0f766e" d="M32 8l2.2 4.4 4.9-1.3 1.3 4.9 4.4 2.2-2.2 4.4 1.3 4.9-4.9 1.3-2.2 4.4-4.4-2.2-4.9 1.3-1.3-4.9-4.4-2.2 2.2-4.4-1.3-4.9 4.9-1.3 4.4-2.2zm0 10a14 14 0 100 28 14 14 0 000-28z"/></svg>
                <span class="lab-results-computing__label" data-i18n="fatigue.recalculating">Recalculando</span>
              </div>
              <details class="lab-results-details lab-results-details--chevron-end lab-results-details--stacked">
                <summary data-i18n="fatigue.summaryFull">Resultado completo</summary>
                <div class="lab-results" id="ftResults"></div>
              </details>
              <div class="lab-results-actions">
                <button type="button" class="lab-btn lab-btn--block" id="ftCopyResults" data-i18n="fatigue.copyResults">Copiar resultados</button>
              </div>
            </div>
            <div class="lab-results-share lab-results-share--footer" id="ftShareLinkWrap" aria-live="polite">
              <button type="button" class="lab-btn lab-btn--text" id="ftCopyLinkBtn" data-i18n="fatigue.copyLink">Copiar enlace</button>
              <div class="lab-copy-toast" id="ftCopyToast" role="status" data-i18n="fatigue.copyToast">\u00a1Enlace copiado!</div>
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
    <script type="module" src="js/ui/calcFatiguePage.js"></script>
    <script type="module" src="js/ui/labDonationFooter.js"></script>
  </body>
</html>
`;

fs.writeFileSync(out, html, 'utf8');
console.log('Wrote', out);
