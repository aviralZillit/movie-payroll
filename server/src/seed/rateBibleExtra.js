/**
 * Extra UK BECTU department rates for the Global Rates Bible.
 * Covers 17 departments not included in the initial seed:
 *   Sound, Grip, Lighting, Costume, Hair/Makeup/Prosthetics, Props,
 *   Construction, Locations, Post Production, Production Office,
 *   Special Effects, Set Crafts, Graphics, Animation & VFX,
 *   Runners, Unit Drivers, Riggers (Electrical).
 *
 * Rates are based on BECTU/PACT published minimums for 2024-2025.
 * Holiday pay is NOT included unless noted -- add 12.07%.
 * All weekly rates are for 50hr (5x10hr) deals unless stated.
 */
export const extraRateBibleEntries = [
  // ===============================================================
  // 1. UK -- BECTU Sound Department
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-sound',
    agreementName: 'PACT/BECTU Sound Department 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/sound-branch',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%. Kit/equipment hire separate.',
    rates: [
      // MMP 30m+
      { grade: 'Production Sound Mixer', weeklyRate: 3850, dailyRate: 770, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Boom Operator', weeklyRate: 2650, dailyRate: 530, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Sound Assistant / Utility', weeklyRate: 1750, dailyRate: 350, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Playback Operator', weeklyRate: 2400, dailyRate: 480, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Production Sound Mixer', weeklyRate: 3650, dailyRate: 730, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Boom Operator', weeklyRate: 2500, dailyRate: 500, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Sound Assistant / Utility', weeklyRate: 1650, dailyRate: 330, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Production Sound Mixer', weeklyRate: 3250, dailyRate: 650, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Boom Operator', weeklyRate: 2250, dailyRate: 450, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Sound Assistant / Utility', weeklyRate: 1500, dailyRate: 300, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Production Sound Mixer', weeklyRate: 2750, dailyRate: 550, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      { grade: 'Boom Operator', weeklyRate: 1900, dailyRate: 380, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Production Sound Mixer', weeklyRate: 3200, dailyRate: 640, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      { grade: 'Boom Operator', weeklyRate: 2200, dailyRate: 440, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Production Sound Mixer', weeklyRate: 2850, dailyRate: 570, budgetTier: 'TV Band 3', dealType: '50hr_week' },
      { grade: 'Boom Operator', weeklyRate: 1950, dailyRate: 390, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '2T (double time), NO grace, 15-min increments', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours (min 6hrs non-shoot, 8hrs shoot)' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07% to all rates', isWarning: true },
      { key: 'Kit Hire', value: 'Sound kit charged separately -- typically £350-£600/wk' },
      { key: 'Turnaround', value: '11hrs wrap-to-call' },
    ],
  },

  // ===============================================================
  // 2. UK -- BECTU Grip Department
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-grip',
    agreementName: 'PACT/BECTU Grip Department 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/grips',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%. Equipment hire separate.',
    rates: [
      // MMP 30m+
      { grade: 'Key Grip', weeklyRate: 3500, dailyRate: 700, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Best Boy Grip', weeklyRate: 2650, dailyRate: 530, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Dolly Grip', weeklyRate: 2650, dailyRate: 530, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Grip', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Crane Grip / Technocrane Tech', weeklyRate: 2900, dailyRate: 580, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Grip Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Key Grip', weeklyRate: 3300, dailyRate: 660, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Best Boy Grip', weeklyRate: 2500, dailyRate: 500, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Grip', weeklyRate: 2050, dailyRate: 410, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Key Grip', weeklyRate: 2900, dailyRate: 580, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Grip', weeklyRate: 1850, dailyRate: 370, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Key Grip', weeklyRate: 2500, dailyRate: 500, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      { grade: 'Grip', weeklyRate: 1650, dailyRate: 330, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Key Grip', weeklyRate: 2850, dailyRate: 570, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Key Grip', weeklyRate: 2500, dailyRate: 500, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '2T (double time), NO grace, 15-min increments', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Turnaround', value: '11hrs wrap-to-call' },
      { key: 'Equipment', value: 'Grip kit/equipment charged separately' },
    ],
  },

  // ===============================================================
  // 3. UK -- BECTU Lighting (Sparks/Electricians)
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-lighting',
    agreementName: 'PACT/BECTU Lighting (Sparks) 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/lighting',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%.',
    rates: [
      // MMP 30m+
      { grade: 'Gaffer / Chief Lighting Technician', weeklyRate: 3650, dailyRate: 730, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Best Boy (Electrician)', weeklyRate: 2750, dailyRate: 550, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Desk Operator / Console Programmer', weeklyRate: 2750, dailyRate: 550, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Electrician / Spark', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Genny Operator', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Practical Electrician', weeklyRate: 2400, dailyRate: 480, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Lighting Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Gaffer / Chief Lighting Technician', weeklyRate: 3450, dailyRate: 690, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Best Boy (Electrician)', weeklyRate: 2600, dailyRate: 520, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Electrician / Spark', weeklyRate: 2050, dailyRate: 410, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Gaffer / Chief Lighting Technician', weeklyRate: 3050, dailyRate: 610, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Best Boy (Electrician)', weeklyRate: 2300, dailyRate: 460, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Electrician / Spark', weeklyRate: 1850, dailyRate: 370, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Gaffer / Chief Lighting Technician', weeklyRate: 2600, dailyRate: 520, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      { grade: 'Electrician / Spark', weeklyRate: 1650, dailyRate: 330, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Gaffer / Chief Lighting Technician', weeklyRate: 3000, dailyRate: 600, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      { grade: 'Electrician / Spark', weeklyRate: 1800, dailyRate: 360, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Gaffer / Chief Lighting Technician', weeklyRate: 2650, dailyRate: 530, budgetTier: 'TV Band 3', dealType: '50hr_week' },
      { grade: 'Electrician / Spark', weeklyRate: 1650, dailyRate: 330, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '2T (double time), NO grace, 15-min increments', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours (min 6hrs non-shoot, 8hrs shoot)' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Turnaround', value: '11hrs wrap-to-call' },
      { key: 'NICEIC', value: 'Practical electricians must hold NICEIC/ECS certification' },
    ],
  },

  // ===============================================================
  // 4. UK -- BECTU Costume Department
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-costume',
    agreementName: 'PACT/BECTU Costume Department 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/costume',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%.',
    rates: [
      // MMP 30m+
      { grade: 'Costume Designer', primaryRate: 'Ind. Neg.', isIndividuallyNegotiated: true, budgetTier: 'MMP £30m+' },
      { grade: 'Costume Supervisor', weeklyRate: 3200, dailyRate: 640, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Assistant Costume Designer', weeklyRate: 2400, dailyRate: 480, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Costume Stand-by', weeklyRate: 2100, dailyRate: 420, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Crowd Costume / Costume Assistant', weeklyRate: 1700, dailyRate: 340, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Costume Cutter / Tailor', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Costume Maker / Seamstress', weeklyRate: 1800, dailyRate: 360, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Costume Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Costume Supervisor', weeklyRate: 3000, dailyRate: 600, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Costume Stand-by', weeklyRate: 1950, dailyRate: 390, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Costume Assistant', weeklyRate: 1550, dailyRate: 310, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Costume Supervisor', weeklyRate: 2650, dailyRate: 530, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Costume Stand-by', weeklyRate: 1750, dailyRate: 350, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Costume Supervisor', weeklyRate: 2250, dailyRate: 450, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      { grade: 'Costume Stand-by', weeklyRate: 1500, dailyRate: 300, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Costume Supervisor', weeklyRate: 2600, dailyRate: 520, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Costume Supervisor', weeklyRate: 2300, dailyRate: 460, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '2T (double time), 15-min increments', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Turnaround', value: '11hrs wrap-to-call' },
      { key: 'Allowances', value: 'Phone £10/wk, Car £150/wk + fuel when required' },
    ],
  },

  // ===============================================================
  // 5. UK -- BECTU Hair, Makeup & Prosthetics
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-hmu',
    agreementName: 'PACT/BECTU Hair, Makeup & Prosthetics 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/hair-makeup',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%. Kit fees separate.',
    rates: [
      // MMP 30m+
      { grade: 'Hair & Makeup Designer', primaryRate: 'Ind. Neg.', isIndividuallyNegotiated: true, budgetTier: 'MMP £30m+' },
      { grade: 'Hair & Makeup Supervisor', weeklyRate: 3200, dailyRate: 640, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Key Hair & Makeup Artist', weeklyRate: 2700, dailyRate: 540, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Hair & Makeup Artist', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Crowd Hair & Makeup', weeklyRate: 1700, dailyRate: 340, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Prosthetics Supervisor', weeklyRate: 3500, dailyRate: 700, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Prosthetics Artist', weeklyRate: 2600, dailyRate: 520, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Prosthetics Technician', weeklyRate: 2100, dailyRate: 420, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'HMU Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Hair & Makeup Supervisor', weeklyRate: 3000, dailyRate: 600, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Hair & Makeup Artist', weeklyRate: 2050, dailyRate: 410, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Crowd Hair & Makeup', weeklyRate: 1550, dailyRate: 310, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Hair & Makeup Supervisor', weeklyRate: 2650, dailyRate: 530, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Hair & Makeup Artist', weeklyRate: 1850, dailyRate: 370, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Hair & Makeup Supervisor', weeklyRate: 2300, dailyRate: 460, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      { grade: 'Hair & Makeup Artist', weeklyRate: 1600, dailyRate: 320, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Hair & Makeup Supervisor', weeklyRate: 2600, dailyRate: 520, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      { grade: 'Hair & Makeup Artist', weeklyRate: 1800, dailyRate: 360, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Hair & Makeup Supervisor', weeklyRate: 2300, dailyRate: 460, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '2T (double time), 15-min increments', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Kit Fee', value: 'HMU kit fee typically £50-£150/wk on top of rate' },
      { key: 'Turnaround', value: '11hrs wrap-to-call' },
      { key: 'Early Call', value: 'HMU often called before crew -- pre-call time counted as worked hours' },
    ],
  },

  // ===============================================================
  // 6. UK -- BECTU Props Department
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-props',
    agreementName: 'PACT/BECTU Props Department 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/props',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%.',
    rates: [
      // MMP 30m+
      { grade: 'Property Master', weeklyRate: 3200, dailyRate: 640, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Assistant Property Master', weeklyRate: 2400, dailyRate: 480, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Chargehand Prop Hand', weeklyRate: 2100, dailyRate: 420, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Prop Hand / Stand-by Props', weeklyRate: 1850, dailyRate: 370, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Dressing Props', weeklyRate: 1750, dailyRate: 350, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Props Maker', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Props Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Property Master', weeklyRate: 3000, dailyRate: 600, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Prop Hand / Stand-by Props', weeklyRate: 1700, dailyRate: 340, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Property Master', weeklyRate: 2650, dailyRate: 530, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Prop Hand / Stand-by Props', weeklyRate: 1500, dailyRate: 300, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Property Master', weeklyRate: 2250, dailyRate: 450, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      { grade: 'Prop Hand / Stand-by Props', weeklyRate: 1350, dailyRate: 270, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Property Master', weeklyRate: 2600, dailyRate: 520, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Property Master', weeklyRate: 2300, dailyRate: 460, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '2T (double time), 15-min increments', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Turnaround', value: '11hrs wrap-to-call' },
      { key: 'Allowances', value: 'Phone £10/wk, Car £150/wk + fuel when required' },
    ],
  },

  // ===============================================================
  // 7. UK -- BECTU Construction Department
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-construction',
    agreementName: 'PACT/BECTU Construction Department 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/construction',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%. Workshop hours differ from shoot.',
    rates: [
      // MMP 30m+
      { grade: 'Construction Manager', weeklyRate: 3400, dailyRate: 680, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Construction Coordinator', weeklyRate: 2500, dailyRate: 500, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Chargehand Carpenter', weeklyRate: 2300, dailyRate: 460, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Carpenter', weeklyRate: 2000, dailyRate: 400, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Chargehand Painter', weeklyRate: 2300, dailyRate: 460, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Scenic Painter', weeklyRate: 2100, dailyRate: 420, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Painter', weeklyRate: 1900, dailyRate: 380, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Plasterer / Moulder', weeklyRate: 2100, dailyRate: 420, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Stagehand / Labourer', weeklyRate: 1500, dailyRate: 300, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Construction Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Construction Manager', weeklyRate: 3200, dailyRate: 640, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Carpenter', weeklyRate: 1850, dailyRate: 370, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Painter', weeklyRate: 1750, dailyRate: 350, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Construction Manager', weeklyRate: 2800, dailyRate: 560, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Carpenter', weeklyRate: 1650, dailyRate: 330, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Construction Manager', weeklyRate: 2400, dailyRate: 480, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      { grade: 'Carpenter', weeklyRate: 1450, dailyRate: 290, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Construction Manager', weeklyRate: 2750, dailyRate: 550, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Construction Manager', weeklyRate: 2400, dailyRate: 480, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '1.5T first 2hrs, 2T thereafter', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Workshop Hours', value: 'Workshop: 50hr/wk (5x10hr). Stage: as per shoot schedule.' },
      { key: 'Turnaround', value: '11hrs (may be 10hrs in workshop)' },
    ],
  },

  // ===============================================================
  // 8. UK -- BECTU Locations Department
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-locations',
    agreementName: 'PACT/BECTU Locations Department 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/locations',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%.',
    rates: [
      // MMP 30m+
      { grade: 'Supervising Location Manager', weeklyRate: 3800, dailyRate: 760, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Location Manager', weeklyRate: 3200, dailyRate: 640, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Assistant Location Manager', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Unit Manager', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Location Scout', weeklyRate: 1800, dailyRate: 360, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Location Assistant / Marshal', weeklyRate: 1350, dailyRate: 270, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Location Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Location Manager', weeklyRate: 3000, dailyRate: 600, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Assistant Location Manager', weeklyRate: 2050, dailyRate: 410, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Location Assistant / Marshal', weeklyRate: 1250, dailyRate: 250, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Location Manager', weeklyRate: 2650, dailyRate: 530, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Assistant Location Manager', weeklyRate: 1800, dailyRate: 360, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Location Manager', weeklyRate: 2250, dailyRate: 450, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Location Manager', weeklyRate: 2600, dailyRate: 520, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Location Manager', weeklyRate: 2300, dailyRate: 460, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '2T (double time), 15-min increments', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Turnaround', value: '11hrs wrap-to-call' },
      { key: 'Car Allowance', value: '£150-200/wk + fuel -- locations require heavy travel', isWarning: true },
      { key: 'Phone', value: '£10-15/wk phone allowance' },
    ],
  },

  // ===============================================================
  // 9. UK -- BECTU Post Production
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-post',
    agreementName: 'PACT/BECTU Post Production 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/post-production',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%. Post usually 45hr/wk deals.',
    rates: [
      // MMP 30m+
      { grade: 'Supervising Editor', weeklyRate: 3800, dailyRate: 760, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Editor', weeklyRate: 3200, dailyRate: 640, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Assembly Editor', weeklyRate: 2500, dailyRate: 500, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: '1st Assistant Editor', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: '2nd Assistant Editor', weeklyRate: 1500, dailyRate: 300, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Post Production Supervisor', weeklyRate: 3000, dailyRate: 600, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Post Production Coordinator', weeklyRate: 1800, dailyRate: 360, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Colourist', weeklyRate: 3500, dailyRate: 700, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Online Editor', weeklyRate: 2800, dailyRate: 560, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Dailies Operator / Lab Liaison', weeklyRate: 1800, dailyRate: 360, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Post Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Editor', weeklyRate: 3000, dailyRate: 600, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: '1st Assistant Editor', weeklyRate: 2050, dailyRate: 410, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Post Production Coordinator', weeklyRate: 1650, dailyRate: 330, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Editor', weeklyRate: 2650, dailyRate: 530, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: '1st Assistant Editor', weeklyRate: 1800, dailyRate: 360, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Editor', weeklyRate: 2250, dailyRate: 450, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Editor', weeklyRate: 2600, dailyRate: 520, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      { grade: '1st Assistant Editor', weeklyRate: 1700, dailyRate: 340, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Editor', weeklyRate: 2300, dailyRate: 460, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '1.5T first 2hrs OT, 2T thereafter', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Working Week', value: 'Post: usually 45-50hr/wk. Rates above are for 50hr.' },
      { key: 'Turnaround', value: '11hrs' },
    ],
  },

  // ===============================================================
  // 10. UK -- BECTU Production Office
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-prodoffice',
    agreementName: 'PACT/BECTU Production Office 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/production-office',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%. Office hours differ from set.',
    rates: [
      // MMP 30m+
      { grade: 'Line Producer', primaryRate: 'Ind. Neg.', isIndividuallyNegotiated: true, budgetTier: 'MMP £30m+' },
      { grade: 'Production Manager', weeklyRate: 3400, dailyRate: 680, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Production Coordinator', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Assistant Production Coordinator', weeklyRate: 1600, dailyRate: 320, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Travel / Movement Coordinator', weeklyRate: 1800, dailyRate: 360, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Production Secretary', weeklyRate: 1500, dailyRate: 300, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Production Accountant', weeklyRate: 3200, dailyRate: 640, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: '1st Assistant Accountant', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: '2nd Assistant Accountant / Cashier', weeklyRate: 1600, dailyRate: 320, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Accounts Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Production Manager', weeklyRate: 3200, dailyRate: 640, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Production Coordinator', weeklyRate: 2050, dailyRate: 410, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Production Accountant', weeklyRate: 3000, dailyRate: 600, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Production Manager', weeklyRate: 2800, dailyRate: 560, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Production Coordinator', weeklyRate: 1800, dailyRate: 360, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Production Accountant', weeklyRate: 2650, dailyRate: 530, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Production Manager', weeklyRate: 2400, dailyRate: 480, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      { grade: 'Production Coordinator', weeklyRate: 1500, dailyRate: 300, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Production Manager', weeklyRate: 2750, dailyRate: 550, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      { grade: 'Production Coordinator', weeklyRate: 1750, dailyRate: 350, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Production Manager', weeklyRate: 2400, dailyRate: 480, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: 'Office: 1.5T after contracted hours. Set: 2T as per shooting crew.', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Office Hours', value: 'Typically 50hr/wk but may differ pre/post production' },
      { key: 'Turnaround', value: '11hrs (set), 10hrs (office)' },
    ],
  },

  // ===============================================================
  // 11. UK -- BECTU Special Effects (SFX)
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-sfx',
    agreementName: 'PACT/BECTU Special Effects (SFX) 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/special-effects',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%.',
    rates: [
      // MMP 30m+
      { grade: 'SFX Supervisor', weeklyRate: 4000, dailyRate: 800, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Senior SFX Technician', weeklyRate: 3200, dailyRate: 640, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'SFX Technician', weeklyRate: 2500, dailyRate: 500, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'SFX Floor Technician', weeklyRate: 2100, dailyRate: 420, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'SFX Workshop Technician', weeklyRate: 1900, dailyRate: 380, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'SFX Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'SFX Supervisor', weeklyRate: 3750, dailyRate: 750, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'SFX Technician', weeklyRate: 2300, dailyRate: 460, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'SFX Supervisor', weeklyRate: 3300, dailyRate: 660, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'SFX Technician', weeklyRate: 2050, dailyRate: 410, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'SFX Supervisor', weeklyRate: 2800, dailyRate: 560, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      { grade: 'SFX Technician', weeklyRate: 1800, dailyRate: 360, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'SFX Supervisor', weeklyRate: 3200, dailyRate: 640, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'SFX Supervisor', weeklyRate: 2800, dailyRate: 560, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '2T (double time), 15-min increments', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Hazard Pay', value: 'Additional hazard/risk premium for pyro/explosives work' },
      { key: 'Turnaround', value: '11hrs wrap-to-call' },
      { key: 'Certification', value: 'Pyro technicians must hold relevant HSE certifications' },
    ],
  },

  // ===============================================================
  // 12. UK -- BECTU Set Crafts
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-setcrafts',
    agreementName: 'PACT/BECTU Set Crafts 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/set-crafts',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%.',
    rates: [
      // MMP 30m+
      { grade: 'Drapes Master / Soft Furnisher Supervisor', weeklyRate: 2600, dailyRate: 520, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Drapes Hand / Soft Furnisher', weeklyRate: 2000, dailyRate: 400, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Upholsterer', weeklyRate: 2100, dailyRate: 420, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Sculptor / Modeller', weeklyRate: 2300, dailyRate: 460, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Fibrous Plasterer', weeklyRate: 2100, dailyRate: 420, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Greensman / Greensperson', weeklyRate: 2000, dailyRate: 400, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Set Crafts Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Drapes Master / Soft Furnisher Supervisor', weeklyRate: 2400, dailyRate: 480, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Drapes Hand / Soft Furnisher', weeklyRate: 1850, dailyRate: 370, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Drapes Master / Soft Furnisher Supervisor', weeklyRate: 2150, dailyRate: 430, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Drapes Master / Soft Furnisher Supervisor', weeklyRate: 1850, dailyRate: 370, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Drapes Master / Soft Furnisher Supervisor', weeklyRate: 2100, dailyRate: 420, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Drapes Master / Soft Furnisher Supervisor', weeklyRate: 1850, dailyRate: 370, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '1.5T first 2hrs, 2T thereafter', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Turnaround', value: '11hrs' },
    ],
  },

  // ===============================================================
  // 13. UK -- BECTU Graphics Department
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-graphics',
    agreementName: 'PACT/BECTU Graphics Department 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/graphics',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%.',
    rates: [
      // MMP 30m+
      { grade: 'Graphic Designer (HOD)', weeklyRate: 2800, dailyRate: 560, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Graphic Designer', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Graphic Artist / Illustrator', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Graphics Assistant', weeklyRate: 1500, dailyRate: 300, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Graphic Designer (HOD)', weeklyRate: 2600, dailyRate: 520, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Graphic Designer', weeklyRate: 2050, dailyRate: 410, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Graphic Designer (HOD)', weeklyRate: 2300, dailyRate: 460, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Graphic Designer', weeklyRate: 1800, dailyRate: 360, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Graphic Designer (HOD)', weeklyRate: 2000, dailyRate: 400, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Graphic Designer (HOD)', weeklyRate: 2250, dailyRate: 450, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Graphic Designer (HOD)', weeklyRate: 2000, dailyRate: 400, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '1.5T first 2hrs, 2T thereafter', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Computer Allowance', value: '£25-30/wk when using own equipment' },
      { key: 'Turnaround', value: '11hrs' },
    ],
  },

  // ===============================================================
  // 14. UK -- BECTU Animation & VFX
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-anim-vfx',
    agreementName: 'PACT/BECTU Animation & VFX 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/animation-vfx',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%. VFX facility rates may differ.',
    rates: [
      // MMP 30m+ (on-set / production-side VFX)
      { grade: 'VFX Supervisor (on-set)', weeklyRate: 4200, dailyRate: 840, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'VFX Producer', weeklyRate: 3500, dailyRate: 700, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'VFX Coordinator', weeklyRate: 2000, dailyRate: 400, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'VFX Data Wrangler / On-Set Tech', weeklyRate: 1800, dailyRate: 360, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Facility-side (post) rates
      { grade: 'CG Supervisor (facility)', weeklyRate: 3200, dailyRate: 640, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Compositing Lead', weeklyRate: 2800, dailyRate: 560, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Compositor', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: '3D Modeller / Animator', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Roto / Paint Artist', weeklyRate: 1600, dailyRate: 320, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'VFX Trainee / Runner', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'VFX Supervisor (on-set)', weeklyRate: 3800, dailyRate: 760, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Compositor', weeklyRate: 2050, dailyRate: 410, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'VFX Supervisor (on-set)', weeklyRate: 3300, dailyRate: 660, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Compositor', weeklyRate: 1850, dailyRate: 370, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'VFX Supervisor (on-set)', weeklyRate: 2800, dailyRate: 560, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'VFX Supervisor (on-set)', weeklyRate: 3200, dailyRate: 640, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'VFX Supervisor (on-set)', weeklyRate: 2800, dailyRate: 560, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '1.5T first 2hrs, 2T thereafter (facility hours vary)', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Facility vs Production', value: 'VFX facility staff may be salaried; freelance production-side follows BECTU rates' },
      { key: 'Turnaround', value: '11hrs (on-set), facility hours may vary' },
    ],
  },

  // ===============================================================
  // 15. UK -- BECTU Runners
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-runners',
    agreementName: 'PACT/BECTU Runners / Trainees 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/runners',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%.',
    rates: [
      // MMP 30m+
      { grade: 'Set Runner', weeklyRate: 750, dailyRate: 150, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Office Runner', weeklyRate: 700, dailyRate: 140, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Rushes / Post Runner', weeklyRate: 700, dailyRate: 140, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Set Runner', weeklyRate: 725, dailyRate: 145, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Office Runner', weeklyRate: 675, dailyRate: 135, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Set Runner', weeklyRate: 700, dailyRate: 140, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Office Runner', weeklyRate: 650, dailyRate: 130, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Set Runner', weeklyRate: 650, dailyRate: 130, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Set Runner', weeklyRate: 700, dailyRate: 140, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      { grade: 'Office Runner', weeklyRate: 650, dailyRate: 130, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Set Runner', weeklyRate: 650, dailyRate: 130, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '2T (double time), 15-min increments', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'NMW Floor', value: 'Runner rates must not fall below National Minimum Wage (£11.44/hr from Apr 2024)', isWarning: true },
      { key: 'Turnaround', value: '11hrs wrap-to-call' },
    ],
  },

  // ===============================================================
  // 16. UK -- BECTU Unit Drivers
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-drivers',
    agreementName: 'PACT/BECTU Unit Drivers 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/drivers',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%.',
    rates: [
      // MMP 30m+
      { grade: 'Transport Captain', weeklyRate: 3000, dailyRate: 600, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Unit Driver (HGV / Artic)', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Unit Driver (7.5T)', weeklyRate: 1900, dailyRate: 380, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Minibus / Car Driver', weeklyRate: 1600, dailyRate: 320, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Facilities Driver', weeklyRate: 1800, dailyRate: 360, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Transport Captain', weeklyRate: 2800, dailyRate: 560, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Unit Driver (HGV / Artic)', weeklyRate: 2050, dailyRate: 410, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Unit Driver (7.5T)', weeklyRate: 1750, dailyRate: 350, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Transport Captain', weeklyRate: 2450, dailyRate: 490, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Unit Driver (7.5T)', weeklyRate: 1600, dailyRate: 320, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Transport Captain', weeklyRate: 2100, dailyRate: 420, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      { grade: 'Unit Driver (7.5T)', weeklyRate: 1450, dailyRate: 290, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Transport Captain', weeklyRate: 2400, dailyRate: 480, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      { grade: 'Unit Driver (7.5T)', weeklyRate: 1550, dailyRate: 310, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Transport Captain', weeklyRate: 2100, dailyRate: 420, budgetTier: 'TV Band 3', dealType: '50hr_week' },
      { grade: 'Unit Driver (7.5T)', weeklyRate: 1400, dailyRate: 280, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '1.5T first 2hrs, 2T thereafter', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'Driving Hours', value: 'EU tachograph / drivers hours regulations apply', isWarning: true },
      { key: 'Licence', value: 'HGV/Class C drivers require valid CPC and tacho card' },
      { key: 'Turnaround', value: '11hrs wrap-to-call (subject to driving hours regs)' },
    ],
  },

  // ===============================================================
  // 17. UK -- BECTU Riggers (Electrical)
  // ===============================================================
  {
    territoryCode: 'uk',
    agreementId: 'uk-riggers',
    agreementName: 'PACT/BECTU Riggers (Electrical) 2024-2025',
    union: 'BECTU',
    type: 'crew',
    status: 'confirmed',
    access: 'public',
    effectiveFrom: new Date('2024-01-01'),
    sourceUrl: 'https://union.bectu.org.uk/rigging',
    holidayPayNote: 'Holiday pay NOT included -- add 12.07%.',
    rates: [
      // MMP 30m+
      { grade: 'Rigging Gaffer / HOD Rigger', weeklyRate: 3500, dailyRate: 700, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Rigging Best Boy', weeklyRate: 2650, dailyRate: 530, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Rigger Electrician', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Rigging Grip', weeklyRate: 2200, dailyRate: 440, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      { grade: 'Rigging Trainee', weeklyRate: 850, dailyRate: 170, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
      // Film 15m-30m
      { grade: 'Rigging Gaffer / HOD Rigger', weeklyRate: 3300, dailyRate: 660, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Rigging Best Boy', weeklyRate: 2500, dailyRate: 500, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      { grade: 'Rigger Electrician', weeklyRate: 2050, dailyRate: 410, budgetTier: 'Film £15m-£30m', dealType: '50hr_week' },
      // Film 5m-15m
      { grade: 'Rigging Gaffer / HOD Rigger', weeklyRate: 2900, dailyRate: 580, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      { grade: 'Rigger Electrician', weeklyRate: 1850, dailyRate: 370, budgetTier: 'Film £5m-£15m', dealType: '50hr_week' },
      // Film 3m-5m
      { grade: 'Rigging Gaffer / HOD Rigger', weeklyRate: 2500, dailyRate: 500, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      { grade: 'Rigger Electrician', weeklyRate: 1650, dailyRate: 330, budgetTier: 'Film £3m-£5m', dealType: '50hr_week' },
      // TV Band 4
      { grade: 'Rigging Gaffer / HOD Rigger', weeklyRate: 2850, dailyRate: 570, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      { grade: 'Rigger Electrician', weeklyRate: 1800, dailyRate: 360, budgetTier: 'TV Band 4', dealType: '50hr_week' },
      // TV Band 3
      { grade: 'Rigging Gaffer / HOD Rigger', weeklyRate: 2500, dailyRate: 500, budgetTier: 'TV Band 3', dealType: '50hr_week' },
      { grade: 'Rigger Electrician', weeklyRate: 1650, dailyRate: 330, budgetTier: 'TV Band 3', dealType: '50hr_week' },
    ],
    rules: [
      { key: 'OT', value: '2T (double time), NO grace, 15-min increments', isWarning: true },
      { key: '6th Day', value: 'x1.5 all hours (min 6hrs non-shoot, 8hrs shoot)' },
      { key: '7th Day', value: 'x2.0 all hours' },
      { key: 'Holiday Pay', value: 'NOT included -- must add 12.07%', isWarning: true },
      { key: 'NICEIC', value: 'All rigger electricians must hold valid ECS/NICEIC certification' },
      { key: 'Turnaround', value: '11hrs wrap-to-call' },
      { key: 'Working at Height', value: 'IPAF/PASMA certification required for elevated work' },
    ],
  },
];
