/**
 * 部门管理相关的类型定义
 */

/**
 * 部门基本信息 (用于列表、树节点)
 */
export interface DepartmentInfo {
  id: number;
  name: string;
  parentId: number | null;
  parentName?: string; // 用于树结构，可选
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  children?: DepartmentInfo[]; // 用于树结构
}

/**
 * 创建部门请求体
 */
export interface CreateDepartmentRequest {
  name: string;
  parentId: number | null;
  sortOrder?: number;
}

/**
 * 更新部门请求体
 */
export interface UpdateDepartmentRequest {
  name?: string;
  parentId?: number | null;
  sortOrder?: number;
} 