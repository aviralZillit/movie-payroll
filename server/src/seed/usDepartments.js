// US departments organized by union
// Sources: DGA BA, SAG-AFTRA Codified Basic Agreement, IATSE Basic Agreement, WGA MBA, Teamsters Local 399, AFM
export const usDepartmentsByUnion = {
  DGA: [
    { name: 'Directors', code: 'DIR', sortOrder: 1 },
    { name: 'Unit Production Managers', code: 'UPM', sortOrder: 2 },
    { name: 'Assistant Directors', code: 'AD', sortOrder: 3 },
  ],
  SAG_AFTRA: [
    { name: 'Principal Performers', code: 'PRINCIPAL', sortOrder: 1 },
    { name: 'Background / Extras', code: 'BG', sortOrder: 2 },
    { name: 'Stunt', code: 'STUNT', sortOrder: 3 },
    { name: 'Voice / Looping', code: 'VOICE', sortOrder: 4 },
    { name: 'Dancers / Singers', code: 'DANCE', sortOrder: 5 },
  ],
  IATSE: [
    { name: 'Camera (Local 600)', code: 'CAM', sortOrder: 1 },
    { name: 'Grips (Local 80)', code: 'GRP', sortOrder: 2 },
    { name: 'Electricians (Local 728)', code: 'ELC', sortOrder: 3 },
    { name: 'Art Department (Local 800)', code: 'ART', sortOrder: 4 },
    { name: 'Costume (Local 705)', code: 'COS', sortOrder: 5 },
    { name: 'Hair & Makeup (Local 706)', code: 'HMU', sortOrder: 6 },
    { name: 'Sound (Local 695)', code: 'SND', sortOrder: 7 },
    { name: 'Editors (Local 700)', code: 'EDIT', sortOrder: 8 },
    { name: 'Props (Local 44)', code: 'PRP', sortOrder: 9 },
    { name: 'Set Decorators (Local 44)', code: 'SETDEC', sortOrder: 10 },
    { name: 'Script Supervisors (Local 871)', code: 'SCRP', sortOrder: 11 },
    { name: 'Production Office (Local 161)', code: 'PROD', sortOrder: 12 },
  ],
  WGA: [
    { name: 'Screenwriters', code: 'SCRN', sortOrder: 1 },
    { name: 'TV Writers', code: 'TVW', sortOrder: 2 },
  ],
  TEAMSTERS: [
    { name: 'Transportation', code: 'TRANS', sortOrder: 1 },
    { name: 'Casting', code: 'CAST', sortOrder: 2 },
    { name: 'Location Managers', code: 'LOC', sortOrder: 3 },
  ],
  AFM: [
    { name: 'Session Musicians', code: 'SESS', sortOrder: 1 },
    { name: 'Orchestral', code: 'ORCH', sortOrder: 2 },
  ],
};
