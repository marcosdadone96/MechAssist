/**
 * Regenera extruder.html en UTF-8 (texto ES desde extruderEs.js; evita mojibake).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'extruder.html');
const esPath = path.join(root, 'js/lab/i18n/pages/extruderEs.js');

const esSrc = fs.readFileSync(esPath, 'utf8').replace('export const EXTRUDER_ES', 'const EXTRUDER_ES');
/** @type {Record<string, string>} */
const T = vm.runInNewContext(`${esSrc}\nEXTRUDER_ES;`, {}, { filename: esPath });

const html = `<!DOCTYPE html>
<html lang="es" data-tool="extruder">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title data-i18n="ext.docTitle">${T['ext.docTitle']}</title>
    <meta name="description" data-i18n="ext.metaDesc" data-i18n-attr="content" content="${T['ext.metaDesc']}" />
    <link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any" />
    <link rel="icon" href="favicon-32x32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180" />
    <link rel="canonical" href="https://www.themechassist.com/extruder.html" id="mdr-canonical" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.themechassist.com/extruder.html" id="mdr-og-url" />
    <meta property="og:title" data-i18n="ext.ogTitle" data-i18n-attr="content" content="${T['ext.ogTitle']}" />
    <meta property="og:description" data-i18n="ext.ogDesc" data-i18n-attr="content" content="${T['ext.ogDesc']}" />
    <meta property="og:image" content="https://www.themechassist.com/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" data-i18n="ext.twitterTitle" data-i18n-attr="content" content="${T['ext.twitterTitle']}" />
    <link rel="stylesheet" href="css/app.css" />
    <script defer src="js/legal/cookiesAndAnalyticsBoot.js"></script>
  </head>
  <body>
    <div id="fileProtoWarn" class="runtime-error" hidden role="alert"></div>
    <div id="runtimeError" class="runtime-error runtime-error--js" hidden role="alert"></div>
    <script>
      (function () {
        if (location.protocol === 'file:') {
          var el = document.getElementById('fileProtoWarn');
          if (el) {
            el.hidden = false;
            el.textContent =
              'Esta p\\u00e1gina debe abrirse con un servidor HTTP (no con doble clic). En la carpeta del proyecto ejecute: npx --yes serve .';
          }
        }
      })();
    </script>
    <header class="site-nav site-nav--sticky">
      <a class="site-nav__brand" href="index.html" aria-label="Inicio \u2014 TheMechAssist" data-i18n="nav.brandHome" data-i18n-attr="aria-label">
        <img class="site-nav__logo" src="logo-themechassist.svg" width="40" height="40" alt="TheMechAssist" decoding="async" />
        <span class="site-nav__title" aria-hidden="true">The<em>MechAssist</em></span>
      </a>
      <nav class="site-nav__center" data-i18n="aria.siteNav" data-i18n-attr="aria-label">
        <a class="site-nav__link site-nav__link--hub" href="machines-hub.html" data-i18n="nav.hubMachines">M\u00e1quinas</a>
        <a class="site-nav__link site-nav__link--hub" href="transmission-lab.html" data-i18n="nav.hubLab">Laboratorio de transmisi\u00f3n</a>
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
    <main class="app-main app-main--flat-wb">
      <aside class="panel flat-sidebar">
        <header class="flat-sidebar__head">
          <p class="flat-sidebar__eyebrow">TheMechAssist</p>
          <h2 class="flat-sidebar__title" data-i18n="ext.h2">${T['ext.h2']}</h2>
          <p class="machine-calc-notice" role="note" data-i18n="machineHub.indicativeNotice" data-i18n-html>${T['machineHub.indicativeNotice']}</p>
          <details class="flat-sidebar-intro">
            <summary data-i18n="ext.introSummary">${T['ext.introSummary']}</summary>
            <div class="flat-sidebar-intro__body">
              <p class="calc-seo-intro" data-i18n="ext.calcSeoIntro">${T['ext.calcSeoIntro']}</p>
              <p class="flat-sidebar__lead" data-i18n="ext.leadHtml" data-i18n-html>${T['ext.leadHtml']}</p>
            </div>
          </details>
        </header>
        <nav class="lab-next-steps" data-i18n="machineHub.nextStepsAria" data-i18n-attr="aria-label" aria-label="Siguiente paso habitual">
          <h3 class="lab-next-steps__title" data-i18n="machineHub.nextStepsTitle">Siguiente paso habitual</h3>
          <ul class="lab-next-steps__list">
            <li data-i18n="machineHub.nextStepsExtruderLi1Html" data-i18n-html>${T['machineHub.nextStepsExtruderLi1Html']}</li>
            <li data-i18n="machineHub.nextStepsExtruderLi2Html" data-i18n-html>${T['machineHub.nextStepsExtruderLi2Html']}</li>
            <li data-i18n="machineHub.nextStepsExtruderLi3Html" data-i18n-html>${T['machineHub.nextStepsExtruderLi3Html']}</li>
          </ul>
        </nav>
        <section class="flat-ux-panel" aria-labelledby="extUxPresetsTitle">
          <h3 id="extUxPresetsTitle" class="flat-ux-panel__title" data-i18n="machineHub.uxPresetsTitle">Casos reales (un clic)</h3>
          <p class="flat-ux-panel__lead muted" data-i18n="machineHub.uxPresetsLead">${T['machineHub.uxPresetsLead']}</p>
          <div class="flat-ux-preset-row" role="group" data-i18n="ext.presetsGroupAria" data-i18n-attr="aria-label" aria-label="${T['ext.presetsGroupAria']}">
            <button type="button" class="btn-flat-preset" data-ext-preset="hdpe_pipe" data-i18n-attrs="title=ext.presetHdpeTooltip" title="${T['ext.presetHdpeTooltip']}"><span class="btn-flat-preset__name" data-i18n="ext.presetHdpeBtn">${T['ext.presetHdpeBtn']}</span></button>
            <button type="button" class="btn-flat-preset" data-ext-preset="pp_profile" data-i18n-attrs="title=ext.presetPpTooltip" title="${T['ext.presetPpTooltip']}"><span class="btn-flat-preset__name" data-i18n="ext.presetPpBtn">${T['ext.presetPpBtn']}</span></button>
            <button type="button" class="btn-flat-preset" data-ext-preset="hdpe_insitu" data-i18n-attrs="title=ext.presetInsituTooltip" title="${T['ext.presetInsituTooltip']}"><span class="btn-flat-preset__name" data-i18n="ext.presetInsituBtn">${T['ext.presetInsituBtn']}</span></button>
          </div>
        </section>
        <details class="flat-accordion">
          <summary class="flat-accordion__summary"><span class="flat-accordion__icon" aria-hidden="true">\u25c7</span><span class="flat-accordion__label" data-i18n="ext.accScrew">${T['ext.accScrew']}</span></summary>
          <div class="flat-accordion__body field-grid field-grid--essential">
            <div class="field"><label for="extD" data-i18n="ext.labelDHtml" data-i18n-html>${T['ext.labelDHtml']}</label><div class="flat-field__num"><input inputmode="decimal" id="extD" type="number" step="0.1" min="10" max="500" value="45" /><span class="field-hint">mm</span></div><p class="field-context muted">T\u00edp. 25\u2013150 mm en industrial</p></div>
            <div class="field"><label for="extLD" data-i18n="ext.labelLDHtml" data-i18n-html>${T['ext.labelLDHtml']}</label><input inputmode="decimal" id="extLD" type="number" step="0.5" min="10" max="40" value="25" /><p class="field-context muted">T\u00edp. 20\u201330; &gt;30 para compuestos</p></div>
            <div class="field"><label for="extH" data-i18n="ext.labelHHtml" data-i18n-html>${T['ext.labelHHtml']}</label><div class="flat-field__num"><input inputmode="decimal" id="extH" type="number" step="0.1" min="0.5" max="20" value="3.5" /><span class="field-hint">mm</span></div><p class="field-context muted">T\u00edp. h \u2248 0,05\u20130,10 \u00d7 D</p></div>
            <div class="field"><label for="extPhi" data-i18n="ext.labelPhiHtml" data-i18n-html>${T['ext.labelPhiHtml']}</label><div class="flat-field__num"><input inputmode="decimal" id="extPhi" type="number" step="0.1" min="5" max="35" value="17.7" /><span class="field-hint">\u00b0</span></div><p class="field-context muted">Est\u00e1ndar: 17,7\u00b0 (paso = D)</p></div>
          </div>
        </details>
        <details class="flat-accordion">
          <summary class="flat-accordion__summary"><span class="flat-accordion__icon" aria-hidden="true">\u25c7</span><span class="flat-accordion__label" data-i18n="ext.accOperation">${T['ext.accOperation']}</span></summary>
          <div class="flat-accordion__body field-grid field-grid--essential">
            <div class="field"><label for="extN" data-i18n="ext.labelNHtml" data-i18n-html>${T['ext.labelNHtml']}</label><div class="flat-field__num"><input inputmode="numeric" id="extN" type="number" step="1" min="1" max="500" value="60" placeholder="ej. 20\u2013120 RPM" /><span class="field-hint">RPM</span></div><p class="field-context muted">T\u00edp. 20\u2013120 RPM</p></div>
            <div class="field"><label for="extTb" data-i18n="ext.labelTbHtml" data-i18n-html>${T['ext.labelTbHtml']}</label><div class="flat-field__num"><input inputmode="decimal" id="extTb" type="number" step="5" min="100" max="320" value="200" /><span class="field-hint">\u00b0C</span></div><p class="field-context muted">HDPE: 180\u2013240 \u00b0C \u00b7 PP: 200\u2013260 \u00b0C</p></div>
          </div>
        </details>
        <details class="flat-accordion">
          <summary class="flat-accordion__summary"><span class="flat-accordion__icon" aria-hidden="true">\u25c7</span><span class="flat-accordion__label" data-i18n="ext.accMaterial">${T['ext.accMaterial']}</span></summary>
          <div class="flat-accordion__body field-grid field-grid--essential">
            <div class="field"><label for="extMaterial" data-i18n="ext.labelMaterialHtml" data-i18n-html>${T['ext.labelMaterialHtml']}</label><select id="extMaterial" name="extMaterial"><option value="hdpe" selected data-i18n="ext.optHdpe">${T['ext.optHdpe']}</option><option value="ldpe" data-i18n="ext.optLdpe">${T['ext.optLdpe']}</option><option value="pp" data-i18n="ext.optPp">${T['ext.optPp']}</option><option value="abs" data-i18n="ext.optAbs">${T['ext.optAbs']}</option><option value="pvc" data-i18n="ext.optPvc">${T['ext.optPvc']}</option><option value="custom" data-i18n="ext.optCustom">${T['ext.optCustom']}</option></select><span class="field-hint" data-i18n="ext.hintMaterial">${T['ext.hintMaterial']}</span></div>
            <div class="field"><label for="extK" data-i18n="ext.labelKHtml" data-i18n-html>${T['ext.labelKHtml']}</label><div class="flat-field__num"><input inputmode="decimal" id="extK" type="number" step="100" min="10" max="100000" value="7000" /><span class="field-hint">Pa\u00b7s<sup>n</sup></span></div></div>
            <div class="field"><label for="extN_idx" data-i18n="ext.labelNidxHtml" data-i18n-html>${T['ext.labelNidxHtml']}</label><input inputmode="decimal" id="extN_idx" type="number" step="0.01" min="0.1" max="1.0" value="0.45" /><p class="field-context muted">T\u00edp. 0,30\u20130,70 en termopl\u00e1sticos</p></div>
            <div class="field"><label for="extRho" data-i18n="ext.labelRhoHtml" data-i18n-html>${T['ext.labelRhoHtml']}</label><div class="flat-field__num"><input inputmode="decimal" id="extRho" type="number" step="10" min="600" max="1500" value="760" /><span class="field-hint">kg/m\u00b3</span></div><p class="field-context muted">Fundido: HDPE ~760, PP ~750, LDPE ~730</p></div>
          </div>
        </details>
        <details class="flat-accordion">
          <summary class="flat-accordion__summary"><span class="flat-accordion__icon" aria-hidden="true">\u25c7</span><span class="flat-accordion__label" data-i18n="ext.accDie">${T['ext.accDie']}</span></summary>
          <div class="flat-accordion__body field-grid field-grid--essential">
            <div class="field"><label for="extDieType" data-i18n="ext.labelDieTypeHtml" data-i18n-html>${T['ext.labelDieTypeHtml']}</label><select id="extDieType" name="extDieType"><option value="circular" selected data-i18n="ext.optDieCircular">${T['ext.optDieCircular']}</option><option value="annular" data-i18n="ext.optDieAnnular">${T['ext.optDieAnnular']}</option></select></div>
            <div class="field"><label for="extDieD" data-i18n="ext.labelDieDHtml" data-i18n-html>${T['ext.labelDieDHtml']}</label><div class="flat-field__num"><input inputmode="decimal" id="extDieD" type="number" step="0.1" min="1" max="200" value="20" /><span class="field-hint">mm</span></div></div>
            <div class="field"><label for="extDieL" data-i18n="ext.labelDieLHtml" data-i18n-html>${T['ext.labelDieLHtml']}</label><div class="flat-field__num"><input inputmode="decimal" id="extDieL" type="number" step="1" min="1" max="500" value="80" /><span class="field-hint">mm</span></div><p class="field-context muted">Rel. L/D boquilla t\u00edpica: 10\u201330</p></div>
            <div class="field" id="extDieDiRow" hidden><label for="extDieDi" data-i18n="ext.labelDieDiHtml" data-i18n-html>${T['ext.labelDieDiHtml']}</label><div class="flat-field__num"><input inputmode="decimal" id="extDieDi" type="number" step="0.1" min="0.5" max="150" value="10" /><span class="field-hint">mm</span></div></div>
          </div>
        </details>
        <details class="flat-accordion">
          <summary class="flat-accordion__summary"><span class="flat-accordion__icon" aria-hidden="true">\u25c7</span><span class="flat-accordion__label" data-i18n="ext.accDriveHtml" data-i18n-html>${T['ext.accDriveHtml']}</span></summary>
          <div class="flat-accordion__body">
            <div id="extProDriveWrap" class="pro-install-wrap pro-install-wrap--locked">
              <p id="extProDriveTeaser" class="pro-install-teaser" data-i18n="ext.proTeaserHtml" data-i18n-html>${T['ext.proTeaserHtml']}</p>
              <div id="extProDriveFields" class="field-grid field-grid--essential">
                <div class="field"><label for="extLoadDuty" data-i18n="ext.labelLoadDutyHtml" data-i18n-html>${T['ext.labelLoadDutyHtml']}</label><select id="extLoadDuty" name="extLoadDuty"><option value="uniform" data-i18n="ext.optDutyUniform">${T['ext.optDutyUniform']}</option><option value="moderate" selected data-i18n="ext.optDutyModerate">${T['ext.optDutyModerate']}</option><option value="heavy" data-i18n="ext.optDutyHeavy">${T['ext.optDutyHeavy']}</option></select></div>
                <div class="field"><label for="extServiceFactor" data-i18n="ext.labelSFHtml" data-i18n-html>${T['ext.labelSFHtml']}</label><input inputmode="decimal" id="extServiceFactor" type="number" step="0.05" min="1" max="3" value="1.35" /></div>
                <div class="field"><label for="extDailyHours" data-i18n="ext.labelDailyHoursHtml" data-i18n-html>${T['ext.labelDailyHoursHtml']}</label><input id="extDailyHours" type="number" step="0.5" min="0.5" max="24" value="16" /><span class="field-hint">h/d\u00eda</span></div>
              </div>
            </div>
          </div>
        </details>
        <div id="extDesignAlerts" class="design-alerts" aria-live="polite"></div>
        <button type="button" class="btn-calc" id="btnExtCalc" data-i18n="ext.btnCalc" data-i18n-attrs="title=ext.btnCalcTitle" title="${T['ext.btnCalcTitle']}">${T['ext.btnCalc']}</button>
        <p class="calc-hint" data-i18n="ext.calcHint">${T['ext.calcHint']}</p>
      </aside>
      <div class="flat-stage layout-right">
        <section class="panel flat-dashboard">
          <header class="flat-dashboard__head">
            <h2 class="flat-dashboard__title" data-i18n="ext.resultsTitleHtml" data-i18n-html>${T['ext.resultsTitleHtml']}</h2>
            <p class="flat-dashboard__lead muted" data-i18n="ext.resultsLead">${T['ext.resultsLead']}</p>
          </header>
          <section class="flat-scope-panel" aria-labelledby="extScopeTitle">
            <h3 id="extScopeTitle" class="flat-scope-panel__title" data-i18n="ext.scopeTitle">${T['ext.scopeTitle']}</h3>
            <p class="flat-scope-panel__intro muted" data-i18n="ext.scopeIntro">${T['ext.scopeIntro']}</p>
            <ul class="flat-scope-panel__list">
              <li data-i18n="ext.scopeLi1">${T['ext.scopeLi1']}</li>
              <li data-i18n="ext.scopeLi2">${T['ext.scopeLi2']}</li>
              <li data-i18n="ext.scopeLi3">${T['ext.scopeLi3']}</li>
              <li data-i18n="ext.scopeLi4">${T['ext.scopeLi4']}</li>
            </ul>
          </section>
          <div class="results-grid" id="extResultsGrid"></div>
          <div id="extMotorRulerMount" hidden></div>
          <div class="flat-diagram-wrap" id="extDiagramWrap">
            <p class="flat-diagram-wrap__title" data-i18n="ext.diagTitle">${T['ext.diagTitle']}</p>
            <svg id="extDiagram" viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg" data-i18n="ext.diagAriaLabel" data-i18n-attr="aria-label" aria-label="${T['ext.diagAriaLabel']}"></svg>
            <p class="flat-diagram-caption" data-i18n="ext.diagCaptionHtml" data-i18n-html>${T['ext.diagCaptionHtml']}</p>
          </div>
          <section class="flat-rfq-panel" aria-labelledby="extRfqTitle">
            <h3 id="extRfqTitle" class="flat-rfq-panel__title" data-i18n="ext.rfqTitle">${T['ext.rfqTitle']}</h3>
            <p class="flat-rfq-panel__lead muted" data-i18n="ext.rfqLead">${T['ext.rfqLead']}</p>
            <div class="flat-rfq-panel__actions">
              <button type="button" id="extRfqCopyText" class="button button--secondary flat-rfq-panel__btn" data-i18n="ext.rfqBtnText" data-i18n-attrs="title=ext.rfqBtnTextTitle" title="${T['ext.rfqBtnTextTitle']}">${T['ext.rfqBtnText']}</button>
              <button type="button" id="extRfqCopyCsv" class="button button--ghost flat-rfq-panel__btn" data-i18n="ext.rfqBtnCsv" data-i18n-attrs="title=ext.rfqBtnCsvTitle" title="${T['ext.rfqBtnCsvTitle']}">${T['ext.rfqBtnCsv']}</button>
            </div>
          </section>
        </section>
        <section class="panel">
          <details class="motors-details">
            <summary class="motors-details__summary">
              <span class="motors-details__summary-main">
                <span class="panel-icon">\u2317</span>
                <span class="motors-details__text">
                  <span class="motors-details__title" data-i18n="ext.engTitle">${T['ext.engTitle']}</span>
                  <span class="motors-details__hint" data-i18n="ext.engHint">${T['ext.engHint']}</span>
                </span>
              </span>
            </summary>
            <div class="motors-details__body"><div id="extEngineeringReport" class="eng-report"></div></div>
          </details>
        </section>
        <section class="panel" id="ext-assumptions">
          <details class="motors-details result-focus-extra">
            <summary class="motors-details__summary">
              <span class="motors-details__summary-main">
                <span class="panel-icon">\u203b</span>
                <span class="motors-details__text">
                  <span class="motors-details__title" data-i18n="machineHub.assumptionsTitle">Hip\u00f3tesis del modelo</span>
                  <span class="motors-details__hint" data-i18n="machineHub.assumptionsHint">Supuestos y l\u00edmites del c\u00e1lculo</span>
                </span>
              </span>
            </summary>
            <div class="motors-details__body"><ul class="assumptions" id="extAssumptionsList"></ul></div>
          </details>
        </section>
        <section class="panel">
          <h2 data-i18n="ext.pdfExportH2Html" data-i18n-html>${T['ext.pdfExportH2Html']}</h2>
          <div id="premiumPdfExportMount" class="premium-pdf-mount"></div>
        </section>
        <div id="extPremiumOptBlock"></div>
      </div>
    </main>
    <script>
      globalThis.__SUPABASE_URL__ = 'https://ytdtsqxhqfuzzcblidiy.supabase.co';
      globalThis.__SUPABASE_ANON_KEY__ = 'sb_publishable_HQqMGXjb5zO1Jp_Hn9eXmA_NA0Htl41';
    </script>
    <script type="module" src="js/ui/homeI18n.js"></script>
    <script type="module" src="js/ui/hubFreemium.js"></script>
    <script type="module" src="js/ui/extruderAppEntry.js"></script>
  </body>
</html>
`;

fs.writeFileSync(out, html, 'utf8');
console.log('Wrote', out);
