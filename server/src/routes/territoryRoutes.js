import { Router } from 'express';
import { getAll, getByCode, getRules, getRule } from '../controllers/territoryController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.get('/', getAll);
router.get('/:code', getByCode);
router.get('/:code/rules', getRules);
router.get('/:code/rules/:unionKey', getRule);

export default router;
