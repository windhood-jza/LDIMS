import { Op, WhereOptions, Order } from 'sequelize';
import { OperationLog, User } from '../models'; // 导入 OperationLog 和 User 模型
import { PageResult } from '../utils/response'; // 假设有分页结果类型
import { format } from 'date-fns'; // 用于格式化日期

/**
 * @description 操作日志查询参数接口
 */
export interface OperationLogQuery {
    page?: number;
    pageSize?: number;
    userId?: number | string; // 可以是用户ID或用户名(模糊查询)
    operationType?: string; // 操作类型 (模糊查询)
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    sortField?: string; // 排序字段 (如 'createdAt')
    sortOrder?: 'ASC' | 'DESC'; // 排序顺序
}

/**
 * @description 返回给前端的操作日志信息结构
 */
export interface OperationLogInfo {
    id: number;
    userId: number;
    username: string | null; // 用户名
    operationType: string;
    operationContent: string;
    ipAddress: string;
    createdAt: string; // 格式化后的时间字符串
}


/**
 * @class OperationLogService
 * @description 提供操作日志查询的服务
 */
export class OperationLogService {

    /**
     * @description 查询操作日志列表 (分页、筛选、排序)
     * @param {OperationLogQuery} query - 查询参数
     * @returns {Promise<PageResult<OperationLogInfo>>} 返回分页的操作日志列表
     */
    async list(query: OperationLogQuery): Promise<PageResult<OperationLogInfo>> {
        console.debug('[OperationLogService] list called with query:', JSON.stringify(query));

        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        const where: WhereOptions<OperationLog> = {};
        const userWhere: WhereOptions<User> = {}; // 用于关联查询User表

        // 用户筛选 (可以是 ID 或模糊用户名)
        if (query.userId) {
            const userIdNum = parseInt(String(query.userId), 10);
            if (!isNaN(userIdNum)) {
                where.userId = userIdNum; // 精确匹配用户ID
            } else {
                // 模糊匹配用户名 - 需要关联 User 表
                userWhere.username = { [Op.like]: `%${query.userId}%` };
            }
        }

        // 操作类型筛选 (模糊匹配)
        if (query.operationType) {
            where.operationType = { [Op.like]: `%${query.operationType}%` };
        }

        // 日期范围筛选
        if (query.startDate && query.endDate) {
            where.createdAt = { [Op.between]: [`${query.startDate} 00:00:00`, `${query.endDate} 23:59:59`] };
        } else if (query.startDate) {
            where.createdAt = { [Op.gte]: `${query.startDate} 00:00:00` };
        } else if (query.endDate) {
            where.createdAt = { [Op.lte]: `${query.endDate} 23:59:59` };
        }

        // 排序
        let order: Order = [['createdAt', 'DESC']]; // 默认按创建时间降序
        if (query.sortField && ['createdAt', 'userId', 'operationType'].includes(query.sortField)) {
             // 确保排序字段安全
             order = [[query.sortField, query.sortOrder === 'ASC' ? 'ASC' : 'DESC']];
             // 如果按用户名排序，需要特殊处理
             if (query.sortField === 'username') {
                order = [[{ model: User, as: 'user' }, 'username', query.sortOrder === 'ASC' ? 'ASC' : 'DESC']];
             }
        }


        console.debug('[OperationLogService] Constructed WHERE clause:', JSON.stringify(where));
        console.debug('[OperationLogService] Constructed User WHERE clause:', JSON.stringify(userWhere));
        console.debug('[OperationLogService] Constructed ORDER clause:', JSON.stringify(order));

        try {
            const { count, rows } = await OperationLog.findAndCountAll({
                where,
                include: [{
                    model: User,
                    as: 'user', // 与模型定义中的关联别名一致
                    attributes: ['username'], // 只获取用户名
                    where: Object.keys(userWhere).length > 0 ? userWhere : undefined, // 仅当需要按用户名筛选时添加 where
                    required: Object.keys(userWhere).length > 0 // 如果按用户名筛选，则需要内连接 (required: true)
                }],
                order,
                limit,
                offset,
                distinct: true, // 配合 include 使用，确保 count 准确
            });

            console.debug(`[OperationLogService] Found ${count} logs.`);

            const list: OperationLogInfo[] = rows.map(log => this.formatLogInfo(log));

            return {
                list,
                total: count,
                page,
                pageSize,
            };
        } catch (error: any) {
            console.error('[OperationLogService] Error listing logs:', error);
            throw new Error(`查询操作日志失败: ${error.message}`);
        }
    }

    /**
     * @description 格式化日志信息，添加用户名并格式化时间
     * @param {OperationLog} log - Sequelize OperationLog 实例
     * @returns {OperationLogInfo}
     */
    private formatLogInfo(log: OperationLog): OperationLogInfo {
        return {
            id: log.id,
            userId: log.userId,
            // @ts-ignore - User 可能不在每个 log 上，如果不是内连接
            username: log.user?.username || null,
            operationType: log.operationType,
            operationContent: log.operationContent,
            ipAddress: log.ipAddress,
            createdAt: format(log.createdAt, 'yyyy-MM-dd HH:mm:ss'), // 格式化时间
        };
    }
}

// 导出单例 (如果需要)
// export const operationLogService = new OperationLogService(); 