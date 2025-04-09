import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/response'; // 引入统一响应格式中的 fail

/**
 * 检查用户是否具有管理员角色
 * 假设 authenticateToken 中间件已将用户角色附加到 req.user.role
 */
const checkAdminRole = (req: Request, res: Response, next: NextFunction) => {
  // authenticateToken 中间件应该已经验证了 req.user 的存在
  // @ts-ignore // 假设 req.user 存在且包含 role
  if (req.user && req.user.role === 'admin') {
    next(); // 用户是管理员，继续处理请求
  } else {
    // 用户不是管理员，返回 403 Forbidden
    res.status(403).json(fail('权限不足，需要管理员权限', 403));
  }
};

export default checkAdminRole; 