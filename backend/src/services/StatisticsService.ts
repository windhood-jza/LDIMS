import Document from '../models/Document';
import { NameValueData } from '../types/statistics';
import sequelize from '../config/database';
import { literal, fn, col, Op } from 'sequelize';

// 接口定义日期筛选参数
interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

/**
 * @class StatisticsService
 * @description 处理统计相关的数据查询
 */
class StatisticsService {

  /**
   * @description 获取按来源部门统计的文档数量
   * @param {DateRangeParams} dateParams - 可选的日期范围参数
   * @returns {Promise<NameValueData[]>} 按部门分组的统计数据
   * @throws {Error} 如果查询数据库时发生错误
   */
  async getStatsByDepartment(dateParams?: DateRangeParams): Promise<NameValueData[]> {
    try {
      console.log('[StatisticsService] Fetching stats by department...', dateParams);
      
      // 构建日期条件
      const whereCondition: any = {
        sourceDepartmentName: { [Op.ne]: null }
      };
      
      // 如果有日期范围，添加到条件中
      if (dateParams?.startDate && dateParams?.endDate) {
        whereCondition.createdAt = {
          [Op.between]: [new Date(dateParams.startDate), new Date(dateParams.endDate)]
        };
      }
      
      const results = await Document.findAll({
        attributes: [
          ['source_department_name', 'name'],
          [fn('COUNT', col('id')), 'value']
        ],
        group: ['source_department_name'],
        where: whereCondition,
        raw: true, // Get plain JSON objects
      });
      
      // Sequelize count returns BigInt for some drivers, ensure value is number
      // Assert item type for TypeScript
      return results.map(item => {
          const rawItem = item as unknown as { name: string; value: number | string | bigint }; // <<< Fix: Assert via unknown
          return {
              name: rawItem.name,
              value: Number(rawItem.value)
          };
      }) as NameValueData[];
      
    } catch (error) {
      console.error('[StatisticsService] Error fetching stats by department:', error);
      throw new Error('Error fetching department statistics');
    }
  }

  /**
   * @description 获取按文档类型统计的文档数量
   * @param {DateRangeParams} dateParams - 可选的日期范围参数
   * @returns {Promise<NameValueData[]>} 按类型分组的统计数据
   * @throws {Error} 如果查询数据库时发生错误
   */
  async getStatsByDocType(dateParams?: DateRangeParams): Promise<NameValueData[]> {
    try {
      console.log('[StatisticsService] Fetching stats by doc type...', dateParams);
      
      // 构建日期条件
      const whereCondition: any = {
        docTypeName: { [Op.ne]: null }
      };
      
      // 如果有日期范围，添加到条件中
      if (dateParams?.startDate && dateParams?.endDate) {
        whereCondition.createdAt = {
          [Op.between]: [new Date(dateParams.startDate), new Date(dateParams.endDate)]
        };
      }
      
      const results = await Document.findAll({
        attributes: [
          ['doc_type_name', 'name'],
          [fn('COUNT', col('id')), 'value']
        ],
        group: ['doc_type_name'],
        where: whereCondition,
        raw: true,
      });
      
      // Assert item type for TypeScript
      return results.map(item => {
          const rawItem = item as unknown as { name: string; value: number | string | bigint }; // <<< Fix: Assert via unknown
          return {
              name: rawItem.name,
              value: Number(rawItem.value)
          };
      }) as NameValueData[];
      
    } catch (error) {
      console.error('[StatisticsService] Error fetching stats by doc type:', error);
      throw new Error('Error fetching document type statistics');
    }
  }
}

export default new StatisticsService(); 