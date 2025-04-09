import axios from 'axios';
import { ElMessage } from 'element-plus'; // 引入 Element Plus 消息提示

// 创建 axios 实例
const instance = axios.create({
  baseURL: '/api/v1', // 再次将 baseURL 修改为 /api/v1
  timeout: 5000, // 请求超时时间
});

// 请求拦截器 (可选, 用于添加 token 等)
instance.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证 Token 等
    const token = localStorage.getItem('authToken'); // 从 localStorage 读取 authToken
    if (token) {
      // Bearer 是常用的认证方案，请根据后端实际要求调整
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error); // for debug
    return Promise.reject(error);
  }
);

// 响应拦截器 (用于统一处理错误)
instance.interceptors.response.use(
  (response) => {
    // API 响应的 data 部分
    const res = response.data;
    // 这里可以根据后端接口定义的成功/失败状态码进行判断
    // 假设后端返回 { code: 0, data: ..., message: '...' } 结构
    // 注意: 这里的 code 判断可能需要根据你的后端实际返回值调整
    if (res && res.code !== undefined && res.code !== 0 && res.code !== 200) { // 假设 0 或 200 为成功, 确保 res 和 res.code 存在
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000,
      });
      // 可以根据不同的错误码处理不同的逻辑，例如 401 未授权跳转登录页
      return Promise.reject(new Error(res.message || 'Error'));
    } else {
      // 成功时只返回 data 部分 (如果后端直接返回数据而非 {code, data, message} 结构，则返回 res)
      // return res; // 如果后端直接返回数据
       return res.data; // 如果后端返回 {code, data, message}
    }
  },
  (error) => {
    console.error('Response error:', error); // for debug
    ElMessage({
      message: error.message || '请求失败，请检查网络或联系管理员', // 提供更友好的默认错误消息
      type: 'error',
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);

export default instance; 