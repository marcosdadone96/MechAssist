/**
 * Generate calc-hydraulic-accumulator.html (UTF-8 safe).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'calc-hydraulic-accumulator.html');

const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" data-i18n="hacc.metaDesc" data-i18n-attr="content" content="Dimensionado orientativo de acumuladores hidr\u00e1ulicos: volumen nominal, energ\u00eda almacenada y tiempo de descarga." />
    <title data-i18n="hacc.docTitle">Acumulador hidr\u00e1ulico \u2014 volumen, energ\u00eda y descarga \u2014 TheMechAssist</title>
    <link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any" />
    <link rel="icon" href="favicon-32x32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180" />
    <link rel="canonical" href="https://www.themechassist.com/calc-hydraulic-accumulator.html" id="mdr-canonical" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.themechassist.com/calc-hydraulic-accumulator.html" />
    <meta property="og:title" data-i18n="hacc.docTitle" data-i18n-attr="content" content="Acumulador hidr\u00e1ulico \u2014 TheMechAssist" />
    <meta property="og:description" data-i18n="hacc.metaDesc" data-i18n-attr="content" content="Volumen nominal, energ\u00eda y descarga." />
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
        <a class="site-nav__link site-nav__link--hub" href="fluids-hub.html" data-i18n="nav.hubFluids">Hidr\u00e1ulica</a>
        <a class="site-nav__link site-nav__link--hub" href="transmission-lab.html" data-i18n="nav.hubLab">Laboratorio de transmisi\u00f3n</a>
        <a class="site-nav__link site-nav__link--hub" href="machines-hub.html" data-i18n="nav.hubMachines">M\u00e1quinas</a>
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
          <h2 data-i18n="hacc.h2">Acumulador hidr\u00e1ulico \u2014 volumen, energ\u00eda y descarga</h2>
          <p class="lab-safety-notice" data-i18n="hacc.safetyNotice">
            C\u00e1lculo orientativo seg\u00fan PED 2014/68/UE e ISO 4413. Verifique con el fabricante y someta a inspecci\u00f3n reglamentaria.
          </p>
          <p class="lab-calc-hero-lead" data-i18n="hacc.heroLead">
            Calcule el volumen nominal necesario, la energ\u00eda almacenada, el caudal de descarga y el tiempo de vaciado para acumuladores de vejiga, \u00e9mbolo o membrana.
          </p>
          <details class="lab-calc-seo">
            <summary data-i18n="hacc.seoSummary">Contexto ampliado y notas de uso</summary>
            <p class="calc-seo-intro" data-i18n="hacc.calcSeoIntro">
              Herramienta de predimensionado para acumuladores oleodin\u00e1micos. Calcula el volumen nominal mediante la ley politr\u00f3pica (isoterma n=1 o adiab\u00e1tica n=1,4), la energ\u00eda almacenada y el perfil de descarga antes de seleccionar la referencia comercial Bosch, Parker o Hydac.
            </p>
          </details>
          <details class="lab-calc-help">
            <summary class="lab-calc-help__summary" data-i18n="hacc.helpSummary">Metodolog\u00eda y l\u00edmites del modelo</summary>
            <div class="lab-calc-help__body">
              <p class="lab-lead lab-lead--in-help" data-i18n="hacc.methodBodyHtml" data-i18n-html>
                Ley politr\u00f3pica: <strong>p\u00b7V\u207f = cte</strong>. Isoterma (n=1): ciclos lentos &gt; 5 min. Adiab\u00e1tica (n=1,4): ciclos r\u00e1pidos &lt; 1 min. Ratio p\u2082/p\u2081 \u2264 4 recomendado; alerta si &gt; 4.
              </p>
            </div>
          </details>
        </header>

        <nav class="lab-next-steps" data-i18n="fluids.nextStepsAccLi_aria" data-i18n-attr="aria-label" aria-label="Siguiente paso habitual">
          <h3 class="lab-next-steps__title" data-i18n="fluids.nextStepsTitle">Siguiente paso habitual</h3>
          <ul class="lab-next-steps__list">
            <li data-i18n="fluids.nextStepsAccLi1Html" data-i18n-html><a href="calc-hydraulic-pump.html">Bomba hidr\u00e1ulica</a> \u2014 caudal de recarga del acumulador.</li>
            <li data-i18n="fluids.nextStepsAccLi2Html" data-i18n-html><a href="calc-hydraulic-cylinder.html">Cilindro hidr\u00e1ulico</a> \u2014 actuador alimentado por el acumulador.</li>
            <li data-i18n="fluids.nextStepsAccLi3Html" data-i18n-html><a href="fluids-hub.html">Hub hidr\u00e1ulica</a> \u2014 m\u00e1s calculadoras.</li>
          </ul>
        </nav>

        <div class="lab-presets-row">
          <span class="lab-presets-row__label" data-i18n="fluids.presetsLabel">Ejemplos t\u00edpicos:</span>
          <div class="lab-presets-bar" id="haPresetsBar"></div>
        </div>

        <div class="lab-calc-layout lab-calc-layout--with-diag lab-calc-layout--panelled fluid-calc fluid-calc--accumulator" data-module="hydraulic-accumulator">
          <div class="lab-calc-layout__diagram">
            <div class="lab-diagram-wrap lab-diagram-wrap--elevated">
              <p class="lab-diagram-wrap__title" data-i18n="hacc.diagTitle">Secci\u00f3n transversal \u00b7 se actualiza con el tipo</p>
              <svg id="haDiagram" xmlns="http://www.w3.org/2000/svg" data-i18n="hacc.diagAriaLabel" data-i18n-attr="aria-label" aria-label="Secci\u00f3n acumulador hidr\u00e1ulico"></svg>
              <p class="lab-diagram-caption" data-i18n="hacc.diagCaption">Esquema orientativo; consulte el manual del fabricante para dimensiones exactas.</p>
            </div>
          </div>

          <div class="lab-calc-layout__inputs lab-calc-layout__inputs--panel">
            <div class="lab-grid lab-grid--2">
              <div class="lab-field lab-field--wide">
                <label for="haCalcMode" data-i18n="hacc.labelCalcMode">Modo de c\u00e1lculo</label>
                <select id="haCalcMode">
                  <option value="design" selected data-i18n="hacc.optDesign">Dise\u00f1o \u2014 volumen \u00fatil necesario \u2192 volumen nominal</option>
                  <option value="diagnostic" data-i18n="hacc.optDiagnostic">Diagn\u00f3stico \u2014 acumulador instalado \u2192 verificar energ\u00eda y descarga</option>
                </select>
                <div class="lab-field-help lab-field-help--hacc-modes" id="haCalcModeHelp">
                  <p class="hp-calc-mode-help__line hp-calc-mode-help__line--active" data-ha-mode="design" data-i18n="hacc.helpCalcModeDesignHtml" data-i18n-html><strong>Dise\u00f1o:</strong> introduzca el volumen \u00fatil requerido y las presiones \u2192 el modelo calcula el volumen nominal m\u00ednimo.</p>
                  <p class="hp-calc-mode-help__line" data-ha-mode="diagnostic" data-i18n="hacc.helpCalcModeDiagnosticHtml" data-i18n-html><strong>Diagn\u00f3stico:</strong> introduzca el volumen nominal instalado \u2192 verifique energ\u00eda almacenada y tiempo de descarga.</p>
                </div>
              </div>

              <div class="lab-field lab-field--wide">
                <label for="haType" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="hacc.icoType" data-i18n-attr="title" title="Tipo de acumulador">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="3"/><path d="M10 9h4M10 15h4"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="hacc.labelType">Tipo de acumulador</span>
                </label>
                <select id="haType">
                  <option value="bladder" selected data-i18n="hacc.optBladder">Vejiga (bladder)</option>
                  <option value="piston" data-i18n="hacc.optPiston">\u00c9mbolo (piston)</option>
                  <option value="diaphragm" data-i18n="hacc.optDiaphragm">Membrana (diaphragm)</option>
                </select>
                <p class="lab-field-help" data-i18n="hacc.helpTypeHtml" data-i18n-html><strong>Vejiga</strong>: respuesta r\u00e1pida, hasta ~350 bar. <strong>\u00c9mbolo</strong>: grandes vol\u00famenes, ciclos lentos. <strong>Membrana</strong>: vol\u00famenes peque\u00f1os, respuesta muy r\u00e1pida.</p>
              </div>

              <div class="lab-field lab-field--wide">
                <label for="haProcess" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="hacc.icoProcess" data-i18n-attr="title" title="Proceso politr\u00f3pico">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18 Q8 6 12 12 Q16 18 20 6"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="hacc.labelProcess">Proceso del gas</span>
                </label>
                <select id="haProcess">
                  <option value="isothermal" selected data-i18n="hacc.optIsothermal">Isotermo (n=1) \u2014 ciclos lentos &gt; 5 min</option>
                  <option value="adiabatic" data-i18n="hacc.optAdiabatic">Adiab\u00e1tico (n=1,4) \u2014 ciclos r\u00e1pidos &lt; 1 min</option>
                </select>
                <p class="lab-field-help" data-i18n="hacc.helpProcessHtml" data-i18n-html>Use <strong>isotermo</strong> para prensas de ciclo largo y <strong>adiab\u00e1tico</strong> para acumuladores de emergencia o suspensi\u00f3n activa.</p>
              </div>

              <div class="lab-field">
                <label for="haP0" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="hacc.icoP0" data-i18n-attr="title" title="Presi\u00f3n precarga N\u2082">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="hacc.labelP0">Presi\u00f3n de precarga N\u2082 \u2014 p\u2080 (bar)</span>
                </label>
                <input inputmode="decimal" id="haP0" type="number" min="1" step="any" value="75" />
                <span class="hint" data-i18n="hacc.hintP0">0,9 \u00d7 p\u2081 t\u00edpico</span>
                <p class="lab-field-help" data-i18n="hacc.helpP0Html" data-i18n-html>La precarga de nitr\u00f3geno debe ser <strong>p\u2080 = 0,85\u20130,9 \u00d7 p\u2081</strong> para evitar que la vejiga toque el fondo a p\u2081.</p>
              </div>

              <div class="lab-field">
                <label for="haP1" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="hacc.icoP1" data-i18n-attr="title" title="Presi\u00f3n m\u00ednima">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M4 20V8l8-4 8 4v12"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="hacc.labelP1">Presi\u00f3n m\u00ednima de trabajo \u2014 p\u2081 (bar)</span>
                </label>
                <input inputmode="decimal" id="haP1" type="number" min="1" step="any" value="100" />
                <span class="hint" data-i18n="hacc.hintP1">Umbral de descarga</span>
                <p class="lab-field-help" data-i18n="hacc.helpP1Html" data-i18n-html>Presi\u00f3n m\u00ednima a la que el sistema acepta fluido del acumulador. Debe ser <strong>p\u2081 &gt; p\u2080</strong>.</p>
              </div>

              <div class="lab-field">
                <label for="haP2" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="hacc.icoP2" data-i18n-attr="title" title="Presi\u00f3n m\u00e1xima">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M8 8h8M9 20h6"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="hacc.labelP2">Presi\u00f3n m\u00e1xima de carga \u2014 p\u2082 (bar)</span>
                </label>
                <input inputmode="decimal" id="haP2" type="number" min="1" step="any" value="200" />
                <span class="hint" data-i18n="hacc.hintP2">Presi\u00f3n bomba</span>
                <p class="lab-field-help" data-i18n="hacc.helpP2Html" data-i18n-html>Presi\u00f3n m\u00e1xima del circuito (tarado de la limitadora). El ratio <strong>p\u2082/p\u2081 \u2264 4</strong> se recomienda para vejiga; alerta si se supera.</p>
              </div>

              <div class="lab-field" id="haDeltaVField">
                <label for="haDeltaV" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="hacc.icoDeltaV" data-i18n-attr="title" title="Volumen \u00fatil">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="8" width="16" height="10" rx="2"/><path d="M9 8V6M15 8V6"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="hacc.labelDeltaV">Volumen \u00fatil requerido \u2014 \u0394V (L)</span>
                </label>
                <input inputmode="decimal" id="haDeltaV" type="number" min="0.01" step="any" value="5" />
                <span class="hint" data-i18n="hacc.hintDeltaV">Caudal \u00d7 tiempo ciclo</span>
                <p class="lab-field-help" data-i18n="hacc.helpDeltaVHtml" data-i18n-html>Volumen de aceite que debe suministrar el acumulador en un ciclo. Ejemplo: 10 L/min \u00d7 30 s = 5 L.</p>
              </div>

              <div class="lab-field" id="haVnomField" hidden>
                <label for="haVnom" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="hacc.icoVnom" data-i18n-attr="title" title="Volumen nominal">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 12h16"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="hacc.labelVnom">Volumen nominal instalado (L)</span>
                </label>
                <select id="haVnom">
                  <option value="1">1 L</option>
                  <option value="2">2 L</option>
                  <option value="4">4 L</option>
                  <option value="6">6 L</option>
                  <option value="10" selected>10 L</option>
                  <option value="16">16 L</option>
                  <option value="20">20 L</option>
                  <option value="32">32 L</option>
                  <option value="50">50 L</option>
                </select>
                <span class="hint" data-i18n="hacc.hintVnom">Serie comercial Hydac / Parker</span>
                <p class="lab-field-help" data-i18n="hacc.helpVnomHtml">Tama\u00f1os nominales de la serie comercial est\u00e1ndar.</p>
              </div>

              <div class="lab-field">
                <label for="haTempC" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n="hacc.icoTemp" data-i18n-attr="title" title="Temperatura">
                    <svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v12"/><circle cx="12" cy="18" r="4"/></svg>
                  </span>
                  <span class="lab-field__label-text" data-i18n="hacc.labelTemp">Temperatura de trabajo (\u00b0C)</span>
                </label>
                <input inputmode="decimal" id="haTempC" type="number" min="-20" max="150" step="any" value="40" />
                <span class="hint" data-i18n="hacc.hintTemp">\u221220 a 150 \u00b0C</span>
                <p class="lab-field-help" data-i18n="hacc.helpTempHtml" data-i18n-html>Afecta a la densidad del aceite y a la expansi\u00f3n del nitr\u00f3geno (correcci\u00f3n de Boyle\u2013Charles en modo proyecto).</p>
              </div>
            </div>
          </div>

          <div class="lab-calc-layout__out lab-calc-layout__out--panel">
            <div class="lab-units-bar" role="group" data-i18n-attrs="aria-label=fluids.unitsAriaLabel" aria-label="Unidades de resultado" data-lab-convert-categories="pressure">
              <span class="lab-units-bar__title" data-i18n="fluids.unitsBarTitle">C\u00f3mo ver los resultados</span>
              <label class="lab-units-bar__field">
                <span class="lab-units-bar__lbl" data-i18n="fluids.lblPressure">Presi\u00f3n</span>
                <select id="labUnitPressure" class="lab-units-bar__select">
                  <option value="bar" data-i18n="fluids.optBar">bar</option>
                  <option value="mpa" data-i18n="fluids.optMpa">MPa</option>
                  <option value="psi" data-i18n="fluids.optPsi">psi</option>
                </select>
              </label>
              <label class="lab-units-bar__field">
                <span class="lab-units-bar__lbl" data-i18n="fluids.lblVolume">Volumen</span>
                <select id="labUnitVolume" class="lab-units-bar__select">
                  <option value="L" data-i18n="fluids.optLitres">L</option>
                  <option value="gal" data-i18n="fluids.optGal">gal (US)</option>
                </select>
              </label>
            </div>

            <details class="lab-fluid-formulas" id="haFormulasBlock">
              <summary data-i18n="hacc.formulasSummary">Memoria de c\u00e1lculo y supuestos</summary>
              <div id="haFormulaBody" class="lab-fluid-formulas__body"></div>
            </details>

            <div id="haResults" class="lab-results"></div>
            <div id="haAdvisor" class="lab-alerts"></div>
            <div id="haVerdictSummary" class="hc-verdict-summary" aria-live="polite"></div>
            <p id="haVerdict" class="lab-verdict lab-verdict--ok"></p>

            <div class="lab-results-actions">
              <button type="button" class="lab-btn lab-btn--block" id="haCopyResults" data-i18n="hacc.copyResults">Copiar resultados</button>
            </div>
            <div class="lab-results-share lab-results-share--footer" id="haShareLinkWrap" aria-live="polite">
              <button type="button" class="lab-btn lab-btn--text" id="haCopyLinkBtn" data-i18n="hacc.copyLink">Copiar enlace</button>
              <span class="lab-copy-toast" id="haCopyLinkToast" role="status" data-i18n="hacc.linkCopied">\u00a1Enlace copiado!</span>
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
    <script type="module" src="js/ui/hydraulicAccumulatorPage.js"></script>
    <script type="module" src="js/ui/labDonationFooter.js"></script>
  </body>
</html>
`;

fs.writeFileSync(out, html, 'utf8');
console.log('wrote', out);
