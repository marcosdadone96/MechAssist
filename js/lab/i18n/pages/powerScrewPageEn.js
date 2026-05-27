/** English strings for calc-power-screw.html (`pscrew.*`). ASCII-safe. */
export const POWER_SCREW_PAGE_EN = {
  'pscrew.docTitle': 'Trapezoidal power screw calculator \u2014 TheMechAssist',
  'pscrew.metaDesc':
    'Raising torque, efficiency and self-locking for ISO 2904 trapezoidal screws (Tr). Indicative nut pressure. Free online.',
  'pscrew.h2': 'Power screw \u00b7 trapezoidal (ISO 2904)',
  'pscrew.safetyNotice':
    'Indicative mechanics model for trapezoidal power screws. Verify thread strength, buckling and manufacturer data before use on lifting equipment.',
  'pscrew.heroLead':
    'Raising and lowering torque, efficiency, self-locking and indicative nut bearing pressure from pitch, diameter and friction.',
  'pscrew.seoSummary': 'Expanded context and usage notes',
  'pscrew.calcSeoIntro':
    'Trapezoidal power screws (ISO 2904 / DIN 103) convert rotation into linear motion in jacks, presses and machine slides. This tool estimates raising torque, efficiency and self-locking using classical thread mechanics with a 30\u00b0 flank (15\u00b0 half-angle).',
  'pscrew.helpSummary': 'Methodology and model limits',
  'pscrew.methodBodyHtml':
    'Thread angle <strong>\u03b1 = 15\u00b0</strong>, lead <strong>L = n\u00b7p</strong>, mean diameter <strong>d\u2082 \u2248 d \u2212 0.5p</strong>. Torque <strong>T = F\u00b7(d\u2082/2)\u00b7tan(\u03bb \u00b1 \u03c6\u2032)</strong> with friction on flank. Does not replace detailed nut thread shear or screw buckling checks.',
  'pscrew.isoTableSummary': 'ISO 2904 reference pitches (indicative)',
  'pscrew.tableThSize': 'Size',
  'pscrew.tableThPitch': 'Pitch p (mm)',
  'pscrew.nextStepsTitle': 'Typical next step',
  'pscrew.nextStepsAria': 'Typical next step',
  'pscrew.nextLi1Html': '<a href="car-lift-screw.html">Vehicle lift (screw)</a> \u2014 real application.',
  'pscrew.nextLi2Html': '<a href="calc-shaft.html">Shaft \u00b7 torsion</a> \u2014 screw as torque member.',
  'pscrew.nextLi3Html': '<a href="calc-bearings.html">Bearings \u00b7 L10</a> \u2014 axial support.',
  'pscrew.presetsLabel': 'Typical examples:',
  'pscrew.preset1': 'Small workshop jack',
  'pscrew.preset2': 'Milling column feed',
  'pscrew.preset3': 'Fine-pitch precision leadscrew',
  'pscrew.diagTitle': 'Trapezoidal thread profile \u00b7 schematic',
  'pscrew.diagAriaLabel': 'Power screw diagram',
  'pscrew.diagCaptionHtml': 'Indicative Tr profile; confirm dimensions in manufacturer catalogue.',
  'pscrew.labelPitch': 'Pitch p (mm)',
  'pscrew.labelDiam': 'Nominal diameter d (mm)',
  'pscrew.labelStarts': 'Number of starts',
  'pscrew.labelFriction': 'Friction coefficient \u03bc',
  'pscrew.optBronzeLub': 'Bronze on steel, lubricated',
  'pscrew.optBronzeDry': 'Bronze on steel, dry',
  'pscrew.optSteelLub': 'Steel on steel, lubricated',
  'pscrew.optSteelDry': 'Steel on steel, dry / generic',
  'pscrew.optMuCustom': 'Custom \u03bc',
  'pscrew.labelMuCustom': '\u03bc',
  'pscrew.labelLoad': 'Axial load F (N)',
  'pscrew.labelRpm': 'Speed N (RPM, 0 = omit power)',
  'pscrew.labelNutTurns': 'Nut thread turns (active)',
  'pscrew.labelPadm': 'Allowable nut pressure (MPa, 0 = omit)',
  'pscrew.labelMaterial': 'Nut / screw material pair',
  'pscrew.copyResults': 'Copy results',
  'pscrew.copyLink': 'Copy link',
  'pscrew.copyToast': 'Link copied!',
  'pscrew.recalculating': 'Recalculating',
  'pscrew.summaryFull': 'Full result',
  'pscrew.relatedHintHtml':
    'Lifting application? <a href="car-lift-screw.html">Vehicle screw lift \u2192</a>',
  'pscrew.helpPitchHtml':
    'Standard pitch <strong>p</strong> (mm). With <strong>n</strong> starts, lead <strong>L = n\u00b7p</strong>.',
  'pscrew.helpDiamHtml':
    'Approximate mean diameter <strong>d<sub>2</sub> \u2248 d \u2212 0.5\u00b7p</strong> used in torque formulas.',
  'pscrew.helpStartsHtml':
    'Number of thread starts <strong>n</strong>. Multiplies lead: <strong>L = n\u00b7p</strong>.',
  'pscrew.helpFrictionHtml':
    'Indicative <strong>\u03bc</strong> for material pair. Affects torque, efficiency <strong>\u03b7</strong> and self-locking.',
  'pscrew.helpLoadHtml':
    'Axial force on screw (N). Include load safety factor for lifting applications.',
  'pscrew.helpRpmHtml':
    'Rotational speed (RPM). With <strong>n &gt; 0</strong>, estimated power <strong>P</strong> is shown.',
  'pscrew.helpNutTurnsHtml':
    'Active thread length in nut; used for bearing pressure <strong>p = F/A<sub>c</sub></strong>.',
  'pscrew.helpPadmHtml':
    'Indicative allowable nut pressure (MPa). <strong>0</strong> skips the pressure check.',
};
