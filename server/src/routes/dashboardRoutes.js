import { Router } from 'express';
import { getOverview, getProductionDashboard } from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(auth);

router.get(
  '/overview',
  authorize('super_admin', 'payroll_admin', 'production_accountant'),
  getOverview
);
router.get(
  '/production/:productionId',
  authorize('super_admin', 'payroll_admin', 'production_accountant', 'department_head'),
  getProductionDashboard
);

export default router;
