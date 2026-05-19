/** English strings for calc-gearmotor-inertia.html (`gm.*`). ASCII-safe. */
export const GEARMOTOR_INERTIA_EN = {
  'gm.docTitle': 'Load vs motor inertia \u2014 TheMechAssist',
  'gm.h2': 'Load inertia vs gearmotor \u00b7 user-defined data',
  'gm.dataNoteHtml':
    '<strong>Demo catalogue:</strong> gearmotor curves and data are indicative; they do not replace manufacturer software or datasheets.',
  'gm.heroLead':
    '<strong>J<sub>ext</sub>/J<sub>mot</sub></strong> vs a user-defined limit and available torque vs load torque at operating point \u2014 educational model with demo catalogue.',
  'gm.seoSummary': 'Extended context and usage notes',
  'gm.seoIntro':
    'This lab combines reflected load inertia with the gearmotor inertia to estimate whether the ratio J<sub>ext</sub>/J<sub>mot</sub> fits typical direct-on-line or VFD startup limits, and compares available torque against load torque at operating speed using a simplified torque\u2013speed curve. The method is educational and useful for sizing before opening manufacturer software. Relevant for automation engineers integrating pumps, fans or spindles with large coupled masses.',
  'gm.helpSummary': 'Methodology and limits',
  'gm.helpBodyHtml':
    'Enter your <strong>gearmotor</strong> and load parameters. The tool checks <strong>J<sub>ext</sub>/J<sub>mot</sub></strong> against your limit and <strong>available torque</strong> vs load torque at the operating point. Quick check whether the set can <strong>start</strong> and hold speed; if not, revise ratio, size or startup strategy. <strong>Educational</strong> model with demo catalogue; not a substitute for official manufacturer curves.',
  'gm.nextStepsAria': 'Typical next step',
  'gm.nextStepsTitle': 'Typical next step',
  'gm.nextLi1Html':
    '<a href="my-gearmotors.html">My gearmotors</a> \u2014 pick a model with torque and J from the catalogue.',
  'gm.nextLi2Html': '<a href="calc-couplings.html">Couplings</a> \u2014 select a coupling for the design torque.',
  'gm.presetsLabel': 'Typical examples:',
  'gm.preset1': 'Servo + CNC spindle',
  'gm.preset2': 'Induction motor + fan',
  'gm.preset3': 'VFD motor + pump',
  'gm.diagLineTitle': 'Kinematic line \u00b7 J<sub>mot</sub> and J<sub>ext</sub> on the shaft',
  'gm.diagLineAria': 'Motor coupling load chain',
  'gm.diagLineCaption':
    'Reference for the <strong>J<sub>ext</sub>/J<sub>mot</sub></strong> criterion; the numeric limit depends on the motor selected.',
  'gm.diagChartTitle': 'Estimated gearmotor torque curve vs load torque',
  'gm.diagChartAria': 'Motor torque vs load torque',
  'gm.diagChartCaptionHtml':
    '<strong>Green</strong> line: available torque <strong>T<sub>m</sub>(n)</strong> of the model; <strong>amber</strong> point: your load torque; vertical line: operating speed.',
  'gm.diagChartLegendHtml':
    'Legend: <strong>green</strong> line = available <strong>T<sub>m</sub>(n)</strong>; <strong>amber</strong> point = load torque; <strong>shaded area</strong> at operating point = startup margin.',
  'gm.labelJmotor': 'Gearmotor inertia J (kg\u00b7m\u00b2)',
  'gm.hintJmotor': 'Inertia of the gearmotor fast shaft',
  'gm.helpJmotor':
    'Key data to compare against reflected load inertia. Use manufacturer value or your calculation sheet.',
  'gm.labelJratioMax': 'Admissible ratio J_ext/J_mot',
  'gm.hintJratioMax': 'Maximum allowed ratio',
  'gm.ratioChipsAria': 'Indicative inertia ratio values',
  'gm.chipServo': 'Servo: \u2264 1',
  'gm.chipVfd': 'Induction + VFD: \u2264 3',
  'gm.chipDirect': 'Direct-on-line: \u2264 5',
  'gm.helpJratioMax':
    'Design criterion for stable startup. If you have no manufacturer data, use a conservative value.',
  'gm.labelTN': 'Rated torque T_n (N\u00b7m)',
  'gm.hintTN': 'Continuous rated torque',
  'gm.helpTN': 'Torque the gearmotor can deliver continuously near rated speed.',
  'gm.labelNsync': 'Base synchronous speed (rpm)',
  'gm.hintNsync': 'Reference for T(n) curve',
  'gm.helpNsync': 'Base speed to scale the estimated torque curve. Usually 1500 or 3000 rpm by pole count.',
  'gm.labelTpeak': 'Peak torque factor (T_peak/T_n)',
  'gm.hintTpeak': 'Startup peak relative to rated',
  'gm.helpTpeak':
    'Defines transient overload capability at start. Higher value implies more initial capacity.',
  'gm.labelJload': 'Load inertia J (kg\u00b7m\u00b2) \u00b7 optional',
  'gm.hintJload': 'Inertia on slow or load shaft',
  'gm.helpJload': 'If you enter reduction ratio, reflected inertia on the fast shaft is calculated automatically.',
  'gm.labelIratio': 'Reduction ratio i \u00b7 optional',
  'gm.hintIratio': 'i = motor rpm / load rpm',
  'gm.helpIratio': 'Quick calc: J_reflected = J_load / i\u00b2.',
  'gm.labelJext': 'Reflected load inertia J (kg\u00b7m\u00b2)',
  'gm.hintJext': 'Equivalent inertia seen by the motor',
  'gm.helpJext':
    'Enter manually or let it fill from J_load and i. Includes transmission and coupled elements.',
  'gm.labelN': 'Operating speed (rpm)',
  'gm.hintN': 'Actual working point',
  'gm.helpN': 'Speed where available and load torque are compared. Use target speed in normal operation.',
  'gm.labelTload': 'Load resisting torque (N\u00b7m)',
  'gm.hintTload': 'Torque required by the machine',
  'gm.helpTload':
    'Torque the load needs at the operating point. For peaks, use the severest value for a conservative check.',
  'gm.copyLink': 'Copy link',
  'gm.copyToast': 'Link copied!',
  'gm.summaryFull': 'Full results',
  'gm.copyResults': 'Copy results',
  'gm.footnote1':
    'The J_ext/J_mot ratio is a quick selection guide. With a VFD the limit may be relaxed; for direct-on-line mains startup it should be conservative. Always check the motor manufacturer specifications.',
  'gm.footnote2':
    'Chart assumption: the T(n) curve is a simplified linear approximation and does not reflect real induction motors with drives or servo behaviour.',
};
