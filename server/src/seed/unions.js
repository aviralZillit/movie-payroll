// All UK film/TV production unions with official data
// Sources: bectu.org.uk, equity.org.uk, directorsuk.com, writersguild.org.uk, musiciansunion.org.uk
export const unions = [
  {
    code: 'BECTU',
    name: 'Broadcasting, Entertainment, Communications and Theatre Union',
    country: 'UK',
    website: 'https://bectu.org.uk',
    currentAgreementUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/',
    standardWorkDayHrs: 11, // Film MMP: 11+1
    standardLunchHrs: 1,
    minTurnaroundHrs: 11,
    holidayPayPct: 0.1207, // 12.07% statutory
    description: 'Covers all below-the-line crew: camera, sound, grip, lighting, art, costume, hair/makeup, props, construction, locations, post-production, ADs, production office, SFX, set crafts, runners.',
  },
  {
    code: 'EQUITY',
    name: 'Equity (British Actors\' Equity Association)',
    country: 'UK',
    website: 'https://www.equity.org.uk',
    currentAgreementUrl: 'https://www.equity.org.uk/getting-work/agreements',
    standardWorkDayHrs: 10,
    standardLunchHrs: 1,
    minTurnaroundHrs: 12, // 12 hours (reducible to 11)
    holidayPayPct: 0.1207,
    description: 'Covers actors, performers, singers, dancers, choreographers, stunt performers, walk-on/supporting artists.',
  },
  {
    code: 'FAA',
    name: 'Film Artistes\' Association (BECTU branch)',
    country: 'UK',
    website: 'https://bectu.org.uk',
    currentAgreementUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/',
    standardWorkDayHrs: 10,
    standardLunchHrs: 1,
    minTurnaroundHrs: 11,
    holidayPayPct: 0.1207,
    description: 'Covers background/supporting artists within 40-mile radius of Charing Cross, London. Operates as a BECTU branch under the Pact/FAA Agreement.',
  },
  {
    code: 'DIRECTORS_UK',
    name: 'Directors UK',
    country: 'UK',
    website: 'https://www.directorsuk.com',
    currentAgreementUrl: 'https://www.directorsuk.com/campaigns/fair-agreement',
    standardWorkDayHrs: 10,
    standardLunchHrs: 1,
    minTurnaroundHrs: 11,
    holidayPayPct: 0.1207,
    description: 'Covers film and TV directors. Negotiates terms for prep, shoot, and post-production phases, cutting rights, and credit placement.',
  },
  {
    code: 'WGGB',
    name: 'Writers\' Guild of Great Britain',
    country: 'UK',
    website: 'https://writersguild.org.uk',
    currentAgreementUrl: 'https://writersguild.org.uk/rates-and-agreements/',
    standardWorkDayHrs: 0, // Writers work on deliverables, not hours
    standardLunchHrs: 0,
    minTurnaroundHrs: 0,
    holidayPayPct: 0.1207,
    description: 'Covers screenwriters, TV writers, radio writers. Negotiates step deals, minimum fees by budget tier, rewrite fees, and residuals.',
  },
  {
    code: 'MU',
    name: 'Musicians\' Union',
    country: 'UK',
    website: 'https://musiciansunion.org.uk',
    currentAgreementUrl: 'https://musiciansunion.org.uk/working-performing/rates-of-pay',
    standardWorkDayHrs: 3, // Session-based (3hr sessions)
    standardLunchHrs: 0,
    minTurnaroundHrs: 0,
    holidayPayPct: 0.1207,
    description: 'Covers session musicians, orchestral players, film scoring. Rate structure based on 3-hour sessions with overtime per additional hour.',
  },
];
