/**
 * 任务范围 (目前仅用于导出)
 */
export type ExportScope = 'all' | 'selected' | 'currentPage';

/**
 * 任务状态 (数字类型，与后端一致)
 * 0:排队中, 1:处理中, 2:已完成, 3:失败
 */
export type TaskStatus = 0 | 1 | 2 | 3;

/**
 * 后台任务信息接口 (通用)
 * 与后端 models/ExportTask.ts 对应
 */
export interface Task {
  id: number;
  userId: number;
  taskType: 'document_export' | 'document_import'; // 任务类型
  status: TaskStatus;
  progress: number | null; // 进度可能为 null
  originalFileName: string | null; // 导入任务的原始文件名
  fileName: string | null; // 导出任务的文件名
  fileType: string | null; // 文件类型 (xlsx, csv)
  filePath: string | null; // 确保 filePath 存在且类型正确
  errorMessage: string | null; // 任务失败时的总体错误消息
  errorDetails: string | null; // JSON 格式的详细错误信息
  totalRows: number | null; // 导入任务的总行数
  processedRows: number | null; // 导入任务已处理行数
  successCount: number | null; // 导入任务成功行数
  failureCount: number | null; // 导入任务失败行数
  // 以下字段主要用于导出任务
  queryCriteria: string | null; // 导出查询条件 (JSON)
  selectedFields: string | null; // 导出选择字段 (JSON array)
  exportScope: ExportScope | null; // 导出范围
  selectedIds: string | null; // 导出选中 IDs (JSON array)
  currentPageIds: string | null; // 导出当前页 IDs (JSON array)
  // 时间戳
  createdAt: string;
  updatedAt: string;
  // completedAt: string | null; // completedAt 可能不需要，状态已包含信息
}

/**
 * 获取任务列表的查询参数接口 (通用)
 */
export interface TaskQuery {
  page?: number;
  pageSize?: number;
  status?: TaskStatus;      // 按状态筛选 (可选)
  taskType?: 'document_export' | 'document_import' | 'all'; // 按类型筛选 (可选, 'all' 或不传表示所有)
}

/**
 * 请求创建文档导出任务的参数
 */
export interface DocumentExportRequestParams {
  fields: string[];
  fileType: 'xlsx' | 'csv';
  exportScope: ExportScope;
  query?: Record<string, any>; // 用于 scope = 'all'
  selectedIds?: number[];      // 用于 scope = 'selected'
  currentPageIds?: number[];   // 用于 scope = 'currentPage'
}

/**
 * 获取任务列表的响应 (通用)
 */
export interface TaskListResponse {
  list: Task[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 上传接口的响应
 */
export interface UploadResponse {
  message: string;
  fileName: string; // 服务器保存的文件名
  originalName: string; // 原始文件名
}

/**
 * 触发导入任务的请求参数
 */
export interface ImportRequestParams {
  fileName: string; // 服务器保存的文件名 (来自 UploadResponse)
  originalName: string; // 原始文件名 (来自 UploadResponse)
} 