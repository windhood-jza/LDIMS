/**
 * @description 用于统计卡片的简单统计项
 */
export interface StatItem {
    count: number;
}

/**
 * @description 用于图表的数据点 (复用统计模块的定义)
 */
export interface NameValueData {
    name: string;
    value: number;
}

/**
 * @description 最近操作日志条目
 */
export interface RecentLogItem {
    id: number; // 添加 ID 方便前端 key
    timestamp: string; // 格式化后的时间
    username: string | null; // 操作用户名
    operationType: string; // 操作类型
    operationContent: string; // 操作内容简述 (可能需要截断)
}

/**
 * @description 仪表盘汇总数据接口
 */
export interface DashboardSummaryData {
    // 顶部关键统计数据
    stats: {
        totalDocuments: StatItem;
        docTypes: StatItem;
        departments: StatItem;
        users?: StatItem; // 用户数作为可选
    };
    // 图表所需数据
    charts: {
        docsByType: NameValueData[];
        docsByDepartment: NameValueData[];
    };
    // 最近活动
    recentLogs: RecentLogItem[];
    // 系统状态
    dbStatus: {
        connected: boolean;
        // 可以考虑添加更多状态信息，如后端版本号等
    };
} 