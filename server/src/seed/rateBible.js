import { extraRateBibleEntries } from './rateBibleExtra.js';

/**
 * Global Rates Bible seed data.
 * Extracted from Kate's zillit-rates-bible-ratesData.ts (261KB, 57 agreements).
 * Key agreements with verified rates from official BECTU, DGA, SAG-AFTRA, IATSE sources.
 *
 * Extra UK BECTU department rates (Sound, Grip, Lighting, Costume, HMU, Props,
 * Construction, Locations, Post, Production Office, SFX, Set Crafts, Graphics,
 * Animation & VFX, Runners, Drivers, Riggers) are imported from rateBibleExtra.js.
 */
export const rateBibleEntries = [
  // ═══════════════════════════════════════════════════════════════════
  // UK — BECTU Camera Branch v37a
  // ═══════════════════════════════════════════════════════════════════
  {
    territoryCode: 'uk', agreementId: 'uk-cam',
    agreementName: 'PACT/BECTU Camera Branch v37a',
    union: 'BECTU', type: 'crew', status: 'confirmed', access: 'public',
    effectiveFrom: new Date('2025-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/camera-branch',
    pdfUrl: 'https://union.bectu.org.uk/asset/camera-branch-rate-card-v37a',
    holidayPayNote: 'Holiday pay NOT included — add 12.07%. LABOUR ONLY — box/kit separate.',
    rates: [
      // MMP Major Feature £30m+
      { grade: 'DOP / Cinematographer', isHeader: false, primaryRate: 'Ind. Neg.', secondaryRate: 'No MMP minimum at ANY budget', isIndividuallyNegotiated: true, budgetTier: 'MMP £30m+' },
      { grade: 'Camera Operator', primaryRate: '4,038/50hr', secondaryRate: '808/10hr', weeklyRate: 4038, dailyRate: 808, hourlyRate: 81, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Camera Operator', primaryRate: '4,845/55hr', secondaryRate: '969/11hr', weeklyRate: 4845, dailyRate: 969, hourlyRate: 81, budgetTier: 'MMP £30m+', dealType: '55hr_week' },
      { grade: 'Steadicam Operator', primaryRate: '5,048/50hr', secondaryRate: '1,010/10hr', weeklyRate: 5048, dailyRate: 1010, hourlyRate: 101, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Focus Puller / 1st AC', primaryRate: '2,826/50hr', secondaryRate: '565/10hr', weeklyRate: 2826, dailyRate: 565, hourlyRate: 57, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Focus Puller / 1st AC', primaryRate: '3,392/55hr', secondaryRate: '678/11hr', weeklyRate: 3392, dailyRate: 678, hourlyRate: 57, budgetTier: 'MMP £30m+', dealType: '55hr_week' },
      { grade: '2nd AC / Clapper Loader', primaryRate: '2,075/50hr', secondaryRate: '415/10hr', weeklyRate: 2075, dailyRate: 415, hourlyRate: 42, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: '2nd AC / Clapper Loader', primaryRate: '2,489/55hr', secondaryRate: '498/11hr', weeklyRate: 2489, dailyRate: 498, hourlyRate: 42, budgetTier: 'MMP £30m+', dealType: '55hr_week' },
      { grade: 'DIT', primaryRate: '2,826/50hr', secondaryRate: '565/10hr', weeklyRate: 2826, dailyRate: 565, hourlyRate: 57, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Camera Trainee', primaryRate: '850/50hr', secondaryRate: '170/10hr', weeklyRate: 850, dailyRate: 170, hourlyRate: 17, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film £15m-£30m (same as MMP for Camera)
      { grade: 'Camera Operator', primaryRate: '4,038/50hr', secondaryRate: '808/10hr', weeklyRate: 4038, dailyRate: 808, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film £5m-£15m
      { grade: 'Camera Operator', primaryRate: '4,071/50hr', secondaryRate: '814/10hr', weeklyRate: 4071, dailyRate: 814, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Focus Puller / 1st AC', primaryRate: '2,538/50hr', secondaryRate: '508/10hr', weeklyRate: 2538, dailyRate: 508, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film £3m-£5m
      { grade: 'Camera Operator', primaryRate: '3,392/50hr', secondaryRate: '678/10hr', weeklyRate: 3392, dailyRate: 678, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4 (£7m+/hr)
      { grade: 'Camera Operator', primaryRate: '3,364/50hr', secondaryRate: '673/10hr', weeklyRate: 3364, dailyRate: 673, budgetTier: 'TV Band 4 (£7m+/hr)', dealType: '50hr_week' },
      // TV Band 3 (£3m-£7m/hr)
      { grade: 'Camera Operator', primaryRate: '3,364/50hr', secondaryRate: '673/10hr', weeklyRate: 3364, dailyRate: 673, budgetTier: 'TV Band 3', dealType: '50hr_week' },
      // TV Band 2 (£1.25m-£3m/hr)
      { grade: 'Camera Operator', primaryRate: '3,171/50hr', secondaryRate: '634/10hr', weeklyRate: 3171, dailyRate: 634, budgetTier: 'TV Band 2', dealType: '50hr_week' },
      // TV Band 1 (<£1.25m/hr)
      { grade: 'Camera Operator', primaryRate: '2,814/50hr', secondaryRate: '563/10hr', weeklyRate: 2814, dailyRate: 563, budgetTier: 'TV Band 1', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT (Camera)', value: '2T (double time), NO grace, 15-min increments', isWarning: true },
      { key: 'OT Cap', value: '£81.82/hr max — applies to ALL Camera OT', isWarning: true },
      { key: '6th Day', value: '×1.5 all hours (min 6hrs non-shoot, 8hrs shoot)' },
      { key: '7th Day', value: '×2.0 all hours' },
      { key: 'Pre-Dawn', value: '2T rate before 05:00' },
      { key: 'Holiday Pay', value: 'NOT included — must add 12.07% to all rates', isWarning: true },
      { key: 'Turnaround', value: '11hrs wrap-to-call' },
      { key: 'Meal', value: '6hrs from call, 30min, unpaid/deducted' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // UK — BECTU ADs
  // ═══════════════════════════════════════════════════════════════════
  {
    territoryCode: 'uk', agreementId: 'uk-ads',
    agreementName: 'PACT/BECTU Assistant Directors 2024',
    union: 'BECTU', type: 'crew', status: 'confirmed', access: 'public',
    effectiveFrom: new Date('2024-03-01'),
    sourceUrl: 'https://union.bectu.org.uk/assistant-directors',
    holidayPayNote: 'Holiday pay NOT included — add 12.07%. For 55hr deals: add 10%.',
    rates: [
      { grade: '1st AD', primaryRate: '4,255/50hr (min)', secondaryRate: '5,000+ (target)', weeklyRate: 4255, dailyRate: 851, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: '2nd AD Key', primaryRate: '2,365/50hr (min)', secondaryRate: '2,800+ (target)', weeklyRate: 2365, dailyRate: 473, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: '2nd AD Crowd', primaryRate: '2,005/50hr (min)', secondaryRate: '2,335 (target)', weeklyRate: 2005, dailyRate: 401, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: '3rd AD', primaryRate: '1,300/50hr (min)', secondaryRate: '1,350 (target)', weeklyRate: 1300, dailyRate: 260, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'AD Runner', primaryRate: '650/50hr (min)', secondaryRate: '750 (target)', weeklyRate: 650, dailyRate: 130, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // TV Band 4
      { grade: '1st AD', primaryRate: '4,255/50hr (min)', weeklyRate: 4255, budgetTier: 'TV Band 4 (£8m+/hr)', dealType: '50hr_week' },
      // TV Band 1
      { grade: '1st AD', primaryRate: '1,765/50hr (min)', weeklyRate: 1765, budgetTier: 'TV Band 1', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '×1.5 non-camera, cap £81.82/hr' },
      { key: '6th/7th Day', value: '1.5T / 2T' },
      { key: 'Turnaround', value: '11hrs' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // UK — BECTU Art Department
  // ═══════════════════════════════════════════════════════════════════
  {
    territoryCode: 'uk', agreementId: 'uk-art',
    agreementName: 'PACT/BECTU Art Department 2025-2026',
    union: 'BECTU', type: 'crew', status: 'confirmed', access: 'public',
    effectiveFrom: new Date('2025-06-27'),
    sourceUrl: 'https://union.bectu.org.uk/art-department',
    holidayPayNote: 'Holiday pay INCLUDED (12.07%). NOT PACT-ratified — branch recommended.',
    rates: [
      { grade: 'Supervising Art Director', primaryRate: '713/day (min)', secondaryRate: '3,565/wk (min)', weeklyRate: 3565, dailyRate: 713, budgetTier: 'MMP £30m+' },
      { grade: 'Art Director', primaryRate: '496/day (min)', secondaryRate: '2,480/wk', weeklyRate: 2480, dailyRate: 496, budgetTier: 'MMP £30m+' },
      { grade: 'Stand-by Art Director', primaryRate: '435/day (min)', secondaryRate: '2,175/wk', weeklyRate: 2175, dailyRate: 435, budgetTier: 'MMP £30m+' },
      { grade: 'Set Decorator', primaryRate: '713/day (min)', secondaryRate: '3,565/wk', weeklyRate: 3565, dailyRate: 713, budgetTier: 'MMP £30m+' },
      { grade: 'Production Buyer', primaryRate: '521/day (min)', secondaryRate: '2,604/wk', weeklyRate: 2604, dailyRate: 521, budgetTier: 'MMP £30m+' },
      { grade: 'Graphic Designer', primaryRate: '341/day', secondaryRate: '1,705/wk', weeklyRate: 1705, dailyRate: 341, budgetTier: 'MMP £30m+' },
      { grade: 'Art Dept Trainee', primaryRate: '159/day', secondaryRate: '795/wk', weeklyRate: 795, dailyRate: 159, budgetTier: 'All tiers' },
    ],
    rules: [
      { key: 'HP', value: 'INCLUDED in published rates (12.07%)' },
      { key: 'Allowances', value: 'Phone £10/wk, Car £150/wk + fuel, Computer £25-30/wk' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // UK — Equity Cinema Films
  // ═══════════════════════════════════════════════════════════════════
  {
    territoryCode: 'uk', agreementId: 'uk-equity-film',
    agreementName: 'PACT/Equity Cinema Films Agreement',
    union: 'Equity', type: 'performers', status: 'confirmed', access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.equity.org.uk/getting-work/agreements',
    holidayPayNote: 'Holiday pay additional at 12.07%.',
    rates: [
      { grade: 'Lead Actor (£30m+ budget)', primaryRate: 'Ind. Neg.', isIndividuallyNegotiated: true, budgetTier: 'Film £30m+' },
      { grade: 'Supporting Artist', primaryRate: '167/day', secondaryRate: 'Equity Minimum', weeklyRate: 835, dailyRate: 167, budgetTier: 'Film £30m+' },
      { grade: 'Day Player', primaryRate: '501/day', weeklyRate: 2505, dailyRate: 501, budgetTier: 'Film £30m+' },
      { grade: 'Weekly Player', primaryRate: '2,447/wk', weeklyRate: 2447, budgetTier: 'Film £30m+' },
    ],
    rules: [
      { key: 'Performer OT', value: '×1.5 after 10hrs, max £94/hr' },
      { key: 'Night Work', value: '+50% after 20:00' },
      { key: 'Turnaround', value: '12hrs (reducible to 11)' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // USA — SAG-AFTRA Theatrical
  // ═══════════════════════════════════════════════════════════════════
  {
    territoryCode: 'us', agreementId: 'us-sag',
    agreementName: 'SAG-AFTRA Theatrical Agreement 07/2025-06/2026',
    union: 'SAG-AFTRA', type: 'performers', status: 'confirmed', access: 'public',
    effectiveFrom: new Date('2025-07-01'),
    sourceUrl: 'https://www.sagaftra.org/contracts-industry-resources/contracts',
    holidayPayNote: 'P&H at 21% (principals) / 20.5% (background) on ALL scale rates.',
    rates: [
      { grade: 'Day Performer', primaryRate: '$1,246/day', secondaryRate: '$4,326/week', weeklyRate: 4326, dailyRate: 1246, budgetTier: 'Theatrical (>$2M)' },
      { grade: 'Weekly Performer', primaryRate: '$4,326/week', weeklyRate: 4326, budgetTier: 'Theatrical (>$2M)' },
      { grade: 'Background Actor', primaryRate: '$224/day', dailyRate: 224, budgetTier: 'Theatrical (>$2M)' },
      { grade: 'Stunt Performer', primaryRate: '$1,246/day', dailyRate: 1246, budgetTier: 'Theatrical (>$2M)' },
      // Low Budget
      { grade: 'Day Performer (LBA)', primaryRate: '$750/day', dailyRate: 750, budgetTier: 'Low Budget (<$2M)' },
      { grade: 'Day Performer (MLB)', primaryRate: '$500/day', dailyRate: 500, budgetTier: 'Mod Low Budget (<$700k)' },
      { grade: 'Day Performer (ULA)', primaryRate: '$250/day', dailyRate: 250, budgetTier: 'Ultra Low Budget (<$300k)' },
    ],
    rules: [
      { key: 'P&H', value: '18.5% on ALL earnings including overscale — major cost item', isWarning: true },
      { key: 'OT', value: '×1.5 hrs 9-10, ×2.0 hrs 11-15, day rate per hr 16+' },
      { key: 'Turnaround', value: '12hrs studio, 10hrs location', isWarning: true },
      { key: 'Meal Penalty', value: '$25 first 30min, $35 second, $50 subsequent' },
      { key: 'Per Diem', value: '$70/day distant ($14 breakfast, $21 lunch, $35 dinner)' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // USA — DGA Basic Agreement
  // ═══════════════════════════════════════════════════════════════════
  {
    territoryCode: 'us', agreementId: 'us-dga',
    agreementName: 'DGA Basic Agreement 2025-2026',
    union: 'DGA', type: 'directors', status: 'confirmed', access: 'public',
    effectiveFrom: new Date('2025-07-01'),
    sourceUrl: 'https://www.dga.org/Contracts/Rates.aspx',
    holidayPayNote: 'Weekly guarantee structure. P&H: 8.75% pension + 11.25% health (employer) + 2.5% (employee).',
    rates: [
      // High Budget ($11M+)
      { grade: 'Director (Feature Film)', primaryRate: '$24,599/wk', secondaryRate: '10-week guarantee', weeklyRate: 24599, budgetTier: 'High Budget ($11M+)', dealType: '50hr_week' },
      { grade: 'UPM (Studio)', primaryRate: '$7,021/wk', secondaryRate: 'Studio rate', weeklyRate: 7021, budgetTier: 'High Budget ($11M+)', dealType: '50hr_week' },
      { grade: 'UPM (Location)', primaryRate: '$9,830/wk', secondaryRate: 'Location rate', weeklyRate: 9830, budgetTier: 'High Budget ($11M+)', dealType: '50hr_week' },
      { grade: '1st AD (Studio)', primaryRate: '$6,676/wk', weeklyRate: 6676, budgetTier: 'High Budget ($11M+)', dealType: '50hr_week' },
      { grade: '1st AD (Location)', primaryRate: '$9,338/wk', weeklyRate: 9338, budgetTier: 'High Budget ($11M+)', dealType: '50hr_week' },
      { grade: 'Key 2nd AD', primaryRate: '$4,473/wk', weeklyRate: 4473, budgetTier: 'High Budget ($11M+)', dealType: '50hr_week' },
      { grade: '2nd 2nd AD', primaryRate: '$4,223/wk', weeklyRate: 4223, budgetTier: 'High Budget ($11M+)', dealType: '50hr_week' },
      { grade: 'Additional 2nd AD', primaryRate: '$2,571/wk', weeklyRate: 2571, budgetTier: 'High Budget ($11M+)', dealType: '50hr_week' },
      // Level 4C ($8.5M-$11M)
      { grade: 'Director (Feature Film)', primaryRate: '$22,139/wk', weeklyRate: 22139, budgetTier: 'Level 4C ($8.5M-$11M)', dealType: '50hr_week' },
      // Level 4A ($3.75M-$5.5M)
      { grade: 'Director (Feature Film)', primaryRate: '$18,449/wk', weeklyRate: 18449, budgetTier: 'Level 4A ($3.75M-$5.5M)', dealType: '50hr_week' },
      { grade: 'UPM', primaryRate: '$4,915/wk', weeklyRate: 4915, budgetTier: 'Level 4A ($3.75M-$5.5M)', dealType: '50hr_week' },
      { grade: '1st AD', primaryRate: '$4,673/wk', weeklyRate: 4673, budgetTier: 'Level 4A ($3.75M-$5.5M)', dealType: '50hr_week' },
      // TV Per-Episode
      { grade: 'Director (TV 30min)', primaryRate: '$33,784/episode', weeklyRate: 33784, budgetTier: 'TV Network', dealType: 'per_episode' },
      { grade: 'Director (TV 60min)', primaryRate: '$57,374/episode', weeklyRate: 57374, budgetTier: 'TV Network', dealType: 'per_episode' },
      { grade: 'Director (TV 90min)', primaryRate: '$94,028/episode', weeklyRate: 94028, budgetTier: 'TV Network', dealType: 'per_episode' },
      { grade: 'Director (TV 120min)', primaryRate: '$125,371/episode', weeklyRate: 125371, budgetTier: 'TV Network', dealType: 'per_episode' },
      { grade: 'Director (Pilot)', primaryRate: '$160,645/episode', weeklyRate: 160645, budgetTier: 'TV Network Pilot', dealType: 'per_episode' },
      // Commercial
      { grade: 'Director (Commercial)', primaryRate: '$1,841/day', secondaryRate: '$7,364/wk', weeklyRate: 7364, dailyRate: 1841, budgetTier: 'Commercial', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'Weekly Guarantee', value: 'Directors have weekly guarantee — NOT daily basic' },
      { key: '6th Day', value: '150% pro-rata daily (in-town)' },
      { key: '7th Day/Holiday', value: '200% OR weekly + $4,413' },
      { key: 'Extended Day', value: '>15-16hrs = extra day pay', isWarning: true },
      { key: 'P&H', value: '8.75% pension + 11.25% health (employer) + 0.5% parental leave' },
      { key: 'Turnaround', value: '9hrs free night' },
      { key: 'Filing', value: 'Deal memo must be filed with DGA within 15 days', isWarning: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // USA — IATSE Local 600 Camera
  // ═══════════════════════════════════════════════════════════════════
  {
    territoryCode: 'us', agreementId: 'us-iatse-600',
    agreementName: 'IATSE Local 600 Camera (Studio LA)',
    union: 'IATSE', type: 'crew', status: 'confirmed', access: 'public',
    effectiveFrom: new Date('2024-07-01'),
    sourceUrl: 'https://www.iatse600.org',
    holidayPayNote: 'H&W: $26.76/hr. Pension: 6% employer. No holiday pay — uses H&W fund.',
    rates: [
      { grade: 'Director of Photography', primaryRate: 'Ind. Neg.', isIndividuallyNegotiated: true, budgetTier: 'Studio' },
      { grade: 'Camera Operator', primaryRate: '$53.96/hr', secondaryRate: '$56.12/hr (Yr3)', weeklyRate: 2158, dailyRate: 432, hourlyRate: 53.96, budgetTier: 'Studio' },
      { grade: '1st Assistant Camera', primaryRate: '$48.72/hr', weeklyRate: 1949, dailyRate: 390, hourlyRate: 48.72, budgetTier: 'Studio' },
      { grade: '2nd Assistant Camera', primaryRate: '$40.08/hr', weeklyRate: 1603, dailyRate: 321, hourlyRate: 40.08, budgetTier: 'Studio' },
      { grade: 'DIT', primaryRate: '$53.96/hr', weeklyRate: 2158, dailyRate: 432, hourlyRate: 53.96, budgetTier: 'Studio' },
      { grade: 'Still Photographer', primaryRate: '$53.96/hr', weeklyRate: 2158, dailyRate: 432, hourlyRate: 53.96, budgetTier: 'Studio' },
    ],
    rules: [
      { key: 'Basic Day', value: '8 hours' },
      { key: 'OT', value: '×1.5 hrs 9-12, ×2.0 hrs 13-14, Golden ×2.0 from hr 14', isWarning: true },
      { key: 'H&W', value: '$26.76/hr — major cost item ($1,338/50hr week)', isWarning: true },
      { key: 'Pension', value: '6% employer' },
      { key: 'Turnaround', value: '10hrs studio / 9hrs distant' },
      { key: 'Non-Deductible Meals', value: 'Clock keeps running during meals', isWarning: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // CANADA — BCCFU (BC)
  // ═══════════════════════════════════════════════════════════════════
  {
    territoryCode: 'ca', agreementId: 'ca-bc-crew',
    agreementName: 'BCCFU Master Agreement 2024-2025',
    union: 'BCCFU (IATSE 891 + Teamsters 155 + ICG 669)', type: 'crew', status: 'confirmed', access: 'public',
    effectiveFrom: new Date('2024-04-01'),
    sourceUrl: 'https://www.bccfu.com',
    holidayPayNote: '4% vacation pay on all earnings. Union dues 2% deducted by production.',
    rates: [
      { grade: 'Head Lighting Technician', primaryRate: 'C$53.24/hr (Yr2)', secondaryRate: 'C$56.12/hr (Yr3)', weeklyRate: 2130, hourlyRate: 53.24, budgetTier: 'Feature Film' },
      { grade: 'Key Grip', primaryRate: 'C$53.24/hr', weeklyRate: 2130, hourlyRate: 53.24, budgetTier: 'Feature Film' },
      { grade: 'Lighting Technician', primaryRate: 'C$44.52/hr', weeklyRate: 1781, hourlyRate: 44.52, budgetTier: 'Feature Film' },
      { grade: 'Camera Operator', primaryRate: 'C$53.24/hr', weeklyRate: 2130, hourlyRate: 53.24, budgetTier: 'Feature Film' },
      { grade: '1st AC', primaryRate: 'C$48.03/hr', weeklyRate: 1921, hourlyRate: 48.03, budgetTier: 'Feature Film' },
    ],
    rules: [
      { key: 'OT', value: '1T hrs 1-8, 1.5T hrs 9-10, 2T hrs 11+' },
      { key: '6th Day', value: '×1.5 throughout (8hr min call)' },
      { key: '7th Day', value: '×2.0 throughout (8hr min call)' },
      { key: 'Meal', value: '5hrs from call (not 6hrs)' },
      { key: 'Turnaround', value: '10hrs (BC Employment Standards)' },
      { key: 'Wage Increase', value: '+5.5% from April 2025 — multiply rates by 1.055', isWarning: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // AUSTRALIA — ACD/MEAA Camera
  // ═══════════════════════════════════════════════════════════════════
  {
    territoryCode: 'au', agreementId: 'au-acd',
    agreementName: 'ACD/MEAA/ACS Camera Dept Guild Rates',
    union: 'MEAA', type: 'crew', status: 'confirmed', access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.meaa.org',
    holidayPayNote: 'Superannuation 11.5% MANDATORY on ALL gross (rising to 12% July 2026).',
    rates: [
      { grade: 'A-Cam/Steadicam Operator', primaryRate: 'A$6,000/50hr wk', weeklyRate: 6000, budgetTier: 'Offshore Major' },
      { grade: 'Focus Puller', primaryRate: 'A$3,500/50hr wk', weeklyRate: 3500, budgetTier: 'Offshore Major' },
      { grade: '2nd AC / Clapper Loader', primaryRate: 'A$2,800/50hr wk', weeklyRate: 2800, budgetTier: 'Offshore Major' },
      { grade: 'DIT', primaryRate: 'A$3,500/50hr wk', weeklyRate: 3500, budgetTier: 'Offshore Major' },
    ],
    rules: [
      { key: 'Superannuation', value: '11.5% MANDATORY on ALL gross pay', isWarning: true },
      { key: 'OT', value: '×1.5 after 10hrs, ×2.0 after 12hrs' },
      { key: 'Turnaround', value: '10hrs minimum (BRECA Award)' },
    ],
  },

  // Extra UK BECTU departments (imported from rateBibleExtra.js)
  ...extraRateBibleEntries,
];
