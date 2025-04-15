import { Op, WhereOptions } from 'sequelize';
import ExportTask from '../models/ExportTask';
import Document from '../models/Document';
import { DocumentService } from './DocumentService'; // 引入 DocumentService
import { DocumentInfo, DocumentListQuery } from '../types/document.d'; // 引入查询类型和信息类型
import { taskQueueService } from './TaskQueueService'; // 引入任务队列服务
import * as fs from 'fs'; // 修改为导入标准 fs 模块
import * as path from 'path';
import * as xlsx from 'xlsx'; // 用于生成 Excel

// 中英文列名映射
const fieldToHeaderMap: Record<string, string> = {
  id: '文档 ID',
  docName: '文档名称',
  docTypeName: '文档类型',
  sourceDepartmentName: '来源部门',
  submitter: '提交人',
  receiver: '接收人',
  signer: '签收（章）人',
  handoverDate: '交接日期',
  storageLocation: '保管位置',
  remarks: '备注',
  createdByName: '创建人',
  createdAt: '创建时间',
  updatedByName: '最后修改人',
  updatedAt: '最后修改时间',
};

/**
 * @class ExportService
 * @description 处理文档导出任务的服务
 */
export class ExportService {
  private documentService: DocumentService;

  constructor(documentService: DocumentService) {
    this.documentService = documentService;
    // 将 ExportService 实例注入 TaskQueueService
    taskQueueService.setExportService(this);
  }

  /**
   * @description 创建一个新的导出任务记录
   * @param query 查询条件 (如果 scope='all')
   * @param options 包含 fields 和 fileType
   * @param userId 用户 ID
   * @param exportScope 导出范围 ('all' 或 'selected' 或 'currentPage')
   * @param selectedIdsJson 选中项 ID 列表 (JSON 字符串, 如果 scope='selected')
   * @param currentPageIdsJson 当前页 ID 列表 (JSON 字符串, 如果 scope='currentPage')
   * @returns {Promise<ExportTask>} 创建的任务对象
   */
  async createExportTask(
    query: DocumentListQuery | null, // query 可以为 null
    options: { fields: string[]; fileType: 'xlsx' | 'csv' },
    userId: number,
    exportScope: 'all' | 'selected' | 'currentPage' = 'all',
    selectedIdsJson: string | null = null, // 保持 JSON 字符串 (假设 TEXT)
    currentPageIds: number[] | null = null // <-- 修改参数类型为 number[] | null
  ): Promise<ExportTask> {
    console.log(`[ExportService] Creating export task for user: ${userId}, Scope: ${exportScope}, Query:`, query, 'Options:', options);

    const fileType = options.fileType || 'xlsx';

    try {
      if (!options.fields || options.fields.length === 0) {
          throw new Error('未指定要导出的字段');
      }

      const newTask = await ExportTask.create({
        userId,
        taskType: 'document_export',
        status: 0,
        queryCriteria: exportScope === 'all' ? JSON.stringify(query || {}) : null,
        selectedFields: JSON.stringify(options.fields || []),
        fileType: options.fileType,
        exportScope: exportScope,
        selectedIds: selectedIdsJson, // selectedIds 假设仍是 TEXT
        currentPageIds: currentPageIds, // <-- 直接传递数组或 null
        // 初始化其他可能为 null 的字段
        originalFileName: null,
        fileName: null,
        filePath: null,
        progress: 0,
        totalRows: null,
        processedRows: null,
        successCount: null,
        failureCount: null,
        errorDetails: null,
        errorMessage: null,
      });

      console.log(`[ExportService] Created new export task ${newTask.id} with scope: ${exportScope}`);

      if (taskQueueService) {
          taskQueueService.addTask(newTask.id);
          console.log(`[ExportService] Task ${newTask.id} added to queue.`);
      } else {
          console.error(`[ExportService] TaskQueueService not available, task ${newTask.id} cannot be queued.`);
          // Consider failing the task creation if queue is essential
          throw new Error('任务队列服务不可用，无法创建导出任务');
      }

      return newTask;
    } catch (error) {
      console.error('[ExportService] Failed to create export task:', error);
      if (error instanceof Error && (error.message === '未指定要导出的字段' || error.message.includes('任务队列服务不可用'))) {
          throw error;
      }
      throw new Error('创建导出任务数据库记录失败');
    }
  }

  /**
   * @description 实际处理导出任务的逻辑
   * @param taskId 任务 ID
   */
  async processExportTask(taskId: number): Promise<void> {
    console.log(`[ExportService] Processing task ${taskId}...`);
    let task: ExportTask | null = null;
    try {
      task = await ExportTask.findByPk(taskId);
      if (!task || task.status !== 0) { // 仅处理待处理任务
        console.log(`[ExportService] Task ${taskId} not found or not in pending state.`);
        return;
      }

      // 1. 更新任务状态为处理中
      task.status = 1; // 1: processing
      task.progress = 10; // 初始进度
      await task.save();

      // 2. 解析查询条件、选择字段和导出范围
      const queryCriteria: DocumentListQuery | null = JSON.parse(task.queryCriteria || 'null');
      const selectedFields: string[] = JSON.parse(task.selectedFields || '[]');
      const fileType = task.fileType as 'xlsx' | 'csv';
      const exportScope = task.exportScope;
      const selectedIds: number[] | null = JSON.parse(task.selectedIds || 'null');
      const currentPageIds: number[] | null = task.currentPageIds as number[] | null; // 直接使用，类型断言以兼容

      if (selectedFields.length === 0) {
        throw new Error('未指定要导出的字段');
      }

      let allDocuments: DocumentInfo[] = [];
      const MAX_EXPORT_ROWS = 100000;

      // 3. 根据导出范围获取文档数据
      if (exportScope === 'selected') {
          if (!selectedIds || selectedIds.length === 0) {
              throw new Error('导出选中项时未提供有效的 ID 列表');
          }
          console.log(`[ExportService] Task ${taskId}: Fetching selected documents with IDs:`, selectedIds);
          // --- 复用获取和格式化逻辑 --- 
          allDocuments = await this.fetchDocumentsByIds(selectedIds, MAX_EXPORT_ROWS);
          // ----------------------------
      } else if (exportScope === 'currentPage') { // <-- 新增处理 currentPage
          if (!currentPageIds || currentPageIds.length === 0) {
              throw new Error('导出当前页时未提供有效的 ID 列表');
          }
          console.log(`[ExportService] Task ${taskId}: Fetching current page documents with IDs:`, currentPageIds);
          // --- 复用获取和格式化逻辑 --- 
          allDocuments = await this.fetchDocumentsByIds(currentPageIds, MAX_EXPORT_ROWS);
          // ----------------------------
      } else { // exportScope === 'all'
          console.log(`[ExportService] Task ${taskId}: Fetching documents with query:`, queryCriteria);
          const result = await this.documentService.list({ ...(queryCriteria || {}), page: 1, pageSize: MAX_EXPORT_ROWS });
          allDocuments = result.list;
      }

      console.log(`[ExportService] Task ${taskId}: Found ${allDocuments.length} documents to export.`);
      task.progress = 50; // 更新进度
      await task.save();

      // 4. 准备导出数据 (包括中文表头)
      const exportData: any[][] = [];

      // 创建中文表头行
      const headerRow = selectedFields.map(field => fieldToHeaderMap[field] || field); // 如果映射不存在，使用原始字段名
      exportData.push(headerRow);

      // 创建数据行
      allDocuments.forEach(doc => {
        const dataRow = selectedFields.map(field => {
          let value: any;
          // --- 重点修改：映射字段名到 DTO 属性名 ---
          if (field === 'sourceDepartmentName') {
            value = doc.departmentName; // 使用 DTO 的 departmentName
          } else if (field === 'docTypeName') {
            value = doc.docTypeName;     // 使用 DTO 的 docTypeName
          } else if (field === 'createdByName') {
              value = doc.createdByName; // 使用 DTO 的 createdByName
          } else if (field === 'updatedByName') { // 检查 fieldToHeaderMap，如果用了 updatedByName
              value = doc.updatedBy;     // 对应 DTO 的 updatedBy
          }
          else {
            value = (doc as any)[field]; // 其他字段直接使用
          }
          // --- 修改结束 ---

          // 可以根据需要格式化特定字段 (例如日期)
          if ((field === 'createdAt' || field === 'updatedAt' || field === 'handoverDate') && value) {
              try {
                  // 尝试格式化日期 YYYY-MM-DD HH:MM 或 YYYY-MM-DD
                  const dt = new Date(value);
                  const year = dt.getFullYear();
                  const month = (dt.getMonth() + 1).toString().padStart(2, '0');
                  const day = dt.getDate().toString().padStart(2, '0');
                  if (field === 'handoverDate') {
                      return `${year}-${month}-${day}`;
                  } else {
                      const hours = dt.getHours().toString().padStart(2, '0');
                      const minutes = dt.getMinutes().toString().padStart(2, '0');
                      return `${year}-${month}-${day} ${hours}:${minutes}`;
                  }
              } catch (e) { return value; } // 格式化失败则返回原始值
          }
          return value !== null && value !== undefined ? value : ''; // 处理 null/undefined
        });
        exportData.push(dataRow);
      });

      // 5. 生成文件
      const exportsDir = path.join(__dirname, '../../exports'); // 导出目录
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `documents_export_${taskId}_${timestamp}.${fileType}`;
      const filePath = path.join(exportsDir, fileName);

      console.log(`[ExportService] Task ${taskId}: Generating ${fileType} file at ${filePath}...`);

      if (fileType === 'xlsx') {
        const worksheet = xlsx.utils.aoa_to_sheet(exportData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Documents');
        xlsx.writeFile(workbook, filePath);
      } else if (fileType === 'csv') {
        // 对于 CSV，需要确保特殊字符被正确处理
        const csvContent = exportData.map(row =>
          row.map(cell => {
            const cellStr = String(cell);
            // 如果包含逗号、引号或换行符，则用引号括起来，并将内部引号转义
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        ).join('\n');
        fs.writeFileSync(filePath, '\ufeff' + csvContent, { encoding: 'utf8' }); // 添加 BOM 头以兼容 Excel 打开中文
      }

      console.log(`[ExportService] Task ${taskId}: File generated successfully.`);

      // 6. 更新任务状态为完成
      task.status = 2; // 2: completed
      task.progress = 100;
      task.fileName = fileName;
      task.filePath = filePath; // 保存相对或绝对路径，取决于部署需求
      await task.save();

      console.log(`[ExportService] Task ${taskId} completed successfully.`);

    } catch (error: any) {
      console.error(`[ExportService] Error processing task ${taskId}:`, error);
      if (task) {
        try {
          task.status = 3; // 3: failed
          task.progress = null;
          task.errorMessage = error.message || '导出过程中发生未知错误';
          await task.save();
          console.log(`[ExportService] Task ${taskId} status updated to Failed.`);
        } catch (saveError) {
          console.error(`[ExportService] Failed to update task ${taskId} status to Failed:`, saveError);
        }
      }
    }
  }

  // --- 新增辅助方法：根据 ID 获取文档并格式化 --- 
  /**
   * @description 根据 ID 列表获取文档数据并格式化
   * @param ids 文档 ID 列表
   * @param limit 最大行数限制
   * @returns {Promise<DocumentInfo[]>}
   * @private
   */
  private async fetchDocumentsByIds(ids: number[], limit: number): Promise<DocumentInfo[]> {
      const result = await Document.findAll({
          where: {
              id: { [Op.in]: ids }
          },
          // 警告: 如果 formatDocumentInfo 需要关联数据，这里仍需添加 include
          // 但根据当前 formatDocumentInfo 的实现，它似乎依赖预置的 name 字段
          limit: limit
      });

      // --- 重点修改：调用 formatDocumentInfo 进行格式化 --- 
      return result.map(doc => this.documentService.formatDocumentInfo(doc));
      // -------------------------------------------------
  }
  // --- 辅助方法结束 ---

  /**
   * @description 获取指定用户的导出任务列表 (分页)
   * @param userId 用户 ID
   * @param page 页码
   * @param pageSize 每页数量
   * @param taskType 任务类型 (可选)
   * @returns {Promise<{ list: ExportTask[], total: number }>} 任务列表和总数
   */
  async getTasksByUserId(
    userId: number,
    page: number | string = 1,
    pageSize: number | string = 10,
    taskType?: 'document_export' | 'document_import' | 'all' // 添加 taskType 参数
  ): Promise<{ list: ExportTask[], total: number }> {
    // 确保分页参数是数字
    const numPage = typeof page === 'string' ? parseInt(page, 10) : page;
    const numPageSize = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;

    // 进行 NaN 检查，并提供默认值
    const currentPage = isNaN(numPage) || numPage < 1 ? 1 : numPage;
    const currentLimit = isNaN(numPageSize) || numPageSize < 1 ? 10 : numPageSize;

    const offset = (currentPage - 1) * currentLimit;
    const limit = currentLimit;

    // 构建查询条件
    const where: WhereOptions<ExportTask> = { userId };
    if (taskType && taskType !== 'all') {
      where.taskType = taskType;
    }

    try {
      const result = await ExportTask.findAndCountAll({
        where, // 使用构建的 where 条件
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        // Sequelize 默认会选择所有字段，包括 originalFileName
        // attributes: { exclude: ['queryCriteria'] } // 可以选择性排除大字段
      });
      return { list: result.rows, total: result.count };
    } catch (error) {
      console.error(`[ExportService] Failed to fetch tasks for user ${userId} with type ${taskType}:`, error);
      throw new Error('获取任务列表失败');
    }
  }

  /**
   * @description 获取单个导出任务详情
   * @param taskId 任务 ID
   * @param userId 请求用户 ID (用于权限验证)
   * @returns {Promise<ExportTask | null>} 任务对象或 null
   */
  async getTaskById(taskId: number, userId: number): Promise<ExportTask | null> {
    try {
      const task = await ExportTask.findByPk(taskId);
      // 简单权限检查：任务必须属于请求用户
      if (task && task.userId === userId) {
        return task;
      } else {
        return null; // 或抛出权限错误
      }
    } catch (error) {
      console.error(`[ExportService] Failed to fetch task ${taskId} for user ${userId}:`, error);
      throw new Error('获取任务详情失败');
    }
  }
}

// 注意: 创建 ExportService 实例需要 DocumentService 实例
// 这通常在应用启动或依赖注入容器中完成
// export const exportService = new ExportService(documentService); // 示例，需要传入 documentService 