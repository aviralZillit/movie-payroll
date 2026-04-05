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
} from '../controllers/dealMemoController.js';
import { upload } from '../middleware/upload.js';
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
// Crew self-completion of their fields (NI, bank, etc.)
router.patch('/:id/crew-complete', crewComplete);

// Document upload, download, signing
router.post('/:id/documents/:docIndex/upload', upload.single('file'), uploadDocument);
router.get('/:id/documents/:docIndex/download', downloadDocument);
router.post('/:id/documents/:docIndex/sign', signDocument);

// Approval chain
router.get('/pending-approvals', getPendingApprovals);
router.patch('/:id/approve', approveDealMemo);
router.patch('/:id/reject-approval', rejectApproval);

// Transition is open to all authenticated roles; fine-grained checks are in the controller
router.patch(
  '/:id/transition',
  authorize('super_admin', 'payroll_admin', 'production_accountant', 'department_head', 'crew_member'),
  transitionStatus
);

export default router;
