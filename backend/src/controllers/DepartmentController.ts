import { Request, Response } from 'express';
import DepartmentService from '../services/DepartmentService';
import { success, fail } from '../utils/response';
import { CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/department';
import { JwtPayload } from '../types/auth'; // 引入 JwtPayload 类型
import { body } from 'express-validator';

class DepartmentController {

  /**
   * 获取部门列表
   * @param req Express 请求对象
   * @param res Express 响应对象
   */
  public async getDepartments(req: Request, res: Response): Promise<void> {
    try {
      // 暂时只实现获取扁平列表，后续可以根据参数决定是获取列表还是树
      const data = await DepartmentService.getDepartmentList();
      res.json(success(data));
    } catch (error: any) {
      console.error('获取部门列表控制器出错:', error);
      res.status(500).json(fail(error.message || '获取部门列表失败'));
    }
  }

  /**
   * 获取部门树
   * @param req Express 请求对象
   * @param res Express 响应对象
   */
  public async getDepartmentTree(req: Request, res: Response): Promise<void> {
    try {
      const data = await DepartmentService.getDepartmentTree();
      res.json(success(data));
    } catch (error: any) {
      console.error('获取部门树控制器出错:', error);
      res.status(500).json(fail(error.message || '获取部门树失败'));
    }
  }

  // 验证创建部门的输入
  public createDepartmentValidation = [
    body('name')
      .notEmpty().withMessage('部门名称不能为空')
      .isLength({ max: 50 }).withMessage('部门名称不能超过 50 个字符')
      .trim(), // Added trim
    body('code')
      .notEmpty().withMessage('部门编码不能为空')
      .isLength({ max: 50 }).withMessage('部门编码不能超过 50 个字符')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('部门编码只能包含字母、数字和下划线') // Added stricter pattern match
      .trim(), // Added trim
    body('parentId')
      .optional({ nullable: true })
      .isInt({ gt: 0 }).withMessage('父部门 ID 必须是正整数'),
    body('sortOrder')
      .optional()
      .isInt().withMessage('排序号必须是整数'),
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 }).withMessage('状态值必须是 0 或 1')
  ];

  // 验证更新部门的输入
  public updateDepartmentValidation = [
    body('name')
      .optional()
      .notEmpty().withMessage('部门名称不能为空')
      .isLength({ max: 50 }).withMessage('部门名称不能超过 50 个字符')
      .trim(), // Added trim
    body('code')
      .optional()
      .notEmpty().withMessage('部门编码不能为空')
      .isLength({ max: 50 }).withMessage('部门编码不能超过 50 个字符')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('部门编码只能包含字母、数字和下划线') // Added stricter pattern match
      .trim(), // Added trim
    body('parentId')
      .optional({ nullable: true })
      .isInt({ gt: 0 }).withMessage('父部门 ID 必须是正整数')
      .custom((value, { req }) => {
        // 防止将部门的父级设置为自身或其子部门，这里仅做基本检查，服务层会做更严谨的循环依赖检查
        if (req.params && value !== null && value === parseInt(req.params.id, 10)) {
          throw new Error('不能将部门设置为自身的父部门');
        }
        return true;
      }),
    body('sortOrder')
      .optional()
      .isInt().withMessage('排序号必须是整数'),
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 }).withMessage('状态值必须是 0 或 1')
  ];

  // 验证删除部门的输入
  public deleteDepartmentValidation = []; // 通常只需要 ID 在 URL 中

  /**
   * 创建新部门
   * @param req Express 请求对象 (body 包含 CreateDepartmentRequest)
   * @param res Express 响应对象
   */
  public async createDepartment(req: Request, res: Response): Promise<void> {
    try {
      const deptData: CreateDepartmentRequest = req.body;
      if (!deptData.name) {
         res.status(400).json(fail('部门名称不能为空'));
         return;
      }
      
      // 从请求中获取用户ID
      const userData = req.user as JwtPayload | undefined;
      const userId = userData?.id || 0;
      
      // 传递请求对象 req 到服务方法
      const newDept = await DepartmentService.createDepartment(deptData, userId, req);
      
      res.status(201).json(success(newDept, '部门创建成功'));
    } catch (error: any) {
      console.error('创建部门控制器出错:', error);
      if (error.message.includes('已存在名为')) {
         res.status(409).json(fail(error.message, 409));
      } else {
         res.status(500).json(fail(error.message || '创建部门失败'));
      }
    }
  }

  /**
   * 更新部门信息
   * @param req Express 请求对象 (params 包含 id, body 包含 UpdateDepartmentRequest)
   * @param res Express 响应对象
   */
  public async updateDepartment(req: Request, res: Response): Promise<void> {
    try {
      const deptId = parseInt(req.params.id, 10);
      if (isNaN(deptId)) {
        res.status(400).json(fail('无效的部门 ID'));
        return;
      }
      
      const deptData: UpdateDepartmentRequest = req.body;
      if (Object.keys(deptData).length === 0) {
           res.status(400).json(fail('未提供任何更新数据'));
           return;
      }

      // 从请求中获取用户ID
      const userData = req.user as JwtPayload | undefined;
      const userId = userData?.id || 0;
      
      // 传递请求对象 req 到服务方法
      const updatedDept = await DepartmentService.updateDepartment(deptId, deptData, userId, req);
      
      if (!updatedDept) {
        res.status(404).json(fail('未找到指定部门或更新失败', 404));
      } else {
        res.json(success(updatedDept, '部门信息更新成功'));
      }
    } catch (error: any) {
      console.error('更新部门控制器出错:', error);
       if (error.message.includes('已存在名为') || error.message.includes('不能将部门')) {
         res.status(400).json(fail(error.message, 400));
      } else {
         res.status(500).json(fail(error.message || '更新部门信息失败'));
      }
    }
  }

  /**
   * 删除部门
   * @param req Express 请求对象 (params 包含 id)
   * @param res Express 响应对象
   */
  public async deleteDepartment(req: Request, res: Response): Promise<void> {
    try {
      const deptId = parseInt(req.params.id, 10);
      if (isNaN(deptId)) {
        res.status(400).json(fail('无效的部门 ID'));
        return;
      }

      // 从请求中获取用户ID
      const userData = req.user as JwtPayload | undefined;
      const userId = userData?.id || 0;
      
      // 传递请求对象 req 到服务方法
      const deleted = await DepartmentService.deleteDepartment(deptId, userId, req);
      
      if (!deleted) {
        res.status(404).json(fail('未找到指定部门或删除失败', 404));
      } else {
        res.json(success(null, '部门删除成功'));
      }
    } catch (error: any) {
      console.error('删除部门控制器出错:', error);
       if (error.message.includes('存在子部门')) {
         res.status(400).json(fail(error.message, 400));
      } else {
        res.status(500).json(fail(error.message || '删除部门失败'));
      }
    }
  }
}

export default new DepartmentController(); 