// All US film/TV production unions with official data
// Sources: dga.org, sagaftra.org, iatse.net, wga.org, teamsters399.org, afm.org
export const usUnions = [
  {
    code: 'DGA',
    name: 'Directors Guild of America',
    country: 'US',
    website: 'https://www.dga.org',
    currentAgreementUrl: 'https://www.dga.org/Contracts/Rates-2025-to-2026',
    standardWorkDayHrs: 12, // DGA standard before OT
    standardLunchHrs: 1,
    minTurnaroundHrs: 9, // DGA turnaround
    holidayPayPct: 0.08583, // 8.583% vacation+holiday
    description:
      'Covers directors, UPMs, assistant directors in US film and TV.',
  },
  {
    code: 'SAG_AFTRA',
    name: 'SAG-AFTRA (Screen Actors Guild - American Federation of Television and Radio Artists)',
    country: 'US',
    website: 'https://www.sagaftra.org',
    currentAgreementUrl:
      'https://www.sagaftra.org/contracts-industry-resources/contracts',
    standardWorkDayHrs: 8, // SAG standard 8-hour day
    standardLunchHrs: 1,
    minTurnaroundHrs: 12, // SAG 12-hour turnaround
    holidayPayPct: 0.175, // 17.5% pension & health contribution (employer)
    description:
      'Covers actors, performers, stunt performers, voice artists, background actors, singers, and dancers in US film, TV, and commercials.',
  },
  {
    code: 'IATSE',
    name: 'International Alliance of Theatrical Stage Employees',
    country: 'US',
    website: 'https://iatse.net',
    currentAgreementUrl: 'https://iatse.net/basic-agreement/',
    standardWorkDayHrs: 8, // IATSE Basic Agreement 8-hour day
    standardLunchHrs: 0.5, // 30 min non-deducted or 1hr deducted
    minTurnaroundHrs: 10, // IATSE 10-hour turnaround
    holidayPayPct: 0.09, // 9% vacation/holiday
    description:
      'Covers all below-the-line crew: camera (Local 600), grips (Local 80), electricians (Local 728), art department (Local 800), costume (Local 705), hair & makeup (Local 706), sound (Local 695), editors (Local 700), props (Local 44), script supervisors (Local 871), production office (Local 161).',
  },
  {
    code: 'WGA',
    name: 'Writers Guild of America',
    country: 'US',
    website: 'https://www.wga.org',
    currentAgreementUrl: 'https://www.wga.org/contracts/contracts/mba',
    standardWorkDayHrs: 0, // Writers work on deliverables, not hours
    standardLunchHrs: 0,
    minTurnaroundHrs: 0,
    holidayPayPct: 0.085, // 8.5% pension contribution
    description:
      'Covers screenwriters and TV writers. Negotiates minimum compensation, residuals, credits, and separated rights under the MBA.',
  },
  {
    code: 'TEAMSTERS',
    name: 'International Brotherhood of Teamsters, Local 399',
    country: 'US',
    website: 'https://www.ht399.org',
    currentAgreementUrl: 'https://www.ht399.org/contracts',
    standardWorkDayHrs: 8, // Teamsters 8-hour guarantee
    standardLunchHrs: 0.5,
    minTurnaroundHrs: 10, // 10-hour turnaround
    holidayPayPct: 0.09, // 9% vacation/holiday
    description:
      'Covers drivers, transportation coordinators and captains, casting directors, location managers, and animal wranglers in the motion picture industry.',
  },
  {
    code: 'AFM',
    name: 'American Federation of Musicians',
    country: 'US',
    website: 'https://www.afm.org',
    currentAgreementUrl:
      'https://www.afm.org/what-we-do/contracts/film-television/',
    standardWorkDayHrs: 3, // Session-based (3hr sessions)
    standardLunchHrs: 0,
    minTurnaroundHrs: 0,
    holidayPayPct: 0.11, // 11% pension contribution
    description:
      'Covers session musicians, orchestral players, orchestrators, and copyists for film and television scoring under the Film Musicians Secondary Markets Fund agreement.',
  },
];
