import request from '../request';
// 导入仪表盘数据类型 (确保路径或别名正确)
import type { DashboardSummaryData } from '@backend-types/dashboard'; // 指向后端 dashboard 类型

/**
 * @description 获取仪表盘汇总数据
 * @returns {Promise<DashboardSummaryData>}
 */
export const getDashboardSummary = (): Promise<DashboardSummaryData> => {
    // GET 请求，不需要额外参数
    return request.get('/dashboard/summary');
}; 