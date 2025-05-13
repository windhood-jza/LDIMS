/**
 * 用户管理相关的类型定义
 */
/**
 * 用户列表项信息
 */
export interface UserInfo {
    id: number;
    username: string;
    realName: string;
    role: string;
    departmentId: number;
    departmentName: string;
    status: number;
    createdAt: string;
    updatedAt: string;
}
/**
 * 创建用户请求体
 */
export interface CreateUserRequest {
    username: string;
    password: string;
    realName: string;
    role: 'admin' | 'editor' | 'viewer';
    departmentId: number;
    status?: number;
}
/**
 * 更新用户请求体
 */
export interface UpdateUserRequest {
    username?: string;
    password?: string;
    realName?: string;
    role?: 'admin' | 'editor' | 'viewer';
    departmentId?: number;
    status?: number;
}
