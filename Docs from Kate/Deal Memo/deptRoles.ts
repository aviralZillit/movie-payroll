// ─────────────────────────────────────────────────────────────────────────────
// Zillit Coda — Department / Role / Union Mapping Data
// ─────────────────────────────────────────────────────────────────────────────
import type { DepartmentKey, UnionKey, TerritoryKey } from '../types/dealMemo';

// ── Department icons (emoji) ───────────────────────────────────────────────────

export const DEPARTMENT_ICONS: Record<DepartmentKey, string> = {
  'Camera': '🎥',
  'Grip': '🎤',
  'Electrical': '⚡',
  'Art': '🖌',
  'Costume': '👗',
  'Make-Up & Hair': '💄',
  'Sound': '🎧',
  'Production': '📋',
  'Locations': '📍',
  'VFX & Post': '🖥',
  'Transport': '🚗',
  'Construction': '🔨',
  'Stunts': '🧨',
  'Music': '🎵',
  'Performers': '🎭',
  'Directing': '🎬',
  'Writing': '✍',
};

// ── Roles per department ───────────────────────────────────────────────────────

export const DEPT_ROLES: Record<DepartmentKey, string[]> = {
  'Camera': [
    'Director of Photography',
    'Camera Operator',
    '1st Assistant Camera',
    '2nd Assistant Camera',
    'Loader / Clapper',
    'DIT',
    'Video Assist Operator',
    'Steadicam Operator',
    'Crane Operator',
  ],
  'Grip': [
    'Key Grip',
    'Best Boy Grip',
    'Dolly Grip',
    'Grip',
    'Crane Operator',
    'Rigging Grip',
  ],
  'Electrical': [
    'Gaffer',
    'Best Boy Electric',
    'Generator Operator',
    'Lamp Operator',
    'Rigging Gaffer',
    'Electrician',
    'Lighting Programmer',
  ],
  'Art': [
    'Production Designer',
    'Art Director',
    'Set Decorator',
    'Prop Master',
    'Props Buyer',
    'Standby Props',
    'Dressing Props',
    'Set Dresser',
    'Graphic Designer',
    'Illustrator',
    'Concept Artist',
  ],
  'Costume': [
    'Costume Designer',
    'Costume Supervisor',
    'Costume Standby',
    'Costume Assistant',
    'Wardrobe Mistress',
    'Dresser',
  ],
  'Make-Up & Hair': [
    'Make-Up Designer',
    'Make-Up Artist',
    'Hair Designer',
    'Hair Stylist',
    'SFX Make-Up Artist',
    'Make-Up & Hair Trainee',
  ],
  'Sound': [
    'Production Sound Mixer',
    'Boom Operator',
    'Sound Assistant',
    'Playback Operator',
    'Sound Designer',
  ],
  'Production': [
    'Executive Producer',
    'Producer',
    'Co-Producer',
    'Line Producer',
    'Unit Production Manager',
    'Production Coordinator',
    'Production Assistant',
    'Production Secretary',
    'Script Supervisor',
    'Casting Director',
    'Casting Assistant',
    '1st Assistant Director',
    '2nd Assistant Director',
    '3rd Assistant Director',
    'Set PA',
  ],
  'Locations': [
    'Location Manager',
    'Location Scout',
    'Unit Manager',
    'Assistant Location Manager',
    'Location Assistant',
  ],
  'VFX & Post': [
    'VFX Supervisor',
    'VFX Producer',
    'VFX Coordinator',
    'Editor',
    'Assistant Editor',
    'Colourist',
    'VFX Artist',
    'Compositor',
    'Motion Graphics Designer',
  ],
  'Transport': [
    'Transport Captain',
    'Transportation Coordinator',
    'Location Driver',
    'Facilities Driver',
    'Camera Car Driver',
    'Honey Wagon Driver',
  ],
  'Construction': [
    'Construction Manager',
    'Standby Carpenter',
    'Standby Painter',
    'Standby Stagehand',
    'Scenic Painter',
    'Plasterer',
  ],
  'Stunts': [
    'Stunt Coordinator',
    'Stunt Performer',
    'Stunt Double',
    'Wire Rig Supervisor',
  ],
  'Music': [
    'Composer',
    'Music Supervisor',
    'Music Editor',
    'Orchestrator',
    'Session Musician',
    'Music Contractor',
  ],
  'Performers': [
    'Lead Actor',
    'Supporting Artist',
    'Background Artist',
    'Day Player',
    'Stand-in',
    'Voice Artist',
    'Stunt Performer',
  ],
  'Directing': [
    'Director',
    '1st Assistant Director',
    '2nd Assistant Director',
    '3rd Assistant Director',
    'Trainee Assistant Director',
  ],
  'Writing': [
    'Screenwriter',
    'Story Editor',
    'Script Editor',
    'Script Consultant',
    'Writers Room',
  ],
};

// ── Union suggestion mapping ───────────────────────────────────────────────────
// Maps dept + territory → suggested union keys + contextual hint

export type UnionSuggestion = {
  keys: UnionKey[];
  hint: string;
};

export const DEPT_UNION_MAP: Partial<Record<DepartmentKey, Partial<Record<TerritoryKey | 'default', UnionSuggestion>>>> = {
  'Camera': {
    UK: { keys: ['PACT-BECTU'], hint: 'Camera dept. under PACT/BECTU across all grades. DP to Loader.' },
    US: { keys: ['IATSE-600', 'IATSE-BASIC'], hint: 'Local 600 covers DPs, Camera Ops, ACs, DITs nationally.' },
    CA: { keys: ['IATSE-667', 'default'], hint: 'IATSE Local 667 (ON) or 891 (BC) for camera crew.' },
    AU: { keys: ['AU-NU'], hint: 'MEAA Crew covers camera department in Australia.' },
  },
  'Grip': {
    UK: { keys: ['PACT-BECTU'], hint: 'Grips under PACT/BECTU. Key Grip grade often separately negotiated.' },
    US: { keys: ['IATSE-BASIC'], hint: 'Local 80 covers Key Grip, Best Boy, Dolly Grip and Grips in LA.' },
  },
  'Electrical': {
    UK: { keys: ['PACT-BECTU'], hint: 'Electrical dept. under PACT/BECTU. Gaffer grade may have additional negotiated rates.' },
    US: { keys: ['IATSE-728', 'IATSE-BASIC'], hint: 'Local 728 covers Studio Electricians (Gaffers, Lamp Operators) in LA.' },
  },
  'Art': {
    UK: { keys: ['PACT-BECTU'], hint: 'Art dept. under PACT/BECTU. Production Designer/Art Director often individually negotiated.' },
    US: { keys: ['IATSE-BASIC'], hint: 'Local 44 covers Set Dec and Props. Local 800 covers Art Directors. Local 829 covers Scenic Artists.' },
  },
  'Costume': {
    UK: { keys: ['PACT-BECTU'], hint: 'Costume dept. under PACT/BECTU.' },
    US: { keys: ['IATSE-BASIC'], hint: 'Local 892 covers Costume Designers. Local 705 covers Costumers (on-set Standby).' },
  },
  'Make-Up & Hair': {
    UK: { keys: ['PACT-BECTU'], hint: 'Make-up and hair under PACT/BECTU.' },
    US: { keys: ['IATSE-BASIC'], hint: 'Local 706 covers Make-Up Artists and Hair Stylists nationally.' },
  },
  'Sound': {
    UK: { keys: ['PACT-BECTU'], hint: 'Production sound under PACT/BECTU.' },
    US: { keys: ['IATSE-695', 'IATSE-BASIC'], hint: 'Local 695 covers Production Sound Mixers, Boom Ops, and Video Assist.' },
  },
  'Production': {
    UK: { keys: ['PACT-BECTU'], hint: 'Production management under PACT/BECTU. Script Supervisors are a specific BECTU grade.' },
    US: { keys: ['DGA', 'IATSE-BASIC'], hint: 'Directors, UPMs and 1st ADs must be DGA. Coordinators may be IATSE Local 871.' },
  },
  'Locations': {
    UK: { keys: ['PACT-BECTU'], hint: 'Locations dept. under PACT/BECTU.' },
    US: { keys: ['TEAMSTERS-399', 'IATSE-BASIC'], hint: 'Location Managers in Los Angeles are Teamsters Local 399 — not IATSE.' },
  },
  'VFX & Post': {
    UK: { keys: ['PACT-BECTU'], hint: 'Post and VFX under PACT/BECTU.' },
    US: { keys: ['IATSE-BASIC'], hint: 'Local 700 covers Editors. VFX Artists may be IATSE or non-union depending on studio.' },
  },
  'Transport': {
    UK: { keys: ['PACT-BECTU'], hint: 'Transport under PACT/BECTU in UK. DOT regulations additionally apply.' },
    US: { keys: ['TEAMSTERS-399'], hint: 'ALL drivers and transportation on covered productions are Teamsters Local 399. Non-negotiable in LA.' },
  },
  'Construction': {
    UK: { keys: ['PACT-BECTU'], hint: 'Construction dept. under PACT/BECTU. Standby roles specifically graded.' },
    US: { keys: ['IATSE-BASIC'], hint: 'Standby construction and scenic painters under IATSE on US productions.' },
  },
  'Stunts': {
    UK: { keys: ['PACT-BECTU', 'EQUITY'], hint: 'Stunt performers under PACT/BECTU. Equity stunt register strongly recommended for professional performers.' },
    US: { keys: ['SAG-THEATRICAL', 'SAG-TV'], hint: 'ALL stunt performers must be SAG-AFTRA or Taft-Hartley. Separate stunt minimums and adjustment factors apply.' },
  },
  'Music': {
    UK: { keys: ['MU'], hint: 'Session musicians under Musicians Union agreement. Composers may be separately negotiated.' },
    US: { keys: ['IATSE-BASIC'], hint: 'Film composers are typically non-union. Session musicians under AFM Local 47 (LA) or Local 802 (NY).' },
  },
  'Performers': {
    UK: { keys: ['EQUITY'], hint: 'ALL on-screen performers — actors, voice artists, background — must be under Equity agreement.' },
    US: { keys: ['SAG-THEATRICAL', 'SAG-TV'], hint: 'All performers must be SAG-AFTRA or Taft-Hartley engaged on covered productions. No exceptions.' },
    AU: { keys: ['AU-NU'], hint: 'MEAA Performers Agreement covers on-screen talent in Australia.' },
  },
  'Directing': {
    UK: { keys: ['PACT-BECTU'], hint: 'Directors and ADs under PACT/BECTU. 1st AD and 2nd AD are specifically BECTU graded.' },
    US: { keys: ['DGA'], hint: 'ALL Directors, UPMs, and 1st ADs must be DGA members on covered productions.' },
  },
  'Writing': {
    UK: { keys: ['PACT-BECTU'], hint: 'Writers are typically individually negotiated in UK — PACT/BECTU terms as starting point.' },
    US: { keys: ['WGA-WEST', 'WGA-EAST'], hint: 'ALL writers on covered productions must be WGA members. WGA West for LA-based, East for NY-based.' },
  },
};
