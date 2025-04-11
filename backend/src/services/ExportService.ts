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

// 定义导出选项接口
interface ExportOptions {
  fields: string[]; // 要导出的字段列表 (对应 DocumentInfo 的 key)
  fileType: 'excel' | 'csv';
}

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
   * @description 创建一个新的文档导出任务
   * @param query 原始查询条件
   * @param options 导出选项 (字段, 文件类型)
   * @param userId 发起任务的用户 ID
   * @returns {Promise<ExportTask>} 返回创建的任务对象
   */
  async createExportTask(query: DocumentListQuery, options: ExportOptions, userId: number): Promise<ExportTask> {
    console.log('[ExportService] Creating export task for user:', userId, 'Query:', query, 'Options:', options);

    const fileType = options.fileType || 'excel';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `documents_export_${userId}_${timestamp}.${fileType === 'excel' ? 'xlsx' : 'csv'}`;

    try {
      // **验证 fields 是否提供且不为空**
      if (!options.fields || options.fields.length === 0) {
          throw new Error('未指定要导出的字段');
      }

      const newTask = await ExportTask.create({
        userId: userId,
        taskType: 'document_export',
        status: 0, // Pending
        fileName: fileName,
        fileType: fileType,
        queryCriteria: JSON.stringify(query), // 存储查询条件
        selectedFields: JSON.stringify(options.fields), // **新增**: 存储选择的字段
        progress: 0,
        // filePath 和 errorMessage 默认为 null
      });

      console.log(`[ExportService] Export task ${newTask.id} created. Adding to queue.`);
      taskQueueService.addTask(newTask.id); // 将任务 ID 添加到队列

      return newTask;
    } catch (error) {
      console.error('[ExportService] Failed to create export task record:', error);
      // **改进错误消息传递**
      const message = error instanceof Error ? error.message : '创建导出任务失败';
      throw new Error(message);
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

      // 2. 解析查询条件和选择字段
      const queryCriteria: DocumentListQuery = JSON.parse(task.queryCriteria || '{}');
      const selectedFields: string[] = JSON.parse(task.selectedFields || '[]');
      const fileType = task.fileType as 'xlsx' | 'csv';

      if (selectedFields.length === 0) {
        throw new Error('未指定要导出的字段');
      }

      console.log(`[ExportService] Task ${taskId}: Fetching documents with query:`, queryCriteria);
      console.log(`[ExportService] Task ${taskId}: Selected fields:`, selectedFields);

      // 3. 获取所有匹配的文档数据 (不分页)
      // 注意：这里直接调用 list 方法，并传递一个很大的 pageSize 来获取所有数据
      // 对于非常大的数据集，这可能会导致内存问题，需要考虑流式处理或分批处理
      const MAX_EXPORT_ROWS = 100000; // 设置一个最大导出条数限制，防止内存溢出
      const result = await this.documentService.list({ ...queryCriteria, page: 1, pageSize: MAX_EXPORT_ROWS });
      const allDocuments: DocumentInfo[] = result.list;

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
          const value = (doc as any)[field]; // 获取字段值
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

  /**
   * @description 获取指定用户的导出任务列表 (分页)
   * @param userId 用户 ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns {Promise<{ list: ExportTask[], total: number }>} 任务列表和总数
   */
  async getTasksByUserId(userId: number, page: number | string = 1, pageSize: number | string = 10): Promise<{ list: ExportTask[], total: number }> {
    // 确保分页参数是数字
    const numPage = typeof page === 'string' ? parseInt(page, 10) : page;
    const numPageSize = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;

    // 进行 NaN 检查，并提供默认值
    const currentPage = isNaN(numPage) || numPage < 1 ? 1 : numPage;
    const currentLimit = isNaN(numPageSize) || numPageSize < 1 ? 10 : numPageSize;

    const offset = (currentPage - 1) * currentLimit;
    const limit = currentLimit;
    try {
      const result = await ExportTask.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });
      return { list: result.rows, total: result.count };
    } catch (error) {
      console.error(`[ExportService] Failed to fetch tasks for user ${userId}:`, error);
      throw new Error('获取导出任务列表失败');
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