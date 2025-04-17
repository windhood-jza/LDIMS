import { body, query } from 'express-validator'; // Import query
import { DocumentService } from '../services/DocumentService'; // Changed to named import
import { success, fail, page } from '../utils/response';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

const documentService = new DocumentService(); // Create an instance

class DocumentController {

  // 验证查询文档列表的参数
  public getDocumentsValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数').toInt(),
    query('pageSize').optional().isInt({ min: 1 }).withMessage('每页数量必须是正整数').toInt(),
    query('docName').optional().isString().trim(),
    query('docTypeName').optional().isString().trim(),
    query('submitter').optional().isString().trim(),
    query('receiver').optional().isString().trim(),
    query('signer').optional().isString().trim(),
    query('sourceDepartmentName').optional().isString().trim(),
    query('startDate').optional().isISO8601().withMessage('开始日期格式无效').toDate(),
    query('endDate').optional().isISO8601().withMessage('结束日期格式无效').toDate(),
    // Add validation for other potential query params like sort field/order if needed
  ];

  // 验证创建文档的输入
  public createDocumentValidation = [
    body('docName').notEmpty().withMessage('文档名称不能为空').isLength({ max: 255 }).trim(),
    body('docTypeId').notEmpty().withMessage('文档类型ID不能为空').isInt({ gt: 0 }),
    body('sourceDepartmentId').notEmpty().withMessage('来源部门ID不能为空').isInt({ gt: 0 }),
    body('submitter').optional().isLength({ max: 100 }).trim(),
    body('receiver').optional().isLength({ max: 100 }).trim(),
    body('signer').optional().isLength({ max: 100 }).trim(),
    body('storageLocation').optional().isLength({ max: 255 }).trim(),
    body('remarks').optional().isString().trim(), // Allow longer remarks, just trim
    body('handoverDate').optional({ nullable: true }).isISO8601().withMessage('交接日期格式无效').toDate(),
  ];

  // 验证更新文档的输入
  public updateDocumentValidation = [
    body('docName').optional().notEmpty().withMessage('文档名称不能为空').isLength({ max: 255 }).trim(),
    body('docTypeId').optional().notEmpty().withMessage('文档类型ID不能为空').isInt({ gt: 0 }),
    body('sourceDepartmentId').optional().notEmpty().withMessage('来源部门ID不能为空').isInt({ gt: 0 }),
    body('submitter').optional().isLength({ max: 100 }).trim(),
    body('receiver').optional().isLength({ max: 100 }).trim(),
    body('signer').optional().isLength({ max: 100 }).trim(),
    body('storageLocation').optional().isLength({ max: 255 }).trim(),
    body('remarks').optional().isString().trim(),
    body('handoverDate').optional({ nullable: true }).isISO8601().withMessage('交接日期格式无效').toDate(),
  ];

  // 控制器方法 (getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument, uploadDocument)
  // ... (需要确保在 getDocuments 方法开始处调用 validationResult)
  public async getDocuments(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Use fail to build response, then send with res.status().json()
      const response = fail('参数验证失败', 400); 
      // Optionally include validation errors in data field for debugging/frontend use
      // response.data = errors.array(); 
      return res.status(response.code).json(response);
    }
    try {
      const currentPage = req.query.page ? parseInt(req.query.page as string) : 1;
      const currentPageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      // Pass validated and cast query params to service
      const result = await documentService.list(req.query as any); 
      // Use page to build response, then send with res.json()
      const response = page(result.list, result.total, currentPage, currentPageSize);
      return res.json(response);
    } catch (error: any) {
      // Use fail to build response, then send with res.status().json()
      const response = fail(error.message || '获取文档列表失败', 500);
      return res.status(response.code).json(response);
    }
  }

  public async getDocumentById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const documentInfo = await documentService.info(parseInt(id));
      if (!documentInfo) {
        // Use fail to build response, then send with res.status().json()
        const response = fail('文档不存在', 404);
        return res.status(response.code).json(response);
      }
      // Use success to build response, then send with res.json()
      return res.json(success(documentInfo));
    } catch (error: any) {
      const response = fail(error.message || '获取文档详情失败', 500);
      return res.status(response.code).json(response);
    }
  }

  public async createDocument(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response = fail('参数验证失败', 400);
      // response.data = errors.array();
      return res.status(response.code).json(response);
    }
    try {
      const creatorName = (req.user as any)?.username || 'system';
      const newDocument = await documentService.create(req.body, creatorName, req);
      // Use success to build response, pass message optionally
      return res.status(201).json(success(newDocument, '文档创建成功')); // Use 201 for creation
    } catch (error: any) {
      const response = fail(error.message || '创建文档失败', 500);
      return res.status(response.code).json(response);
    }
  }

  public async updateDocument(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response = fail('参数验证失败', 400);
      // response.data = errors.array();
      return res.status(response.code).json(response);
    }
    const { id } = req.params;
    try {
      const updaterName = (req.user as any)?.username || 'system';
      const updatedDocument = await documentService.update(parseInt(id), req.body, updaterName, req);
      if (!updatedDocument) {
        const response = fail('文档不存在或更新失败', 404);
        return res.status(response.code).json(response);
      }
      return res.json(success(updatedDocument, '文档更新成功'));
    } catch (error: any) {
      const response = fail(error.message || '更新文档失败', 500);
      return res.status(response.code).json(response);
    }
  }

  public async deleteDocument(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const deleterName = (req.user as any)?.username || 'system';
      const successFlag = await documentService.delete(parseInt(id), deleterName, req);
      if (!successFlag) {
        const response = fail('文档不存在或删除失败', 404);
        return res.status(response.code).json(response);
      }
      // Success with no data, provide message
      return res.json(success(null, '文档删除成功')); 
    } catch (error: any) {
      const response = fail(error.message || '删除文档失败', 500);
      return res.status(response.code).json(response);
    }
  }

  // uploadDocument method might need similar adjustments if it uses the service
  // public async uploadDocument(...) { ... }
}

export default new DocumentController(); 