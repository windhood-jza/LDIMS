import axios from 'axios';
import type { ApiResponse } from '../../../../backend/src/utils/response'; // 复用后端类型
import type { LoginRequest } from '../../../../backend/src/types/auth'; // 复用后端类型
import type { UserInfo } from '../../../../backend/src/types/user'; // 用户信息类型

// 使用与 user.ts 相同的 apiClient 实例或单独创建
// 这里假设我们复用，需要将 apiClient 从 user.ts 导出或创建一个公共的 client
// 为了简单，我们暂时在这里重新创建 apiClient 的核心逻辑

const authApiClient = axios.create({
  baseURL: '/api/v1/auth', // 基础 URL 指向认证接口
  timeout: 10000,
});

// 认证 API 通常不需要携带 Token，但响应拦截器可以复用或定制
authApiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.code === 200) {
      return response.data; // 注意：登录接口我们可能需要返回整个 ApiResponse (包含 token 和 user)
    } else {
      return Promise.reject(new Error(response.data?.message || '请求失败'));
    }
  },
  (error) => {
    console.error('Auth API 请求错误:', error.response?.status, error.message);
    // 登录失败通常返回 401，由调用处处理具体错误信息
    const errorMsg = error.response?.data?.message || error.message || '登录请求失败';
    return Promise.reject(new Error(errorMsg));
  }
);

/**
 * 登录用户 API
 * @param credentials 用户名和密码
 * @returns Promise<ApiResponse<{ token: string; user: UserInfo }>> - 返回包含 token 和 user 的完整响应
 */
export const loginUser = async (credentials: LoginRequest): Promise<ApiResponse<{ token: string; user: UserInfo }>> => {
  // Post 请求，第二个参数是请求体
  // 响应拦截器返回整个 response.data，因为我们需要 code, message, data
  return authApiClient.post('/login', credentials);
};

// --- 后续添加修改密码等 API 调用 --- 