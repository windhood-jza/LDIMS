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
       // 成功时只返回 data 部分 (如果后端返回 {code, data, message})
       // 检查 res.data 是否存在，如果后端有时直接返回 null 或空，则返回 null
       return res ? (res.data !== undefined ? res.data : res) : null; 
       // 如果后端有时直接返回数据而非 {code, data, message} 结构，则可能需要更复杂的判断
       // return res;
    }
  },
  (error) => {
    console.error('Response error:', error); // for debug

    // 检查是否存在 error.response (网络错误或 CORS 等问题可能没有 response)
    if (error.response) {
        const status = error.response.status;
        const errMsg = error.response.data?.message || error.message || '请求失败';

        if (status === 401) {
            // 401 未授权 (Token 无效、过期等)
            ElMessage.error('登录已过期或无效，请重新登录');
            // 清除本地 token
            localStorage.removeItem('authToken');
            // 跳转到登录页 (需要引入 Vue Router 实例或使用 window.location)
            // import router from '../router'; // 假设 router 实例在此处可用
            // router.push('/login');
            window.location.href = '/login'; // 简单跳转
            return Promise.reject(new Error('Unauthorized')); // 阻止后续处理
        } else if (status === 403) {
            // 403 禁止访问 (权限不足)
            ElMessage.error(errMsg || '权限不足，无法访问该资源');
            // 这里可以根据需要决定是否跳转，或者仅仅提示
            return Promise.reject(new Error('Forbidden')); // 阻止后续处理
        } else {
            // 其他 HTTP 错误 (404, 500 etc.)
            ElMessage.error(`${status}: ${errMsg}`);
        }
    } else if (error.request) {
      // 请求已发出，但没有收到响应 (例如网络断开)
      ElMessage.error('网络请求超时或无响应，请检查网络连接');
    } else {
      // 发送请求时触发了一些错误 (例如请求配置错误)
      ElMessage.error(`请求发送失败: ${error.message}`);
    }

    return Promise.reject(error); // 继续传递错误，以便调用处可以捕获
  }
);

export default instance; 