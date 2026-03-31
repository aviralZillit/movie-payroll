import { Router } from 'express';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  importRateCards,
  importTimecards,
} from '../controllers/importController.js';

const router = Router();

// All import routes require authentication
router.use(auth);

// Rate cards — super_admin, payroll_admin only
router.post(
  '/rate-cards',
  authorize('super_admin', 'payroll_admin'),
  importRateCards
);

// Timecards — admin, production_accountant
router.post(
  '/timecards',
  authorize('super_admin', 'payroll_admin', 'production_accountant'),
  importTimecards
);

export default router;
