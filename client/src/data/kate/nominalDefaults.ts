// ============================================================
// Default Nominal Codes by Department / Category
// Extracted from Zillit Deal Memo v21 HTML prototype
// ============================================================

export interface NominalEntry {
  /** Line element description */
  el: string;
  /** Nominal code and label */
  nom: string;
  /** Whether holiday pay accrues on this element */
  hp: boolean;
}

/**
 * Default nominal codes by department.
 * Used to pre-fill the Nominal Coding step.
 */
export const NOMINAL_DEFAULTS: Record<string, NominalEntry[]> = {
  light: [
    { el: 'Basic Labour', nom: '4420 \u2014 Lighting Labour', hp: true },
    { el: 'Holiday Pay', nom: '4421 \u2014 Lighting HP', hp: false },
    { el: 'Overtime', nom: '4422 \u2014 Lighting OT', hp: true },
    { el: 'Kit Rental', nom: '4423 \u2014 Lighting Equipment Rental', hp: false },
    { el: 'Allowances', nom: '4424 \u2014 Lighting Allowances', hp: false },
  ],

  cam: [
    { el: 'Basic Labour', nom: '4400 \u2014 Camera Labour', hp: true },
    { el: 'Holiday Pay', nom: '4401 \u2014 Camera HP', hp: false },
    { el: 'Overtime', nom: '4402 \u2014 Camera OT', hp: true },
    { el: 'Kit Rental', nom: '4403 \u2014 Camera Equipment Rental', hp: false },
    { el: 'Allowances', nom: '4404 \u2014 Camera Allowances', hp: false },
  ],

  grip: [
    { el: 'Basic Labour', nom: '4410 \u2014 Grip Labour', hp: true },
    { el: 'Holiday Pay', nom: '4411 \u2014 Grip HP', hp: false },
    { el: 'Overtime', nom: '4412 \u2014 Grip OT', hp: true },
    { el: 'Kit Rental', nom: '4413 \u2014 Grip Equipment Rental', hp: false },
    { el: 'Allowances', nom: '4414 \u2014 Grip Allowances', hp: false },
  ],

  sound: [
    { el: 'Basic Labour', nom: '4430 \u2014 Sound Labour', hp: true },
    { el: 'Holiday Pay', nom: '4431 \u2014 Sound HP', hp: false },
    { el: 'Overtime', nom: '4432 \u2014 Sound OT', hp: true },
    { el: 'Kit Rental', nom: '4433 \u2014 Sound Equipment Rental', hp: false },
    { el: 'Allowances', nom: '4434 \u2014 Sound Allowances', hp: false },
  ],

  art: [
    { el: 'Basic Labour', nom: '4440 \u2014 Art Dept Labour', hp: true },
    { el: 'Holiday Pay', nom: '4441 \u2014 Art Dept HP', hp: false },
    { el: 'Overtime', nom: '4442 \u2014 Art Dept OT', hp: true },
    { el: 'Kit Rental', nom: '4443 \u2014 Art Dept Equipment Rental', hp: false },
    { el: 'Allowances', nom: '4444 \u2014 Art Dept Allowances', hp: false },
  ],

  prod: [
    { el: 'Basic Labour', nom: '4450 \u2014 Production Labour', hp: true },
    { el: 'Holiday Pay', nom: '4451 \u2014 Production HP', hp: false },
    { el: 'Overtime', nom: '4452 \u2014 Production OT', hp: true },
    { el: 'Kit Rental', nom: '4453 \u2014 Production Equipment Rental', hp: false },
    { el: 'Allowances', nom: '4454 \u2014 Production Allowances', hp: false },
  ],

  hair: [
    { el: 'Basic Labour', nom: '4460 \u2014 Hair & Make-Up Labour', hp: true },
    { el: 'Holiday Pay', nom: '4461 \u2014 Hair & Make-Up HP', hp: false },
    { el: 'Overtime', nom: '4462 \u2014 Hair & Make-Up OT', hp: true },
    { el: 'Kit Rental', nom: '4463 \u2014 Hair & Make-Up Kit Rental', hp: false },
    { el: 'Allowances', nom: '4464 \u2014 Hair & Make-Up Allowances', hp: false },
  ],

  costume: [
    { el: 'Basic Labour', nom: '4470 \u2014 Costume Labour', hp: true },
    { el: 'Holiday Pay', nom: '4471 \u2014 Costume HP', hp: false },
    { el: 'Overtime', nom: '4472 \u2014 Costume OT', hp: true },
    { el: 'Kit Rental', nom: '4473 \u2014 Costume Equipment Rental', hp: false },
    { el: 'Allowances', nom: '4474 \u2014 Costume Allowances', hp: false },
  ],

  loc: [
    { el: 'Basic Labour', nom: '4480 \u2014 Locations Labour', hp: true },
    { el: 'Holiday Pay', nom: '4481 \u2014 Locations HP', hp: false },
    { el: 'Overtime', nom: '4482 \u2014 Locations OT', hp: true },
    { el: 'Kit Rental', nom: '4483 \u2014 Locations Equipment Rental', hp: false },
    { el: 'Allowances', nom: '4484 \u2014 Locations Allowances', hp: false },
  ],

  trans: [
    { el: 'Basic Labour', nom: '4490 \u2014 Transport Labour', hp: true },
    { el: 'Holiday Pay', nom: '4491 \u2014 Transport HP', hp: false },
    { el: 'Overtime', nom: '4492 \u2014 Transport OT', hp: true },
    { el: 'Vehicle Rental', nom: '4429 \u2014 Vehicle Rental', hp: false },
    { el: 'Allowances', nom: '4494 \u2014 Transport Allowances', hp: false },
  ],

  dir: [
    { el: 'Basic Labour', nom: '4300 \u2014 Director Labour', hp: true },
    { el: 'Holiday Pay', nom: '4301 \u2014 Director HP', hp: false },
    { el: 'Overtime', nom: '4302 \u2014 Director OT', hp: true },
    { el: 'Allowances', nom: '4304 \u2014 Director Allowances', hp: false },
  ],

  cast: [
    { el: 'Basic Labour', nom: '4200 \u2014 Cast Fees', hp: true },
    { el: 'Holiday Pay', nom: '4201 \u2014 Cast HP', hp: false },
    { el: 'Overtime', nom: '4202 \u2014 Cast OT', hp: true },
    { el: 'Allowances', nom: '4204 \u2014 Cast Allowances', hp: false },
  ],

  vfx: [
    { el: 'Basic Labour', nom: '4510 \u2014 VFX Labour', hp: true },
    { el: 'Holiday Pay', nom: '4511 \u2014 VFX HP', hp: false },
    { el: 'Overtime', nom: '4512 \u2014 VFX OT', hp: true },
    { el: 'Kit Rental', nom: '4513 \u2014 VFX Equipment Rental', hp: false },
    { el: 'Allowances', nom: '4514 \u2014 VFX Allowances', hp: false },
  ],

  post: [
    { el: 'Basic Labour', nom: '4520 \u2014 Post Production Labour', hp: true },
    { el: 'Holiday Pay', nom: '4521 \u2014 Post HP', hp: false },
    { el: 'Overtime', nom: '4522 \u2014 Post OT', hp: true },
    { el: 'Kit Rental', nom: '4523 \u2014 Post Equipment Rental', hp: false },
    { el: 'Allowances', nom: '4524 \u2014 Post Allowances', hp: false },
  ],

  atl: [
    { el: 'Basic Labour', nom: '4100 \u2014 ATL Fees', hp: true },
    { el: 'Holiday Pay', nom: '4101 \u2014 ATL HP', hp: false },
    { el: 'Allowances', nom: '4104 \u2014 ATL Allowances', hp: false },
  ],

  default: [
    { el: 'Basic Labour', nom: '4500 \u2014 BTL Labour', hp: true },
    { el: 'Holiday Pay', nom: '4501 \u2014 BTL HP', hp: false },
    { el: 'Overtime', nom: '4502 \u2014 BTL OT', hp: true },
    { el: 'Kit Rental', nom: '4503 \u2014 Equipment Rental', hp: false },
    { el: 'Allowances', nom: '4504 \u2014 Allowances', hp: false },
  ],
};

/** Common allowance nominal codes */
export const ALLOWANCE_NOMINALS: Record<string, string> = {
  meal: '4424 \u2014 Meal Allowance',
  mileage: '4425 \u2014 Mileage Allowance',
  accommodation: '4426 \u2014 Accommodation Allowance',
  per_diem: '4427 \u2014 Per Diem',
  phone: '4428 \u2014 Phone / Communication Allowance',
};

/** Common rental nominal codes */
export const RENTAL_NOMINALS: Record<string, string> = {
  camera_equipment: '4403 \u2014 Camera Equipment Rental',
  lighting_equipment: '4423 \u2014 Lighting Equipment Rental',
  vehicle: '4429 \u2014 Vehicle Rental',
  it: '4430 \u2014 IT Equipment Rental',
  personal_kit: '4431 \u2014 Personal Kit / Box Rental',
};
