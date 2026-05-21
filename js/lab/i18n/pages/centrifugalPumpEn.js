/** English strings for centrifugal-pump.html (`cPump.*` keys). ASCII-safe. */
export const CENTRIFUGAL_PUMP_EN = {
  'cPump.docTitle': 'Centrifugal pump calculator online \u2014 TheMechAssist',
  'cPump.metaDesc':
    'Pump curve, duty point, shaft power and indicative NPSH. Pro tool; does not replace manufacturer data.',
  'cPump.ogTitle': 'Centrifugal pump calculator \u2014 curve, power & NPSH',
  'cPump.ogDesc':
    'Pump curve, duty point, shaft power and indicative NPSH. Pro tool; does not replace manufacturer data.',
  'cPump.twitterTitle': 'Centrifugal pump calculator \u2014 curve, power & NPSH',
  'cPump.h2': 'Centrifugal pump \u00b7 operating point and drive sizing',
  'cPump.heroLead':
    'Hydraulic power, shaft power and drive torque from flow, head, efficiency and fluid properties.',
  'cPump.lead':
    'Hydraulic power, shaft power and drive torque from flow, head, efficiency and fluid properties.',
  'cPump.helpSummary': 'Methodology and model limits',
  'cPump.presetsLabel': 'Typical examples:',
  'cPump.diagTitle': 'Q\u2013H operating point and efficiency',
  'cPump.diagramSvgAria': 'Centrifugal pump schematic',
  'cPump.labelFlow': 'Flow Q (m\u00b3/h)',
  'cPump.helpFlow': 'Required volumetric flow at the duty point.',
  'cPump.labelHead': 'Total head H (m)',
  'cPump.helpHead': 'System head at duty point: static\u00a0+\u00a0friction\u00a0+\u00a0velocity heads.',
  'cPump.labelPumpEff': 'Pump efficiency \u03b7\u209a (%)',
  'cPump.helpPumpEff': 'Hydraulic\u00a0+\u00a0volumetric efficiency from Q\u2013\u03b7 curve. Typical centrifugal: 60\u201380\u00a0%.',
  'cPump.labelMechEff': 'Mechanical efficiency \u03b7\u2098 (%)',
  'cPump.helpMechEff': 'Bearing and seal losses. Typical: 95\u201398\u00a0%.',
  'cPump.labelFluidType': 'Fluid',
  'cPump.labelDensity': 'Density \u03c1 (kg/m\u00b3)',
  'cPump.labelViscosity': 'Kinematic viscosity \u03bd (cSt)',
  'cPump.helpViscosity': 'Above 50\u00a0cSt apply HI\u00a09.6.7 viscosity correction factors.',
  'cPump.labelServiceFactor': 'Service factor K\u209b',
  'cPump.labelShaftSpeed': 'Shaft speed n (rpm)',
  'cPump.labelNpshAvail': 'NPSH available NPSHa (m)',
  'cPump.helpNpshAvail': 'Available net positive suction head. Must exceed NPSHr by at least 0.5\u00a0m.',
  'cPump.resultHydPower': 'Hydraulic power P\u210b',
  'cPump.resultShaftPower': 'Shaft power P\u209b',
  'cPump.resultDesignPower': 'Design power (P\u209b\u00a0\u00d7\u00a0K\u209b)',
  'cPump.resultTorque': 'Drive torque T',
  'cPump.resultSpecificSpeed': 'Specific speed N\u209b',
  'cPump.resultNpshRequired': 'Estimated NPSHr (indicative)',
  'cPump.alertNpsh': 'Low NPSH margin \u2014 risk of cavitation. Check suction conditions.',
  'cPump.alertViscosity': 'Viscosity above 50\u00a0cSt \u2014 apply HI\u00a09.6.7 correction factors.',
  'cPump.scopeNote':
    'Indicative sizing. Confirm with manufacturer Q\u2013H curves and applicable standards.',
  'cPump.tipFlow':
    'Volumetric flow at the operating point. Must match the same condition used for H and \u03b7.',
  'cPump.tipFlowUnit': 'Select m\u00b3/h or L/min; converted internally to m\u00b3/s for the calculation.',
  'cPump.tipHead':
    'Total equivalent head (static + losses per your criteria). Enters power linearly.',
  'cPump.tipEta': 'Pump efficiency at the operating point (Q, H). Typical 60\u201385\u00a0%.',
  'cPump.tipFluidType': 'Applies indicative density and viscosity presets; you can adjust below.',
  'cPump.tipDensity': 'Fluid density in kg/m\u00b3. Higher density increases hydraulic power for the same Q and H.',
  'cPump.tipViscosity': 'Kinematic viscosity in mm\u00b2/s (cSt). Used for an indicative power correction.',
  'cPump.tipTemp': 'Fluid temperature. Relevant for documentation and cavitation/NPSH risk.',
  'cPump.tipSuction': 'Gauge pressure at suction. Negative values indicate depression (suction lift).',
  'cPump.tipPipeDiam': 'Inner diameter used to estimate line fluid velocity.',
  'cPump.tipDailyHours': 'Estimated daily run time. Continuous 24/7 service may increase the service factor.',
  'cPump.tipLoadDuty': 'Drive severity class to suggest a base service factor.',
  'cPump.tipServiceFactor': 'Design margin on steady torque/power for drive selection.',
  'cPump.tipShaftSpeed': 'Pump shaft speed to compute torque (T\u00a0=\u00a0P/\u03c9).',
  'cPump.calcSeoIntro':
    'This module derives pump shaft power and suction regime from the duty point (flow\u2013head), hydraulic efficiency and fluid properties, including indicative available vs. required NPSH per the simplified assumptions in the help. It helps fluid-system engineers and facility maintenance teams compare curves when throttling valves or fluid density change. Think of an industrial wash line where liquid temperature rises and NPSH margin falls until you must lower head or improve suction piping.',
  'cPump.accOperating': 'Operating parameters',
  'cPump.accFluid': 'Fluid properties',
  'cPump.accInstallHtml': '<span class="premium-flag">Pro</span> Installation layout',
  'cPump.accDrive': 'Drive duty and electrical data',
  'cPump.labelCalcMode': 'What do you want to do?',
  'cPump.optDesign': 'Design \u2014 Q, H and efficiency \u2192 power and drive',
  'cPump.optDiagnostic': 'Diagnostic \u2014 compare duty point with nameplate power',
  'cPump.calcModeHint':
    'In design mode you get required shaft power. In diagnostic mode, enter motor or pump nameplate kW to estimate margin vs. P<sub>shaft</sub> and P<sub>design</sub> (\u00d7SF).',
  'cPump.labelNameplateKw': 'Nameplate / motor rated power (kW)',
  'cPump.nameplateHint': 'Typically P<sub>motor</sub> \u2265 P<sub>shaft</sub> and ideally \u2265 design power with service factor.',
  'cPump.labelFlowUnit': 'Flow unit',
  'cPump.hintFlowUnit': 'Converted to m\u00b3/s in the calculation.',
  'cPump.hintHead': 'm fluid column (static + losses in your definition).',
  'cPump.hintEta': '% at (Q, H); typically ~60\u201385 depending on machine.',
  'cPump.hintFluidType': 'Adjusts default density and viscosity; you can edit below.',
  'cPump.hintViscosity': 'mm\u00b2/s (cSt). Indicative power correction.',
  'cPump.hintTemp': '\u00b0C \u2014 documentation and NPSH risk (Pro suction alerts).',
  'cPump.labelTemp': 'Operating temperature',
  'cPump.labelSuction': 'Suction gauge pressure',
  'cPump.labelPipeDiam': 'Pipe ID (discharge)',
  'cPump.labelDailyHours': 'Hours per day',
  'cPump.labelLoadDuty': 'Load class \u2192 service factor',
  'cPump.labelCoupling': 'Coupling type',
  'cPump.labelVoltage': 'Nominal voltage',
  'cPump.labelFreq': 'Frequency',
  'cPump.optWater': 'Water',
  'cPump.optOil': 'Oil',
  'cPump.optBrine': 'Brine',
  'cPump.optSlurry': 'Slurry / pulp',
  'cPump.optDirect': 'Direct motor\u2013pump (same shaft / ~1:1)',
  'cPump.optGearmotor': 'Geared motor (gearbox between motor and pump)',
  'cPump.btnCalc': 'Calculate and show gearmotor',
  'cPump.btnCalcTitle': 'Refresh results and scroll to gearmotor suggestions',
  'cPump.visualSectionAria': 'Centrifugal pump schematic',
  'cPump.photoAlt': 'Centrifugal pump installed in a pumping station',
  'cPump.btnResults': 'View results',
  'cPump.btnMotors': 'Go to gearmotors',
  'cPump.calcHint': 'Values update when you change enabled fields. Use an HTTP server, not file://.',
  'cPump.resultsTitleHtml': '<span class="panel-icon">\u2211</span> Results (hydraulics and shaft)',
  'cPump.resultsLead':
    'Hydraulic power, shaft power and design quantities with service factor. <a href="#pump-assumptions">Assumptions</a>',
  'cPump.diagAria': 'Centrifugal pump schematic',
  'cPump.photoCaptionHtml':
    'Centrifugal pump at a pumping station. <a href="https://commons.wikimedia.org/wiki/File:Pump_station.jpg" target="_blank" rel="noopener">Wikimedia Commons</a>.',
  'cPump.verifyH2Html': '<span class="panel-icon">\u2713</span> Check a gearmotor I already have',
  'cPump.verifyLead': 'Same check as belt tools: power, output torque and speed vs. pump duty.',
  'cPump.verifyRunBtn': 'Check for this pump',
  'cPump.engTitle': 'Engineering breakdown',
  'cPump.engHint': 'Collapsed by default \u2014 open for gearbox, strategies and steps',
  'cPump.engLead': 'Indicative gearbox, motor strategies and model steps.',
  'cPump.motorsTitle': 'Geared motors (demo catalog)',
  'cPump.motorsHint': 'Collapsed by default \u2014 open for recommendations, export and checker',
  'cPump.assumptionsTitle': 'Model assumptions',
  'cPump.assumptionsHint': 'Assumptions and limits used in the calculation',
  'cPump.pdfExportH2Html': '<span class="panel-icon">PDF</span> Export report',
  'cPump.proTeaserHtml':
    'Enable <strong>Pro</strong> to enter suction, line and daily hours; you get <strong>installation alerts</strong> and a more realistic <strong>service factor</strong> for continuous duty. <a class="pro-install-teaser__cta" href="checkout.html">Enable Pro</a>',
  'cPump.proTeaserCta': 'Enable Pro',
  'cPump.presetChilledTooltip': 'Water, Q 120 m\u00b3/h, H 32 m, \u03b7 76 %.',
  'cPump.presetProcessTooltip': 'Brine, Q 65 m\u00b3/h, H 48 m, \u03b7 72 %.',
  'cPump.presetViscousTooltip': 'Hot oil, Q 28 m\u00b3/h, H 22 m, \u03b7 62 %.',
  'cPump.tipCoupling':
    'Direct drive or geared motor. Changes how the suggested drive is interpreted.',
  'cPump.tipVoltage': 'Supply voltage for documentation. Demo catalog does not filter by voltage.',
  'cPump.tipFreq': 'Mains frequency (Hz). Useful for consistency with motor nominal speed.',
  'cPump.tipVerifyBrand': 'Demo catalogue manufacturer.',
  'cPump.tipVerifySearch': 'Search by code or text in the model list.',
  'cPump.tipVerifyModel': 'Compare catalog model with calculated power, torque and pump shaft rpm.',
  'cPump.labelFlowHtml':
    'Flow Q <span class="info-chip" data-i18n-attrs="title=cPump.tipFlow" title="Volumetric flow at duty point." aria-label="Help flow.">?</span>',
  'cPump.labelFlowUnitHtml':
    'Flow unit <span class="info-chip" data-i18n-attrs="title=cPump.tipFlowUnit" title="m\u00b3/h or L/min." aria-label="Help flow unit.">?</span>',
  'cPump.labelHeadHtml':
    'Total head H <span class="info-chip" data-i18n-attrs="title=cPump.tipHead" title="Total equivalent head." aria-label="Help head.">?</span>',
  'cPump.labelPumpEffHtml':
    'Pump efficiency \u03b7 <span class="info-chip" data-i18n-attrs="title=cPump.tipEta" title="Efficiency at (Q, H)." aria-label="Help pump efficiency.">?</span>',
  'cPump.labelFluidTypeHtml':
    'Fluid <span class="info-chip" data-i18n-attrs="title=cPump.tipFluidType" title="Fluid presets." aria-label="Help fluid.">?</span>',
  'cPump.labelDensityHtml':
    'Density \u03c1 <span class="info-chip" data-i18n-attrs="title=cPump.tipDensity" title="kg/m\u00b3." aria-label="Help density.">?</span>',
  'cPump.labelViscosityHtml':
    'Kinematic viscosity <span class="info-chip" data-i18n-attrs="title=cPump.tipViscosity" title="cSt." aria-label="Help viscosity.">?</span>',
  'cPump.labelTempHtml':
    'Operating temperature <span class="info-chip" data-i18n-attrs="title=cPump.tipTemp" title="Fluid temperature." aria-label="Help temperature.">?</span>',
  'cPump.labelSuctionHtml':
    'Suction gauge pressure <span class="info-chip" data-i18n-attrs="title=cPump.tipSuction" title="Gauge kPa at suction." aria-label="Help suction pressure.">?</span>',
  'cPump.labelPipeDiamHtml':
    'Pipe ID (discharge) <span class="info-chip" data-i18n-attrs="title=cPump.tipPipeDiam" title="Inner diameter for line velocity." aria-label="Help pipe diameter.">?</span>',
  'cPump.labelDailyHoursHtml':
    'Hours per day <span class="info-chip" data-i18n-attrs="title=cPump.tipDailyHours" title="Daily run time." aria-label="Help daily hours.">?</span>',
  'cPump.labelLoadDutyHtml':
    'Load class \u2192 service factor <span class="info-chip" data-i18n-attrs="title=cPump.tipLoadDuty" title="Drive severity class." aria-label="Help load duty.">?</span>',
  'cPump.labelServiceFactorHtml':
    'Service factor SF <span class="info-chip" data-i18n-attrs="title=cPump.tipServiceFactor" title="Design margin." aria-label="Help service factor.">?</span>',
  'cPump.labelShaftSpeedHtml':
    'Nominal pump shaft speed <span class="info-chip" data-i18n-attrs="title=cPump.tipShaftSpeed" title="Shaft rpm for torque." aria-label="Help shaft speed.">?</span>',
  'cPump.labelCouplingHtml':
    'Coupling type <span class="info-chip" data-i18n-attrs="title=cPump.tipCoupling" title="Direct or geared." aria-label="Help coupling.">?</span>',
  'cPump.labelVoltageHtml':
    'Nominal voltage <span class="info-chip" data-i18n-attrs="title=cPump.tipVoltage" title="Supply voltage." aria-label="Help voltage.">?</span>',
  'cPump.labelFreqHtml':
    'Frequency <span class="info-chip" data-i18n-attrs="title=cPump.tipFreq" title="Mains Hz." aria-label="Help frequency.">?</span>',
  'cPump.labelVerifyBrandHtml':
    'Brand <span class="info-chip" data-i18n-attrs="title=cPump.tipVerifyBrand" title="Brand." aria-label="Help brand.">?</span>',
  'cPump.labelVerifySearchHtml':
    'Filter model <span class="info-chip" data-i18n-attrs="title=cPump.tipVerifySearch" title="Filter." aria-label="Help filter.">?</span>',
  'cPump.labelVerifyModelHtml':
    'Model <span class="info-chip" data-i18n-attrs="title=cPump.tipVerifyModel" title="Catalog model." aria-label="Help model.">?</span>',
  'cPump.optFlowM3h': 'm\u00b3/h',
  'cPump.optFlowLmin': 'L/min',
  'cPump.optDutyUniform': 'Uniform load \u2014 SF \u2248 1.15',
  'cPump.optDutyModerate': 'Moderate shock \u2014 SF \u2248 1.35',
  'cPump.optDutyHeavy': 'Heavy shock \u2014 SF \u2248 1.75',
  'cPump.optDutyCustom': 'Custom',
  'cPump.presetsGroupAria': 'Centrifugal pump presets',
  'cPump.presetChilledBtn': 'HVAC \u00b7 water',
  'cPump.presetProcessBtn': 'Process \u00b7 brine',
  'cPump.presetViscousBtn': 'Oil \u00b7 viscous',
  'cPump.alertEtaHigh':
    'Efficiency \u03b7 very high for a single point: confirm on the manufacturer curve (\u03b7 usually varies with Q).',
  'cPump.alertEtaLow':
    'Low efficiency: check if the point is extrapolated or if there is wear / recirculation.',
  'cPump.alertExtendedDuty':
    'Extended duty ({hours} h/day): service factor was hardened vs. the base duty class.',
  'cPump.alertDiagUnderDesign':
    'Diagnostic: nameplate {Pmot} kW is below design power {Pdes} kW (shaft \u00d7 SF). Risk of overload or trip.',
  'cPump.alertDiagUnderShaft':
    'Diagnostic: nameplate {Pmot} kW is below shaft power {Pshaft} kW at this duty point.',
  'cPump.alertDiagMargins':
    'Diagnostic: nameplate / shaft = \u00d7{ratioShaft}; nameplate / design = \u00d7{ratioDes} (indicative margins).',
  'cPump.alertDiagEnterNameplate':
    'Diagnostic: enter nameplate motor power (kW) to compare against computed shaft and design power.',
};
