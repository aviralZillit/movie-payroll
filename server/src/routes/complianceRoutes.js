import { Router } from 'express';
import { getCards, getChecklist, getOutstanding } from '../controllers/complianceController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);
router.get('/cards', getCards);
router.get('/checklist', getChecklist);
router.get('/outstanding', getOutstanding);

export default router;
