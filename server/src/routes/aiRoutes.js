import { Router } from 'express';
import { aiDealMemo } from '../controllers/aiController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.post('/deal-memo', aiDealMemo);

export default router;
