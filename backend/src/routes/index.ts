import { Router } from 'express';
import authRoutes from './auth'; // 引入认证路由
import userRoutes from './user'; // 引入用户路由
import departmentRoutes from './department'; // 引入部门路由
// 引入文档类型路由
import docTypeRoutes from './doctype';
import documentRoutes from './document'; // 引入文档路由

const router = Router();

// 后续在此处挂载各个模块的路由
router.use('/auth', authRoutes); // 挂载认证路由
router.use('/users', userRoutes); // 挂载用户路由
router.use('/departments', departmentRoutes); // 挂载部门路由
// 挂载文档类型路由
router.use('/doctypes', docTypeRoutes);
router.use('/documents', documentRoutes); // 挂载文档路由

// 例如:
// import userRoutes from './user';
// router.use('/users', userRoutes);

export default router; 