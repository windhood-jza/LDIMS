/**
 * 认证相关的类型定义
 */
/**
 * 登录请求体
 */
export interface LoginRequest {
    username: string;
    password: string;
}
/**
 * JWT Payload 结构
 */
export interface JwtPayload {
    id: number;
    username: string;
    role: 'admin' | 'editor' | 'viewer';
}
/**
 * 修改密码请求体
 */
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}
