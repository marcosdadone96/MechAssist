/**
 * Regenera calc-pneumatic-compressor.html en UTF-8 (evita mojibake de PowerShell).
 */
import fs from 'fs';

const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" data-i18n="comp.metaDesc" data-i18n-attr="content" content="Dimensionado orientativo de compresores neum\u00e1ticos: caudal corregido, potencia, motor IEC y calder\u00edn." />
    <title data-i18n="comp.docTitle">Compresor neum\u00e1tico \u2014 dimensionado \u2014 TheMechAssist</title>
    <link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any" />
    <link rel="icon" href="favicon-32x32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180" />
    <link rel="canonical" href="https://www.themechassist.com/calc-pneumatic-compressor.html" id="mdr-canonical" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.themechassist.com/calc-pneumatic-compressor.html" />
    <meta property="og:title" data-i18n="comp.docTitle" data-i18n-attr="content" content="Compresor neum\u00e1tico \u2014 TheMechAssist" />
    <meta property="og:description" data-i18n="comp.metaDesc" data-i18n-attr="content" content="Caudal, potencia, motor IEC y calder\u00edn." />
    <meta property="og:image" content="https://www.themechassist.com/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/lab.css" />
    <script defer src="js/legal/cookiesAndAnalyticsBoot.js"></script>
    <style>
      .pc-more-details { grid-column: 1 / -1; margin-top: 0.5rem; border: 1px solid #cbd5e1; border-radius: 10px; background: #fff; overflow: hidden; }
      .pc-more-details > summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; padding: 0.58rem 0.75rem; background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border-bottom: 1px solid #e2e8f0; }
      .pc-more-details > summary::-webkit-details-marker { display: none; }
      .pc-more-details > summary::before { content: '\\25B8'; font-size: 0.92rem; color: #0f766e; }
      .pc-more-details[open] > summary::before { content: '\\25BE'; }
      .pc-more-details__title { font-size: 0.9rem; font-weight: 800; color: #0f172a; }
      .pc-more-details__hint { font-size: 0.72rem; color: #64748b; font-weight: 600; }
      .pc-more-details__body { padding: 0.65rem 0.75rem; font-size: 0.8rem; line-height: 1.5; color: #334155; }
      .pc-verdict-summary { display: grid; gap: 0.5rem; margin: 0.75rem 0 0.35rem; padding: 0.65rem 0.75rem; border-radius: 12px; border: 1px solid #e2e8f0; background: linear-gradient(165deg, #ffffff 0%, #f8fafc 100%); }
      .pc-verdict-summary__title { font-size: 0.72rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; }
      .pc-vs-item { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.82rem; line-height: 1.35; }
      .pc-vs-ico { flex-shrink: 0; font-weight: 800; font-size: 1rem; }
      .pc-vs-item--ok .pc-vs-ico { color: #059669; }
      .pc-vs-item--info .pc-vs-ico { color: #0369a1; }
      .pc-vs-label { font-weight: 800; color: #0f172a; }
      .pc-vs-sub { font-size: 0.76rem; color: #64748b; font-weight: 600; margin-top: 0.12rem; }
      .comp-eff-badge { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.35rem 0.65rem; padding: 0.4rem 0.55rem; border-radius: 8px; margin-bottom: 0.25rem; }
      .comp-eff-badge--good { background: #ecfdf5; border: 1px solid #6ee7b7; }
      .comp-eff-badge--warn { background: #fffbeb; border: 1px solid #fcd34d; }
      .comp-eff-badge--bad { background: #fef2f2; border: 1px solid #fca5a5; }
      .comp-eff-badge__label { font-weight: 900; font-size: 0.78rem; letter-spacing: 0.04em; }
      .comp-eff-badge--good .comp-eff-badge__label { color: #047857; }
      .comp-eff-badge--warn .comp-eff-badge__label { color: #b45309; }
      .comp-eff-badge--bad .comp-eff-badge__label { color: #b91c1c; }
      .comp-eff-badge__hint { font-size: 0.72rem; color: #64748b; font-weight: 600; }
      .comp-section-label { grid-column: 1 / -1; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; color: #0f766e; margin: 0.35rem 0 0; padding-bottom: 0.2rem; border-bottom: 1px solid #e2e8f0; }
      .lab-field--auto input[readonly] { background: #f1f5f9; border-color: #cbd5e1; }
      .comp-help-table { width: 100%; border-collapse: collapse; font-size: 0.72rem; margin: 0.5rem 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
      .comp-help-table th, .comp-help-table td { padding: 0.35rem 0.45rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
      .comp-help-table th { background: #f8fafc; font-weight: 800; color: #334155; }
    </style>
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
          <h2 data-i18n="comp.h2">Compresor neum\u00e1tico \u2014 caudal, potencia y calder\u00edn</h2>
          <p class="lab-safety-notice" data-i18n="comp.safetyNotice">C\u00e1lculo orientativo para pre-dimensionado. Confirme con curvas del fabricante, condiciones ambientales y normativa aplicable (ISO 8573 / ISO 1219).</p>
          <p class="lab-calc-hero-lead" data-i18n="comp.heroLead">Demanda de aire corregida, relaci\u00f3n de compresi\u00f3n, potencia en el eje y motor IEC (modelo isot\u00e9rmico) y volumen m\u00ednimo de calder\u00edn (m\u00e9todo de ciclo y regla pr\u00e1ctica).</p>
          <details class="lab-calc-seo">
            <summary data-i18n="comp.seoSummary">Contexto ampliado y notas de uso</summary>
            <p class="calc-seo-intro" data-i18n="comp.seoIntro">Herramienta para compresores de pist\u00f3n, tornillo y paletas en instalaciones industriales t\u00edpicas. Incluye factores de simultaneidad y fugas, rendimiento volum\u00e9trico y estimaci\u00f3n isot\u00e9rmica de potencia antes de elegir el equipo comercial.</p>
          </details>
          <details class="lab-calc-help">
            <summary class="lab-calc-help__summary" data-i18n="comp.helpSummary">Metodolog\u00eda y l\u00edmites del modelo</summary>
            <div class="lab-calc-help__body">
              <p class="lab-lead lab-lead--in-help" data-i18n="comp.methodBodyHtml" data-i18n-html>Potencia isot\u00e9rmica ideal <strong>P<sub>iso</sub> = Q\u00b7p<sub>asp</sub>\u00b7ln(r)</strong> con Q en m\u00b3/s y p<sub>asp</sub> en Pa. La potencia en el eje divide por \u03b7<sub>iso</sub> y rendimiento mec\u00e1nico; el motor a\u00f1ade 15 % de factor de servicio y redondeo a kW IEC. Calder\u00edn: m\u00e9todo de ciclo y <strong>V \u2248 Q<sub>Nl</sub>/10</strong> L \u2014 usar el mayor.</p>
            </div>
          </details>
        </header>
        <div class="lab-presets-row">
          <span class="lab-presets-row__label" data-i18n="fluids.presetsLabel">Ejemplos t\u00edpicos:</span>
          <div class="lab-presets-bar" id="compPresetsBar"></div>
        </div>
        <div class="lab-calc-layout lab-calc-layout--with-diag lab-calc-layout--panelled fluid-calc fluid-calc--compressor">
          <div class="lab-calc-layout__diagram">
            <div class="lab-diagram-wrap lab-diagram-wrap--elevated">
              <p class="lab-diagram-wrap__title" data-i18n="comp.diagTitle">Esquema t\u00edpico de aire comprimido</p>
              <svg id="compDiagram" xmlns="http://www.w3.org/2000/svg" data-i18n="comp.diagramSvgAria" data-i18n-attr="aria-label" aria-label="Esquema: filtro, compresor, calder\u00edn, secador y red"></svg>
              <p class="lab-diagram-caption" data-i18n="comp.diagCaption">No a escala. Confirme filtraci\u00f3n, secado y seguridad seg\u00fan fabricante.</p>
            </div>
          </div>
          <div class="lab-calc-layout__inputs lab-calc-layout__inputs--panel">
            <div class="lab-grid lab-grid--2" id="compCalcForm" data-calc-slug="pneumatic-compressor">
              <h3 class="comp-section-label" data-i18n="comp.sectionDemand">Demanda de aire</h3>
              <div class="lab-field">
                <label for="compQDem" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipQDem"><svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h12"/><path d="M14 8l4 4-4 4"/></svg></span>
                  <span class="lab-field__label-text" data-i18n="comp.labelQDem">Caudal demandado Q_dem</span>
                </label>
                <input inputmode="decimal" id="compQDem" type="number" min="1" step="any" value="200" />
                <span class="hint" data-i18n="comp.hintQDem">Suma de consumidores en servicio</span>
                <p class="lab-field-help" data-i18n="comp.helpQDem">Introduzca el caudal total de aire libre antes de simultaneidad y fugas.</p>
              </div>
              <div class="lab-field">
                <label for="compQUnit" data-i18n="comp.labelQUnit">Unidad de caudal</label>
                <select id="compQUnit">
                  <option value="nlmin" selected data-i18n="comp.optNlMin">Nl/min (litros normales)</option>
                  <option value="m3min" data-i18n="comp.optM3Min">m\u00b3/min</option>
                </select>
              </div>
              <div class="lab-field">
                <label for="compPTrabajo" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipPTrabajo"><svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16"/><path d="M8 8h8"/></svg></span>
                  <span class="lab-field__label-text" data-i18n="comp.labelPTrabajo">Presi\u00f3n de trabajo p_trabajo (bar)</span>
                </label>
                <input inputmode="decimal" id="compPTrabajo" type="number" min="0.5" step="any" value="6" />
                <span class="hint" data-i18n="comp.hintPTrabajo">En el consumidor m\u00e1s desfavorable</span>
                <p class="lab-field-help" data-i18n="comp.helpPTrabajo">Presi\u00f3n manom\u00e9trica m\u00ednima garantizada en el punto de uso.</p>
              </div>
              <div class="lab-field">
                <label for="compPRed" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipPRed"><svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16"/></svg></span>
                  <span class="lab-field__label-text" data-i18n="comp.labelPRed">Presi\u00f3n de red p_red (bar)</span>
                </label>
                <input inputmode="decimal" id="compPRed" type="number" min="1" step="any" value="7" />
                <span class="hint" data-i18n="comp.hintPRed">Salida compresor / cabezal</span>
                <p class="lab-field-help" data-i18n="comp.helpPRed">Debe ser \u2265 p_trabajo (habitualmente +0,5 a 1 bar de margen).</p>
              </div>
              <div class="lab-field">
                <label for="compFSim" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipFSim">?</span>
                  <span class="lab-field__label-text" data-i18n="comp.labelFSim">Factor de simultaneidad f_sim</span>
                </label>
                <input inputmode="decimal" id="compFSim" type="number" min="0.01" max="1" step="any" value="0.7" />
                <span class="hint" data-i18n="comp.hintFSim">0 \u2013 1</span>
                <p class="lab-field-help" data-i18n="comp.helpFSim">Fracci\u00f3n de consumidores activos a la vez (0,6\u20130,8 t\u00edpico en planta).</p>
              </div>
              <div class="lab-field">
                <label for="compFFug" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipFFug">?</span>
                  <span class="lab-field__label-text" data-i18n="comp.labelFFug">Factor de fugas f_fug (%)</span>
                </label>
                <input inputmode="decimal" id="compFFug" type="number" min="0" max="80" step="any" value="15" />
                <span class="hint" data-i18n="comp.hintFFug">Porcentaje adicional</span>
                <p class="lab-field-help" data-i18n="comp.helpFFug">10\u201320 % en instalaciones medianas; audite si supera 25 %.</p>
              </div>
              <h3 class="comp-section-label" data-i18n="comp.sectionCompressor">Par\u00e1metros del compresor</h3>
              <div class="lab-field lab-field--wide">
                <label for="compTipo" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipTipo">?</span>
                  <span class="lab-field__label-text" data-i18n="comp.labelTipo">Tipo de compresor</span>
                </label>
                <select id="compTipo">
                  <option value="piston" selected data-i18n="comp.optPiston">Pist\u00f3n alternativo (\u03b7_vol 70\u201380 %)</option>
                  <option value="screw" data-i18n="comp.optScrew">Tornillo rotativo (\u03b7_vol 80\u201392 %)</option>
                  <option value="vane" data-i18n="comp.optVane">Paletas rotativas (\u03b7_vol 70\u201382 %)</option>
                </select>
                <span class="hint" data-i18n="comp.hintTipo">Actualiza \u03b7_vol al cambiar</span>
                <p class="lab-field-help" data-i18n="comp.helpTipo">El tornillo suele ser m\u00e1s eficiente en servicio continuo; el pist\u00f3n en talleres intermitentes.</p>
              </div>
              <div class="lab-field">
                <label for="compEtaVol" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipEtaVol">?</span>
                  <span class="lab-field__label-text" data-i18n="comp.labelEtaVol">Rendimiento volum\u00e9trico \u03b7_vol (%)</span>
                </label>
                <input inputmode="decimal" id="compEtaVol" type="number" min="10" max="100" step="any" value="75" />
                <span class="hint" data-i18n="comp.hintEtaVol">10 \u2013 100 %</span>
                <p class="lab-field-help" data-i18n="comp.helpEtaVol">Relaci\u00f3n entre aire entregado y volumen desplazado en aspiraci\u00f3n.</p>
              </div>
              <div class="lab-field">
                <label for="compNEtapas" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipNEtapas">?</span>
                  <span class="lab-field__label-text" data-i18n="comp.labelNEtapas">N\u00famero de etapas</span>
                </label>
                <select id="compNEtapas">
                  <option value="1" selected data-i18n="comp.opt1Stage">1 etapa</option>
                  <option value="2" data-i18n="comp.opt2Stage">2 etapas</option>
                </select>
                <span class="hint" data-i18n="comp.hintNEtapas">1 o 2</span>
                <p class="lab-field-help" data-i18n="comp.helpNEtapas">Por encima de ~8 bar de relaci\u00f3n total conviene valorar 2 etapas.</p>
              </div>
              <div class="lab-field">
                <label for="compPAsp" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipPAsp">?</span>
                  <span class="lab-field__label-text" data-i18n="comp.labelPAsp">Presi\u00f3n de aspiraci\u00f3n p_asp (bar abs)</span>
                </label>
                <input inputmode="decimal" id="compPAsp" type="number" min="0.5" step="any" value="1.013" />
                <span class="hint" data-i18n="comp.hintPAsp">bar absolutos</span>
                <p class="lab-field-help" data-i18n="comp.helpPAsp">Nivel del mar: 1,013 bar. En altitud, use presi\u00f3n barom\u00e9trica local.</p>
              </div>
              <div class="lab-field">
                <label for="compTAsp" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipTAsp">?</span>
                  <span class="lab-field__label-text" data-i18n="comp.labelTAsp">Temperatura de aspiraci\u00f3n (\u00b0C)</span>
                </label>
                <input inputmode="decimal" id="compTAsp" type="number" step="any" value="20" />
                <span class="hint" data-i18n="comp.hintTAsp">\u00b0C</span>
                <p class="lab-field-help" data-i18n="comp.helpTAsp">Aire ambiente en la toma del compresor.</p>
              </div>
              <h3 class="comp-section-label" data-i18n="comp.sectionEfficiency">Rendimiento isot\u00e9rmico</h3>
              <div class="lab-field">
                <label for="compEtaIso" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipEtaIso">?</span>
                  <span class="lab-field__label-text" data-i18n="comp.labelEtaIso">Rendimiento isot\u00e9rmico \u03b7_iso (%)</span>
                </label>
                <input inputmode="decimal" id="compEtaIso" type="number" min="10" max="100" step="any" value="65" />
                <span class="hint" data-i18n="comp.hintEtaIso">Para potencia en eje</span>
                <p class="lab-field-help" data-i18n="comp.helpEtaIso">Con \u03b7_mec = 92 % fijo en el modelo.</p>
              </div>
              <h3 class="comp-section-label" data-i18n="comp.sectionReceiver">Calder\u00edn (dep\u00f3sito)</h3>
              <div class="lab-field">
                <label for="compTCiclo" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipTCiclo">?</span>
                  <span class="lab-field__label-text" data-i18n="comp.labelTCiclo">Tiempo de ciclo t_ciclo (s)</span>
                </label>
                <input inputmode="decimal" id="compTCiclo" type="number" min="1" step="any" value="30" />
                <span class="hint" data-i18n="comp.hintTCiclo">segundos</span>
                <p class="lab-field-help" data-i18n="comp.helpTCiclo">Tiempo de marcha en un ciclo carga/descarga.</p>
              </div>
              <div class="lab-field lab-field--auto">
                <label for="compDeltaP" class="lab-field__label-row">
                  <span class="lab-field-ico" data-i18n-attrs="title=comp.tipDeltaP">?</span>
                  <span class="lab-field__label-text" data-i18n="comp.labelDeltaP">Banda de presi\u00f3n \u0394p (bar)</span>
                </label>
                <input inputmode="decimal" id="compDeltaP" type="number" min="0.1" step="any" value="1" readonly />
                <label class="lab-checkbox-row" style="margin-top: 0.35rem">
                  <input type="checkbox" id="compDeltaPAuto" checked />
                  <span data-i18n="comp.hintDeltaPAuto">Autom\u00e1tico: p_red \u2212 p_trabajo</span>
                </label>
                <p class="lab-field-help" data-i18n="comp.helpDeltaP">Bandas estrechas aumentan la frecuencia de arranques del compresor.</p>
              </div>
              <details class="pc-more-details lab-field--wide">
                <summary>
                  <span class="pc-more-details__title" data-i18n="comp.moreDetails">Gu\u00eda de selecci\u00f3n de compresores</span>
                  <span class="pc-more-details__hint" data-i18n="comp.moreDetailsHint">Tipos, altitud, f\u00f3rmulas, calder\u00edn</span>
                </summary>
                <div class="pc-more-details__body">
                  <p data-i18n="comp.helpTableTitle"><strong>Tipos de compresores (orientativo)</strong></p>
                  <table class="comp-help-table">
                    <thead><tr><th data-i18n="comp.helpTableType">Tipo</th><th data-i18n="comp.helpTableQ">Q t\u00edpico</th><th data-i18n="comp.helpTableP">Presi\u00f3n</th><th data-i18n="comp.helpTableEta">\u03b7_vol</th></tr></thead>
                    <tbody>
                      <tr><td data-i18n="comp.optPiston">Pist\u00f3n</td><td data-i18n="comp.helpRowPistonQ">50 \u2013 500 Nl/min</td><td data-i18n="comp.helpRowPistonP">hasta 15 bar</td><td data-i18n="comp.helpRowPistonEta">70 \u2013 80 %</td></tr>
                      <tr><td data-i18n="comp.optScrew">Tornillo</td><td data-i18n="comp.helpRowScrewQ">500 \u2013 5000+ Nl/min</td><td data-i18n="comp.helpRowScrewP">7 \u2013 13 bar</td><td data-i18n="comp.helpRowScrewEta">80 \u2013 92 %</td></tr>
                      <tr><td data-i18n="comp.optVane">Paletas</td><td data-i18n="comp.helpRowVaneQ">100 \u2013 2000 Nl/min</td><td data-i18n="comp.helpRowVaneP">hasta 10 bar</td><td data-i18n="comp.helpRowVaneEta">70 \u2013 82 %</td></tr>
                    </tbody>
                  </table>
                  <p data-i18n="comp.helpAltitud">Por encima de 500 m de altitud, reduzca p_asp (bar abs) seg\u00fan presi\u00f3n barom\u00e9trica local.</p>
                  <p data-i18n="comp.helpFormula">Los modelos politr\u00f3picos incluyen elevaci\u00f3n de temperatura; aqu\u00ed se usa ln(r) isot\u00e9rmico para comparar alternativas con rapidez.</p>
                  <p data-i18n="comp.helpCalderin">Use el mayor entre el m\u00e9todo de ciclo y la regla Q_Nl/10 litros para el volumen de calder\u00edn.</p>
                </div>
              </details>
            </div>
          </div>
          <div class="lab-calc-layout__out lab-calc-layout__out--panel">
            <div class="lab-units-bar" role="group" data-i18n-attrs="aria-label=fluids.unitsAriaLabel" aria-label="Unidades" data-lab-convert-categories="pressure">
              <span class="lab-units-bar__title" data-i18n="fluids.unitsBarTitle">C\u00f3mo ver los resultados</span>
              <label class="lab-units-bar__field"><span class="lab-units-bar__lbl" data-i18n="fluids.lblPressure">Presi\u00f3n</span><select id="labUnitPressure" class="lab-units-bar__select"><option value="bar" data-i18n="fluids.optBar">bar</option><option value="mpa" data-i18n="fluids.optMpa">MPa</option><option value="psi" data-i18n="fluids.optPsi">psi</option></select></label>
              <label class="lab-units-bar__field"><span class="lab-units-bar__lbl" data-i18n="fluids.lblFlow">Caudal</span><select id="labUnitFlow" class="lab-units-bar__select"><option value="Lmin" data-i18n="fluids.optLmin">L/min</option><option value="m3h" data-i18n="fluids.optM3h">m\u00b3/h</option></select></label>
            </div>
            <details class="lab-fluid-formulas" id="compFormulasBlock">
              <summary data-i18n="comp.formulasSummary">Memoria de c\u00e1lculo y supuestos</summary>
              <div id="compFormulaBody" class="lab-fluid-formulas__body"></div>
            </details>
            <div id="compVerdictSummary" class="pc-verdict-summary" aria-live="polite"></div>
            <div id="compResults" class="lab-results"></div>
            <div class="lab-results-actions">
              <button type="button" class="lab-btn lab-btn--block" id="compCopyResults" data-i18n="comp.copyResults">Copiar resultados</button>
              <span class="lab-copy-toast" id="compCopyToast" role="status" data-i18n="comp.copyToast">\u00a1Copiado!</span>
            </div>
            <div id="compAdvisor" class="lab-alerts"></div>
            <div id="compDesignAlerts" class="lab-alerts" aria-live="polite"></div>
            <p id="compVerdict" class="lab-verdict lab-verdict--ok"></p>
            <div class="lab-results-share lab-results-share--footer" id="compShareLinkWrap" aria-live="polite">
              <button type="button" class="lab-btn lab-btn--text" id="compCopyLinkBtn" data-i18n="comp.copyLink">Copiar enlace</button>
              <span class="lab-copy-toast" id="compCopyLinkToast" role="status" data-i18n="comp.copyToast">\u00a1Enlace copiado!</span>
            </div>
          </div>
        </div>
        <nav class="lab-next-steps" data-i18n="comp.nextStepsAria" data-i18n-attr="aria-label" aria-label="Siguiente paso habitual">
          <h3 class="lab-next-steps__title" data-i18n="comp.nextStepsTitle">Siguiente paso habitual</h3>
          <ul class="lab-next-steps__list">
            <li data-i18n="comp.nextStepCilindroHtml" data-i18n-html><a href="calc-pneumatic-cylinder.html">Cilindro neum\u00e1tico</a> \u2014 dimensionar los actuadores de la instalaci\u00f3n.</li>
            <li data-i18n="comp.nextStepBombaHtml" data-i18n-html><a href="calc-hydraulic-pump.html">Bomba hidr\u00e1ulica</a> \u2014 comparar con soluci\u00f3n hidr\u00e1ulica.</li>
            <li data-i18n="comp.nextStepHubHtml" data-i18n-html><a href="fluids-hub.html">Hub de fluidos</a> \u2014 todas las herramientas de fluidos.</li>
          </ul>
        </nav>
      </section>
    </main>
    <script>
      globalThis.__SUPABASE_URL__ = 'https://ytdtsqxhqfuzzcblidiy.supabase.co';
      globalThis.__SUPABASE_ANON_KEY__ = 'sb_publishable_HQqMGXjb5zO1Jp_Hn9eXmA_NA0Htl41';
    </script>
    <script type="module" src="js/ui/homeI18n.js"></script>
    <script type="module" src="js/ui/hubFreemium.js"></script>
    <script type="module" src="js/ui/pneumaticCompressorPage.js?v=20260519b"></script>
    <script type="module" src="js/ui/labDonationFooter.js"></script>
  </body>
</html>
`.replace(
  /(<span class="lab-field-ico" data-i18n-attrs="title=comp\.tip[^"]+">)\?<\/span>/g,
  '$1<svg class="lab-field-ico--stroke" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>',
);

fs.writeFileSync('calc-pneumatic-compressor.html', html, 'utf8');
console.log('calc-pneumatic-compressor.html rebuilt (UTF-8)');
