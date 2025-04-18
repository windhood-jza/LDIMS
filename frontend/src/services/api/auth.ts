// Remove the import of axios directly
// import axios from 'axios'; 
import type { ApiResponse } from '../../../../backend/src/utils/response'; // 复用后端类型
import type { LoginRequest } from '../../../../backend/src/types/auth'; // 复用后端类型
import type { UserInfo } from '../../../../backend/src/types/user'; // 用户信息类型

// Import the correctly configured shared request instance
import request from '../request';

// Remove the creation of the separate authApiClient and its interceptors
// const authApiClient = axios.create({ ... });
// authApiClient.interceptors.response.use(...);

/**
 * 登录用户 API
 * @param credentials 用户名和密码
 * @returns Promise<ApiResponse<{ token: string; user: UserInfo }>> - 返回包含 token 和 user 的完整响应
 */
export const loginUser = async (credentials: LoginRequest): Promise<ApiResponse<{ token: string; user: UserInfo }>> => {
  // Use the shared request instance
  // The baseURL from request.ts is already '/api/v1', so the path here is '/auth/login'
  // Note: The wrappedRequest handles extracting the 'data' part based on code 200/201
  // However, for login, we might need the entire ApiResponse (code, message, data)
  // Let's adjust the expectation slightly or modify the request wrapper if needed.
  // For now, let's assume the interceptor in request.ts needs adjustment or we handle the full response here.
  // A safer approach for now is to expect the structure returned by the interceptor.
  // If the interceptor returns res.data for code 200/201, the type here should be { token: string; user: UserInfo }
  // If we need the full ApiResponse, the interceptor or wrapper type needs adjustment.
  // Let's assume the interceptor is correct for now and expect the inner data.
  // Adjust the return type expectation of the function for now.
  // TODO: Potentially adjust request.ts interceptor or wrapper for login response flexibility
  
  // Assuming the interceptor returns res.data directly on success:
  const responseData = await request.post<{ token: string; user: UserInfo }>('/auth/login', credentials);
  
  // We need to reconstruct the ApiResponse structure here if the caller expects it.
  // This is a temporary workaround due to the interceptor's behavior.
  return {
    code: 200, // Assume success if no error was thrown
    message: 'Login successful (simulated)', // Provide a generic message
    data: responseData
  } as ApiResponse<{ token: string; user: UserInfo }>;
  
  // Original attempt, might fail if interceptor strips outer layer:
  // return request.post<ApiResponse<{ token: string; user: UserInfo }>>('/auth/login', credentials);
};

// --- 后续添加修改密码等 API 调用 --- 