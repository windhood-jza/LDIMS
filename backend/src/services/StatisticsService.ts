import Document from '../models/Document';
import { NameValueData } from '../types/statistics';
import sequelize from '../config/database';
import { literal, fn, col, Op } from 'sequelize';

/**
 * @class StatisticsService
 * @description 处理统计相关的数据查询
 */
class StatisticsService {

  /**
   * @description 获取按来源部门统计的文档数量
   * @returns {Promise<NameValueData[]>} 按部门分组的统计数据
   * @throws {Error} 如果查询数据库时发生错误
   */
  async getStatsByDepartment(): Promise<NameValueData[]> {
    try {
      console.log('[StatisticsService] Fetching stats by department...');
      const results = await Document.findAll({
        attributes: [
          ['source_department_name', 'name'],
          [fn('COUNT', col('id')), 'value']
        ],
        group: ['source_department_name'],
        where: {
          sourceDepartmentName: { [Op.ne]: null }
        },
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
   * @returns {Promise<NameValueData[]>} 按类型分组的统计数据
   * @throws {Error} 如果查询数据库时发生错误
   */
  async getStatsByDocType(): Promise<NameValueData[]> {
    try {
      console.log('[StatisticsService] Fetching stats by doc type...');
      const results = await Document.findAll({
        attributes: [
          ['doc_type_name', 'name'],
          [fn('COUNT', col('id')), 'value']
        ],
        group: ['doc_type_name'],
         where: {
           docTypeName: { [Op.ne]: null }
         },
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