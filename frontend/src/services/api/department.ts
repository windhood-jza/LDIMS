import request from '../request'; // 引入封装好的 axios 实例
import type { DepartmentInfo, CreateDepartmentRequest, UpdateDepartmentRequest } from '@backend-types/department'; // 引入后端类型
// import type { ApiResponse } from '../request';

// 假设树节点的接口定义
interface TreeNode {
    id: number;
    name: string;
    parentName?: string; // 部门树可能包含 parentName
    children?: TreeNode[];
    // 可能包含其他属性
}

/**
 * 获取部门树
 * @returns Promise 包含部门树数组
 */
export const getDepartmentTree = async (): Promise<TreeNode[]> => {
    try {
        const response: TreeNode[] = await request({
            url: '/departments/tree', // 假设获取树的接口路径是 /departments/tree
            method: 'get',
        });
        return response || [];
    } catch (error) {
        console.error("API Error fetching department tree:", error);
        // 返回空数组并提示用户
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