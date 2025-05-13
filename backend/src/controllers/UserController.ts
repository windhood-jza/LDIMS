import { Request, Response } from "express";
import UserService from "../services/UserService";
import { success, fail, page as pageResponse } from "../utils/response"; // 引入分页响应
import { CreateUserRequest, UpdateUserRequest } from "@ldims/types";
import { body } from "express-validator";

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
        pageSize: req.query.pageSize
          ? parseInt(req.query.pageSize as string, 10)
          : 20,
        keyword: req.query.keyword as string | undefined,
        departmentId: req.query.departmentId
          ? parseInt(req.query.departmentId as string, 10)
          : undefined,
        role: req.query.role as string | undefined,
        status:
          req.query.status !== undefined
            ? parseInt(req.query.status as string, 10)
            : undefined,
      };

      const pageResult = await UserService.getUsers(query);
      res.json(
        pageResponse(
          pageResult.list,
          pageResult.total,
          pageResult.page,
          pageResult.pageSize
        )
      );
    } catch (error: any) {
      console.error("获取用户列表控制器出错:", error);
      res
        .status(500)
        .json(fail(error.message || "获取用户列表时发生服务器错误", 500));
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
      const newUser = await UserService.createUser(userData, req);
      res.status(201).json(success(newUser, "用户创建成功"));
    } catch (error: any) {
      console.error("创建用户控制器出错:", error);
      // 可以根据错误类型返回不同状态码，例如 Joi 验证错误返回 400
      res
        .status(500)
        .json(fail(error.message || "创建用户时发生服务器错误", 500));
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
        res.status(400).json(fail("无效的用户 ID", 400));
        return;
      }
      const user = await UserService.getUserById(userId);
      if (!user) {
        res.status(404).json(fail("未找到指定用户", 404));
      } else {
        res.json(success(user));
      }
    } catch (error: any) {
      console.error("获取单个用户控制器出错:", error);
      res
        .status(500)
        .json(fail(error.message || "获取用户信息时发生服务器错误", 500));
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
        res.status(400).json(fail("无效的用户 ID", 400));
        return;
      }
      const userData: UpdateUserRequest = req.body;
      // 注意：更新操作的权限检查通常在中间件或 Service 层完成
      const updatedUser = await UserService.updateUser(userId, userData, req);
      if (!updatedUser) {
        res.status(404).json(fail("未找到指定用户或更新失败", 404));
      } else {
        res.json(success(updatedUser, "用户信息更新成功"));
      }
    } catch (error: any) {
      console.error("更新用户控制器出错:", error);
      // 可以根据错误类型返回不同状态码
      res
        .status(500)
        .json(fail(error.message || "更新用户信息时发生服务器错误", 500));
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
        res.status(400).json(fail("无效的用户 ID", 400));
        return;
      }
      // 注意：删除操作的权限检查通常在中间件或 Service 层完成
      const deleted = await UserService.deleteUser(userId, req);
      if (!deleted) {
        res.status(404).json(fail("未找到指定用户或删除失败", 404));
      } else {
        res.json(success(null, "用户删除成功"));
      }
    } catch (error: any) {
      console.error("删除用户控制器出错:", error);
      res
        .status(500)
        .json(fail(error.message || "删除用户时发生服务器错误", 500));
    }
  }

  /**
   * 更新用户状态
   * @param req Express 请求对象 (params 包含 id, body 包含 status)
   * @param res Express 响应对象
   */
  public async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        res.status(400).json(fail("无效的用户 ID", 400));
        return;
      }
      const status = parseInt(req.body.status, 10);
      if (isNaN(status) || (status !== 0 && status !== 1)) {
        res.status(400).json(fail("无效的用户状态", 400));
        return;
      }
      // 注意：更新操作的权限检查通常在中间件或 Service 层完成
      const updated = await UserService.updateUserStatus(
        userId,
        status as 0 | 1,
        req
      );
      if (!updated) {
        res.status(404).json(fail("未找到指定用户或更新失败", 404));
      } else {
        res.json(success(null, "用户状态更新成功"));
      }
    } catch (error: any) {
      console.error("更新用户状态控制器出错:", error);
      // 可以根据错误类型返回不同状态码
      res
        .status(500)
        .json(fail(error.message || "更新用户状态时发生服务器错误", 500));
    }
  }

  /**
   * 重置用户密码
   * @param req Express 请求对象 (params 包含 id, body 包含 newPassword)
   * @param res Express 响应对象
   */
  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        res.status(400).json(fail("无效的用户 ID", 400));
        return;
      }
      const { newPassword } = req.body;
      if (!newPassword || typeof newPassword !== "string") {
        res.status(400).json(fail("无效的密码", 400));
        return;
      }

      const updated = await UserService.resetPassword(userId, newPassword, req);
      if (!updated) {
        res.status(404).json(fail("未找到指定用户或重置密码失败", 404));
      } else {
        res.json(success(null, "用户密码重置成功"));
      }
    } catch (error: any) {
      console.error("重置用户密码控制器出错:", error);
      res
        .status(500)
        .json(fail(error.message || "重置用户密码时发生服务器错误", 500));
    }
  }

  // 验证创建用户的输入
  public createUserValidation = [
    body("username")
      .notEmpty()
      .withMessage("用户名不能为空")
      .isLength({ min: 3, max: 20 })
      .withMessage("用户名长度必须在 3 到 20 个字符之间")
      .isAlphanumeric()
      .withMessage("用户名只能包含字母和数字") // Added isAlphanumeric
      .trim(), // Added trim
    body("password")
      .notEmpty()
      .withMessage("密码不能为空")
      .isLength({ min: 6 })
      .withMessage("密码长度至少需要 6 个字符"),
    body("realName")
      .notEmpty()
      .withMessage("真实姓名不能为空")
      .isLength({ max: 50 })
      .withMessage("真实姓名不能超过 50 个字符")
      .trim(), // Added trim
    body("email")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("请输入有效的邮箱地址")
      .trim(), // Added trim
    body("departmentId")
      .notEmpty()
      .withMessage("部门 ID 不能为空")
      .isInt({ gt: 0 })
      .withMessage("部门 ID 必须是正整数"),
    body("status")
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage("状态值必须是 0 或 1"),
  ];

  // 验证更新用户的输入 (不允许更新用户名和密码)
  public updateUserValidation = [
    body("realName")
      .optional()
      .notEmpty()
      .withMessage("真实姓名不能为空")
      .isLength({ max: 50 })
      .withMessage("真实姓名不能超过 50 个字符")
      .trim(), // Added trim
    body("email")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("请输入有效的邮箱地址")
      .trim(), // Added trim
    body("departmentId")
      .optional()
      .notEmpty()
      .withMessage("部门 ID 不能为空")
      .isInt({ gt: 0 })
      .withMessage("部门 ID 必须是正整数"),
    body("status")
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage("状态值必须是 0 或 1"),
  ];

  // 验证重置密码的输入
  public resetPasswordValidation = [
    body("password")
      .notEmpty()
      .withMessage("新密码不能为空")
      .isLength({ min: 6 })
      .withMessage("密码长度至少需要 6 个字符"),
  ];
}

export default new UserController();
