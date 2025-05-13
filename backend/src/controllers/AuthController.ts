import { Request, Response } from "express";
import AuthService from "../services/AuthService";
import { success, fail } from "../utils/response";
import { LoginRequest, ChangePasswordRequest, JwtPayload } from "@ldims/types";
import { User } from "../models"; // 导入 User 模型以获取用户信息

class AuthController {
  /**
   * 处理用户登录请求
   * @param req Express 请求对象
   * @param res Express 响应对象
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginRequest = req.body;

      // 输入验证 (基本)
      if (!credentials.username || !credentials.password) {
        res.status(400).json(fail("用户名和密码不能为空"));
        return;
      }

      const token = await AuthService.login(credentials);

      if (token) {
        // 登录成功，查找用户信息以包含在响应中（不包含密码）
        const user = await User.findOne({
          where: { username: credentials.username },
          attributes: { exclude: ["password", "deletedAt"] }, // 排除敏感信息和逻辑删除字段
        });

        if (!user) {
          // 理论上 AuthService 已处理，但作为保险
          res.status(401).json(fail("登录失败，无法获取用户信息"));
          return;
        }

        res.json(success({ token, user }, "登录成功"));
      } else {
        res.status(401).json(fail("用户名或密码错误，或账户已被禁用"));
      }
    } catch (error: any) {
      console.error("登录控制器出错:", error);
      res.status(500).json(fail(error.message || "登录时发生服务器错误", 500));
    }
  }

  /**
   * 处理修改密码请求
   * @param req Express 请求对象 (需要包含 req.user)
   * @param res Express 响应对象
   */
  public async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // 确认用户已通过 JWT 认证并且 req.user 存在
      const userPayload = req.user as JwtPayload | undefined;
      if (!userPayload) {
        // 这个错误理论上不应该发生，因为 authenticateToken 中间件会处理
        res.status(401).json(fail("用户未认证", 401));
        return;
      }

      const passwordData: ChangePasswordRequest = req.body;

      // 输入验证
      if (!passwordData.oldPassword || !passwordData.newPassword) {
        res.status(400).json(fail("旧密码和新密码不能为空"));
        return;
      }
      // 可以添加新密码复杂性验证等

      const successFlag = await AuthService.changePassword(
        userPayload.id,
        passwordData
      );

      if (successFlag) {
        res.json(success(null, "密码修改成功"));
      } else {
        // AuthService 中会抛出错误，这里主要处理未预料的情况
        res.status(500).json(fail("密码修改失败", 500));
      }
    } catch (error: any) {
      console.error("修改密码控制器出错:", error);
      // 根据 AuthService 抛出的错误返回具体信息
      if (error.message === "用户不存在" || error.message === "旧密码错误") {
        res.status(400).json(fail(error.message));
      } else {
        res
          .status(500)
          .json(fail(error.message || "修改密码时发生服务器错误", 500));
      }
    }
  }
}

export default new AuthController();
