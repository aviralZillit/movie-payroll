import { Router } from 'express';
import { getNominalCodes, getCodeMapping, getProductionBudget } from '../controllers/nominalCodeController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', getNominalCodes);
router.get('/map', getCodeMapping);

export default router;
