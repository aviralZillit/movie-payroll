import { Router } from 'express';
import { punchIn, punchOut, getTodayPunches, getPunchLogs, autoFillTimecard } from '../controllers/punchController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.post('/in', punchIn);
router.post('/out', punchOut);
router.get('/today', getTodayPunches);
router.get('/logs/:crewId', getPunchLogs);
router.post('/auto-fill/:timecardId', autoFillTimecard);

export default router;
