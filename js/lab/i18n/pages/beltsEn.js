/** English strings for calc-belts.html (`belt.*` keys). ASCII-safe. */
export const BELTS_PAGE_EN = {
  'belt.errorPositive': 'Enter a value greater than 0',
  'belt.errorRange': 'Value out of allowed range',
  'belt.errorInvalid': 'Enter a valid number',
  'belt.errorBlocked':
    'Fix the highlighted fields (invalid or out of range) to update results.',
  'belt.docTitle': 'Belt drive calculator \u2014 kinematics and speed regime \u2014 TheMechAssist',
  'belt.metaDesc':
    'V, synchronous, flat or Poly-V belt: ratio, length, linear speed and sketch. Indicative.',
  'belt.h2': 'Belt drives \u00b7 kinematics and speed regime',
  'belt.heroLead':
    'Speed ratio, open-belt primitive length and a linear-speed verdict by belt family (V, synchronous, flat, Poly-V).',
  'belt.seoSummary': 'Expanded context and usage notes',
  'belt.calcSeoIntro':
    'This calculator covers belt drive kinematics between two pulleys: speed ratio, open-belt primitive length, and allowable linear speed band by belt family. It blends common design cues for ISO 4184 V-belts, synchronous pitch/tooth count, plus indicative flat and Poly-V modes. Useful when sizing compact drives or checking a field swap before ordering from the supplier. For example, you can check whether a shorter belt still keeps enough wrap angle after the centre distance changes on an industrial retrofit.',
  'belt.methodSummary': 'Methodology and model limits',
  'belt.nextStepsAria': 'Typical next step',
  'belt.nextStepsTitle': 'Typical next step',
  'belt.nextLi1Html':
    '<a href="calc-gears.html">Cylindrical gears</a> \u2014 alternative drive with defined ratio.',
  'belt.nextLi2Html':
    '<a href="calc-chains.html">Roller chains</a> \u2014 high torque, fixed ratio.',
  'belt.nextLi3Html':
    '<a href="calc-shaft.html">Shaft \u00b7 torsion</a> \u2014 size the driving pulley shaft.',
  'belt.presetsLabel': 'Typical examples:',
  'belt.preset1': 'Motor \u2192 industrial fan',
  'belt.preset2': 'Servo \u2192 CNC spindle',
  'belt.preset3': 'Motor \u2192 centrifugal pump',
  'belt.leadHtml':
    'Pick the <strong>belt family</strong>; the form and model adapt: <strong>V-belt</strong> (ISO 4184 profile + 1\u20133&nbsp;% slip), <strong>synchronous</strong> (tooth count Z and pitch p, no kinematic slip), <strong>flat</strong> and <strong>Poly-V</strong> (focus on <strong>v</strong> and wrap angle). Primitive length for an <strong>open belt</strong> and a linear-speed <strong>verdict</strong> on the driving pulley primitive.',
  'belt.diagTitle': 'Schematic view \u00b7 scale from primitives',
  'belt.diagAriaLabel': 'Pulley and belt diagram',
  'belt.diagCaptionHtml':
    'In the diagram: <strong>left = driving pulley 1 (d\u2081, n\u2081)</strong>, <strong>right = driven pulley 2 (d\u2082)</strong>. Dashed circle = <strong>pitch circle</strong>. Synchronous belt: schematic teeth.',
  'belt.icoTitleBeltFamily': 'Belt family',
  'belt.labelBeltType': 'Belt type',
  'belt.optVTrap': 'V-belt (trapezoidal) \u00b7 ISO 4184',
  'belt.optSync': 'Synchronous (toothed) belt',
  'belt.optFlat': 'Flat belt',
  'belt.optPoly': 'Ribbed belt (Poly-V) \u00b7 ISO 9982',
  'belt.helpBeltTypeHtml':
    'Each family adapts inputs (diameters or teeth), slip model, and criteria for <strong>v</strong> and wrap angle. Final section selection belongs to the manufacturer catalogue.',
  'belt.thType': 'Type',
  'belt.thVRec': 'v recommended',
  'belt.thVMax': 'v maximum',
  'belt.rowTrap': 'Trapezoidal (V)',
  'belt.rowSync': 'Synchronous',
  'belt.rowFlat': 'Flat',
  'belt.rowPoly': 'Poly-V',
  'belt.icoTrapProf': 'Trapezoidal profile',
  'belt.labelVProfile': 'V-belt section',
  'belt.helpVProfile':
    'Document reference; the calculation uses primitive diameters and slip. Belt count and cited lengths follow standard / supplier tables.',
  'belt.icoPolyProf': 'Poly-V profile',
  'belt.labelPolyProfile': 'Poly-V profile',
  'belt.helpPolyProfile':
    'Section identifier; primitive diameters are groove reference values (entered as diameters).',
  'belt.icoSyncPitch': 'Toothed belt pitch',
  'belt.labelSyncPitch': 'Pitch p (profile / catalogue)',
  'belt.helpSyncPitchHtml':
    'Linear pitch <strong>p</strong> in mm between homologous teeth. Primitive diameter: <strong>D = p\u00b7Z / \u03c0</strong>.',
  'belt.icoZ1': 'Driving pulley teeth',
  'belt.labelZ1': 'Z\u2081 \u00b7 teeth (driving)',
  'belt.helpZ1Html':
    'Driving pulley tooth count; no slip: <strong>n\u2082 = n\u2081 \u00b7 Z\u2081 / Z\u2082</strong>.',
  'belt.icoZ2': 'Driven pulley teeth',
  'belt.labelZ2': 'Z\u2082 \u00b7 teeth (driven)',
  'belt.helpZ2Html':
    'Driven pulley teeth. Kinematic ratio <strong>i \u2248 Z\u2082 / Z\u2081</strong> (speed reducer if Z\u2082 &gt; Z\u2081).',
  'belt.icoD1': 'Driving primitive',
  'belt.labelD1': 'd\u2081 primitive (mm) \u00b7 driving',
  'belt.helpD1Html':
    '<strong>Pitch diameter</strong> of driving pulley. Belt speed: <strong>v = \u03c0 d\u2081 n\u2081 / 60&nbsp;000</strong> m/s (d\u2081 in mm).',
  'belt.icoD2': 'Driven primitive',
  'belt.labelD2': 'd\u2082 primitive (mm) \u00b7 driven',
  'belt.helpD2Html':
    'Driven pitch diameter. Theoretical ratio <strong>n\u2082,th = n\u2081 \u00b7 d\u2081 / d\u2082</strong> before slip (if applicable).',
  'belt.icoC': 'Centre distance',
  'belt.labelC': 'Centre distance C (mm)',
  'belt.helpCHtml':
    'Shaft spacing. Defines primitive length <strong>L</strong> and wrap angles \u03b2\u2081, \u03b2\u2082 (flat & Poly-V: traction capacity & fatigue).',
  'belt.icoN1': 'Driving RPM',
  'belt.labelN1': 'n\u2081 \u00b7 RPM (driving)',
  'belt.hintN1': '0 = skip n\u2082 and v',
  'belt.helpN1Html': 'Angular speed of pulley 1: <strong>\u03c9\u2081 = 2\u03c0 n\u2081 / 60</strong> rad/s.',
  'belt.icoPower': 'Power (advisor)',
  'belt.labelPower': 'Transmitted power (kW)',
  'belt.placeholderPower': 'e.g. 5.5',
  'belt.helpPowerHtml':
    'Does not change kinematics. With the <strong>AI Advisor panel</strong> active, compares indicative losses across belt families.',
  'belt.advisorCtaLead':
    'Transmitted power only feeds the <strong>AI advisor</strong> (does not change n\u2081, n\u2082 or belt speed).',
  'belt.advisorCtaBtn': 'Show optional field',
  'belt.advisorPowerSummary': 'AI advisor \u00b7 loss comparison (optional)',
  'belt.advisorPowerSummaryOff': 'AI advisor (off) \u00b7 optional power',
  'belt.advisorInactiveLead':
    'The side <strong>AI Advisor</strong> panel is not active on this page. You can leave power empty: kinematics shown are unchanged.',
  'belt.advisorInactiveHint':
    'When the advisor is available, this value enables an indicative loss comparison (kW) across belt families.',
  'belt.icoSlip': 'Slip',
  'belt.labelSlip': 'Slip s (%)',
  'belt.hintSlip': 'V-belt: typ. 1\u20133 \u00b7 flat/Poly-V: lower',
  'belt.helpSlipHtml':
    'Simple output-speed model: <strong>n\u2082,real \u2248 n\u2082,th \u00b7 (1 \u2212 s)</strong>. Synchronous belt: no kinematic slip (not editable).',
  'belt.unitsAriaLabel': 'Result units',
  'belt.convertTitle': 'Converter (belts)',
  'belt.convertTip':
    'Primitive diameters and developed lengths in mm; pulley RPM; belt linear speed.',
  'belt.unitsBarTitle': 'How to read results',
  'belt.lblLength': 'Distances mm (shop)',
  'belt.optMmShop': 'mm (shop)',
  'belt.optCm': 'cm',
  'belt.optMSi': 'm (SI)',
  'belt.lblRotation': 'Rotation RPM',
  'belt.optRpm': 'RPM',
  'belt.optRadS': 'rad/s',
  'belt.lblLinear': 'Linear speed m/s',
  'belt.optMs': 'm/s',
  'belt.optMms': 'mm/s',
  'belt.optKmh': 'km/h',
  'belt.summaryPerElement': 'Results by element',
  'belt.summaryFull': 'Full results',
  'belt.recalculating': 'Recalculating\u2026',
  'belt.copyLink': 'Copy link',
  'belt.copyToast': 'Link copied!',
  'belt.relatedHintHtml':
    'Sizing a full drive? <a href="machines-hub.html">Calculate the driven machine too \u2192</a>',
  'belt.copyResults': 'Copy results',
};
