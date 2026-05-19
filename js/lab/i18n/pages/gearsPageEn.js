/** English strings for calc-gears.html (`gear.*` keys). ASCII-safe. */
export const GEARS_PAGE_EN = {
  'gear.docTitle': 'Cylindrical spur & helical gear calculator \u2014 TheMechAssist',
  'gear.metaDesc':
    'ISO 53-style geometry, ratio and indicative strength (simplified AGMA-style) for spur and helical cylindrical gears (normal module, helix angle \u03b2). Gearbox predesign. Free online.',
  'gear.h2': 'Cylindrical spur & helical gears \u00b7 design and kinematics',
  'gear.heroLead':
    'Centre distance, ratio, pitch-line speed and an indicative strength check from normal module, tooth counts, helix angle \u03b2 (0 = spur) and face width.',
  'gear.methodSummary': 'Methodology and model limits',
  'gear.methodBodyHtml':
    'Standard external geometry: <strong>a = m(z\u2081+z\u2082)/2</strong>, ha = m, hf = 1.25m. Kinematics on the <strong>pitch line</strong>. Strength checking follows a <strong>simplified AGMA 2001\u2013inspired model</strong> (Lewis + approximate contact) \u2014 not a full certified method or material data.',
  'gear.designHintHtml':
    '<span class="gear-calc-mode-help__line" data-gear-mode="design"><strong>Design:</strong> enter z\u2081, z\u2082 and module (plus pinion torque or power) \u2192 centre distance and geometry; iterate <strong>m</strong> and <strong>b</strong> for acceptable material usage.</span> <span class="gear-calc-mode-help__line" data-gear-mode="diagnostic"><strong>Diagnostic:</strong> enter the installed geometry (z\u2081, z\u2082, m\u2099, b, \u03b2) and service load \u2192 check whether the pair is adequately sized (model SF/SH margins).</span>',
  'gear.relatedHintHtml':
    'Sizing a full transmission? <a href="machines-hub.html">Calculate the driven machine too \u2192</a>',
  'gear.seoSummary': 'Expanded context and usage notes',
  'gear.calcSeoIntro':
    'Here you get cylindrical gear geometry (spur with \u03b2 = 0 or helical with \u03b2 > 0) and pitch-line kinematics from normal module, tooth numbers and face width. For helical gears, transverse module m\u209c = m\u2099/cos \u03b2 and transverse pressure angle \u03b1\u209c follow standard relations from the normal pressure angle \u03b1\u2099. Stress checking remains a simplified AGMA-inspired model (Lewis Y on virtual tooth count, indicative contact relief for helix) for education and predesign, not a certified study.',
  'gear.nextStepsAria': 'Typical next step',
  'gear.nextStepsTitle': 'Typical next step',
  'gear.nextLi1Html':
    '<a href="calc-shaft.html">Shaft \u00b7 torsion</a> \u2014 minimum diameter from torque.',
  'gear.nextLi2Html':
    '<a href="calc-keys-din6885.html">Keys DIN 6885</a> \u2014 pinion\u2013shaft coupling.',
  'gear.nextLi3Html':
    '<a href="calc-bearings.html">Bearings \u00b7 L10</a> or <a href="calc-bearings-catalog.html">62xx catalogue</a> \u2014 supports.',
  'gear.presetsLabel': 'Typical examples:',
  'gear.diagTitle': 'Schematic view \u00b7 updates when inputs change',
  'gear.diagAriaLabel': 'Gear pair diagram',
  'gear.diagCaptionHtml':
    'Dashed circle: pitch line. <strong>a</strong>, <strong>z</strong> and module are indicative; not a workshop drawing.',
  'gear.labelCalcMode': 'Working mode',
  'gear.optDesign': 'Design \u2014 load target \u2192 adjust module, width and geometry',
  'gear.optDiagnostic': 'Diagnostic \u2014 installed gears \u2192 check with torque/power',
  'gear.icoZ1': 'Pinion tooth count',
  'gear.labelZ1': 'z\u2081 (driver) \u00b7 teeth',
  'gear.helpZ1Html':
    'Pinion tooth count. With module defines pitch diameter <strong>d\u2081 = m\u00b7z\u2081</strong> (mm): more teeth \u2192 larger diameter at the same m.',
  'gear.icoZ2': 'Wheel teeth',
  'gear.labelZ2': 'z\u2082 \u00b7 teeth',
  'gear.helpZ2Html':
    'Driven wheel teeth. Reduction ratio at pitch is approximately <strong>z\u2082/z\u2081</strong> (slower output if z\u2082 &gt; z\u2081).',
  'gear.icoM': 'Normal module',
  'gear.labelM': 'Normal module m\u2099 (mm)',
  'gear.helpMHtml':
    '<strong>Normal module m\u2099</strong> (mm): hob / catalogue reference. For <strong>spur</strong> gears (\u03b2 = 0) it equals the transverse module. For <strong>helical</strong> gears, pitch diameter uses <strong>m\u209c = m\u2099 / cos \u03b2</strong>.',
  'gear.icoFace': 'Face width',
  'gear.labelFace': 'Face width b (mm)',
  'gear.helpFaceHtml':
    '<strong>Face width b</strong>: axial contact length between flanks; enters bending resistance (load-sharing area).',
  'gear.icoAlpha': 'Normal pressure angle',
  'gear.labelAlpha': 'Normal pressure angle \u03b1\u2099 (\u00b0)',
  'gear.helpAlphaHtml':
    '<strong>Normal pressure angle \u03b1\u2099</strong> (often <strong>20\u00b0</strong>). For helical gears the results also show the <strong>transverse pressure angle \u03b1\u209c</strong>.',
  'gear.icoBeta': 'Helix angle',
  'gear.labelBeta': 'Helix angle \u03b2 (\u00b0)',
  'gear.helpBetaHtml':
    '<strong>\u03b2 = 0</strong>: spur gear. <strong>\u03b2 &gt; 0</strong>: helical (typical industrial range about 8\u00b0\u201320\u00b0). This calculator caps \u03b2 at 45\u00b0.',
  'gear.icoN1': 'Input speed',
  'gear.labelN1': 'Input speed n\u2081 (RPM)',
  'gear.hintN1': '0 = skip n\u2082, \u03c9 and v_p',
  'gear.helpN1Html':
    'Pinion RPM. Kinematics: <strong>n\u2082 = n\u2081\u00b7z\u2081/z\u2082</strong>. Pitch-line speed uses <strong>v = \u03c0 d n / 60 000</strong> (d in mm \u2192 m/s).',
  'gear.icoLube': 'Lubrication type',
  'gear.labelLube': 'Lubrication (v_p limit)',
  'gear.optGrease': 'Grease',
  'gear.optOil': 'Oil (bath / splash)',
  'gear.helpLubeHtml':
    'The app compares <strong>pitch-line v</strong> with indicative limits for grease (lower) or oil; confirm with manufacturer and duty.',
  'gear.lubeThKind': 'Lubrication',
  'gear.lubeThV': 'Indicative v limit',
  'gear.lubeRowGrease': 'Grease',
  'gear.lubeRowGreaseV': '\u2264 4 m/s',
  'gear.lubeRowOilBath': 'Oil bath / splash',
  'gear.lubeRowOilBathV': '4 \u2013 15 m/s',
  'gear.lubeRowOilCirc': 'Forced circulation oil',
  'gear.lubeRowOilCircV': '&gt; 15 m/s',
  'gear.icoPower': 'Power on pinion',
  'gear.labelPower': 'Pinion power P (kW) \u2014 optional',
  'gear.placeholderPower': 'e.g. 4.5',
  'gear.hintPower': 'With P and n\u2081, T is estimated for simplified AGMA',
  'gear.helpPowerHtml':
    'Power on the <strong>pinion</strong> shaft. If <strong>T</strong> is filled, it takes priority; P supports tangential load and motor comparison.',
  'gear.icoTorque': 'Pinion torque',
  'gear.labelTorque': 'Pinion torque T (N\u00b7m) \u2014 optional',
  'gear.placeholderTorque': 'overrides P',
  'gear.helpTorqueHtml':
    'Pinion torque (N\u00b7m). With n\u2081 gives P = T\u00b7\u03c9; with d\u2081 tangential load <strong>F\u209c \u2248 T/(d\u2081/2)</strong> for the simplified check.',
  'gear.unitsAriaLabel': 'Result units',
  'gear.convertTitle': 'Converter (cylindrical gears)',
  'gear.convertTip':
    'Module, radii and centre distance in mm; angular speed (RPM, rad/s); pitch-line linear speed.',
  'gear.unitsBarTitle': 'How to read results',
  'gear.lblLength': 'Distances',
  'gear.optMmShop': 'mm (shop)',
  'gear.optCm': 'cm',
  'gear.optMSi': 'm (SI)',
  'gear.lblRotation': 'Rotation',
  'gear.optRpm': 'RPM',
  'gear.optRadS': 'rad/s',
  'gear.lblLinear': 'Linear speed',
  'gear.optMs': 'm/s',
  'gear.optMms': 'mm/s',
  'gear.optKmh': 'km/h',
  'gear.summaryPerElement': 'Results by element',
  'gear.summaryFull': 'Full results',
  'gear.recalculating': 'Recalculating\u2026',
  'gear.copyLink': 'Copy link',
  'gear.copyToast': 'Link copied!',
  'gear.copyResults': 'Copy results',
  'gear.copyResultsDone': 'Results copied',
  'gear.copyResultsFail': 'Could not copy',
  'gear.preset1': '3:1 reduction step 1',
  'gear.preset2': 'High torque step 2.5',
  'gear.preset3': 'High speed module 1',
  'gear.presetHelix': 'Helical 15\u00b0 \u00b7 m\u2099 2',
  'gear.mRatioExact': 'Exact ratio i = z\u2082/z\u2081',
  'gear.mRatioExactHint': 'Exact value with tooth counts from the form.',
};
