import request from "../request";
import type { NameValueData } from "@ldims/types"; // 从共享类型包导入

/**
 * @interface DateRangeParams
 * @description 日期范围参数
 */
interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

/**
 * @description 获取按部门统计的文档数量
 * @param {DateRangeParams} params - 可选的日期范围参数
 * @returns {Promise<NameValueData[]>} 按部门分组的统计数据
 */
export const getStatsByDepartment = (
  params?: DateRangeParams
): Promise<NameValueData[]> => {
  return request.get("/statistics/by-department", { params });
};

/**
 * @description 获取按文档类型统计的文档数量
 * @param {DateRangeParams} params - 可选的日期范围参数
 * @returns {Promise<NameValueData[]>} 按类型分组的统计数据
 */
export const getStatsByDocType = (
  params?: DateRangeParams
): Promise<NameValueData[]> => {
  return request.get("/statistics/by-doc-type", { params });
};
