import { Router } from 'express';
import UserController from '../controllers/UserController';
import authenticateToken from '../middleware/authenticateToken'; // 引入认证中间件
import checkAdminRole from '../middleware/checkAdminRole'; // 引入管理员权限检查中间件
// import checkAdminRole from '../middleware/checkAdminRole'; // 后续可能需要的权限中间件

const router = Router();

// GET /api/v1/users - 获取用户列表 (需要认证)
router.get('/', authenticateToken, UserController.getUsers);

// POST /api/v1/users - 创建用户 (需要认证 + 管理员权限)
router.post('/', authenticateToken, checkAdminRole, UserController.createUser);

// GET /api/v1/users/:id - 获取单个用户 (需要认证)
router.get('/:id', authenticateToken, UserController.getUserById);

// PUT /api/v1/users/:id - 更新用户 (需要认证 + 管理员权限)
// 注意：如果需要更复杂的权限 (如用户只能改自己)，需要更复杂的中间件或在 Controller/Service 中判断
router.put('/:id', authenticateToken, checkAdminRole, UserController.updateUser);

// DELETE /api/v1/users/:id - 删除用户 (需要认证 + 管理员权限)
router.delete('/:id', authenticateToken, checkAdminRole, UserController.deleteUser);

// PATCH /api/v1/users/:id/status - 更新用户状态 (需要认证 + 管理员权限)
router.patch('/:id/status', authenticateToken, checkAdminRole, UserController.updateUserStatus);

export default router; 