/** English strings for calc-pneumatic-cylinder.html (`pneuCyl.*` keys). ASCII-safe. */
export const PNEUMATIC_CYL_EN = {
  'pneuCyl.docTitle': 'Pneumatic cylinder calculator online \u2014 TheMechAssist',
  'pneuCyl.h2': 'Pneumatic cylinder \u00b7 force, flow and stroke timing',
  'pneuCyl.heroLead':
    'Push and pull force, air consumption and cycle time from bore, rod, stroke and supply pressure.',
  'pneuCyl.helpSummary': 'Methodology and model limits',
  'pneuCyl.presetsLabel': 'Typical examples:',
  'pneuCyl.diagTitle': 'Schematic view \u00b7 cylinder cross-section',
  'pneuCyl.diagAriaLabel': 'Pneumatic cylinder diagram',
  'pneuCyl.labelBore': 'Bore \u00d8 (mm) \u2014 ISO\u00a06432\u00a0/\u00a0ISO\u00a015552',
  'pneuCyl.helpBore':
    'Standard bore diameter. Push force scales with bore area; pull force uses annular rod-side area.',
  'pneuCyl.labelRod': 'Rod \u00d8 (mm)',
  'pneuCyl.helpRod':
    'Piston rod diameter. Affects pull force and buckling resistance. Confirm minimum rod per stroke from manufacturer.',
  'pneuCyl.labelStroke': 'Stroke (mm)',
  'pneuCyl.helpStroke':
    'Full stroke length. Longer strokes increase buckling risk; verify with Euler column check below.',
  'pneuCyl.labelPressure': 'Supply pressure (bar)',
  'pneuCyl.helpPressure':
    'Available line pressure at the cylinder port. Network pressure minus line losses. Typical industrial: 5\u20138\u00a0bar.',
  'pneuCyl.labelEff': 'Efficiency \u03b7 (%)',
  'pneuCyl.helpEff':
    'Mechanical efficiency accounting for seal friction. Typical double-acting PTFE seals: 90\u201395\u00a0%.',
  'pneuCyl.labelSpeed': 'Piston speed (mm/s)',
  'pneuCyl.helpSpeed':
    'Average piston speed during stroke. Used to compute flow (Nl/min) and stroke time. Adjust flow control valves accordingly.',
  'pneuCyl.labelSafetyFactor': 'Safety factor on load',
  'pneuCyl.helpSafetyFactor':
    'Recommended \u22652 for vertical motion against gravity; \u22651.5 for horizontal. Minimum required bore is sized to this.',
  'pneuCyl.labelLoad': 'Applied load (N)',
  'pneuCyl.helpLoad':
    'Total resistive force the cylinder must overcome including load mass, friction and back-pressure.',
  'pneuCyl.labelMotion': 'Motion orientation',
  'pneuCyl.optMotionHoriz': 'Horizontal',
  'pneuCyl.optMotionVertUp': 'Vertical \u2014 pushing up (against gravity)',
  'pneuCyl.optMotionVertDown': 'Vertical \u2014 pushing down (with gravity)',
  'pneuCyl.resultPushForce': 'Push force (extend)',
  'pneuCyl.resultPullForce': 'Pull force (retract)',
  'pneuCyl.resultMinBore': 'Minimum bore for load + SF',
  'pneuCyl.resultFlowExtend': 'Air flow \u2014 extend (Nl/min)',
  'pneuCyl.resultFlowRetract': 'Air flow \u2014 retract (Nl/min)',
  'pneuCyl.resultCycleTime': 'Full stroke time (s)',
  'pneuCyl.resultBuckling': 'Rod buckling safety factor',
  'pneuCyl.alertBuckling':
    'Buckling risk \u2014 consider a larger rod diameter or shorter stroke.',
  'pneuCyl.alertPressureLow':
    'Supply pressure below 4\u00a0bar \u2014 check network and line losses.',
  'pneuCyl.scopeNote':
    'Indicative sizing for preliminary design. Confirm with manufacturer catalogue and applicable standards (ISO\u00a04414).',
  'pneuCyl.relatedHintHtml':
    'Sizing a pneumatic system? <a href="fluids-hub.html">Explore all fluid calculators \u2192</a>',
};
