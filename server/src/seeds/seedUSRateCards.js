/**
 * Seed US union rate cards for SAG-AFTRA, IATSE, WGA, Teamsters, AFM.
 * Based on publicly available 2024-2025 scale rates.
 *
 * Run: node src/seeds/seedUSRateCards.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const OID = (id) => new mongoose.Types.ObjectId(id);

// ─── Union IDs ──────────────────────────────────────────────────────────
const UNIONS = {
  SAG_AFTRA: '69ce734323c537958cba776f',
  IATSE:     '69ce734323c537958cba7770',
  WGA:       '69ce734323c537958cba7771',
  TEAMSTERS: '69ce734323c537958cba7772',
  AFM:       '69ce734323c537958cba7773',
};

// ─── US Budget Tiers ────────────────────────────────────────────────────
const TIERS = {
  HIGH:        '69ce734423c537958cba78dd',
  LVL4C:       '69ce734423c537958cba78de',
  LVL4B:       '69ce734423c537958cba78df',
  LVL4A:       '69ce734423c537958cba78e0',
  LVL3:        '69ce734423c537958cba78e1',
  LVL2:        '69ce734423c537958cba78e2',
  LVL1B:       '69ce734423c537958cba78e3',
  LVL1A:       '69ce734423c537958cba78e4',
  TV_NETWORK:  '69ce734423c537958cba78e5',
  TV_CABLE_HI: '69ce734423c537958cba78e6',
  TV_CABLE_MID:'69ce734423c537958cba78e7',
  TV_CABLE_LO: '69ce734423c537958cba78e8',
  TV_PILOT:    '69ce734423c537958cba78e9',
  COMMERCIAL:  '69ce734423c537958cba78ea',
};

// Tier multipliers (HIGH = 1.0, lower tiers scale down)
const TIER_MULT = {
  HIGH: 1.0, LVL4C: 0.95, LVL4B: 0.90, LVL4A: 0.85,
  LVL3: 0.78, LVL2: 0.70, LVL1B: 0.62, LVL1A: 0.55,
  TV_NETWORK: 1.0, TV_CABLE_HI: 0.92, TV_CABLE_MID: 0.82,
  TV_CABLE_LO: 0.72, TV_PILOT: 1.05, COMMERCIAL: 1.10,
};

const r2 = (n) => Math.round(n * 100) / 100;
const effectiveFrom = new Date('2024-07-01');

function makeCard(unionId, deptId, desigId, tierId, tierKey, weeklyBase, opts = {}) {
  const mult = TIER_MULT[tierKey] || 1.0;
  const weekly = r2(weeklyBase * mult);
  const daily = opts.dailyOverride ? r2(opts.dailyOverride * mult) : r2(weekly / 5);
  const hourly = opts.hourlyOverride ? r2(opts.hourlyOverride * mult) : r2(daily / (opts.hoursPerDay || 10));
  const dealType = opts.dealType || '50hr_week';
  const hoursPerWeek = opts.hoursPerWeek || 50;
  const hoursPerDay = opts.hoursPerDay || 10;

  return {
    unionId: OID(unionId),
    departmentId: OID(deptId),
    designationId: OID(desigId),
    budgetTierId: OID(tierId),
    dealType,
    guaranteedHoursPerWeek: hoursPerWeek,
    guaranteedHoursPerDay: hoursPerDay,
    effectiveFrom,
    effectiveTo: null,
    weeklyRate: weekly,
    dailyRate: daily,
    hourlyRate: hourly,
    overtimeRate1x5: r2(hourly * 1.5),
    overtimeRate2x: r2(hourly * 2),
    sixthDayRate: r2(daily * 1.5),
    seventhDayRate: r2(daily * 2),
    nightPremiumPct: opts.nightPremiumPct ?? 10,
    episodeLength: opts.episodeLength || null,
    prepDays: opts.prepDays || null,
    shootDays: opts.shootDays || null,
    overageRate: opts.overageRate ? r2(opts.overageRate * mult) : null,
    studioRate: opts.studioRate ? r2(opts.studioRate * mult) : null,
    locationRate: opts.locationRate ? r2(opts.locationRate * mult) : null,
    holidayPayInclusive: false,
    isVerified: false,
    sourceUrl: opts.sourceUrl || 'https://www.unionscale.com',
    sourceDocument: opts.sourceDocument || 'US Union Scale Rates 2024-2025',
    notes: opts.notes || null,
    isActive: true,
  };
}

// Helper: generate cards for all tiers
function forAllTiers(unionId, deptId, desigId, weeklyBase, opts = {}) {
  const tierSubset = opts.tiers || Object.keys(TIERS);
  return tierSubset.map(tk => makeCard(unionId, deptId, desigId, TIERS[tk], tk, weeklyBase, opts));
}

// Film tiers
const FILM_TIERS = ['HIGH','LVL4C','LVL4B','LVL4A','LVL3','LVL2','LVL1B','LVL1A'];
const TV_TIERS = ['TV_NETWORK','TV_CABLE_HI','TV_CABLE_MID','TV_CABLE_LO','TV_PILOT'];
const ALL_TIERS = [...FILM_TIERS, ...TV_TIERS, 'COMMERCIAL'];

// ═════════════════════════════════════════════════════════════════════════
// SAG-AFTRA Rate Cards
// Source: SAG-AFTRA Theatrical & Television Agreements 2024-2026
// ═════════════════════════════════════════════════════════════════════════
function buildSAGCards() {
  const u = UNIONS.SAG_AFTRA;
  const cards = [];
  const src = { sourceUrl: 'https://www.sagaftra.org/contracts-industry-resources/contracts', sourceDocument: 'SAG-AFTRA Theatrical/TV Agreement 2024-2026' };

  // PRINCIPAL (dept 7798)
  const D_PRINC = '69ce734323c537958cba7798';
  // Lead: $12,433/wk (series regular scale)
  cards.push(...forAllTiers(u, D_PRINC, '69ce734323c537958cba7859', 12433, { ...src, tiers: ALL_TIERS }));
  // Supporting: $7,750/wk
  cards.push(...forAllTiers(u, D_PRINC, '69ce734323c537958cba785a', 7750, { ...src, tiers: ALL_TIERS }));
  // Day Player: daily rate $1,370/day → weekly $6,850
  cards.push(...forAllTiers(u, D_PRINC, '69ce734323c537958cba785b', 6850, { dailyOverride: 1370, dealType: 'daily', ...src, tiers: ALL_TIERS }));
  // Weekly Player: $4,756/wk
  cards.push(...forAllTiers(u, D_PRINC, '69ce734323c537958cba785c', 4756, { ...src, tiers: ALL_TIERS }));
  // Stunt Coordinator: $7,206/wk
  cards.push(...forAllTiers(u, D_PRINC, '69ce734323c537958cba785d', 7206, { ...src, tiers: ALL_TIERS }));
  // Stunt Performer: $1,370/day → $6,850/wk
  cards.push(...forAllTiers(u, D_PRINC, '69ce734323c537958cba785e', 6850, { dailyOverride: 1370, ...src, tiers: ALL_TIERS }));

  // BACKGROUND (dept 7799)
  const D_BG = '69ce734323c537958cba7799';
  // BG Actor: $218/day → $1,090/wk
  cards.push(...forAllTiers(u, D_BG, '69ce734323c537958cba785f', 1090, { dailyOverride: 218, dealType: 'daily', hoursPerDay: 8, ...src, tiers: ALL_TIERS }));
  // Stand-In: $236/day → $1,180/wk
  cards.push(...forAllTiers(u, D_BG, '69ce734323c537958cba7860', 1180, { dailyOverride: 236, dealType: 'daily', hoursPerDay: 8, ...src, tiers: ALL_TIERS }));
  // Photo Double: $236/day → $1,180/wk
  cards.push(...forAllTiers(u, D_BG, '69ce734323c537958cba7861', 1180, { dailyOverride: 236, dealType: 'daily', hoursPerDay: 8, ...src, tiers: ALL_TIERS }));
  // Utility Stunts: $1,370/day → $6,850/wk
  cards.push(...forAllTiers(u, D_BG, '69ce734323c537958cba7862', 6850, { dailyOverride: 1370, ...src, tiers: ALL_TIERS }));

  // STUNT (dept 779a)
  const D_STUNT = '69ce734323c537958cba779a';
  cards.push(...forAllTiers(u, D_STUNT, '69ce734323c537958cba7863', 7206, { ...src, tiers: ALL_TIERS })); // Coordinator
  cards.push(...forAllTiers(u, D_STUNT, '69ce734323c537958cba7864', 6850, { dailyOverride: 1370, ...src, tiers: ALL_TIERS })); // Performer
  cards.push(...forAllTiers(u, D_STUNT, '69ce734323c537958cba7865', 6850, { dailyOverride: 1370, ...src, tiers: ALL_TIERS })); // Double
  cards.push(...forAllTiers(u, D_STUNT, '69ce734323c537958cba7866', 5500, { ...src, tiers: ALL_TIERS })); // Rigger

  // VOICE (dept 779b)
  const D_VOICE = '69ce734323c537958cba779b';
  cards.push(...forAllTiers(u, D_VOICE, '69ce734323c537958cba7867', 5500, { dealType: 'session', ...src, tiers: ALL_TIERS })); // VO Artist
  cards.push(...forAllTiers(u, D_VOICE, '69ce734323c537958cba7868', 4200, { dealType: 'session', ...src, tiers: ALL_TIERS })); // ADR
  cards.push(...forAllTiers(u, D_VOICE, '69ce734323c537958cba7869', 5800, { dealType: 'session', ...src, tiers: ALL_TIERS })); // Narrator

  // DANCE (dept 779c)
  const D_DANCE = '69ce734323c537958cba779c';
  cards.push(...forAllTiers(u, D_DANCE, '69ce734323c537958cba786a', 7800, { ...src, tiers: ALL_TIERS })); // Choreographer
  cards.push(...forAllTiers(u, D_DANCE, '69ce734323c537958cba786b', 4756, { dailyOverride: 1370, ...src, tiers: ALL_TIERS })); // Dancer
  cards.push(...forAllTiers(u, D_DANCE, '69ce734323c537958cba786c', 5200, { ...src, tiers: ALL_TIERS })); // Singer Solo
  cards.push(...forAllTiers(u, D_DANCE, '69ce734323c537958cba786d', 3800, { ...src, tiers: ALL_TIERS })); // Singer Group

  return cards;
}

// ═════════════════════════════════════════════════════════════════════════
// IATSE Rate Cards
// Source: IATSE Basic Agreement & Area Standards Agreement 2024-2027
// ═════════════════════════════════════════════════════════════════════════
function buildIATSECards() {
  const u = UNIONS.IATSE;
  const cards = [];
  const src = { sourceUrl: 'https://www.iatse.net/basic-agreement', sourceDocument: 'IATSE Basic Agreement 2024-2027' };

  // CAM - Local 600 (dept 779d)
  const D_CAM = '69ce734323c537958cba779d';
  cards.push(...forAllTiers(u, D_CAM, '69ce734323c537958cba786e', 5200, { ...src, tiers: ALL_TIERS })); // DP
  cards.push(...forAllTiers(u, D_CAM, '69ce734323c537958cba786f', 3800, { ...src, tiers: ALL_TIERS })); // Cam Op
  cards.push(...forAllTiers(u, D_CAM, '69ce734323c537958cba7870', 3200, { ...src, tiers: ALL_TIERS })); // 1AC
  cards.push(...forAllTiers(u, D_CAM, '69ce734323c537958cba7871', 2600, { ...src, tiers: ALL_TIERS })); // 2AC
  cards.push(...forAllTiers(u, D_CAM, '69ce734323c537958cba7872', 3400, { ...src, tiers: ALL_TIERS })); // DIT
  cards.push(...forAllTiers(u, D_CAM, '69ce734323c537958cba7873', 2800, { ...src, tiers: ALL_TIERS })); // Still
  cards.push(...forAllTiers(u, D_CAM, '69ce734323c537958cba7874', 4200, { ...src, tiers: ALL_TIERS })); // Steadicam

  // GRP - Local 80 (dept 779e)
  const D_GRP = '69ce734323c537958cba779e';
  cards.push(...forAllTiers(u, D_GRP, '69ce734323c537958cba7875', 3600, { ...src, tiers: ALL_TIERS })); // Key Grip
  cards.push(...forAllTiers(u, D_GRP, '69ce734323c537958cba7876', 3000, { ...src, tiers: ALL_TIERS })); // BB Grip
  cards.push(...forAllTiers(u, D_GRP, '69ce734323c537958cba7877', 2800, { ...src, tiers: ALL_TIERS })); // Dolly Grip
  cards.push(...forAllTiers(u, D_GRP, '69ce734323c537958cba7878', 2400, { ...src, tiers: ALL_TIERS })); // Grip
  cards.push(...forAllTiers(u, D_GRP, '69ce734323c537958cba7879', 2400, { ...src, tiers: ALL_TIERS })); // Rigging Grip

  // ELC - Local 728 (dept 779f)
  const D_ELC = '69ce734323c537958cba779f';
  cards.push(...forAllTiers(u, D_ELC, '69ce734323c537958cba787a', 3800, { ...src, tiers: ALL_TIERS })); // Gaffer
  cards.push(...forAllTiers(u, D_ELC, '69ce734323c537958cba787b', 3200, { ...src, tiers: ALL_TIERS })); // BB Electric
  cards.push(...forAllTiers(u, D_ELC, '69ce734323c537958cba787c', 2400, { ...src, tiers: ALL_TIERS })); // Electrician
  cards.push(...forAllTiers(u, D_ELC, '69ce734323c537958cba787d', 3400, { ...src, tiers: ALL_TIERS })); // Rigging Gaffer
  cards.push(...forAllTiers(u, D_ELC, '69ce734323c537958cba787e', 2400, { ...src, tiers: ALL_TIERS })); // Rigging Elec

  // ART - Local 800 (dept 77a0)
  const D_ART = '69ce734323c537958cba77a0';
  cards.push(...forAllTiers(u, D_ART, '69ce734323c537958cba787f', 5500, { ...src, tiers: ALL_TIERS })); // Prod Designer
  cards.push(...forAllTiers(u, D_ART, '69ce734323c537958cba7880', 4200, { ...src, tiers: ALL_TIERS })); // Sup Art Dir
  cards.push(...forAllTiers(u, D_ART, '69ce734323c537958cba7881', 3800, { ...src, tiers: ALL_TIERS })); // Art Director
  cards.push(...forAllTiers(u, D_ART, '69ce734323c537958cba7882', 3000, { ...src, tiers: ALL_TIERS })); // Asst Art Dir
  cards.push(...forAllTiers(u, D_ART, '69ce734323c537958cba7883', 3200, { ...src, tiers: ALL_TIERS })); // Illustrator
  cards.push(...forAllTiers(u, D_ART, '69ce734323c537958cba7884', 2800, { ...src, tiers: ALL_TIERS })); // Graphic Art
  cards.push(...forAllTiers(u, D_ART, '69ce734323c537958cba7885', 2800, { ...src, tiers: ALL_TIERS })); // Model Maker
  cards.push(...forAllTiers(u, D_ART, '69ce734323c537958cba7886', 2200, { ...src, tiers: ALL_TIERS })); // Art Coord

  // COS - Local 705 (dept 77a1)
  const D_COS = '69ce734323c537958cba77a1';
  cards.push(...forAllTiers(u, D_COS, '69ce734323c537958cba7887', 4500, { ...src, tiers: ALL_TIERS })); // Costume Designer
  cards.push(...forAllTiers(u, D_COS, '69ce734323c537958cba7888', 3200, { ...src, tiers: ALL_TIERS })); // Costume Sup
  cards.push(...forAllTiers(u, D_COS, '69ce734323c537958cba7889', 2800, { ...src, tiers: ALL_TIERS })); // Asst Costume
  cards.push(...forAllTiers(u, D_COS, '69ce734323c537958cba788a', 2600, { ...src, tiers: ALL_TIERS })); // Key Costumer
  cards.push(...forAllTiers(u, D_COS, '69ce734323c537958cba788b', 2200, { ...src, tiers: ALL_TIERS })); // Costumer
  cards.push(...forAllTiers(u, D_COS, '69ce734323c537958cba788c', 2000, { ...src, tiers: ALL_TIERS })); // Costume Coord

  // HMU - Local 706 (dept 77a2)
  const D_HMU = '69ce734323c537958cba77a2';
  cards.push(...forAllTiers(u, D_HMU, '69ce734323c537958cba788d', 3800, { ...src, tiers: ALL_TIERS })); // HOD Makeup
  cards.push(...forAllTiers(u, D_HMU, '69ce734323c537958cba788e', 3800, { ...src, tiers: ALL_TIERS })); // HOD Hair
  cards.push(...forAllTiers(u, D_HMU, '69ce734323c537958cba788f', 3000, { ...src, tiers: ALL_TIERS })); // Key Makeup
  cards.push(...forAllTiers(u, D_HMU, '69ce734323c537958cba7890', 3000, { ...src, tiers: ALL_TIERS })); // Key Hair
  cards.push(...forAllTiers(u, D_HMU, '69ce734323c537958cba7891', 2600, { ...src, tiers: ALL_TIERS })); // Makeup Artist
  cards.push(...forAllTiers(u, D_HMU, '69ce734323c537958cba7892', 2600, { ...src, tiers: ALL_TIERS })); // Hairstylist
  cards.push(...forAllTiers(u, D_HMU, '69ce734323c537958cba7893', 3400, { ...src, tiers: ALL_TIERS })); // SPFX Makeup

  // SND - Local 695 (dept 77a3)
  const D_SND = '69ce734323c537958cba77a3';
  cards.push(...forAllTiers(u, D_SND, '69ce734323c537958cba7894', 3800, { ...src, tiers: ALL_TIERS })); // Prod Sound Mixer
  cards.push(...forAllTiers(u, D_SND, '69ce734323c537958cba7895', 2600, { ...src, tiers: ALL_TIERS })); // Boom Op
  cards.push(...forAllTiers(u, D_SND, '69ce734323c537958cba7896', 2200, { ...src, tiers: ALL_TIERS })); // Sound Util
  cards.push(...forAllTiers(u, D_SND, '69ce734323c537958cba7897', 2400, { ...src, tiers: ALL_TIERS })); // Video Assist
  cards.push(...forAllTiers(u, D_SND, '69ce734323c537958cba7898', 2400, { ...src, tiers: ALL_TIERS })); // Playback

  // EDIT - Local 700 (dept 77a4)
  const D_EDIT = '69ce734323c537958cba77a4';
  cards.push(...forAllTiers(u, D_EDIT, '69ce734323c537958cba7899', 4200, { ...src, tiers: ALL_TIERS })); // Editor
  cards.push(...forAllTiers(u, D_EDIT, '69ce734323c537958cba789a', 2800, { ...src, tiers: ALL_TIERS })); // Asst Editor
  cards.push(...forAllTiers(u, D_EDIT, '69ce734323c537958cba789b', 2000, { ...src, tiers: ALL_TIERS })); // Apprentice
  cards.push(...forAllTiers(u, D_EDIT, '69ce734323c537958cba789c', 3800, { ...src, tiers: ALL_TIERS })); // Sound Editor
  cards.push(...forAllTiers(u, D_EDIT, '69ce734323c537958cba789d', 3400, { ...src, tiers: ALL_TIERS })); // Music Editor
  cards.push(...forAllTiers(u, D_EDIT, '69ce734323c537958cba789e', 3600, { ...src, tiers: ALL_TIERS })); // Post Sup
  cards.push(...forAllTiers(u, D_EDIT, '69ce734323c537958cba789f', 2400, { ...src, tiers: ALL_TIERS })); // Post Coord

  // PRP - Local 44 (dept 77a5)
  const D_PRP = '69ce734323c537958cba77a5';
  cards.push(...forAllTiers(u, D_PRP, '69ce734323c537958cba78a0', 3400, { ...src, tiers: ALL_TIERS })); // Prop Master
  cards.push(...forAllTiers(u, D_PRP, '69ce734323c537958cba78a1', 2600, { ...src, tiers: ALL_TIERS })); // Asst Prop
  cards.push(...forAllTiers(u, D_PRP, '69ce734323c537958cba78a2', 2400, { ...src, tiers: ALL_TIERS })); // Buyer
  cards.push(...forAllTiers(u, D_PRP, '69ce734323c537958cba78a3', 2200, { ...src, tiers: ALL_TIERS })); // Props Person
  cards.push(...forAllTiers(u, D_PRP, '69ce734323c537958cba78a4', 2400, { ...src, tiers: ALL_TIERS })); // Props Maker

  // SETDEC - Local 44 (dept 77a6)
  const D_SETDEC = '69ce734323c537958cba77a6';
  cards.push(...forAllTiers(u, D_SETDEC, '69ce734323c537958cba78a5', 4000, { ...src, tiers: ALL_TIERS })); // Set Decorator
  cards.push(...forAllTiers(u, D_SETDEC, '69ce734323c537958cba78a6', 2800, { ...src, tiers: ALL_TIERS })); // Lead Person
  cards.push(...forAllTiers(u, D_SETDEC, '69ce734323c537958cba78a7', 2200, { ...src, tiers: ALL_TIERS })); // Set Dresser
  cards.push(...forAllTiers(u, D_SETDEC, '69ce734323c537958cba78a8', 2400, { ...src, tiers: ALL_TIERS })); // On-Set Dresser
  cards.push(...forAllTiers(u, D_SETDEC, '69ce734323c537958cba78a9', 2400, { ...src, tiers: ALL_TIERS })); // Buyer
  cards.push(...forAllTiers(u, D_SETDEC, '69ce734323c537958cba78aa', 2000, { ...src, tiers: ALL_TIERS })); // Coord

  // SCRP - Local 871 (dept 77a7)
  const D_SCRP = '69ce734323c537958cba77a7';
  cards.push(...forAllTiers(u, D_SCRP, '69ce734323c537958cba78ab', 3400, { ...src, tiers: ALL_TIERS })); // Script Sup
  cards.push(...forAllTiers(u, D_SCRP, '69ce734323c537958cba78ac', 2800, { ...src, tiers: ALL_TIERS })); // Prod Coord
  cards.push(...forAllTiers(u, D_SCRP, '69ce734323c537958cba78ad', 2200, { ...src, tiers: ALL_TIERS })); // Asst Prod Coord

  // PROD - Local 161 (dept 77a8)
  const D_PROD = '69ce734323c537958cba77a8';
  cards.push(...forAllTiers(u, D_PROD, '69ce734323c537958cba78ae', 2800, { ...src, tiers: ALL_TIERS })); // POC
  cards.push(...forAllTiers(u, D_PROD, '69ce734323c537958cba78af', 2200, { ...src, tiers: ALL_TIERS })); // APOC
  cards.push(...forAllTiers(u, D_PROD, '69ce734323c537958cba78b0', 1800, { ...src, tiers: ALL_TIERS })); // Prod Sec
  cards.push(...forAllTiers(u, D_PROD, '69ce734323c537958cba78b1', 4000, { ...src, tiers: ALL_TIERS })); // Prod Accountant
  cards.push(...forAllTiers(u, D_PROD, '69ce734323c537958cba78b2', 2800, { ...src, tiers: ALL_TIERS })); // 1st Asst Acc
  cards.push(...forAllTiers(u, D_PROD, '69ce734323c537958cba78b3', 2200, { ...src, tiers: ALL_TIERS })); // 2nd Asst Acc
  cards.push(...forAllTiers(u, D_PROD, '69ce734323c537958cba78b4', 3200, { ...src, tiers: ALL_TIERS })); // Payroll Acc

  return cards;
}

// ═════════════════════════════════════════════════════════════════════════
// WGA Rate Cards
// Source: WGA Theatrical & Television MBA 2023-2026
// ═════════════════════════════════════════════════════════════════════════
function buildWGACards() {
  const u = UNIONS.WGA;
  const cards = [];
  const src = { sourceUrl: 'https://www.wga.org/contracts/contracts/mba', sourceDocument: 'WGA MBA 2023-2026' };

  // SCRN (dept 77a9) - Screenwriters
  const D_SCRN = '69ce734323c537958cba77a9';
  // Original screenplay high budget: $106,563 → weekly ~$8,880 (12wk engagement)
  cards.push(...forAllTiers(u, D_SCRN, '69ce734323c537958cba78b5', 8880, { dealType: 'per_film', ...src, tiers: FILM_TIERS }));
  // Adaptation/Rewrite: $56,338 → weekly ~$7,042 (8wk)
  cards.push(...forAllTiers(u, D_SCRN, '69ce734323c537958cba78b6', 7042, { dealType: 'per_film', ...src, tiers: FILM_TIERS }));

  // TVW (dept 77aa) - TV Writers
  const D_TVW = '69ce734323c537958cba77aa';
  cards.push(...forAllTiers(u, D_TVW, '69ce734323c537958cba78b7', 6942, { ...src, tiers: TV_TIERS }));   // Staff Writer
  cards.push(...forAllTiers(u, D_TVW, '69ce734323c537958cba78b8', 8500, { ...src, tiers: TV_TIERS }));   // Story Editor
  cards.push(...forAllTiers(u, D_TVW, '69ce734323c537958cba78b9', 10500, { ...src, tiers: TV_TIERS }));  // Exec Story Ed
  cards.push(...forAllTiers(u, D_TVW, '69ce734323c537958cba78ba', 12000, { ...src, tiers: TV_TIERS }));  // Co-Producer
  cards.push(...forAllTiers(u, D_TVW, '69ce734323c537958cba78bb', 15000, { ...src, tiers: TV_TIERS }));  // Sup Producer
  cards.push(...forAllTiers(u, D_TVW, '69ce734323c537958cba78bc', 18000, { ...src, tiers: TV_TIERS }));  // Showrunner

  return cards;
}

// ═════════════════════════════════════════════════════════════════════════
// Teamsters Rate Cards
// Source: Teamsters Local 399 Agreement 2024-2027
// ═════════════════════════════════════════════════════════════════════════
function buildTeamstersCards() {
  const u = UNIONS.TEAMSTERS;
  const cards = [];
  const src = { sourceUrl: 'https://www.ht399.org/contracts', sourceDocument: 'Teamsters Local 399 Agreement 2024-2027' };

  // TRANS (dept 77ab)
  const D_TRANS = '69ce734323c537958cba77ab';
  cards.push(...forAllTiers(u, D_TRANS, '69ce734323c537958cba78bd', 3200, { ...src, tiers: ALL_TIERS })); // Trans Coord
  cards.push(...forAllTiers(u, D_TRANS, '69ce734323c537958cba78be', 2800, { ...src, tiers: ALL_TIERS })); // Trans Captain
  cards.push(...forAllTiers(u, D_TRANS, '69ce734323c537958cba78bf', 2400, { ...src, tiers: ALL_TIERS })); // Driver

  // CAST (dept 77ac) & LOC (dept 77ad) - check if designations exist
  // Casting handled via SAG-AFTRA contracts usually, Location via Teamsters in some areas

  return cards;
}

// ═════════════════════════════════════════════════════════════════════════
// AFM Rate Cards
// Source: AFM Film/TV Agreement 2024-2027
// ═════════════════════════════════════════════════════════════════════════
async function getDesignations(deptId) {
  return await mongoose.connection.db.collection('designations')
    .find({ departmentId: new mongoose.Types.ObjectId(deptId) }).toArray();
}

// ═════════════════════════════════════════════════════════════════════════
// AFM Rate Cards (async — needs designation lookup from DB)
// ═════════════════════════════════════════════════════════════════════════
async function buildAFMCardsAsync() {
  const u = UNIONS.AFM;
  const cards = [];
  const src = { sourceUrl: 'https://www.afm.org/contracts', sourceDocument: 'AFM Film Musicians Secondary Markets Fund Agreement 2024-2027' };

  // SESS (dept 77ae)
  const sessDesigs = await getDesignations('69ce734323c537958cba77ae');
  const sessRates = {
    'CONDUCTOR': 4500, 'CONTRACTOR': 3800, 'ORCH_LEAD': 3200,
    'SIDELINE': 2650, 'SYNTH': 3000, 'COPYIST': 2400,
  };
  for (const d of sessDesigs) {
    const code = d.code || d.name || '';
    const weekly = Object.entries(sessRates).find(([k]) => code.toUpperCase().includes(k))?.[1] || 2650;
    cards.push(...forAllTiers(u, '69ce734323c537958cba77ae', d._id.toString(), weekly,
      { dealType: 'session', ...src, tiers: ALL_TIERS }));
  }

  // ORCH (dept 77af)
  const orchDesigs = await getDesignations('69ce734323c537958cba77af');
  const orchRates = {
    'CONDUCTOR': 5000, 'CONCERTMASTER': 4200, 'ORCHESTRATOR': 4500,
    'ARRANGER': 4200, 'PRINCIPAL': 3200, 'SECTION': 2800,
  };
  for (const d of orchDesigs) {
    const code = d.code || d.name || '';
    const weekly = Object.entries(orchRates).find(([k]) => code.toUpperCase().includes(k))?.[1] || 2800;
    cards.push(...forAllTiers(u, '69ce734323c537958cba77af', d._id.toString(), weekly,
      { dealType: 'session', ...src, tiers: ALL_TIERS }));
  }

  return cards;
}

// ═════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Check existing counts
  for (const [name, id] of Object.entries(UNIONS)) {
    const count = await mongoose.connection.db.collection('ratecards')
      .countDocuments({ unionId: OID(id) });
    console.log(`${name}: ${count} existing rate cards`);
  }

  // Build all cards
  const sagCards = buildSAGCards();
  const iatseCards = buildIATSECards();
  const wgaCards = buildWGACards();
  const teamstersCards = buildTeamstersCards();
  const afmCards = await buildAFMCardsAsync();

  const allCards = [...sagCards, ...iatseCards, ...wgaCards, ...teamstersCards, ...afmCards];
  console.log(`\nTotal cards to seed: ${allCards.length}`);
  console.log(`  SAG-AFTRA: ${sagCards.length}`);
  console.log(`  IATSE:     ${iatseCards.length}`);
  console.log(`  WGA:       ${wgaCards.length}`);
  console.log(`  Teamsters: ${teamstersCards.length}`);
  console.log(`  AFM:       ${afmCards.length}`);

  // Delete existing US union rate cards (idempotent)
  const usUnionIds = Object.values(UNIONS).map(OID);
  const deleted = await mongoose.connection.db.collection('ratecards')
    .deleteMany({ unionId: { $in: usUnionIds } });
  console.log(`\nDeleted ${deleted.deletedCount} existing US rate cards`);

  // Insert
  if (allCards.length > 0) {
    const result = await mongoose.connection.db.collection('ratecards')
      .insertMany(allCards);
    console.log(`Inserted ${result.insertedCount} rate cards`);
  }

  // Verify
  for (const [name, id] of Object.entries(UNIONS)) {
    const count = await mongoose.connection.db.collection('ratecards')
      .countDocuments({ unionId: OID(id) });
    console.log(`${name}: ${count} rate cards (after seed)`);
  }

  await mongoose.disconnect();
  console.log('\nDone!');
}

main().catch((e) => { console.error(e); process.exit(1); });
