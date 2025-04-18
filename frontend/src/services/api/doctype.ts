import request from '../request';
import { ElMessage } from 'element-plus';
import type { DocTypeInfo, CreateDocTypeRequest, UpdateDocTypeRequest } from '@backend-types/doctype';
// import type { ApiResponse } from '../request';

/**
 * 递归映射树数据到 DocTypeInfo 结构
 * @param nodes 原始树节点数组
 * @returns DocTypeInfo[] 结构数组
 */
const mapTreeDataToDocTypeInfo = (nodes: any[]): DocTypeInfo[] => {
  if (!nodes || !Array.isArray(nodes)) {
    return [];
  }
  return nodes.map(node => ({
    // 必需属性 (基于错误日志和通用假设)
    id: node.id,
    name: node.name,
    parentId: node.parentId === undefined ? null : node.parentId,
    sort: node.sortOrder ?? node.sort ?? 0, // 假设后端可能叫 sortOrder 或 sort
    // 可选属性 (如果后端返回)
    level: node.level,
    description: node.description,
    createdBy: node.createdBy,
    // 必需的时间戳 (需要提供默认值以防后端不返回)
    createdAt: node.createdAt || new Date().toISOString(),
    updatedAt: node.updatedAt || new Date().toISOString(),
    // 递归处理子节点
    children: mapTreeDataToDocTypeInfo(node.children),
  }));
};

/**
 * 获取文档类型树
 * @returns Promise 包含 DocTypeInfo 结构的文档类型树数组
 */
export const getDocTypeTree = async (): Promise<DocTypeInfo[]> => {
    try {
        // 使用 wrappedRequest.get<T>，T 是期望拦截器处理后返回的类型 (any[] 在这里是合理的，因为需要映射)
        const responseData = await request.get<any[]>('/doctypes/tree');
        // responseData 现在直接是拦截器返回的树形数据数组
        return mapTreeDataToDocTypeInfo(responseData || []); 
    } catch (error) {
        console.error("API Error fetching doctype tree:", error);
        ElMessage.error('获取文档类型树失败');
        return [];
    }
};

/**
 * 获取文档类型列表 (扁平结构，如果需要)
 * GET /api/v1/doctypes/list
 * @param params 查询参数，例如 { page: 1, size: 10, name: '报告' }
 */
export const getDocTypeList = (params?: any): Promise<{ list: DocTypeInfo[], total: number }> => {
  // CoolController 默认 list 返回 {list, total}
  return request.get('/doctypes/list', { params });
};

/**
 * 获取文档类型分页列表 (如果后端使用 page API)
 * GET /api/v1/doctypes/page
 * @param params 分页和查询参数 { page: 1, size: 10, name: '报告' }
 */
export const getDocTypePage = (params?: any): Promise<{ list: DocTypeInfo[], pagination: { page: number, size: number, total: number } }> => {
  // CoolController 默认 page 返回 {list, pagination}
  return request.get('/doctypes/page', { params });
};


/**
 * 创建新文档类型
 * POST /api/v1/doctypes
 * @param data 文档类型数据
 */
export const createDocType = (data: CreateDocTypeRequest): Promise<DocTypeInfo> => {
  return request.post('/doctypes', data);
};

/**
 * 更新文档类型信息
 * PUT /api/v1/doctypes/:id
 * @param id 文档类型 ID
 * @param data 更新数据
 */
export const updateDocType = (id: number, data: UpdateDocTypeRequest): Promise<null> => { // CoolController 默认 update 不返回 body
  return request.put(`/doctypes/${id}`, data);
};

/**
 * 删除文档类型
 * DELETE /api/v1/doctypes/:id
 * @param id 文档类型 ID
 */
export const deleteDocType = (id: number): Promise<null> => { // CoolController 默认 delete 不返回 body
  return request.delete(`/doctypes/${id}`);
};

/**
 * 获取单个文档类型信息 (如果需要单独获取)
 * GET /api/v1/doctypes/:id
 * @param id 文档类型 ID
 */
export const getDocTypeInfo = (id: number): Promise<DocTypeInfo> => {
  return request.get(`/doctypes/${id}`);
};