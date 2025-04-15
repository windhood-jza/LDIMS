import axios from 'axios';
import { ElMessage } from 'element-plus'; // 引入 Element Plus 消息提示

// 读取环境变量，如果未定义则回退到默认值
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '5000', 10);
console.log(`[request.ts] API baseURL: ${baseURL}, Timeout: ${timeout}`);

// 创建 axios 实例
const instance = axios.create({
  baseURL: baseURL,
  timeout: timeout,
});

// 请求拦截器 (可选, 用于添加 token 等)
instance.interceptors.request.use(
  (config) => {
    console.log('[request.ts:interceptor] Request interceptor START.');
    console.log('[request.ts:interceptor] Original config.params:', JSON.stringify(config.params, null, 2)); // Log initial params

    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[request.ts:interceptor] Token added to headers.');
    } else {
       console.log('[request.ts:interceptor] No token found.');
    }

    // --- Log params just before returning ---
    console.log('[request.ts:interceptor] config.params BEFORE returning config:', JSON.stringify(config.params, null, 2));
    console.log('[request.ts:interceptor] Request interceptor END.');
    return config; // Return config unchanged regarding params
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

    // 检查后端是否返回了 code
    if (res && res.code !== undefined) {
      // 判断是否成功 (code 200 或 201)
      if (res.code === 200 || res.code === 201) {
        // 成功: 返回 data 部分 (如果存在)，否则返回整个 res (例如只有 message)
        return res.data !== undefined ? res.data : res;
      } else {
        // 业务错误 (code 非 200/201)
        ElMessage({
          message: res.message || '业务处理失败',
          type: 'error',
          duration: 5 * 1000,
        });
        // 返回一个包含错误信息的 rejected Promise
        return Promise.reject(new Error(res.message || 'Business Error'));
      }
    } else {
      // 如果后端没有返回 code (或者 res 为空), 但 HTTP 状态码是 2xx，则直接返回整个响应体
      // 这种情况可能发生在直接下载文件等非标准 JSON API 响应
      if (response.status >= 200 && response.status < 300) {
          return res;
      } else {
          // 理论上不应进入这里，因为 HTTP 错误会在下面的 error 处理函数捕获
          // 但作为保险，还是 reject
           ElMessage.error('收到意外的响应格式');
           return Promise.reject(new Error('Unexpected response format'));
      }
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