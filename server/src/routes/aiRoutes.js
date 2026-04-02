import { Router } from 'express';
import { aiDealMemo, aiTimecard } from '../controllers/aiController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.post('/deal-memo', aiDealMemo);
router.post('/timecard', aiTimecard);

export default router;
