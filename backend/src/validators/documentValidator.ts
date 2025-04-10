import { body, validationResult, param } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/response'; // 修正：直接导入 fail

// 创建文档的验证规则
export const validateCreateDocument = [
    body('docName').notEmpty().withMessage('文档名称不能为空').trim().isLength({ max: 255 }).withMessage('文档名称过长'), // 修正: name -> docName
    body('docTypeId').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('无效的文档类型 ID'), // 修正: 可选，允许 null
    body('sourceDepartmentId').isInt({ gt: 0 }).withMessage('无效的所属部门 ID'), // 修正: departmentId -> sourceDepartmentId
    body('submitter').notEmpty().withMessage('提交人不能为空').trim().isLength({ max: 50 }).withMessage('提交人名称过长'), // 新增
    body('receiver').notEmpty().withMessage('接收人不能为空').trim().isLength({ max: 50 }).withMessage('接收人名称过长'), // 新增
    body('handoverDate').optional({ nullable: true }).isISO8601().toDate().withMessage('无效的交接日期格式 (YYYY-MM-DD)'), // 修正: 可选，允许 null
    body('signer').optional({ nullable: true }).trim().isLength({ max: 50 }).withMessage('签章人名称过长'), // 修正: 可选，允许 null
    body('storageLocation').optional().trim().isLength({ max: 100 }).withMessage('保管位置过长'), // 新增
    body('remarks').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('备注过长'),
];

// 更新文档的验证规则 (允许部分更新)
export const validateUpdateDocument = [
    param('id').isInt({ gt: 0 }).withMessage('路由参数 ID 必须是正整数'),
    body('docName').optional().notEmpty().withMessage('文档名称不能为空').trim().isLength({ max: 255 }).withMessage('文档名称过长'),
    body('docTypeId').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('无效的文档类型 ID'),
    body('sourceDepartmentId').optional().isInt({ gt: 0 }).withMessage('无效的所属部门 ID'),
    body('submitter').optional().notEmpty().withMessage('提交人不能为空').trim().isLength({ max: 50 }).withMessage('提交人名称过长'),
    body('receiver').optional().notEmpty().withMessage('接收人不能为空').trim().isLength({ max: 50 }).withMessage('接收人名称过长'),
    body('handoverDate').optional({ nullable: true }).isISO8601().toDate().withMessage('无效的交接日期格式 (YYYY-MM-DD)'),
    body('signer').optional({ nullable: true }).trim().isLength({ max: 50 }).withMessage('签章人名称过长'),
    body('storageLocation').optional().trim().isLength({ max: 100 }).withMessage('保管位置过长'),
    body('remarks').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('备注过长'),
];

// 处理验证错误的中间件
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array({ onlyFirstError: true })[0];
        res.status(400).json(fail(firstError.msg, 400)); // 修正：使用 fail
    } else {
        next();
    }
}; 