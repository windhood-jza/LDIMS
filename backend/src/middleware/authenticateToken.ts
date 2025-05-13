import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { fail } from "../utils/response";
import { JwtPayload } from "@ldims/types";

// 扩展 Express 的 Request 接口以包含 user 属性
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // 附加解码后的用户信息
    }
  }
}

/**
 * JWT 验证中间件
 * @param req Express 请求对象
 * @param res Express 响应对象
 * @param next Express next 函数
 */
const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 从 Authorization 请求头获取 token (格式: Bearer TOKEN)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json(fail("未提供访问令牌", 401));
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET 未配置!");
    res.status(500).json(fail("服务器配置错误", 500));
    return;
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      console.error("JWT 验证失败:", err.message);
      // 可以根据错误类型返回不同消息，如 TokenExpiredError
      if (err.name === "TokenExpiredError") {
        return res.status(401).json(fail("访问令牌已过期", 401));
      }
      return res.status(403).json(fail("访问令牌无效", 403)); // Forbidden
    }

    // 验证通过，将解码后的 payload 附加到请求对象上
    req.user = decoded as JwtPayload;
    console.log("JWT 验证通过, 用户:", req.user?.username);
    next(); // 将控制权传递给下一个中间件或路由处理程序
  });
};

export default authenticateToken;
