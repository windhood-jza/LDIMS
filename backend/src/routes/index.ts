import { Router } from 'express';

// --- 导入服务类型 (用于函数签名) ---
import { DocumentService } from '../services/DocumentService';
import { DocTypeService } from '../services/DocTypeService';
// import { DepartmentService } from '../services/DepartmentService'; // <-- 移除此行
import { ExportService } from '../services/ExportService';
import { ImportService } from '../services/ImportService';
// import { UserService } from '../services/UserService';
// import { AuthService } from '../services/AuthService';

// --- 导入路由创建函数 ---
import { createDocumentRouter } from './document';
import { createDocTypeRouter } from './doctype';
import { createExportRouter } from './export';
// import { createUserRouter } from './user';
// import { createAuthRouter } from './auth';

// --- 导入不需要改造的路由 (如 department) ---
import departmentRoutes from './department';
// 假设 user.ts 和 auth.ts 也不需要改造
import userRoutes from './user';
import authRoutes from './auth';
import statisticsRoutes from './statistics';
import { createSystemRouter } from './system';

// --- 定义服务容器接口 (方便传递) ---
interface AppServices {
    documentService: DocumentService;
    docTypeService: DocTypeService;
    // DepartmentService 已移除，无需在此引用
    exportService: ExportService;
    importService: ImportService;
    // userService?: UserService;
    // authService?: AuthService;
}

// --- 主路由创建函数 ---
export const createApiRouter = (services: AppServices): Router => {
    const router = Router();

    // --- 创建并挂载需要依赖注入的路由 ---
    const documentRouter = createDocumentRouter(services.documentService);
    router.use('/documents', documentRouter);

    const docTypeRouter = createDocTypeRouter(services.docTypeService);
    router.use('/doctypes', docTypeRouter);

    // Export/Import 路由挂载在 /api/v1 下，由 export.ts 内部定义完整路径
    const exportImportRouter = createExportRouter(services.exportService, services.importService);
    router.use(exportImportRouter); // 直接挂载，路径由 export.ts 控制

    // --- 挂载不需要依赖注入的路由 ---
    // (假设 department, user, auth 使用静态方法或控制器内部处理)
    router.use('/departments', departmentRoutes);
    router.use('/users', userRoutes);
    router.use('/auth', authRoutes);
    router.use('/statistics', statisticsRoutes);
    router.use('/system', createSystemRouter());

    // --- 如果 user 或 auth 也需要注入 ---
    // const userRouter = createUserRouter(services.userService, services.authService);
    // router.use('/users', userRouter);
    // const authRouter = createAuthRouter(services.authService);
    // router.use('/auth', authRouter);

    console.log("[Router] API router created and mounted.");
    return router;
};

// --- 移除旧的默认导出 ---
// export default router; 