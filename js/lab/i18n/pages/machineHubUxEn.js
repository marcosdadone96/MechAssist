/**
 * EN copy for shared machine hub UX (scope panel, RFQ, intro fold summaries).
 * Apply with watchLangAndApply on pages that use data-i18n keys below.
 */

export const MACHINE_HUB_UX_EN = {
  'machineHub.toastRfqCopied': 'Copied to clipboard.',
  'machineHub.toastRfqErr':
    'Could not copy (browser blocked clipboard). Select and copy manually.',

  'machineHub.uxPresetsTitle': 'Typical cases (one click)',
  'machineHub.uxPresetsLead':
    'Fills coherent example values for a quick RFQ; you can fine-tune afterwards.',
  'machineHub.assumptionsTitle': 'Model assumptions',
  'machineHub.assumptionsHint': 'Calculation hypotheses and limits',
  'pumpConv.introBody':
    'Q\u2013H duty point, efficiency, fluid and drive. Results, diagram and gearmotor checker on the right.',

  'incConv.introSummary': 'Calculator description and scope',
  'incConv.scopeTitle': 'What this tool does',
  'incConv.scopeIntro':
    'For inclined bulk conveyors: one coherent duty point (traction, drum torque with service factor, motor power) you can paste into an email. It does not replace the manufacturer\u2019s official selection or a full belt memo.',
  'incConv.scopeLi1':
    'Combines slope, elevation and Coulomb friction with the same service-factor logic as the flat belt module.',
  'incConv.scopeLi2':
    'Checks sample-catalog gearmotors or manual plate data against that duty (power, T\u2082, n\u2082).',
  'incConv.scopeLi3':
    'Simplified model; does not replace full DIN 22101 / CEMA memos or belt tensile design.',
  'incConv.scopeLi4': 'Full PDF and advanced cloud are Pro; this copyable summary is free.',
  'incConv.rfqTitle': 'Supplier summary (free)',
  'incConv.rfqLead':
    'Copy inputs and indicative results as text or CSV. Values follow model assumptions (Assumptions section).',
  'incConv.rfqBtnText': 'Copy text',
  'incConv.rfqBtnCsv': 'Copy CSV',
  'incConv.rfqBtnTextTitle': 'Copy a plain-text block with the current duty point',
  'incConv.rfqBtnCsvTitle': 'Copy one CSV row (header + values)',

  'rollerConv.introSummary': 'Calculator description and scope',
  'rollerConv.scopeTitle': 'What this tool does',
  'rollerConv.scopeIntro':
    'For powered roller lines: indicative drag power and drum torque from load, pitch and rolling resistance. Not a substitute for OEM roller curves or safety validation.',
  'rollerConv.scopeLi1': 'Estimates traction force, drum torque with service factor, and motor power to the roller shaft.',
  'rollerConv.scopeLi2': 'Sample gearmotor check against the computed duty (same verifier as belt conveyors).',
  'rollerConv.scopeLi3': 'Horizontal model with equivalent C_rr; pallet footprint is indicative only.',
  'rollerConv.scopeLi4': 'Full PDF / cloud extras are Pro; copyable summary is free.',
  'rollerConv.rfqTitle': 'Supplier summary (free)',
  'rollerConv.rfqLead':
    'Copy inputs and indicative results as text or CSV for RFQ or email. See assumptions for limits.',
  'rollerConv.rfqBtnText': 'Copy text',
  'rollerConv.rfqBtnCsv': 'Copy CSV',
  'rollerConv.rfqBtnTextTitle': 'Copy plain-text duty summary',
  'rollerConv.rfqBtnCsvTitle': 'Copy CSV (header + values)',

  'scConv.introSummary': 'Calculator description and scope',
  'scConv.scopeTitle': 'What this tool does',
  'scConv.scopeIntro':
    'Indicative screw conveyor sizing (fill, geometry, power). Educational only; not a replacement for CEMA 350 detail or vendor sign-off.',
  'scConv.scopeLi1': 'Links capacity, diameter, pitch and fill to torque and power at the screw.',
  'scConv.scopeLi2': 'Gearmotor comparison uses the same catalog verifier pattern as belt tools.',
  'scConv.scopeLi3': 'Does not cover hanger bearings, intermediate supports, or detailed mechanical design.',
  'scConv.scopeLi4': 'PDF and premium features are Pro; RFQ copy is free.',
  'scConv.rfqTitle': 'Supplier summary (free)',
  'scConv.rfqLead': 'Copy indicative inputs and KPIs as text or CSV.',
  'scConv.rfqBtnText': 'Copy text',
  'scConv.rfqBtnCsv': 'Copy CSV',
  'scConv.rfqBtnTextTitle': 'Copy plain-text summary',
  'scConv.rfqBtnCsvTitle': 'Copy CSV row',

  'pumpConv.introSummary': 'Calculator description and scope',
  'pumpConv.scopeTitle': 'What this tool does',
  'pumpConv.scopeIntro':
    'Centrifugal pump duty: Q-H point, hydraulic power and indicative NPSH hints. Not a full pump selection or API/ATEX package.',
  'pumpConv.scopeLi1': 'Converts operating point and efficiency to shaft power and design power with service factor.',
  'pumpConv.scopeLi2': 'Gearmotor check compares catalog units to required speed and torque.',
  'pumpConv.scopeLi3': 'Fluid properties are simplified; validate curves and NPSH with the manufacturer.',
  'pumpConv.scopeLi4': 'Pro unlocks full PDF; RFQ copy is free.',
  'pumpConv.rfqTitle': 'Supplier summary (free)',
  'pumpConv.rfqLead': 'Copy operating point and results as text or CSV.',
  'pumpConv.rfqBtnText': 'Copy text',
  'pumpConv.rfqBtnCsv': 'Copy CSV',
  'pumpConv.rfqBtnTextTitle': 'Copy plain-text summary',
  'pumpConv.rfqBtnCsvTitle': 'Copy CSV row',

  'carConv.introSummary': 'Calculator description and scope',
  'carConv.scopeTitle': 'What this tool does',
  'carConv.scopeIntro':
    'Car lift screw: indicative lead screw torque, power and nut pressure from mass, stroke and timing. Not a substitute for machine directive documentation or OEM approval.',
  'carConv.scopeLi1': 'Uses ISO trapezoidal screw geometry hints with simplified friction and self-locking check.',
  'carConv.scopeLi2': 'Motor/gearbox comparison follows the same verifier as other machine pages.',
  'carConv.scopeLi3': 'Nut pressure and wear are indicative; confirm with supplier tests.',
  'carConv.scopeLi4': 'Pro PDF optional; RFQ copy is free.',
  'carConv.rfqTitle': 'Supplier summary (free)',
  'carConv.rfqLead': 'Copy inputs and indicative screw duty as text or CSV.',
  'carConv.rfqBtnText': 'Copy text',
  'carConv.rfqBtnCsv': 'Copy CSV',
  'carConv.rfqBtnTextTitle': 'Copy plain-text summary',
  'carConv.rfqBtnCsvTitle': 'Copy CSV row',

  'teConv.introSummary': 'Calculator description and scope',
  'teConv.scopeTitle': 'What this tool does',
  'teConv.scopeIntro':
    'Traction lift teaching model: masses, reeving, Euler traction and indicative rope/drum torques. Does not replace EN 81 or national lift codes.',
  'teConv.scopeLi1': 'Balances cabin, load and counterweight with simplified cable traction.',
  'teConv.scopeLi2': 'Shows whether Euler margin is satisfied for the chosen wrap and friction.',
  'teConv.scopeLi3': 'Rope and safety factors are indicative only.',
  'teConv.scopeLi4': 'Pro PDF if enabled; RFQ copy is free.',
  'teConv.rfqTitle': 'Supplier summary (free)',
  'teConv.rfqLead': 'Copy masses, geometry and traction summary as text or CSV.',
  'teConv.rfqBtnText': 'Copy text',
  'teConv.rfqBtnCsv': 'Copy CSV',
  'teConv.rfqBtnTextTitle': 'Copy plain-text summary',
  'teConv.rfqBtnCsvTitle': 'Copy CSV row',

  'beConv.introSummary': 'Calculator description and scope',
  'beConv.scopeTitle': 'What this tool does',
  'beConv.scopeIntro':
    'Bucket elevator wizard: indicative capacity, speed and drive power in a CEMA-style teaching flow. Not a signed vendor design.',
  'beConv.scopeLi1': 'Step-by-step geometry, capacity and boot/drive assumptions.',
  'beConv.scopeLi2': 'Gearmotor check when results are available.',
  'beConv.scopeLi3': 'Abrasion, discharge and structural details are simplified.',
  'beConv.scopeLi4': 'Pro module; RFQ copy is free where shown.',
  'beConv.rfqTitle': 'Supplier summary (free)',
  'beConv.rfqLead': 'Copy current step inputs and headline results as text or CSV when available.',
  'beConv.rfqBtnText': 'Copy text',
  'beConv.rfqBtnCsv': 'Copy CSV',
  'beConv.rfqBtnTextTitle': 'Copy plain-text summary',
  'beConv.rfqBtnCsvTitle': 'Copy CSV row',
};
