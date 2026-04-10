import { Router } from 'express';
import { getCrewPayHistory } from '../controllers/portalController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/:crewId/production/:productionId', getCrewPayHistory);

export default router;
