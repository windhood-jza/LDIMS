// @/services/api/document.ts
import wrappedRequest from '../request'; // Use the wrapped request object
// Removed unused ApiResponse import
// import type { ApiResponse } from '@/types/api'; 
import type { DocumentListQuery, DocumentInfo, CreateDocumentRequest, UpdateDocumentRequest } from '@/types/document'; // 从前端 types/document 导入
import type { PageResult } from '@/types/common'; // 确保 PageResult 从 common 导入

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
export const getDocuments = async (params: DocumentListQuery): Promise<PageResult<DocumentInfo>> => {
    console.log('[api/document.ts:getDocuments] Entry. Received params:', JSON.stringify(params, null, 2));
    try {
        console.log('[api/document.ts:getDocuments] Params BEFORE passing to request util:', JSON.stringify(params, null, 2));
        // Use wrappedRequest.get, expecting PageResult directly after interceptor
        const response = await wrappedRequest.get<PageResult<DocumentInfo>>('/documents', { params }); 
        console.log('[api/document.ts] Response from wrappedRequest.get (should be PageResult):', response);
        return response || { list: [], total: 0 }; // Return PageResult directly
    } catch (error: any) {
        console.error('[api/document.ts] Error in getDocuments:', error);
        return { list: [], total: 0 }; 
    }
};

/**
 * 创建文档
 * Assumes the interceptor returns the DocumentInfo directly from response.data.data
 * @param data 文档数据
 * @returns Promise 包含创建后的文档信息
 */
export const createDocument = async (data: CreateDocumentRequest): Promise<DocumentInfo> => {
    // Interceptor handles unwrapping ApiResponse, we expect DocumentInfo
    return await wrappedRequest.post<DocumentInfo>('/documents', data);
};

/**
 * 更新文档
 * Assumes the interceptor returns the DocumentInfo directly from response.data.data
 * @param id 文档 ID
 * @param data 更新数据
 * @returns Promise 包含更新后的文档信息
 */
export const updateDocument = async (id: number, data: UpdateDocumentRequest): Promise<DocumentInfo> => {
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