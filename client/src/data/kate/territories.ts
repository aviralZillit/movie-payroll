// ============================================================
// ZILLIT CODA — DEAL MEMO WIZARD
// Territory, Currency & Union Data
// ============================================================

import type { Territory, TerritoryCode, CurrencyCode, DepartmentId, UnionId } from '../types/dealMemo';

// ── CURRENCY MAP ──────────────────────────────────────────────

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$',
  NZD: 'NZ$', ZAR: 'R', HUF: 'Ft', DKK: 'kr', SEK: 'kr', NOK: 'kr', CHF: 'Fr',
};

// ── TERRITORIES ───────────────────────────────────────────────

export const TERRITORIES: Record<TerritoryCode, Territory> = {
  uk: {
    code: 'uk', name: 'United Kingdom', flag: '🇬🇧', curr: 'GBP', sym: '£', badge: '🇬🇧 UK Agreements',
    unions: [
      { id: 'pact-bectu', name: 'PACT / BECTU — Scripted TV', sub: '2023 Agreement — scripted drama, SVOD, made-for-TV. Excludes features, factual, multi-camera.', suggested: ['ad','art','cam','costume','dir','grip','hair','light','loc','post','prod','script','sound','trans','vfx'] },
      { id: 'pact-mmp', name: 'PACT / BECTU — Major Motion Picture', sub: 'MMP 2021 — cinematic or global SVOD, budget ≥ £30m. 55-hr week. Camera OT at 2T.', suggested: ['ad','art','atl','cam','cast','costume','dir','grip','hair','light','loc','post','prod','script','sound','trans','vfx'] },
      { id: 'pact-equity', name: 'PACT / Equity', sub: 'Background Performers Agreement', suggested: ['cast'] },
      { id: 'bectu-anim', name: 'BECTU Animation', sub: 'Animation & VFX Agreement', suggested: ['vfx','post'] },
      { id: 'wggb', name: 'WGGB', sub: 'Writers Guild of Great Britain', suggested: ['atl'] },
      { id: 'nu-uk', name: 'Non-Union', sub: 'Production-defined rules', suggested: [] },
    ],
  },
  us: {
    code: 'us', name: 'United States', flag: '🇺🇸', curr: 'USD', sym: '$', badge: '🇺🇸 US Guild Agreements',
    unions: [
      { id: 'dga', name: 'DGA', sub: 'Directors Guild of America', suggested: ['ad','prod'] },
      { id: 'iatse-600', name: 'IATSE Local 600', sub: 'International Cinematographers Guild — Camera', suggested: ['cam'] },
      { id: 'iatse-728', name: 'IATSE Local 728', sub: 'Studio Electrical Lighting Technicians', suggested: ['light'] },
      { id: 'iatse-80', name: 'IATSE Local 80', sub: 'Studio Grips', suggested: ['grip'] },
      { id: 'iatse-695', name: 'IATSE Local 695', sub: 'Production Sound Technicians', suggested: ['sound'] },
      { id: 'sag-aftra', name: 'SAG-AFTRA', sub: 'Screen Actors Guild — Performers', suggested: ['atl','cast'] },
      { id: 'wga-west', name: 'WGA West', sub: 'Writers Guild of America, West', suggested: ['atl'] },
      { id: 'teamsters-399', name: 'Teamsters Local 399', sub: 'Motion Picture Drivers & Location Managers', suggested: ['trans','loc'] },
      { id: 'nu-us', name: 'Non-Union', sub: 'Production-defined rules', suggested: [] },
    ],
  },
  ie: {
    code: 'ie', name: 'Ireland', flag: '🇮🇪', curr: 'EUR', sym: '€', badge: '🇮🇪 Irish Agreements',
    unions: [
      { id: 'siptu', name: 'SIPTU', sub: 'Services, Industrial, Professional & Technical Union', suggested: ['ad','art','cam','costume','dir','grip','hair','light','loc','prod','script','sound','trans'] },
      { id: 'equity-ie', name: 'Equity Ireland', sub: 'Irish Equity — Performers', suggested: ['cast','atl'] },
      { id: 'nu-ie', name: 'Non-Union', sub: 'Production-defined rules', suggested: [] },
    ],
  },
  fr: {
    code: 'fr', name: 'France', flag: '🇫🇷', curr: 'EUR', sym: '€', badge: '🇫🇷 Conventions Collectives',
    unions: [
      { id: 'spiac-cgt', name: 'SPIAC-CGT', sub: 'Syndicat des Professionnels de l\'Image et du Son — Techniciens', suggested: ['ad','art','cam','costume','dir','grip','hair','light','loc','prod','script','sound','trans'] },
      { id: 'f3c-cfdt', name: 'F3C-CFDT / SNAPSA', sub: 'Post-production, VFX, Animation', suggested: ['post','vfx'] },
      { id: 'sfa-cgt', name: 'SFA-CGT', sub: 'Artistes — Casting & Above the Line', suggested: ['cast','atl'] },
      { id: 'nu-fr', name: 'Non-Union', sub: 'Production-defined rules', suggested: [] },
    ],
  },
  de: {
    code: 'de', name: 'Germany', flag: '🇩🇪', curr: 'EUR', sym: '€', badge: '🇩🇪 Tarifverträge',
    unions: [
      { id: 'nu-de', name: 'Production-specific', sub: 'No single dominant film union — negotiate per engagement', suggested: [] },
    ],
  },
  es: {
    code: 'es', name: 'Spain', flag: '🇪🇸', curr: 'EUR', sym: '€', badge: '🇪🇸 Convenios Colectivos',
    unions: [
      { id: 'nu-es', name: 'CCNL / Production-specific', sub: 'Spanish film sector collective agreement', suggested: [] },
    ],
  },
  it: {
    code: 'it', name: 'Italy', flag: '🇮🇹', curr: 'EUR', sym: '€', badge: '🇮🇹 CCNL Cinema',
    unions: [
      { id: 'nu-it', name: 'CCNL Cinema e Audiovisivo', sub: 'Italian film sector collective agreement', suggested: [] },
    ],
  },
  au: {
    code: 'au', name: 'Australia', flag: '🇦🇺', curr: 'AUD', sym: 'A$', badge: '🇦🇺 Australian Agreements',
    unions: [
      { id: 'meaa', name: 'MEAA', sub: 'Media, Entertainment & Arts Alliance', suggested: ['ad','art','atl','cam','cast','costume','dir','grip','hair','light','loc','post','prod','script','sound','trans','vfx'] },
      { id: 'nu-au', name: 'Non-Union', sub: 'Production-defined rules', suggested: [] },
    ],
  },
  ca: {
    code: 'ca', name: 'Canada', flag: '🇨🇦', curr: 'CAD', sym: 'C$', badge: '🇨🇦 Canadian Agreements',
    unions: [
      { id: 'iatse-ca', name: 'IATSE Canada', sub: 'International Alliance — Technical', suggested: ['ad','art','cam','costume','grip','hair','light','loc','post','prod','script','sound','trans','vfx'] },
      { id: 'actra', name: 'ACTRA', sub: 'Alliance of Canadian Cinema, Television & Radio Artists', suggested: ['atl','cast'] },
      { id: 'nu-ca', name: 'Non-Union', sub: 'Production-defined rules', suggested: [] },
    ],
  },
  hu: {
    code: 'hu', name: 'Hungary', flag: '🇭🇺', curr: 'EUR', sym: '€', badge: '🇭🇺 Hungarian Agreements',
    unions: [
      { id: 'nu-hu', name: 'Production-specific', sub: 'No dominant film union — Labour Code applies', suggested: [] },
    ],
  },
  nz: {
    code: 'nz', name: 'New Zealand', flag: '🇳🇿', curr: 'NZD', sym: 'NZ$', badge: '🇳🇿 New Zealand Agreements',
    unions: [
      { id: 'nu-nz', name: 'NZWU / Production-specific', sub: 'NZ Writers Guild / production-specific agreements', suggested: [] },
    ],
  },
  za: {
    code: 'za', name: 'South Africa', flag: '🇿🇦', curr: 'ZAR', sym: 'R', badge: '🇿🇦 South African Agreements',
    unions: [
      { id: 'nu-za', name: 'Production-specific', sub: 'BCSBD and sector-specific agreements', suggested: [] },
    ],
  },
  other: {
    code: 'other', name: 'Other', flag: '🌐', curr: 'USD', sym: '$', badge: '🌐 International',
    unions: [
      { id: 'nu-other', name: 'Non-Union / Production-specific', sub: 'Confirm applicable agreements locally', suggested: [] },
    ],
  },
};

// ── DEPARTMENTS (alphabetical) ────────────────────────────────

export const ALL_DEPARTMENTS: { id: DepartmentId; label: string }[] = [
  { id: 'atl',     label: 'Above the Line' },
  { id: 'art',     label: 'Art Department' },
  { id: 'ad',      label: 'Assistant Directors' },
  { id: 'cam',     label: 'Camera' },
  { id: 'cast',    label: 'Casting' },
  { id: 'costume', label: 'Costume / Wardrobe' },
  { id: 'dir',     label: 'Directing' },
  { id: 'grip',    label: 'Grip' },
  { id: 'hair',    label: 'Hair & Make-Up' },
  { id: 'light',   label: 'Lighting / Electrical' },
  { id: 'loc',     label: 'Locations' },
  { id: 'post',    label: 'Post Production' },
  { id: 'prod',    label: 'Production' },
  { id: 'script',  label: 'Script / Continuity' },
  { id: 'sound',   label: 'Sound' },
  { id: 'trans',   label: 'Transport' },
  { id: 'vfx',     label: 'VFX / DFX' },
];

// Departments covered by each union
export const DEPTS_BY_UNION: Partial<Record<UnionId, DepartmentId[]>> = {
  'pact-bectu':    ['ad','art','cam','costume','dir','grip','hair','light','loc','post','prod','script','sound','trans','vfx'],
  'pact-mmp':      ['ad','art','atl','cam','cast','costume','dir','grip','hair','light','loc','post','prod','script','sound','trans','vfx'],
  'pact-equity':   ['cast'],
  'bectu-anim':    ['post','vfx'],
  'wggb':          ['atl'],
  'wga-west':      ['atl'],
  'dga':           ['ad','prod'],
  'iatse-600':     ['cam'],
  'iatse-728':     ['light'],
  'iatse-80':      ['grip'],
  'iatse-695':     ['sound'],
  'sag-aftra':     ['atl','cast'],
  'teamsters-399': ['loc','trans'],
  'meaa':          ['ad','art','atl','cam','cast','costume','dir','grip','hair','light','loc','post','prod','script','sound','trans','vfx'],
  'siptu':         ['ad','art','cam','costume','dir','grip','hair','light','loc','prod','script','sound','trans'],
  'equity-ie':     ['cast','atl'],
  'iatse-ca':      ['ad','art','cam','costume','grip','hair','light','loc','post','prod','script','sound','trans','vfx'],
  'actra':         ['atl','cast'],
  'spiac-cgt':     ['ad','art','cam','costume','dir','grip','hair','light','loc','prod','script','sound','trans'],
  'f3c-cfdt':      ['post','vfx'],
  'sfa-cgt':       ['atl','cast'],
};

export const DEFAULT_DEPTS: DepartmentId[] = [
  'atl','art','ad','cam','cast','costume','dir','grip','hair','light','loc','post','prod','script','sound','trans','vfx'
];

export function getDeptsForUnion(unionId: UnionId): DepartmentId[] {
  return DEPTS_BY_UNION[unionId] ?? DEFAULT_DEPTS;
}

// ── JOB TITLES BY DEPARTMENT + UNION ─────────────────────────

type JobTitleMap = { default: string[]; [unionId: string]: string[] };

export const JOB_TITLES_BY_DEPT: Partial<Record<DepartmentId, JobTitleMap>> = {
  ad: {
    default: ['First Assistant Director','Second Assistant Director','Third Assistant Director','Additional Third AD','Floor Runner','Set PA','Custom...'],
    'dga': ['First Assistant Director','Key Second Assistant Director','Second Assistant Director','Second Second Assistant Director','Additional Second AD','DGA Trainee','Production Associate','Custom...'],
    'pact-bectu': ['First Assistant Director','Second Assistant Director','Third Assistant Director','Additional Third AD','Floor Runner','Custom...'],
    'pact-mmp': ['First Assistant Director','Second Assistant Director','Third Assistant Director','Additional Third AD','Floor Runner','Custom...'],
  },
  cam: {
    default: ['Director of Photography','Camera Operator','B Camera Operator','C Camera Operator','1st Assistant Camera','2nd Assistant Camera','Digital Imaging Technician (DIT)','Steadicam Operator','Drone Operator / UAV Pilot','Video Assist Operator','Camera Trainee','Camera PA','Custom...'],
    'iatse-600': ['Director of Photography','Camera Operator','B Camera Operator','1st Assistant Camera','2nd Assistant Camera','Digital Imaging Technician (DIT)','Loader','Steadicam Operator','Camera Trainee','Custom...'],
  },
  light: {
    default: ['Gaffer','Best Boy Electric','Electrician','Lighting Technician','Rigging Gaffer','Rigging Best Boy','Rigging Electrician','Generator Operator','Lighting Board Operator','Lighting Trainee','Custom...'],
    'iatse-728': ['Gaffer','Best Boy Electric','Lamp Operator','Rigging Gaffer','Rigging Best Boy Electric','Generator Operator','Lighting Board Operator','Custom...'],
  },
  grip: {
    default: ['Key Grip','Best Boy Grip','Dolly Grip','Technocrane Operator','Crane Operator','Rigging Key Grip','Rigging Best Boy Grip','Grip','Grip Trainee','Custom...'],
    'iatse-80': ['Key Grip','Best Boy Grip','Dolly Grip','Technocrane Operator','Rigging Key Grip','Rigging Best Boy Grip','Grip','Custom...'],
  },
  sound: {
    default: ['Production Sound Mixer','Boom Operator','Sound Assistant','Playback Operator','Sound Trainee','Custom...'],
    'iatse-695': ['Production Sound Mixer','Boom Operator','Sound Assistant','Playback Operator','Custom...'],
  },
  prod: {
    default: ['Executive Producer','Producer','Co-Producer','Line Producer','Production Manager','Production Co-ordinator','Assistant Production Co-ordinator','Production Secretary','Production Accountant (Senior)','Production Accountant','Assistant Accountant','Payroll Accountant','Production Runner','Custom...'],
    'dga': ['Unit Production Manager (UPM)','Line Producer','Production Associate','Associate Producer','Custom...'],
  },
  art: {
    default: ['Production Designer','Art Director','Supervising Art Director','Set Decorator','Prop Master','Property Buyer','Prop Storeman','Dressing Props','Prop Hand','Graphic Artist','Graphic Designer','Standby Art Director','Art Department Co-ordinator','Construction Manager','Head Carpenter','Standby Carpenter','Standby Painter','Plasterer','Scenic Artist','Draughtsperson','Model Maker','Storyboard Artist','Art Department Runner','Custom...'],
  },
  atl: {
    default: ['Executive Producer','Producer','Co-Executive Producer','Co-Producer','Associate Producer','Showrunner','Head Writer','Writer','Story Producer','Story Editor','Development Producer','Custom...'],
    'wggb': ['Writer','Co-Writer','Story Editor','Script Editor','Head Writer','Showrunner','Custom...'],
    'wga-west': ['Writer','Co-Writer','Executive Story Editor','Story Editor','Head Writer','Showrunner','Custom...'],
    'sag-aftra': ['Series Lead','Series Regular','Guest Star','Co-Star','Day Player — Performer','Weekly Performer','Custom...'],
    'pact-equity': ['Background Performer','Walk-On','Supporting Artist','Custom...'],
  },
  cast: {
    default: ['Casting Director','Casting Associate','Casting Assistant','Background Casting Co-ordinator','Casting Runner','Custom...'],
    'sag-aftra': ['Casting Director','Lead Performer','Supporting Performer','Day Player — Performer','Weekly Performer','Background Performer','Stand-In','Stunt Performer','Stunt Co-ordinator','Custom...'],
    'pact-equity': ['Background Performer','Walk-On','Supporting Artist','Stand-In','Custom...'],
    'actra': ['Casting Director','Lead Performer','Supporting Performer','Day Performer','Background Performer','Stunt Performer','Custom...'],
  },
  costume: {
    default: ['Costume Designer','Costume Supervisor','Wardrobe Master','Wardrobe Mistress','Cutter','Breakdown Artist','Standby Costume','Dresser','Costume Buyer','Costume Assistant','Costume Trainee','Custom...'],
  },
  hair: {
    default: ['Make-Up Designer','Hair Designer','Chief Make-Up & Hair Artist','Make-Up Artist','Hair & Make-Up Artist','Prosthetics Designer','Special Effects Make-Up Artist','Make-Up & Hair Trainee','Custom...'],
  },
  dir: {
    default: ['Director','Second Unit Director','Insert Unit Director','Custom...'],
  },
  loc: {
    default: ['Location Manager','Assistant Location Manager','Unit Manager','Location Scout','Location Assistant','Location Runner','Custom...'],
    'teamsters-399': ['Location Manager','Assistant Location Manager','Unit Manager','Location Scout','Location Assistant','Custom...'],
  },
  trans: {
    default: ['Transport Captain','Transport Co-ordinator','Action Vehicle Co-ordinator','Picture Car Captain','Driver','Minibus Driver','Facilities Driver','Camera Car Driver','Custom...'],
    'teamsters-399': ['Transportation Co-ordinator','Transportation Captain','Driver Captain','Driver','Casting Driver','Action Vehicle Co-ordinator','Custom...'],
  },
  post: {
    default: ['Editor','First Assistant Editor','Assembly Editor','Post Production Supervisor','Post Production Co-ordinator','Colourist / Colour Grader','Online Editor','DI Operator','Sound Designer','Re-Recording Mixer','Dialogue Editor','Sound Effects Editor','Foley Artist','Foley Recordist','Music Editor','Custom...'],
  },
  vfx: {
    default: ['VFX Supervisor','VFX Producer','VFX Co-ordinator','On-Set VFX Supervisor','VFX Artist','Lead Compositor','Compositor','Lead Animator','3D Animator','Character Rigger','Look Development Artist','Lighting Artist (CG)','Matte Painter','Matchmove Artist','Data Wrangler','VFX Editor','Custom...'],
    'bectu-anim': ['VFX Supervisor','VFX Artist','Lead Compositor','Compositor','Lead Animator','Animator','Character Rigger','Look Development Artist','Lighting Artist (CG)','Matte Painter','Data Wrangler','VFX Editor','Custom...'],
  },
  script: {
    default: ['Script Supervisor','Continuity Supervisor','Script / Continuity Assistant','Custom...'],
  },
};

export function getJobTitles(deptId: DepartmentId, unionId: UnionId): string[] {
  const deptMap = JOB_TITLES_BY_DEPT[deptId];
  if (!deptMap) return ['Custom...'];
  return deptMap[unionId] ?? deptMap.default ?? ['Custom...'];
}
