/** English strings for calc-bolts-iso898.html (`bolt.*`). ASCII-safe. */
export const BOLTS_ISO_EN = {
  'bolt.docTitle': 'ISO 898-1 bolts calculator \u2014 TheMechAssist',
  'bolt.h2': 'Bolts \u00b7 ISO 898-1 (M6\u2013M36)',
  'bolt.safetyNotice':
    'Results are indicative only. Final sizing must be validated with manufacturer data and real operating conditions.',
  'bolt.heroLead':
    'Indicative tightening torque and preload for grades 8.8 / 10.9 / 12.9; check the joint against design tension (simplified model).',
  'bolt.helpSummary': 'Methodology and model limits',
  'bolt.seoSummary': 'Expanded context and usage notes',
  'bolt.presetsLabel': 'Typical examples:',
  'bolt.preset1': 'Diagnostic M12 \u00b7 60 kN',
  'bolt.preset2': 'Design \u00b7 95 kN',
  'bolt.preset3': 'Dry joint \u03bc 0.18',
  'bolt.diagTitle': 'Preloaded joint \u00b7 plates, bolt and axial force F',
  'bolt.labelMode': 'Working mode',
  'bolt.optDesign': 'Design \u2014 design force \u2192 minimum M and grade',
  'bolt.optDiagnostic': 'Diagnostic \u2014 installed bolt \u2192 check against F',
  'bolt.labelD': 'Diameter',
  'bolt.labelGrade': 'Grade',
  'bolt.labelF': 'Design tension F (kN)',
  'bolt.helpCalcModeDesignHtml':
    '<strong>Design:</strong> enter the tension the joint must carry; the assistant proposes the smallest metric/grade combination that satisfies (internal catalogue).',
  'bolt.helpCalcModeDiagnosticHtml':
    '<strong>Diagnostic:</strong> pick real M and grade and check against F and preload.',
  'bolt.footerHypothesis':
    'Assumption: the model does not include combined shear loads or fatigue of bolted joints (VDI 2230).',
  'bolt.helpF':
    'Total axial design load on the <strong>joint</strong> (not per bolt). Enter the service force without a safety factor; the model compares it with estimated preload. If shear is combined, use only the tensile component here and check shear separately.',
  'bolt.labelMu': 'Friction coefficient \u03bc',
  'bolt.optMuDry': 'Dry (\u03bc = 0.18)',
  'bolt.optMuLube': 'Lightly lubricated (\u03bc = 0.12)',
  'bolt.optMuGrease': 'Grease lubricated (\u03bc = 0.08)',
  'bolt.copyLink': 'Copy link',
  'bolt.copyToast': 'Link copied!',
  'bolt.summaryFull': 'Full results',
  'bolt.copyResults': 'Copy results',
  'bolt.seoIntroHtml':
    'Indicative tightening torque and preload for grades 8.8, 10.9 and 12.9 per a simplified ISO 898-1 approach for tensile design load. Useful for field torque instructions and checking whether the joint can hold external load. Picture verifying flange bolts on a pump after a night intervention.',
  'bolt.helpLeadHtml':
    'Grades <strong>8.8 \u00b7 10.9 \u00b7 12.9</strong>; <strong>indicative</strong> preload and tightening torque (assembly data style). The force entered is the <strong>design tension</strong> the bolt must carry in this simplified model; not a full code or certified joint analysis.',
  'bolt.diagAriaLabel': 'Preloaded bolted joint schematic',
  'bolt.diagCaptionHtml':
    'The menu <strong>nominal diameter</strong> scales the shank in the drawing. Compare <strong>F</strong> with design resistance and recommended <strong>tightening torque</strong>.',
  'bolt.nextStepsAria': 'Typical next step',
  'bolt.nextStepsTitle': 'Typical next step',
  'bolt.nextLi1Html': '<a href="calc-iso-fit.html">ISO 286 fits</a> \u2014 flange hole tolerances.',
  'bolt.nextLi2Html': '<a href="calc-shaft.html">Shaft \u00b7 torsion</a> \u2014 if the joint transmits torque.',
  'bolt.quickTorqueSummary': 'Quick recommended torque table (\u03bc \u2248 0.12)',
  'bolt.tableMetric': 'Size',
  'bolt.tableG88': 'Grade 8.8',
  'bolt.tableG109': 'Grade 10.9',
  'bolt.tableG129': 'Grade 12.9',
  'bolt.quickTorqueFootnote':
    'Indicative values for standard ISO metric threads, \u03bc \u2248 0.12. Always verify with manufacturer specification.',
  'bolt.gradeTableSummary': 'Minimum mechanical properties by grade (ISO 898-1)',
  'bolt.tableGrade': 'Grade',
  'bolt.tableSigmaY': '\u03c3<sub>y</sub> min. (MPa)',
  'bolt.tableSigmaU': '\u03c3<sub>u</sub> min. (MPa)',
};
