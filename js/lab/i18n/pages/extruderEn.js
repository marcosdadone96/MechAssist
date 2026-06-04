/** English strings for extruder.html (`ext.*` keys). ASCII-safe. */
export const EXTRUDER_EN = {
  'ext.docTitle': 'Single-screw extruder calculator \u2014 TheMechAssist',
  'ext.metaDesc':
    'Throughput, die back-pressure and motor power for single-screw polymer extruders. HDPE, PP, LDPE, ABS. Free online.',
  'ext.ogTitle': 'Single-screw extruder \u2014 TheMechAssist',
  'ext.ogDesc':
    'Throughput, die back-pressure and motor power for single-screw polymer extruders. HDPE, PP, LDPE, ABS.',
  'ext.twitterTitle': 'Single-screw extruder \u2014 TheMechAssist',
  'ext.h2': 'Single-screw extruder \u00b7 throughput & pressure',
  'ext.introSummary': 'Description and calculator scope',
  'ext.calcSeoIntro':
    'Single-screw extruder for thermoplastics (HDPE, PP, LDPE, ABS, PVC). Calculates net throughput (kg/h), die back-pressure (bar) and motor power (kW) using the helical-channel drag-flow model (Rauwendaal / Tadmor & Gogos) with Power-Law fluid correction for die resistance. Useful for pre-sizing a new extruder, checking whether an existing machine can process a different material, or estimating throughput in compact in-situ extrusion applications (underground robotics, pipe lining).',
  'ext.leadHtml':
    'Throughput, die pressure and motor power. Results update live; the right panel shows sizing verdict and extruder schematic.',
  'ext.accScrew': 'Screw geometry',
  'ext.accOperation': 'Operating conditions',
  'ext.accMaterial': 'Polymer material',
  'ext.accDie': 'Die geometry',
  'ext.accDriveHtml': '<span class="premium-flag">Pro</span> Power & drive',
  'ext.labelDHtml':
    'Screw diameter D <span class="info-chip" data-i18n-attrs="title=ext.tipD" title="Outer screw diameter. Typical industrial range: 25\u2013150 mm." aria-label="Screw diameter help.">?</span>',
  'ext.tipD': 'Outer screw diameter. Typical industrial range: 25\u2013150 mm.',
  'ext.labelLDHtml':
    'L/D ratio <span class="info-chip" data-i18n-attrs="title=ext.tipLD" title="Screw length / diameter. Typical: 20\u201330 for standard polymers." aria-label="L/D help.">?</span>',
  'ext.tipLD':
    'Screw length / diameter. Typical: 20\u201330 for standard polymers. Higher L/D improves melting.',
  'ext.labelHHtml':
    'Metering channel depth h <span class="info-chip" data-i18n-attrs="title=ext.tipH" title="Helical channel depth in metering zone. Typical: h \u2248 0.05\u20130.10\u00b7D." aria-label="Channel depth help.">?</span>',
  'ext.tipH':
    'Helical channel depth in metering zone. Typical: h \u2248 0.05\u20130.10\u00b7D.',
  'ext.labelPhiHtml':
    'Helix angle \u03c6 <span class="info-chip" data-i18n-attrs="title=ext.tipPhi" title="Flight angle to plane perpendicular to axis. Standard: 17.7\u00b0 (pitch = diameter)." aria-label="Helix angle help.">?</span>',
  'ext.tipPhi':
    'Flight angle to plane perpendicular to axis. Standard: 17.7\u00b0 (pitch = diameter).',
  'ext.labelNHtml':
    'Screw speed N <span class="info-chip" data-i18n-attrs="title=ext.tipN" title="Screw RPM. Drag flow is proportional to N. Typical: 20\u2013120 RPM." aria-label="Screw speed help.">?</span>',
  'ext.tipN': 'Screw RPM. Drag flow is proportional to N. Typical: 20\u2013120 RPM.',
  'ext.labelTbHtml':
    'Barrel temperature T<sub>b</sub> <span class="info-chip" data-i18n-attrs="title=ext.tipTb" title="Barrel set temperature. HDPE: 180\u2013240\u00b0C, PP: 200\u2013260\u00b0C." aria-label="Barrel temperature help.">?</span>',
  'ext.tipTb':
    'Barrel set temperature. HDPE: 180\u2013240\u00b0C, PP: 200\u2013260\u00b0C, LDPE: 160\u2013220\u00b0C.',
  'ext.labelMaterialHtml':
    'Material <span class="info-chip" data-i18n-attrs="title=ext.tipMaterial" title="Selecting a grade fills K, n and melt density. Custom allows editing them." aria-label="Material help.">?</span>',
  'ext.tipMaterial':
    'Selecting a grade fills K, n and melt density. Custom allows editing them.',
  'ext.optHdpe': 'HDPE (high-density polyethylene)',
  'ext.optLdpe': 'LDPE (low-density polyethylene)',
  'ext.optPp': 'PP (polypropylene)',
  'ext.optAbs': 'ABS',
  'ext.optPvc': 'Rigid PVC',
  'ext.optCustom': 'Custom',
  'ext.hintMaterial': 'Fills reference K, n and \u03c1; adjust if you have rheometer data.',
  'ext.labelKHtml':
    'Consistency K <span class="info-chip" data-i18n-attrs="title=ext.tipK" title="Power-Law K: \u03b7 = K\u00b7\u03b3\u0307^(n\u22121). HDPE 200\u00b0C: 6000\u20139000." aria-label="Consistency K help.">?</span>',
  'ext.tipK':
    'Power-Law K: \u03b7 = K\u00b7\u03b3\u0307^(n\u22121). HDPE 200\u00b0C: 6000\u20139000. LDPE: 3000\u20135000. PP 220\u00b0C: 4000\u20137000.',
  'ext.labelNidxHtml':
    'Flow index n <span class="info-chip" data-i18n-attrs="title=ext.tipNidx" title="n=1 Newtonian; n&lt;1 pseudoplastic. Typical thermoplastics: 0.30\u20130.70." aria-label="Flow index help.">?</span>',
  'ext.tipNidx': 'n=1 \u2192 Newtonian. n&lt;1 \u2192 pseudoplastic. Typical range: 0.30\u20130.70.',
  'ext.labelRhoHtml':
    'Melt density \u03c1 <span class="info-chip" data-i18n-attrs="title=ext.tipRho" title="Melt density (not solid). HDPE: 740\u2013800 kg/m\u00b3." aria-label="Melt density help.">?</span>',
  'ext.tipRho': 'Melt density (not solid). HDPE: 740\u2013800 kg/m\u00b3. PP: 730\u2013780. LDPE: 700\u2013760.',
  'ext.labelDieTypeHtml':
    'Die type <span class="info-chip" data-i18n-attrs="title=ext.tipDieType" title="Circular: solid tube or profile. Annular: hollow tube with central mandrel." aria-label="Die type help.">?</span>',
  'ext.tipDieType': 'Circular: solid tube or profile. Annular: hollow tube with central mandrel.',
  'ext.optDieCircular': 'Circular (solid tube / profile)',
  'ext.optDieAnnular': 'Annular (hollow tube \u2014 with mandrel)',
  'ext.labelDieDHtml':
    'Die channel diameter d <span class="info-chip" data-i18n-attrs="title=ext.tipDieD" title="Inner channel diameter. For annular dies, outer channel diameter." aria-label="Die diameter help.">?</span>',
  'ext.tipDieD':
    'Inner channel diameter. For annular dies, outer channel diameter.',
  'ext.labelDieLHtml':
    'Die land length L<sub>die</sub> <span class="info-chip" data-i18n-attrs="title=ext.tipDieL" title="Die land length. Typical L/D: 10\u201330. Longer land \u2192 better finish but more back-pressure." aria-label="Die length help.">?</span>',
  'ext.tipDieL':
    'Die land length. Typical L/D: 10\u201330. Longer land improves finish but raises back-pressure.',
  'ext.labelDieDiHtml':
    'Mandrel inner \u00d8 d<sub>i</sub> <span class="info-chip" data-i18n-attrs="title=ext.tipDieDi" title="Central mandrel diameter for annular die. Wall = (d \u2212 d\u1d62)/2." aria-label="Mandrel help.">?</span>',
  'ext.tipDieDi':
    'Central mandrel diameter for annular die. Wall thickness = (d \u2212 d\u1d62)/2.',
  'ext.labelLoadDutyHtml':
    'Load class \u2192 service factor <span class="info-chip" data-i18n-attrs="title=ext.tipLoadDuty" title="Start-up and operating severity class." aria-label="Load duty help.">?</span>',
  'ext.tipLoadDuty': 'Start-up and operating severity class.',
  'ext.optDutyUniform': 'Uniform load \u2014 SF \u2248 1.15',
  'ext.optDutyModerate': 'Moderate shock \u2014 SF \u2248 1.35',
  'ext.optDutyHeavy': 'Heavy shock \u2014 SF \u2248 1.75',
  'ext.labelSFHtml':
    'Service factor SF <span class="info-chip" data-i18n-attrs="title=ext.tipSF" title="Design margin on calculated motor power." aria-label="Service factor help.">?</span>',
  'ext.tipSF': 'Design margin on calculated motor power.',
  'ext.labelDailyHoursHtml':
    'Hours of use per day <span class="info-chip" data-i18n-attrs="title=ext.tipDailyHours" title="Continuous 24 h service may tighten IE class recommendation." aria-label="Daily hours help.">?</span>',
  'ext.tipDailyHours': 'Continuous 24 h service may tighten IE class recommendation.',
  'ext.proTeaserHtml':
    'Enable <strong>Pro</strong> to see mechanical motor power, estimated shear heating and normalized IEC motor selection. <a class="pro-install-teaser__cta" href="checkout.html">Enable Pro</a>',
  'ext.proTeaserCta': 'Enable Pro',
  'ext.btnCalc': 'Calculate extruder',
  'ext.btnCalcTitle': 'Refresh results',
  'ext.calcHint': 'Values update when you change enabled fields.',
  'ext.presetsGroupAria': 'Extruder presets',
  'ext.presetHdpeBtn': 'HDPE \u00b7 pipe',
  'ext.presetHdpeTooltip': 'HDPE, D45, N60 rpm, circular die 20 mm.',
  'ext.presetPpBtn': 'PP \u00b7 profile',
  'ext.presetPpTooltip': 'PP, D60, N80 rpm, circular die 15 mm.',
  'ext.presetInsituBtn': 'HDPE \u00b7 in-situ',
  'ext.presetInsituTooltip': 'HDPE, D50, N45 rpm, annular in-situ pipe die.',
  'ext.resultsTitleHtml':
    '<span class="panel-icon">\u2211</span> Results (throughput & pressure)',
  'ext.resultsLead': 'Net throughput, die back-pressure and apparent shear rate.',
  'ext.scopeTitle': 'What this tool solves',
  'ext.scopeIntro':
    'Throughput, die pressure and motor power to pre-size an extruder or validate an existing machine for a new material.',
  'ext.scopeLi1': 'Net throughput (drag flow minus pressure flow).',
  'ext.scopeLi2': 'Die pressure drop with Power-Law fluid model.',
  'ext.scopeLi3': '[Pro] Mechanical motor power and normalized IEC selection.',
  'ext.scopeLi4': 'Full PDF in Pro; free copyable summary.',
  'ext.diagTitle': 'Schematic view \u00b7 single-screw extruder',
  'ext.diagAriaLabel': 'Single-screw extruder diagram',
  'ext.diagCaptionHtml':
    'Zones: <strong>feed</strong> (blue) \u00b7 <strong>compression</strong> (gradient) \u00b7 <strong>metering</strong> (orange) \u00b7 die (right).',
  'ext.rfqTitle': 'Summary for supplier (free)',
  'ext.rfqLead': 'Copy parameters and results as text or CSV.',
  'ext.rfqBtnText': 'Copy text',
  'ext.rfqBtnTextTitle': 'Copy a text block with the current duty point',
  'ext.rfqBtnCsv': 'Copy CSV',
  'ext.rfqBtnCsvTitle': 'Copy data in CSV format',
  'ext.engTitle': 'Engineering breakdown',
  'ext.engHint': 'Collapsed by default \u2014 open to see model steps',
  'ext.pdfExportH2Html': '<span class="panel-icon">PDF</span> Export report',
  'ext.scopeLi1': 'Net throughput (drag flow minus pressure flow).',
  'ext.scopeLi2': 'Die pressure drop with Power-Law fluid model.',
  'ext.scopeLi3': '[Pro] Mechanical motor power and normalized IEC selection.',
  'ext.scopeLi4': 'Full PDF in Pro; free copyable summary.',
  'machineHub.nextStepsExtruderLi1Html':
    '<a href="calc-gears.html">Electric motor drive</a> \u2014 size the drive using the calculated power.',
  'machineHub.nextStepsExtruderLi2Html':
    '<a href="calc-shaft.html">Shaft \u00b7 torsion</a> \u2014 calculate the screw shaft under extrusion torque.',
  'machineHub.nextStepsExtruderLi3Html':
    '<a href="calc-bearings.html">Bearings \u00b7 L10</a> \u2014 thrust bearing absorbing screw reaction force.',
};
