// LDIMS/frontend/src/services/api/system.ts
import request from '../request'; // 导入封装的 axios 实例
// 导入需要的类型 (假设后端类型已通过别名配置或相对路径导入)
import type { SystemConfigMap } from '@/types/system'; // 假设类型定义在此
import type { OperationLogQuery, OperationLogInfo } from '@backend-types/operationLog'; // 指向后端 operationLog 类型
import type { PageResult } from '@/types/common'; // 从前端 types/common 导入

/**
 * @description 获取所有系统配置项
 * @returns {Promise<SystemConfigMap>} 返回键值对形式的配置
 */
export const getSystemConfigs = (): Promise<SystemConfigMap> => {
    return request.get<SystemConfigMap>('/system/config');
};

/**
 * @description 更新系统配置项
 * @param {SystemConfigMap} data - 需要更新的配置键值对
 * @returns {Promise<null>} 后端成功时不返回 data
 */
export const updateSystemConfigs = (data: Partial<SystemConfigMap>): Promise<void> => {
    return request.put<void>('/system/config', data);
};

/**
 * @description 获取数据库连接状态
 * @returns {Promise<{ connected: boolean; message: string }>} 返回连接状态和消息
 */
export const getDbStatus = (): Promise<{ connected: boolean; message: string }> => {
    return request.get('/system/db-status');
};


/**
 * @description 查询操作日志列表
 * @param {OperationLogQuery} params - 查询参数 (分页、筛选、排序)
 * @returns {Promise<PageResult<OperationLogInfo>>} 返回分页的操作日志列表
 */
export const getOperationLogs = (params: OperationLogQuery): Promise<PageResult<OperationLogInfo>> => {
    // GET 请求的参数通常放在 params 字段中
    return request.get('/system/logs', { params });
}; 