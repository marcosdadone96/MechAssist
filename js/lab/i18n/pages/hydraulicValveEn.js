/** English strings for calc-hydraulic-valve.html (`hvalve.*`). ASCII-safe. */
export const HYDRAULIC_VALVE_EN = {
  'hvalve.docTitle': 'Hydraulic valve calculator \u2014 pressure and flow control \u2014 TheMechAssist',
  'hvalve.metaDesc':
    'Indicative Kv sizing, pressure drop and dissipated power for relief, reducing, flow, check and proportional valves. ISO 1219 schematic. Free online.',
  'hvalve.h2': 'Hydraulic valve \u2014 pressure and flow control',
  'hvalve.safetyNotice':
    'Indicative sizing. Confirm with manufacturer datasheet and ISO 4413.',
  'hvalve.heroLead':
    'Estimate pressure drop across the valve, required flow coefficient Kv, heat dissipation and indicative nominal size (DN) from flow, system pressure and set pressure.',
  'hvalve.seoSummary': 'Expanded context and usage notes',
  'hvalve.calcSeoIntro':
    'This tool uses the common hydraulic relation Q \u2248 Kv\u00b70.06\u00b7\u221a\u0394P (Q in L/min, \u0394P in bar) to screen relief, reducing, flow control, check and proportional valves before detailed valve selection. It helps maintenance and design engineers compare installed valves against target pressure drops and estimate oil heating. Results are educational; valve dynamics, cavitation and manufacturer curves are not modelled in full.',
  'hvalve.helpSummary': 'Methodology and model limits',
  'hvalve.methodBodyHtml':
    'Pressure drop <strong>\u0394P = Q\u00b2 / (Kv\u00b2\u00b70.06\u00b2)</strong> (bar). Dissipated power <strong>P<sub>heat</sub> = Q\u00b7\u0394P / 600</strong> (kW). Working zone: &lt; 5 bar green, 5\u201315 bar yellow, &gt; 15 bar red. Relief valves: indicative cracking pressure and hysteresis band vs set pressure. Does not replace manufacturer test data.',
  'hvalve.nextStepsAria': 'Typical next step',
  'hvalve.nextStepsTitle': 'Typical next step',
  'hvalve.nextLi1Html':
    '<a href="calc-hydraulic-pump.html">Hydraulic pump</a> \u2014 circuit pump flow and pressure.',
  'hvalve.nextLi2Html':
    '<a href="calc-hydraulic-cylinder.html">Hydraulic cylinder</a> \u2014 consumer actuator.',
  'hvalve.nextLi3Html':
    '<a href="fluids-hub.html">Fluids hub</a> \u2014 other hydraulic calculators.',
  'hvalve.presetsLabel': 'Typical examples:',
  'hvalve.preset1': 'Industrial relief 200 bar',
  'hvalve.preset2': 'Secondary circuit reducing',
  'hvalve.preset3': 'Proportional flow servo',
  'hvalve.diagTitle': 'ISO 1219 valve symbol \u00b7 updates with type and \u0394P',
  'hvalve.diagAriaLabel': 'Hydraulic valve schematic with pressure drop',
  'hvalve.diagCaption':
    'Indicative symbol for the selected valve family; confirm porting and mounting with the manufacturer drawing.',
  'hvalve.labelCalcMode': 'Work mode',
  'hvalve.optDesign': 'Design \u2014 required flow \u2192 Kv and nominal DN',
  'hvalve.optDiagnostic': 'Diagnostic \u2014 installed valve \u2192 verify \u0394P and zone',
  'hvalve.helpCalcModeDesignHtml':
    '<strong>Design:</strong> enter flow and pressures \u2192 required Kv and suggested nominal size DN 6/10/16/25.',
  'hvalve.helpCalcModeDiagnosticHtml':
    '<strong>Diagnostic:</strong> select installed nominal DN (or Kv) and operating flow \u2192 pressure drop, heat and traffic-light zone.',
  'hvalve.labelType': 'Valve type',
  'hvalve.optRelief': 'Pressure relief',
  'hvalve.optReducing': 'Pressure reducing',
  'hvalve.optFlow': 'Flow control',
  'hvalve.optCheck': 'Check (non-return)',
  'hvalve.optProportional': 'Proportional',
  'hvalve.helpTypeHtml':
    'Symbol and set-pressure logic adapt to the family. Relief uses <strong>P<sub>max</sub></strong> and <strong>P<sub>set</sub></strong> for indicative cracking.',
  'hvalve.labelQ': 'Flow Q (L/min)',
  'hvalve.hintQ': 'Oil flow through the valve',
  'hvalve.helpQHtml':
    'Volumetric flow in L/min. With Kv and \u0394P, <strong>Q \u2248 Kv\u00b70.06\u00b7\u221a\u0394P</strong>.',
  'hvalve.labelPmax': 'Maximum system pressure (bar)',
  'hvalve.hintPmax': 'Circuit relief setting ceiling',
  'hvalve.helpPmaxHtml':
    'Maximum working pressure of the circuit (bar). Used with set pressure on relief valves.',
  'hvalve.labelPset': 'Set pressure (bar)',
  'hvalve.hintPset': 'Spring / pilot setting',
  'hvalve.helpPsetHtml':
    'Cracking or regulation pressure (bar). For relief valves, target \u0394P uses <strong>P<sub>max</sub> \u2212 P<sub>set</sub></strong> when positive.',
  'hvalve.labelVisc': 'Kinematic viscosity (cSt)',
  'hvalve.hintVisc': 'ISO VG reference at 40 \u00b0C',
  'hvalve.helpViscHtml':
    'Indicative viscosity for traceability (e.g. VG46). This simplified model does not recalculate Kv vs viscosity.',
  'hvalve.labelActuation': 'Actuation',
  'hvalve.optMech': 'Manual / mechanical',
  'hvalve.optHyd': 'Hydraulic pilot',
  'hvalve.optElec': 'Electric / proportional',
  'hvalve.helpActuationHtml':
    'Informational only; does not change the pressure-drop formula in this release.',
  'hvalve.labelDn': 'Installed nominal size DN',
  'hvalve.hintDn': 'Diagnostic mode only',
  'hvalve.helpDnHtml':
    'Select commercial nominal size; indicative Kv is taken from an internal DN table.',
  'hvalve.formulasSummary': 'Calculation memory and assumptions',
  'hvalve.copyResults': 'Copy results',
  'hvalve.copyLink': 'Copy link',
  'hvalve.copyToast': 'Link copied!',
  'hvalve.recalculating': 'Recalculating',
  'hvalve.summaryFull': 'Full result',
  'hvalve.verdictDefault': 'Review results below',
  'hvalve.mDeltaP': 'Pressure drop across valve',
  'hvalve.mKv': 'Flow coefficient Kv',
  'hvalve.mKvReq': 'Kv required (design)',
  'hvalve.mHeat': 'Dissipated power (heat)',
  'hvalve.mZone': 'Working zone',
  'hvalve.mDn': 'Indicative nominal DN',
  'hvalve.mCracking': 'Cracking pressure (indicative)',
  'hvalve.mHyst': 'Hysteresis band (indicative)',
  'hvalve.zoneGreen': 'Low drop \u2014 efficient zone (&lt; 5 bar)',
  'hvalve.zoneYellow': 'Moderate drop \u2014 check heating (5\u201315 bar)',
  'hvalve.zoneRed': 'High drop \u2014 oversizing or blockage risk (&gt; 15 bar)',
  'hvalve.detailsTitle': 'Secondary technical data',
  'hvalve.detailsHint': 'DN table, cracking and hysteresis',
  'hvalve.errTitle': 'Invalid input',
  'hvalve.errVerdict': 'Check form values.',
  'hvalve.verdictOk': 'Drop in efficient zone',
  'hvalve.verdictWarn': 'Acceptable with monitoring',
  'hvalve.verdictErr': 'Review valve size',
  'hvalve.alertRed': 'Very high pressure drop \u2014 consider larger DN or check for blockage.',
  'hvalve.alertYellow': 'Moderate heating likely \u2014 verify oil cooler sizing.',
  'hvalve.hintKvUnit': 'L/min\u00b7bar\u207b\u2070\u00b7\u2075',
  'hvalve.hintKvFormula': '\u0394P = (Q / Kv)\u00b2',
  'hvalve.hintHeatFormula': 'P = Q\u00b7\u0394P / 600',
  'hvalve.diagIn': 'P (high)',
  'hvalve.diagOut': 'A / work',
  'hvalve.diagTank': 'T',
};
