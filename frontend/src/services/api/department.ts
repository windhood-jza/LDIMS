import request from '../request'; // 引入封装好的 axios 实例
import type { DepartmentInfo, CreateDepartmentRequest, UpdateDepartmentRequest } from '@backend-types/department'; // 引入后端类型

/**
 * 获取部门树结构
 */
export const getDepartmentTree = (): Promise<DepartmentInfo[]> => {
  return request.get('/departments/tree');
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