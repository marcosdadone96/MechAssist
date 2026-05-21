/** English strings for calc-bearings-catalog.html (`bcat.*`). ASCII-safe. */
export const BEARING_CATALOG_EN = {
  'bcat.docTitle': 'Deep groove bearing catalogue \u2014 TheMechAssist',
  'bcat.h2': 'Deep groove ball bearings \u00b7 series 6000 / 6200 / 6300 (demo catalogue)',
  'bcat.dataNoteHtml':
    '<strong>Sample data:</strong> 62xx series with indicative C. For final selection, use the official SKF or FAG catalogue.',
  'bcat.heroLead':
    'Pick series and designation with demo <strong>C</strong>; get <strong>L<sub>10h</sub></strong> from <strong>P</strong> and <strong>n</strong>. For life with known <strong>C</strong> only, use the generic L10 module.',
  'bcat.calcSeoIntro':
    'Browse a demo deep-groove ball bearing catalogue for ISO 15 dimension series 6000, 6200 and 6300 (62xx family). Each designation shows bore, outer diameter and width plus indicative dynamic load rating C for a quick L10h life estimate per ISO 281. Typical uses include electric motor support bearings, conveyor idlers, pump shafts and light gearbox outputs where axial capacity is moderate. Enter equivalent load P and speed n to screen whether a 6205, 6308 or lighter 60xx fits your duty before opening the manufacturer catalogue for seals, clearance class and lubrication.',
  'bcat.seoHintHtml':
    'Use this module to select a bearing from 6000/6200/6300 series by designation. If you already have catalogue <strong>C</strong>, use the generic L10 module.',
  'bcat.methodLeadHtml':
    'Choose <strong>series</strong> and <strong>designation</strong>; enter equivalent <strong>P</strong> and <strong>n</strong>. <strong>L<sub>10h</sub></strong> is computed with <code>L = (C/P)\u00b3</code> (balls) against target hours. Catalogue and <strong>C</strong> are demo; always confirm with the manufacturer.',
  'bcat.helpSummary': 'Methodology and limits',
  'bcat.presetsLabel': 'Typical examples:',
  'bcat.preset1': '6205 \u00b7 general purpose',
  'bcat.preset2': '6305 \u00b7 medium load',
  'bcat.preset3': 'NJ 208 \u00b7 high radial',
  'bcat.labelSeries': 'Series',
  'bcat.labelBearing': 'Designation \u2014 indicative data',
  'bcat.seoSummary': 'Extended context and usage notes',
  'bcat.labelP': 'Equivalent load P (N)',
  'bcat.labelN': 'Speed n (RPM)',
  'bcat.labelLreq': 'Required life L (h)',
  'bcat.labelHpd': 'Service hours per day',
  'bcat.copyLink': 'Copy link',
  'bcat.copyToast': 'Link copied!',
  'bcat.summaryFull': 'Full results',
  'bcat.copyResults': 'Copy results',
  'bcat.diagTitle': 'Section \u00b7 rings, balls and groove (scaled to d, D, B)',
  'bcat.diagAriaLabel': 'Deep groove ball bearing schematic',
  'bcat.diagCaptionHtml':
    '<strong>Schematic</strong> geometry at the selected nominal size; <strong>C</strong> and life <strong>L<sub>10h</sub></strong> come from the form and simplified ISO 281.',
  'bcat.helpAutoGeom': 'Geometry and C of the selected bearing row.',
  'bcat.nextStepsAria': 'Typical next step',
  'bcat.nextStepsTitle': 'Typical next step',
  'bcat.nextLi1Html':
    '<a href="calc-bearings.html">Bearings \u00b7 L10</a> \u2014 when you already know catalogue C.',
  'bcat.nextLi2Html':
    '<a href="calc-shaft.html">Shaft \u00b7 torsion</a> \u2014 journal at the bearing seat.',
  'bcat.nextLi3Html':
    '<a href="calc-gears.html">Cylindrical gears</a> \u2014 loads that set equivalent P.',
};
