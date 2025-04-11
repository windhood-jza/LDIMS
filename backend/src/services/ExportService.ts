import { Op, WhereOptions } from 'sequelize';
import ExportTask from '../models/ExportTask';
import Document from '../models/Document';
import { DocumentService } from './DocumentService'; // 引入 DocumentService
import { DocumentInfo, DocumentListQuery } from '../types/document.d'; // 引入查询类型和信息类型
import { taskQueueService } from './TaskQueueService'; // 引入任务队列服务
import * as fs from 'fs/promises';
import * as path from 'path';
import * as xlsx from 'xlsx'; // 用于生成 Excel

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
   * @description 处理单个导出任务 (由 TaskQueueService 调用)
   * @param taskId 任务 ID
   */
  async processExportTask(taskId: number): Promise<void> {
    console.log(`[ExportService] Starting to process export task ${taskId}`);
    let task: ExportTask | null = null;

    try {
      task = await ExportTask.findByPk(taskId);
      if (!task) {
        console.error(`[ExportService] Task ${taskId} not found for processing.`);
        return;
      }

      // 1. 更新状态为处理中
      task.status = 1; // Processing
      task.progress = 10; // 设置初始进度
      await task.save();
      console.log(`[ExportService] Task ${taskId} status updated to Processing.`);

      // **修改**: 解析查询条件和导出的字段
      if (!task.queryCriteria) {
        throw new Error('Query criteria not found in task.');
      }
      if (!task.selectedFields) { // **新增**: 检查 selectedFields
          throw new Error('Selected fields not found in task.');
      }
      const query: DocumentListQuery = JSON.parse(task.queryCriteria);
      const selectedFields: string[] = JSON.parse(task.selectedFields); // **修改**: 从 task 读取

      if (selectedFields.length === 0) {
          throw new Error('No fields specified for export in task.');
      }

      const exportOptions: ExportOptions = {
        fields: selectedFields, // **修改**: 使用解析出的字段
        fileType: task.fileType as ('excel' | 'csv') || 'excel',
      };
      console.log(`[ExportService] Task ${taskId} - Parsed query:`, query, 'Options:', exportOptions);

      // 3. 获取所有数据 (需要修改 DocumentService.list 或添加新方法)
      console.log(`[ExportService] Task ${taskId} - Fetching all documents...`);
      // **假设** DocumentService 有一个 getAll 方法或 list 支持 pageSize=-1
      // 注意：一次性加载大量数据可能导致内存问题，实际应用中可能需要分页获取或流式处理
      const allDocumentsResult = await this.documentService.list({ ...query, page: 1, pageSize: -1 }); // 使用 pageSize: -1 表示获取所有
      const allDocuments: DocumentInfo[] = allDocumentsResult.list;
      const totalDocs = allDocuments.length;
      console.log(`[ExportService] Task ${taskId} - Fetched ${totalDocs} documents.`);
      task.progress = 30;
      await task.save();

      if (totalDocs === 0) {
          console.log(`[ExportService] Task ${taskId} - No documents found for export. Marking as completed.`);
          task.status = 2; // Completed
          task.progress = 100;
          task.filePath = null; // 没有文件生成
          await task.save();
          return;
      }

      // **确认**: 准备数据的逻辑现在使用 exportOptions.fields (来自 task.selectedFields)
      const dataToExport = allDocuments.map((doc: DocumentInfo) => {
        const row: any = {};
        exportOptions.fields.forEach(field => {
          // **确认**: key 断言和 doc 类型应已修复 TS7053
          const key = field as keyof DocumentInfo;
          if (key === 'handoverDate' || key === 'createdAt' || key === 'updatedAt') {
              row[field] = doc[key] ? new Date(doc[key] as string | Date).toLocaleDateString('zh-CN') : ''; // 稍作调整以处理可能的类型
          } else {
              row[field] = doc[key] ?? '';
          }
        });
        return row;
      });
      task.progress = 60;
      await task.save();

      // 5. 生成文件 (Excel 或 CSV)
      console.log(`[ExportService] Task ${taskId} - Generating ${exportOptions.fileType} file...`);
      const exportDir = path.resolve(__dirname, '../../uploads/exports'); // 定义导出目录
      await fs.mkdir(exportDir, { recursive: true }); // 确保目录存在
      const filePath = path.join(exportDir, task.fileName || `export_${taskId}.xlsx`); // 使用 task 中的 fileName

      if (exportOptions.fileType === 'excel') {
        const worksheet = xlsx.utils.json_to_sheet(dataToExport);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Documents');
        await xlsx.writeFile(workbook, filePath);
      } else {
        // **确认**: CSV header 和 rows 使用 exportOptions.fields
        const header = exportOptions.fields.join(',') + '\n';
        const rows = dataToExport.map(row => exportOptions.fields.map(field => `"${String(row[field]).replace(/"/g, '""')}"`).join(',')).join('\n');
        await fs.writeFile(filePath, header + rows, 'utf8');
      }
      console.log(`[ExportService] Task ${taskId} - File saved to ${filePath}`);
      task.progress = 90;
      await task.save();

      // 6. 更新任务状态为完成
      task.status = 2; // Completed
      task.progress = 100;
      task.filePath = filePath; // 记录文件路径
      await task.save();
      console.log(`[ExportService] Task ${taskId} successfully completed.`);

    } catch (error) {
      console.error(`[ExportService] Failed to process task ${taskId}:`, error);
      if (task) {
        try {
          task.status = 3; // Failed
          task.progress = task.progress || 0; // 保留失败前的进度
          task.errorMessage = error instanceof Error ? error.message : String(error);
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
  async getTasksByUserId(userId: number, page: number = 1, pageSize: number = 10): Promise<{ list: ExportTask[], total: number }> {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
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