import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/productionController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(auth);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authorize('super_admin', 'payroll_admin', 'production_accountant'), create);
router.put('/:id', authorize('super_admin', 'payroll_admin', 'production_accountant'), update);
router.delete('/:id', authorize('super_admin', 'payroll_admin'), remove);

export default router;
