import { body } from 'express-validator';

class DocTypeController {
  // ... (getDocTypes method) ...

  // 验证创建文档类型的输入
  public createDocTypeValidation = [
    body('name')
      .notEmpty().withMessage('文档类型名称不能为空')
      .isLength({ max: 50 }).withMessage('名称不能超过 50 个字符')
      .trim(),
    body('code')
      .notEmpty().withMessage('文档类型编码不能为空')
      .isLength({ max: 50 }).withMessage('编码不能超过 50 个字符')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('编码只能包含字母、数字和下划线')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 255 }).withMessage('描述不能超过 255 个字符')
      .trim()
  ];

  // 验证更新文档类型的输入
  public updateDocTypeValidation = [
    body('name')
      .optional()
      .notEmpty().withMessage('文档类型名称不能为空')
      .isLength({ max: 50 }).withMessage('名称不能超过 50 个字符')
      .trim(),
    body('code')
      .optional()
      .notEmpty().withMessage('文档类型编码不能为空')
      .isLength({ max: 50 }).withMessage('编码不能超过 50 个字符')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('编码只能包含字母、数字和下划线')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 255 }).withMessage('描述不能超过 255 个字符')
      .trim()
  ];

  // 验证删除文档类型的输入
  public deleteDocTypeValidation = []; // Usually just ID in URL

  // 控制器方法 (createDocType, updateDocType, deleteDocType)
  // ... (保持不变)
}

export default new DocTypeController(); 