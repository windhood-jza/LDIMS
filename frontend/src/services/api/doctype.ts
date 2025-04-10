import request from '../request';
import type { DocTypeInfo, CreateDocTypeRequest, UpdateDocTypeRequest } from '@backend-types/doctype';
// import type { ApiResponse } from '../request';

// 假设树节点的接口定义
interface TreeNode {
    id: number;
    name: string;
    children?: TreeNode[];
    // 可能包含其他属性
}

/**
 * 获取文档类型树
 * @returns Promise 包含文档类型树数组
 */
export const getDocTypeTree = async (): Promise<TreeNode[]> => {
    try {
        // 假设 request 直接返回需要的数据结构 (数组)
        const response: TreeNode[] = await request({
            url: '/doctypes/tree',
            method: 'get',
        });
        return response || [];
    } catch (error) {
        console.error("API Error fetching doctype tree:", error);
        // 返回空数组，让界面能正常渲染，并通过 ElMessage 提示用户
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