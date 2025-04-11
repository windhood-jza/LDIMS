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
  status: ExportTaskStatus; // 使用数字类型
  fileName: string | null;       // 文件名可能在任务完成前为 null
  fileType: 'xlsx' | 'csv';      // 文件类型
  queryCriteria: string;        // 查询条件（JSON 字符串）
  selectedFields: string;       // 选择的字段（JSON 字符串）
  progress: number | null;        // 进度 (0-100)，处理中才有，否则为 null
  filePath: string | null;        // 修改为 filePath，完成后才有
  errorMessage: string | null;    // 错误信息，失败后才有
  exportScope: 'all' | 'selected'; // 添加导出范围
  selectedIds: string | null;     // 添加选中 ID 列表 (JSON 字符串)
  createdAt: string;              // 创建时间 (ISO 8601 字符串)
  updatedAt: string;              // 更新时间 (ISO 8601 字符串)
}

/**
 * 获取导出任务列表的查询参数接口
 */
export interface ExportTaskQuery {
  page: number;
  pageSize: number;
  status?: ExportTaskStatus;      // 按状态筛选 (可选)
  // 可以根据需要添加其他筛选条件，例如按创建时间范围等
} 