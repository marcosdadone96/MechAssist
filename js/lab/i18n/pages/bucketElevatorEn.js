/**
 * English strings for bucket-elevator.html (`beConv.*` keys via `data-i18n`).
 * Machine field labels (`beLbl*`, `beAcc*`, …) live in `js/ui/bucketElevatorStaticI18n.js`
 * (`data-be-i18n`); EN copies are merged into the page dict via `getBucketElevatorBeStrings('en')`.
 */
export const BUCKET_ELEVATOR_EN = {
  'beConv.docTitle': 'Bucket elevator calculator online \u2014 TheMechAssist',
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
};
