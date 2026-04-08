import { Router } from 'express';
import { getAll, getById, create, update, remove, addMember, removeMember } from '../controllers/productionController.js';
import { getProductionBudget } from '../controllers/nominalCodeController.js';
import { getOnboardingRequirements, saveOnboardingRequirements, getProductionSettings, updateProductionSettings } from '../controllers/productionSettingsController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(auth);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authorize('super_admin', 'payroll_admin', 'production_accountant'), create);
router.put('/:id', authorize('super_admin', 'payroll_admin', 'production_accountant'), update);
router.delete('/:id', authorize('super_admin', 'payroll_admin'), remove);

// Budget
router.get('/:id/budget', getProductionBudget);

// Member management
router.post('/:id/members', authorize('super_admin', 'payroll_admin', 'production_accountant'), addMember);
router.delete('/:id/members/:userId', authorize('super_admin', 'payroll_admin', 'production_accountant'), removeMember);

// Production settings
router.get('/:id/settings', getProductionSettings);
router.put('/:id/settings', authorize('super_admin', 'payroll_admin', 'production_accountant'), updateProductionSettings);
router.get('/:id/settings/onboarding', getOnboardingRequirements);
router.put('/:id/settings/onboarding', authorize('super_admin', 'payroll_admin', 'production_accountant'), saveOnboardingRequirements);

export default router;
