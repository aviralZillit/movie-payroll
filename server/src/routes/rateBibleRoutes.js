import { Router } from 'express';
import { getAll, getByAgreementId, getByTerritory, verify, search } from '../controllers/rateBibleController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.get('/', getAll);
router.get('/search', search);
router.post('/verify', verify);
router.get('/territory/:code', getByTerritory);
router.get('/:agreementId', getByAgreementId);

export default router;
