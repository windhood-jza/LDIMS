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

  // --- 后续添加 createUser, getUserById, updateUser, deleteUser 控制器方法 ---

}

export default new UserController(); 