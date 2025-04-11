/**
 * 导出任务范围
 */
export type ExportScope = 'all' | 'selected' | 'currentPage';

/**
 * 导出任务状态 (数字类型，与后端一致)
 * 0: pending, 1: processing, 2: completed, 3: failed
 */
export type ExportTaskStatus = 0 | 1 | 2 | 3;

/**
 * 导出任务信息接口
 * 与后端 models/ExportTask.ts 基本对应
 */
export interface ExportTask {
  id: number;
  userId: number;
  taskType: 'document_export' | 'document_import';
  status: ExportTaskStatus;
  progress: number;
  queryCriteria: string | null;
  selectedFields: string | null;
  fileType: string | null;
  fileName: string | null;
  filePath: string | null;
  errorMessage: string | null;
  exportScope: ExportScope | null;
  selectedIds: string | null;
  currentPageIds: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  totalRows?: number | null;
  processedRows?: number | null;
  successCount?: number | null;
  failureCount?: number | null;
  errorDetails?: string | null;
}

/**
 * 获取导出任务列表的查询参数接口
 */
export interface ExportTaskQuery {
  page?: number;
  pageSize?: number;
  status?: ExportTaskStatus;      // 按状态筛选 (可选)
  taskType?: 'document_export' | 'document_import';
}

/**
 * 请求创建导出任务的参数
 */
export interface ExportRequestParams {
  fields: string[];
  fileType: 'xlsx' | 'csv';
  exportScope: ExportScope;
  query?: Record<string, any>; // 用于 scope = 'all'
  selectedIds?: number[];      // 用于 scope = 'selected'
  currentPageIds?: number[];   // <-- 新增: 用于 scope = 'currentPage'
}

/**
 * 获取导出任务列表的响应
 */
export interface ExportTaskListResponse {
  list: ExportTask[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 上传接口的响应
 */
export interface UploadResponse {
  message: string;
  fileName: string;
  originalName: string;
}

/**
 * 触发导入任务的请求参数
 */
export interface ImportRequestParams {
  fileName: string;
  originalName: string;
} 