import { Router } from 'express';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  exportRateCards,
  exportTimecards,
  exportDealMemos,
  exportPayroll,
} from '../controllers/exportController.js';

const router = Router();

// All export routes require authentication
router.use(auth);

// Rate cards — any authenticated user
router.get('/rate-cards', exportRateCards);

// Timecards — admin, production_accountant, department_head
router.get(
  '/timecards',
  authorize('super_admin', 'payroll_admin', 'production_accountant', 'department_head'),
  exportTimecards
);

// Deal memos — admin, production_accountant
router.get(
  '/deal-memos',
  authorize('super_admin', 'payroll_admin', 'production_accountant'),
  exportDealMemos
);

// Payroll run — admin, payroll_admin
router.get(
  '/payroll/:runId',
  authorize('super_admin', 'payroll_admin'),
  exportPayroll
);

export default router;
