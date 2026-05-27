/** English strings for calc-worm-gear.html (`worm.*`). ASCII-safe. */
export const WORM_GEAR_PAGE_EN = {
  'worm.docTitle': 'Worm gear calculator \u2014 worm and wheel \u2014 TheMechAssist',
  'worm.metaDesc':
    'Indicative worm pair: ratio i = z\u2082/nw, lead angle \u03b3, efficiency, self-locking check, centre distance and output torque. ISO 3408-style q. Free online.',
  'worm.h2': 'Worm gear \u00b7 worm and wheel kinematics',
  'worm.safetyNotice':
    'Indicative model for education and predesign. Confirm geometry, materials and efficiency with manufacturer data and applicable standards.',
  'worm.heroLead':
    'Ratio, lead angle \u03b3, direct efficiency, self-locking, centre distance and output torque from axial module, starts, wheel teeth, speed and power.',
  'worm.seoSummary': 'Expanded context and usage notes',
  'worm.calcSeoIntro':
    'This tool sizes a worm\u2013wheel pair using axial module m\u2093, number of worm starts n\u1d64 and wheel teeth z\u2082. Pitch diameters use diameter quotient q (ISO 3408 indicative table): d\u2081 = q\u00b7m\u2093, d\u2082 = m\u2093\u00b7z\u2082, centre distance a = (d\u2081+d\u2082)/2. Efficiency uses lead angle \u03b3 and friction \u03bc; self-locking when \u03b3 \u2264 arctan(\u03bc). Useful before selecting a commercial gearbox or checking an installed reducer.',
  'worm.methodSummary': 'Methodology and model limits',
  'worm.methodBodyHtml':
    'Ratio <strong>i = z\u2082/n\u1d64</strong>. <strong>\u03b3 = arctan(n\u1d64\u00b7m\u2093/d\u2081)</strong>, <strong>d\u2081 = q\u00b7m\u2093</strong>. Efficiency <strong>\u03b7 = tan\u03b3 / tan(\u03b3+\u03c6\u2032)</strong> with <strong>\u03c6\u2032 = arctan(\u03bc)</strong>. Does not include thermal, wear or exact tooth contact.',
  'worm.nextStepsAria': 'Typical next step',
  'worm.nextStepsTitle': 'Typical next step',
  'worm.nextLi1Html':
    '<a href="calc-shaft.html">Shaft \u00b7 torsion</a> \u2014 output shaft diameter from T\u2082.',
  'worm.nextLi2Html':
    '<a href="calc-bearings.html">Bearings \u00b7 L10</a> \u2014 supports with axial loads.',
  'worm.nextLi3Html':
    '<a href="calc-gears.html">Cylindrical gears</a> \u2014 compare with parallel-axis reduction.',
  'worm.presetsLabel': 'Typical examples:',
  'worm.preset1': 'Slow reducer 1:40',
  'worm.preset2': 'Servo motor 2 starts',
  'worm.preset3': 'Heavy load 1:10',
  'worm.diagTitle': 'Schematic view \u00b7 updates when inputs change',
  'worm.diagAriaLabel': 'Worm and wheel diagram',
  'worm.diagCaptionHtml':
    'Simplified worm helix and crown wheel; <strong>d\u2081</strong>, <strong>d\u2082</strong> and <strong>a</strong> are indicative.',
  'worm.labelCalcMode': 'Working mode',
  'worm.optDesign': 'Design \u2014 target ratio \u2192 module and starts',
  'worm.optDiagnostic': 'Diagnostic \u2014 installed pair \u2192 verify \u03b3 and efficiency',
  'worm.helpCalcModeDesignHtml':
    '<strong>Design:</strong> enter target ratio i \u2192 suggested n\u1d64, z\u2082 and module; adjust m\u2093 and geometry.',
  'worm.helpCalcModeDiagnosticHtml':
    '<strong>Diagnostic:</strong> enter installed m\u2093, n\u1d64, z\u2082 and load \u2192 check \u03b3, \u03b7 and self-locking.',
  'worm.icoMx': 'Axial module',
  'worm.labelMx': 'Axial module m\u2093 (mm)',
  'worm.helpMxHtml':
    '<strong>Axial module m\u2093</strong> (mm) sets worm and wheel pitch geometry with quotient <strong>q</strong> (ISO 3408 indicative).',
  'worm.icoNw': 'Worm starts',
  'worm.labelNw': 'Worm starts n\u1d64',
  'worm.helpNwHtml':
    'Number of thread starts on the worm. Ratio <strong>i = z\u2082/n\u1d64</strong> (exact with integer teeth).',
  'worm.icoZ2': 'Wheel teeth',
  'worm.labelZ2': 'Wheel teeth z\u2082',
  'worm.helpZ2Html':
    'Teeth on the worm wheel (crown). Minimum about 20 for continuous mesh in this simplified model.',
  'worm.icoMat': 'Material',
  'worm.labelMat': 'Worm material (pair hint)',
  'worm.optMatC45': 'Hardened steel C45',
  'worm.optMat16Mn': 'Case-hardened 16MnCr5',
  'worm.optMatBronze': 'Bronze Al wheel / steel worm',
  'worm.helpMatHtml':
    'Informational; adjust friction \u03bc to match lubrication (bronze wheel pairs often \u03bc \u2248 0.03\u20130.06).',
  'worm.icoN1': 'Input speed',
  'worm.labelN1': 'Input speed n\u2081 (RPM)',
  'worm.helpN1Html':
    'Worm shaft speed. Output <strong>n\u2082 = n\u2081/i</strong>.',
  'worm.icoPower': 'Input power',
  'worm.labelPower': 'Input power P (kW)',
  'worm.helpPowerHtml':
    'Mechanical power on worm shaft; with n\u2081 gives input torque <strong>T\u2081 = 9550\u00b7P/n\u2081</strong> (N\u00b7m).',
  'worm.icoGamma': 'Lead angle',
  'worm.labelGamma': 'Lead angle \u03b3 (\u00b0) \u2014 calculated',
  'worm.helpGammaHtml':
    '<strong>\u03b3 = arctan(n\u1d64\u00b7m\u2093/d\u2081)</strong> with <strong>d\u2081 = q\u00b7m\u2093</strong>. Updated automatically.',
  'worm.icoFriction': 'Friction',
  'worm.labelFriction': 'Friction coefficient \u03bc',
  'worm.hintFriction': '0.03\u20130.12 typical',
  'worm.helpFrictionHtml':
    'Apparent friction angle <strong>\u03c6\u2032 = arctan(\u03bc)</strong>. Self-locking when <strong>\u03b3 \u2264 \u03c6\u2032</strong>.',
  'worm.labelTargetI': 'Target ratio i (design)',
  'worm.helpTargetIHtml':
    'Desired reduction <strong>i = z\u2082/n\u1d64</strong>. In design mode, suggests integer n\u1d64 and z\u2082.',
  'worm.unitsAriaLabel': 'Result units',
  'worm.convertTitle': 'Converter (worm gear)',
  'worm.convertTip': 'Lengths in mm; torque in N\u00b7m, N\u00b7mm or lbf\u00b7ft.',
  'worm.unitsBarTitle': 'How to read results',
  'worm.lblLength': 'Distances',
  'worm.optMmShop': 'mm (shop)',
  'worm.optCm': 'cm',
  'worm.optIn': 'in',
  'worm.lblTorque': 'Torque',
  'worm.optNm': 'N\u00b7m',
  'worm.optNmm': 'N\u00b7mm',
  'worm.optLbfft': 'lbf\u00b7ft',
  'worm.summaryPerElement': 'Results by element',
  'worm.summaryFull': 'Full results',
  'worm.recalculating': 'Recalculating\u2026',
  'worm.copyLink': 'Copy link',
  'worm.copyToast': 'Link copied!',
  'worm.copyResults': 'Copy results',
  'worm.cardWorm': 'Worm (screw)',
  'worm.cardWheel': 'Wheel (crown)',
  'worm.badgeSelfLock': 'Self-locking \u26a0\ufe0f',
  'worm.badgeNotLock': 'Not self-locking',
  'worm.mRatio': 'Reduction ratio i',
  'worm.mRatioHint': 'i = z\u2082/n\u1d64',
  'worm.mGamma': 'Lead angle \u03b3',
  'worm.mEta': 'Direct efficiency \u03b7',
  'worm.mSelfLock': 'Self-locking?',
  'worm.mCenter': 'Centre distance a',
  'worm.mD1': 'Worm pitch diameter d\u2081',
  'worm.mD2': 'Wheel pitch diameter d\u2082',
  'worm.mT2': 'Output torque T\u2082',
  'worm.mN2': 'Output speed n\u2082',
  'worm.mQ': 'Diameter quotient q',
  'worm.mPhi': 'Friction angle \u03c6\u2032',
  'worm.mEtaInv': 'Reverse efficiency \u03b7\u208b',
  'worm.alertSelfLock': 'Self-locking: output cannot be back-driven with this \u03b3 and \u03bc (indicative).',
  'worm.alertLowEta': 'Low efficiency \u2014 check heating and worm material.',
  'worm.alertOk': 'Pair consistent for indicative check; confirm with supplier.',
};
