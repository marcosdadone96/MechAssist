/** English strings for flat-conveyor.html (`flatConv.*` keys). ASCII-safe. */
export const FLAT_CONVEYOR_EN = {
  'flatConv.docTitle':
    'Flat belt conveyor calculator online \u2014 TheMechAssist',
  'flatConv.metaDesc':
    'Belt tension, drum power and indicative gearmotor check on flat belts. Bulk handling. Free online.',
  'flatConv.ogTitle': 'Flat belt conveyor calculator online',
  'flatConv.ogDesc':
    'Belt tension, drum power and indicative gearmotor check on flat belts. Bulk handling. Free online.',
  'flatConv.twitterTitle': 'Flat belt conveyor calculator online',

  'flatConv.flatSidebarTitle': 'Flat belt',
  'flatConv.calcSeoIntro':
    'This calculator ties bulk mass on the belt, belt speed and drive drum diameter into estimates of effective traction, shaft power at the drum and margin versus a specific gearmotor, using simplified analytic approaches aligned with ISO literature plus the service surcharge documented in CEMA style. It gives plant engineers, integrators and maintenance leads a quick sanity check when throughput or belt width changes. A common case is deciding whether retensioning is enough or power must rise after extending the loaded section on a feeding line.',
  'flatConv.leadHtml':
    'Consistent torque and power at the drum. Inputs recalculate instantly; use the right-hand panel for the schematic and results dashboard.',

  'flatConv.helpSummary': 'Quick guide for each parameter',
  'flatConv.helpLeadHtml':
    'Almost every label has a <span class="info-chip info-chip--static" aria-hidden="true">?</span>: on desktop, hover; on touch, <strong>tap</strong> the same symbol for help without lengthening the form.',
  'flatConv.helpLiLHtml':
    '<strong>L</strong>: length of the <strong>loaded run</strong> used by the model to spread nominal mass (mass flow \u2248 (m/L)\u00b7v). It need not match total installed belt length.',
  'flatConv.helpLiMHtml':
    '<strong>m</strong>: nominal load mass associated with that run L (uniform spread model).',
  'flatConv.helpLiVDmuHtml':
    '<strong>v, D, \u03bc, \u03b7</strong>: speed, drive drum diameter, equivalent friction and efficiency <strong>from motor to drum</strong> (single chain; typically 85\u201392 % if it lumps motor+gearbox+coupling).',
  'flatConv.helpLiNormHtml':
    '<strong>Standard</strong>: declared framework in reports \u2014 <strong>ISO/DIN</strong> uses a simplified analytic approach (not a full DIN 22101 memo); <strong>CEMA</strong> applies +6 % on steady traction only (not the full CEMA manual).',
  'flatConv.helpLiDutyHtml':
    '<strong>Load duty</strong>: sets the service factor (AGMA/ISO oriented); \u201cCustom\u201d unlocks the numeric field.',
  'flatConv.helpLiEtaHtml':
    '<strong>\u03b7</strong>: if it exceeds 100 %, the app warns and caps the calculation at 99 %.',

  'flatConv.accGeom': 'Geometry and kinematics',
  'flatConv.accLoad': 'Load',
  'flatConv.accFriction': 'Friction and efficiency',
  'flatConv.accNormSf': 'Standard and service factor',

  'flatConv.labelCarrySurfaceHtml':
    'Carrying strand <span class="info-chip" title="Rollers: load on idlers (\u03bc usually lower). Slide plate: belt on sheet/UHMW (\u03bc often higher; D is still the drive drum for torque and rpm)." aria-label="Help carrying strand: rollers vs slide plate and \u03bc.">?</span>',
  'flatConv.optCarryRollers': 'Rollers (rolling support)',
  'flatConv.optCarrySlide': 'Slide plate (boxes, steel, UHMW\u2026)',

  'flatConv.labelBeltLengthHtml':
    'Length L <span class="info-chip" title="Loaded run: the model spreads mass m over L giving mass flow \u2248 (m/L)\u00b7v. Not necessarily total belt length on site." aria-label="Help L: loaded run for mass spread; not total length.">?</span>',
  'flatConv.ariaSliderL': 'L (slider)',

  'flatConv.labelRollerDHtml':
    'Drive drum diameter D <span class="info-chip" title="Drive drum diameter (T = F\u00d7R, R = D/2). Light conveyors often use smaller drums; always validate minimum drum diameter with the belt supplier." aria-label="Help drum diameter.">?</span>',
  'flatConv.ariaSliderD': 'D (slider)',

  'flatConv.labelBeltSpeedHtml':
    'Speed v <span class="info-chip" title="Belt line speed at steady state. Enters power (F\u00b7v) and drum rpm from v and D." aria-label="Help belt speed.">?</span>',
  'flatConv.ariaSliderV': 'v (slider)',

  'flatConv.labelLoadMassHtml':
    'Load mass m <span class="info-chip" title="Nominal mass on run L; model assumes uniform distribution." aria-label="Help load mass.">?</span>',
  'flatConv.ariaSliderM': 'm (slider)',

  'flatConv.labelFrictionHtml':
    'Coefficient \u03bc <span class="info-chip" title="Global Coulomb friction: on rollers, belt\u2013roller; on slide plate, belt\u2013plate/liner (\u03bc often higher). When unsure, pick a slightly higher value (more conservative power). Use the table below." aria-label="Help friction coefficient.">?</span>',
  'flatConv.ariaSliderMu': '\u03bc (slider)',

  'flatConv.muTableSummary': 'Typical \u03bc table',
  'flatConv.muTableLeadHtml':
    '\u03bc here is a <strong>global indicative coefficient</strong>: it lumps roller friction, belt bending and material. When unsure, pick a value <strong>slightly above</strong> your best estimate (more conservative = more power).',
  'flatConv.muThSituation': 'Typical situation',
  'flatConv.muThMu': 'Indicative \u03bc',
  'flatConv.muR1c1': 'Free rollers, dry rubber belt, good maintenance',
  'flatConv.muR1c2': '0.22 \u2013 0.30',
  'flatConv.muR2c1': 'General industrial (light dust, standard rollers)',
  'flatConv.muR2c2': '0.30 \u2013 0.40',
  'flatConv.muR3c1': 'Wet, mud, or irregular maintenance',
  'flatConv.muR3c2': '0.40 \u2013 0.55',
  'flatConv.muR4c1': 'Wet belt with oil or greasy product',
  'flatConv.muR4c2': '\u2265 0.55 (validate with supplier)',
  'flatConv.muR5c1': 'Very sticky material or high drag (use caution)',
  'flatConv.muR5c2': '\u2265 0.50 (validate on site)',
  'flatConv.muPresetLabel': 'Apply to \u03bc:',

  'flatConv.labelEfficiencyHtml':
    'Efficiency \u03b7 <span class="info-chip" title="From electric motor power to drum: gearbox, coupling and whatever is between them, as one value. E.g. ~88 % if ~12 % losses. Do not discount motor efficiency again. If \u03b7 &gt; 100 % the app warns." aria-label="Help efficiency to drum.">?</span>',

  'flatConv.labelServiceFactorHtml':
    'Service factor (number) <span class="info-chip" title="Synced with Load duty below (read-only here except Custom). Same factor applied to design torque." aria-label="Help service factor field.">?</span>',
  'flatConv.labelDesignStandardHtml':
    'Reference standard <span class="info-chip" title="For reports. ISO/DIN: simplified analytic model here (not full DIN 22101). CEMA: +6 % on steady traction only. Limits: see Model assumptions at page end." aria-label="Help design standard.">?</span>',
  'flatConv.optIso5048':
    'ISO 5048 / DIN 22101 \u2014 analytic approach (default)',
  'flatConv.optCema': 'CEMA \u2014 +6 % margin on steady traction',
  'flatConv.labelLoadDutyHtml':
    'Load duty (sets SF) <span class="info-chip" title="Service class (AGMA/ISO oriented). Sets the numeric factor above except Custom, where you edit the number." aria-label="Help load duty.">?</span>',
  'flatConv.optDutyUniform': 'Uniform load \u2014 SF \u2248 1.15',
  'flatConv.optDutyModerate': 'Moderate shock \u2014 SF \u2248 1.35',
  'flatConv.optDutyHeavy': 'Heavy shock \u2014 SF \u2248 1.75',
  'flatConv.optDutyCustom':
    'Custom (edit Service factor above)',

  'flatConv.modelScopeHtml':
    '<strong>Model:</strong> horizontal \u00b7 Coulomb \u00b7 no Euler. <a href="#flat-conveyor-assumptions">Assumptions and exclusions</a>',

  'flatConv.advSummaryHtml':
    'Advanced options \u2014 belt detail, load, startup and extras <span class="field-badge field-badge--optional">Advanced</span>',
  'flatConv.advNoteHtml':
    '<strong>When to open this:</strong> to include <strong>belt weight</strong>, load partly off idlers, <strong>scrapers/guides</strong> as extra force, or refine <strong>startup</strong> (time to reach v and rotational inertia). If you lack data, keep defaults: <strong>0</strong> belt mass excludes it; <strong>1</strong> active fraction = all load on idlers. Each field has <strong>?</strong> with an explanation.',

  'flatConv.labelBeltWidthHtml':
    'Belt width B <span class="info-chip" title="Geometric reference for reports/PDF. This calculator\u2019s \u03bc does not use B." aria-label="Help belt width.">?</span>',
  'flatConv.labelBeltMassHtml':
    'Belt mass m_b <span class="info-chip" title="Total belt mass. Adds friction from dead load (carry + return) and mass accelerated at startup. 0 = ignored." aria-label="Help belt mass.">?</span>',
  'flatConv.labelLoadDistHtml':
    'Active load fraction f_dist <span class="info-chip" title="Share of mass m that creates normal on idlers (0.05\u20131). 1 = all load on idlers; lower if weight goes to structure, hopper, etc." aria-label="Help active load fraction.">?</span>',
  'flatConv.labelBeltCarryFracHtml':
    'Belt on carry strand <span class="info-chip" title="Share of belt mass on the top strand; remainder on return. Affects normals and belt friction." aria-label="Help belt carry fraction.">?</span>',
  'flatConv.labelAddResHtml':
    'Additional resistance F_ad <span class="info-chip" title="Sum of constant resisting forces in N not in \u03bc: scrapers, guides, cleaners, etc." aria-label="Help additional resistance.">?</span>',
  'flatConv.labelAccelTimeHtml':
    'Acceleration time t_ac <span class="info-chip" title="Time to reach speed v from standstill. Shorter \u21d2 higher acceleration force on load + belt." aria-label="Help acceleration time.">?</span>',
  'flatConv.labelInertiaHtml':
    'Inertia factor k_in <span class="info-chip" title="\u22651 scales startup force beyond mass\u00d7acceleration: simplified drums, couplings, rotating mass." aria-label="Help inertia factor.">?</span>',

  'flatConv.btnSuggestedMotors': 'View suggested gearmotors',
  'flatConv.btnSuggestedMotorsTitle':
    'Scrolls to suggested gearmotors (calculation is already live)',
  'flatConv.calcHintHtml':
    'Results and diagram <strong>update automatically</strong>. This button expands suggested gearmotors.',

  'flatConv.dashboardTitle': 'Sizing dashboard',
  'flatConv.dashboardLeadHtml':
    'Design torque = max(steady, startup) \u00d7 SF. Power <strong>(T<sub>design</sub> \u00d7 \u03c9) / \u03b7</strong>. <a href="#flat-conveyor-assumptions">Assumptions</a> \u00b7 hover <strong>L, D, F, v</strong> on the schematic.',

  'flatConv.visualSectionAria': 'Schematic and reference photo',
  'flatConv.diagramSvgAria': 'Qualitative flat belt schematic',
  'flatConv.diagramTipsTitle': 'Technical notes',
  'flatConv.diagramTip1Html':
    '<strong>Top of the schematic:</strong> compares <strong>steady-state</strong> text (without service factor) versus <strong>design</strong> (with SF and \u03b7 applied).',
  'flatConv.diagramTip2Html':
    '<strong>Carrying strand:</strong> <strong>L</strong> and <strong>D</strong> match the form; the drawing is <strong>qualitative</strong>.',
  'flatConv.diagramTip3Html':
    '<strong>Bottom boxes:</strong> repeat steady-state values (left) and motor sizing (right), aligned with <strong>Final results</strong>.',

  'flatConv.photoAlt': 'Real conveyor installation with belt and structure (example)',
  'flatConv.photoCaptionHtml':
    'Reference: conveyor on site (example). <a href="https://commons.wikimedia.org/wiki/File:Conveyor_belt_(2).jpg" target="_blank" rel="noopener">Wikimedia Commons</a>.',

  'flatConv.verifyH2Html':
    '<span class="panel-icon">\u2713</span> Check a gearmotor I already have',
  'flatConv.verifyLeadHtml':
    '<strong>Two ways:</strong> (1) Brand and model from the <strong>sample catalog</strong> below and button \u201cCheck for this machine\u201d. (2) If your unit is not listed, open <em>Or enter my gearmotor manually</em> (just below), fill nameplate/spec data and click \u201cCheck with these values\u201d. Both compare motor power, rated output torque and output rpm with the computed duty.',
  'flatConv.labelVerifyBrandHtml':
    'Brand <span class="info-chip" title="Demo catalog manufacturer. Filters models in the list." aria-label="Brand help.">?</span>',
  'flatConv.labelVerifySearchHtml':
    'Filter model <span class="info-chip" title="Search by code or text in the designation; narrows the model list." aria-label="Model filter help.">?</span>',
  'flatConv.labelVerifyModelHtml':
    'Catalog model <span class="info-chip" title="Expanded sample list in code. Verification uses the same duty point (torque, power, drum rpm) as Final results." aria-label="Catalog model help.">?</span>',
  'flatConv.verifyRunBtn': 'Check for this machine',

  'flatConv.engDetailsTitle': 'Engineering breakdown',
  'flatConv.engDetailsHint':
    'Collapsed by default \u2014 expand for intermediate calculations and rationale',
  'flatConv.engDetailsLead':
    'Intermediate math, gearbox summary, three motor strategies and engineering rationale.',

  'flatConv.motorsSectionTitle':
    'Gearmotors (SEW-Eurodrive, Siemens Simogear, Nord, Bonfiglioli, Motovario)',
  'flatConv.motorsSectionHint':
    'Collapsed by default \u2014 expand for recommendations, export and verification',

  'flatConv.assumptionsTitle': 'Model assumptions',
  'flatConv.assumptionsHint':
    'Assumptions and limits used in the calculation (horizontal, Coulomb, no Euler\u2026)',

  'flatConv.pdfExportH2Html':
    '<span class="premium-flag">Pro</span> <span class="panel-icon">PDF</span> Export report',

  'flatConv.fileProtoWarn':
    'Recommendation: use a local HTTP server (from the project folder run npx --yes serve . and open the URL shown, e.g. http://localhost:3000). Opening the HTML file directly may block JavaScript and hide results and diagrams.',
};
