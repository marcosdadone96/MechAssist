/**
 * English strings for bucket-elevator.html (`beConv.*` + machine keys).
 */
import { BUCKET_ELEVATOR_MAIN_EN } from './bucketElevatorMainEn.js';

export const BUCKET_ELEVATOR_EN = {
  ...BUCKET_ELEVATOR_MAIN_EN,
  'beConv.docTitle': 'Bucket elevator calculator online \u2014 TheMechAssist',
  'beConv.metaDesc':
    'Indicative bucket elevator power, lift height and capacity. CEMA-style online design check. Pro module.',
  'beConv.ogTitle': 'Bucket elevator design calculator (CEMA) \u2014 online',
  'beConv.ogDesc':
    'Indicative bucket elevator power, lift height and capacity. CEMA-style online design check. Pro module.',
  'beConv.twitterTitle': 'Bucket elevator design calculator (CEMA) \u2014 online',
  'beConv.h2': 'Bucket elevator \u00b7 capacity, speed and drive',
  'beConv.heroLead':
    'Step-by-step bucket elevator sizing: geometry, capacity, belt speed and drive power.',
  'beConv.safetyNoticeHtml':
    '<strong>&#9888; Indicative calculation</strong> \u2014 Does not replace code-compliant design (CEMA / ISO&nbsp;5048) or sign-off by a competent professional. Always validate with the manufacturer and an authorised installer.',
  'beConv.helpSummary': 'Methodology and model limits',
  'beConv.presetsLabel': 'Typical examples:',
  'beConv.presetGrainTooltip':
    'Dry grain, 28 m, 45 t/h, 400 mm belt. Centrifugal discharge.',
  'beConv.presetMineralsTooltip':
    'Dense mineral, 20 m, 25 t/h. Gravity discharge, abrasive.',
  'beConv.presetCementTooltip':
    'Cement clinker, 38 m, 85 t/h, centrifugal discharge, abrasive bulk.',
  'beConv.diagTitle': 'Schematic view \u00b7 elevator and boot',
  'beConv.diagramSvgAria': 'Bucket elevator schematic',
  'beConv.labelHeight': 'Lift height H (m)',
  'beConv.helpHeight': 'Vertical distance from boot (feed) to head (discharge).',
  'beConv.labelCapacity': 'Required capacity Q (t/h)',
  'beConv.labelBucketVolume': 'Bucket volume V (L)',
  'beConv.helpBucketVolume': 'Struck capacity of each bucket. Select from manufacturer catalogue.',
  'beConv.labelBucketSpacing': 'Bucket spacing s (mm)',
  'beConv.labelDensity': 'Bulk density \u03c1 (kg/m\u00b3)',
  'beConv.labelFillFactor': 'Fill factor \u03c6',
  'beConv.helpFillFactor': 'Actual fill as fraction of struck capacity. Free-flowing grain: 0.75\u20130.85.',
  'beConv.labelDrumDiam': 'Head drum diameter D (mm)',
  'beConv.resultBeltSpeed': 'Required belt speed v',
  'beConv.resultActualCapacity': 'Actual capacity Q',
  'beConv.resultBucketsPerMetre': 'Buckets per metre',
  'beConv.resultShaftPower': 'Drive shaft power P',
  'beConv.resultTorque': 'Head drum torque T',
  'beConv.resultDrumSpeed': 'Head drum speed n',
  'beConv.alertCentrifugal': 'Belt speed may cause centrifugal discharge \u2014 check bucket design.',
  'beConv.alertCapacity': 'Calculated capacity below required \u2014 increase speed or bucket size.',
  'beConv.tipH': 'Useful vertical lift (m). Strongest driver of pure lift power.',
  'beConv.tipQ':
    'Target throughput in t/h (TPH). Consider 10\u201320% operating margin depending on process variability.',
  'beConv.tipBucket':
    'Sets volume per bucket and indicative minimum belt width. Pick from capacity and material behavior first.',
  'beConv.tipRho':
    'Bulk apparent density (kg/m\u00b3). Typical: 500\u2013900 for grain/feed, 900\u20131300 for fine aggregates. Use vendor data if unsure.',
  'beConv.tipFluidity':
    'Flow quality in the bucket: poor/medium/good. Affects fill factor \u03c6. If material packs, choose Poor for safety.',
  'beConv.tipNature':
    'Operating class for belt speed hints. Fragile/abrasive: lower speeds; fluid/light: may allow higher speeds.',
  'beConv.tipVbelt':
    'Belt line speed (m/s). Reference: 1.0\u20131.8 fragile/abrasive, 1.5\u20132.4 standard, 2.2\u20133.6 fluid/light.',
  'beConv.tipPitch':
    'Centre distance between consecutive buckets (mm). The model computes an indicative minimum pitch from Q, belt speed and bucket volume; you may override within the allowable range.',
  'beConv.tipDhead':
    'Upper drum diameter (m). Larger diameter lowers K=v\u00b2/(gR) and can improve discharge.',
  'beConv.tipDboot':
    'Lower drum diameter (m). Affects envelope, belt curvature and boot behavior.',
  'beConv.tipDischarge':
    'Centrifugal for free-flowing materials and higher speed; gravity for fragile/abrasive; mixed for intermediate duty.',
  'beConv.tipWidth':
    'Nominal belt width (mm). Must meet bucket minimum and working tension needs.',
  'beConv.tipSigma':
    'Nominal belt strength in N/mm (textile class or equivalent). Demo typical: 250\u2013630 N/mm.',
  'beConv.tipEta':
    'Mechanical efficiency of the lift run. Typical 0.70\u20130.85; use 0.75\u20130.80 if unsure (conservative).',
  'beConv.tipKboot':
    'Extra power fraction from boot drag. Reference: 0.10\u20130.25 typical, up to 0.35 in harsh conditions.',
  'beConv.tipEtatrans':
    'Drive train efficiency (gearbox, couplings). Often 0.92\u20130.98; 0.95\u20130.96 is a reasonable base.',
  'beConv.tipVerifyBrand':
    'Sample catalog brand (SEW, Nord\u2026). Does not change elevator inputs; filters models before comparison.',
  'beConv.tipVerifySearch': 'Filter by code or name fragment to shorten the model list.',
  'beConv.tipVerifyModel':
    'Demo catalog model. Check compares power, torque and rpm with the calculated head drum duty (does not change the form).',
  'beConv.optFluidPoor': 'Poor \u2014 sticky fines / very fine',
  'beConv.optFluidMedium': 'Medium \u2014 typical bulk',
  'beConv.optFluidGood': 'Good \u2014 free-flowing dry grains',
  'beConv.optNatureFragile': 'Fragile / abrasive \u2014 lower speed',
  'beConv.optNatureStandard': 'Standard',
  'beConv.optNatureFluid': 'Fluid / light \u2014 higher speed',
  'beConv.optDischargeCentrifugal': 'Centrifugal',
  'beConv.optDischargeGravity': 'Gravity',
  'beConv.optDischargeMixed': 'Mixed',
  'beConv.presetsGroupAria': 'Bucket elevator presets',
  'beConv.presetGrainBtn': 'Grain \u00b7 elevator',
  'beConv.presetMineralsBtn': 'Mineral \u00b7 abrasive',
  'beConv.presetCementBtn': 'Cement \u00b7 clinker',
};
