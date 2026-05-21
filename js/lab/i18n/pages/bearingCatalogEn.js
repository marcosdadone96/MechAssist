/** English strings for calc-bearings-catalog.html (`bcat.*`). ASCII-safe. */
export const BEARING_CATALOG_EN = {
  'bcat.docTitle': 'Deep groove bearing catalogue \u2014 TheMechAssist',
  'bcat.h2': 'Deep groove ball bearings \u00b7 series 6000 / 6200 / 6300 (demo catalogue)',
  'bcat.dataNoteHtml':
    '<strong>Sample data:</strong> 62xx series with indicative C. For final selection, use the official SKF or FAG catalogue.',
  'bcat.heroLead':
    'Pick series and designation with demo <strong>C</strong>; get <strong>L<sub>10h</sub></strong> from <strong>P</strong> and <strong>n</strong>. For life with known <strong>C</strong> only, use the generic L10 module.',
  'bcat.calcSeoIntro':
    'Pick a commercial designation from series 6000, 6200 or 6300 and get basic rating life in hours L10h using demo catalogue dynamic load C against equivalent load and speed. Abbreviated ISO 281 for deep groove balls, useful to screen sizes before the full manufacturer catalogue. Typical for maintenance and design when proposing a quick replacement. A frequent case is comparing a 62xx against a wider 63xx when axial thrust rises after misalignment.',
  'bcat.seoHintHtml':
    'Use this module to select a bearing from 6000/6200/6300 series by designation. If you already have catalogue <strong>C</strong>, use the generic L10 module.',
  'bcat.methodLeadHtml':
    'Choose <strong>series</strong> and <strong>designation</strong>; enter equivalent <strong>P</strong> and <strong>n</strong>. <strong>L<sub>10h</sub></strong> is computed with <code>L = (C/P)\u00b3</code> (balls) against target hours. Catalogue and <strong>C</strong> are demo; always confirm with the manufacturer.',
  'bcat.helpSummary': 'Methodology and limits',
  'bcat.presetsLabel': 'Typical examples:',
  'bcat.preset1': '6205-2Z \u00b7 medium duty',
  'bcat.preset2': '6308-2Z \u00b7 high load',
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
