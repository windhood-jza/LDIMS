import request from '../request';
// 导入仪表盘数据类型
import type { DashboardSummaryData } from '@ldims/types'; // 从共享类型包导入

/**
 * @description 获取仪表盘汇总数据
 * @returns {Promise<DashboardSummaryData>}
 */
export const getDashboardSummary = (): Promise<DashboardSummaryData> => {
    // GET 请求，不需要额外参数
    return request.get('/dashboard/summary');
}; 