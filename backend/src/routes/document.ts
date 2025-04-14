// LDIMS/backend/src/routes/document.ts
import express, { Request, Response, NextFunction, Router } from 'express';
import { DocumentService } from '../services/DocumentService';
import authenticateToken from '../middleware/authenticateToken';
import { validateCreateDocument, validateUpdateDocument, handleValidationErrors } from '../validators/documentValidator';
import { DocumentListQuery, CreateDocumentRequest, UpdateDocumentRequest } from '../types/document.d'; // 导入 DTO
import { success, fail } from '../utils/response'; // 修正：导入 success 和 fail 函数
import { validationResult } from 'express-validator'; // 只需导入 validationResult

// --- 将路由设置封装在函数中，接收服务实例作为参数 ---
export const createDocumentRouter = (documentService: DocumentService): Router => {
    const router: Router = express.Router();

    // 辅助函数：从请求中获取用户名 (假设存在于 req.user)
    const getUserName = (req: Request): string | null => {
        // !! 你需要根据 authenticateToken 的实际实现来调整这里 !!
        // 可能是 req.user.username, req.user.realName, req.user.name 等
        return (req as any).user?.realName || (req as any).user?.username || null;
    };

    /**
     * @route   POST /
     * @desc    创建新文档
     * @access  Private
     */
    router.post(
        '/',
        authenticateToken,
        validateCreateDocument, // 应用创建验证规则
        handleValidationErrors, // 处理验证错误
        async (req: Request<{}, {}, CreateDocumentRequest>, res: Response, next: NextFunction): Promise<void> => {
            try {
                // 修正：获取用户名传递给 service
                const creatorName = getUserName(req);
                const data: CreateDocumentRequest = req.body;
                // --- 使用传入的 documentService ---
                const newDocument = await documentService.create(data, creatorName);
                // --- 使用传入的 documentService ---
                const documentInfo = await documentService.info(newDocument.id);
                res.status(201).json(success(documentInfo, '文档创建成功'));
            } catch (error) {
                next(error); // 错误交给全局处理
            }
        }
    );

    /**
     * @route   PUT /:id
     * @desc    更新文档信息
     * @access  Private
     */
    router.put(
        '/:id',
        authenticateToken,
        validateUpdateDocument, // 应用更新验证规则
        handleValidationErrors, // 处理验证错误
        async (req: Request<{ id: string }, {}, UpdateDocumentRequest>, res: Response, next: NextFunction): Promise<void> => {
            try {
                // 修正：获取用户名传递给 service
                const updaterName = getUserName(req);
                const documentId = parseInt(req.params.id, 10);
                if (isNaN(documentId)) {
                    res.status(400).json(fail('无效的文档 ID'));
                    return; // 提前退出
                }
                const data: UpdateDocumentRequest = req.body;
                // --- 使用传入的 documentService ---
                const updatedDocumentInstance = await documentService.update(documentId, data, updaterName);

                if (!updatedDocumentInstance) {
                    res.status(404).json(fail('文档未找到或无权更新'));
                    return; // 提前退出
                }
                 // --- 使用传入的 documentService ---
                const documentInfo = await documentService.info(updatedDocumentInstance.id);
                res.json(success(documentInfo, '文档更新成功'));
            } catch (error) {
                next(error);
            }
        }
    );

    /**
     * @route   DELETE /:id
     * @desc    删除文档 (软删除)
     * @access  Private
     */
    router.delete(
        '/:id',
        authenticateToken,
        async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
            try {
                // 修正：获取用户名传递给 service (如果需要)
                const deleterName = getUserName(req);
                const documentId = parseInt(req.params.id, 10);
                if (isNaN(documentId)) {
                    res.status(400).json(fail('无效的文档 ID'));
                    return; // 提前退出
                }
                // --- 使用传入的 documentService ---
                await documentService.delete(documentId, deleterName);
                res.json(success(null, '文档删除成功'));
            } catch (error) {
                // Service 层抛出的错误（如未找到）会在这里被捕获
                next(error);
            }
        }
    );

    /**
     * @route   GET /:id
     * @desc    获取单个文档详情
     * @access  Private
     */
    router.get(
        '/:id',
        authenticateToken,
        async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
            try {
                const documentId = parseInt(req.params.id, 10);
                 if (isNaN(documentId)) {
                    res.status(400).json(fail('无效的文档 ID'));
                    return; // 提前退出
                }
                 // --- 使用传入的 documentService ---
                const documentInfo = await documentService.info(documentId);
                if (!documentInfo) {
                    res.status(404).json(fail('文档未找到'));
                    return; // 提前退出
                }
                res.json(success(documentInfo));
            } catch (error) {
                next(error);
            }
        }
    );

    /**
     * @route   GET /
     * @desc    获取文档列表 (分页, 搜索, 排序)
     * @access  Private
     */
    router.get(
        '/',
        authenticateToken,
        // 注意：这里的查询参数验证器 validateListQuery 可能需要从 validators/documentValidator 导入
        // 如果没有，需要先创建或调整验证逻辑
        // validateListQuery,
        // handleValidationErrors,
        async (req: Request<{}, {}, {}, DocumentListQuery>, res: Response, next: NextFunction): Promise<void> => {
             // 可选：如果上面没有使用验证器，在这里手动验证或直接使用
             const errors = validationResult(req); // 如果有验证器则需要
             if (!errors.isEmpty()) {
                 // return res.status(400).json(fail('查询参数错误', 400, errors.array()));
             }
            try {
                const query: DocumentListQuery = req.query;
                 // --- 使用传入的 documentService ---
                const result = await documentService.list(query);
                res.json(success(result));
            } catch (error) {
                next(error);
            }
        }
    );

    return router; // 返回配置好的 Router 实例
};

// --- 移除旧的默认导出 ---
// export default router;