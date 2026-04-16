// ============================================================
// US Scale Minimums — sourced from EP Paymaster 2025-26
// + UK PACT/BECTU Indicative Minimums
// Extracted from Zillit Deal Memo v21 HTML prototype
// ============================================================

export interface ScaleMinimum {
  /** Weekly rate in local currency */
  weekly: number | null;
  /** Daily rate in local currency */
  daily: number | null;
  /** Flat fee (for writers etc.) */
  flat?: number | null;
  /** DGA production fee per week */
  prodFee?: number;
  /** Source note */
  note: string;
}

/**
 * US Scale Minimums by union and job title.
 * Source: EP Paymaster 2025-26 where noted.
 */
export const US_SCALE_MINIMUMS: Record<string, Record<string, ScaleMinimum>> = {
  'iatse-600': {
    'Director of Photography':          { weekly: 5597, daily: 1164, note: 'IATSE Local 600 Studio Schedule B (5-day weekly guarantee): $129.55/hr, $5,596.56/wk. Distant: $6,218.40/wk. Source: EP Paymaster 2025-26.' },
    'Camera Operator':                  { weekly: 3559, daily: 719,  note: 'IATSE Local 600 Studio Schedule B: $82.39/hr, $3,559.25/wk. Distant Schedule B: $3,954.72/wk. Source: EP Paymaster 2025-26.' },
    'B Camera Operator':                { weekly: 3559, daily: 719,  note: 'Same rate as Camera Operator \u2014 IATSE Local 600 Studio Schedule B. Source: EP Paymaster 2025-26.' },
    '1st Assistant Camera':             { weekly: 2908, daily: 582,  note: 'IATSE Local 600 approximate studio scale. Verify current Schedule B rate with payroll company.' },
    '2nd Assistant Camera':             { weekly: 2645, daily: 529,  note: 'IATSE Local 600 approximate studio scale. Verify current rate with payroll company.' },
    'Digital Imaging Technician (DIT)': { weekly: 3150, daily: 630,  note: 'IATSE Local 600 DIT approximate studio scale. Verify current rate with payroll company.' },
    'Loader':                           { weekly: 2430, daily: 486,  note: 'IATSE Local 600 approximate. Verify current rate with payroll company.' },
    'Steadicam Operator':               { weekly: 3559, daily: 719,  note: 'Steadicam rates at Camera Operator minimum \u2014 individual negotiation typically higher.' },
    'Video Assist Operator':            { weekly: 2645, daily: 529,  note: 'IATSE Local 600 approximate. Verify current rate with payroll company.' },
  },

  'iatse-728': {
    'Gaffer':                              { weekly: 3794, daily: 488, note: 'IATSE Local 728 Studio: $63.01/hr (daily 8-hr), $3,793.59/wk (54-hr guarantee). Source: EP Paymaster 2025-26 (8/3/2025\u20138/1/2026).' },
    'Best Boy Electric':                   { weekly: 3429, daily: 458, note: 'IATSE Local 728 Studio: $57.20/hr (daily), $3,428.81/wk (54-hr guarantee). Source: EP Paymaster 2025-26.' },
    'Lighting Technician (Lamp Operator)': { weekly: 3120, daily: 415, note: 'IATSE Local 728 approximate studio scale. Verify current rate with payroll company.' },
    'Rigging Gaffer':                      { weekly: 3794, daily: 488, note: 'IATSE Local 728 Chief Rigging Tech: $63.01/hr, $3,793.59/wk (54-hr). Source: EP Paymaster 2025-26.' },
    'Rigging Best Boy Electric':           { weekly: 3429, daily: 458, note: 'IATSE Local 728 Asst. Chief Rigging Tech: $57.20/hr, $3,428.81/wk. Source: EP Paymaster 2025-26.' },
    'Generator Operator':                  { weekly: 3120, daily: 415, note: 'IATSE Local 728 approximate. Verify current rate with payroll company.' },
    'Lighting Board Operator':             { weekly: 3120, daily: 415, note: 'IATSE Local 728 approximate. Verify current rate with payroll company.' },
  },

  'iatse-80': {
    'Key Grip':              { weekly: 3794, daily: 504, note: 'IATSE Local 80 Studio: 1st Company Grip/Key Grip $63.01/hr, $3,793.59/wk (Schedule B). Source: EP Paymaster 2025-26.' },
    'Best Boy Grip':         { weekly: 3429, daily: 458, note: 'IATSE Local 80 Studio: 2nd Company Grip/Best Boy $57.20/hr, $3,428.81/wk. Source: EP Paymaster 2025-26.' },
    'Dolly Grip':            { weekly: 3200, daily: 427, note: 'IATSE Local 80 approximate studio scale. Verify with payroll company.' },
    'Technocrane Operator':  { weekly: 3414, daily: 456, note: 'IATSE Local 80 Grip Foreperson rate $3,414.76/wk (studio). Source: EP Paymaster 2025-26.' },
    'Rigging Key Grip':      { weekly: 3688, daily: 492, note: 'IATSE Local 80 Head Grip Foreperson $3,688.80/wk (studio). Source: EP Paymaster 2025-26.' },
    'Rigging Best Boy Grip': { weekly: 3429, daily: 458, note: 'IATSE Local 80 approximate. Verify with payroll company.' },
    'Grip':                  { weekly: 2980, daily: 398, note: 'IATSE Local 80 Grip $54.78/hr (daily 8-hr). Source: EP Paymaster 2025-26.' },
  },

  'iatse-695': {
    'Production Sound Mixer': { weekly: 3794, daily: 488, note: 'IATSE Local 695 approximate studio scale. Verify current 695 agreement with payroll company.' },
    'Boom Operator':          { weekly: 3280, daily: 437, note: 'IATSE Local 695 approximate studio scale. Verify current rate with payroll company.' },
    'Sound Assistant':        { weekly: 2800, daily: 373, note: 'IATSE Local 695 approximate. Verify current rate with payroll company.' },
  },

  dga: {
    'First Assistant Director':         { weekly: 8469, daily: null, prodFee: 1384, note: 'DGA Basic Agreement Studio weekly rate (07/01/2025): $8,469/wk + $1,384 production fee. Source: EP Paymaster 2025-26.' },
    'Key Second Assistant Director':    { weekly: 5777, daily: null, prodFee: 1120, note: 'DGA Basic Agreement (07/01/2025): $5,777/wk + $1,120 production fee. Source: EP Paymaster 2025-26.' },
    'Second Assistant Director':        { weekly: 4875, daily: null, prodFee: 0,    note: 'DGA Basic Agreement approximate (07/01/2025). Verify current rate with payroll company.' },
    'Second Second Assistant Director': { weekly: 4223, daily: null, prodFee: 0,    note: 'DGA Basic Agreement approximate. Verify current 2nd 2nd AD rate with payroll company.' },
    'Unit Production Manager (UPM)':    { weekly: 8925, daily: null, prodFee: 1644, note: 'DGA Basic Agreement Studio weekly rate (07/01/2025): $8,925/wk + $1,644 production fee. Source: EP Paymaster 2025-26.' },
    'DGA Trainee':                      { weekly: 900,  daily: null, prodFee: 0,    note: 'DGA Training Program \u2014 fixed scale, not negotiable. Verify current trainee rate with DGA Training Program office.' },
  },

  'sag-aftra': {
    'Day Player \u2014 Performer':  { weekly: null, daily: 1056, note: 'SAG-AFTRA TV Agreement 2024 approximate day performer rate. Verify current scale with SAG-AFTRA signatory payroll company.' },
    'Weekly Performer':              { weekly: 3669, daily: null, note: 'SAG-AFTRA TV Agreement 2024 approximate weekly performer rate. Verify current scale.' },
    'Guest Star':                    { weekly: null, daily: 7249, note: 'SAG-AFTRA Guest Star rate approximate. Verify current scale with payroll company \u2014 rates vary by network/streamer tier.' },
    'Co-Star':                       { weekly: null, daily: 1056, note: 'SAG-AFTRA Co-Star rate \u2014 at minimum day performer scale. Verify current rate.' },
    'Stunt Performer':               { weekly: null, daily: 1056, note: 'SAG-AFTRA Stunt Performer at scale \u2014 stunt adjustments negotiated separately per stunt. Verify current stunt scale.' },
    'Background Performer':          { weekly: null, daily: 236,  note: 'SAG-AFTRA Background rate approximate (Los Angeles zone, 2024). Verify current zone rate with payroll company.' },
  },

  'wga-west': {
    'Writer':      { weekly: null,  daily: null, flat: null, note: 'WGA West MBA 2023 \u2014 rates vary by story format, episode length, and budget level. Minimum scales are complex. Contact WGA for current schedule.' },
    'Showrunner':  { weekly: 37500, daily: null, note: 'WGA West MBA 2023 EP/Showrunner minimum \u2014 approximate. Varies by level and series length. Verify current schedule.' },
    'Head Writer': { weekly: 31500, daily: null, note: 'WGA West MBA 2023 approximate. Verify current scale.' },
    'Story Editor':{ weekly: 6500,  daily: null, note: 'WGA West MBA 2023 approximate \u2014 per-episode or weekly deal. Verify current scale.' },
  },

  'teamsters-399': {
    'Transportation Co-ordinator': { weekly: 3975, daily: null, note: 'Teamsters Local 399 approximate 2024. Verify current rate with payroll company.' },
    'Transportation Captain':      { weekly: 3563, daily: null, note: 'Teamsters Local 399 approximate 2024.' },
    'Driver Captain':              { weekly: 3375, daily: null, note: 'Teamsters Local 399 approximate 2024.' },
    'Driver':                      { weekly: 3150, daily: null, note: 'Teamsters Local 399 approximate 2024.' },
    'Action Vehicle Co-ordinator': { weekly: 3800, daily: null, note: 'Teamsters Local 399 approximate 2024. Verify current rate.' },
  },
};

/**
 * UK PACT/BECTU Indicative Minimums.
 * PACT/BECTU does NOT publish grade-by-grade scale rates.
 * These are indicative industry practice based on OT floor constraints.
 */
export const UK_PACT_MINIMUMS: Record<string, Record<string, ScaleMinimum> & { _note: string }> = {
  'pact-bectu': {
    _note: 'PACT/BECTU Scripted TV 2023 does not publish grade-by-grade minimum day rates. The OT minimum (\u00a335/hr) sets an effective floor: at 10 contracted hours, rates below \u00a3350/day would mean OT always exceeds the hourly rate. Rates below are indicative industry practice and should not be treated as PACT/BECTU published scale.',
    'First Assistant Director':  { weekly: 2250,  daily: 450,  note: 'Indicative industry minimum. PACT/BECTU sets no published AD scale. OT floor: \u00a335/hr applies.' },
    'Second Assistant Director': { weekly: 1750,  daily: 350,  note: 'Indicative. OT minimum floor \u00a335/hr (min \u00a3350/day) applies.' },
    'Third Assistant Director':  { weekly: 1250,  daily: 250,  note: 'Indicative floor. Ensure total comp including OT meets NMW for actual hours.' },
    'Floor Runner':              { weekly: 900,   daily: 180,  note: 'Indicative floor. NMW (National Minimum Wage) applies to all workers.' },
    'Director of Photography':   { weekly: 4500,  daily: 900,  note: 'Indicative industry minimum for experienced HOD DoP. No published PACT scale.' },
    'Camera Operator':           { weekly: 2500,  daily: 500,  note: 'Indicative. No published PACT scale.' },
    '1st Assistant Camera':      { weekly: 1800,  daily: 360,  note: 'Indicative. OT floor \u00a335/hr applies.' },
    '2nd Assistant Camera':      { weekly: 1400,  daily: 280,  note: 'Indicative floor.' },
    'Gaffer':                    { weekly: 2500,  daily: 500,  note: 'Indicative industry minimum. No published PACT/BECTU scale.' },
    'Best Boy Electric':         { weekly: 1900,  daily: 380,  note: 'Indicative.' },
    'Key Grip':                  { weekly: 2200,  daily: 440,  note: 'Indicative industry minimum.' },
    'Production Sound Mixer':    { weekly: 2200,  daily: 440,  note: 'Indicative.' },
    'Production Designer':       { weekly: 3500,  daily: 700,  note: 'Indicative HOD minimum \u2014 negotiate with agent.' },
    'Art Director':              { weekly: 2200,  daily: 440,  note: 'Indicative.' },
    'Costume Designer':          { weekly: 3000,  daily: 600,  note: 'Indicative HOD minimum.' },
    'Location Manager':          { weekly: 2500,  daily: 500,  note: 'Indicative.' },
    'Production Manager':        { weekly: 2500,  daily: 500,  note: 'Indicative industry minimum. No published PACT/BECTU scale.' },
    'Line Producer':             { weekly: 3500,  daily: 700,  note: 'Indicative. Line Producer rates negotiated individually.' },
    'Script Supervisor':         { weekly: 1800,  daily: 360,  note: 'Indicative. Contracted for 10+1 hours as special department.' },
  },

  'pact-mmp': {
    _note: 'PACT/BECTU MMP 2021 does not publish grade-by-grade scale rates. Rates on Major Motion Pictures are typically significantly above indicative TV minimums. Min Camera OT rate: \u00a325/hr (max: \u00a381.82/hr).',
    'First Assistant Director':  { weekly: 5000,  daily: 1000, note: 'Indicative MMP floor. UK MMP rates for major features typically higher than TV.' },
    'Director of Photography':   { weekly: 10000, daily: 2000, note: 'Indicative only \u2014 DOP rates on MMP are individually negotiated and typically well above any floor.' },
    'Production Manager':        { weekly: 4000,  daily: 800,  note: 'Indicative MMP floor for production management grades.' },
  },
};

/** Combined export for convenience */
export const SCALE_MINIMUMS = {
  us: US_SCALE_MINIMUMS,
  uk: UK_PACT_MINIMUMS,
};
