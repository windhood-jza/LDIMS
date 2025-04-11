import request from '../request'
import type {
  ExportTask,
  ExportTaskListResponse,
  ExportTaskQuery,
  ExportRequestParams
} from '@/types/export' // 假设类型文件路径
import type { ApiResponse } from '@/types/api'

/**
 * @description 请求创建导出任务
 * @param {object} params - 请求参数对象
 * @param {any} params.query - 查询条件 (scope='all')
 * @param {string[]} params.fields - 选择导出的字段
 * @param {'xlsx' | 'csv'} params.fileType - 导出文件类型
 * @param {'all' | 'selected'} params.exportScope - 导出范围
 * @param {number[]} [params.selectedIds] - 选中项 ID 列表 (scope='selected')
 * @returns {Promise<ApiResponse<{ taskId: number }>>} 返回包含任务 ID 的响应
 */
export function requestExport(params: ExportRequestParams): Promise<ApiResponse<{ taskId: number }>> {
  return request.post('/documents/export', params) // 直接传递整个 params 对象
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

/**
 * @description 获取当前用户的导出任务列表（分页）
 * @param params 查询参数 (page, pageSize)
 * @returns Promise<ExportTaskListResponse>
 */
export function getExportTasksList(params: ExportTaskQuery): Promise<ExportTaskListResponse> {
  return request.get('/export/tasks', { params })
}

/**
 * @description 获取指定导出任务的状态和进度
 * @param taskId 任务 ID
 * @returns Promise<{ status: number; progress: number; filePath: string | null; errorMessage: string | null }>
 */
export function getExportTaskStatusDetails(taskId: number): Promise<{ status: number; progress: number; filePath: string | null; errorMessage: string | null }> {
  return request.get(`/export/tasks/${taskId}/status`)
}

/**
 * @description 下载已完成的导出文件
 * @param taskId 任务 ID
 * @returns Promise<Blob>
 */
export function downloadExportFileDetails(taskId: number): Promise<Blob> {
  return request.get(`/export/tasks/${taskId}/download`, {
    responseType: 'blob' // 重要：指定响应类型为 blob
  })
} 