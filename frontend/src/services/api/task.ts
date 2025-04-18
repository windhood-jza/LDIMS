import request from '../request'
import type {
  Task,
  TaskListResponse,
  TaskQuery,
  DocumentExportRequestParams,
  UploadResponse,
  ImportRequestParams
} from '@/types/export'

/**
 * @description 上传 Excel 文件
 * @param file 要上传的文件对象
 * @returns Promise<UploadResponse>
 */
export const uploadExcelFile = (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('excelFile', file);

  return request.post('/upload/excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
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
 * @description 请求创建文档导出任务
 * @param params
 * @returns Promise<{ taskId: number }>
 */
export function requestExport(params: DocumentExportRequestParams): Promise<{ taskId: number }> {
  return request.post<{ taskId: number }>('/documents/export', params)
}

/**
 * @description 获取任务列表（通用）
 * @param params 查询参数 (page, pageSize, taskType)
 * @returns Promise<TaskListResponse>
 */
export function getTasks(params: TaskQuery): Promise<TaskListResponse> {
  return request.get('/export-tasks', { params })
}

/**
 * @description 获取指定任务的状态和进度 (可能需要调整)
 * @param taskId 任务 ID
 * @returns Promise<Partial<Task>> // 返回部分 Task 信息可能更灵活
 */
export function getTask(taskId: number): Promise<Partial<Task>> {
  return request.get(`/export-tasks/${taskId}`)
}

/**
 * @description 下载已完成的导出文件
 * @param taskId 任务 ID
 * @returns Promise<Blob>
 */
export function downloadTaskFile(taskId: number): Promise<Blob> {
  return request.get(`/export-tasks/${taskId}/download`, {
    responseType: 'blob'
  })
} 