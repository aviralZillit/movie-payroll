import { Router } from 'express';
import {
  createRun,
  calculateRun,
  approveRun,
  exportRun,
  markPaid,
  getAll,
  getById,
  getPayslip,
} from '../controllers/payrollController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(auth);

router.get('/', getAll);
router.get('/:id', getById);
router.get('/:id/payslip/:itemIndex', getPayslip);
router.post('/', authorize('super_admin', 'payroll_admin', 'production_accountant'), createRun);
router.post('/:id/calculate', authorize('super_admin', 'payroll_admin', 'production_accountant'), calculateRun);
router.patch('/:id/approve', authorize('super_admin', 'payroll_admin'), approveRun);
router.patch('/:id/export', authorize('super_admin', 'payroll_admin'), exportRun);
router.patch('/:id/mark-paid', authorize('super_admin', 'payroll_admin'), markPaid);

export default router;
