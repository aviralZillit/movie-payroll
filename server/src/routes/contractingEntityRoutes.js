import { Router } from 'express';
import { getByProduction, create } from '../controllers/contractingEntityController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);
router.get('/', getByProduction);
router.post('/', create);

export default router;
