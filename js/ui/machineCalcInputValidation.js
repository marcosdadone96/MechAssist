/**
 * Reglas de validación numérica para calculadoras de máquinas (cintas, elevadores, bombas).
 * Campos opcionales (resistencia adicional, masa de banda = 0) usan optional: true.
 */

export const FLAT_CONVEYOR_VALIDATION = [
  { id: 'beltLength', positive: true },
  { id: 'beltWidth', positive: true },
  { id: 'beltSpeed', positive: true },
  { id: 'rollerD', positive: true },
  { id: 'loadMass', min: 0 },
  { id: 'beltMass', min: 0, optional: true },
  { id: 'efficiency', min: 1, max: 99 },
  { id: 'friction', min: 0.01, max: 2 },
  { id: 'accelTime', positive: true },
  { id: 'inertiaFactor', positive: true },
  { id: 'serviceFactor', positive: true },
  { id: 'additionalResistance', min: 0, optional: true },
];

export const INCLINED_CONVEYOR_VALIDATION = [
  { id: 'incLength', positive: true },
  { id: 'incHeight', positive: true },
  { id: 'incBeltWidth', positive: true },
  { id: 'incSpeed', positive: true },
  { id: 'incRollerD', positive: true },
  { id: 'incLoadMass', min: 0 },
  { id: 'incBeltMass', min: 0, optional: true },
  { id: 'incEfficiency', min: 1, max: 99 },
  { id: 'incFriction', min: 0.01, max: 2 },
  { id: 'incAccelTime', positive: true },
  { id: 'incInertiaFactor', positive: true },
  { id: 'incServiceFactor', positive: true },
  { id: 'incAdditionalResistance', min: 0, optional: true },
];

export const ROLLER_CONVEYOR_VALIDATION = [
  { id: 'length', positive: true },
  { id: 'speed', positive: true },
  { id: 'rollerD', positive: true },
  { id: 'rollerPitch', positive: true },
  { id: 'loadMass', min: 0 },
  { id: 'efficiency', min: 1, max: 99 },
  { id: 'accelTime', positive: true },
  { id: 'inertiaFactor', positive: true },
  { id: 'serviceFactor', positive: true },
  { id: 'additionalResistance', min: 0, optional: true },
  { id: 'palletCustomL', min: 1, optional: true },
  { id: 'palletCustomW', min: 1, optional: true },
];

export const SCREW_CONVEYOR_VALIDATION = [
  { id: 'screwCap', positive: true },
  { id: 'screwDiam', positive: true },
  { id: 'screwPitch', positive: true },
  { id: 'screwLength', positive: true },
  { id: 'screwRho', positive: true },
  { id: 'screwBearingEta', min: 1, max: 99 },
  { id: 'screwServiceFactor', positive: true },
];

export const BUCKET_ELEVATOR_VALIDATION = [
  { id: 'beH', positive: true },
  { id: 'beC', positive: true },
  { id: 'beQ', positive: true },
  { id: 'beDhead', positive: true },
  { id: 'beDboot', positive: true },
  { id: 'beVbelt', positive: true },
  { id: 'beWidth', positive: true },
  { id: 'beRho', positive: true },
  { id: 'beParticle', positive: true },
  { id: 'beSigma', positive: true },
  { id: 'beEta', min: 0.01, max: 1 },
  { id: 'beEtaTrans', min: 0.01, max: 1 },
  { id: 'bePitchManual', min: 1, optional: true },
];

export const CAR_LIFT_SCREW_VALIDATION = [
  { id: 'clCapacity', positive: true },
  { id: 'clH', positive: true },
  { id: 'clT', positive: true },
  { id: 'clPitch', positive: true },
  { id: 'clD', positive: true },
  { id: 'clNutL', positive: true },
  { id: 'clMu', min: 0.01, max: 1 },
  { id: 'clSF', positive: true },
  { id: 'clPallow', positive: true },
];

export const CENTRIFUGAL_PUMP_VALIDATION = [
  { id: 'pumpFlow', positive: true },
  { id: 'pumpHead', positive: true },
  { id: 'pumpEta', min: 1, max: 99 },
  { id: 'pumpSpeedRpm', positive: true },
  { id: 'pumpServiceFactor', positive: true },
  { id: 'pumpNameplateKw', min: 0, optional: true },
  { id: 'rho', positive: true },
  { id: 'viscosity', positive: true },
];

export const TRACTION_ELEVATOR_VALIDATION = [
  { id: 'teQ', min: 0 },
  { id: 'teMc', min: 0 },
  { id: 'teH', positive: true },
  { id: 'teV', positive: true },
  { id: 'teD', positive: true },
  { id: 'teAlpha', min: 1, max: 360 },
  { id: 'teMu', min: 0.01, max: 1 },
  { id: 'teMaxN', min: 1 },
  { id: 'teMcpManual', min: 0, optional: true },
];
