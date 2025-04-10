import { Router, Request, Response, NextFunction } from 'express';
import { DocTypeService } from '../services/DocTypeService'; // 注意路径
import { success, fail } from '../utils/response';
// import { authenticateToken, isAdmin } from '../middleware/auth'; // 假设有认证和权限中间件

const router = Router();

// 实例化 Service (这里需要确定 Service 的实例化方式)
// 方案一：简单实例化 (如果 Service 没有复杂依赖)
const docTypeService = new DocTypeService();
// 方案二：依赖注入容器 (如果项目使用)
// const docTypeService = container.get(DocTypeService);

// Middleware for checking admin role (placeholder)
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore - Assume user info is attached to req after authentication
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json(fail('权限不足，需要管理员权限'));
  }
};
// Authentication middleware (placeholder)
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
   // Implement your JWT verification logic here
   // If valid, attach user info to req: req.user = decodedPayload;
   // For now, just pass through or add a basic check
   // @ts-ignore
   if (true) { // Replace with actual token check logic
       // @ts-ignore - Placeholder user
       req.user = { id: 1, username: 'admin', role: 'admin' }; // Example user, replace with actual decoded user
       next();
   } else {
       res.status(401).json(fail('未授权或Token无效'));
   }
};

// GET /api/v1/doctypes/tree - 获取文档类型树 (已登录即可访问)
router.get('/tree', authenticateToken, async (req, res, next) => {
  try {
    const treeData = await docTypeService.getDocTypeTree();
    res.json(success(treeData));
  } catch (error) {
    console.error('获取文档类型树失败:', error);
    // 使用全局错误处理或返回错误
    next(error); // 传递给全局错误处理
    // 或者: res.status(500).json(fail('获取文档类型树失败'));
  }
});

// --- 取消注释并实现 CRUD 路由 ---

// POST /api/v1/doctypes - 创建文档类型 (需要管理员权限)
router.post('/', authenticateToken, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // --- Input Validation ---
    const { name, parentId, sortOrder, description } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json(fail('类型名称不能为空'));
        return;
    }
    if (parentId !== null && parentId !== undefined && (typeof parentId !== 'number' || !Number.isInteger(parentId) || parentId < 0)) {
        res.status(400).json(fail('无效的上级类型ID'));
        return;
    }
    // Add more validation as needed

    // @ts-ignore - Get userId from authenticated request
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json(fail('无法获取用户信息'));
        return;
    }

    const createdDocType = await docTypeService.create({ name, parentId, sortOrder, description }, userId);
    res.status(201).json(success(createdDocType, '创建成功'));
  } catch (error: any) { // Catch specific errors if possible
    if (error.message === '指定的上级类型不存在') {
         res.status(400).json(fail(error.message));
    } else {
         next(error); // Pass to global error handler
    }
  }
});

// PUT /api/v1/doctypes/:id - 更新文档类型 (需要管理员权限)
router.put('/:id', authenticateToken, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json(fail('无效的文档类型ID'));
        return;
    }
    // --- Input Validation ---
    const { name, parentId, sortOrder, description } = req.body;
     if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
         res.status(400).json(fail('类型名称不能为空'));
         return;
     }
     if (parentId !== undefined && parentId !== null && (typeof parentId !== 'number' || !Number.isInteger(parentId) || parentId < 0)) {
         res.status(400).json(fail('无效的上级类型ID'));
         return;
     }
     // Add more validation

    const updatedDocType = await docTypeService.update(id, { name, parentId, sortOrder, description });
    if (!updatedDocType) {
      res.status(404).json(fail('文档类型未找到'));
      return;
    }
    res.json(success(updatedDocType, '更新成功'));
  } catch (error: any) {
     if (error.message === '指定的上级类型不存在' || error.message === '不能将类型的上级设置为自身') {
         res.status(400).json(fail(error.message));
     } else {
        next(error);
     }
  }
});

// DELETE /api/v1/doctypes/:id - 删除文档类型 (需要管理员权限)
router.delete('/:id', authenticateToken, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
     if (isNaN(id)) {
         res.status(400).json(fail('无效的文档类型ID'));
         return;
     }

    const deleted = await docTypeService.delete(id);
    if (!deleted) {
         res.status(404).json(fail('文档类型未找到或无法删除'));
         return;
    }
    res.json(success(null, '删除成功'));
  } catch (error: any) {
     if (error.message === '请先删除该类型下的所有子类型') {
        res.status(400).json(fail(error.message));
     } else {
        next(error);
     }
  }
});

// GET /api/v1/doctypes/:id - 获取单个文档类型信息 (已登录即可访问)
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
     if (isNaN(id)) {
         res.status(400).json(fail('无效的文档类型ID'));
         return;
     }
    const docType = await docTypeService.info(id);
    if (!docType) {
      res.status(404).json(fail('文档类型未找到'));
      return;
    }
    res.json(success(docType));
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/doctypes - 获取文档类型列表 (分页/查询) (已登录即可访问)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    // Pass query parameters to the service layer
    const result = await docTypeService.list(req.query);
    res.json(success(result));
  } catch (error) {
    next(error);
  }
});


export default router; 