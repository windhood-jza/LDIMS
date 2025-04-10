import { Request, Response } from 'express';
import DepartmentService from '../services/DepartmentService';
import { success, fail } from '../utils/response';
import { CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/department';

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
      const newDept = await DepartmentService.createDepartment(deptData);
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

      const updatedDept = await DepartmentService.updateDepartment(deptId, deptData);
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

      const deleted = await DepartmentService.deleteDepartment(deptId);
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