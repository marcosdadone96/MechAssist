/** Spanish strings for extruder.html (`ext.*` and page-local hub keys). ASCII-safe. */
export const EXTRUDER_ES = {
  'ext.docTitle': 'Extrusora de husillo \u2014 TheMechAssist',
  'ext.metaDesc':
    'Calculadora de extrusora de husillo simple: caudal m\u00e1sico kg/h, contrapresi\u00f3n de boquilla y potencia de motor IEC. HDPE, PP, LDPE, ABS, PVC. Modelo Power-Law (Rauwendaal). Boquilla circular y anular.',
  'ext.ogTitle': 'Extrusora de husillo \u2014 TheMechAssist',
  'ext.ogDesc':
    'Calculadora de extrusora de husillo simple: caudal m\u00e1sico kg/h, contrapresi\u00f3n de boquilla y potencia de motor IEC. HDPE, PP, LDPE, ABS, PVC. Modelo Power-Law (Rauwendaal). Boquilla circular y anular.',
  'ext.twitterTitle': 'Extrusora de husillo \u2014 TheMechAssist',
  'ext.h2': 'Extrusora de husillo simple',
  'ext.introSummary': 'Descripci\u00f3n y alcance de la calculadora',
  'ext.calcSeoIntro':
    'Extrusora monohusillo para termopl\u00e1sticos (HDPE, PP, LDPE, ABS, PVC). Calcula caudal neto (kg/h), contrapresi\u00f3n en boquilla (bar) y potencia de motor (kW) con modelo de arrastre en canal helicoidal y correcci\u00f3n Power-Law en la boquilla.',
  'ext.leadHtml':
    'Caudal, presi\u00f3n de boquilla y potencia de motor. Los resultados se actualizan al vuelo; el panel derecho muestra el veredicto de dimensionado y el esquema de la extrusora.',
  'machineHub.indicativeNotice':
    '<strong>Resultados orientativos.</strong> No sustituyen simulaci\u00f3n de proceso completa ni ensayos en planta.',
  'machineHub.nextStepsExtruderLi1Html':
    '<a href="calc-gears.html">Accionamiento motor</a> \u2014 dimensionar el accionamiento con la potencia calculada.',
  'machineHub.nextStepsExtruderLi2Html':
    '<a href="calc-shaft.html">Eje \u00b7 torsi\u00f3n</a> \u2014 calcular el eje del husillo a torsi\u00f3n con el par de extrusi\u00f3n.',
  'machineHub.nextStepsExtruderLi3Html':
    '<a href="calc-bearings.html">Rodamientos \u00b7 L10</a> \u2014 rodamiento axial de empuje que absorbe la reacci\u00f3n del husillo.',
  'machineHub.uxPresetsLead':
    'Rellena un punto de trabajo t\u00edpico; puede ajustar despu\u00e9s.',
  'ext.accScrew': 'Geometr\u00eda del husillo',
  'ext.accOperation': 'Condiciones de operaci\u00f3n',
  'ext.accMaterial': 'Material del pol\u00edmero',
  'ext.accDie': 'Geometr\u00eda de la boquilla (die)',
  'ext.accDriveHtml': '<span class="premium-flag">Pro</span> Potencia y accionamiento',
  'ext.labelDHtml':
    'Di\u00e1metro husillo D <span class="info-chip" data-i18n-attrs="title=ext.tipD" title="Di\u00e1metro exterior del husillo. Rango t\u00edpico industrial: 25\u2013150 mm." aria-label="Ayuda di\u00e1metro husillo.">?</span>',
  'ext.tipD': 'Di\u00e1metro exterior del husillo. Rango t\u00edpico industrial: 25\u2013150 mm.',
  'ext.labelLDHtml':
    'Relaci\u00f3n L/D <span class="info-chip" data-i18n-attrs="title=ext.tipLD" title="Longitud del husillo / di\u00e1metro. T\u00edpico: 20\u201330." aria-label="Ayuda relaci\u00f3n L/D.">?</span>',
  'ext.tipLD': 'Longitud del husillo / di\u00e1metro. T\u00edpico: 20\u201330 para pol\u00edmeros est\u00e1ndar.',
  'ext.labelHHtml':
    'Profundidad canal zona dosificaci\u00f3n h <span class="info-chip" data-i18n-attrs="title=ext.tipH" title="Profundidad del canal en dosificaci\u00f3n." aria-label="Ayuda profundidad canal.">?</span>',
  'ext.tipH': 'Profundidad del canal helicoidal en dosificaci\u00f3n. T\u00edpico: h \u2248 0,05\u20130,10\u00b7D.',
  'ext.labelPhiHtml':
    '\u00c1ngulo de h\u00e9lice \u03c6 <span class="info-chip" data-i18n-attrs="title=ext.tipPhi" title="\u00c1ngulo del filete. Est\u00e1ndar: 17,7\u00b0." aria-label="Ayuda \u00e1ngulo h\u00e9lice.">?</span>',
  'ext.tipPhi': '\u00c1ngulo del filete respecto al plano perpendicular al eje. Est\u00e1ndar: 17,7\u00b0 (paso = D).',
  'ext.labelNHtml':
    'Velocidad del husillo N <span class="info-chip" data-i18n-attrs="title=ext.tipN" title="RPM del husillo." aria-label="Ayuda velocidad husillo.">?</span>',
  'ext.tipN': 'RPM del husillo. El caudal de arrastre es proporcional a N. T\u00edpico: 20\u2013120 RPM.',
  'ext.labelTbHtml':
    'Temperatura del cilindro T<sub>b</sub> <span class="info-chip" data-i18n-attrs="title=ext.tipTb" title="Temperatura de banda del cilindro." aria-label="Ayuda temperatura cilindro.">?</span>',
  'ext.tipTb': 'Temperatura de banda del cilindro. HDPE: 180\u2013240\u00b0C, PP: 200\u2013260\u00b0C.',
  'ext.labelMaterialHtml':
    'Material <span class="info-chip" data-i18n-attrs="title=ext.tipMaterial" title="Seleccionar rellena K, n y densidad." aria-label="Ayuda material.">?</span>',
  'ext.tipMaterial': 'Seleccionar rellena K, n y densidad de fundido. Personalizado permite editarlos.',
  'ext.optHdpe': 'HDPE (polietileno alta densidad)',
  'ext.optLdpe': 'LDPE (polietileno baja densidad)',
  'ext.optPp': 'PP (polipropileno)',
  'ext.optAbs': 'ABS',
  'ext.optPvc': 'PVC r\u00edgido',
  'ext.optCustom': 'Personalizado',
  'ext.hintMaterial':
    'Rellena K, n y \u03c1 con valores de referencia; ajuste si dispone de datos de re\u00f3metro.',
  'ext.labelKHtml':
    'Consistencia K <span class="info-chip" data-i18n-attrs="title=ext.tipK" title="Par\u00e1metro K del modelo Power-Law." aria-label="Ayuda consistencia K.">?</span>',
  'ext.tipK':
    'Par\u00e1metro K del modelo Power-Law: \u03b7 = K\u00b7\u03b3\u0307^(n\u22121). HDPE 200\u00b0C: 6000\u20139000.',
  'ext.labelNidxHtml':
    '\u00cdndice de flujo n <span class="info-chip" data-i18n-attrs="title=ext.tipNidx" title="n&lt;1 pseudopl\u00e1stico." aria-label="Ayuda \u00edndice flujo.">?</span>',
  'ext.tipNidx': 'n=1 \u2192 newtoniano. n&lt;1 \u2192 pseudopl\u00e1stico. T\u00edpico: 0,30\u20130,70.',
  'ext.labelRhoHtml':
    'Densidad del fundido \u03c1 <span class="info-chip" data-i18n-attrs="title=ext.tipRho" title="Densidad en estado fundido." aria-label="Ayuda densidad fundido.">?</span>',
  'ext.tipRho': 'Densidad en estado fundido. HDPE: 740\u2013800 kg/m\u00b3. PP: 730\u2013780.',
  'ext.labelDieTypeHtml':
    'Tipo de boquilla <span class="info-chip" data-i18n-attrs="title=ext.tipDieType" title="Circular o anular." aria-label="Ayuda tipo boquilla.">?</span>',
  'ext.tipDieType': 'Circular: tubo macizo o perfil. Anular: tubo hueco con mandril central.',
  'ext.optDieCircular': 'Circular (tubo macizo / perfil)',
  'ext.optDieAnnular': 'Anular (tubo hueco \u2014 con mandril)',
  'ext.labelDieDHtml':
    'Di\u00e1metro canal boquilla d <span class="info-chip" data-i18n-attrs="title=ext.tipDieD" title="Di\u00e1metro interior del canal." aria-label="Ayuda di\u00e1metro boquilla.">?</span>',
  'ext.tipDieD': 'Di\u00e1metro interior del canal. En anular, di\u00e1metro exterior del canal.',
  'ext.labelDieLHtml':
    'Longitud boquilla L<sub>die</sub> <span class="info-chip" data-i18n-attrs="title=ext.tipDieL" title="Longitud del canal de la boquilla." aria-label="Ayuda longitud boquilla.">?</span>',
  'ext.tipDieL': 'Longitud del canal. L/D t\u00edpico: 10\u201330. Mayor longitud \u2192 m\u00e1s contrapresi\u00f3n.',
  'ext.labelDieDiHtml':
    '\u00d8 interior mandril d<sub>i</sub> <span class="info-chip" data-i18n-attrs="title=ext.tipDieDi" title="Di\u00e1metro del mandril central." aria-label="Ayuda mandril.">?</span>',
  'ext.tipDieDi': 'Di\u00e1metro del mandril central. Espesor pared = (d \u2212 d\u1d62)/2.',
  'ext.labelLoadDutyHtml':
    'Tipo de carga \u2192 factor de servicio <span class="info-chip" data-i18n-attrs="title=ext.tipLoadDuty" title="Clase de severidad." aria-label="Ayuda tipo de carga.">?</span>',
  'ext.tipLoadDuty': 'Clase de severidad del arranque y operaci\u00f3n.',
  'ext.optDutyUniform': 'Carga uniforme \u2014 SF \u2248 1,15',
  'ext.optDutyModerate': 'Choque moderado \u2014 SF \u2248 1,35',
  'ext.optDutyHeavy': 'Choque pesado \u2014 SF \u2248 1,75',
  'ext.labelSFHtml':
    'Factor de servicio SF <span class="info-chip" data-i18n-attrs="title=ext.tipSF" title="Margen de dise\u00f1o." aria-label="Ayuda factor de servicio.">?</span>',
  'ext.tipSF': 'Margen de dise\u00f1o sobre la potencia calculada para el motor.',
  'ext.labelDailyHoursHtml':
    'Horas de uso al d\u00eda <span class="info-chip" data-i18n-attrs="title=ext.tipDailyHours" title="Servicio continuo." aria-label="Ayuda horas de uso.">?</span>',
  'ext.tipDailyHours': 'Servicio continuo 24 h endurece la recomendaci\u00f3n de clase IE.',
  'ext.proTeaserHtml':
    'Active el plan <strong>Pro</strong> para ver la potencia mec\u00e1nica del motor, el calentamiento por cizalla estimado y el selector IEC de motor normalizado. <a class="pro-install-teaser__cta" href="checkout.html">Activar Pro</a>',
  'ext.proTeaserCta': 'Activar Pro',
  'ext.btnCalc': 'Calcular extrusora',
  'ext.btnCalcTitle': 'Actualiza resultados',
  'ext.calcHint': 'Los valores se actualizan al cambiar los campos habilitados.',
  'ext.presetsGroupAria': 'Presets extrusora',
  'ext.presetHdpeBtn': 'HDPE \u00b7 tuber\u00eda',
  'ext.presetHdpeTooltip': 'HDPE, D45, N60 rpm, boquilla circular 20 mm.',
  'ext.presetPpBtn': 'PP \u00b7 perfil',
  'ext.presetPpTooltip': 'PP, D60, N80 rpm, boquilla circular 15 mm.',
  'ext.presetInsituBtn': 'HDPE \u00b7 in-situ',
  'ext.presetInsituTooltip': 'HDPE, D50, N45 rpm, boquilla anular tubo in-situ.',
  'ext.resultsTitleHtml':
    '<span class="panel-icon">\u2211</span> Resultados (caudal y presi\u00f3n)',
  'ext.resultsLead': 'Caudal neto real, contrapresi\u00f3n en boquilla y tasa de cizalla.',
  'ext.scopeTitle': 'Qu\u00e9 resuelve esta herramienta',
  'ext.scopeIntro':
    'Caudal m\u00e1sico, presi\u00f3n de boquilla y potencia de motor para pre-dimensionar una extrusora o validar si una existente puede procesar un nuevo material.',
  'ext.scopeLi1': 'Caudal neto real (arrastre menos flujo de retorno).',
  'ext.scopeLi2': 'Ca\u00edda de presi\u00f3n en boquilla con modelo Power-Law.',
  'ext.scopeLi3': '[Pro] Potencia mec\u00e1nica del motor y selector IEC normalizado.',
  'ext.scopeLi4': 'PDF completo en Pro; resumen copiable gratuito.',
  'ext.diagTitle': 'Vista esquem\u00e1tica \u00b7 extrusora de husillo simple',
  'ext.diagAriaLabel': 'Diagrama de extrusora de husillo',
  'ext.diagCaptionHtml':
    'Zonas: <strong>alimentaci\u00f3n</strong> (azul) \u00b7 <strong>compresi\u00f3n</strong> (degradado) \u00b7 <strong>dosificaci\u00f3n</strong> (naranja) \u00b7 boquilla (derecha).',
  'ext.rfqTitle': 'Resumen para proveedor (gratis)',
  'ext.rfqLead': 'Copie los par\u00e1metros y resultados en texto o CSV.',
  'ext.rfqBtnText': 'Copiar texto',
  'ext.rfqBtnTextTitle': 'Copia un bloque de texto con el punto actual',
  'ext.rfqBtnCsv': 'Copiar CSV',
  'ext.rfqBtnCsvTitle': 'Copia los datos en formato CSV',
  'ext.engTitle': 'Desglose de ingenier\u00eda',
  'ext.engHint': 'Plegado por defecto \u2014 pulse para ver pasos del modelo',
  'ext.pdfExportH2Html': '<span class="panel-icon">PDF</span> Exportar informe',
};
