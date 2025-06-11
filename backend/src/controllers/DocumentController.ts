import { body, query, param } from "express-validator"; // Import param
import { DocumentService } from "../services/DocumentService"; // Changed to named import
import { success, fail, page } from "../utils/response";
import { Request, Response, NextFunction } from "express"; // Import NextFunction
import { validationResult } from "express-validator";
import DocumentFile from "../models/DocumentFile"; // 引入 DocumentFile 模型
import { getStoragePath } from "../config/storage"; // 引入获取存储路径的函数
import path from "path"; // 引入 path 模块
import fs from "fs/promises"; // 引入 fs.promises 检查文件是否存在
import { OperationLogService } from "../services/OperationLogService"; // 新增导入
import { OperationType } from "@ldims/types"; // 新增导入
import { DocumentContentSearchQuery } from "../types/document.d";

const documentService = new DocumentService(); // Create an instance

class DocumentController {
  // 验证查询文档列表的参数
  public getDocumentsValidation = [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("页码必须是正整数")
      .toInt(),
    query("pageSize")
      .optional()
      .isInt({ min: 1 })
      .withMessage("每页数量必须是正整数")
      .toInt(),
    query("docName").optional().isString().trim(),
    query("docTypeName").optional().isString().trim(),
    query("submitter").optional().isString().trim(),
    query("receiver").optional().isString().trim(),
    query("signer").optional().isString().trim(),
    query("sourceDepartmentName").optional().isString().trim(),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("开始日期格式无效")
      .toDate(),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("结束日期格式无效")
      .toDate(),
    // Add validation for other potential query params like sort field/order if needed
  ];

  // 验证创建文档的输入
  public createDocumentValidation = [
    body("docName")
      .notEmpty()
      .withMessage("文档名称不能为空")
      .isLength({ max: 255 })
      .trim(),
    body("docTypeId")
      .notEmpty()
      .withMessage("文档类型ID不能为空")
      .isInt({ gt: 0 }),
    body("sourceDepartmentId")
      .notEmpty()
      .withMessage("来源部门ID不能为空")
      .isInt({ gt: 0 }),
    body("submitter").optional().isLength({ max: 100 }).trim(),
    body("receiver").optional().isLength({ max: 100 }).trim(),
    body("signer").optional().isLength({ max: 100 }).trim(),
    body("storageLocation").optional().isLength({ max: 255 }).trim(),
    body("remarks").optional().isString().trim(), // Allow longer remarks, just trim
    body("handoverDate")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage("交接日期格式无效")
      .toDate(),
  ];

  // 验证更新文档的输入
  public updateDocumentValidation = [
    body("docName")
      .optional()
      .notEmpty()
      .withMessage("文档名称不能为空")
      .isLength({ max: 255 })
      .trim(),
    body("docTypeId")
      .optional()
      .notEmpty()
      .withMessage("文档类型ID不能为空")
      .isInt({ gt: 0 }),
    body("sourceDepartmentId")
      .optional()
      .notEmpty()
      .withMessage("来源部门ID不能为空")
      .isInt({ gt: 0 }),
    body("submitter").optional().isLength({ max: 100 }).trim(),
    body("receiver").optional().isLength({ max: 100 }).trim(),
    body("signer").optional().isLength({ max: 100 }).trim(),
    body("storageLocation").optional().isLength({ max: 255 }).trim(),
    body("remarks").optional().isString().trim(),
    body("handoverDate")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage("交接日期格式无效")
      .toDate(),
  ];

  // 验证文件上传的路径参数 (可以放在路由层，或者在这里再次检查)
  public uploadFilesValidation = [
    param("id").isInt({ gt: 0 }).withMessage("无效的文档 ID").toInt(),
  ];

  // Validation rules for the new content search endpoint
  public searchDocumentsValidation = [
    query("searchText")
      .notEmpty()
      .withMessage("搜索文本不能为空")
      .isString()
      .trim(),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("页码必须是正整数")
      .toInt(),
    query("pageSize")
      .optional()
      .isInt({ min: 1 })
      .withMessage("每页数量必须是正整数")
      .toInt(),
    // Optional: Add sortField and sortOrder validation if needed in the future
    query("sortField").optional().isString().trim(),
    query("sortOrder").optional().isIn(["ASC", "DESC"]),
  ];

  // --- 新增：获取文档文件内容参数验证规则 (P0-T2 时已添加，此处保留) ---
  public getDocumentFileContentValidation = [
    param("file_id").isInt({ gt: 0 }).withMessage("无效的文件 ID").toInt(),
  ];

  // 控制器方法 (getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument, uploadDocument)
  // ... (需要确保在 getDocuments 方法开始处调用 validationResult)
  public async getDocuments(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Use fail to build response, then send with res.status().json()
      const response = fail("参数验证失败", 400);
      // Optionally include validation errors in data field for debugging/frontend use
      // response.data = errors.array();
      return res.status(response.code).json(response);
    }
    try {
      const currentPage = req.query.page
        ? parseInt(req.query.page as string)
        : 1;
      const currentPageSize = req.query.pageSize
        ? parseInt(req.query.pageSize as string)
        : 10;
      // Pass validated and cast query params to service
      const result = await documentService.list(req.query as any);
      // Use page to build response, then send with res.json()
      const response = page(
        result.list,
        result.total,
        currentPage,
        currentPageSize
      );
      return res.json(response);
    } catch (error: any) {
      // Use fail to build response, then send with res.status().json()
      const response = fail(error.message || "获取文档列表失败", 500);
      return res.status(response.code).json(response);
    }
  }

  public async getDocumentById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    try {
      const documentId = parseInt(id);
      if (isNaN(documentId) || documentId <= 0) {
        return res.status(400).json(fail("无效的文档 ID"));
      }
      const documentInfo = await documentService.info(documentId);
      if (!documentInfo) {
        return res.status(404).json(fail("文档不存在"));
      }
      return res.json(success(documentInfo));
    } catch (error: any) {
      next(error); // Pass error to global handler
    }
  }

  public async createDocument(req: Request, res: Response, next: NextFunction) {
    // Validation should be handled by middleware in routes
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(fail("参数验证失败", 400));
    }
    try {
      const creatorName =
        (req as any).user?.realName || (req as any).user?.username || null;
      const newDocument = await documentService.create(
        req.body,
        creatorName,
        req
      );
      const documentInfo = await documentService.info(newDocument.id);
      return res.status(201).json(success(documentInfo, "文档创建成功"));
    } catch (error: any) {
      next(error); // Pass error to global handler
    }
  }

  public async updateDocument(req: Request, res: Response, next: NextFunction) {
    // Validation should be handled by middleware in routes
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(fail("参数验证失败", 400));
    }
    const { id } = req.params;
    try {
      const documentId = parseInt(id);
      if (isNaN(documentId) || documentId <= 0) {
        return res.status(400).json(fail("无效的文档 ID"));
      }
      const updaterName =
        (req as any).user?.realName || (req as any).user?.username || null;
      const updatedDocument = await documentService.update(
        documentId,
        req.body,
        updaterName,
        req
      );
      if (!updatedDocument) {
        return res.status(404).json(fail("文档不存在或更新失败"));
      }
      const documentInfo = await documentService.info(updatedDocument.id);
      return res.json(success(documentInfo, "文档更新成功"));
    } catch (error: any) {
      next(error); // Pass error to global handler
    }
  }

  public async deleteDocument(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const documentId = parseInt(id);
      if (isNaN(documentId) || documentId <= 0) {
        return res.status(400).json(fail("无效的文档 ID"));
      }
      const deleterName =
        (req as any).user?.realName || (req as any).user?.username || null;
      const successFlag = await documentService.delete(
        documentId,
        deleterName,
        req
      );
      if (!successFlag) {
        return res.status(404).json(fail("文档不存在或删除失败"));
      }
      return res.json(success(null, "文档删除成功"));
    } catch (error: any) {
      next(error); // Pass error to global handler
    }
  }

  // --- 新增文件上传控制器方法 ---
  public async uploadDocumentFiles(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // 1. 验证路径参数 ID
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId) || documentId <= 0) {
        console.warn(
          "[uploadDocumentFiles] Invalid document ID received:",
          req.params.id
        );
        // Consider cleanup of uploaded files if validation fails early
        return res.status(400).json(fail("无效的文档 ID"));
      }

      // 2. 检查 req.files (由 Multer 中间件填充)
      const files = req.files as Express.Multer.File[]; // Type assertion
      if (!files || !Array.isArray(files)) {
        console.warn(
          `[uploadDocumentFiles] req.files is not an array or undefined for document ID ${documentId}.`
        );
        return res
          .status(400)
          .json(fail("文件上传失败：未检测到上传的文件数组。"));
      }

      // !!! 关键的检查点：记录接收到的原始文件名 !!!
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          console.log(
            `[uploadDocumentFiles] Received file ${
              index + 1
            } for document ID ${documentId}: originalname = '${
              file.originalname
            }', mimetype = '${file.mimetype}', size = ${file.size}`
          );
        });
      }
      // !!! 日志添加结束 !!!

      if (files.length === 0) {
        console.log(
          `[uploadDocumentFiles] No files were uploaded for document ID ${documentId}.`
        );
        return res.status(400).json(fail("必须上传至少一个文件进行替换。"));
      }

      // 3. 调用服务层方法
      console.log(
        `[uploadDocumentFiles] Calling DocumentService.uploadAndReplaceFiles for document ID ${documentId} with ${files.length} files.`
      );
      const uploadedFileRecords = await documentService.uploadAndReplaceFiles(
        documentId,
        files
      );
      console.log(
        `[uploadDocumentFiles] Successfully uploaded ${uploadedFileRecords.length} files for document ID ${documentId}.`
      );

      // --- 新增：操作日志记录 ---
      try {
        // !!! 修改：使用 uploadedFileRecords 中的最终文件名进行日志记录 !!!
        const generatedFileNames = uploadedFileRecords.map(
          (record) => record.fileName
        );

        const operationContent = `文档ID ${documentId} 上传了 ${
          generatedFileNames.length
        } 个文件: ${generatedFileNames.join(", ")}`;
        await OperationLogService.logFromRequest(
          req,
          OperationType.ATTACHMENT_UPLOAD,
          operationContent
        );
        console.log(
          `[uploadDocumentFiles] Operation log created for document ID ${documentId} attachment upload.`
        );
      } catch (logError) {
        console.error(
          `[uploadDocumentFiles] Failed to create operation log for document ID ${documentId} attachment upload:`,
          logError
        );
        // 日志记录失败不应中断主流程
      }
      // --- 操作日志记录结束 ---

      // 4. 返回成功响应 (包含新创建的文件记录信息)
      return res.json(
        success({ files: uploadedFileRecords }, "文件上传并替换成功")
      );
    } catch (error: any) {
      // 捕获来自 Service 层的错误 (包括文件系统、数据库错误等)
      // Multer 自身的错误 (如文件过大) 通常由 Multer 或全局错误处理中间件处理
      console.error(
        `[uploadDocumentFiles] Error uploading files for document ID ${req.params.id}:`,
        error
      );
      // 将错误传递给全局错误处理中间件
      next(error);
    }
  }

  // --- 新增：清空文件控制器方法 ---
  public async deleteAllDocumentFiles(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // 1. 验证路径参数 ID
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId) || documentId <= 0) {
        console.warn(
          "[deleteAllDocumentFiles] Invalid document ID received:",
          req.params.id
        );
        return res.status(400).json(fail("无效的文档 ID"));
      }

      // 2. 调用服务层方法
      console.log(
        `[deleteAllDocumentFiles] Calling DocumentService.deleteAllFilesForDocument for document ID ${documentId}.`
      );
      // DocumentService.deleteAllFilesForDocument 不返回任何内容，如果出错会抛出异常
      await documentService.deleteAllFilesForDocument(documentId);
      console.log(
        `[deleteAllDocumentFiles] Successfully deleted all files for document ID ${documentId}.`
      );

      // --- 新增：操作日志记录 ---
      try {
        const operationContent = `清空了文档ID ${documentId} 的所有附件`;
        await OperationLogService.logFromRequest(
          req,
          OperationType.ATTACHMENT_CLEAR,
          operationContent
        );
        console.log(
          `[deleteAllDocumentFiles] Operation log created for document ID ${documentId} attachment clear.`
        );
      } catch (logError) {
        console.error(
          `[deleteAllDocumentFiles] Failed to create operation log for document ID ${documentId} attachment clear:`,
          logError
        );
        // 日志记录失败不应中断主流程
      }
      // --- 操作日志记录结束 ---

      // 3. 返回成功响应
      // 通常对于 DELETE 操作，成功时返回 204 No Content 或 200 OK
      // 返回 204 时，响应体应为空
      // return res.status(204).send();
      // 或者返回 200 和成功消息
      return res.json(success(null, "关联文件已成功清空"));
    } catch (error: any) {
      // 捕获来自 Service 层的错误 (如文档未找到、文件删除失败等)
      console.error(
        `[deleteAllDocumentFiles] Error deleting files for document ID ${req.params.id}:`,
        error
      );
      // 将错误传递给全局错误处理中间件
      next(error);
    }
  }

  // --- 新增：开始文件处理控制器方法 ---
  public async startFileProcessing(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // 1. 验证路径参数 ID
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId) || documentId <= 0) {
        console.warn(
          "[startFileProcessing] Invalid document ID received:",
          req.params.id
        );
        return res.status(400).json(fail("无效的文档 ID"));
      }

      // 2. 调用服务层方法 (待实现)
      console.log(
        `[startFileProcessing] Calling DocumentService.triggerFileProcessing for document ID ${documentId}.`
      );
      // 这个服务方法目前可能只是占位符或只更新状态，实际任务入队在阶段二实现
      // 假设服务方法在成功时返回处理的文件数量或类似信息，失败时抛出错误
      const processingResult = await documentService.triggerFileProcessing(
        documentId
      );
      console.log(
        `[startFileProcessing] File processing triggered for document ID ${documentId}. Result:`,
        processingResult
      );

      // 3. 返回成功响应
      // 202 Accepted 表示请求已被接受处理，但处理尚未完成
      // 200 OK 也可以，表示触发操作成功
      return res.status(202).json(success(processingResult, "文件处理已开始"));
    } catch (error: any) {
      // 捕获来自 Service 层的错误 (如文档未找到、任务入队失败等)
      console.error(
        `[startFileProcessing] Error triggering file processing for document ID ${req.params.id}:`,
        error
      );
      // 将错误传递给全局错误处理中间件
      next(error);
    }
  }

  // --- 新增：文件下载控制器方法 ---
  public async downloadDocumentFile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // 1. 验证路径参数 file_id
      const fileId = parseInt(req.params.file_id);
      if (isNaN(fileId) || fileId <= 0) {
        console.warn(
          "[downloadDocumentFile] Invalid file ID received:",
          req.params.file_id
        );
        return res.status(400).json(fail("无效的文件 ID"));
      }

      // 2. 从数据库查找文件记录
      console.debug(
        `[downloadDocumentFile] Looking for file record with ID: ${fileId}`
      );
      const fileRecord = await DocumentFile.findByPk(fileId, {
        attributes: ["filePath", "fileName"], // 只需要相对路径和原始文件名
      });

      if (!fileRecord || !fileRecord.filePath || !fileRecord.fileName) {
        console.warn(
          `[downloadDocumentFile] File record not found or missing path/name for ID: ${fileId}`
        );
        return res.status(404).json(fail("文件记录不存在或信息不完整"));
      }

      // 3. 构建完整物理路径
      const storageRoot = await getStoragePath();
      const fullPath = path.join(storageRoot, fileRecord.filePath);
      console.debug(
        `[downloadDocumentFile] Attempting to download file from path: ${fullPath}`
      );

      // 4. (可选但推荐) 检查物理文件是否存在
      try {
        await fs.access(fullPath, fs.constants.R_OK); // 检查文件是否存在且可读
      } catch (accessError) {
        console.error(
          `[downloadDocumentFile] File not accessible at path ${fullPath}:`,
          accessError
        );
        return res.status(404).json(fail("物理文件不存在或无法访问"));
      }

      // 5. 使用 res.download 发送文件
      // 第一个参数是物理路径，第二个参数是用户下载时看到的文件名（原始文件名）
      res.download(fullPath, fileRecord.fileName, (err) => {
        if (err) {
          // 如果在发送过程中发生错误 (例如连接中断)，需要处理
          console.error(
            `[downloadDocumentFile] Error sending file ${fullPath} to client:`,
            err
          );
          // 避免再次发送响应头，检查是否已发送
          if (!res.headersSent) {
            // 可以选择将错误传递给下一个错误处理器，或者发送一个通用错误
            // next(err); // 如果有后续处理
            res.status(500).json(fail("文件下载时发生服务器内部错误"));
          }
        }
        // 如果没有错误，res.download 会自动结束响应
        console.log(
          `[downloadDocumentFile] Successfully started download for file: ${fileRecord.fileName} (ID: ${fileId})`
        );
      });
    } catch (error: any) {
      // 捕获数据库查询、路径获取等其他可能的错误
      console.error(
        `[downloadDocumentFile] General error processing download for file ID ${req.params.file_id}:`,
        error
      );
      // 将错误传递给全局错误处理中间件 (如果响应尚未发送)
      if (!res.headersSent) {
        next(error);
      }
    }
  }

  // --- 新增：内容搜索控制器方法 ---
  public async searchDocumentsByContent(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "参数验证失败",
        data: errors.array(),
      });
    }

    try {
      // Extract validated and sanitized query parameters
      const {
        searchText,
        page: currentPage = 1, // Default to page 1 if not provided
        pageSize: currentPageSize = 10, // Default to 10 per page
        sortField,
        sortOrder,
      } = req.query as unknown as DocumentContentSearchQuery; // Cast after validation

      const queryParams: DocumentContentSearchQuery = {
        searchText: searchText as string, // searchText is already validated as not empty string
        page: Number(currentPage),
        pageSize: Number(currentPageSize),
      };
      if (sortField) queryParams.sortField = sortField as string;
      if (sortOrder) queryParams.sortOrder = sortOrder as "ASC" | "DESC";

      const result = await documentService.searchDocumentsByContent(
        queryParams
      );

      const response = page(
        result.list,
        result.total,
        queryParams.page || 1,
        queryParams.pageSize || 10
      );
      return res.json(response);
    } catch (error: any) {
      console.error(
        `[DocumentController] Error in searchDocumentsByContent:`,
        error
      );
      next(error); // Pass error to global handler
    }
  }

  // --- 新增：文档文件内容获取控制器方法 ---
  public async getDocumentFileContent(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "参数验证失败",
        data: errors.array(),
      });
    }

    try {
      // 1. 获取并验证路径参数
      const fileId = parseInt(req.params.file_id);
      if (isNaN(fileId) || fileId <= 0) {
        console.warn(
          `[getDocumentFileContent] Invalid file ID received: ${req.params.file_id}`
        );
        return res.status(400).json({
          success: false,
          code: 400,
          message: "无效的文件ID",
        });
      }

      // 2. 记录操作日志
      console.info(
        `[getDocumentFileContent] User requesting content for file ID: ${fileId}. ` +
          `User: ${(req as any).user?.username || "unknown"}`
      );

      // 3. 调用Service层获取文件内容
      const fileContent = await documentService.getDocumentFileWithContent(
        fileId
      );

      // 4. 处理文件不存在的情况
      if (!fileContent) {
        console.warn(
          `[getDocumentFileContent] File not found or no access for ID: ${fileId}`
        );
        return res.status(404).json({
          success: false,
          code: 404,
          message: "文件不存在或无权访问",
        });
      }

      // 5. 记录成功的访问操作（用于审计）
      if (req) {
        await OperationLogService.logFromRequest(
          req,
          OperationType.DOCUMENT_VIEW,
          `查看文档文件内容: ${fileContent.fileName} (ID: ${fileId})`
        );
      }

      // 6. 返回成功响应
      console.debug(
        `[getDocumentFileContent] Successfully retrieved content for file ID: ${fileId}. ` +
          `Status: ${fileContent.processingStatus}, ` +
          `Content length: ${
            fileContent.extractedContent
              ? fileContent.extractedContent.length
              : 0
          } chars`
      );

      return res.json({
        success: true,
        code: 200,
        message: "获取文件内容成功",
        data: fileContent,
      });
    } catch (error: any) {
      // 7. 错误处理和日志记录
      console.error(
        `[getDocumentFileContent] Error retrieving content for file ID ${req.params.file_id}:`,
        error
      );

      // 记录错误操作日志
      if (req) {
        try {
          await OperationLogService.logFromRequest(
            req,
            OperationType.DOCUMENT_VIEW,
            `查看文档文件内容失败: 文件ID ${req.params.file_id} - ${error.message}`
          );
        } catch (logError) {
          console.error(
            `[getDocumentFileContent] Failed to log error operation:`,
            logError
          );
        }
      }

      // 传递错误给全局错误处理中间件
      next(error);
    }
  }
}

export default new DocumentController();
