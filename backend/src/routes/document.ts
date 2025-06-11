// LDIMS/backend/src/routes/document.ts
import express, { Request, Response, NextFunction, Router } from "express";
import { DocumentService } from "../services/DocumentService";
import authenticateToken from "../middleware/authenticateToken";
import { documentUploadMiddleware } from "../middleware/documentUpload";
import documentController from "../controllers/DocumentController";
import {
  validateCreateDocument,
  validateUpdateDocument,
  handleValidationErrors,
} from "../validators/documentValidator";
import {
  DocumentListQuery,
  CreateDocumentRequest,
  UpdateDocumentRequest,
} from "@ldims/types"; // 导入 DTO
import { success, fail } from "../utils/response"; // 修正：导入 success 和 fail 函数
import { validationResult } from "express-validator"; // 只需导入 validationResult
import { param } from "express-validator"; // 引入 param 用于验证路径参数

// --- 将路由设置封装在函数中，接收服务实例作为参数 ---
export const createDocumentRouter = (
  documentService: DocumentService
): Router => {
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
    "/",
    authenticateToken,
    validateCreateDocument, // 应用创建验证规则
    handleValidationErrors, // 处理验证错误
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await documentController.createDocument(req, res, next);
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * @route   PUT /:id
   * @desc    更新文档信息
   * @access  Private
   */
  router.put(
    "/:id",
    authenticateToken,
    validateUpdateDocument, // 应用更新验证规则
    handleValidationErrors, // 处理验证错误
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await documentController.updateDocument(req, res, next);
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
    "/:id",
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await documentController.deleteDocument(req, res, next);
      } catch (error) {
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
    "/:id",
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await documentController.getDocumentById(req, res, next);
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
    "/",
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await documentController.getDocuments(req, res, next);
      } catch (error) {
        next(error);
      }
    }
  );

  // --- 文件上传路由 (更新) ---
  /**
   * @route   POST /:id/files
   * @desc    上传/替换指定文档的关联文件
   * @access  Private
   */
  router.post(
    "/:id/files",
    authenticateToken, // 1. 认证
    documentUploadMiddleware, // 2. Multer 处理文件上传 ('files' 字段)
    // 直接调用控制器方法，并将 next 传递给它以进行错误处理
    (req: Request, res: Response, next: NextFunction) => {
      documentController.uploadDocumentFiles(req, res, next);
    }
  );

  /**
   * @route   DELETE /:id/files
   * @desc    清空指定文档的所有关联文件
   * @access  Private
   */
  router.delete(
    "/:id/files",
    authenticateToken,
    // 直接调用控制器方法，传递 next
    (req: Request, res: Response, next: NextFunction) => {
      documentController.deleteAllDocumentFiles(req, res, next);
    }
  );

  // --- 触发文件处理路由 (更新) ---
  /**
   * @route   POST /:id/start-processing
   * @desc    触发指定文档关联文件的后台处理
   * @access  Private
   */
  router.post(
    "/:id/start-processing",
    authenticateToken, // 1. 认证
    // 2. 直接调用控制器方法，传递 next
    (req: Request, res: Response, next: NextFunction) => {
      documentController.startFileProcessing(req, res, next);
    }
  );

  /**
   * @route   GET /files/:file_id/download
   * @desc    下载单个关联文件
   * @access  Private
   */
  router.get(
    "/files/:file_id/download",
    authenticateToken, // 1. 认证
    // 2. (可选) 添加路径参数验证中间件
    [param("file_id").isInt({ gt: 0 }).withMessage("无效的文件 ID").toInt()],
    handleValidationErrors, // 3. 处理验证错误 (如果添加了验证)
    // 4. 调用控制器方法
    (req: Request, res: Response, next: NextFunction) => {
      documentController.downloadDocumentFile(req, res, next);
    }
  );

  // --- 新增：内容搜索路由 ---
  /**
   * @route   GET /search/content
   * @desc    根据文本内容搜索文档 (元数据和文件内容)
   * @access  Private
   */
  router.get(
    "/search/content", // 新的独立路由路径
    authenticateToken, // 1. 认证
    documentController.searchDocumentsValidation, // 2. 应用新的验证规则
    handleValidationErrors, // 3. 处理验证错误
    // 4. 调用新的控制器方法
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await documentController.searchDocumentsByContent(req, res, next);
      } catch (error) {
        next(error); // 确保错误被传递到全局错误处理器
      }
    }
  );

  // --- 新增：文档文件内容提取路由 ---
  /**
   * @route   GET /files/:file_id/content
   * @desc    获取单个文档文件的提取内容和元数据
   * @access  Private
   */
  router.get(
    "/files/:file_id/content",
    authenticateToken, // 1. 认证
    documentController.getDocumentFileContentValidation, // 2. 应用验证规则
    handleValidationErrors, // 3. 处理验证错误
    // 4. 调用控制器方法
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await documentController.getDocumentFileContent(req, res, next);
      } catch (error) {
        next(error); // 确保错误被传递到全局错误处理器
      }
    }
  );

  // --- 路由结束 ---

  return router; // 返回配置好的 Router 实例
};

// --- 移除旧的默认导出 ---
// export default router;
