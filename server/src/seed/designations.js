// Designations per department (key = "UNION_DEPTCODE")
// Source: BECTU ratecards https://bectu.org.uk/get-involved-in-the-union/ratecards/
//         Camera Branch https://camerabranch.org.uk/rates/
//         Sparks Branch https://sites.google.com/view/sparksbranch/rates-agreements
//         Art Dept https://www.bectuartdepartment.co.uk/rate-card-2024
//         Costume https://www.bectucostume.com/rate-card-1
//         Graphics https://www.graphicsunion.co.uk/rates
//         Equity Pact Cinema Films Agreement
//         FAA/Pact Agreement
export const designationsByDept = {
  // ─── BECTU CAMERA ──────────────────────────────
  BECTU_CAM: [
    { name: 'Director of Photography', code: 'DOP', level: 1 },
    { name: 'Camera Operator', code: 'CAM_OP', level: 2 },
    { name: '1st Assistant Camera (Focus Puller)', code: '1AC', level: 3 },
    { name: '2nd Assistant Camera (Clapper Loader)', code: '2AC', level: 4 },
    { name: 'Digital Imaging Technician (DIT)', code: 'DIT', level: 3 },
    { name: 'Camera Trainee', code: 'CAM_TRN', level: 5 },
    { name: 'Steadicam Operator', code: 'STEAD', level: 2 },
    { name: 'Drone Operator', code: 'DRONE', level: 2 },
  ],

  // ─── BECTU SOUND ───────────────────────────────
  BECTU_SND: [
    { name: 'Production Sound Mixer', code: 'PSM', level: 1 },
    { name: 'Boom Operator', code: 'BOOM', level: 2 },
    { name: 'Sound Assistant', code: 'SND_AST', level: 3 },
    { name: 'Sound Trainee', code: 'SND_TRN', level: 4 },
  ],

  // ─── BECTU GRIP ────────────────────────────────
  BECTU_GRP: [
    { name: 'Key Grip', code: 'KEY_GRP', level: 1 },
    { name: 'Best Boy Grip', code: 'BB_GRP', level: 2 },
    { name: 'Dolly Grip', code: 'DLY_GRP', level: 2 },
    { name: 'Grip', code: 'GRP', level: 3 },
    { name: 'Grip Trainee', code: 'GRP_TRN', level: 4 },
  ],

  // ─── BECTU LIGHTING (SPARKS) ───────────────────
  BECTU_LIT: [
    { name: 'Gaffer', code: 'GAF', level: 1 },
    { name: 'Best Boy Electric', code: 'BB_ELC', level: 2 },
    { name: 'Electrician (Spark)', code: 'SPARK', level: 3 },
    { name: 'Rigging Gaffer', code: 'RIG_GAF', level: 1 },
    { name: 'Rigging Electrician', code: 'RIG_ELC', level: 3 },
    { name: 'Lighting Trainee', code: 'LIT_TRN', level: 4 },
  ],

  // ─── BECTU ART DEPARTMENT ──────────────────────
  BECTU_ART: [
    { name: 'Production Designer', code: 'PROD_DES', level: 1 },
    { name: 'Supervising Art Director', code: 'SUP_AD', level: 2 },
    { name: 'Art Director', code: 'ART_DIR', level: 3 },
    { name: 'Assistant Art Director', code: 'AST_AD', level: 4 },
    { name: 'Standby Art Director', code: 'STBY_AD', level: 4 },
    { name: 'Art Department Assistant', code: 'ART_AST', level: 5 },
    { name: 'Draughtsperson', code: 'DRFT', level: 4 },
    { name: 'Set Decorator', code: 'SET_DEC', level: 3 },
    { name: 'Art Department Trainee', code: 'ART_TRN', level: 6 },
  ],

  // ─── BECTU COSTUME ─────────────────────────────
  BECTU_COS: [
    { name: 'Costume Designer', code: 'COS_DES', level: 1 },
    { name: 'Costume Supervisor', code: 'COS_SUP', level: 2 },
    { name: 'Assistant Costume Designer', code: 'AST_COS', level: 3 },
    { name: 'Costume Standby', code: 'COS_STBY', level: 3 },
    { name: 'Costume Maker / Cutter', code: 'COS_MKR', level: 3 },
    { name: 'Costume Daily / Dresser', code: 'COS_DRS', level: 4 },
    { name: 'Costume Trainee', code: 'COS_TRN', level: 5 },
  ],

  // ─── BECTU HAIR, MAKEUP & PROSTHETICS ──────────
  BECTU_HMU: [
    { name: 'Hair & Makeup Designer', code: 'HMU_DES', level: 1 },
    { name: 'Hair & Makeup Supervisor', code: 'HMU_SUP', level: 2 },
    { name: 'Hair & Makeup Artist', code: 'HMU_ART', level: 3 },
    { name: 'Hair & Makeup Assistant', code: 'HMU_AST', level: 4 },
    { name: 'Prosthetics Supervisor', code: 'PROS_SUP', level: 2 },
    { name: 'Prosthetics Artist', code: 'PROS_ART', level: 3 },
    { name: 'Hair & Makeup Trainee', code: 'HMU_TRN', level: 5 },
  ],

  // ─── BECTU PROPS ───────────────────────────────
  BECTU_PRP: [
    { name: 'Property Master', code: 'PROP_MST', level: 1 },
    { name: 'Standby Props', code: 'STBY_PRP', level: 2 },
    { name: 'Props Buyer', code: 'PRP_BUY', level: 2 },
    { name: 'Chargehand Props', code: 'CHG_PRP', level: 2 },
    { name: 'Props Hand / Dressing Props', code: 'PRP_HND', level: 3 },
    { name: 'Props Maker', code: 'PRP_MKR', level: 3 },
    { name: 'Props Trainee', code: 'PRP_TRN', level: 4 },
  ],

  // ─── BECTU CONSTRUCTION ────────────────────────
  BECTU_CON: [
    { name: 'Construction Manager', code: 'CON_MGR', level: 1 },
    { name: 'HoD Carpenter', code: 'HOD_CARP', level: 2 },
    { name: 'Supervising Carpenter', code: 'SUP_CARP', level: 3 },
    { name: 'Chargehand Carpenter', code: 'CHG_CARP', level: 4 },
    { name: 'Carpenter', code: 'CARP', level: 5 },
    { name: 'HoD Painter', code: 'HOD_PAINT', level: 2 },
    { name: 'Supervising Painter', code: 'SUP_PAINT', level: 3 },
    { name: 'Scenic Painter', code: 'SCN_PAINT', level: 4 },
    { name: 'Painter', code: 'PAINT', level: 5 },
    { name: 'HoD Plasterer', code: 'HOD_PLST', level: 2 },
    { name: 'Plasterer', code: 'PLST', level: 4 },
    { name: 'Stagehand', code: 'STGHND', level: 5 },
  ],

  // ─── BECTU LOCATIONS ───────────────────────────
  BECTU_LOC: [
    { name: 'Supervising Location Manager', code: 'SUP_LOC', level: 1 },
    { name: 'Location Manager', code: 'LOC_MGR', level: 2 },
    { name: 'Assistant Location Manager', code: 'AST_LOC', level: 3 },
    { name: 'Unit Manager', code: 'UNIT_MGR', level: 3 },
    { name: 'Location Scout', code: 'LOC_SCT', level: 4 },
    { name: 'Location Assistant', code: 'LOC_AST', level: 5 },
    { name: 'Location Trainee', code: 'LOC_TRN', level: 6 },
  ],

  // ─── BECTU POST PRODUCTION ─────────────────────
  BECTU_POST: [
    { name: 'Post Production Supervisor', code: 'POST_SUP', level: 1 },
    { name: 'Editor', code: 'EDITOR', level: 2 },
    { name: 'Assembly Editor', code: 'ASM_ED', level: 3 },
    { name: 'Assistant Editor', code: 'AST_ED', level: 4 },
    { name: 'VFX Editor', code: 'VFX_ED', level: 3 },
    { name: 'Colourist', code: 'COLOUR', level: 2 },
    { name: 'Online Editor', code: 'ON_ED', level: 3 },
    { name: 'Post Production Coordinator', code: 'POST_COO', level: 4 },
    { name: 'Post Trainee', code: 'POST_TRN', level: 5 },
  ],

  // ─── BECTU ASSISTANT DIRECTORS ─────────────────
  BECTU_AD: [
    { name: '1st Assistant Director', code: '1AD', level: 1 },
    { name: '2nd Assistant Director', code: '2AD', level: 2 },
    { name: '3rd Assistant Director', code: '3AD', level: 3 },
    { name: 'Floor Runner', code: 'FLR_RUN', level: 4 },
    { name: 'Crowd AD', code: 'CRD_AD', level: 3 },
  ],

  // ─── BECTU PRODUCTION OFFICE ───────────────────
  BECTU_PROD: [
    { name: 'Production Manager', code: 'PROD_MGR', level: 1 },
    { name: 'Production Coordinator', code: 'PROD_COO', level: 2 },
    { name: 'Assistant Production Coordinator', code: 'AST_COO', level: 3 },
    { name: 'Production Secretary', code: 'PROD_SEC', level: 4 },
    { name: 'Production Accountant', code: 'PROD_ACC', level: 2 },
    { name: 'Assistant Accountant', code: 'AST_ACC', level: 3 },
    { name: 'Cashier', code: 'CASH', level: 4 },
    { name: 'Script Supervisor', code: 'SCRP_SUP', level: 2 },
  ],

  // ─── BECTU SPECIAL EFFECTS ─────────────────────
  BECTU_SFX: [
    { name: 'SFX Supervisor', code: 'SFX_SUP', level: 1 },
    { name: 'Senior SFX Technician', code: 'SR_SFX', level: 2 },
    { name: 'SFX Technician', code: 'SFX_TECH', level: 3 },
    { name: 'SFX Assistant', code: 'SFX_AST', level: 4 },
  ],

  // ─── BECTU SET CRAFTS ──────────────────────────
  BECTU_SETC: [
    { name: 'Standby Carpenter', code: 'STBY_CARP', level: 1 },
    { name: 'Standby Painter', code: 'STBY_PAINT', level: 1 },
    { name: 'Standby Rigger', code: 'STBY_RIG', level: 1 },
    { name: 'Standby Stagehand', code: 'STBY_STGE', level: 2 },
  ],

  // ─── BECTU GRAPHICS ────────────────────────────
  BECTU_GFX: [
    { name: 'Lead Graphic Designer / Graphic Art Director', code: 'LEAD_GFX', level: 1 },
    { name: 'Graphic Designer', code: 'GFX_DES', level: 2 },
    { name: 'Assistant Graphic Designer', code: 'AST_GFX', level: 3 },
    { name: 'Graphics Assistant', code: 'GFX_AST', level: 4 },
    { name: 'Graphics Trainee', code: 'GFX_TRN', level: 5 },
  ],

  // ─── BECTU VFX / ANIMATION ─────────────────────
  BECTU_VFX: [
    { name: 'VFX Supervisor', code: 'VFX_SUP', level: 1 },
    { name: 'VFX Producer', code: 'VFX_PRD', level: 2 },
    { name: 'VFX Coordinator', code: 'VFX_COO', level: 3 },
    { name: 'Compositor', code: 'COMP', level: 3 },
    { name: 'CG Artist', code: 'CG_ART', level: 3 },
    { name: 'Animator', code: 'ANIM', level: 3 },
  ],

  // ─── BECTU RUNNERS ─────────────────────────────
  BECTU_RUN: [
    { name: 'Rushes Runner', code: 'RUSH_RUN', level: 1 },
    { name: 'Office Runner', code: 'OFF_RUN', level: 2 },
    { name: 'Set Runner', code: 'SET_RUN', level: 2 },
  ],

  // ─── BECTU UNIT DRIVERS ────────────────────────
  BECTU_DRV: [
    { name: 'Transport Captain', code: 'TRANS_CPT', level: 1 },
    { name: 'Unit Driver', code: 'UNIT_DRV', level: 2 },
    { name: 'Minibus Driver', code: 'MINI_DRV', level: 2 },
    { name: 'HGV Driver', code: 'HGV_DRV', level: 2 },
  ],

  // ─── BECTU RIGGERS ─────────────────────────────
  BECTU_RIG: [
    { name: 'Rigging Supervisor', code: 'RIG_SUP', level: 1 },
    { name: 'Rigger', code: 'RIGGER', level: 2 },
    { name: 'Rigging Assistant', code: 'RIG_AST', level: 3 },
  ],

  // ─── EQUITY CAST ───────────────────────────────
  EQUITY_CAST: [
    { name: 'Lead Actor', code: 'LEAD', level: 1 },
    { name: 'Supporting Actor', code: 'SUPP', level: 2 },
    { name: 'Day Player', code: 'DAY_PLR', level: 3 },
    { name: 'Weekly Player', code: 'WK_PLR', level: 2 },
  ],

  // ─── EQUITY STUNT ──────────────────────────────
  EQUITY_STUNT: [
    { name: 'Stunt Coordinator', code: 'STN_COO', level: 1 },
    { name: 'Stunt Performer', code: 'STN_PER', level: 2 },
    { name: 'Stunt Double', code: 'STN_DBL', level: 2 },
  ],

  // ─── EQUITY DANCE ──────────────────────────────
  EQUITY_DANCE: [
    { name: 'Choreographer', code: 'CHOREO', level: 1 },
    { name: 'Dancer', code: 'DANCER', level: 2 },
  ],

  // ─── EQUITY VOICE ──────────────────────────────
  EQUITY_VOICE: [
    { name: 'Voice Artist', code: 'VO_ART', level: 1 },
    { name: 'ADR Artist', code: 'ADR', level: 2 },
  ],

  // ─── FAA BACKGROUND ────────────────────────────
  FAA_BG: [
    { name: 'Background Artist', code: 'BG_ART', level: 1 },
    { name: 'Stand-In', code: 'STAND_IN', level: 1 },
    { name: 'Photo Double', code: 'PHT_DBL', level: 1 },
  ],

  FAA_WO: [
    { name: 'Walk-On Artist', code: 'WO_ART', level: 1 },
  ],

  // ─── DIRECTORS UK ──────────────────────────────
  DIRECTORS_UK_DIR: [
    { name: 'Director (Feature Film)', code: 'DIR_FILM', level: 1 },
    { name: 'Director (TV Drama)', code: 'DIR_TV', level: 1 },
    { name: 'Director (TV Entertainment)', code: 'DIR_ENT', level: 2 },
    { name: '2nd Unit Director', code: '2ND_DIR', level: 2 },
  ],

  // ─── WGGB SCREENWRITERS ────────────────────────
  WGGB_SCRN: [
    { name: 'Screenwriter (Original)', code: 'SCRN_ORIG', level: 1 },
    { name: 'Screenwriter (Adaptation)', code: 'SCRN_ADAPT', level: 2 },
  ],

  WGGB_TVW: [
    { name: 'TV Writer (Original)', code: 'TVW_ORIG', level: 1 },
    { name: 'TV Writer (Dramatisation)', code: 'TVW_DRAM', level: 2 },
  ],

  // ─── MUSICIANS UNION ───────────────────────────
  MU_SESS: [
    { name: 'Session Musician', code: 'SESS_MUS', level: 1 },
    { name: 'Session Leader / Fixer', code: 'SESS_LDR', level: 1 },
  ],

  MU_ORCH: [
    { name: 'Orchestral Leader', code: 'ORCH_LDR', level: 1 },
    { name: 'Orchestral Player', code: 'ORCH_PLR', level: 2 },
    { name: 'Orchestral Contractor', code: 'ORCH_CON', level: 1 },
  ],

  MU_COMP: [
    { name: 'Film Composer', code: 'FILM_CMP', level: 1 },
    { name: 'Orchestrator / Arranger', code: 'ORCH_ARR', level: 2 },
  ],
};
