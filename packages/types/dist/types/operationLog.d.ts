/**
 * 操作类型枚举
 * 用于统一管理系统中的操作类型
 */
export declare enum OperationType {
    USER_CREATE = "USER_CREATE",// 创建用户
    USER_UPDATE = "USER_UPDATE",// 更新用户
    USER_DELETE = "USER_DELETE",// 删除用户
    USER_ENABLE = "USER_ENABLE",// 启用用户
    USER_DISABLE = "USER_DISABLE",// 禁用用户
    PASSWORD_RESET = "PASSWORD_RESET",// 重置密码
    DEPARTMENT_CREATE = "DEPARTMENT_CREATE",// 创建部门
    DEPARTMENT_UPDATE = "DEPARTMENT_UPDATE",// 更新部门
    DEPARTMENT_DELETE = "DEPARTMENT_DELETE",// 删除部门
    DOCTYPE_CREATE = "DOCTYPE_CREATE",// 创建文档类型
    DOCTYPE_UPDATE = "DOCTYPE_UPDATE",// 更新文档类型
    DOCTYPE_DELETE = "DOCTYPE_DELETE",// 删除文档类型
    DOCUMENT_CREATE = "DOCUMENT_CREATE",// 创建文档
    DOCUMENT_UPDATE = "DOCUMENT_UPDATE",// 更新文档
    DOCUMENT_DELETE = "DOCUMENT_DELETE",// 删除文档
    ATTACHMENT_UPLOAD = "ATTACHMENT_UPLOAD",// 上传附件
    ATTACHMENT_CLEAR = "ATTACHMENT_CLEAR",// 清空附件
    DOCUMENT_EXPORT = "DOCUMENT_EXPORT",// 导出文档
    DOCUMENT_IMPORT = "DOCUMENT_IMPORT",// 导入文档
    SYSTEM_CONFIG_UPDATE = "SYSTEM_CONFIG_UPDATE",// 更新系统配置
    USER_LOGIN = "USER_LOGIN",// 用户登录
    USER_LOGOUT = "USER_LOGOUT"
}
/**
 * 操作类型显示名称映射
 */
export declare const OperationTypeNames: Record<OperationType, string>;
/**
 * 操作模块分组
 */
export declare const OperationTypeGroups: {
    label: string;
    types: OperationType[];
}[];
/**
 * 操作日志查询参数接口
 */
export interface OperationLogQuery {
    page?: number;
    pageSize?: number;
    userId?: number | string;
    operationType?: string;
    startDate?: string;
    endDate?: string;
    sortField?: string;
    sortOrder?: "ASC" | "DESC";
}
/**
 * 返回给前端的操作日志信息结构
 */
export interface OperationLogInfo {
    id: number;
    userId: number;
    username: string | null;
    realName: string | null;
    operationType: string;
    operationContent: string;
    ipAddress: string;
    createdAt: string;
}
