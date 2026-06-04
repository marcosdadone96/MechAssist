/** English strings for calc-hydraulic-accumulator.html (`hacc.*`). ASCII-safe. */
export const HYDRAULIC_ACCUMULATOR_EN = {
  'hacc.docTitle':
    'Hydraulic accumulator \u2014 volume, energy and discharge time \u2014 TheMechAssist',
  'hacc.metaDesc':
    'Indicative sizing of hydraulic accumulators: nominal volume, stored energy and discharge time.',
  'hacc.h2': 'Hydraulic accumulator \u2014 volume, energy and discharge',
  'hacc.safetyNotice':
    'Indicative calculation per PED\u00a02014/68/EU and ISO\u00a04413. Verify with the manufacturer and submit to statutory inspection.',
  'hacc.heroLead':
    'Calculate the required nominal volume, stored energy, estimated discharge flow and emptying time for bladder, piston or diaphragm accumulators.',
  'hacc.seoSummary': 'Expanded context and usage notes',
  'hacc.calcSeoIntro':
    'Pre-sizing tool for oleohydraulic accumulators. Calculates nominal volume via the polytropic law (isothermal n=1 or adiabatic n=1.4), stored energy and discharge profile before selecting a commercial Bosch, Parker or Hydac reference.',
  'hacc.helpSummary': 'Methodology and model limits',
  'hacc.methodBodyHtml':
    'Polytropic law: <strong>p\u00b7V\u207f = const</strong>. Isothermal (n=1): slow cycles &gt;\u00a05\u00a0min. Adiabatic (n=1.4): fast cycles &lt;\u00a01\u00a0min. Ratio p\u2082/p\u2081 \u2264\u00a04 recommended; alert if exceeded.',
  'hacc.formulasSummary': 'Calculation memo and assumptions',
  'hacc.labelCalcMode': 'Calculation mode',
  'hacc.optDesign': 'Design \u2014 required useful volume \u2192 nominal volume',
  'hacc.optDiagnostic': 'Diagnostic \u2014 installed accumulator \u2192 verify energy and discharge',
  'hacc.helpCalcModeDesignHtml':
    '<strong>Design:</strong> enter the required useful volume and pressures \u2192 the model calculates the minimum nominal volume.',
  'hacc.helpCalcModeDiagnosticHtml':
    '<strong>Diagnostic:</strong> enter the installed nominal volume \u2192 verify stored energy and discharge time.',
  'hacc.labelType': 'Accumulator type',
  'hacc.icoType': 'Accumulator type',
  'hacc.optBladder': 'Bladder',
  'hacc.optPiston': 'Piston',
  'hacc.optDiaphragm': 'Diaphragm',
  'hacc.helpTypeHtml':
    '<strong>Bladder</strong>: fast response, up to ~350\u00a0bar. <strong>Piston</strong>: large volumes, slow cycles. <strong>Diaphragm</strong>: small volumes, very fast response.',
  'hacc.labelProcess': 'Gas process',
  'hacc.icoProcess': 'Polytropic process',
  'hacc.optIsothermal': 'Isothermal (n=1) \u2014 slow cycles > 5\u00a0min',
  'hacc.optAdiabatic': 'Adiabatic (n=1.4) \u2014 fast cycles < 1\u00a0min',
  'hacc.helpProcessHtml':
    'Use <strong>isothermal</strong> for long press cycles and <strong>adiabatic</strong> for emergency or active-suspension accumulators.',
  'hacc.labelP0': 'N\u2082 pre-charge pressure \u2014 p\u2080 (bar)',
  'hacc.icoP0': 'N\u2082 pre-charge pressure',
  'hacc.hintP0': '0.9 \u00d7 p\u2081 typical',
  'hacc.helpP0Html':
    'Pre-charge must be <strong>p\u2080 = 0.85\u20130.9 \u00d7 p\u2081</strong> to prevent the bladder from bottoming out at minimum pressure.',
  'hacc.labelP1': 'Minimum working pressure \u2014 p\u2081 (bar)',
  'hacc.icoP1': 'Minimum pressure',
  'hacc.hintP1': 'Discharge threshold',
  'hacc.helpP1Html':
    'Minimum pressure at which the system accepts fluid from the accumulator. Must be <strong>p\u2081 &gt; p\u2080</strong>.',
  'hacc.labelP2': 'Maximum charge pressure \u2014 p\u2082 (bar)',
  'hacc.icoP2': 'Maximum pressure',
  'hacc.hintP2': 'Pump / relief pressure',
  'hacc.helpP2Html':
    'Maximum circuit pressure (relief valve set point). Ratio <strong>p\u2082/p\u2081 \u2264 4</strong> recommended for bladder accumulators; alert raised if exceeded.',
  'hacc.labelDeltaV': 'Required useful volume \u2014 \u0394V (L)',
  'hacc.icoDeltaV': 'Useful volume',
  'hacc.hintDeltaV': 'Flow \u00d7 cycle time',
  'hacc.helpDeltaVHtml':
    'Volume of oil the accumulator must deliver in one cycle. Example: 10\u00a0L/min \u00d7 30\u00a0s = 5\u00a0L.',
  'hacc.labelVnom': 'Installed nominal volume (L)',
  'hacc.icoVnom': 'Nominal volume',
  'hacc.hintVnom': 'Hydac / Parker commercial series',
  'hacc.helpVnomHtml': 'Standard commercial series nominal sizes.',
  'hacc.labelTemp': 'Working temperature (\u00b0C)',
  'hacc.icoTemp': 'Temperature',
  'hacc.hintTemp': '\u221220 to 150\u00a0\u00b0C',
  'hacc.helpTempHtml':
    'Affects oil density and nitrogen expansion (Boyle\u2013Charles correction in project mode).',
  'hacc.diagTitle': 'Cross-section \u00b7 updates with type',
  'hacc.diagAriaLabel': 'Hydraulic accumulator cross-section',
  'hacc.diagCaption':
    'Indicative schematic; refer to manufacturer manual for exact dimensions.',
  'hacc.copyResults': 'Copy results',
  'hacc.copyLink': 'Copy link',
  'hacc.linkCopied': 'Link copied!',
  'hacc.preset1': 'Slow press cycle 5 L',
  'hacc.preset2': 'Adiabatic emergency 3 L',
  'hacc.preset3': 'Diagnostic piston 20 L',
  'hacc.heroVol': 'Nominal volume',
  'hacc.heroVolHint': 'Selected commercial nominal size',
  'hacc.heroE': 'Stored energy E',
  'hacc.heroEHint': 'Polytropic gas model (indicative)',
  'fluids.lblVolume': 'Volume',
  'fluids.optLitres': 'L',
  'fluids.optGal': 'gal (US)',
  'fluids.nextStepsAccLi_aria': 'Usual next step',
  'fluids.nextStepsAccLi1Html':
    '<a href="calc-hydraulic-pump.html">Hydraulic pump</a> \u2014 pump recharge flow for the accumulator.',
  'fluids.nextStepsAccLi2Html':
    '<a href="calc-hydraulic-cylinder.html">Hydraulic cylinder</a> \u2014 actuator fed by the accumulator.',
  'fluids.nextStepsAccLi3Html':
    '<a href="fluids-hub.html">Fluids hub</a> \u2014 all fluid-power calculators.',
};
