// LDIMS/backend/src/routes/document.ts
import express, { Request, Response, NextFunction, Router } from 'express';
import { DocumentService } from '../services/DocumentService';
import authenticateToken from '../middleware/authenticateToken';
import { validateCreateDocument, validateUpdateDocument, handleValidationErrors } from '../validators/documentValidator';
import { DocumentListQuery, CreateDocumentRequest, UpdateDocumentRequest } from '../types/document.d'; // 导入 DTO
import { success, fail } from '../utils/response'; // 修正：导入 success 和 fail 函数

const router: Router = express.Router();
const documentService = new DocumentService();

// 辅助函数：从请求中获取用户名 (假设存在于 req.user)
const getUserName = (req: Request): string | null => {
    // !! 你需要根据 authenticateToken 的实际实现来调整这里 !!
    // 可能是 req.user.username, req.user.realName, req.user.name 等
    return (req as any).user?.realName || (req as any).user?.username || null;
};

/**
 * @route   POST /api/v1/documents
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
            const newDocument = await documentService.create(data, creatorName);
            const documentInfo = await documentService.info(newDocument.id);
            // 修正：不再 return res.status().json()
            res.status(201).json(success(documentInfo, '文档创建成功'));
        } catch (error) {
            next(error); // 错误交给全局处理
        }
    }
);

/**
 * @route   PUT /api/v1/documents/:id
 * @desc    更新文档信息
 * @access  Private
 */
router.put(
    '/:id',
    authenticateToken,
    validateUpdateDocument,
    handleValidationErrors,
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
            const updatedDocumentInstance = await documentService.update(documentId, data, updaterName);

            if (!updatedDocumentInstance) {
                res.status(404).json(fail('文档未找到或无权更新'));
                return; // 提前退出
            }
            const documentInfo = await documentService.info(updatedDocumentInstance.id);
            // 修正：不再 return res.json()
            res.json(success(documentInfo, '文档更新成功'));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   DELETE /api/v1/documents/:id
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

            await documentService.delete(documentId, deleterName);

            // 修正：不再 return res.json()
            res.json(success(null, '文档删除成功'));
        } catch (error) {
            // Service 层抛出的错误（如未找到）会在这里被捕获
            next(error);
        }
    }
);

/**
 * @route   GET /api/v1/documents/:id
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
            const documentInfo = await documentService.info(documentId);
            if (!documentInfo) {
                res.status(404).json(fail('文档未找到'));
                return; // 提前退出
            }
            // 修正：不再 return res.json()
            res.json(success(documentInfo));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/v1/documents
 * @desc    获取文档列表 (分页, 搜索, 排序)
 * @access  Private
 */
router.get(
    '/',
    authenticateToken,
    async (req: Request<{}, {}, {}, DocumentListQuery>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const query: DocumentListQuery = req.query;
            const result = await documentService.list(query);
            // 修正：不再 return res.json()
            res.json(success(result));
        } catch (error) {
            next(error);
        }
    }
);

export default router; 