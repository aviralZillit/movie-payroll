// US designations per department (key = "UNION_DEPTCODE")
// Sources: DGA Basic Agreement, SAG-AFTRA Codified Basic Agreement,
//          IATSE Basic Agreement & local rate cards, WGA MBA,
//          Teamsters Local 399, AFM Film/TV Agreement
export const usDesignationsByDept = {
  // ─── DGA DIRECTORS ─────────────────────────────
  DGA_DIR: [
    { name: 'Director (Feature Film)', code: 'DIR_FEAT', level: 1 },
    { name: 'Director (TV 30min)', code: 'DIR_TV30', level: 1 },
    { name: 'Director (TV 60min)', code: 'DIR_TV60', level: 1 },
    { name: 'Director (TV 90min)', code: 'DIR_TV90', level: 1 },
    { name: 'Director (TV 120min)', code: 'DIR_TV120', level: 1 },
    { name: 'Director (Pilot)', code: 'DIR_PILOT', level: 1 },
    { name: 'Director (Commercial)', code: 'DIR_COMM', level: 1 },
    { name: '2nd Unit Director', code: '2ND_DIR', level: 2 },
  ],

  // ─── DGA UNIT PRODUCTION MANAGERS ──────────────
  DGA_UPM: [
    { name: 'Unit Production Manager', code: 'UPM', level: 1 },
  ],

  // ─── DGA ASSISTANT DIRECTORS ───────────────────
  DGA_AD: [
    { name: '1st Assistant Director', code: '1AD', level: 1 },
    { name: 'Key 2nd AD', code: 'KEY_2AD', level: 2 },
    { name: '2nd 2nd AD', code: '2ND_2AD', level: 3 },
    { name: 'Additional 2nd AD', code: 'ADD_2AD', level: 3 },
  ],

  // ─── SAG-AFTRA PRINCIPAL PERFORMERS ────────────
  SAG_AFTRA_PRINCIPAL: [
    { name: 'Lead Actor', code: 'LEAD', level: 1 },
    { name: 'Supporting Actor', code: 'SUPP', level: 2 },
    { name: 'Day Player', code: 'DAY_PLR', level: 3 },
    { name: 'Weekly Player', code: 'WK_PLR', level: 2 },
    { name: 'Stunt Coordinator', code: 'STN_COO', level: 1 },
    { name: 'Stunt Performer', code: 'STN_PER', level: 2 },
  ],

  // ─── SAG-AFTRA BACKGROUND / EXTRAS ─────────────
  SAG_AFTRA_BG: [
    { name: 'Background Actor', code: 'BG_ACT', level: 1 },
    { name: 'Stand-In', code: 'STAND_IN', level: 1 },
    { name: 'Photo Double', code: 'PHT_DBL', level: 1 },
    { name: 'Utility Stunts', code: 'UTIL_STN', level: 2 },
  ],

  // ─── SAG-AFTRA STUNT ──────────────────────────
  SAG_AFTRA_STUNT: [
    { name: 'Stunt Coordinator', code: 'STN_COO', level: 1 },
    { name: 'Stunt Performer', code: 'STN_PER', level: 2 },
    { name: 'Stunt Double', code: 'STN_DBL', level: 2 },
    { name: 'Stunt Rigger', code: 'STN_RIG', level: 3 },
  ],

  // ─── SAG-AFTRA VOICE / LOOPING ────────────────
  SAG_AFTRA_VOICE: [
    { name: 'Voice-Over Artist', code: 'VO_ART', level: 1 },
    { name: 'ADR / Looping Artist', code: 'ADR', level: 2 },
    { name: 'Narrator', code: 'NARR', level: 1 },
  ],

  // ─── SAG-AFTRA DANCERS / SINGERS ──────────────
  SAG_AFTRA_DANCE: [
    { name: 'Choreographer', code: 'CHOREO', level: 1 },
    { name: 'Dancer', code: 'DANCER', level: 2 },
    { name: 'Singer (Solo/Duo)', code: 'SINGER_SOLO', level: 1 },
    { name: 'Singer (Group/Choir)', code: 'SINGER_GRP', level: 2 },
  ],

  // ─── IATSE CAMERA (LOCAL 600) ──────────────────
  IATSE_CAM: [
    { name: 'Director of Photography', code: 'DOP', level: 1 },
    { name: 'Camera Operator', code: 'CAM_OP', level: 2 },
    { name: '1st Assistant Camera', code: '1AC', level: 3 },
    { name: '2nd Assistant Camera', code: '2AC', level: 4 },
    { name: 'Digital Imaging Technician (DIT)', code: 'DIT', level: 3 },
    { name: 'Still Photographer', code: 'STILL', level: 3 },
    { name: 'Steadicam Operator', code: 'STEAD', level: 2 },
  ],

  // ─── IATSE GRIPS (LOCAL 80) ────────────────────
  IATSE_GRP: [
    { name: 'Key Grip', code: 'KEY_GRP', level: 1 },
    { name: 'Best Boy Grip', code: 'BB_GRP', level: 2 },
    { name: 'Dolly Grip', code: 'DLY_GRP', level: 2 },
    { name: 'Grip', code: 'GRP', level: 3 },
    { name: 'Rigging Grip', code: 'RIG_GRP', level: 3 },
  ],

  // ─── IATSE ELECTRICIANS (LOCAL 728) ────────────
  IATSE_ELC: [
    { name: 'Gaffer', code: 'GAF', level: 1 },
    { name: 'Best Boy Electric', code: 'BB_ELC', level: 2 },
    { name: 'Electrician', code: 'ELEC', level: 3 },
    { name: 'Rigging Gaffer', code: 'RIG_GAF', level: 1 },
    { name: 'Rigging Electrician', code: 'RIG_ELC', level: 3 },
  ],

  // ─── IATSE ART DEPARTMENT (LOCAL 800) ──────────
  IATSE_ART: [
    { name: 'Production Designer', code: 'PROD_DES', level: 1 },
    { name: 'Supervising Art Director', code: 'SUP_AD', level: 2 },
    { name: 'Art Director', code: 'ART_DIR', level: 3 },
    { name: 'Assistant Art Director', code: 'AST_AD', level: 4 },
    { name: 'Illustrator', code: 'ILLUST', level: 4 },
    { name: 'Graphic Artist', code: 'GFX_ART', level: 4 },
    { name: 'Model Maker', code: 'MODEL', level: 4 },
    { name: 'Art Department Coordinator', code: 'ART_COO', level: 5 },
  ],

  // ─── IATSE COSTUME (LOCAL 705) ─────────────────
  IATSE_COS: [
    { name: 'Costume Designer', code: 'COS_DES', level: 1 },
    { name: 'Costume Supervisor', code: 'COS_SUP', level: 2 },
    { name: 'Assistant Costume Designer', code: 'AST_COS', level: 3 },
    { name: 'Key Costumer', code: 'KEY_COS', level: 3 },
    { name: 'Costumer', code: 'COSTUMER', level: 4 },
    { name: 'Costume Coordinator', code: 'COS_COO', level: 4 },
  ],

  // ─── IATSE HAIR & MAKEUP (LOCAL 706) ───────────
  IATSE_HMU: [
    { name: 'Department Head - Makeup', code: 'HOD_MU', level: 1 },
    { name: 'Department Head - Hair', code: 'HOD_HAIR', level: 1 },
    { name: 'Key Makeup Artist', code: 'KEY_MU', level: 2 },
    { name: 'Key Hairstylist', code: 'KEY_HAIR', level: 2 },
    { name: 'Makeup Artist', code: 'MU_ART', level: 3 },
    { name: 'Hairstylist', code: 'HAIR_ART', level: 3 },
    { name: 'Special Makeup Effects Artist', code: 'SPFX_MU', level: 2 },
  ],

  // ─── IATSE SOUND (LOCAL 695) ───────────────────
  IATSE_SND: [
    { name: 'Production Sound Mixer', code: 'PSM', level: 1 },
    { name: 'Boom Operator', code: 'BOOM', level: 2 },
    { name: 'Sound Utility', code: 'SND_UTIL', level: 3 },
    { name: 'Video Assist Operator', code: 'VID_AST', level: 3 },
    { name: 'Playback Operator', code: 'PLAY', level: 3 },
  ],

  // ─── IATSE EDITORS (LOCAL 700) ─────────────────
  IATSE_EDIT: [
    { name: 'Editor', code: 'EDITOR', level: 1 },
    { name: 'Assistant Editor', code: 'AST_ED', level: 2 },
    { name: 'Apprentice Editor', code: 'APP_ED', level: 3 },
    { name: 'Sound Editor', code: 'SND_ED', level: 1 },
    { name: 'Music Editor', code: 'MUS_ED', level: 2 },
    { name: 'Post Production Supervisor', code: 'POST_SUP', level: 1 },
    { name: 'Post Production Coordinator', code: 'POST_COO', level: 2 },
  ],

  // ─── IATSE PROPS (LOCAL 44) ────────────────────
  IATSE_PRP: [
    { name: 'Property Master', code: 'PROP_MST', level: 1 },
    { name: 'Assistant Property Master', code: 'AST_PRP', level: 2 },
    { name: 'Props Buyer', code: 'PRP_BUY', level: 3 },
    { name: 'Props Person', code: 'PRP_PER', level: 3 },
    { name: 'Props Maker', code: 'PRP_MKR', level: 3 },
  ],

  // ─── IATSE SET DECORATORS (LOCAL 44) ───────────
  IATSE_SETDEC: [
    { name: 'Set Decorator', code: 'SET_DEC', level: 1 },
    { name: 'Lead Person', code: 'LEAD_PER', level: 2 },
    { name: 'Set Dresser', code: 'SET_DRS', level: 3 },
    { name: 'On-Set Dresser', code: 'ON_DRS', level: 3 },
    { name: 'Set Decoration Buyer', code: 'DEC_BUY', level: 3 },
    { name: 'Set Decoration Coordinator', code: 'DEC_COO', level: 4 },
  ],

  // ─── IATSE SCRIPT SUPERVISORS (LOCAL 871) ──────
  IATSE_SCRP: [
    { name: 'Script Supervisor', code: 'SCRP_SUP', level: 1 },
    { name: 'Production Coordinator', code: 'PROD_COO', level: 2 },
    { name: 'Assistant Production Coordinator', code: 'AST_COO', level: 3 },
  ],

  // ─── IATSE PRODUCTION OFFICE (LOCAL 161) ───────
  IATSE_PROD: [
    { name: 'Production Office Coordinator', code: 'POC', level: 1 },
    { name: 'Assistant Production Office Coordinator', code: 'APOC', level: 2 },
    { name: 'Production Secretary', code: 'PROD_SEC', level: 3 },
    { name: 'Production Accountant', code: 'PROD_ACC', level: 1 },
    { name: 'First Assistant Accountant', code: '1ST_ACC', level: 2 },
    { name: 'Second Assistant Accountant', code: '2ND_ACC', level: 3 },
    { name: 'Payroll Accountant', code: 'PAY_ACC', level: 2 },
  ],

  // ─── WGA SCREENWRITERS ─────────────────────────
  WGA_SCRN: [
    { name: 'Screenwriter (Original)', code: 'SCRN_ORIG', level: 1 },
    { name: 'Screenwriter (Adaptation/Rewrite)', code: 'SCRN_ADPT', level: 2 },
  ],

  // ─── WGA TV WRITERS ────────────────────────────
  WGA_TVW: [
    { name: 'Staff Writer', code: 'STAFF_WR', level: 6 },
    { name: 'Story Editor', code: 'STORY_ED', level: 5 },
    { name: 'Executive Story Editor', code: 'EXEC_SE', level: 4 },
    { name: 'Co-Producer Writer', code: 'CO_PROD_W', level: 3 },
    { name: 'Supervising Producer Writer', code: 'SUP_PROD_W', level: 2 },
    { name: 'Showrunner', code: 'SHOWRUNNER', level: 1 },
  ],

  // ─── TEAMSTERS TRANSPORTATION ──────────────────
  TEAMSTERS_TRANS: [
    { name: 'Transportation Coordinator', code: 'TRANS_COO', level: 1 },
    { name: 'Transportation Captain', code: 'TRANS_CPT', level: 2 },
    { name: 'Driver', code: 'DRIVER', level: 3 },
  ],

  // ─── TEAMSTERS CASTING ─────────────────────────
  TEAMSTERS_CAST: [
    { name: 'Casting Director', code: 'CAST_DIR', level: 1 },
    { name: 'Casting Associate', code: 'CAST_ASC', level: 2 },
    { name: 'Casting Assistant', code: 'CAST_AST', level: 3 },
  ],

  // ─── TEAMSTERS LOCATION MANAGERS ───────────────
  TEAMSTERS_LOC: [
    { name: 'Location Manager', code: 'LOC_MGR', level: 1 },
    { name: 'Assistant Location Manager', code: 'AST_LOC', level: 2 },
    { name: 'Location Scout', code: 'LOC_SCT', level: 3 },
  ],

  // ─── AFM SESSION MUSICIANS ─────────────────────
  AFM_SESS: [
    { name: 'Session Musician', code: 'SESS_MUS', level: 1 },
    { name: 'Session Leader / Contractor', code: 'SESS_LDR', level: 1 },
    { name: 'Copyist', code: 'COPYIST', level: 2 },
    { name: 'Orchestrator', code: 'ORCH_ARR', level: 1 },
  ],

  // ─── AFM ORCHESTRAL ────────────────────────────
  AFM_ORCH: [
    { name: 'Orchestra Conductor', code: 'ORCH_COND', level: 1 },
    { name: 'Concertmaster', code: 'CONC_MST', level: 1 },
    { name: 'Orchestral Player', code: 'ORCH_PLR', level: 2 },
    { name: 'Orchestral Contractor', code: 'ORCH_CON', level: 1 },
  ],
};
