/**
 * Seed international unions (AU, DE, FR, ES) with departments, designations,
 * budget tiers, rate cards, and one production per territory.
 *
 * Run: node src/seeds/seedInternational.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const OID = (id) => new mongoose.Types.ObjectId(id);
const r2 = (n) => Math.round(n * 100) / 100;
const effectiveFrom = new Date('2024-07-01');

const ADMIN_ID = '69ce734623c537958cba7a5f';

// ═════════════════════════════════════════════════════════════════════════
// UNION DEFINITIONS
// ═════════════════════════════════════════════════════════════════════════
const INTL_UNIONS = [
  {
    code: 'MEAA',
    name: 'Media, Entertainment & Arts Alliance',
    country: 'AU',
    website: 'https://www.meaa.org',
    currentAgreementUrl: 'https://www.meaa.org/entertainment-crew/',
    standardWorkDayHrs: 10,
    standardLunchHrs: 1,
    minTurnaroundHrs: 10,
    holidayPayPct: 0.1153, // 11.53% leave loading + annual leave
    description: 'Covers crew and performers in Australian film and TV under the MPPA and BRECA agreements.',
  },
  {
    code: 'SPA',
    name: 'Screen Producers Australia',
    country: 'AU',
    website: 'https://www.screenproducers.org.au',
    currentAgreementUrl: 'https://www.screenproducers.org.au/agreements',
    standardWorkDayHrs: 10,
    standardLunchHrs: 1,
    minTurnaroundHrs: 10,
    holidayPayPct: 0.1153,
    description: 'Covers performers in Australian film and TV. Works alongside MEAA for actor agreements.',
  },
  {
    code: 'CONVENTION_FR',
    name: 'Convention Collective de la Production Audiovisuelle',
    country: 'FR',
    website: 'https://www.legifrance.gouv.fr',
    currentAgreementUrl: 'https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000005635742',
    standardWorkDayHrs: 8, // 35hr week / 7hr base + equivalence hours
    standardLunchHrs: 1,
    minTurnaroundHrs: 11,
    holidayPayPct: 0.10, // 10% conges payes
    description: 'Convention collective covering technicians and artists in French audiovisual production. Intermittent du spectacle regime.',
  },
  {
    code: 'VERDI',
    name: 'ver.di - Vereinte Dienstleistungsgewerkschaft',
    country: 'DE',
    website: 'https://www.verdi.de',
    currentAgreementUrl: 'https://www.verdi.de/themen/tarifvertraege',
    standardWorkDayHrs: 10,
    standardLunchHrs: 1,
    minTurnaroundHrs: 11,
    holidayPayPct: 0.0, // Included in monthly rates
    description: 'German services union covering film/TV crew. Collective bargaining via BFS (Bundesverband Filmschnitt) and Produzentenallianz.',
  },
  {
    code: 'BFFS',
    name: 'BFFS - Bundesverband der Film- und Fernsehschauspieler',
    country: 'DE',
    website: 'https://www.bffs.de',
    currentAgreementUrl: 'https://www.bffs.de/tarifvertrag',
    standardWorkDayHrs: 10,
    standardLunchHrs: 1,
    minTurnaroundHrs: 11,
    holidayPayPct: 0.0,
    description: 'German actors union. Negotiates Tarifvertrag für Film- und Fernsehschaffende (performers).',
  },
  {
    code: 'ALMA',
    name: 'ALMA - Asociación Libre de Medios Audiovisuales',
    country: 'ES',
    website: 'https://www.sindicatoalma.es',
    currentAgreementUrl: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-convenio-audiovisual',
    standardWorkDayHrs: 10,
    standardLunchHrs: 1,
    minTurnaroundHrs: 11,
    holidayPayPct: 0.0, // Included in monthly rates under convenio
    description: 'Spanish audiovisual workers union. Operates under Convenio Colectivo del Sector Audiovisual.',
  },
  {
    code: 'AISGE',
    name: 'AISGE - Artistas Intérpretes Sociedad de Gestión',
    country: 'ES',
    website: 'https://www.aisge.es',
    currentAgreementUrl: 'https://www.aisge.es/derechos-de-los-artistas',
    standardWorkDayHrs: 10,
    standardLunchHrs: 1,
    minTurnaroundHrs: 11,
    holidayPayPct: 0.0,
    description: 'Spanish performers rights management society. Handles performer IP rights and residuals.',
  },
];

// ═════════════════════════════════════════════════════════════════════════
// DEPARTMENTS PER UNION (code → union code mapping built at runtime)
// ═════════════════════════════════════════════════════════════════════════
const DEPT_DEFS = {
  // ── Australia (MEAA covers crew, SPA covers performers) ──
  MEAA: [
    { code: 'CAM', name: 'Camera', sortOrder: 1 },
    { code: 'SND', name: 'Sound', sortOrder: 2 },
    { code: 'GRP', name: 'Grips', sortOrder: 3 },
    { code: 'ELC', name: 'Electrics', sortOrder: 4 },
    { code: 'ART', name: 'Art Department', sortOrder: 5 },
    { code: 'COS', name: 'Costume', sortOrder: 6 },
    { code: 'HMU', name: 'Hair & Makeup', sortOrder: 7 },
    { code: 'EDIT', name: 'Post Production', sortOrder: 8 },
    { code: 'PROD', name: 'Production Office', sortOrder: 9 },
    { code: 'AD', name: 'Assistant Directors', sortOrder: 10 },
    { code: 'LOC', name: 'Locations', sortOrder: 11 },
    { code: 'TRANS', name: 'Transport', sortOrder: 12 },
    { code: 'CONS', name: 'Construction', sortOrder: 13 },
    { code: 'PRP', name: 'Props', sortOrder: 14 },
    { code: 'VFX', name: 'Visual Effects', sortOrder: 15 },
  ],
  SPA: [
    { code: 'PRINC', name: 'Principal Performers', sortOrder: 1 },
    { code: 'SUPP', name: 'Supporting Artists', sortOrder: 2 },
    { code: 'STUNT', name: 'Stunt', sortOrder: 3 },
    { code: 'VOICE', name: 'Voice', sortOrder: 4 },
  ],
  // ── France ──
  CONVENTION_FR: [
    { code: 'REAL', name: 'Réalisation (Direction)', sortOrder: 1 },
    { code: 'IMG', name: 'Image (Camera)', sortOrder: 2 },
    { code: 'SON', name: 'Son (Sound)', sortOrder: 3 },
    { code: 'DEC', name: 'Décor (Art/Set)', sortOrder: 4 },
    { code: 'COS', name: 'Costumes', sortOrder: 5 },
    { code: 'MAQUI', name: 'Maquillage & Coiffure (HMU)', sortOrder: 6 },
    { code: 'MONT', name: 'Montage (Editing)', sortOrder: 7 },
    { code: 'PROD', name: 'Production', sortOrder: 8 },
    { code: 'REGIE', name: 'Régie (AD/Management)', sortOrder: 9 },
    { code: 'ELEC', name: 'Électricité (Lighting)', sortOrder: 10 },
    { code: 'MACH', name: 'Machinerie (Grips)', sortOrder: 11 },
    { code: 'ACC', name: 'Accessoires (Props)', sortOrder: 12 },
    { code: 'SCRIPT', name: 'Script / Scripte', sortOrder: 13 },
    { code: 'COMEDIA', name: 'Comédiens (Performers)', sortOrder: 14 },
    { code: 'CASCADE', name: 'Cascadeurs (Stunts)', sortOrder: 15 },
  ],
  // ── Germany (ver.di covers crew, BFFS covers performers) ──
  VERDI: [
    { code: 'KAMERA', name: 'Kamera (Camera)', sortOrder: 1 },
    { code: 'TON', name: 'Ton (Sound)', sortOrder: 2 },
    { code: 'BUHNE', name: 'Bühne / Szenenbild (Art)', sortOrder: 3 },
    { code: 'KOSTUM', name: 'Kostüm (Costume)', sortOrder: 4 },
    { code: 'MASKE', name: 'Maske (Makeup)', sortOrder: 5 },
    { code: 'LICHT', name: 'Licht (Lighting)', sortOrder: 6 },
    { code: 'SCHNITT', name: 'Schnitt (Editing)', sortOrder: 7 },
    { code: 'AUFNL', name: 'Aufnahmeleitung (AD)', sortOrder: 8 },
    { code: 'PROD', name: 'Produktion (Production)', sortOrder: 9 },
    { code: 'REQUI', name: 'Requisite (Props)', sortOrder: 10 },
    { code: 'TRANS', name: 'Transport', sortOrder: 11 },
    { code: 'BAU', name: 'Bau (Construction)', sortOrder: 12 },
  ],
  BFFS: [
    { code: 'HAUPT', name: 'Hauptdarsteller (Lead)', sortOrder: 1 },
    { code: 'NEBEN', name: 'Nebendarsteller (Supporting)', sortOrder: 2 },
    { code: 'KOMPARSE', name: 'Komparsen (Background)', sortOrder: 3 },
    { code: 'STUNT', name: 'Stunt', sortOrder: 4 },
    { code: 'STIMME', name: 'Stimme (Voice)', sortOrder: 5 },
  ],
  // ── Spain ──
  ALMA: [
    { code: 'CAM', name: 'Cámara (Camera)', sortOrder: 1 },
    { code: 'SON', name: 'Sonido (Sound)', sortOrder: 2 },
    { code: 'ARTE', name: 'Dirección Artística (Art)', sortOrder: 3 },
    { code: 'VEST', name: 'Vestuario (Costume)', sortOrder: 4 },
    { code: 'MAQUI', name: 'Maquillaje y Peluquería (HMU)', sortOrder: 5 },
    { code: 'ILUM', name: 'Iluminación (Lighting)', sortOrder: 6 },
    { code: 'MONT', name: 'Montaje (Editing)', sortOrder: 7 },
    { code: 'PROD', name: 'Producción (Production)', sortOrder: 8 },
    { code: 'AYUD', name: 'Ayudantes de Dirección (AD)', sortOrder: 9 },
    { code: 'ATREZ', name: 'Atrezzo (Props)', sortOrder: 10 },
    { code: 'TRANS', name: 'Transporte', sortOrder: 11 },
    { code: 'CONS', name: 'Construcción', sortOrder: 12 },
  ],
  AISGE: [
    { code: 'PROT', name: 'Protagonistas (Lead)', sortOrder: 1 },
    { code: 'SECUN', name: 'Secundarios (Supporting)', sortOrder: 2 },
    { code: 'FIGUR', name: 'Figuración (Background)', sortOrder: 3 },
    { code: 'DOBLE', name: 'Dobles de Acción (Stunts)', sortOrder: 4 },
    { code: 'VOZ', name: 'Doblaje / Voz (Voice)', sortOrder: 5 },
  ],
};

// ═════════════════════════════════════════════════════════════════════════
// DESIGNATIONS PER DEPARTMENT
// ═════════════════════════════════════════════════════════════════════════
const DESIG_DEFS = {
  // ── MEAA (AU crew) ──
  'MEAA.CAM': [
    { code: 'DOP', name: 'Director of Photography', level: 5 },
    { code: 'CAM_OP', name: 'Camera Operator', level: 4 },
    { code: '1AC', name: '1st Assistant Camera', level: 3 },
    { code: '2AC', name: '2nd Assistant Camera', level: 2 },
    { code: 'DIT', name: 'Digital Imaging Technician', level: 3 },
    { code: 'STEAD', name: 'Steadicam Operator', level: 4 },
  ],
  'MEAA.SND': [
    { code: 'PSM', name: 'Production Sound Mixer', level: 5 },
    { code: 'BOOM', name: 'Boom Operator', level: 3 },
    { code: 'SND_AST', name: 'Sound Assistant', level: 2 },
  ],
  'MEAA.GRP': [
    { code: 'KEY_GRP', name: 'Key Grip', level: 5 },
    { code: 'BB_GRP', name: 'Best Boy Grip', level: 4 },
    { code: 'GRP', name: 'Grip', level: 2 },
    { code: 'DLY_GRP', name: 'Dolly Grip', level: 3 },
  ],
  'MEAA.ELC': [
    { code: 'GAF', name: 'Gaffer', level: 5 },
    { code: 'BB_ELC', name: 'Best Boy Electric', level: 4 },
    { code: 'ELEC', name: 'Electrician', level: 2 },
  ],
  'MEAA.ART': [
    { code: 'PROD_DES', name: 'Production Designer', level: 5 },
    { code: 'ART_DIR', name: 'Art Director', level: 4 },
    { code: 'AST_AD', name: 'Assistant Art Director', level: 3 },
    { code: 'SET_DRS', name: 'Set Dresser', level: 2 },
    { code: 'GFX_ART', name: 'Graphic Artist', level: 3 },
  ],
  'MEAA.COS': [
    { code: 'COS_DES', name: 'Costume Designer', level: 5 },
    { code: 'COS_SUP', name: 'Costume Supervisor', level: 4 },
    { code: 'COSTUMER', name: 'Costumer', level: 2 },
  ],
  'MEAA.HMU': [
    { code: 'HOD_MU', name: 'Head of Makeup', level: 5 },
    { code: 'HOD_HAIR', name: 'Head of Hair', level: 5 },
    { code: 'MU_ART', name: 'Makeup Artist', level: 3 },
    { code: 'HAIR_ART', name: 'Hairstylist', level: 3 },
  ],
  'MEAA.EDIT': [
    { code: 'EDITOR', name: 'Editor', level: 5 },
    { code: 'AST_ED', name: 'Assistant Editor', level: 3 },
    { code: 'POST_SUP', name: 'Post Supervisor', level: 4 },
    { code: 'POST_COO', name: 'Post Coordinator', level: 2 },
  ],
  'MEAA.PROD': [
    { code: 'PM', name: 'Production Manager', level: 5 },
    { code: 'PC', name: 'Production Coordinator', level: 4 },
    { code: 'APC', name: 'Assistant Production Coordinator', level: 3 },
    { code: 'PA', name: 'Production Assistant', level: 1 },
    { code: 'PROD_ACC', name: 'Production Accountant', level: 4 },
  ],
  'MEAA.AD': [
    { code: '1AD', name: '1st Assistant Director', level: 5 },
    { code: '2AD', name: '2nd Assistant Director', level: 4 },
    { code: '3AD', name: '3rd Assistant Director', level: 3 },
  ],
  'MEAA.LOC': [
    { code: 'LOC_MGR', name: 'Location Manager', level: 5 },
    { code: 'AST_LOC', name: 'Assistant Location Manager', level: 3 },
    { code: 'LOC_SCT', name: 'Location Scout', level: 2 },
  ],
  'MEAA.TRANS': [
    { code: 'TRANS_COO', name: 'Transport Coordinator', level: 5 },
    { code: 'DRIVER', name: 'Driver', level: 2 },
  ],
  'MEAA.CONS': [
    { code: 'CONS_MGR', name: 'Construction Manager', level: 5 },
    { code: 'HOD_PAINT', name: 'Head Scenic Artist', level: 4 },
    { code: 'CARP', name: 'Carpenter', level: 2 },
  ],
  'MEAA.PRP': [
    { code: 'PROP_MST', name: 'Props Master', level: 5 },
    { code: 'AST_PRP', name: 'Props Buyer', level: 3 },
    { code: 'PRP_PER', name: 'Props Hand', level: 2 },
  ],
  'MEAA.VFX': [
    { code: 'VFX_SUP', name: 'VFX Supervisor', level: 5 },
    { code: 'VFX_COO', name: 'VFX Coordinator', level: 3 },
  ],
  // ── SPA (AU performers) ──
  'SPA.PRINC': [
    { code: 'LEAD', name: 'Lead Actor', level: 5 },
    { code: 'SUPP', name: 'Supporting Actor', level: 4 },
    { code: 'DAY_PLR', name: 'Day Player', level: 3 },
    { code: 'WK_PLR', name: 'Weekly Player', level: 3 },
  ],
  'SPA.SUPP': [
    { code: 'BG_ACT', name: 'Background Actor / Extra', level: 1 },
    { code: 'STAND_IN', name: 'Stand-In', level: 2 },
    { code: 'FEATURED', name: 'Featured Extra', level: 2 },
  ],
  'SPA.STUNT': [
    { code: 'STN_COO', name: 'Stunt Coordinator', level: 5 },
    { code: 'STN_PER', name: 'Stunt Performer', level: 3 },
  ],
  'SPA.VOICE': [
    { code: 'VO_ART', name: 'Voice-Over Artist', level: 3 },
    { code: 'ADR', name: 'ADR Artist', level: 3 },
  ],
  // ── CONVENTION_FR (French crew + performers) ──
  'CONVENTION_FR.REAL': [
    { code: 'REAL', name: 'Réalisateur (Director)', level: 5 },
    { code: '1ER_AST', name: '1er Assistant Réalisateur', level: 4 },
    { code: '2E_AST', name: '2e Assistant Réalisateur', level: 3 },
  ],
  'CONVENTION_FR.IMG': [
    { code: 'DOP', name: 'Directeur de la Photographie', level: 5 },
    { code: 'CADREUR', name: 'Cadreur (Camera Operator)', level: 4 },
    { code: '1AC', name: '1er Assistant Caméra', level: 3 },
    { code: '2AC', name: '2e Assistant Caméra', level: 2 },
    { code: 'DIT', name: 'Technicien Image Numérique', level: 3 },
  ],
  'CONVENTION_FR.SON': [
    { code: 'CHEF_SON', name: 'Chef Opérateur Son', level: 5 },
    { code: 'PERCH', name: 'Perchiste (Boom)', level: 3 },
    { code: 'AST_SON', name: 'Assistant Son', level: 2 },
  ],
  'CONVENTION_FR.DEC': [
    { code: 'CHEF_DEC', name: 'Chef Décorateur', level: 5 },
    { code: '1ER_AST_DEC', name: '1er Assistant Décorateur', level: 4 },
    { code: 'ENS', name: 'Ensemblier', level: 3 },
    { code: 'ACCESS', name: 'Accessoiriste', level: 3 },
  ],
  'CONVENTION_FR.COS': [
    { code: 'CHEF_COS', name: 'Chef Costumier', level: 5 },
    { code: 'COST', name: 'Costumier', level: 3 },
    { code: 'HAB', name: 'Habilleur', level: 2 },
  ],
  'CONVENTION_FR.MAQUI': [
    { code: 'CHEF_MAQ', name: 'Chef Maquilleur', level: 5 },
    { code: 'MAQ', name: 'Maquilleur', level: 3 },
    { code: 'CHEF_COIF', name: 'Chef Coiffeur', level: 5 },
    { code: 'COIF', name: 'Coiffeur', level: 3 },
  ],
  'CONVENTION_FR.MONT': [
    { code: 'CHEF_MONT', name: 'Chef Monteur', level: 5 },
    { code: 'AST_MONT', name: 'Assistant Monteur', level: 3 },
    { code: 'MONT_SON', name: 'Monteur Son', level: 4 },
  ],
  'CONVENTION_FR.PROD': [
    { code: 'DIR_PROD', name: 'Directeur de Production', level: 5 },
    { code: 'ADM_PROD', name: 'Administrateur de Production', level: 4 },
    { code: 'SEC_PROD', name: 'Secrétaire de Production', level: 3 },
    { code: 'COMP', name: 'Comptable (Accountant)', level: 4 },
  ],
  'CONVENTION_FR.REGIE': [
    { code: 'REG_GEN', name: 'Régisseur Général', level: 5 },
    { code: 'REG_ADJ', name: 'Régisseur Adjoint', level: 4 },
    { code: 'AST_REG', name: 'Assistant Régie', level: 2 },
  ],
  'CONVENTION_FR.ELEC': [
    { code: 'CHEF_ELEC', name: 'Chef Électricien (Gaffer)', level: 5 },
    { code: 'ELEC', name: 'Électricien', level: 2 },
  ],
  'CONVENTION_FR.MACH': [
    { code: 'CHEF_MACH', name: 'Chef Machiniste (Key Grip)', level: 5 },
    { code: 'MACH', name: 'Machiniste (Grip)', level: 2 },
  ],
  'CONVENTION_FR.ACC': [
    { code: 'CHEF_ACC', name: 'Chef Accessoiriste', level: 5 },
    { code: 'ACC', name: 'Accessoiriste', level: 3 },
  ],
  'CONVENTION_FR.SCRIPT': [
    { code: 'SCRIPTE', name: 'Scripte (Script Supervisor)', level: 4 },
  ],
  'CONVENTION_FR.COMEDIA': [
    { code: 'ROLE_1', name: 'Rôle Principal (Lead)', level: 5 },
    { code: 'ROLE_2', name: 'Rôle Secondaire (Supporting)', level: 4 },
    { code: 'FIGUR', name: 'Figurant (Extra)', level: 1 },
    { code: 'SILH', name: 'Silhouette (Featured Extra)', level: 2 },
  ],
  'CONVENTION_FR.CASCADE': [
    { code: 'COORD', name: 'Coordinateur Cascades', level: 5 },
    { code: 'CASC', name: 'Cascadeur', level: 3 },
  ],
  // ── VERDI (DE crew) ──
  'VERDI.KAMERA': [
    { code: 'DOP', name: 'Kameramann/frau (DOP)', level: 5 },
    { code: 'KAM_OP', name: 'Kameraoperator', level: 4 },
    { code: '1KAM_AST', name: '1. Kameraassistenz', level: 3 },
    { code: '2KAM_AST', name: '2. Kameraassistenz', level: 2 },
    { code: 'DIT', name: 'DIT', level: 3 },
  ],
  'VERDI.TON': [
    { code: 'TONM', name: 'Tonmeister', level: 5 },
    { code: 'ANGEL', name: 'Tonangel (Boom)', level: 3 },
    { code: 'TON_AST', name: 'Tonassistenz', level: 2 },
  ],
  'VERDI.BUHNE': [
    { code: 'SZB', name: 'Szenenbildner (Prod. Designer)', level: 5 },
    { code: 'ART_DIR', name: 'Art Director', level: 4 },
    { code: 'INNEN', name: 'Innenrequisiteur', level: 3 },
    { code: 'AUSSEN', name: 'Außenrequisiteur', level: 3 },
    { code: 'BUHNE_AST', name: 'Bühnenassistenz', level: 2 },
  ],
  'VERDI.KOSTUM': [
    { code: 'KOSTUM_B', name: 'Kostümbildner (Designer)', level: 5 },
    { code: 'KOSTUM_AST', name: 'Kostümassistenz', level: 3 },
    { code: 'GARDEROBE', name: 'Garderobier', level: 2 },
  ],
  'VERDI.MASKE': [
    { code: 'MASKE_B', name: 'Maskenbildner (HMU Head)', level: 5 },
    { code: 'MASKE_AST', name: 'Maskenassistenz', level: 3 },
  ],
  'VERDI.LICHT': [
    { code: 'OBERB', name: 'Oberbeleuchter (Gaffer)', level: 5 },
    { code: 'BELEUCHTER', name: 'Beleuchter (Electrician)', level: 2 },
    { code: 'BEST_BOY', name: 'Best Boy', level: 4 },
  ],
  'VERDI.SCHNITT': [
    { code: 'EDITOR', name: 'Cutter/in (Editor)', level: 5 },
    { code: 'AST_ED', name: 'Schnittassistenz', level: 3 },
  ],
  'VERDI.AUFNL': [
    { code: '1AUFNL', name: '1. Aufnahmeleiter (1st AD)', level: 5 },
    { code: '2AUFNL', name: '2. Aufnahmeleiter (2nd AD)', level: 4 },
    { code: 'SET_AUFNL', name: 'Set-Aufnahmeleiter', level: 3 },
  ],
  'VERDI.PROD': [
    { code: 'PROD_L', name: 'Produktionsleiter (PM)', level: 5 },
    { code: 'PROD_COO', name: 'Produktionskoordinator', level: 4 },
    { code: 'PROD_AST', name: 'Produktionsassistenz', level: 2 },
    { code: 'PROD_BUCH', name: 'Produktionsbuchhalter (Accountant)', level: 4 },
  ],
  'VERDI.REQUI': [
    { code: 'REQUI_M', name: 'Requisiteur (Props Master)', level: 5 },
    { code: 'REQUI_AST', name: 'Requisiten-Assistenz', level: 2 },
  ],
  'VERDI.TRANS': [
    { code: 'TRANS_L', name: 'Transportleiter', level: 5 },
    { code: 'FAHRER', name: 'Fahrer (Driver)', level: 2 },
  ],
  'VERDI.BAU': [
    { code: 'BAU_L', name: 'Bauleiter (Construction Mgr)', level: 5 },
    { code: 'SCHREINER', name: 'Schreiner (Carpenter)', level: 2 },
    { code: 'MALER', name: 'Maler (Scenic Artist)', level: 3 },
  ],
  // ── BFFS (DE performers) ──
  'BFFS.HAUPT': [
    { code: 'HAUPT', name: 'Hauptdarsteller (Lead)', level: 5 },
    { code: 'NEBENR', name: 'Nebenrolle (Supporting Lead)', level: 4 },
  ],
  'BFFS.NEBEN': [
    { code: 'TAGES', name: 'Tagesdarsteller (Day Player)', level: 3 },
    { code: 'WOCHEN', name: 'Wochendarsteller (Weekly)', level: 3 },
  ],
  'BFFS.KOMPARSE': [
    { code: 'KOMPARSE', name: 'Komparse (Background)', level: 1 },
    { code: 'KLEINDARST', name: 'Kleindarsteller (Featured Extra)', level: 2 },
  ],
  'BFFS.STUNT': [
    { code: 'STUNT_COORD', name: 'Stuntkoordinator', level: 5 },
    { code: 'STUNT_PER', name: 'Stuntdarsteller', level: 3 },
  ],
  'BFFS.STIMME': [
    { code: 'SYNC', name: 'Synchronsprecher (Voice)', level: 3 },
  ],
  // ── ALMA (ES crew) ──
  'ALMA.CAM': [
    { code: 'DOP', name: 'Director de Fotografía', level: 5 },
    { code: 'CAM_OP', name: 'Operador de Cámara', level: 4 },
    { code: '1AC', name: '1er Ayudante de Cámara', level: 3 },
    { code: '2AC', name: '2o Ayudante de Cámara', level: 2 },
    { code: 'DIT', name: 'DIT', level: 3 },
  ],
  'ALMA.SON': [
    { code: 'JEFE_SON', name: 'Jefe de Sonido', level: 5 },
    { code: 'MICRO', name: 'Microfonista (Boom)', level: 3 },
    { code: 'AST_SON', name: 'Auxiliar de Sonido', level: 2 },
  ],
  'ALMA.ARTE': [
    { code: 'DIR_ARTE', name: 'Director Artístico', level: 5 },
    { code: 'DEC', name: 'Decorador', level: 4 },
    { code: 'AST_ARTE', name: 'Ayudante de Dirección Artística', level: 3 },
  ],
  'ALMA.VEST': [
    { code: 'DIS_VEST', name: 'Diseñador de Vestuario', level: 5 },
    { code: 'VEST', name: 'Vestuarista', level: 3 },
    { code: 'SAST', name: 'Sastra', level: 2 },
  ],
  'ALMA.MAQUI': [
    { code: 'JEFE_MAQ', name: 'Jefe de Maquillaje', level: 5 },
    { code: 'MAQ', name: 'Maquillador/a', level: 3 },
    { code: 'JEFE_PEL', name: 'Jefe de Peluquería', level: 5 },
    { code: 'PEL', name: 'Peluquero/a', level: 3 },
  ],
  'ALMA.ILUM': [
    { code: 'JEFE_ELEC', name: 'Jefe Eléctrico (Gaffer)', level: 5 },
    { code: 'ELEC', name: 'Eléctrico', level: 2 },
  ],
  'ALMA.MONT': [
    { code: 'MONTADOR', name: 'Montador (Editor)', level: 5 },
    { code: 'AST_MONT', name: 'Ayudante de Montaje', level: 3 },
  ],
  'ALMA.PROD': [
    { code: 'DIR_PROD', name: 'Director de Producción', level: 5 },
    { code: 'JEFE_PROD', name: 'Jefe de Producción', level: 4 },
    { code: 'AUX_PROD', name: 'Auxiliar de Producción', level: 2 },
    { code: 'CONTABLE', name: 'Contable (Accountant)', level: 4 },
  ],
  'ALMA.AYUD': [
    { code: '1AYUD', name: '1er Ayudante de Dirección', level: 5 },
    { code: '2AYUD', name: '2o Ayudante de Dirección', level: 4 },
    { code: 'AUX_DIR', name: 'Auxiliar de Dirección', level: 2 },
  ],
  'ALMA.ATREZ': [
    { code: 'JEFE_ATREZ', name: 'Jefe de Atrezzo', level: 5 },
    { code: 'ATREZ', name: 'Atrecista', level: 3 },
  ],
  'ALMA.TRANS': [
    { code: 'JEFE_TRANS', name: 'Jefe de Transporte', level: 5 },
    { code: 'CONDUCTOR', name: 'Conductor (Driver)', level: 2 },
  ],
  'ALMA.CONS': [
    { code: 'JEFE_CONS', name: 'Jefe de Construcción', level: 5 },
    { code: 'CARP', name: 'Carpintero', level: 2 },
  ],
  // ── AISGE (ES performers) ──
  'AISGE.PROT': [
    { code: 'PROT', name: 'Protagonista (Lead)', level: 5 },
    { code: 'COPROT', name: 'Coprotagonista (Co-Lead)', level: 4 },
  ],
  'AISGE.SECUN': [
    { code: 'SECUN', name: 'Actor Secundario', level: 3 },
    { code: 'REPARTO', name: 'Reparto (Day Player)', level: 3 },
  ],
  'AISGE.FIGUR': [
    { code: 'FIGUR', name: 'Figurante (Extra)', level: 1 },
    { code: 'FIG_ESP', name: 'Figurante Especial (Featured)', level: 2 },
  ],
  'AISGE.DOBLE': [
    { code: 'COORD', name: 'Coordinador de Especialistas', level: 5 },
    { code: 'DOBLE', name: 'Doble de Acción', level: 3 },
  ],
  'AISGE.VOZ': [
    { code: 'DOBLADOR', name: 'Actor de Doblaje', level: 3 },
    { code: 'LOCUTOR', name: 'Locutor (Narrator)', level: 3 },
  ],
};

// ═════════════════════════════════════════════════════════════════════════
// BUDGET TIERS PER TERRITORY
// ═════════════════════════════════════════════════════════════════════════
const TIER_DEFS = {
  AU: [
    { code: 'AU_HIGH', name: 'High Budget (>$20M AUD)', productionType: 'feature_film', minBudget: 20000000, maxBudget: null, sortOrder: 1 },
    { code: 'AU_MED', name: 'Medium Budget ($5M-$20M)', productionType: 'feature_film', minBudget: 5000000, maxBudget: 20000000, sortOrder: 2 },
    { code: 'AU_LOW', name: 'Low Budget (<$5M)', productionType: 'feature_film', minBudget: 0, maxBudget: 5000000, sortOrder: 3 },
    { code: 'AU_TV_HIGH', name: 'TV Drama High', productionType: 'tv_drama', minBudget: 3000000, maxBudget: null, sortOrder: 4 },
    { code: 'AU_TV_LOW', name: 'TV Drama Low', productionType: 'tv_drama', minBudget: 0, maxBudget: 3000000, sortOrder: 5 },
  ],
  FR: [
    { code: 'FR_HIGH', name: 'Gros Budget (>€15M)', productionType: 'feature_film', minBudget: 15000000, maxBudget: null, sortOrder: 1 },
    { code: 'FR_MED', name: 'Budget Moyen (€4M-€15M)', productionType: 'feature_film', minBudget: 4000000, maxBudget: 15000000, sortOrder: 2 },
    { code: 'FR_LOW', name: 'Petit Budget (<€4M)', productionType: 'feature_film', minBudget: 0, maxBudget: 4000000, sortOrder: 3 },
    { code: 'FR_TV', name: 'Fiction TV', productionType: 'tv_drama', minBudget: 0, maxBudget: null, sortOrder: 4 },
  ],
  DE: [
    { code: 'DE_HIGH', name: 'Großproduktion (>€10M)', productionType: 'feature_film', minBudget: 10000000, maxBudget: null, sortOrder: 1 },
    { code: 'DE_MED', name: 'Mittelbudget (€3M-€10M)', productionType: 'feature_film', minBudget: 3000000, maxBudget: 10000000, sortOrder: 2 },
    { code: 'DE_LOW', name: 'Kleinbudget (<€3M)', productionType: 'feature_film', minBudget: 0, maxBudget: 3000000, sortOrder: 3 },
    { code: 'DE_TV', name: 'TV/Streaming', productionType: 'tv_drama', minBudget: 0, maxBudget: null, sortOrder: 4 },
  ],
  ES: [
    { code: 'ES_HIGH', name: 'Alto Presupuesto (>€8M)', productionType: 'feature_film', minBudget: 8000000, maxBudget: null, sortOrder: 1 },
    { code: 'ES_MED', name: 'Presupuesto Medio (€2M-€8M)', productionType: 'feature_film', minBudget: 2000000, maxBudget: 8000000, sortOrder: 2 },
    { code: 'ES_LOW', name: 'Bajo Presupuesto (<€2M)', productionType: 'feature_film', minBudget: 0, maxBudget: 2000000, sortOrder: 3 },
    { code: 'ES_TV', name: 'TV/Serie', productionType: 'tv_drama', minBudget: 0, maxBudget: null, sortOrder: 4 },
  ],
};

// ═════════════════════════════════════════════════════════════════════════
// BASE WEEKLY RATES PER DESIGNATION (HIGH tier) — used to generate rate cards
// Currency: AUD for AU, EUR for FR/DE/ES
// ═════════════════════════════════════════════════════════════════════════
const WEEKLY_RATES = {
  // ── AU (AUD) — MEAA MPPA rates 2024 ──
  'MEAA.CAM.DOP': 6200, 'MEAA.CAM.CAM_OP': 4800, 'MEAA.CAM.1AC': 3800,
  'MEAA.CAM.2AC': 3000, 'MEAA.CAM.DIT': 4000, 'MEAA.CAM.STEAD': 5200,
  'MEAA.SND.PSM': 4800, 'MEAA.SND.BOOM': 3200, 'MEAA.SND.SND_AST': 2600,
  'MEAA.GRP.KEY_GRP': 4400, 'MEAA.GRP.BB_GRP': 3600, 'MEAA.GRP.GRP': 2800, 'MEAA.GRP.DLY_GRP': 3200,
  'MEAA.ELC.GAF': 4600, 'MEAA.ELC.BB_ELC': 3800, 'MEAA.ELC.ELEC': 2800,
  'MEAA.ART.PROD_DES': 6500, 'MEAA.ART.ART_DIR': 4800, 'MEAA.ART.AST_AD': 3500, 'MEAA.ART.SET_DRS': 2800, 'MEAA.ART.GFX_ART': 3200,
  'MEAA.COS.COS_DES': 5200, 'MEAA.COS.COS_SUP': 3800, 'MEAA.COS.COSTUMER': 2600,
  'MEAA.HMU.HOD_MU': 4600, 'MEAA.HMU.HOD_HAIR': 4600, 'MEAA.HMU.MU_ART': 3200, 'MEAA.HMU.HAIR_ART': 3200,
  'MEAA.EDIT.EDITOR': 5000, 'MEAA.EDIT.AST_ED': 3200, 'MEAA.EDIT.POST_SUP': 4500, 'MEAA.EDIT.POST_COO': 2800,
  'MEAA.PROD.PM': 5500, 'MEAA.PROD.PC': 3800, 'MEAA.PROD.APC': 2800, 'MEAA.PROD.PA': 1800, 'MEAA.PROD.PROD_ACC': 4800,
  'MEAA.AD.1AD': 5200, 'MEAA.AD.2AD': 3800, 'MEAA.AD.3AD': 2600,
  'MEAA.LOC.LOC_MGR': 4500, 'MEAA.LOC.AST_LOC': 3200, 'MEAA.LOC.LOC_SCT': 2600,
  'MEAA.TRANS.TRANS_COO': 3800, 'MEAA.TRANS.DRIVER': 2400,
  'MEAA.CONS.CONS_MGR': 4800, 'MEAA.CONS.HOD_PAINT': 3800, 'MEAA.CONS.CARP': 2800,
  'MEAA.PRP.PROP_MST': 4200, 'MEAA.PRP.AST_PRP': 3000, 'MEAA.PRP.PRP_PER': 2400,
  'MEAA.VFX.VFX_SUP': 6000, 'MEAA.VFX.VFX_COO': 3500,
  // SPA (AU performers, AUD)
  'SPA.PRINC.LEAD': 8500, 'SPA.PRINC.SUPP': 5500, 'SPA.PRINC.DAY_PLR': 5000, 'SPA.PRINC.WK_PLR': 4200,
  'SPA.SUPP.BG_ACT': 1400, 'SPA.SUPP.STAND_IN': 1600, 'SPA.SUPP.FEATURED': 1800,
  'SPA.STUNT.STN_COO': 7000, 'SPA.STUNT.STN_PER': 5500,
  'SPA.VOICE.VO_ART': 4500, 'SPA.VOICE.ADR': 3800,
  // ── FR (EUR) — Convention Collective rates 2024 ──
  'CONVENTION_FR.REAL.REAL': 8000, 'CONVENTION_FR.REAL.1ER_AST': 4500, 'CONVENTION_FR.REAL.2E_AST': 3000,
  'CONVENTION_FR.IMG.DOP': 5800, 'CONVENTION_FR.IMG.CADREUR': 4200, 'CONVENTION_FR.IMG.1AC': 3200, 'CONVENTION_FR.IMG.2AC': 2400, 'CONVENTION_FR.IMG.DIT': 3500,
  'CONVENTION_FR.SON.CHEF_SON': 4500, 'CONVENTION_FR.SON.PERCH': 2800, 'CONVENTION_FR.SON.AST_SON': 2200,
  'CONVENTION_FR.DEC.CHEF_DEC': 5500, 'CONVENTION_FR.DEC.1ER_AST_DEC': 3800, 'CONVENTION_FR.DEC.ENS': 3200, 'CONVENTION_FR.DEC.ACCESS': 2800,
  'CONVENTION_FR.COS.CHEF_COS': 4500, 'CONVENTION_FR.COS.COST': 3000, 'CONVENTION_FR.COS.HAB': 2200,
  'CONVENTION_FR.MAQUI.CHEF_MAQ': 4200, 'CONVENTION_FR.MAQUI.MAQ': 3000, 'CONVENTION_FR.MAQUI.CHEF_COIF': 4200, 'CONVENTION_FR.MAQUI.COIF': 3000,
  'CONVENTION_FR.MONT.CHEF_MONT': 4800, 'CONVENTION_FR.MONT.AST_MONT': 2800, 'CONVENTION_FR.MONT.MONT_SON': 4200,
  'CONVENTION_FR.PROD.DIR_PROD': 5500, 'CONVENTION_FR.PROD.ADM_PROD': 4000, 'CONVENTION_FR.PROD.SEC_PROD': 2800, 'CONVENTION_FR.PROD.COMP': 4000,
  'CONVENTION_FR.REGIE.REG_GEN': 4500, 'CONVENTION_FR.REGIE.REG_ADJ': 3200, 'CONVENTION_FR.REGIE.AST_REG': 2200,
  'CONVENTION_FR.ELEC.CHEF_ELEC': 4200, 'CONVENTION_FR.ELEC.ELEC': 2600,
  'CONVENTION_FR.MACH.CHEF_MACH': 4000, 'CONVENTION_FR.MACH.MACH': 2600,
  'CONVENTION_FR.ACC.CHEF_ACC': 3800, 'CONVENTION_FR.ACC.ACC': 2600,
  'CONVENTION_FR.SCRIPT.SCRIPTE': 3800,
  'CONVENTION_FR.COMEDIA.ROLE_1': 7500, 'CONVENTION_FR.COMEDIA.ROLE_2': 4500, 'CONVENTION_FR.COMEDIA.FIGUR': 800, 'CONVENTION_FR.COMEDIA.SILH': 1200,
  'CONVENTION_FR.CASCADE.COORD': 5500, 'CONVENTION_FR.CASCADE.CASC': 4000,
  // ── DE (EUR) — ver.di/Produzentenallianz rates 2024 ──
  'VERDI.KAMERA.DOP': 5500, 'VERDI.KAMERA.KAM_OP': 4000, 'VERDI.KAMERA.1KAM_AST': 3000, 'VERDI.KAMERA.2KAM_AST': 2400, 'VERDI.KAMERA.DIT': 3200,
  'VERDI.TON.TONM': 4200, 'VERDI.TON.ANGEL': 2600, 'VERDI.TON.TON_AST': 2000,
  'VERDI.BUHNE.SZB': 5500, 'VERDI.BUHNE.ART_DIR': 4000, 'VERDI.BUHNE.INNEN': 2800, 'VERDI.BUHNE.AUSSEN': 2800, 'VERDI.BUHNE.BUHNE_AST': 2200,
  'VERDI.KOSTUM.KOSTUM_B': 4500, 'VERDI.KOSTUM.KOSTUM_AST': 2800, 'VERDI.KOSTUM.GARDEROBE': 2200,
  'VERDI.MASKE.MASKE_B': 4200, 'VERDI.MASKE.MASKE_AST': 2800,
  'VERDI.LICHT.OBERB': 4000, 'VERDI.LICHT.BELEUCHTER': 2400, 'VERDI.LICHT.BEST_BOY': 3200,
  'VERDI.SCHNITT.EDITOR': 4500, 'VERDI.SCHNITT.AST_ED': 2600,
  'VERDI.AUFNL.1AUFNL': 4800, 'VERDI.AUFNL.2AUFNL': 3500, 'VERDI.AUFNL.SET_AUFNL': 2800,
  'VERDI.PROD.PROD_L': 5200, 'VERDI.PROD.PROD_COO': 3500, 'VERDI.PROD.PROD_AST': 2200, 'VERDI.PROD.PROD_BUCH': 4000,
  'VERDI.REQUI.REQUI_M': 3800, 'VERDI.REQUI.REQUI_AST': 2400,
  'VERDI.TRANS.TRANS_L': 3500, 'VERDI.TRANS.FAHRER': 2200,
  'VERDI.BAU.BAU_L': 4200, 'VERDI.BAU.SCHREINER': 2600, 'VERDI.BAU.MALER': 3000,
  // BFFS (DE performers, EUR)
  'BFFS.HAUPT.HAUPT': 7000, 'BFFS.HAUPT.NEBENR': 4500,
  'BFFS.NEBEN.TAGES': 1400, 'BFFS.NEBEN.WOCHEN': 3500,
  'BFFS.KOMPARSE.KOMPARSE': 600, 'BFFS.KOMPARSE.KLEINDARST': 900,
  'BFFS.STUNT.STUNT_COORD': 5500, 'BFFS.STUNT.STUNT_PER': 4000,
  'BFFS.STIMME.SYNC': 3000,
  // ── ES (EUR) — Convenio Colectivo rates 2024 ──
  'ALMA.CAM.DOP': 4800, 'ALMA.CAM.CAM_OP': 3500, 'ALMA.CAM.1AC': 2600, 'ALMA.CAM.2AC': 2000, 'ALMA.CAM.DIT': 2800,
  'ALMA.SON.JEFE_SON': 3800, 'ALMA.SON.MICRO': 2200, 'ALMA.SON.AST_SON': 1800,
  'ALMA.ARTE.DIR_ARTE': 4800, 'ALMA.ARTE.DEC': 3500, 'ALMA.ARTE.AST_ARTE': 2400,
  'ALMA.VEST.DIS_VEST': 4000, 'ALMA.VEST.VEST': 2600, 'ALMA.VEST.SAST': 2000,
  'ALMA.MAQUI.JEFE_MAQ': 3800, 'ALMA.MAQUI.MAQ': 2600, 'ALMA.MAQUI.JEFE_PEL': 3800, 'ALMA.MAQUI.PEL': 2600,
  'ALMA.ILUM.JEFE_ELEC': 3600, 'ALMA.ILUM.ELEC': 2200,
  'ALMA.MONT.MONTADOR': 4000, 'ALMA.MONT.AST_MONT': 2400,
  'ALMA.PROD.DIR_PROD': 4800, 'ALMA.PROD.JEFE_PROD': 3500, 'ALMA.PROD.AUX_PROD': 1800, 'ALMA.PROD.CONTABLE': 3500,
  'ALMA.AYUD.1AYUD': 4200, 'ALMA.AYUD.2AYUD': 3000, 'ALMA.AYUD.AUX_DIR': 2000,
  'ALMA.ATREZ.JEFE_ATREZ': 3500, 'ALMA.ATREZ.ATREZ': 2400,
  'ALMA.TRANS.JEFE_TRANS': 3200, 'ALMA.TRANS.CONDUCTOR': 2000,
  'ALMA.CONS.JEFE_CONS': 3800, 'ALMA.CONS.CARP': 2200,
  // AISGE (ES performers, EUR)
  'AISGE.PROT.PROT': 6000, 'AISGE.PROT.COPROT': 4000,
  'AISGE.SECUN.SECUN': 2800, 'AISGE.SECUN.REPARTO': 1200,
  'AISGE.FIGUR.FIGUR': 500, 'AISGE.FIGUR.FIG_ESP': 800,
  'AISGE.DOBLE.COORD': 5000, 'AISGE.DOBLE.DOBLE': 3500,
  'AISGE.VOZ.DOBLADOR': 2500, 'AISGE.VOZ.LOCUTOR': 2500,
};

// Tier multipliers
const TIER_MULTS = {
  AU_HIGH: 1.0, AU_MED: 0.85, AU_LOW: 0.70, AU_TV_HIGH: 0.95, AU_TV_LOW: 0.78,
  FR_HIGH: 1.0, FR_MED: 0.85, FR_LOW: 0.68, FR_TV: 0.82,
  DE_HIGH: 1.0, DE_MED: 0.85, DE_LOW: 0.68, DE_TV: 0.82,
  ES_HIGH: 1.0, ES_MED: 0.82, ES_LOW: 0.65, ES_TV: 0.78,
};

// ═════════════════════════════════════════════════════════════════════════
// PRODUCTIONS (one per territory)
// ═════════════════════════════════════════════════════════════════════════
const PRODUCTIONS = [
  {
    name: 'Outback Echoes',
    code: 'OE-2026',
    productionType: 'feature_film',
    country: 'AU',
    budget: 12000000,
    currency: 'AUD',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-10-15'),
    status: 'pre_production',
    companyName: 'Southern Cross Films Pty Ltd',
    companyAddress: '42 Fox Studios Drive, Moore Park, NSW 2021, Australia',
  },
  {
    name: 'Les Ombres de Montmartre',
    code: 'LOM-2026',
    productionType: 'feature_film',
    country: 'FR',
    budget: 8000000,
    currency: 'EUR',
    startDate: new Date('2026-05-15'),
    endDate: new Date('2026-09-30'),
    status: 'pre_production',
    companyName: 'Lumière Productions SARL',
    companyAddress: '15 Rue du Faubourg Saint-Honoré, 75008 Paris, France',
  },
  {
    name: 'Berliner Nächte',
    code: 'BN-2026',
    productionType: 'tv_drama',
    country: 'DE',
    budget: 6000000,
    currency: 'EUR',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-12-15'),
    status: 'pre_production',
    companyName: 'Babelsberg Studios GmbH',
    companyAddress: 'August-Bebel-Str. 26-53, 14482 Potsdam, Germany',
  },
  {
    name: 'Sombras de Madrid',
    code: 'SM-2026',
    productionType: 'feature_film',
    country: 'ES',
    budget: 5000000,
    currency: 'EUR',
    startDate: new Date('2026-06-15'),
    endDate: new Date('2026-10-30'),
    status: 'pre_production',
    companyName: 'Iberia Cine S.L.',
    companyAddress: 'Calle Gran Vía 28, 28013 Madrid, Spain',
  },
];

// ═════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log('Connected to MongoDB');

  // ── 1. Seed Unions ──
  console.log('\n=== Seeding International Unions ===');
  const unionMap = {}; // code → _id
  for (const u of INTL_UNIONS) {
    const existing = await db.collection('unions').findOne({ code: u.code });
    if (existing) {
      console.log(`  Union ${u.code} already exists (${existing._id})`);
      unionMap[u.code] = existing._id;
    } else {
      const res = await db.collection('unions').insertOne({ ...u, isActive: true, createdAt: new Date(), updatedAt: new Date() });
      console.log(`  Created union ${u.code} → ${res.insertedId}`);
      unionMap[u.code] = res.insertedId;
    }
  }

  // ── 2. Seed Departments ──
  console.log('\n=== Seeding Departments ===');
  const deptMap = {}; // "UNION.DEPT" → _id
  for (const [unionCode, depts] of Object.entries(DEPT_DEFS)) {
    const unionId = unionMap[unionCode];
    if (!unionId) { console.log(`  SKIP: no union for ${unionCode}`); continue; }
    for (const d of depts) {
      const key = `${unionCode}.${d.code}`;
      const existing = await db.collection('departments').findOne({ unionId, code: d.code });
      if (existing) {
        deptMap[key] = existing._id;
      } else {
        const res = await db.collection('departments').insertOne({
          unionId, name: d.name, code: d.code, sortOrder: d.sortOrder,
          isActive: true, createdAt: new Date(), updatedAt: new Date(),
        });
        deptMap[key] = res.insertedId;
      }
    }
    console.log(`  ${unionCode}: ${depts.length} departments`);
  }

  // ── 3. Seed Designations ──
  console.log('\n=== Seeding Designations ===');
  const desigMap = {}; // "UNION.DEPT.DESIG" → _id
  let desigCount = 0;
  for (const [deptKey, desigs] of Object.entries(DESIG_DEFS)) {
    const deptId = deptMap[deptKey];
    if (!deptId) { console.log(`  SKIP: no dept for ${deptKey}`); continue; }
    for (const ds of desigs) {
      const fullKey = `${deptKey}.${ds.code}`;
      const existing = await db.collection('designations').findOne({ departmentId: deptId, code: ds.code });
      if (existing) {
        desigMap[fullKey] = existing._id;
      } else {
        const res = await db.collection('designations').insertOne({
          departmentId: deptId, name: ds.name, code: ds.code, level: ds.level,
          isActive: true, createdAt: new Date(), updatedAt: new Date(),
        });
        desigMap[fullKey] = res.insertedId;
        desigCount++;
      }
    }
  }
  console.log(`  Created ${desigCount} designations total`);

  // ── 4. Seed Budget Tiers ──
  console.log('\n=== Seeding Budget Tiers ===');
  const tierMap = {}; // code → _id
  for (const [country, tiers] of Object.entries(TIER_DEFS)) {
    for (const t of tiers) {
      const existing = await db.collection('budgettiers').findOne({ code: t.code });
      if (existing) {
        tierMap[t.code] = existing._id;
      } else {
        // Find any union for this country to attach tier to
        const anyUnion = await db.collection('unions').findOne({ country });
        const res = await db.collection('budgettiers').insertOne({
          unionId: anyUnion?._id || null,
          name: t.name, code: t.code, productionType: t.productionType,
          minBudget: t.minBudget, maxBudget: t.maxBudget,
          country, sortOrder: t.sortOrder, isActive: true,
          createdAt: new Date(), updatedAt: new Date(),
        });
        tierMap[t.code] = res.insertedId;
      }
    }
    console.log(`  ${country}: ${tiers.length} budget tiers`);
  }

  // ── 5. Seed Rate Cards ──
  console.log('\n=== Seeding Rate Cards ===');
  const rateCards = [];

  for (const [rateKey, weeklyBase] of Object.entries(WEEKLY_RATES)) {
    // rateKey = "UNION.DEPT.DESIG"
    const parts = rateKey.split('.');
    const unionCode = parts[0];
    const deptCode = parts[1];
    const desigCode = parts[2];

    const unionId = unionMap[unionCode];
    const deptId = deptMap[`${unionCode}.${deptCode}`];
    const desigId = desigMap[rateKey];

    if (!unionId || !deptId || !desigId) {
      console.log(`  SKIP rate card: missing ref for ${rateKey}`);
      continue;
    }

    // Determine country from union
    const union = INTL_UNIONS.find(u => u.code === unionCode);
    const country = union?.country;
    const countryTiers = TIER_DEFS[country] || [];

    for (const tier of countryTiers) {
      const tierId = tierMap[tier.code];
      if (!tierId) continue;
      const mult = TIER_MULTS[tier.code] || 1.0;
      const weekly = r2(weeklyBase * mult);
      const daily = r2(weekly / 5);
      const hoursPerDay = 10;
      const hourly = r2(daily / hoursPerDay);

      rateCards.push({
        unionId, departmentId: deptId, designationId: desigId, budgetTierId: tierId,
        dealType: '50hr_week',
        guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: hoursPerDay,
        effectiveFrom, effectiveTo: null,
        weeklyRate: weekly, dailyRate: daily, hourlyRate: hourly,
        overtimeRate1x5: r2(hourly * 1.5), overtimeRate2x: r2(hourly * 2),
        sixthDayRate: r2(daily * 1.5), seventhDayRate: r2(daily * 2),
        nightPremiumPct: 10,
        holidayPayInclusive: false, isVerified: false, isActive: true,
        sourceDocument: `${country} Union Scale Rates 2024`,
        notes: null,
      });
    }
  }

  // Delete existing intl rate cards
  const intlUnionIds = Object.values(unionMap);
  const deleted = await db.collection('ratecards').deleteMany({ unionId: { $in: intlUnionIds } });
  console.log(`  Deleted ${deleted.deletedCount} existing intl rate cards`);

  if (rateCards.length > 0) {
    const res = await db.collection('ratecards').insertMany(rateCards);
    console.log(`  Inserted ${res.insertedCount} rate cards`);
  }

  // Summary
  for (const [code, id] of Object.entries(unionMap)) {
    const count = await db.collection('ratecards').countDocuments({ unionId: id });
    console.log(`  ${code}: ${count} rate cards`);
  }

  // ── 6. Seed Productions ──
  console.log('\n=== Seeding Productions ===');
  for (const p of PRODUCTIONS) {
    const existing = await db.collection('productions').findOne({ code: p.code });
    if (existing) {
      console.log(`  Production ${p.code} already exists`);
    } else {
      const res = await db.collection('productions').insertOne({
        ...p,
        members: [{ userId: OID(ADMIN_ID), role: 'producer', joinedAt: new Date() }],
        createdBy: OID(ADMIN_ID),
        schemaVersion: 1,
        createdAt: new Date(), updatedAt: new Date(),
      });
      console.log(`  Created production "${p.name}" (${p.country}) → ${res.insertedId}`);
    }
  }

  // ── Final Summary ──
  console.log('\n=== Summary ===');
  for (const country of ['AU', 'FR', 'DE', 'ES']) {
    const unions = await db.collection('unions').countDocuments({ country });
    const prods = await db.collection('productions').countDocuments({ country });
    console.log(`  ${country}: ${unions} unions, ${prods} productions`);
  }
  const totalRC = await db.collection('ratecards').countDocuments({});
  console.log(`  Total rate cards in system: ${totalRC}`);

  await mongoose.disconnect();
  console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });
