import type { NameValueData } from "./statistics";
/**
 * @description 用于统计卡片的简单统计项
 */
export interface StatItem {
    count: number;
}
/**
 * @description 最近操作日志条目
 */
export interface RecentLogItem {
    id: number;
    timestamp: string;
    username: string | null;
    operationType: string;
    operationContent: string;
}
/**
 * @description 仪表盘汇总数据接口
 */
export interface DashboardSummaryData {
    stats: {
        totalDocuments: StatItem;
        docTypes: StatItem;
        departments: StatItem;
        users?: StatItem;
    };
    charts: {
        docsByType: NameValueData[];
        docsByDepartment: NameValueData[];
    };
    recentLogs: RecentLogItem[];
    dbStatus: {
        connected: boolean;
    };
}
