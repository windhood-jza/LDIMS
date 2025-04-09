import axios from 'axios';
import type { PageResult, ApiResponse } from '../../../backend/src/utils/response'; // 复用后端类型
import type { UserInfo } from '../../../backend/src/types/user'; // 复用后端类型

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '/api/v1', // 基础 URL，Vite 会处理代理或直接请求
  timeout: 10000, // 请求超时时间
});

// 添加请求拦截器 - 附加 JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器 - 处理基本错误和数据提取
apiClient.interceptors.response.use(
  (response) => {
    // 假设后端返回的标准格式为 { code: 200, message: '...', data: ... }
    // 如果响应成功 (code 200)，直接返回 data 部分
    if (response.data && response.data.code === 200) {
      return response.data.data; // 直接返回 data
    } else {
      // 处理后端返回的业务错误 (code !== 200)
      console.error('API 业务错误:', response.data?.message || '未知错误');
      // 可以使用 ElMessage 等提示用户
      return Promise.reject(new Error(response.data?.message || '请求失败'));
    }
  },
  (error) => {
    // 处理网络错误或服务器错误 (HTTP status code 非 2xx)
    console.error('API 请求错误:', error.response?.status, error.message);
    // 可以根据状态码做不同处理，例如 401 跳转登录页
    if (error.response?.status === 401) {
       console.log('认证失败或 Token 过期，跳转登录页');
       // 清理本地存储
       localStorage.removeItem('authToken');
       localStorage.removeItem('userInfo');
       // 跳转到登录页 (这里需要 router 实例，通常在组件中处理或通过 pinia 等状态管理)
       // router.push('/login'); 
       // 暂时只抛出错误
       return Promise.reject(new Error('认证失败，请重新登录'));
    }
    return Promise.reject(error);
  }
);

// 定义获取用户列表的请求参数类型 (可以从后端复用或单独定义)
interface GetUsersParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  departmentId?: number;
  role?: string;
  status?: number;
}

/**
 * 获取用户列表 API
 * @param params 查询参数
 * @returns 用户列表的分页结果
 */
export const getUsers = async (params: GetUsersParams): Promise<PageResult<UserInfo>> => {
  // 我们在响应拦截器中已经处理了外层的 ApiResponse，直接返回 data 部分 (PageResult)
  return apiClient.get<PageResult<UserInfo>>('/users', { params });
};

// --- 后续添加 createUser, updateUser, deleteUser 等 API 调用函数 --- 