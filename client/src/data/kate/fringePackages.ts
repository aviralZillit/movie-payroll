// ============================================================
// Fringe Packages by Territory / Union / Employment Status
// Extracted from Zillit Deal Memo v21 HTML prototype
// ============================================================

export interface FringeItem {
  /** Name of the fringe cost */
  name: string;
  /** Percentage rate (0 if flat only) */
  rate: number;
  /** Flat amount per period (0 if % only) */
  flat: number;
  /** Basis / explanation of how it is calculated */
  basis: string;
  /** Whether this is a statutory (government-mandated) cost */
  statutory: boolean;
  /** True if this item only applies when HP is exclusive (added on top) */
  hpExclOnly?: boolean;
}

export interface FringePackage {
  /** Display label */
  label: string;
  /** Short badge text */
  badge: string;
  /** Line items */
  items: FringeItem[];
  /** Summary note */
  note: string;
}

export const FRINGE_PACKAGES: Record<string, FringePackage> = {
  // ── UNITED KINGDOM ──
  'uk-paye': {
    label: 'UK PAYE \u2014 Statutory Employer Costs',
    badge: 'UK PAYE',
    items: [
      { name: 'Employer National Insurance', rate: 13.8, flat: 0, basis: 'On earnings above secondary threshold (\u00a39,100/yr, 2024/25). Rate drops to 13.8% \u2014 unchanged in Spring 2024 Budget.', statutory: true },
      { name: 'Auto-Enrolment Pension (minimum)', rate: 3.0, flat: 0, basis: 'On qualifying earnings \u00a36,240\u2013\u00a350,270/yr. Total min. 8% (3% employer + 5% employee). Rises to 10% total from 2028.', statutory: true },
      { name: 'Apprenticeship Levy (0.5%)', rate: 0.5, flat: 0, basis: 'On annual PAYE bill above \u00a33m threshold. Connected companies rules: group payrolls aggregate.', statutory: true },
      { name: 'Employment Allowance (NI offset, -\u00a35k)', rate: -0.3, flat: 0, basis: 'Up to \u00a35,000/yr offset against employer NI. Not available: sole director as only employee; or if employer NI liability was \u2265\u00a3100k in prior tax year.', statutory: true },
      { name: 'HP 12.07% (if exclusive)', rate: 12.07, flat: 0, basis: 'Only applies if HP is exclusive (added on top). Not a cost if HP is inclusive within agreed rate.', statutory: true, hpExclOnly: true },
    ],
    note: 'Total UK PAYE employer cost: approx. 16\u201317% (excl. HP if inclusive). Employment Allowance reduces NI by up to \u00a35,000/yr. Apprenticeship Levy applies to the portion of annual PAYE bill above \u00a33m. No IATSE-style fringe funds under PACT/BECTU.',
  },

  'uk-psc': {
    label: 'UK Ltd Co. / PSC',
    badge: 'UK PSC / Ltd',
    items: [
      { name: 'No employer NI (outside IR35)', rate: 0, flat: 0, basis: 'B2B invoice \u2014 no social security on payments to PSC outside IR35.', statutory: true },
      { name: 'Employer NI 13.8% (inside IR35)', rate: 0, flat: 0, basis: 'If SDS determines Inside IR35: deemed employer NI 13.8% applies on gross invoice. Budget from day 1 if any risk of inside IR35 determination.', statutory: true },
      { name: 'Apprenticeship Levy \u2014 may still apply', rate: 0, flat: 0, basis: 'If deemed employment payments are classified as part of a PAYE bill that exceeds \u00a33m threshold (including connected entities), levy applies.', statutory: true },
    ],
    note: 'Outside IR35: minimal employer cost on PSC payments. Inside IR35: full employer NI 13.8% applies as deemed employer \u2014 budget accordingly. Issue SDS before first payment.',
  },

  // ── UNITED STATES ──
  'us-iatse': {
    label: 'IATSE Basic Agreement \u2014 Fringe Package',
    badge: 'IATSE Fringes',
    items: [
      { name: 'Employer FICA \u2014 Social Security', rate: 6.2, flat: 0, basis: 'On earnings up to SS wage base ($168,600, 2024). Rate: 6.2%.', statutory: true },
      { name: 'Employer FICA \u2014 Medicare', rate: 1.45, flat: 0, basis: 'On all earnings, no ceiling. Additional 0.9% employee Medicare Tax on earnings over $200k (employee-side only).', statutory: true },
      { name: 'FUTA (Federal Unemployment)', rate: 0.6, flat: 0, basis: 'Net rate after state credit on first $7,000 of wages (gross 6%, credit 5.4%).', statutory: true },
      { name: 'State UI (approx.)', rate: 3.5, flat: 0, basis: 'Varies by state: California ~3.4%, New York ~4.1%, Georgia ~2.7%. On first $7,000\u2013$45,000 of wages depending on state.', statutory: true },
      { name: 'MPIPHP Health Contribution', rate: 0, flat: 422.50, basis: 'Per employee per week actually worked (2024 IATSE Basic Agreement \u2014 verify annually with MPIPHP).', statutory: false },
      { name: 'MPIPHP Pension', rate: 7.5, flat: 0, basis: '% of gross weekly earnings. Vesting: 5 years. Verify current IATSE Basic Agreement schedule.', statutory: false },
      { name: 'Individual Account Plan (IAP)', rate: 6.0, flat: 0, basis: '% of gross earnings. Employee-directed investment account.', statutory: false },
      { name: 'Vacation / Holiday Pay', rate: 8.0, flat: 0, basis: '% of gross earnings. Per IATSE Basic Agreement \u2014 paid weekly or on wrap.', statutory: false },
      { name: 'IATSE National Training Fund', rate: 0.5, flat: 0, basis: '% of gross earnings. Industry training and education.', statutory: false },
    ],
    note: 'Total IATSE fringe: approx. 25\u201327% of weekly rate + $422.50 flat health contribution per week worked. MPIPHP rates published annually \u2014 verify current schedule. Run via IATSE-signatory payroll company.',
  },

  'us-dga': {
    label: 'DGA Basic Agreement \u2014 Fringe Package',
    badge: 'DGA Fringes',
    items: [
      { name: 'Employer FICA \u2014 SS + Medicare', rate: 7.65, flat: 0, basis: 'Standard US statutory employer FICA.', statutory: true },
      { name: 'FUTA (net)', rate: 0.6, flat: 0, basis: 'On first $7,000.', statutory: true },
      { name: 'State UI (approx.)', rate: 3.5, flat: 0, basis: 'Varies by state.', statutory: true },
      { name: 'DGA Pension Plan', rate: 6.0, flat: 0, basis: '% of DGA-covered compensation. Verify current DGA Basic Agreement 2023.', statutory: false },
      { name: 'DGA Health Plan', rate: 0, flat: 108.0, basis: 'Per week contribution (approx. 2024 \u2014 verify current DGA Basic Agreement health schedule).', statutory: false },
    ],
    note: 'DGA fringe differs from IATSE. UPMs and 1st ADs: verify current DGA Basic Agreement (2023) for exact pension and health contribution rates and earnings caps. Production fee provisions for UPMs are separate from weekly rate.',
  },

  'us-sag': {
    label: 'SAG-AFTRA TV/Streaming \u2014 Health & Pension',
    badge: 'SAG-AFTRA',
    items: [
      { name: 'Employer FICA \u2014 SS + Medicare', rate: 7.65, flat: 0, basis: 'Standard US statutory employer FICA.', statutory: true },
      { name: 'FUTA (net)', rate: 0.6, flat: 0, basis: 'On first $7,000.', statutory: true },
      { name: 'State UI (approx.)', rate: 3.5, flat: 0, basis: 'Varies by state.', statutory: true },
      { name: 'SAG-AFTRA Health & Pension', rate: 20.5, flat: 0, basis: 'On scale wages \u2014 approx. 2024 TV/Streaming Agreement. Verify against specific contract type.', statutory: false },
    ],
    note: 'SAG-AFTRA H&P: approx. 20.5% on scale wages. Total fringe approx. 32% on scale. Stunt adjustments, looping, and New Media terms differ \u2014 verify with SAG-AFTRA signatory payroll company.',
  },

  'us-w2': {
    label: 'US W-2 Non-Union \u2014 Statutory Costs',
    badge: 'US Non-Union',
    items: [
      { name: 'Employer FICA \u2014 SS + Medicare', rate: 7.65, flat: 0, basis: 'SS 6.2% on first $168,600 + Medicare 1.45% on all earnings (2024).', statutory: true },
      { name: 'FUTA (net)', rate: 0.6, flat: 0, basis: 'On first $7,000.', statutory: true },
      { name: 'State UI (approx.)', rate: 3.5, flat: 0, basis: 'Varies significantly by state.', statutory: true },
      { name: 'Workers Compensation Insurance (approx.)', rate: 2.0, flat: 0, basis: 'Varies by state and role classification: approx. 0.5\u20138%. Entertainment/film often rated separately.', statutory: true },
    ],
    note: 'Non-union W-2: no guild fringe contributions. Statutory total approx. 14\u201316%. Payroll company mark-up adds 3\u20137% typically.',
  },

  // ── IRELAND ──
  'ie-paye': {
    label: 'Ireland PAYE \u2014 Statutory Employer Costs',
    badge: 'Irish PRSI',
    items: [
      { name: 'PRSI Class A \u2014 Employer', rate: 11.05, flat: 0, basis: 'On all earnings above EUR 441/week threshold. Class A applies to most PAYE employees.', statutory: true },
      { name: 'PRSI additional rate (earnings > EUR 1,443/wk)', rate: 1.5, flat: 0, basis: 'Additional 1.5% PRSI employer rate on earnings above EUR 1,443/week from 1 Oct 2024.', statutory: true },
      { name: 'HP (8% if exclusive)', rate: 8.0, flat: 0, basis: 'On qualifying earnings. Organisation of Working Time Act 1997 minimum: 20 days/year.', statutory: true, hpExclOnly: true },
      { name: 'PRSI Training Levy', rate: 0.1, flat: 0, basis: 'Included in employer PRSI rate for training fund.', statutory: true },
    ],
    note: 'Total Irish statutory employer cost: approx. 11\u201313%. New 1.5% additional PRSI applies on weekly earnings above EUR 1,443 from October 2024. 10 Irish public holidays.',
  },

  // ── FRANCE ──
  'fr-salarie': {
    label: 'France \u2014 Cotisations Patronales (~46-47%)',
    badge: 'Cotisations FR',
    items: [
      { name: 'Maladie-Maternite (Health)', rate: 7.0, flat: 0, basis: 'On all earnings. Reduced rate 3.45% for earnings < 2.5x SMIC.', statutory: true },
      { name: 'Retraite de Base CNAV', rate: 8.55, flat: 0, basis: 'On earnings up to PSS (EUR 46,368/yr, 2024). Rate 1.9% on earnings above PSS.', statutory: true },
      { name: 'AGIRC-ARRCO (Complementaire)', rate: 6.01, flat: 0, basis: 'Tranche 1 (up to PSS): 6.01%. Tranche 2 (1x\u20138x PSS): 16.24%. CEG (CET): 2.15%.', statutory: true },
      { name: 'Assurance Chomage', rate: 4.05, flat: 0, basis: 'On earnings up to 4x PSS. Employer only.', statutory: true },
      { name: 'Allocations Familiales', rate: 5.25, flat: 0, basis: 'On all earnings. Reduced rate 3.45% for earnings < 3.5x SMIC.', statutory: true },
      { name: 'Formation Professionnelle', rate: 1.0, flat: 0, basis: 'Varies by company size: 0.55% (< 11 employees) to 1.00% (\u2265 11 employees).', statutory: true },
      { name: 'Taxe d\'Apprentissage', rate: 0.68, flat: 0, basis: '0.68% on all earnings (comprises 0.59% apprentissage + 0.09% contribution supplementaire).', statutory: true },
      { name: 'Contribution Solidarite Autonomie (CSA)', rate: 0.3, flat: 0, basis: '0.3% on all earnings. Disability solidarity contribution.', statutory: true },
      { name: 'AUDIENS \u2014 Entertainment Sector Fund', rate: 3.5, flat: 0, basis: 'Specific to film/TV/entertainment workers. Covers supplementary pension (ARRCO) and prevoyance.', statutory: false },
      { name: 'Conges Payes ICP (10%) \u2014 CDDU/Intermittent', rate: 10.0, flat: 0, basis: 'Mandatory separate holiday pay for CDDU contracts. NOT included in cachet rate \u2014 must be paid as a separate line.', statutory: true, hpExclOnly: false },
    ],
    note: 'Total French employer cotisations patronales: approx. 45\u201347% of gross salary. For intermittent CDDU workers: ICP at 10% is a mandatory additional payment on top of the agreed daily cachet rate. French payroll agent essential.',
  },

  // ── GERMANY ──
  'de-employee': {
    label: 'Germany \u2014 Sozialversicherung (~21%) + KSK',
    badge: 'Sozialversicherung',
    items: [
      { name: 'Krankenversicherung (Health)', rate: 7.3, flat: 0, basis: 'On earnings up to contribution ceiling (Beitragsbemessungsgrenze: EUR 62,100/yr, 2024).', statutory: true },
      { name: 'Rentenversicherung (Pension)', rate: 9.3, flat: 0, basis: 'On earnings up to RV ceiling (EUR 90,600/yr West, EUR 89,400/yr East, 2024).', statutory: true },
      { name: 'Arbeitslosenversicherung (Unemployment)', rate: 1.3, flat: 0, basis: 'On earnings up to RV ceiling.', statutory: true },
      { name: 'Pflegeversicherung (Care)', rate: 1.7, flat: 0, basis: 'On earnings up to KV ceiling. Childless employees pay additional 0.35% employee contribution.', statutory: true },
      { name: 'Berufsgenossenschaft \u2014 KUKA/VBG (Accident)', rate: 1.5, flat: 0, basis: 'VBG (administrative/media sector) approx. 1\u20133% of payroll. Assessed annually.', statutory: true },
      { name: 'KSK Levy (Kunstlersozialkasse)', rate: 5.0, flat: 0, basis: '5% of all fees paid to freelance artists and journalists (Freiberufler). Mandatory production obligation per KSKAtG.', statutory: false },
    ],
    note: 'Total German Sozialversicherung: approx. 21%. BUrlG: minimum 24 Werktage annual leave \u2014 cannot be rolled up (illegal). KSK levy (5%) on Freiberufler fees is a separate production obligation.',
  },

  // ── AUSTRALIA ──
  'au-payg': {
    label: 'Australia \u2014 Mandatory Employer Costs',
    badge: 'AU Super + WorkCover',
    items: [
      { name: 'Superannuation Guarantee (SG)', rate: 11.5, flat: 0, basis: 'FY2024-25 rate. Rises to 12% from 1 July 2025. On Ordinary Time Earnings (OTE).', statutory: true },
      { name: 'WorkCover / Workers Comp (approx.)', rate: 1.5, flat: 0, basis: 'State-specific: NSW 1.27%, VIC 1.10%, QLD 1.55%, WA 1.76%, SA 1.80% (2024 approx.).', statutory: true },
      { name: 'Annual Leave Loading (on accrued leave payout)', rate: 17.5, flat: 0, basis: '17.5% loading on 4 weeks annual leave pay when cashed out at contract end. NES minimum: 4 weeks/year pro-rated.', statutory: true },
      { name: 'Payroll Tax (if applicable)', rate: 4.75, flat: 0, basis: 'State payroll tax: applies above state threshold (QLD: 4.75%, NSW: 5.45%, VIC: 4.85%). Not applicable for small productions under threshold.', statutory: true },
    ],
    note: 'Super is a mandatory employer cost IN ADDITION to agreed rate. Super rises to 12% from 1 July 2025. Super paid quarterly to nominated fund \u2014 late payments attract SGC at 10% p.a.',
  },

  // ── CANADA ──
  'ca-t4': {
    label: 'Canada T4 \u2014 Statutory Employer Obligations',
    badge: 'CPP + EI + WC',
    items: [
      { name: 'CPP1 (Canada Pension Plan)', rate: 5.95, flat: 0, basis: 'On employment earnings between basic exemption ($3,500) and first ceiling ($68,500, 2024). Quebec uses QPP: 6.4% employer.', statutory: true },
      { name: 'CPP2 (Second Additional CPP \u2014 from 2024)', rate: 4.0, flat: 0, basis: 'On earnings between first ceiling ($68,500) and second ceiling ($73,200, 2024).', statutory: true },
      { name: 'EI (Employment Insurance)', rate: 1.66, flat: 0, basis: 'On insurable earnings up to $63,200 (2024). Quebec QPIP replaces EI maternity/parental: employer 0.598%.', statutory: true },
      { name: 'Workers Compensation (approx.)', rate: 1.5, flat: 0, basis: 'WorkSafeBC ~0.88-2.5%, WSIB Ontario ~0.5-1.9%, CNESST Quebec ~varies.', statutory: true },
      { name: 'Employer Health Tax (Ontario \u2014 if applicable)', rate: 1.95, flat: 0, basis: 'Ontario EHT: 0.98\u20131.95% of Ontario payroll above $1m exemption. Quebec: FSF 1.65\u20134.26%.', statutory: true },
    ],
    note: 'CPP2 from 2024 is a new cost: 4% employer + 4% employee on the band between $68,500\u2013$73,200. Quebec rates differ throughout. Payroll tax (Ontario EHT) applies if Ontario payroll exceeds $1m.',
  },

  // ── HUNGARY ──
  'hu-employee': {
    label: 'Hungary \u2014 Employer Tax (13% SZOCHO)',
    badge: 'SZOCHO 13%',
    items: [
      { name: 'Szocialis Hozzajarulasi Ado (SZOCHO)', rate: 13.0, flat: 0, basis: '13% flat social contribution tax on gross wages (from 2023, reduced from 19.5%). No ceiling.', statutory: true },
      { name: 'Szakkepzesi Hozzajarulas (Training Levy)', rate: 1.5, flat: 0, basis: '1.5% vocational training contribution on top of SZOCHO.', statutory: true },
    ],
    note: 'Total Hungarian employer cost: 14.5% (SZOCHO 13% + training levy 1.5%). Employee deductions: 18.5% (pension 10%, health 7%, labour market 1.5%).',
  },

  // ── SPAIN ──
  'es-employee': {
    label: 'Spain \u2014 Seguridad Social (~31% Employer)',
    badge: 'Seg. Social ES',
    items: [
      { name: 'Contingencias Comunes', rate: 23.6, flat: 0, basis: 'On earnings up to base maximum (EUR 4,720.50/month, 2024).', statutory: true },
      { name: 'Desempleo \u2014 Contrato Indefinido', rate: 5.5, flat: 0, basis: 'Unemployment insurance. 6.7% for temporary contracts (CDD).', statutory: true },
      { name: 'FOGASA (Wage Guarantee Fund)', rate: 0.2, flat: 0, basis: 'Fondo de Garantia Salarial \u2014 covers wages if employer insolvent.', statutory: true },
      { name: 'Formacion Profesional', rate: 0.6, flat: 0, basis: 'Professional training levy.', statutory: true },
      { name: 'MEI (Mecanismo Equidad Intergeneracional)', rate: 0.46, flat: 0, basis: 'From January 2023. Employer 0.46% + employee 0.12% = 0.58% total.', statutory: true },
      { name: '13th/14th Month Pay (effective annual cost)', rate: 7.7, flat: 0, basis: 'Two mandatory extra salary payments = 2 additional monthly salaries per year. Effective monthly uplift: ~7.7% on weekly basis.', statutory: true },
    ],
    note: 'Total Spanish employer Seguridad Social: approx. 30.4% (including MEI). Add ~7.7% effective for mandatory 13th/14th months = approx. 38% total employer cost.',
  },

  // ── ITALY ──
  'it-employee': {
    label: 'Italy \u2014 Contributi Previdenziali (~44-50%)',
    badge: 'INPS + TFR IT',
    items: [
      { name: 'INPS \u2014 Invalidita, Vecchiaia, Superstiti (IVS)', rate: 23.81, flat: 0, basis: 'Pension/disability/survivors insurance. On all earnings. CCNL Cinema e Audiovisivo applies.', statutory: true },
      { name: 'INPS \u2014 Disoccupazione (NASpI)', rate: 1.61, flat: 0, basis: 'Unemployment insurance (NASpI). On all earnings.', statutory: true },
      { name: 'INPS \u2014 Maternita, Malattia (Sickness/Maternity)', rate: 2.22, flat: 0, basis: 'Combined health/maternity fund contributions.', statutory: true },
      { name: 'INAIL (Accident Insurance)', rate: 1.5, flat: 0, basis: 'Varies by risk category and CCNL sector: approx. 0.5\u20133% for film/TV roles.', statutory: true },
      { name: 'TFR (Trattamento Fine Rapporto \u2014 Severance Fund)', rate: 6.91, flat: 0, basis: 'Of gross annual salary. Accrues monthly, paid to employee on termination.', statutory: true },
      { name: 'Tredicesima (13th month \u2014 mandatory)', rate: 8.33, flat: 0, basis: 'One additional full monthly salary payable in December. Mandatory under CCNL Cinema.', statutory: true },
      { name: 'Quattordicesima (14th month \u2014 CCNL Cinema)', rate: 8.33, flat: 0, basis: 'Second additional monthly salary (typically June/July). Required under CCNL Cinema e Audiovisivo for certain grades.', statutory: true },
    ],
    note: 'Total Italian employer cost: approx. 44\u201350% (INPS ~27.6%, INAIL ~1.5%, TFR ~7%, tredicesima ~8.3%, quattordicesima ~8.3% for applicable grades). Commercialista and specialist entertainment payroll provider essential.',
  },

  // ── NEW ZEALAND ──
  'nz-paye': {
    label: 'New Zealand \u2014 Employer Obligations',
    badge: 'ACC + KiwiSaver',
    items: [
      { name: 'ACC Employer Levy', rate: 1.21, flat: 0, basis: 'Entertainment/media industry classification (2024/25 rate: approx. 1.21%). Rates set annually by WorkSafe/ACC.', statutory: true },
      { name: 'KiwiSaver \u2014 Employer Minimum', rate: 3.0, flat: 0, basis: '3% of gross wages. Compulsory unless employee validly opted out in weeks 2\u20138 of employment.', statutory: true },
      { name: 'Paid Parental Leave (PPL) Employer Contribution', rate: 0, flat: 0, basis: 'Government funded \u2014 no direct employer cost beyond normal employment continuation.', statutory: true },
    ],
    note: 'Total NZ mandatory employer cost: approx. 4\u20135%. For casual workers: 8% rolled-up holiday pay on each invoice instead of 4-week annual accrual.',
  },

  // ── SOUTH AFRICA ──
  'za-employee': {
    label: 'South Africa \u2014 Statutory Employer Costs',
    badge: 'UIF + SDL + COIDA',
    items: [
      { name: 'UIF (Unemployment Insurance Fund)', rate: 1.0, flat: 0, basis: '1% employer + 1% employee on earnings up to monthly ceiling (ZAR 17,712/month, 2024).', statutory: true },
      { name: 'SDL (Skills Development Levy)', rate: 1.0, flat: 0, basis: '1% of monthly payroll. Applies if annual payroll exceeds R500,000.', statutory: true },
      { name: 'COIDA (Compensation Fund)', rate: 1.5, flat: 0, basis: 'Compensation for Occupational Injuries and Diseases. Rate varies by risk class \u2014 entertainment/film approx. 0.5\u20132%.', statutory: true },
      { name: 'ETI (Employment Tax Incentive \u2014 offset)', rate: -0.5, flat: 0, basis: 'Available for qualifying employees aged 18\u201329 earning under R6,500/month. Reduces employer PAYE liability.', statutory: true },
    ],
    note: 'Total SA statutory employer cost: approx. 3\u20134% (excl. ETI offset). EMP201 monthly submission to SARS covers PAYE, UIF, and SDL.',
  },

  // ── DEFAULT ──
  default: {
    label: 'Statutory Employer Costs \u2014 Verify Locally',
    badge: 'Verify Locally',
    items: [
      { name: 'Social Security / Employer Contributions', rate: 0, flat: 0, basis: 'Verify with local employment counsel and payroll specialist.', statutory: true },
    ],
    note: 'Engage local employment specialist to confirm all employer obligations for this territory. Fringe costs, social security rates, and HP treatment vary significantly by jurisdiction.',
  },
};
