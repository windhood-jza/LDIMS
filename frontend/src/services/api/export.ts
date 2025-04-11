import request from '../request'
import type { ExportTask, ExportTaskQuery } from '@/types/export' // 假设类型文件路径
import type { ApiResponse } from '@/types/api'

/**
 * @description 请求创建导出任务
 * @param {any} queryCriteria - 查询条件
 * @param {string[]} selectedFields - 选择导出的字段
 * @param {string} fileType - 导出文件类型 ('xlsx', 'csv')
 * @returns {Promise<ApiResponse<{ taskId: number }>>} 返回包含任务 ID 的响应
 */
export function requestExport(queryCriteria: any, selectedFields: string[], fileType: string): Promise<ApiResponse<{ taskId: number }>> {
  return request.post('/documents/export', {
    query: queryCriteria,
    fields: selectedFields,
    fileType
  })
}

/**
 * @description 获取导出任务列表
 * @param {ExportTaskQuery} params - 查询参数
 * @returns {Promise<ApiResponse<{ list: ExportTask[], total: number }>>} 返回任务列表和总数
 */
export function getExportTasks(params: ExportTaskQuery): Promise<ApiResponse<{ list: ExportTask[], total: number }>> {
  return request.get('/export-tasks', { params })
}

/**
 * @description 获取单个导出任务的状态
 * @param {number} taskId - 任务 ID
 * @returns {Promise<ApiResponse<ExportTask>>} 返回任务详情
 */
export function getExportTaskStatus(taskId: number): Promise<ApiResponse<ExportTask>> {
  return request.get(`/export-tasks/${taskId}`)
}

/**
 * @description 下载导出文件
 * @param {number} taskId - 任务 ID
 * @returns {Promise<Blob>} 返回文件 Blob 数据
 */
export function downloadExportFile(taskId: number): Promise<Blob> {
  return request.get(`/export-tasks/${taskId}/download`, {
    responseType: 'blob' // 重要：设置响应类型为 blob 以下载文件
  })
} 