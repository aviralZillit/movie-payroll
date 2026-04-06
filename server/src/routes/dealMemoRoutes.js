import { Router } from 'express';
import {
  create,
  update,
  getAll,
  getById,
  getByProduction,
  getMyDeals,
  transitionStatus,
  crewComplete,
  uploadDocument,
  downloadDocument,
  signDocument,
  getPendingApprovals,
  approveDealMemo,
  rejectApproval,
  toggleComplianceItem,
} from '../controllers/dealMemoController.js';
import { upload } from '../middleware/upload.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(auth);

// Static routes MUST come before parameterized /:id routes
router.get('/my-deals', getMyDeals);
router.get('/pending-approvals', getPendingApprovals);
router.get('/production/:productionId', getByProduction);
router.get('/', getAll);

router.post(
  '/',
  authorize('super_admin', 'payroll_admin', 'production_accountant'),
  create
);

// Parameterized routes (/:id)
router.get('/:id', getById);
router.put(
  '/:id',
  authorize('super_admin', 'payroll_admin', 'production_accountant'),
  update
);
router.patch('/:id/crew-complete', crewComplete);
router.patch('/:id/approve', approveDealMemo);
router.patch('/:id/reject-approval', rejectApproval);
router.patch('/:id/compliance/:itemIndex/toggle', toggleComplianceItem);
router.patch(
  '/:id/transition',
  authorize('super_admin', 'payroll_admin', 'production_accountant', 'department_head', 'crew_member'),
  transitionStatus
);

// Document upload, download, signing
router.post('/:id/documents/:docIndex/upload', upload.single('file'), uploadDocument);
router.get('/:id/documents/:docIndex/download', downloadDocument);
router.post('/:id/documents/:docIndex/sign', signDocument);

export default router;
