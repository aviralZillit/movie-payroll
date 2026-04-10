import { Router } from 'express';
import {
  create,
  updateEntries,
  calculate,
  submit,
  deptApprove,
  payrollApprove,
  reject,
  getAll,
  getById,
  getMyTimecards,
  getApprovals,
  assignTimecard,
  amendEntry,
} from '../controllers/timecardController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(auth);

router.get('/my-timecards', getMyTimecards);
router.get('/approvals', authorize('super_admin', 'payroll_admin', 'production_accountant', 'department_head'), getApprovals);
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id/entries', updateEntries);
router.post('/:id/calculate', calculate);
router.patch('/:id/submit', submit);
router.patch('/:id/dept-approve', authorize('super_admin', 'payroll_admin', 'production_accountant', 'department_head'), deptApprove);
router.patch('/:id/payroll-approve', authorize('super_admin', 'payroll_admin', 'production_accountant'), payrollApprove);
router.patch('/:id/reject', authorize('super_admin', 'payroll_admin', 'production_accountant', 'department_head'), reject);
router.patch('/:id/assign', assignTimecard);
router.patch('/:id/amend-entry', amendEntry);

export default router;
