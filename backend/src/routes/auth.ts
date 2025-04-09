import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import authenticateToken from '../middleware/authenticateToken'; // 引入 JWT 验证中间件

const router = Router();

// POST /api/v1/auth/login
router.post('/login', AuthController.login);

// POST /api/v1/auth/change-password (需要认证)
router.post('/change-password', authenticateToken, AuthController.changePassword);

export default router; 