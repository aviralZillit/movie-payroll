/**
 * Standard Movie Magic Budgeting nominal/account codes.
 * Extracted from real film budget (Show Dogs) — covers ATL through Post.
 *
 * Each entry:
 *   code          – 4-digit budget account code
 *   category      – human-readable department name (UPPER CASE for headers)
 *   categoryCode  – first 2 digits + "00" (parent category)
 *   description   – line item description
 *   type          – labour | equipment | materials | travel | allowance | fringes | other
 *   isLabour      – true if type === 'labour'
 *   isAllowance   – true if type === 'allowance'
 *   isFringe      – true if type === 'fringes'
 *   isCategory    – true for header/category rows
 *   territory     – 'universal'
 */

const nc = (code, category, categoryCode, description, type, flags = {}) => ({
  code,
  category,
  categoryCode,
  description,
  type,
  isLabour: type === 'labour',
  isAllowance: type === 'allowance',
  isFringe: type === 'fringes',
  isCategory: !!flags.isCategory,
  territory: 'universal',
});

export const nominalCodesData = [
  // ───────────────────────── Above The Line (1000-1600) ─────────────────────────
  nc('1000', 'SCRIPT RIGHTS', '1000', 'SCRIPT RIGHTS', 'other', { isCategory: true }),
  nc('1001', 'SCRIPT RIGHTS', '1000', 'Script Rights', 'other'),

  nc('1100', 'STORY, RIGHTS & OTHER', '1100', 'STORY, RIGHTS & OTHER', 'other', { isCategory: true }),
  nc('1101', 'STORY, RIGHTS & OTHER', '1100', 'Story Rights / Purchase', 'other'),

  nc('1200', 'PRODUCERS UNIT', '1200', 'PRODUCERS UNIT', 'labour', { isCategory: true }),
  nc('1201', 'PRODUCERS UNIT', '1200', 'Line Producer', 'labour'),
  nc('1202', 'PRODUCERS UNIT', '1200', 'Producer', 'labour'),
  nc('1203', 'PRODUCERS UNIT', '1200', 'Producers Assistants', 'labour'),
  nc('1217', 'PRODUCERS UNIT', '1200', 'Producer Rentals', 'equipment'),

  nc('1300', 'DIRECTOR', '1300', 'DIRECTOR', 'labour', { isCategory: true }),
  nc('1301', 'DIRECTOR', '1300', 'Director', 'labour'),
  nc('1315', 'DIRECTOR', '1300', "Director's Assistant", 'labour'),

  nc('1400', 'CAST', '1400', 'CAST', 'labour', { isCategory: true }),
  nc('1401', 'CAST', '1400', 'Stars & Leads', 'labour'),
  nc('1402', 'CAST', '1400', 'Supporting Cast', 'labour'),
  nc('1403', 'CAST', '1400', 'Day Players', 'labour'),
  nc('1404', 'CAST', '1400', 'Voice Over Cast', 'labour'),
  nc('1405', 'CAST', '1400', 'Stunt Coordinator', 'labour'),
  nc('1406', 'CAST', '1400', 'Stunt Players', 'labour'),
  nc('1410', 'CAST', '1400', 'Casting Director', 'labour'),
  nc('1411', 'CAST', '1400', 'Casting Assistant', 'labour'),

  nc('1500', 'ATL TRAVEL & LIVING', '1500', 'ATL TRAVEL & LIVING', 'travel', { isCategory: true }),

  nc('1600', 'LOCATION CAST EXPENSES', '1600', 'LOCATION CAST EXPENSES', 'travel', { isCategory: true }),

  // ───────────────────────── Production Staff (2000) ─────────────────────────
  nc('2000', 'PRODUCTION STAFF', '2000', 'PRODUCTION STAFF', 'labour', { isCategory: true }),
  nc('2001', 'PRODUCTION STAFF', '2000', 'Production Manager', 'labour'),
  nc('2002', 'PRODUCTION STAFF', '2000', 'UPM', 'labour'),
  nc('2003', 'PRODUCTION STAFF', '2000', '1st Asst Director', 'labour'),
  nc('2004', 'PRODUCTION STAFF', '2000', 'Key 2nd Asst Director', 'labour'),
  nc('2005', 'PRODUCTION STAFF', '2000', '2nd 2nd Asst Director', 'labour'),
  nc('2006', 'PRODUCTION STAFF', '2000', "Add'l 3rd ADs", 'labour'),
  nc('2007', 'PRODUCTION STAFF', '2000', 'Set Production Assts', 'labour'),
  nc('2008', 'PRODUCTION STAFF', '2000', 'Script Supervisor', 'labour'),
  nc('2009', 'PRODUCTION STAFF', '2000', 'Production Coordinator', 'labour'),
  nc('2010', 'PRODUCTION STAFF', '2000', 'Asst Production Coordinator', 'labour'),
  nc('2011', 'PRODUCTION STAFF', '2000', 'Travel Secretary', 'labour'),
  nc('2013', 'PRODUCTION STAFF', '2000', 'Production Office Assistants', 'labour'),
  nc('2015', 'PRODUCTION STAFF', '2000', 'Location Manager', 'labour'),
  nc('2016', 'PRODUCTION STAFF', '2000', 'Asst Location Managers', 'labour'),
  nc('2018', 'PRODUCTION STAFF', '2000', 'Financial Controller', 'labour'),
  nc('2019', 'PRODUCTION STAFF', '2000', 'Production Accountant', 'labour'),
  nc('2020', 'PRODUCTION STAFF', '2000', '2nd Asst Accountant', 'labour'),
  nc('2022', 'PRODUCTION STAFF', '2000', 'Accounting Clerks', 'labour'),
  nc('2080', 'PRODUCTION STAFF', '2000', 'Computer / Box Rentals', 'allowance'),
  nc('2096', 'PRODUCTION STAFF', '2000', 'Production Staff Holiday Pay', 'fringes'),
  nc('2097', 'PRODUCTION STAFF', '2000', 'Production Staff Pension', 'fringes'),
  nc('2099', 'PRODUCTION STAFF', '2000', 'Production Staff Employer NIC', 'fringes'),

  // ───────────────────────── Extras (2100) ─────────────────────────
  nc('2100', 'EXTRAS & STAND-INS', '2100', 'EXTRAS & STAND-INS', 'labour', { isCategory: true }),
  nc('2101', 'EXTRAS & STAND-INS', '2100', 'Stand-Ins', 'labour'),
  nc('2104', 'EXTRAS & STAND-INS', '2100', 'Non-Union Extras', 'labour'),

  // ───────────────────────── Set Design / Art (2200) ─────────────────────────
  nc('2200', 'SET DESIGN', '2200', 'SET DESIGN', 'labour', { isCategory: true }),
  nc('2201', 'SET DESIGN', '2200', 'Production Designer', 'labour'),
  nc('2202', 'SET DESIGN', '2200', 'Art Director', 'labour'),
  nc('2204', 'SET DESIGN', '2200', 'Set Designers', 'labour'),
  nc('2208', 'SET DESIGN', '2200', 'Art Dept PA', 'labour'),
  nc('2216', 'SET DESIGN', '2200', 'Art Dept Purchases / Supplies', 'materials'),
  nc('2217', 'SET DESIGN', '2200', 'Art Dept Rentals', 'equipment'),
  nc('2280', 'SET DESIGN', '2200', 'Art Dept Box Rentals', 'allowance'),
  nc('2296', 'SET DESIGN', '2200', 'Art Dept Holiday Pay', 'fringes'),
  nc('2297', 'SET DESIGN', '2200', 'Art Dept Pension', 'fringes'),
  nc('2299', 'SET DESIGN', '2200', 'Art Dept Employer NIC', 'fringes'),

  // ───────────────────────── Construction (2300) ─────────────────────────
  nc('2300', 'SET CONSTRUCTION', '2300', 'SET CONSTRUCTION', 'labour', { isCategory: true }),
  nc('2307', 'SET CONSTRUCTION', '2300', 'Labor & Materials', 'labour'),
  nc('2311', 'SET CONSTRUCTION', '2300', 'Signage & Graphics', 'labour'),
  nc('2316', 'SET CONSTRUCTION', '2300', 'Construction Purchases / Supplies', 'materials'),
  nc('2395', 'SET CONSTRUCTION', '2300', 'Construction Loss & Damage', 'other'),

  // ───────────────────────── Rigging (2400) ─────────────────────────
  nc('2400', 'RIGGING', '2400', 'RIGGING', 'labour', { isCategory: true }),
  nc('2401', 'RIGGING', '2400', 'Stand By Rigger', 'labour'),
  nc('2407', 'RIGGING', '2400', 'Electrical Rigging Gaffer', 'labour'),
  nc('2408', 'RIGGING', '2400', 'Electric Rigging Labor', 'labour'),
  nc('2417', 'RIGGING', '2400', 'Rigging Rentals', 'equipment'),
  nc('2479', 'RIGGING', '2400', 'Rigging Car Allowances', 'allowance'),

  // ───────────────────────── Grip / Set Operations (2500) ─────────────────────────
  nc('2500', 'SET OPERATIONS', '2500', 'SET OPERATIONS', 'labour', { isCategory: true }),
  nc('2501', 'SET OPERATIONS', '2500', 'Key Grip', 'labour'),
  nc('2505', 'SET OPERATIONS', '2500', "Add'l Grip Labor", 'labour'),
  nc('2509', 'SET OPERATIONS', '2500', 'Standby Carpenter', 'labour'),
  nc('2516', 'SET OPERATIONS', '2500', 'Grip Purchases', 'materials'),
  nc('2517', 'SET OPERATIONS', '2500', 'Grip Rentals', 'equipment'),
  nc('2520', 'SET OPERATIONS', '2500', 'Crane Rentals', 'equipment'),
  nc('2580', 'SET OPERATIONS', '2500', 'Grip Box Rentals', 'allowance'),
  nc('2595', 'SET OPERATIONS', '2500', 'Grip Loss & Damage', 'other'),
  nc('2596', 'SET OPERATIONS', '2500', 'Grip Holiday Pay', 'fringes'),
  nc('2597', 'SET OPERATIONS', '2500', 'Grip Pension', 'fringes'),
  nc('2599', 'SET OPERATIONS', '2500', 'Grip Employer NIC', 'fringes'),

  // ───────────────────────── SFX (2600) ─────────────────────────
  nc('2600', 'SPECIAL EFFECTS', '2600', 'SPECIAL EFFECTS', 'labour', { isCategory: true }),
  nc('2601', 'SPECIAL EFFECTS', '2600', 'SFX Supervisor / Quote', 'labour'),

  // ───────────────────────── Set Dressing (2700) ─────────────────────────
  nc('2700', 'SET DRESSING', '2700', 'SET DRESSING', 'labour', { isCategory: true }),
  nc('2701', 'SET DRESSING', '2700', 'Set Decorator', 'labour'),
  nc('2704', 'SET DRESSING', '2700', 'Stand By Art Director', 'labour'),
  nc('2707', 'SET DRESSING', '2700', 'Swing Gang', 'labour'),
  nc('2710', 'SET DRESSING', '2700', 'Buyer', 'labour'),
  nc('2716', 'SET DRESSING', '2700', 'Set Dressing Purchases/Rentals', 'materials'),
  nc('2780', 'SET DRESSING', '2700', 'Set Dressing Box Rentals', 'allowance'),
  nc('2795', 'SET DRESSING', '2700', 'Set Dressing Loss & Damage', 'other'),
  nc('2796', 'SET DRESSING', '2700', 'Set Dressing Holiday Pay', 'fringes'),
  nc('2797', 'SET DRESSING', '2700', 'Set Dressing Pension', 'fringes'),
  nc('2799', 'SET DRESSING', '2700', 'Set Dressing Employer NIC', 'fringes'),

  // ───────────────────────── Props (2800) ─────────────────────────
  nc('2800', 'PROPERTY', '2800', 'PROPERTY', 'labour', { isCategory: true }),
  nc('2801', 'PROPERTY', '2800', 'Prop Master', 'labour'),
  nc('2802', 'PROPERTY', '2800', 'Storeman', 'labour'),
  nc('2805', 'PROPERTY', '2800', 'Weapons Handler', 'labour'),
  nc('2809', 'PROPERTY', '2800', 'Stand By Prop', 'labour'),
  nc('2816', 'PROPERTY', '2800', 'Props Purchases/Rentals', 'materials'),
  nc('2880', 'PROPERTY', '2800', 'Props Box Rentals', 'allowance'),
  nc('2895', 'PROPERTY', '2800', 'Props Loss & Damage', 'other'),
  nc('2896', 'PROPERTY', '2800', 'Props Holiday Pay', 'fringes'),
  nc('2897', 'PROPERTY', '2800', 'Props Pension', 'fringes'),
  nc('2899', 'PROPERTY', '2800', 'Props Employer NIC', 'fringes'),

  // ───────────────────────── Video Assist (2900) ─────────────────────────
  nc('2900', 'VIDEO ASSIST', '2900', 'VIDEO ASSIST', 'labour', { isCategory: true }),
  nc('2901', 'VIDEO ASSIST', '2900', 'Video Assist Operator', 'labour'),
  nc('2917', 'VIDEO ASSIST', '2900', 'Video Assist Rentals', 'equipment'),

  // ───────────────────────── Wardrobe (3000) ─────────────────────────
  nc('3000', 'WARDROBE', '3000', 'WARDROBE', 'labour', { isCategory: true }),
  nc('3001', 'WARDROBE', '3000', 'Costume Designer', 'labour'),
  nc('3003', 'WARDROBE', '3000', 'Costume Supervisor', 'labour'),
  nc('3004', 'WARDROBE', '3000', 'Costumers', 'labour'),
  nc('3006', 'WARDROBE', '3000', "Add'l Wardrobe Labor", 'labour'),
  nc('3016', 'WARDROBE', '3000', 'Cast Costumes', 'materials'),
  nc('3080', 'WARDROBE', '3000', 'Wardrobe Box Rentals', 'allowance'),
  nc('3096', 'WARDROBE', '3000', 'Wardrobe Holiday Pay', 'fringes'),
  nc('3097', 'WARDROBE', '3000', 'Wardrobe Pension', 'fringes'),
  nc('3099', 'WARDROBE', '3000', 'Wardrobe Employer NIC', 'fringes'),

  // ───────────────────────── Makeup & Hair (3100) ─────────────────────────
  nc('3100', 'MAKEUP & HAIR', '3100', 'MAKEUP & HAIR', 'labour', { isCategory: true }),
  nc('3101', 'MAKEUP & HAIR', '3100', 'Key Make Up Artist', 'labour'),
  nc('3102', 'MAKEUP & HAIR', '3100', 'Make Up Artists', 'labour'),
  nc('3103', 'MAKEUP & HAIR', '3100', "Add'l Make Up Artists", 'labour'),
  nc('3116', 'MAKEUP & HAIR', '3100', 'Makeup / Hair Purchases', 'materials'),
  nc('3180', 'MAKEUP & HAIR', '3100', 'HMU Box Rentals', 'allowance'),
  nc('3195', 'MAKEUP & HAIR', '3100', 'HMU Loss & Damage', 'other'),
  nc('3196', 'MAKEUP & HAIR', '3100', 'HMU Holiday Pay', 'fringes'),
  nc('3197', 'MAKEUP & HAIR', '3100', 'HMU Pension', 'fringes'),
  nc('3199', 'MAKEUP & HAIR', '3100', 'HMU Employer NIC', 'fringes'),

  // ───────────────────────── Lighting (3200) ─────────────────────────
  nc('3200', 'LIGHTING', '3200', 'LIGHTING', 'labour', { isCategory: true }),
  nc('3201', 'LIGHTING', '3200', 'Chief Lighting Technician (Gaffer)', 'labour'),
  nc('3202', 'LIGHTING', '3200', 'Best Boy Electrician', 'labour'),
  nc('3203', 'LIGHTING', '3200', 'Electricians', 'labour'),
  nc('3204', 'LIGHTING', '3200', "Add'l Electricians", 'labour'),
  nc('3206', 'LIGHTING', '3200', 'Generator Operator', 'labour'),
  nc('3216', 'LIGHTING', '3200', 'Lighting Purchases', 'materials'),
  nc('3217', 'LIGHTING', '3200', 'Electric Rentals', 'equipment'),
  nc('3280', 'LIGHTING', '3200', 'Electric Box Rentals', 'allowance'),
  nc('3295', 'LIGHTING', '3200', 'Lighting Loss & Damage', 'other'),
  nc('3296', 'LIGHTING', '3200', 'Lighting Holiday Pay', 'fringes'),
  nc('3297', 'LIGHTING', '3200', 'Lighting Pension', 'fringes'),
  nc('3299', 'LIGHTING', '3200', 'Lighting Employer NIC', 'fringes'),

  // ───────────────────────── Camera (3300) ─────────────────────────
  nc('3300', 'CAMERA', '3300', 'CAMERA', 'labour', { isCategory: true }),
  nc('3301', 'CAMERA', '3300', 'Dir of Photography', 'labour'),
  nc('3302', 'CAMERA', '3300', 'A Camera Operator', 'labour'),
  nc('3303', 'CAMERA', '3300', 'B Camera Operator', 'labour'),
  nc('3304', 'CAMERA', '3300', 'A 1st Assistant Camera', 'labour'),
  nc('3305', 'CAMERA', '3300', 'B 1st Assistant Camera', 'labour'),
  nc('3306', 'CAMERA', '3300', 'A 2nd Asst Camera', 'labour'),
  nc('3307', 'CAMERA', '3300', 'B 2nd Asst Camera', 'labour'),
  nc('3308', 'CAMERA', '3300', 'Camera Trainee', 'labour'),
  nc('3311', 'CAMERA', '3300', 'DIT', 'labour'),
  nc('3315', 'CAMERA', '3300', 'Drone Operator', 'labour'),
  nc('3316', 'CAMERA', '3300', 'Camera Purchases', 'materials'),
  nc('3317', 'CAMERA', '3300', 'Camera Rentals', 'equipment'),
  nc('3380', 'CAMERA', '3300', 'Camera Box Rentals', 'allowance'),
  nc('3395', 'CAMERA', '3300', 'Camera Loss & Damage', 'other'),
  nc('3396', 'CAMERA', '3300', 'Camera Holiday Pay', 'fringes'),
  nc('3397', 'CAMERA', '3300', 'Camera Pension', 'fringes'),
  nc('3399', 'CAMERA', '3300', 'Camera Employer NIC', 'fringes'),

  // ───────────────────────── Sound (3400) ─────────────────────────
  nc('3400', 'PRODUCTION SOUND', '3400', 'PRODUCTION SOUND', 'labour', { isCategory: true }),
  nc('3401', 'PRODUCTION SOUND', '3400', 'Sound Mixer', 'labour'),
  nc('3402', 'PRODUCTION SOUND', '3400', 'Boom Operator', 'labour'),
  nc('3403', 'PRODUCTION SOUND', '3400', 'Cable Puller / Sound Assistant', 'labour'),
  nc('3416', 'PRODUCTION SOUND', '3400', 'Sound Purchases', 'materials'),
  nc('3417', 'PRODUCTION SOUND', '3400', 'Sound Rentals', 'equipment'),
  nc('3430', 'PRODUCTION SOUND', '3400', 'Walkie Talkies', 'equipment'),
  nc('3480', 'PRODUCTION SOUND', '3400', 'Sound Box Rentals', 'allowance'),
  nc('3495', 'PRODUCTION SOUND', '3400', 'Sound Loss & Damage', 'other'),
  nc('3496', 'PRODUCTION SOUND', '3400', 'Sound Holiday Pay', 'fringes'),
  nc('3497', 'PRODUCTION SOUND', '3400', 'Sound Pension', 'fringes'),
  nc('3499', 'PRODUCTION SOUND', '3400', 'Sound Employer NIC', 'fringes'),

  // ───────────────────────── Transportation (3500) ─────────────────────────
  nc('3500', 'TRANSPORTATION', '3500', 'TRANSPORTATION', 'labour', { isCategory: true }),
  nc('3501', 'TRANSPORTATION', '3500', 'Transport Manager', 'labour'),
  nc('3504', 'TRANSPORTATION', '3500', 'Drivers', 'labour'),
  nc('3507', 'TRANSPORTATION', '3500', 'Production Vehicles', 'equipment'),
  nc('3544', 'TRANSPORTATION', '3500', 'Gas & Oil', 'materials'),
  nc('3565', 'TRANSPORTATION', '3500', 'Mileage', 'allowance'),
  nc('3595', 'TRANSPORTATION', '3500', 'Transport Loss & Damage', 'other'),
  nc('3596', 'TRANSPORTATION', '3500', 'Transport Holiday Pay', 'fringes'),
  nc('3597', 'TRANSPORTATION', '3500', 'Transport Pension', 'fringes'),
  nc('3599', 'TRANSPORTATION', '3500', 'Transport Employer NIC', 'fringes'),

  // ───────────────────────── Locations (3600) ─────────────────────────
  nc('3600', 'LOCATIONS', '3600', 'LOCATIONS', 'other', { isCategory: true }),
  nc('3601', 'LOCATIONS', '3600', 'Site Rentals', 'other'),
  nc('3604', 'LOCATIONS', '3600', 'Police', 'other'),
  nc('3606', 'LOCATIONS', '3600', 'Security', 'other'),
  nc('3607', 'LOCATIONS', '3600', 'Health & Safety', 'other'),
  nc('3645', 'LOCATIONS', '3600', 'Catered Meals', 'other'),
  nc('3663', 'LOCATIONS', '3600', 'Office Rent', 'other'),
  nc('3678', 'LOCATIONS', '3600', 'Phone / Communication Equipment', 'equipment'),
  nc('3679', 'LOCATIONS', '3600', 'Cell Phones', 'allowance'),

  // ───────────────────────── Travel (3700) ─────────────────────────
  nc('3700', 'BTL TRAVEL & LIVING', '3700', 'BTL TRAVEL & LIVING', 'travel', { isCategory: true }),
  nc('3701', 'BTL TRAVEL & LIVING', '3700', 'Transportation Fares', 'travel'),
  nc('3704', 'BTL TRAVEL & LIVING', '3700', 'Crew Housing', 'travel'),
  nc('3705', 'BTL TRAVEL & LIVING', '3700', 'Crew Per Diem', 'travel'),

  // ───────────────────────── Film & Lab (3800) ─────────────────────────
  nc('3800', 'PRODUCTION FILM & LAB', '3800', 'PRODUCTION FILM & LAB', 'equipment', { isCategory: true }),

  // ───────────────────────── Picture Vehicles (3900) ─────────────────────────
  nc('3900', 'PICTURE VEHICLES', '3900', 'PICTURE VEHICLES', 'equipment', { isCategory: true }),

  // ───────────────────────── Overtime (4400) ─────────────────────────
  nc('4400', 'OVERTIME ALLOWANCES', '4400', 'OVERTIME ALLOWANCES', 'labour', { isCategory: true }),
  nc('4401', 'OVERTIME ALLOWANCES', '4400', 'Overtime', 'labour'),

  // ───────────────────────── Post Production (5000-5700) ─────────────────────────
  nc('5000', 'EDITORIAL', '5000', 'EDITORIAL', 'labour', { isCategory: true }),
  nc('5001', 'EDITORIAL', '5000', 'Film Editor', 'labour'),
  nc('5002', 'EDITORIAL', '5000', 'Assistant Editors', 'labour'),
  nc('5008', 'EDITORIAL', '5000', 'Post Production Supervisor', 'labour'),

  nc('5100', 'POST TRAVEL', '5100', 'POST TRAVEL', 'travel', { isCategory: true }),

  nc('5200', 'MUSIC', '5200', 'MUSIC', 'labour', { isCategory: true }),
  nc('5201', 'MUSIC', '5200', 'Composer', 'labour'),
  nc('5203', 'MUSIC', '5200', 'Music Editors', 'labour'),

  nc('5300', 'POST PRODUCTION SOUND', '5300', 'POST PRODUCTION SOUND', 'labour', { isCategory: true }),

  nc('5400', 'POST PRODUCTION FILM & LAB', '5400', 'POST PRODUCTION FILM & LAB', 'equipment', { isCategory: true }),

  nc('5500', 'VISUAL EFFECTS', '5500', 'VISUAL EFFECTS', 'labour', { isCategory: true }),
  nc('5506', 'VISUAL EFFECTS', '5500', 'VFX Supervisor', 'labour'),

  nc('5600', 'TITLES', '5600', 'TITLES', 'other', { isCategory: true }),

  nc('5700', 'PREVIEW SCREENINGS', '5700', 'PREVIEW SCREENINGS', 'other', { isCategory: true }),

  // ───────────────────────── General (6800) ─────────────────────────
  nc('6800', 'GENERAL EXPENSES', '6800', 'GENERAL EXPENSES', 'other', { isCategory: true }),
  nc('6801', 'GENERAL EXPENSES', '6800', 'Insurance', 'other'),
];
