import request from '../request';
import type { UserInfo } from '@backend-types/user';
import type { PageResult } from '@/types/common';

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns Promise containing the page result { list, total }
 */
export const getUsers = (params: any): Promise<PageResult<UserInfo>> => {
  return request.get<PageResult<UserInfo>>('/users', { params });
};

/**
 * 创建用户
 * @param data 用户数据
 */
export const createUser = (data: Partial<UserInfo>) => {
  return request.post('/users', data);
};

/**
 * 更新用户信息
 * @param data 用户数据
 */
export const updateUser = (data: Partial<UserInfo>) => {
  return request.put(`/users/${data.id}`, data);
};

/**
 * 删除用户
 * @param id 用户ID
 */
export const deleteUser = (id: number) => {
  return request.delete(`/users/${id}`);
};

/**
 * 更新用户状态
 * @param id 用户ID
 * @param status 状态值
 */
export const updateUserStatus = (id: number, status: number) => {
  return request.patch(`/users/${id}/status`, { status });
};

/**
 * 重置用户密码
 * @param id 用户ID
 * @param data 请求体，应包含 newPassword
 */
export const resetUserPassword = (id: number, data: { newPassword: string }) => {
  return request.post(`/users/${id}/reset-password`, data);
};

/**
 * 获取部门列表
 */
export const getDepartments = () => {
  return request.get('/departments');
};

// --- 后续添加 createUser, updateUser, deleteUser 等 API 调用函数 --- 