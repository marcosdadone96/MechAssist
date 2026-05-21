/** English strings for calc-bearings.html (`brg.*` keys). ASCII-safe. */
export const BEARINGS_PAGE_EN = {
  'brg.docTitle': 'Rolling bearings \u2014 L10 life \u2014 TheMechAssist',
  'brg.metaDesc':
    'Basic rating life L10 from C, P and rpm. Simplified ISO 281; use manufacturer C.',
  'brg.h2': 'Basic rating life L10 (simplified ISO 281)',
  'brg.heroLead':
    'L<sub>10</sub> from catalogue <strong>C</strong>, equivalent <strong>P</strong> and rpm; design or diagnostic mode. No extended a<sub>ISO</sub> factors or reliability other than 90%.',
  'brg.seoSummary': 'Expanded context and usage notes',
  'brg.calcSeoIntro':
    'Nominal basic rating life L10 for rigid ball or roller bearings from catalogue dynamic capacity C, equivalent load P in service and speed, following a simplified ISO 281 teaching line. Use it to compare designs and see what happens if radial or combined load rises before asking the supplier for detail. Useful for maintenance, machine design and technical purchasing. A typical case is checking whether an industrial fan still meets target hours when belt tension increases after poor alignment.',
  'brg.methodSummary': 'Methodology and model limits',
  'brg.methodLeadHtml':
    'L<sub>10</sub> in millions of revolutions: <strong>L = (C/P)<sup>p</sup></strong> with <strong>p = 3</strong> (balls) or <strong>10/3</strong> (rollers). No extended a<sub>ISO</sub> factors, temperature correction or reliability other than 90%. Use manufacturer <strong>C</strong> and an application-consistent <strong>P</strong>.',
  'brg.presetsLabel': 'Typical examples:',
  'brg.diagTitle': 'Section view \u00b7 bearing',
  'brg.diagAriaLabel': 'Bearing diagram',
  'brg.diagCaptionHtml': 'Generic illustration; <strong>C</strong> and <strong>P</strong> are catalogue and calculation inputs for L\u2081\u2080.',
  'brg.labelCalcMode': 'What do you want to calculate?',
  'brg.optDesign': 'Design \u2014 target life and load P \u2192 minimum catalogue C',
  'brg.optDiagnostic': 'Diagnostic \u2014 catalogue C \u2192 L\u2081\u2080 life',
  'brg.helpCalcModeHtml':
    '<strong>Design:</strong> you know equivalent load and required life; get the <strong>C</strong> to look up in a catalogue. <strong>Diagnostic:</strong> bearing is installed (<strong>C</strong> from catalogue) and you check <strong>L\u2081\u2080</strong>.',
  'brg.icoC': 'Catalogue dynamic load',
  'brg.labelC': 'C (N) \u00b7 catalogue',
  'brg.helpCHtml':
    '<strong>Basic dynamic load rating C</strong> (N): from the bearing catalogue; capacity for one million reference revolutions.',
  'brg.icoL10T': 'Target life',
  'brg.labelL10T': 'Target L\u2081\u2080 (hours)',
  'brg.helpL10THtml':
    'Desired basic rating life in <strong>hours</strong> at the stated speed (90% reliability, simplified model).',
  'brg.icoP': 'Equivalent load',
  'brg.labelP': 'P (N) \u00b7 equivalent',
  'brg.helpPHtml':
    '<strong>Dynamic equivalent load P</strong> (N): combines radial/axial loads for the duty case (ISO 281 detail factors not included here).',
  'brg.icoType': 'Ball or roller bearing',
  'brg.labelType': 'Type',
  'brg.optBall': 'Balls',
  'brg.optRoller': 'Rollers',
  'brg.helpTypeHtml':
    'Life <strong>exponent p</strong> changes: p = 3 (balls) or 10/3 (cylindrical rollers) in this simplified form.',
  'brg.icoN': 'Operating speed',
  'brg.labelN': 'Operating speed (RPM)',
  'brg.hintN': 'To estimate L\u2081\u2080 hours',
  'brg.helpNHtml': 'Operating speed to convert life from revolutions to <strong>hours</strong>: hours = L\u2081\u2080(rev) / (60\u00b7n).',
  'brg.icoDuty': 'Duty',
  'brg.labelDuty': 'Hours/day of service \u2014 optional',
  'brg.placeholderDuty': 'e.g. 2',
  'brg.helpDutyHtml':
    'For the <strong>Advisor</strong>: if duty is occasional and L\u2081\u2080 in hours is very high, it may suggest more economical series. Empty = skip that criterion.',
  'brg.unitsAriaLabel': 'Result units',
  'brg.convertTitle': 'Converter (bearings)',
  'brg.convertTip':
    'Dimensions in mm; angular speed; rolling speed v; L10 life in hours, Mrev or revolutions (RPM for hours).',
  'brg.unitsBarTitle': 'How to read results',
  'brg.lblLength': 'Distances',
  'brg.optMmShop': 'mm (shop)',
  'brg.optCm': 'cm',
  'brg.optMSi': 'm (SI)',
  'brg.lblRotation': 'Rotation',
  'brg.optRpm': 'RPM',
  'brg.optRadS': 'rad/s',
  'brg.lblLinear': 'Linear speed',
  'brg.optMs': 'm/s',
  'brg.optMms': 'mm/s',
  'brg.optKmh': 'km/h',
  'brg.lblLife': 'L\u2081\u2080 life',
  'brg.optLifeH': 'hours',
  'brg.optLifeMrev': 'millions of revolutions',
  'brg.optLifeRev': 'total revolutions',
  'brg.copyLink': 'Copy link',
  'brg.copyToast': 'Link copied!',
  'brg.recalculating': 'Recalculating\u2026',
  'brg.preset1': 'Diagnostic \u00b7 service',
  'brg.preset2': 'Design \u00b7 20 kh',
  'brg.preset3': 'Rollers \u00b7 high load',
  'brg.summaryFull': 'Full results',
  'brg.copyResults': 'Copy results',
  'brg.nextStepsAria': 'Typical next step',
  'brg.nextStepsTitle': 'Typical next step',
  'brg.nextLi1Html':
    '<a href="calc-bearings-catalog.html">62xx catalogue</a> \u2014 pick a designation with demo C.',
  'brg.nextLi2Html':
    '<a href="calc-shaft.html">Shaft \u00b7 torsion</a> \u2014 journal diameter at the bearing seat.',
  'brg.nextLi3Html':
    '<a href="calc-gears.html">Cylindrical gears</a> \u2014 loads that feed equivalent P.',
};
