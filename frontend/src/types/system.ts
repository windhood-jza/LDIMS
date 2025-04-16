/**
 * 操作类型枚举
 * 与后端保持一致
 */
export enum OperationType {
  // 用户模块
  USER_CREATE = 'USER_CREATE',       // 创建用户
  USER_UPDATE = 'USER_UPDATE',       // 更新用户
  USER_DELETE = 'USER_DELETE',       // 删除用户
  USER_ENABLE = 'USER_ENABLE',       // 启用用户
  USER_DISABLE = 'USER_DISABLE',     // 禁用用户
  PASSWORD_RESET = 'PASSWORD_RESET', // 重置密码
  
  // 部门模块
  DEPARTMENT_CREATE = 'DEPARTMENT_CREATE',   // 创建部门
  DEPARTMENT_UPDATE = 'DEPARTMENT_UPDATE',   // 更新部门
  DEPARTMENT_DELETE = 'DEPARTMENT_DELETE',   // 删除部门
  
  // 文档类型模块
  DOCTYPE_CREATE = 'DOCTYPE_CREATE',   // 创建文档类型
  DOCTYPE_UPDATE = 'DOCTYPE_UPDATE',   // 更新文档类型
  DOCTYPE_DELETE = 'DOCTYPE_DELETE',   // 删除文档类型
  
  // 文档模块
  DOCUMENT_CREATE = 'DOCUMENT_CREATE',   // 创建文档
  DOCUMENT_UPDATE = 'DOCUMENT_UPDATE',   // 更新文档
  DOCUMENT_DELETE = 'DOCUMENT_DELETE',   // 删除文档
  
  // 导入导出
  DOCUMENT_EXPORT = 'DOCUMENT_EXPORT',   // 导出文档
  DOCUMENT_IMPORT = 'DOCUMENT_IMPORT',   // 导入文档
  
  // 系统模块
  SYSTEM_CONFIG_UPDATE = 'SYSTEM_CONFIG_UPDATE', // 更新系统配置
  USER_LOGIN = 'USER_LOGIN',                     // 用户登录
  USER_LOGOUT = 'USER_LOGOUT',                   // 用户登出
}

/**
 * 操作类型显示名称映射
 */
export const OperationTypeNames: Record<OperationType, string> = {
  // 用户模块
  [OperationType.USER_CREATE]: '创建用户',
  [OperationType.USER_UPDATE]: '更新用户',
  [OperationType.USER_DELETE]: '删除用户',
  [OperationType.USER_ENABLE]: '启用用户',
  [OperationType.USER_DISABLE]: '禁用用户',
  [OperationType.PASSWORD_RESET]: '重置密码',
  
  // 部门模块
  [OperationType.DEPARTMENT_CREATE]: '创建部门',
  [OperationType.DEPARTMENT_UPDATE]: '更新部门',
  [OperationType.DEPARTMENT_DELETE]: '删除部门',
  
  // 文档类型模块
  [OperationType.DOCTYPE_CREATE]: '创建文档类型',
  [OperationType.DOCTYPE_UPDATE]: '更新文档类型',
  [OperationType.DOCTYPE_DELETE]: '删除文档类型',
  
  // 文档模块
  [OperationType.DOCUMENT_CREATE]: '创建文档',
  [OperationType.DOCUMENT_UPDATE]: '更新文档',
  [OperationType.DOCUMENT_DELETE]: '删除文档',
  
  // 导入导出
  [OperationType.DOCUMENT_EXPORT]: '导出文档',
  [OperationType.DOCUMENT_IMPORT]: '导入文档',
  
  // 系统模块
  [OperationType.SYSTEM_CONFIG_UPDATE]: '更新系统配置',
  [OperationType.USER_LOGIN]: '用户登录',
  [OperationType.USER_LOGOUT]: '用户登出',
};

/**
 * 操作模块分组
 */
export const OperationTypeGroups = [
  {
    label: '用户管理',
    types: [
      OperationType.USER_CREATE,
      OperationType.USER_UPDATE, 
      OperationType.USER_DELETE,
      OperationType.USER_ENABLE,
      OperationType.USER_DISABLE,
      OperationType.PASSWORD_RESET,
    ]
  },
  {
    label: '部门管理',
    types: [
      OperationType.DEPARTMENT_CREATE,
      OperationType.DEPARTMENT_UPDATE,
      OperationType.DEPARTMENT_DELETE,
    ]
  },
  {
    label: '文档类型管理',
    types: [
      OperationType.DOCTYPE_CREATE,
      OperationType.DOCTYPE_UPDATE,
      OperationType.DOCTYPE_DELETE,
    ]
  },
  {
    label: '文档管理',
    types: [
      OperationType.DOCUMENT_CREATE,
      OperationType.DOCUMENT_UPDATE,
      OperationType.DOCUMENT_DELETE,
      OperationType.DOCUMENT_EXPORT,
      OperationType.DOCUMENT_IMPORT,
    ]
  },
  {
    label: '系统操作',
    types: [
      OperationType.SYSTEM_CONFIG_UPDATE,
      OperationType.USER_LOGIN,
      OperationType.USER_LOGOUT,
    ]
  }
]; 