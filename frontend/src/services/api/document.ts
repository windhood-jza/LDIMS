// @/services/api/document.ts
import wrappedRequest from "../request"; // Use the wrapped request object
// Removed unused ApiResponse import
// import type { ApiResponse } from '@/types/api';
import type {
  DocumentListQuery,
  DocumentInfo,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  SimplifiedDocumentFile,
} from "@/types/document"; // 从前端 types/document 导入
import type { PageResult } from "@/types/common"; // 确保 PageResult 从 common 导入
import { downloadBlob } from "@/utils/download"; // 假设存在下载辅助函数

// 后端分页响应的数据结构
/* Commented out unused interface (was line 8)
interface DocumentListResponse {
    list: DocumentInfo[];
    total: number;
}
*/

/**
 * 获取文档列表
 * @param params 查询参数
 * @returns Promise containing the page result { list, total }
 */
export const getDocuments = async (
  params: DocumentListQuery
): Promise<PageResult<DocumentInfo>> => {
  console.log(
    "[api/document.ts:getDocuments] Entry. Received params:",
    JSON.stringify(params, null, 2)
  );
  try {
    console.log(
      "[api/document.ts:getDocuments] Params BEFORE passing to request util:",
      JSON.stringify(params, null, 2)
    );
    // Use wrappedRequest.get, expecting PageResult directly after interceptor
    const response = await wrappedRequest.get<PageResult<DocumentInfo>>(
      "/documents",
      { params }
    );
    console.log(
      "[api/document.ts] Response from wrappedRequest.get (should be PageResult):",
      response
    );
    return response || { list: [], total: 0 }; // Return PageResult directly
  } catch (error: any) {
    console.error("[api/document.ts] Error in getDocuments:", error);
    return { list: [], total: 0 };
  }
};

/**
 * 创建文档
 * Assumes the interceptor returns the DocumentInfo directly from response.data.data
 * @param data 文档数据
 * @returns Promise 包含创建后的文档信息
 */
export const createDocument = async (
  data: CreateDocumentRequest
): Promise<DocumentInfo> => {
  // Interceptor handles unwrapping ApiResponse, we expect DocumentInfo
  return await wrappedRequest.post<DocumentInfo>("/documents", data);
};

/**
 * 更新文档
 * Assumes the interceptor returns the DocumentInfo directly from response.data.data
 * @param id 文档 ID
 * @param data 更新数据
 * @returns Promise 包含更新后的文档信息
 */
export const updateDocument = async (
  id: number,
  data: UpdateDocumentRequest
): Promise<DocumentInfo> => {
  // Interceptor handles unwrapping ApiResponse, we expect DocumentInfo
  return await wrappedRequest.put<DocumentInfo>(`/documents/${id}`, data);
};

/**
 * 删除文档
 * Assumes the interceptor handles the response, returns void
 * @param id 文档 ID
 * @returns Promise<void>
 */
export const deleteDocument = async (id: number): Promise<void> => {
  await wrappedRequest.delete<void>(`/documents/${id}`);
};

/**
 * 获取单个文档信息
 * Assumes the interceptor returns the DocumentInfo directly from response.data.data
 * @param id 文档 ID
 * @returns Promise 包含文档详情
 */
export const getDocumentInfo = async (id: number): Promise<DocumentInfo> => {
  // Interceptor handles unwrapping ApiResponse, we expect DocumentInfo
  return await wrappedRequest.get<DocumentInfo>(`/documents/${id}`);
};

/**
 * 上传/替换文档关联文件
 * @param documentId 文档 ID
 * @param formData 包含文件的 FormData 对象 (字段名应为 'files')
 * @returns Promise 包含新创建的文件记录列表
 */
export const uploadFiles = async (
  documentId: number,
  formData: FormData
): Promise<{ files: SimplifiedDocumentFile[] }> => {
  // 注意：Content-Type 会由浏览器根据 FormData 自动设置，无需手动指定
  // 拦截器应该处理来自后端的成功响应 (结构为 { code, msg, data: { files: [...] } })
  // 并直接返回 data.data，即 { files: [...] }
  return await wrappedRequest.post<{ files: SimplifiedDocumentFile[] }>(
    `/documents/${documentId}/files`,
    formData
  );
};

/**
 * 清空指定文档的所有关联文件
 * @param documentId 文档 ID
 * @returns Promise<void>
 */
export const deleteAllFiles = async (documentId: number): Promise<void> => {
  // 假设拦截器处理成功响应 (可能返回 null data 或仅成功状态码)
  await wrappedRequest.delete<void>(`/documents/${documentId}/files`);
};

/**
 * 触发指定文档关联文件的后台处理
 * @param documentId 文档 ID
 * @returns Promise 包含触发结果 (例如 { triggeredCount: number })
 */
export const startProcessing = async (
  documentId: number
): Promise<{ triggeredCount: number }> => {
  // 假设拦截器处理成功响应并返回 data.data
  return await wrappedRequest.post<{ triggeredCount: number }>(
    `/documents/${documentId}/start-processing`
  );
};

/**
 * 下载单个关联文件
 * @param fileId 文件 ID
 * @param originalFilename 用户下载时看到的文件名
 * @returns Promise<void>
 */
export const downloadFile = async (
  fileId: number,
  originalFilename: string
): Promise<void> => {
  try {
    // 请求下载接口，期望返回 Blob 数据
    const response = await wrappedRequest.get<Blob>(
      `/files/${fileId}/download`,
      {
        responseType: "blob", // 关键：告诉 axios 期望接收 Blob 数据
      }
    );
    // 调用辅助函数处理 Blob 下载
    downloadBlob(response, originalFilename);
  } catch (error) {
    // 可以在这里添加更具体的错误处理，例如显示错误消息
    console.error(`[api/document.ts] Error downloading file ${fileId}:`, error);
    // 根据需要重新抛出错误或显示提示
    throw error;
  }
};
