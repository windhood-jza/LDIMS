import request from '../request';
import type { NameValueData } from '@backend-types/statistics'; // Assuming backend types alias is set up

/**
 * @description 获取按部门统计的文档数量
 * @returns {Promise<NameValueData[]>} 按部门分组的统计数据
 */
export const getStatsByDepartment = (): Promise<NameValueData[]> => {
  return request.get('/statistics/by-department');
};

/**
 * @description 获取按文档类型统计的文档数量
 * @returns {Promise<NameValueData[]>} 按类型分组的统计数据
 */
export const getStatsByDocType = (): Promise<NameValueData[]> => {
  return request.get('/statistics/by-doc-type');
}; 