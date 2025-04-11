// @/services/api/document.ts
import request from '../request'; // 假设你有一个封装好的请求工具
import type { ApiResponse } from '../request'; // 假设 ApiResponse 类型定义在 request.ts 或其关联文件中
import type { DocumentListQuery, DocumentInfo, CreateDocumentRequest, UpdateDocumentRequest } from '@backend-types/document';

// 后端分页响应的数据结构
interface DocumentListResponse {
    list: DocumentInfo[];
    total: number;
}

/**
 * 获取文档列表
 * @param params 查询参数
 * @returns Promise 包含列表和总数
 */
export const getDocuments = async (params: DocumentListQuery): Promise<DocumentListResponse> => {
    console.log('[api/document.ts:getDocuments] Entry. Received params:', JSON.stringify(params, null, 2)); // Log received params
    try {
        console.log('[api/document.ts:getDocuments] Params BEFORE passing to request util:', JSON.stringify(params, null, 2)); // Log before passing
        const response = await request({ 
            url: '/documents',
            method: 'get',
            params,
        });

        console.log('[api/document.ts] Raw response from request util:', response);

        // 修正：直接返回 request 工具的响应，因为它就是 { list, total }
        // 同时提供默认值以防 response 本身为空或缺少 list/total
        const result = (response && Array.isArray(response.list)) 
                       ? response 
                       : { list: [], total: 0 };

        console.log('[api/document.ts] Data returned to component:', result);

        return result as DocumentListResponse; 

    } catch (error) {
        console.error('[api/document.ts] Error in getDocuments:', error);
        return { list: [], total: 0 };
    }
};

/**
 * 创建文档
 * @param data 文档数据
 * @returns Promise 包含创建后的文档信息
 */
export const createDocument = async (data: CreateDocumentRequest): Promise<DocumentInfo> => {
    const response: ApiResponse<DocumentInfo> = await request({
        url: '/documents',
        method: 'post',
        data,
    });
    return response.data; // 假设后端成功时在 data 中返回创建的对象信息
};

/**
 * 更新文档
 * @param id 文档 ID
 * @param data 更新数据
 * @returns Promise 包含更新后的文档信息
 */
export const updateDocument = async (id: number, data: UpdateDocumentRequest): Promise<DocumentInfo> => {
    const response: ApiResponse<DocumentInfo> = await request({
        url: `/documents/${id}`,
        method: 'put',
        data,
    });
    return response.data; // 假设后端成功时在 data 中返回更新的对象信息
};

/**
 * 删除文档
 * @param id 文档 ID
 * @returns Promise<void>
 */
export const deleteDocument = async (id: number): Promise<void> => {
    // 删除操作通常只需要确认成功，不需要特定返回数据
    await request({
        url: `/documents/${id}`,
        method: 'delete',
    });
    // 如果请求成功没有抛出错误，则认为操作成功
};

/**
 * 获取单个文档信息
 * @param id 文档 ID
 * @returns Promise 包含文档详情
 */
export const getDocumentInfo = async (id: number): Promise<DocumentInfo> => {
     const response: ApiResponse<DocumentInfo> = await request({
        url: `/documents/${id}`,
        method: 'get',
    });
     return response.data;
}; 