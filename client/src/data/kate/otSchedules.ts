// ============================================================
// OT (Overtime) Schedules by Union
// Extracted from Zillit Deal Memo v21 HTML prototype
// ============================================================

export interface OTRow {
  /** Period description */
  p: string;
  /** Hours description */
  h: string;
  /** Multiplier string */
  m: string;
  /** Additional note */
  note: string;
}

export interface OTSchedule {
  /** Agreement note / description */
  note: string;
  /** Hours divisor for hourly rate calculation */
  divisor: number;
  /** OT breakdown rows */
  rows: OTRow[];
}

export const OT_SCHEDULES: Record<string, OTSchedule> = {
  'pact-bectu': {
    note: 'PACT/BECTU Scripted TV Agreement 2023. Basic Daily Rate = 10 Contracted Hours. Hourly Rate = Daily Rate / 10. ALL overtime flat at 1.5T (min \u00a335/hr, max \u00a370/hr). Enhanced 2T only: after 11pm, UK Bank Holidays, 7th consecutive day. Accrues in 15-min increments. No grace periods on camera OT.',
    divisor: 10,
    rows: [
      { p: 'Contracted Hours', h: 'Hrs 1 \u2013 10', m: 'x 1.0', note: 'Basic Daily Rate covers 10 Contracted Hours' },
      { p: 'Additional Contracted Hour', h: '11th hr (special depts only)', m: 'x 1.0', note: 'ADs, Costume, Hair & Make-Up, Locations, Production, Script Supervisors. At Hourly Rate \u2014 NOT overtime' },
      { p: 'Overtime (all standard OT)', h: 'All hrs beyond contracted', m: 'x 1.5', note: 'Minimum \u00a335/hr, maximum \u00a370/hr (or Hourly Rate at 1T if greater). 15-min increments. Applies shooting & non-shooting.' },
      { p: 'Early Call (before 06:00)', h: 'Per 15 mins before 06:00', m: 'x 1.5', note: '0.5T enhancement on time before 06:00. NOT overtime \u2014 not capped at max OT rate. Rounded up to nearest 15 mins.' },
      { p: 'Broken Turnaround', h: 'Hrs worked within 11-hr rest', m: 'x 1.5', note: '0.5T enhancement for each 15 mins within turnaround \u2014 OR equivalent compensatory rest given back.' },
      { p: '6th Consecutive Shooting Day', h: 'Full shooting day', m: 'x 1.5', note: 'Entire day rate paid at 1.5T. If 6th day is a UK Bank Holiday: 2T.' },
      { p: '6th Day Non-Shooting (up to 6 hrs)', h: 'Hrs 1-6', m: 'x 1.0', note: 'Requires prior written approval. No prior approval = no payment.' },
      { p: '6th Day Non-Shooting (over 6 hrs)', h: 'Hrs 6+', m: 'x 1.5', note: 'Requires prior written approval.' },
      { p: 'Night Work (shooting hrs past 11pm)', h: 'Aggregated weekly', m: '+1T', note: 'Night Work aggregated per week (capped at 1 working day). Either compensatory rest by end of week, OR paid additional 1T (total 2T for those hours).' },
      { p: 'Enhanced OT \u2014 after 11pm', h: 'OT hours past 23:00', m: 'x 2.0', note: 'ALL overtime after 11pm at Enhanced Rate (2T), shooting or non-shooting. Min \u00a335/hr, max \u00a370/hr still apply.' },
      { p: 'Enhanced OT \u2014 UK Bank Holiday', h: 'All hours worked', m: 'x 2.0', note: '2T on Bank Holidays. Band 4 only: worker also paid at Daily Rate even if NOT working on bank holiday.' },
      { p: '7th Consecutive Day', h: 'All hours', m: 'x 2.0', note: 'Requires prior written approval. Producers will NOT schedule 7 consecutive filming days. 8 consecutive days strictly prohibited.' },
      { p: 'Meal Break Penalty', h: 'Per 15 mins delayed/curtailed', m: 'OT Rate', note: 'At Overtime Rate (1.5T, min \u00a335/hr, max \u00a370/hr). Capped: 1 hr on SWD, 30 mins on SCWD. Penalty also applies at 2T when OT is at Enhanced Rate.' },
      { p: 'Split Day Premium', h: 'Days beyond cap', m: '+\u00a330/day', note: 'Engagements >7 weeks: cap of 40% filming days as Split Days (9pm-11pm camera finish). \u00a330 premium per day beyond cap.' },
      { p: '11-Day Fortnight Premium', h: '6th days beyond cap', m: '+\u00a3100/day', note: 'Cap: 4 sixth-days for 0-8 shoot weeks, +1 per additional 4 weeks. \u00a3100 per additional 6th day beyond cap.' },
    ],
  },

  'pact-mmp': {
    note: 'PACT/BECTU MMP 2021. Feature film or single global SVOD piece, budget >= \u00a330m. Standard Working Week: 55 hrs (5 days x 11 hrs). Hourly Rate = weekly rate / 55, or daily rate / 11. Camera OT: 2T, no grace period, first 2 hrs in 15-min increments, 3rd hr+ in full-hour increments. Non-Camera OT: 1.5T in 30-min increments. ALL OT capped at \u00a381.82/hr. Min Camera OT: \u00a325/hr.',
    divisor: 11,
    rows: [
      { p: 'Contracted Hours (SWD)', h: '11 hrs worked + 1 hr unpaid lunch', m: 'x 1.0', note: '55-hr standard week. Daily rate covers 11 worked hours.' },
      { p: 'Contracted Hours (CWD)', h: '10 hrs without formal break', m: 'x 1.0', note: 'Also paid as 11 worked hours. Preferred for high-schedule productions.' },
      { p: 'Contracted Hours (SCWD)', h: '10 hrs + 30 min break', m: 'x 1.0', note: 'Also paid as 11 worked hours. Only where location/director requires.' },
      { p: 'Camera OT \u2014 hrs 1 and 2', h: '15-min increments, pro-rated', m: 'x 2.0', note: 'No grace period. Min \u00a325/hr Camera OT. Max \u00a381.82/hr. Camera wrap called once.' },
      { p: 'Camera OT \u2014 3rd hour+', h: 'Full hours (NOT pro-rated)', m: 'x 2.0', note: 'From 3rd hour, partial hours not pro-rated. Best practice: avoid 3rd hr Camera OT. Max \u00a381.82/hr.' },
      { p: 'Non-Camera OT (pre-calls, wrap, de-rigs)', h: '30-min increments, pro-rated', m: 'x 1.5', note: 'Includes pre-calls and de-rigs. Max \u00a381.82/hr.' },
      { p: 'Pre-Dawn Call (before 05:00)', h: 'Until 05:00', m: 'x 2.0', note: '2T until 05:00. Normal rate from 05:00. NOT Night Work. Max \u00a381.82/hr applies.' },
      { p: '6th Consecutive Day (shooting)', h: 'Actual hours worked', m: 'x 1.5', note: 'Min guarantee: 8 hrs. OT on 6th day at applicable Camera or Non-Camera rate.' },
      { p: '6th Consecutive Day (non-shooting)', h: 'Actual hours worked', m: 'x 1.5', note: 'Min guarantee: 6 hrs.' },
      { p: '7th Consecutive Day', h: 'Actual hours worked', m: 'x 2.0', note: 'Min guarantee: 8 hrs shooting / 6 hrs non-shooting. All OT on 7th day also at 2T.' },
      { p: 'Night Work (past midnight / call 00:00-03:00)', h: 'Per night worked', m: '+\u00a320', note: 'Night Work Premium: \u00a320 per night. PLUS turnaround day payment at standard daily rate at end of Night Work block.' },
      { p: 'Bank Holiday (contracted, not working)', h: 'Full day', m: 'x 1.0', note: 'Paid at standard daily fee even when not required to work \u2014 for ALL grades (not just Band 4).' },
      { p: 'Bank Holiday (working)', h: 'All hours', m: 'x 2.0', note: '2T for all hours worked. Max \u00a381.82/hr.' },
      { p: 'Broken Turnaround', h: '30-min increments', m: 'x 1.5', note: 'Capped at \u00a345/hr (\u00a322.50 per 30 mins). Compensatory rest preferred where possible.' },
      { p: 'Meal Break Delay (SWD/SCWD)', h: '15-min increments', m: 'x 1.0', note: 'At standard Hourly Rate (1T) for the period of delay.' },
      { p: 'Meal Break Curtailment (shooting crew)', h: '15-min increments', m: 'x 2.0', note: 'At Camera OT rate. Capped: 1 hr on SWD, 30 mins on SCWD. Non-shooting: 1.5T in 30-min increments.' },
      { p: 'High Earner OT (weekly rate > \u00a33,000)', h: 'Case-by-case negotiation', m: 'Negotiated', note: 'Applies to: 1st AD, DOP, Editor, Producer, Production Designer, PM/UPM, Set Decorator, VFX Supervisor, etc. Subject to max \u00a381.82/hr.' },
    ],
  },

  'pact-equity': {
    note: 'Equity performers \u2014 session/day rates by agreement. OT and rest day by mutual agreement. Background performers: PACT/Equity Background Agreement.',
    divisor: 8,
    rows: [
      { p: 'Standard Session (up to 4 hrs)', h: 'Half day', m: 'x 0.5', note: '' },
      { p: 'Full Session Day', h: 'Up to 8 hrs', m: 'x 1.0', note: '' },
      { p: 'Additional Hours', h: 'Each additional hr beyond session', m: 'Mutually agreed', note: '' },
    ],
  },

  'bectu-anim': {
    note: 'BECTU Animation Agreement. Day rate covers contracted hours per agreement. OT structure similar to PACT/BECTU.',
    divisor: 8,
    rows: [
      { p: 'Contracted Day', h: 'Hrs 1 \u2013 8', m: 'x 1.0', note: '' },
      { p: 'OT Band 1', h: 'Hrs 8 \u2013 10', m: 'x 1.25', note: '' },
      { p: 'OT Band 2', h: 'Hrs 10 \u2013 12', m: 'x 1.5', note: '' },
      { p: 'OT Band 3', h: 'Hrs 12+', m: 'x 2.0', note: '' },
    ],
  },

  'iatse-600': {
    note: 'IATSE Local 600. Studio: 8-hr contracted day, rate div 8. Location: 10-hr guaranteed minimum call, rate div 10. Turnaround: 9 hrs studio / 10 hrs location. Meal break within 6 hrs. Gold Time after 14 hrs from general crew call.',
    divisor: 8,
    rows: [
      { p: 'Straight Time (Studio)', h: 'Hrs 1 \u2013 8', m: 'x 1.0', note: '8-hr guaranteed minimum call' },
      { p: 'Location Guarantee', h: 'Hrs 1 \u2013 10', m: 'x 1.0', note: '10-hr guaranteed call on location (rate div 10)' },
      { p: 'Daily OT', h: 'Hrs 8/10 \u2013 12', m: 'x 1.5', note: 'Time and a half \u2014 from end of guarantee' },
      { p: 'Double Time', h: 'Hrs 12 \u2013 14', m: 'x 2.0', note: 'All hours after 12th (studio) / 12th (location)' },
      { p: 'GOLD TIME', h: 'Hrs 14+', m: 'x 2.0', note: 'GOLD TIME status \u2014 all hrs at double time, steward notification required' },
      { p: '6th Consecutive Day (hrs 1-8/10)', h: 'Studio/Location guarantee', m: 'x 1.5', note: 'All 6th day guaranteed hours at time+half' },
      { p: '6th Day OT', h: 'Beyond guarantee', m: 'x 2.0', note: 'Double time' },
      { p: '7th Day / Federal Holiday', h: 'All hours', m: 'x 2.0', note: 'Double time all hours' },
    ],
  },

  'iatse-728': {
    note: 'IATSE Local 728 (Studio Electrical Lighting Technicians). Same overtime and Gold Time structure as IATSE national. Studio: 8 hrs. Location: 10 hrs. Turnaround: 9/10 hrs.',
    divisor: 8,
    rows: [
      { p: 'Straight Time', h: 'Hrs 1 \u2013 8', m: 'x 1.0', note: 'Studio \u2014 8-hr guaranteed call' },
      { p: 'Location Guarantee', h: 'Hrs 1 \u2013 10', m: 'x 1.0', note: '10-hr call on location' },
      { p: 'Daily OT', h: 'Hrs 8/10 \u2013 12', m: 'x 1.5', note: '' },
      { p: 'Double Time', h: 'Hrs 12 \u2013 14', m: 'x 2.0', note: '' },
      { p: 'GOLD TIME', h: 'Hrs 14+', m: 'x 2.0', note: 'Gold Time status \u2014 notify steward' },
      { p: '6th Day', h: 'All hrs', m: 'x 1.5 / x 2.0', note: '' },
      { p: '7th Day / Holiday', h: 'All hours', m: 'x 2.0', note: '' },
    ],
  },

  'iatse-80': {
    note: 'IATSE Local 80 (Grip). Same overtime structure as IATSE national. Studio: 8 hrs. Location: 10 hrs. Gold Time after 14 hrs.',
    divisor: 8,
    rows: [
      { p: 'Straight Time', h: 'Hrs 1 \u2013 8', m: 'x 1.0', note: '' },
      { p: 'Location Guarantee', h: 'Hrs 1 \u2013 10', m: 'x 1.0', note: '' },
      { p: 'Daily OT', h: 'Hrs 8/10 \u2013 12', m: 'x 1.5', note: '' },
      { p: 'Double Time', h: 'Hrs 12 \u2013 14', m: 'x 2.0', note: '' },
      { p: 'GOLD TIME', h: 'Hrs 14+', m: 'x 2.0', note: 'Gold Time \u2014 notify steward' },
      { p: '6th/7th Day', h: 'All hrs', m: 'x 1.5 / x 2.0', note: '' },
    ],
  },

  'iatse-695': {
    note: 'IATSE Local 695 (Sound). Same overtime structure as IATSE national.',
    divisor: 8,
    rows: [
      { p: 'Straight Time', h: 'Hrs 1 \u2013 8', m: 'x 1.0', note: '' },
      { p: 'Location Guarantee', h: 'Hrs 1 \u2013 10', m: 'x 1.0', note: '' },
      { p: 'Daily OT', h: 'Hrs 8/10 \u2013 12', m: 'x 1.5', note: '' },
      { p: 'Double Time', h: 'Hrs 12 \u2013 14', m: 'x 2.0', note: '' },
      { p: 'GOLD TIME', h: 'Hrs 14+', m: 'x 2.0', note: '' },
      { p: '6th/7th Day', h: 'All hrs', m: 'x 1.5 / x 2.0', note: '' },
    ],
  },

  'sag-aftra': {
    note: 'SAG-AFTRA Television / Streaming Agreement. Performer types: Day, Three-Day, Weekly. Streaming rates differ from Network/Cable \u2014 verify applicable schedule. Golden Time after 14 hrs studio / 16 hrs location.',
    divisor: 8,
    rows: [
      { p: 'Day Performer', h: 'Up to 8 hrs', m: 'x 1.0', note: 'Scale day rate \u2014 minimum guaranteed' },
      { p: 'Day Performer OT', h: 'Hrs 8 \u2013 14', m: 'x 1.5', note: 'Time and a half (television/streaming)' },
      { p: 'Golden Time (Day)', h: 'Hrs 14+', m: 'x 2.0', note: 'GOLDEN TIME \u2014 double time from hr 14 studio, hr 16 location' },
      { p: 'Three-Day Performer', h: '3-day guarantee', m: 'x 1.0', note: '3-day scale rate \u2014 weekly rate x 0.6 (approx)' },
      { p: 'Weekly Performer', h: 'Weekly guarantee', m: 'x 1.0', note: 'Weekly scale \u2014 separate broadcast vs streaming rates' },
      { p: 'Schedule I (Streaming)', h: 'Per episode', m: 'Reduced scale', note: 'New Media / Streaming \u2014 verify current SAG-AFTRA schedule' },
      { p: '6th / 7th Day', h: 'All hours', m: 'x 1.5 / x 2.0', note: 'Same as performer guarantee structure' },
    ],
  },

  dga: {
    note: 'DGA \u2014 Directors Guild of America. UPM, 1st AD, 2nd AD, Key 2nd AD, 2nd 2nd AD, Production Associate. Weekly guarantees \u2014 not traditional hourly OT. Separate scale for High-Budget, Low-Budget, New Media.',
    divisor: 8,
    rows: [
      { p: 'Director (Feature)', h: 'Flat deal / weekly guarantee', m: 'Scale minimum', note: 'Director negotiates above scale \u2014 no traditional OT' },
      { p: 'UPM / Line Producer', h: 'Weekly guarantee', m: 'x 1.0', note: 'UPM rates are weekly minimums \u2014 DGA Basic Agreement' },
      { p: '1st Assistant Director', h: 'Weekly guarantee', m: 'x 1.0', note: 'Separate prep and shoot rates' },
      { p: '2nd Assistant Director', h: 'Weekly guarantee', m: 'x 1.0', note: 'Step up from 2nd AD after minimum days' },
      { p: '2nd 2nd AD', h: 'Weekly guarantee', m: 'x 1.0', note: '' },
      { p: 'Additional Weekend / Beyond Guarantee', h: 'Per day beyond 5-day week', m: 'Day rate equiv.', note: 'Verify DGA Basic Agreement for OT provisions for ADs' },
    ],
  },

  wggb: {
    note: 'Writers Guild of Great Britain. Rates per project type: Feature, TV Series (per episode), Short. Residuals apply for repeats.',
    divisor: 8,
    rows: [
      { p: 'Screenplay (Feature)', h: 'Flat fee per agreement', m: 'Scale minimum', note: 'WGGB minimum rates \u2014 verify current year' },
      { p: 'TV Episode', h: 'Flat fee per episode', m: 'Scale minimum', note: '' },
      { p: 'Rewrites / Polish', h: 'Per draft', m: '% of original fee', note: '' },
    ],
  },

  'wga-west': {
    note: 'WGA West. Feature and TV rates. New Media/Streaming has specific MBA provisions.',
    divisor: 8,
    rows: [
      { p: 'Screenplay (Feature)', h: 'Flat fee', m: 'WGA scale minimum', note: 'Verify current WGA MBA \u2014 negotiated every 3 years' },
      { p: 'TV Spec Script', h: 'Per episode', m: 'WGA scale minimum', note: '' },
      { p: 'Streaming / New Media', h: 'Per episode', m: 'Lower scale', note: 'AI provisions added in 2023 WGA strike agreement' },
    ],
  },

  'teamsters-399': {
    note: 'Teamsters Local 399 (Drivers, Location Managers, Casting). Hourly OT structure. Studio: 8-hr day. Location: 10-hr guarantee. Gold Time after 14 hrs.',
    divisor: 8,
    rows: [
      { p: 'Straight Time', h: 'Hrs 1 \u2013 8', m: 'x 1.0', note: '' },
      { p: 'OT', h: 'Hrs 8 \u2013 12', m: 'x 1.5', note: '' },
      { p: 'Double Time', h: 'Hrs 12 \u2013 14', m: 'x 2.0', note: '' },
      { p: 'GOLD TIME', h: 'Hrs 14+', m: 'x 2.0', note: '' },
      { p: '6th/7th Day', h: 'All hrs', m: 'x 1.5 / x 2.0', note: '' },
    ],
  },

  meaa: {
    note: 'MEAA \u2014 Australia. Contracted day: 8 hrs (rate div 8). Turnaround: 10 hrs. Crib time (meal break) within 5 hrs. Saturday and Sunday attract specific premiums. Superannuation 11.5% mandatory on all earnings.',
    divisor: 8,
    rows: [
      { p: 'Standard Day', h: 'Hrs 1 \u2013 8', m: 'x 1.0', note: '8-hr contracted day (38-hr week ordinary)' },
      { p: 'OT Tier 1', h: 'Hrs 8 \u2013 10', m: 'x 1.5', note: 'Time + half' },
      { p: 'OT Tier 2', h: 'Hrs 10+', m: 'x 2.0', note: 'Double time' },
      { p: 'Saturday (first 2 hrs)', h: 'Hrs 1 \u2013 2', m: 'x 1.5', note: 'Saturday premium \u2014 first 2 hours' },
      { p: 'Saturday (2hrs+)', h: 'Beyond 2 hrs', m: 'x 2.0', note: 'Double time for all Saturday hours beyond 2' },
      { p: 'Sunday', h: 'All hours', m: 'x 2.0', note: 'Double time all Sunday hours' },
      { p: 'Public Holiday', h: 'All hours', m: 'x 2.0', note: 'Plus entitlement to day off in lieu' },
      { p: 'Superannuation', h: 'All earnings', m: '+11.5%', note: 'Mandatory SG \u2014 employer cost in addition to rate' },
    ],
  },

  siptu: {
    note: 'SIPTU \u2014 Ireland. IDTV Production Agreement. Similar OT structure to PACT/BECTU. 10-hr contracted day. EU Working Time Directive: 48-hr average max. 10 Irish public holidays. Mileage per km (not miles).',
    divisor: 10,
    rows: [
      { p: 'Contracted Day', h: 'Hrs 1 \u2013 10', m: 'x 1.0', note: '' },
      { p: 'OT Band 1', h: 'Hrs 10 \u2013 12', m: 'x 1.25', note: '' },
      { p: 'OT Band 2', h: 'Hrs 12 \u2013 14', m: 'x 1.5', note: '' },
      { p: 'OT Band 3', h: 'Hrs 14+', m: 'x 2.0', note: '' },
      { p: '6th Day', h: 'Hrs 1-10', m: 'x 1.5', note: '' },
      { p: '6th Day OT', h: 'Hrs 10+', m: 'x 2.0', note: '' },
      { p: '7th Day / Public Holiday', h: 'All hours', m: 'x 2.0', note: '10 Irish public holidays' },
    ],
  },

  'iatse-ca': {
    note: 'IATSE Canada (BC: IATSE 891 / 669; Ontario: ACFC 2000W). BC: 8-hr day, OT x1.5 after 8 hrs, x2.0 after 12 hrs. Ontario: similar. Quebec (AQTIS): 40-hr week threshold, OT calculated weekly not daily.',
    divisor: 8,
    rows: [
      { p: 'Straight Time (BC/ON)', h: 'Hrs 1 \u2013 8', m: 'x 1.0', note: '' },
      { p: 'OT Tier 1', h: 'Hrs 8 \u2013 12', m: 'x 1.5', note: 'BC and Ontario' },
      { p: 'Double Time', h: 'Hrs 12+', m: 'x 2.0', note: '' },
      { p: '6th Consecutive Day (BC)', h: 'Hrs 1-8', m: 'x 1.5', note: '' },
      { p: '6th Day OT', h: 'Hrs 8+', m: 'x 2.0', note: '' },
      { p: '7th Day', h: 'All hours', m: 'x 2.0', note: '' },
      { p: 'Quebec (AQTIS) \u2014 Weekly OT', h: 'Hrs >40/week', m: 'x 1.5', note: 'Quebec OT is weekly threshold, not daily' },
    ],
  },

  actra: {
    note: 'ACTRA \u2014 Alliance of Canadian Cinema, Television and Radio Artists. Performer rates. Day, three-day, weekly guarantees similar to SAG-AFTRA structure.',
    divisor: 8,
    rows: [
      { p: 'Day Performer', h: 'Up to 8 hrs', m: 'x 1.0', note: 'ACTRA day rate minimum' },
      { p: 'OT', h: 'Hrs 8 \u2013 12', m: 'x 1.5', note: '' },
      { p: 'Double Time', h: 'Hrs 12+', m: 'x 2.0', note: '' },
      { p: 'Weekly Performer', h: 'Weekly guarantee', m: 'x 1.0', note: 'Separate TV / Streaming rates' },
    ],
  },

  'spiac-cgt': {
    note: 'France \u2014 SPIAC-CGT. Convention collective nationale de la production cinematographique (IDCC 2412). 39-hr working week applies to film/TV (not the general 35-hr rule). OT from hour 39 of the week, not daily. CDDU contracts (intermittents) common.',
    divisor: 8,
    rows: [
      { p: 'Ordinary Hours', h: 'Up to 39 hrs/week', m: 'x 1.0', note: '39-hr threshold in entertainment sector (IDCC 2412)' },
      { p: 'OT (hrs 39-43/wk)', h: '+4 hrs above 39', m: 'x 1.25', note: '25% OT premium \u2014 first band' },
      { p: 'OT (hrs 43+/wk)', h: 'Beyond 43 hrs', m: 'x 1.5', note: '50% OT premium' },
      { p: 'Night Hours (after 22:00)', h: 'Per hour', m: '+25%', note: 'Night work supplement \u2014 verify current agreement' },
      { p: 'Sunday / Jours Feries', h: 'All hours', m: 'x 2.0', note: 'Public holiday: double time or day in lieu' },
    ],
  },

  'f3c-cfdt': {
    note: 'France \u2014 F3C-CFDT. VFX/Post production workers. Same 39-hr week threshold. Similar OT structure to SPIAC-CGT.',
    divisor: 8,
    rows: [
      { p: 'Ordinary Hours', h: 'Up to 39 hrs/week', m: 'x 1.0', note: '' },
      { p: 'OT Tier 1', h: 'Hrs 39-43/wk', m: 'x 1.25', note: '' },
      { p: 'OT Tier 2', h: 'Hrs 43+/wk', m: 'x 1.5', note: '' },
    ],
  },

  // Non-union defaults
  'nu-uk': { note: '', divisor: 10, rows: [
    { p: 'Contracted Day', h: 'Hrs 1-10', m: 'x 1.0', note: '' },
    { p: 'OT', h: 'Hrs 10-12', m: 'x 1.25', note: '' },
    { p: 'OT', h: 'Hrs 12-14', m: 'x 1.5', note: '' },
    { p: 'OT', h: 'Hrs 14+', m: 'x 2.0', note: '' },
  ]},
  'nu-us': { note: '', divisor: 8, rows: [
    { p: 'Straight Time', h: 'Hrs 1-8', m: 'x 1.0', note: '' },
    { p: 'OT', h: 'Hrs 8-12', m: 'x 1.5', note: '' },
    { p: 'Double Time', h: 'Hrs 12+', m: 'x 2.0', note: '' },
  ]},
  'nu-ie': { note: '', divisor: 10, rows: [
    { p: 'Contracted Day', h: 'Hrs 1-10', m: 'x 1.0', note: '' },
    { p: 'OT', h: 'Hrs 10-12', m: 'x 1.25', note: '' },
    { p: 'OT', h: 'Hrs 12+', m: 'x 2.0', note: '' },
  ]},
  'nu-au': { note: '', divisor: 8, rows: [
    { p: 'Standard Day', h: 'Hrs 1-8', m: 'x 1.0', note: '' },
    { p: 'OT T1', h: 'Hrs 8-10', m: 'x 1.5', note: '' },
    { p: 'OT T2', h: 'Hrs 10+', m: 'x 2.0', note: '' },
  ]},
  'nu-hu': { note: '', divisor: 8, rows: [
    { p: 'Ordinary', h: 'Hrs 1-8', m: 'x 1.0', note: '' },
    { p: 'OT', h: 'Hrs 8+', m: 'x 1.5', note: '50% premium mandatory' },
  ]},
  'nu-ca': { note: '', divisor: 8, rows: [
    { p: 'Straight Time', h: 'Hrs 1-8', m: 'x 1.0', note: '' },
    { p: 'OT', h: 'Hrs 8-12', m: 'x 1.5', note: '' },
    { p: 'Double Time', h: 'Hrs 12+', m: 'x 2.0', note: '' },
  ]},
  'nu-de': { note: 'Germany: maximum 10 hrs/day (ArbZG). 11-hr rest mandatory.', divisor: 8, rows: [
    { p: 'Ordinary', h: 'Hrs 1-8', m: 'x 1.0', note: '' },
    { p: 'OT', h: 'Hrs 8-10', m: 'x 1.25', note: '25% minimum premium' },
    { p: 'OT (beyond 10)', h: 'Hrs 10+', m: 'Not permitted', note: '10 hrs/day is the ArbZG maximum \u2014 additional hours breach ArbZG' },
  ]},
  'nu-fr': { note: 'France: 39-hr week threshold in film/TV.', divisor: 8, rows: [
    { p: 'Ordinary', h: 'Up to 39 hrs/week', m: 'x 1.0', note: '' },
    { p: 'OT', h: 'Hrs 39-43/wk', m: 'x 1.25', note: '' },
    { p: 'OT', h: 'Hrs 43+/wk', m: 'x 1.5', note: '' },
  ]},
  'nu-es': { note: 'Spain: 40-hr week max, 80-hr OT annual cap.', divisor: 8, rows: [
    { p: 'Ordinary', h: 'Hrs 1-8', m: 'x 1.0', note: '' },
    { p: 'OT', h: 'Hrs 8+', m: 'x 1.25', note: '25% min premium \u2014 max 80 hrs OT/year total' },
  ]},
  'nu-it': { note: 'Italy: varies by CCNL.', divisor: 8, rows: [
    { p: 'Ordinary', h: 'Hrs 1-8', m: 'x 1.0', note: '' },
    { p: 'OT', h: 'Hrs 8+', m: 'x 1.15', note: '15% min premium \u2014 verify CCNL' },
  ]},
  'nu-nz': { note: '', divisor: 8, rows: [
    { p: 'Ordinary', h: 'Hrs 1-8', m: 'x 1.0', note: '' },
    { p: 'OT', h: 'Hrs 8+', m: 'x 1.5', note: '' },
  ]},
  'nu-za': { note: 'South Africa: max 10 hrs OT per week.', divisor: 9, rows: [
    { p: 'Ordinary', h: 'Hrs 1-9', m: 'x 1.0', note: '45-hr week = 9 hrs/day' },
    { p: 'OT', h: 'Hrs 9+', m: 'x 1.5', note: 'Max 10 hrs OT per week total' },
    { p: 'Sunday', h: 'All hours', m: 'x 2.0', note: '' },
  ]},

  default: {
    note: 'Standard structure \u2014 verify against applicable agreement.',
    divisor: 8,
    rows: [
      { p: 'Standard', h: 'Hrs 1-8', m: 'x 1.0', note: '' },
      { p: 'OT Band 1', h: 'Hrs 8-10', m: 'x 1.25', note: '' },
      { p: 'OT Band 2', h: 'Hrs 10-12', m: 'x 1.5', note: '' },
      { p: 'OT Band 3', h: 'Hrs 12+', m: 'x 2.0', note: '' },
    ],
  },
};
