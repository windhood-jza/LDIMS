import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models"; // 从模型入口导入 User
import { LoginRequest, ChangePasswordRequest } from "@ldims/types"; // 引入 ChangePasswordRequest

class AuthService {
  /**
   * 用户登录
   * @param credentials - 用户名和密码
   * @returns 包含用户信息的 token 或 null
   */
  public async login(credentials: LoginRequest): Promise<string | null> {
    const { username, password } = credentials;

    // 1. 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log(`登录失败：用户 ${username} 不存在`);
      return null; // 用户不存在
    }

    // 2. 检查用户状态
    if (user.status !== 1) {
      console.log(`登录失败：用户 ${username} 已被禁用`);
      return null; // 用户被禁用
    }

    // 3. 验证密码 (需求是明文存储，但这里保留 bcrypt 的逻辑作为最佳实践参考)
    // 注意：实际应使用 bcrypt.compare(password, user.password) 进行比较
    // 由于需求规定密码是明文存储，我们直接比较字符串
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = password === user.password;

    if (!isMatch) {
      console.log(`登录失败：用户 ${username} 密码错误`);
      return null; // 密码错误
    }

    // 4. 生成 JWT
    const jwtSecret: string = process.env.JWT_SECRET || "your_default_secret";
    const expiresInOption = process.env.JWT_EXPIRES_IN || "24h"; // 保持原样

    if (!jwtSecret) {
      console.error("JWT_SECRET 未配置!");
      throw new Error("服务器配置错误");
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    // 使用类型断言 `as any` 或更具体的类型 (如果确定)
    const signOptions: SignOptions = {
      expiresIn: expiresInOption as any, // 使用类型断言绕过检查
    };

    const token = jwt.sign(payload, jwtSecret, signOptions);
    console.log(`用户 ${username} 登录成功`);
    return token;
  }

  /**
   * 修改用户密码
   * @param userId - 用户 ID (来自 JWT)
   * @param passwordData - 包含旧密码和新密码
   * @returns boolean - 是否成功
   * @throws Error - 如果用户不存在或旧密码错误
   */
  public async changePassword(
    userId: number,
    passwordData: ChangePasswordRequest
  ): Promise<boolean> {
    const { oldPassword, newPassword } = passwordData;

    // 1. 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      console.error(`修改密码失败：用户 ID ${userId} 不存在`);
      throw new Error("用户不存在");
    }

    // 2. 验证旧密码
    // 同样，这里是明文比较
    // const isMatch = await bcrypt.compare(oldPassword, user.password);
    const isMatch = oldPassword === user.password;

    if (!isMatch) {
      console.log(`用户 ${user.username} 修改密码失败：旧密码错误`);
      throw new Error("旧密码错误");
    }

    // 3. 更新密码
    // 如果是哈希存储，需要先哈希新密码：
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newPassword, salt);
    // user.password = hashedPassword;
    user.password = newPassword; // 直接更新为新密码（明文）

    await user.save(); // 保存更改到数据库
    console.log(`用户 ${user.username} 密码修改成功`);
    return true;
  }
}

export default new AuthService();
