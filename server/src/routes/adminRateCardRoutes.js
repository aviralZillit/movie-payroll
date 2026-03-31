import { Router } from 'express';
import {
  getAllRateCards,
  getRateCardsSummary,
  updateRateCard,
  createRateCard,
} from '../controllers/adminRateCardController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// All admin rate card routes require authentication + admin role
router.use(auth);
router.use(authorize('super_admin', 'payroll_admin'));

router.get('/', getAllRateCards);
router.get('/summary', getRateCardsSummary);
router.put('/:id', updateRateCard);
router.post('/', createRateCard);

export default router;
