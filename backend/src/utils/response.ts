/**
 * API响应工具
 * 提供统一的响应格式
 */

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export interface PageResult<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 创建成功响应
 * @param data 响应数据
 * @param message 成功消息
 * @returns 标准格式的成功响应
 */
export const success = <T>(data?: T, message = '操作成功'): ApiResponse<T> => ({
  code: 200,
  message,
  data
});

/**
 * 创建失败响应
 * @param message 错误消息
 * @param code 错误代码
 * @returns 标准格式的失败响应
 */
export const fail = (message: string, code = 400): ApiResponse => ({
  code,
  message
});

/**
 * 创建分页响应
 * @param list 数据列表
 * @param total 总记录数
 * @param page 当前页码
 * @param pageSize 每页大小
 * @param message 成功消息
 * @returns 标准格式的分页响应
 */
export const page = <T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number,
  message = '查询成功'
): ApiResponse<PageResult<T>> => ({
  code: 200,
  message,
  data: {
    list,
    total,
    page,
    pageSize
  }
}); 