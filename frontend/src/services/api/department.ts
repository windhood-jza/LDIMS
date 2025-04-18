import request from '../request'; // 引入封装好的 axios 实例
import { ElMessage } from 'element-plus'; // 导入 ElMessage
import type { DepartmentInfo, CreateDepartmentRequest, UpdateDepartmentRequest } from '@backend-types/department'; // 引入后端类型
// import type { ApiResponse } from '../request';

/**
 * 递归映射树数据到 DepartmentInfo 结构
 * @param nodes 原始树节点数组
 * @returns DepartmentInfo[] 结构数组
 */
const mapTreeDataToDepartmentInfo = (nodes: any[]): DepartmentInfo[] => {
  if (!nodes || !Array.isArray(nodes)) {
    return [];
  }
  return nodes.map(node => ({
    // 必需属性 (假设后端返回这些)
    id: node.id,
    name: node.name,
    parentId: node.parentId === undefined ? null : node.parentId, // 假设后端可能不返回或返回 undefined，统一处理为 null
    // 其他 DepartmentInfo 中可能存在的属性 (可选映射)
    code: node.code,
    level: node.level,
    sortOrder: node.sortOrder,
    status: node.status,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    // 递归处理子节点
    children: mapTreeDataToDepartmentInfo(node.children),
  }));
};

/**
 * 获取部门树
 * @returns Promise 包含 DepartmentInfo 结构的部门树数组
 */
export const getDepartmentTree = async (): Promise<DepartmentInfo[]> => {
    try {
        // 使用 wrappedRequest.get<T>，T 是期望拦截器处理后返回的类型 (any[] 在这里是合理的，因为需要映射)
        const responseData = await request.get<any[]>('/departments/tree');
        // responseData 现在直接是拦截器返回的树形数据数组
        return mapTreeDataToDepartmentInfo(responseData || []); 
    } catch (error) {
        console.error("API Error fetching department tree:", error);
        ElMessage.error('获取部门树失败');
        return [];
    }
};

/**
 * 获取部门扁平列表 (备用，如果需要)
 */
export const getDepartmentList = (): Promise<DepartmentInfo[]> => {
    return request.get('/departments');
};


/**
 * 创建新部门
 * @param data 部门数据
 */
export const createDepartment = (data: CreateDepartmentRequest): Promise<DepartmentInfo> => {
  return request.post('/departments', data);
};

/**
 * 更新部门信息
 * @param id 部门 ID
 * @param data 更新数据
 */
export const updateDepartment = (id: number, data: UpdateDepartmentRequest): Promise<DepartmentInfo> => {
  return request.put(`/departments/${id}`, data);
};

/**
 * 删除部门
 * @param id 部门 ID
 */
export const deleteDepartment = (id: number): Promise<null> => { // 删除成功通常不返回具体数据
  return request.delete(`/departments/${id}`);
}; 