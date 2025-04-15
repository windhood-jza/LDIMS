import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import authenticateToken from '../middleware/authenticateToken'; // 导入认证中间件

export function createDashboardRouter(): Router {
    const router = Router();
    const dashboardController = new DashboardController();

    // 获取仪表盘汇总数据 (需要认证)
    router.get(
        '/summary',
        authenticateToken, // 应用认证中间件
        dashboardController.getSummary
    );

    // 未来可以添加其他仪表盘相关的路由

    return router;
} 