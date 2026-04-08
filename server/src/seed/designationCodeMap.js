/**
 * Maps every crew designation to its Movie Magic Budgeting account codes.
 * Used when creating deal memos — the system auto-assigns nominal codes
 * based on the crew member's designation and department.
 *
 * Each entry:
 *   designationName  – role title as shown in deal memos
 *   departmentName   – department grouping
 *   labourCode       – basic pay account code
 *   overtimeCode     – OT account code (usually central 4401)
 *   allowanceCode    – kit/box rental code
 *   fringeCode       – employer NIC code
 *   pensionCode      – pension contribution code
 *   holidayPayCode   – holiday pay code
 *   territory        – 'universal'
 */

const dm = (designationName, departmentName, labourCode, opts = {}) => ({
  designationName,
  departmentName,
  labourCode,
  overtimeCode: opts.ot || '4401',
  allowanceCode: opts.allow || null,
  fringeCode: opts.fringe || null,
  pensionCode: opts.pension || null,
  holidayPayCode: opts.hp || null,
  territory: 'universal',
});

export const designationCodeMapData = [
  // ───────────────────────── Camera (3300) ─────────────────────────
  dm('Director of Photography', 'Camera', '3301', { allow: '3380', fringe: '3399', pension: '3397', hp: '3396' }),
  dm('Camera Operator', 'Camera', '3302', { allow: '3380', fringe: '3399', pension: '3397', hp: '3396' }),
  dm('Steadicam Operator', 'Camera', '3302', { allow: '3380', fringe: '3399', pension: '3397', hp: '3396' }),
  dm('1st Assistant Camera (Focus Puller)', 'Camera', '3304', { allow: '3380', fringe: '3399', pension: '3397', hp: '3396' }),
  dm('2nd Assistant Camera (Clapper Loader)', 'Camera', '3306', { allow: '3380', fringe: '3399', pension: '3397', hp: '3396' }),
  dm('Digital Imaging Technician (DIT)', 'Camera', '3311', { allow: '3380', fringe: '3399', pension: '3397', hp: '3396' }),
  dm('Drone Operator', 'Camera', '3315', { allow: '3380', fringe: '3399', pension: '3397', hp: '3396' }),
  dm('Camera Trainee', 'Camera', '3308', { allow: '3380', fringe: '3399', pension: '3397', hp: '3396' }),

  // ───────────────────────── Sound (3400) ─────────────────────────
  dm('Sound Mixer', 'Sound', '3401', { allow: '3480', fringe: '3499', pension: '3497', hp: '3496' }),
  dm('Boom Operator', 'Sound', '3402', { allow: '3480', fringe: '3499', pension: '3497', hp: '3496' }),
  dm('Sound Assistant', 'Sound', '3403', { allow: '3480', fringe: '3499', pension: '3497', hp: '3496' }),
  dm('Playback Operator', 'Sound', '3403', { allow: '3480', fringe: '3499', pension: '3497', hp: '3496' }),

  // ───────────────────────── Lighting (3200) ─────────────────────────
  dm('Gaffer', 'Lighting', '3201', { allow: '3280', fringe: '3299', pension: '3297', hp: '3296' }),
  dm('Best Boy Electric', 'Lighting', '3202', { allow: '3280', fringe: '3299', pension: '3297', hp: '3296' }),
  dm('Electrician (Spark)', 'Lighting', '3203', { allow: '3280', fringe: '3299', pension: '3297', hp: '3296' }),
  dm('Desk Operator', 'Lighting', '3203', { allow: '3280', fringe: '3299', pension: '3297', hp: '3296' }),
  dm('Generator Operator', 'Lighting', '3206', { allow: '3280', fringe: '3299', pension: '3297', hp: '3296' }),
  dm('Lighting Trainee', 'Lighting', '3204', { allow: '3280', fringe: '3299', pension: '3297', hp: '3296' }),

  // ───────────────────────── Grip (2500) ─────────────────────────
  dm('Key Grip', 'Grip', '2501', { allow: '2580', fringe: '2599', pension: '2597', hp: '2596' }),
  dm('Best Boy Grip', 'Grip', '2505', { allow: '2580', fringe: '2599', pension: '2597', hp: '2596' }),
  dm('Dolly Grip', 'Grip', '2505', { allow: '2580', fringe: '2599', pension: '2597', hp: '2596' }),
  dm('Grip', 'Grip', '2505', { allow: '2580', fringe: '2599', pension: '2597', hp: '2596' }),
  dm('Crane Grip', 'Grip', '2505', { allow: '2580', fringe: '2599', pension: '2597', hp: '2596' }),
  dm('Grip Trainee', 'Grip', '2505', { allow: '2580', fringe: '2599', pension: '2597', hp: '2596' }),

  // ───────────────────────── Art / Set Design (2200) ─────────────────────────
  dm('Production Designer', 'Art Department', '2201', { allow: '2280', fringe: '2299', pension: '2297', hp: '2296' }),
  dm('Art Director', 'Art Department', '2202', { allow: '2280', fringe: '2299', pension: '2297', hp: '2296' }),
  dm('Standby Art Director', 'Art Department', '2204', { allow: '2280', fringe: '2299', pension: '2297', hp: '2296' }),
  dm('Art Department Assistant', 'Art Department', '2208', { allow: '2280', fringe: '2299', pension: '2297', hp: '2296' }),
  dm('Draughtsperson', 'Art Department', '2204', { allow: '2280', fringe: '2299', pension: '2297', hp: '2296' }),
  dm('Art Department Trainee', 'Art Department', '2208', { allow: '2280', fringe: '2299', pension: '2297', hp: '2296' }),

  // ───────────────────────── Set Dressing (2700) ─────────────────────────
  dm('Set Decorator', 'Set Dressing', '2701', { allow: '2780', fringe: '2799', pension: '2797', hp: '2796' }),
  dm('Standby Art Director (Set Dressing)', 'Set Dressing', '2704', { allow: '2780', fringe: '2799', pension: '2797', hp: '2796' }),
  dm('Swing Gang', 'Set Dressing', '2707', { allow: '2780', fringe: '2799', pension: '2797', hp: '2796' }),

  // ───────────────────────── Props (2800) ─────────────────────────
  dm('Property Master', 'Props', '2801', { allow: '2880', fringe: '2899', pension: '2897', hp: '2896' }),
  dm('Storeman', 'Props', '2802', { allow: '2880', fringe: '2899', pension: '2897', hp: '2896' }),
  dm('Standby Props', 'Props', '2809', { allow: '2880', fringe: '2899', pension: '2897', hp: '2896' }),
  dm('Props Buyer', 'Props', '2810', { allow: '2880', fringe: '2899', pension: '2897', hp: '2896' }),
  dm('Chargehand Props', 'Props', '2802', { allow: '2880', fringe: '2899', pension: '2897', hp: '2896' }),
  dm('Weapons Handler', 'Props', '2805', { allow: '2880', fringe: '2899', pension: '2897', hp: '2896' }),

  // ───────────────────────── Wardrobe / Costume (3000) ─────────────────────────
  dm('Costume Designer', 'Costume', '3001', { allow: '3080', fringe: '3099', pension: '3097', hp: '3096' }),
  dm('Costume Supervisor', 'Costume', '3003', { allow: '3080', fringe: '3099', pension: '3097', hp: '3096' }),
  dm('Costumer / Dresser', 'Costume', '3004', { allow: '3080', fringe: '3099', pension: '3097', hp: '3096' }),
  dm('Costume Standby', 'Costume', '3004', { allow: '3080', fringe: '3099', pension: '3097', hp: '3096' }),
  dm('Costume Maker / Cutter', 'Costume', '3006', { allow: '3080', fringe: '3099', pension: '3097', hp: '3096' }),
  dm('Costume Daily / Dresser', 'Costume', '3006', { allow: '3080', fringe: '3099', pension: '3097', hp: '3096' }),
  dm('Costume Trainee', 'Costume', '3006', { allow: '3080', fringe: '3099', pension: '3097', hp: '3096' }),

  // ───────────────────────── HMU (3100) ─────────────────────────
  dm('Key Makeup Artist', 'Hair, Makeup & Prosthetics', '3101', { allow: '3180', fringe: '3199', pension: '3197', hp: '3196' }),
  dm('Makeup Artist', 'Hair, Makeup & Prosthetics', '3102', { allow: '3180', fringe: '3199', pension: '3197', hp: '3196' }),
  dm('Hair & Makeup Assistant', 'Hair, Makeup & Prosthetics', '3103', { allow: '3180', fringe: '3199', pension: '3197', hp: '3196' }),
  dm('Hair & Makeup Trainee', 'Hair, Makeup & Prosthetics', '3103', { allow: '3180', fringe: '3199', pension: '3197', hp: '3196' }),
  dm('Prosthetics Supervisor', 'Hair, Makeup & Prosthetics', '3102', { allow: '3180', fringe: '3199', pension: '3197', hp: '3196' }),

  // ───────────────────────── Production Staff / ADs (2000) ─────────────────────────
  dm('Production Manager', 'Production Office', '2001', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('UPM', 'Production Office', '2002', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('1st Assistant Director', 'Assistant Directors', '2003', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Key 2nd AD', 'Assistant Directors', '2004', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('2nd 2nd Assistant Director', 'Assistant Directors', '2005', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('3rd Assistant Director', 'Assistant Directors', '2006', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Floor Runner', 'Assistant Directors', '2007', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Crowd AD', 'Assistant Directors', '2006', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Script Supervisor', 'Production Office', '2008', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Production Coordinator', 'Production Office', '2009', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Asst Production Coordinator', 'Production Office', '2010', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Production Office Assistant', 'Production Office', '2013', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Location Manager', 'Locations', '2015', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Asst Location Manager', 'Locations', '2016', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Financial Controller', 'Production Office', '2018', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Production Accountant', 'Production Office', '2019', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('1st Assistant Accountant', 'Production Office', '2020', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('2nd Assistant Accountant', 'Production Office', '2020', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),

  // ───────────────────────── Transport (3500) ─────────────────────────
  dm('Transport Captain', 'Transportation', '3501', { fringe: '3599', pension: '3597', hp: '3596' }),
  dm('Transport Manager', 'Transportation', '3501', { fringe: '3599', pension: '3597', hp: '3596' }),
  dm('HGV Driver', 'Transportation', '3504', { fringe: '3599', pension: '3597', hp: '3596' }),
  dm('Minibus Driver', 'Transportation', '3504', { fringe: '3599', pension: '3597', hp: '3596' }),
  dm('Car Driver', 'Transportation', '3504', { fringe: '3599', pension: '3597', hp: '3596' }),
  dm('Facilities Driver', 'Transportation', '3504', { fringe: '3599', pension: '3597', hp: '3596' }),

  // ───────────────────────── Rigging (2400) ─────────────────────────
  dm('Rigging Gaffer', 'Rigging', '2407', { fringe: '2499', pension: '2497', hp: '2496' }),
  dm('Rigging Best Boy', 'Rigging', '2408', { fringe: '2499', pension: '2497', hp: '2496' }),
  dm('Rigger Electrician', 'Rigging', '2408', { fringe: '2499', pension: '2497', hp: '2496' }),
  dm('Rigging Supervisor', 'Rigging', '2407', { fringe: '2499', pension: '2497', hp: '2496' }),
  dm('Rigging Assistant', 'Rigging', '2408', { fringe: '2499', pension: '2497', hp: '2496' }),

  // ───────────────────────── Construction (2300) ─────────────────────────
  dm('Construction Manager', 'Construction', '2307', { fringe: '2399', pension: '2397', hp: '2396' }),
  dm('Chargehand Carpenter', 'Construction', '2307', { fringe: '2399', pension: '2397', hp: '2396' }),
  dm('Carpenter', 'Construction', '2307', { fringe: '2399', pension: '2397', hp: '2396' }),
  dm('Painter', 'Construction', '2307', { fringe: '2399', pension: '2397', hp: '2396' }),
  dm('Plasterer', 'Construction', '2307', { fringe: '2399', pension: '2397', hp: '2396' }),
  dm('Stagehand', 'Construction', '2307', { fringe: '2399', pension: '2397', hp: '2396' }),

  // ───────────────────────── SFX (2600) ─────────────────────────
  dm('SFX Supervisor', 'Special Effects (SFX)', '2601', { fringe: '2699', pension: '2697', hp: '2696' }),
  dm('SFX Technician', 'Special Effects (SFX)', '2601', { fringe: '2699', pension: '2697', hp: '2696' }),
  dm('SFX Floor Technician', 'Special Effects (SFX)', '2601', { fringe: '2699', pension: '2697', hp: '2696' }),

  // ───────────────────────── Runners (2000 — same as prod staff) ─────────────────────────
  dm('Set Runner', 'Runners', '2007', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Office Runner', 'Runners', '2013', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),
  dm('Rushes Runner', 'Runners', '2013', { allow: '2080', fringe: '2099', pension: '2097', hp: '2096' }),

  // ───────────────────────── Post (5000) ─────────────────────────
  dm('Film Editor', 'Post Production', '5001', { fringe: '5099', pension: '5097', hp: '5096' }),
  dm('Assistant Editor', 'Post Production', '5002', { fringe: '5099', pension: '5097', hp: '5096' }),
  dm('Post Production Supervisor', 'Post Production', '5008', { fringe: '5099', pension: '5097', hp: '5096' }),
  dm('VFX Supervisor', 'Post Production', '5506', { fringe: '5099', pension: '5097', hp: '5096' }),

  // ───────────────────────── Video Assist (2900) ─────────────────────────
  dm('Video Assist Operator', 'Video Assist', '2901', { fringe: '2999', pension: '2997', hp: '2996' }),
];
