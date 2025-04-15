import { Op } from 'sequelize'; // 保留 Op 以备后用，但移除 WhereOptions
import Document from '../models/Document';
import DocType from '../models/DocType';
import Department from '../models/Department';
import User from '../models/User';
import OperationLog from '../models/OperationLog'; // 导入 OperationLog 模型
import type { DashboardSummaryData, StatItem, NameValueData, RecentLogItem } from '../types/dashboard'; // 确保类型路径正确
import sequelize from '../config/database'; // 导入 sequelize 实例用于分组查询

/**
 * @description 仪表盘服务类，用于处理仪表盘相关的数据逻辑
 * @class DashboardService
 */
export class DashboardService {
    /**
     * @description 获取仪表盘汇总数据
     * @returns {Promise<DashboardSummaryData>} 汇总数据
     * @memberof DashboardService
     * @static
     */
    static async getSummaryData(): Promise<DashboardSummaryData> {
        // 移除显式类型的 where 条件变量
        // const docTypeWhere: WhereOptions<DocTypeAttributes> = { parentId: { [Op.ne]: null } };
        // const departmentWhere: WhereOptions<DepartmentAttributes> = { parentId: { [Op.ne]: null } };

        const [
            totalDocumentsCount,
            docTypesCount,
            departmentsCount,
            usersCount,
            docsByTypeRaw,
            docsByDepartmentRaw,
            // recentLogsRaw // 暂时不获取最近日志
        ] = await Promise.all([
            Document.count(),
            // 统计所有节点，移除 where 条件以解决类型错误
            DocType.count(),
            Department.count(),
            User.count(),
            // 按文档类型分组统计文档数量
            Document.findAll({
                attributes: [
                    'docTypeName',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'value'],
                ],
                group: ['docTypeName'],
                raw: true, // 获取原始数据
            }),
            // 按来源部门分组统计文档数量
            Document.findAll({
                attributes: [
                    'sourceDepartmentName',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'value'],
                ],
                group: ['sourceDepartmentName'],
                raw: true, // 获取原始数据
            }),
            // OperationLog.findAll({ // 获取最近日志，需要关联 User 获取 userName
            //     include: [{ model: User, attributes: ['username'] }],
            //     limit: 5,
            //     order: [['createdAt', 'DESC']],
            // })
        ]);

        // 格式化统计数据 (移除 where 后，count 类型应为 number)
        const stats: DashboardSummaryData['stats'] = {
            totalDocuments: { count: totalDocumentsCount },
            docTypes: { count: docTypesCount },
            departments: { count: departmentsCount },
            users: { count: usersCount },
        };

        // 格式化图表数据 (确保 name 不为 null 或空)
        const docsByType: NameValueData[] = (docsByTypeRaw as any[])
            .filter(item => item.docTypeName)
            .map(item => ({ name: item.docTypeName, value: parseInt(item.value, 10) }));

        const docsByDepartment: NameValueData[] = (docsByDepartmentRaw as any[])
            .filter(item => item.sourceDepartmentName)
            .map(item => ({ name: item.sourceDepartmentName, value: parseInt(item.value, 10) }));

        const charts: DashboardSummaryData['charts'] = {
            docsByType,
            docsByDepartment,
        };

        // 格式化最近日志 (如果启用)
        // const recentLogs: RecentLogItem[] = recentLogsRaw.map(log => ({
        //     id: log.id,
        //     timestamp: log.createdAt.toISOString(), // 或其他格式化
        //     username: log.user?.username || 'System', // 处理 User 可能为空的情况
        //     operationType: log.operationType,
        //     operationContent: log.operationContent.substring(0, 50) + (log.operationContent.length > 50 ? '...' : ''), // 截断内容
        // }));
        const recentLogs: RecentLogItem[] = []; // 暂时为空

        // 数据库状态 (简单示例)
        const dbStatus: DashboardSummaryData['dbStatus'] = {
            connected: true, // 实际应用中应检查 sequelize.authenticate()
        };

        // 构造最终返回数据
        const summaryData: DashboardSummaryData = {
            stats,
            charts,
            recentLogs,
            dbStatus,
        };

        return summaryData;
    }

    // 未来可以添加获取图表数据的方法
    // static async getDocTypeDistribution(): Promise<any> { ... }
    // static async getDepartmentDistribution(): Promise<any> { ... }
} 