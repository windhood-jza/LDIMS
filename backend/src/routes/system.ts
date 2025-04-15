import { Router } from 'express';
import { SystemController, updateConfigsValidation, getLogsValidation } from '../controllers/SystemController';
import authenticateToken from '../middleware/authenticateToken';
import checkAdminRole from '../middleware/checkAdminRole';

export function createSystemRouter(): Router {
    const router = Router();
    const systemController = new SystemController();

    // --- 系统配置路由 (Admin Only) ---

    // 获取所有系统配置
    router.get(
        '/config',
        authenticateToken,
        checkAdminRole,
        systemController.getAllConfigs
    );

    // 更新系统配置
    router.put(
        '/config',
        authenticateToken,
        checkAdminRole,
        updateConfigsValidation,
        systemController.updateConfigs
    );

    // 获取数据库连接状态
    router.get(
        '/db-status',
        authenticateToken,
        checkAdminRole,
        systemController.getDbStatus
    );


    // --- 操作日志路由 (Admin Only) ---

    // 查询操作日志
    router.get(
        '/logs',
        authenticateToken,
        checkAdminRole,
        getLogsValidation,
        systemController.getLogs
    );


    return router;
} 