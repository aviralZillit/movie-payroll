import { Router } from 'express';
import { createDispute, getDisputes, getDisputeById, updateDispute, addComment } from '../controllers/disputeController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();
router.use(auth);

router.post('/', createDispute);
router.get('/', getDisputes);
router.get('/:id', getDisputeById);
router.patch('/:id', authorize('super_admin', 'payroll_admin', 'production_accountant'), updateDispute);
router.post('/:id/comments', addComment);

export default router;
