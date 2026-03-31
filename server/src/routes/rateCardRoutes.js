import { Router } from 'express';
import {
  getUnions,
  getDepartments,
  getDesignations,
  getBudgetTiers,
  lookupRate,
  getOvertimeRules,
  validateRate,
} from '../controllers/rateCardController.js';
import auth from '../middleware/auth.js';

const router = Router();

// All rate card routes require authentication
router.use(auth);

router.get('/unions', getUnions);
router.get('/unions/:unionId/departments', getDepartments);
router.get('/unions/:unionId/overtime-rules', getOvertimeRules);
router.get('/departments/:departmentId/designations', getDesignations);
router.get('/budget-tiers', getBudgetTiers);
router.post('/lookup', lookupRate);
router.post('/validate', validateRate);

export default router;
