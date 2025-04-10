import { Request, Response } from 'express';
import UserService from '../services/UserService';
import { success, fail, page as pageResponse } from '../utils/response'; // 引入分页响应
import { CreateUserRequest, UpdateUserRequest } from '../types/user';

class UserController {
  /**
   * 获取用户列表
   * @param req Express 请求对象
   * @param res Express 响应对象
   */
  public async getUsers(req: Request, res: Response): Promise<void> {
    try {
      // 从查询参数中提取并转换类型
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
        keyword: req.query.keyword as string | undefined,
        departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : undefined,
        role: req.query.role as string | undefined,
        status: req.query.status !== undefined ? parseInt(req.query.status as string, 10) : undefined,
      };

      const pageResult = await UserService.getUsers(query);
      res.json(pageResponse(
        pageResult.list,
        pageResult.total,
        pageResult.page,
        pageResult.pageSize
      ));
    } catch (error: any) {
      console.error('获取用户列表控制器出错:', error);
      res.status(500).json(fail(error.message || '获取用户列表时发生服务器错误', 500));
    }
  }

  /**
   * 创建新用户
   * @param req Express 请求对象 (body 包含 CreateUserRequest)
   * @param res Express 响应对象
   */
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      // 注意：密码处理应该在 Service 层完成
      const newUser = await UserService.createUser(userData);
      res.status(201).json(success(newUser, '用户创建成功'));
    } catch (error: any) {
      console.error('创建用户控制器出错:', error);
      // 可以根据错误类型返回不同状态码，例如 Joi 验证错误返回 400
      res.status(500).json(fail(error.message || '创建用户时发生服务器错误', 500));
    }
  }

  /**
   * 根据 ID 获取单个用户信息
   * @param req Express 请求对象 (params 包含 id)
   * @param res Express 响应对象
   */
  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        res.status(400).json(fail('无效的用户 ID', 400));
        return;
      }
      const user = await UserService.getUserById(userId);
      if (!user) {
        res.status(404).json(fail('未找到指定用户', 404));
      } else {
        res.json(success(user));
      }
    } catch (error: any) {
      console.error('获取单个用户控制器出错:', error);
      res.status(500).json(fail(error.message || '获取用户信息时发生服务器错误', 500));
    }
  }

  /**
   * 更新用户信息
   * @param req Express 请求对象 (params 包含 id, body 包含 UpdateUserRequest)
   * @param res Express 响应对象
   */
  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        res.status(400).json(fail('无效的用户 ID', 400));
        return;
      }
      const userData: UpdateUserRequest = req.body;
      // 注意：更新操作的权限检查通常在中间件或 Service 层完成
      const updatedUser = await UserService.updateUser(userId, userData);
      if (!updatedUser) {
        res.status(404).json(fail('未找到指定用户或更新失败', 404));
      } else {
        res.json(success(updatedUser, '用户信息更新成功'));
      }
    } catch (error: any) {
      console.error('更新用户控制器出错:', error);
      // 可以根据错误类型返回不同状态码
      res.status(500).json(fail(error.message || '更新用户信息时发生服务器错误', 500));
    }
  }

  /**
   * 删除用户
   * @param req Express 请求对象 (params 包含 id)
   * @param res Express 响应对象
   */
  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        res.status(400).json(fail('无效的用户 ID', 400));
        return;
      }
      // 注意：删除操作的权限检查通常在中间件或 Service 层完成
      const deleted = await UserService.deleteUser(userId);
      if (!deleted) {
        res.status(404).json(fail('未找到指定用户或删除失败', 404));
      } else {
        res.json(success(null, '用户删除成功'));
      }
    } catch (error: any) {
      console.error('删除用户控制器出错:', error);
      res.status(500).json(fail(error.message || '删除用户时发生服务器错误', 500));
    }
  }

}

export default new UserController(); 