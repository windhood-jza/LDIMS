import request from '../request'
import type {
  ExportTask,
  ExportTaskListResponse,
  ExportTaskQuery,
  ExportRequestParams,
  UploadResponse,
  ImportRequestParams
} from '@/types/export' // 假设类型文件路径
import type { ApiResponse } from '@/types/api'

/**
 * @description 上传 Excel 文件
 * @param file 要上传的文件对象
 * @returns Promise<UploadResponse>
 */
export const uploadExcelFile = (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('excelFile', file); // 'excelFile' 必须与后端 multer 配置的字段名一致

  return request.post('/upload/excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data' // 设置请求头
    }
    // 可以添加上传进度处理 (onUploadProgress)
  });
};

/**
 * @description 请求创建文档导入任务
 * @param params 包含 fileName 和 originalName
 * @returns Promise<{ taskId: number }>
 */
export const requestImport = (params: ImportRequestParams): Promise<{ taskId: number }> => {
    return request.post('/documents/import', params);
};

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
 * @description 获取任务列表（包括导入和导出）
 * @param params 查询参数 (page, pageSize, taskType)
 * @returns Promise<ExportTaskListResponse>
 */
export function getTasks(params: ExportTaskQuery): Promise<ExportTaskListResponse> {
  return request.get('/export/tasks', { params })
}

/**
 * @description 获取指定任务的状态和进度
 * @param taskId 任务 ID
 * @returns Promise<{ status: number; progress: number; filePath: string | null; errorMessage: string | null }>
 */
export function getTaskStatus(taskId: number): Promise<{ status: number; progress: number; filePath: string | null; errorMessage: string | null }> {
  return request.get(`/export/tasks/${taskId}/status`)
}

/**
 * @description 下载已完成的导出文件
 * @param taskId 任务 ID
 * @returns Promise<Blob>
 */
export function downloadExportFile(taskId: number): Promise<Blob> {
  return request.get(`/export/tasks/${taskId}/download`, {
    responseType: 'blob' // 重要：设置响应类型为 blob 以下载文件
  })
} 