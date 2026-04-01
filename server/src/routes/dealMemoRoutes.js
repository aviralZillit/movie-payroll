import { Router } from 'express';
import {
  create,
  update,
  getAll,
  getById,
  getByProduction,
  getMyDeals,
  transitionStatus,
} from '../controllers/dealMemoController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(auth);

router.get('/my-deals', getMyDeals);
router.get('/', getAll);
router.get('/:id', getById);
router.get('/production/:productionId', getByProduction);
router.post(
  '/',
  authorize('super_admin', 'payroll_admin', 'production_accountant'),
  create
);
router.put(
  '/:id',
  authorize('super_admin', 'payroll_admin', 'production_accountant'),
  update
);
// Transition is open to all authenticated roles; fine-grained checks are in the controller
router.patch(
  '/:id/transition',
  authorize('super_admin', 'payroll_admin', 'production_accountant', 'department_head', 'crew_member'),
  transitionStatus
);

export default router;
