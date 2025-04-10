import { Router } from 'express';
import DepartmentController from '../controllers/DepartmentController';
import authenticateToken from '../middleware/authenticateToken';
import checkAdminRole from '../middleware/checkAdminRole'; // 引入管理员权限检查

const router = Router();

// GET /api/v1/departments - 获取部门列表 (需要认证)
// 注意: 前端用户管理的部门下拉框也需要此接口，所以可能不应限制管理员权限
router.get('/', authenticateToken, DepartmentController.getDepartments);

// GET /api/v1/departments/tree - 获取部门树 (需要认证)
router.get('/tree', authenticateToken, DepartmentController.getDepartmentTree);

// POST /api/v1/departments - 创建部门 (需要认证 + 管理员权限)
router.post('/', authenticateToken, checkAdminRole, DepartmentController.createDepartment);

// PUT /api/v1/departments/:id - 更新部门 (需要认证 + 管理员权限)
router.put('/:id', authenticateToken, checkAdminRole, DepartmentController.updateDepartment);

// DELETE /api/v1/departments/:id - 删除部门 (需要认证 + 管理员权限)
router.delete('/:id', authenticateToken, checkAdminRole, DepartmentController.deleteDepartment);

export default router; 