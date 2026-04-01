import { Router } from 'express';
import { login, register, refreshToken, getMe, logout, getUsers, updateUser } from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.post('/login', login);
router.post('/register', auth, authorize('super_admin', 'payroll_admin'), register);
router.post('/refresh-token', refreshToken);
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);

// User management (admin only)
router.get('/users', auth, authorize('super_admin', 'payroll_admin'), getUsers);
router.put('/users/:id', auth, authorize('super_admin', 'payroll_admin'), updateUser);

export default router;
