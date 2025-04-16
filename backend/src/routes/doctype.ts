// LDIMS/backend/src/routes/doctype.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DocTypeService } from '../services/DocTypeService'; // 确认路径
import { success, fail } from '../utils/response';
import authenticateToken from '../middleware/authenticateToken';
import checkAdminRole from '../middleware/checkAdminRole';
import { body, param, validationResult } from 'express-validator'; // 引入验证器和结果处理

// 假设有一个通用的验证错误处理器，如果没有需要创建或直接处理
// import { handleValidationErrors } from '../validators/commonValidators';
// 临时的错误处理函数，如果上面的 validator 不存在
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 直接构建包含 errors 的响应，不使用 fail
      res.status(400).json({
          code: 400,
          message: '请求参数验证失败',
          errors: errors.array()
      });
      // NO RETURN here after sending response
    } else {
        next();
    }
};


// --- 将路由设置封装在函数中 ---
export const createDocTypeRouter = (docTypeService: DocTypeService): Router => {
    const router = Router();

    /**
     * @route   GET /tree
     * @desc    获取文档类型树
     * @access  Private (Authenticated)
     */
    router.get('/tree', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
        try {
             // --- 使用传入的 docTypeService ---
            const treeData = await docTypeService.getDocTypeTree();
            res.json(success(treeData));
        } catch (error) {
            console.error('获取文档类型树失败:', error);
            next(error); // 错误交给全局处理
        }
    });

    /**
     * @route   POST /
     * @desc    创建文档类型
     * @access  Private (Admin)
     */
    router.post(
        '/',
        authenticateToken,
        checkAdminRole,
        [ // 添加验证规则
            body('name').trim().notEmpty().withMessage('类型名称不能为空'),
            body('parentId').optional({ nullable: true }).isInt({ min: 0 }).withMessage('无效的上级类型ID'), // 允许 0 或 null/undefined
            body('sortOrder').optional({ nullable: true }).isInt().withMessage('排序值必须是整数'),
            body('description').optional({ nullable: true }).isString().trim(), // 添加 trim
        ],
        handleValidationErrors, // 处理验证错误
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                // @ts-ignore - 假设 authenticateToken 添加了 user
                const userId = req.user?.id;
                if (!userId) {
                    // 通常 authenticateToken 会处理未授权情况，但以防万一
                    res.status(401).json(fail('无法获取用户信息', 401));
                    return; // <-- Keep return for early exit
                }
                 // --- 使用传入的 docTypeService ---
                const createdDocType = await docTypeService.create(req.body, userId);
                res.status(201).json(success(createdDocType, '创建成功'));
            } catch (error: any) { // Catch specific errors if possible
                // Service 层应该抛出可识别的错误
                // 例如: if (error instanceof ParentNotFoundError) ...
                // 暂时将所有错误传递给全局处理器
                 console.error('创建文档类型路由出错:', error);
                 next(error);
            }
        }
    );

    /**
     * @route   PUT /:id
     * @desc    更新文档类型
     * @access  Private (Admin)
     */
    router.put(
        '/:id',
        authenticateToken,
        checkAdminRole,
        [ // 添加验证规则
            param('id').isInt({ min: 1 }).withMessage('无效的文档类型ID').toInt(), // 添加 toInt
            body('name').optional().trim().notEmpty().withMessage('类型名称不能为空'),
            body('parentId').optional({ nullable: true }).isInt({ min: 0 }).withMessage('无效的上级类型ID'),
            body('sortOrder').optional({ nullable: true }).isInt().withMessage('排序值必须是整数'),
            body('description').optional({ nullable: true }).isString().trim(), // 添加 trim
        ],
        handleValidationErrors,
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                //验证器已转换ID为数字，但仍需检查
                const id = (req.params as any).id as number; // 使用类型断言获取已验证和转换的ID
                
                // 重新添加 userId 的定义
                // @ts-ignore - 假设 authenticateToken 添加了 user
                const userId = req.user?.id;

                // --- 使用传入的 docTypeService ---
                // 传递 req 对象和用户ID用于记录日志
                const updatedDocType = await docTypeService.update(id, req.body, userId, req);
                if (!updatedDocType) {
                    res.status(404).json(fail('文档类型未找到', 404));
                    return; // <-- Keep return for early exit (Not Found)
                }
                res.json(success(updatedDocType, '更新成功'));
            } catch (error) {
                 console.error('更新文档类型路由出错:', error);
                 next(error); // 将错误传递给全局错误处理器
            }
        }
    );

    /**
     * @route   DELETE /:id
     * @desc    删除文档类型
     * @access  Private (Admin)
     */
    router.delete(
        '/:id',
        authenticateToken,
        checkAdminRole,
        [ // 添加验证规则
            param('id').isInt({ min: 1 }).withMessage('无效的文档类型ID').toInt()
        ],
        handleValidationErrors,
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const id = (req.params as any).id as number; // 获取已验证和转换的ID
                
                // 重新添加 userId 的定义
                // @ts-ignore - 假设 authenticateToken 添加了 user
                const userId = req.user?.id;
                
                // --- 使用传入的 docTypeService ---
                // 传递 req 对象和用户ID用于记录日志
                await docTypeService.delete(id, userId, req);
                // delete 方法现在会在找不到或无法删除时抛出错误
                res.json(success(null, '删除成功'));
            } catch (error) {
                 console.error('删除文档类型路由出错:', error);
                 next(error);
            }
        }
    );

    /**
     * @route   GET /:id
     * @desc    获取单个文档类型信息
     * @access  Private (Authenticated)
     */
    router.get(
        '/:id',
        authenticateToken,
        [ // 添加验证规则
            param('id').isInt({ min: 1 }).withMessage('无效的文档类型ID').toInt()
        ],
        handleValidationErrors,
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const id = (req.params as any).id as number; // 获取已验证和转换的ID
                 // --- 使用传入的 docTypeService ---
                const docType = await docTypeService.info(id);
                if (!docType) {
                    // Service 层应处理未找到的情况，但这里可以加一层保险
                    res.status(404).json(fail('文档类型未找到', 404));
                    return; // <-- Keep return for early exit (Not Found)
                }
                res.json(success(docType));
            } catch (error) {
                 console.error('获取单个文档类型路由出错:', error);
                 next(error);
            }
        }
    );

    /**
     * @route   GET /
     * @desc    获取文档类型列表 (分页/查询)
     * @access  Private (Authenticated)
     */
    router.get(
        '/',
        authenticateToken,
        // 可选：添加查询参数验证器 (例如验证 page, pageSize, name 等)
        // [
        //    query('page').optional().isInt({ min: 1 }).toInt(),
        //    query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
        //    query('name').optional().isString().trim(),
        // ],
        // handleValidationErrors,
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                 // --- 使用传入的 docTypeService ---
                // 传递验证和清理后的查询参数
                const result = await docTypeService.list(req.query);
                res.json(success(result));
            } catch (error) {
                 console.error('获取文档类型列表路由出错:', error);
                 next(error);
            }
        }
    );

    return router;
};

// --- 移除旧的默认导出 ---
// export default router;