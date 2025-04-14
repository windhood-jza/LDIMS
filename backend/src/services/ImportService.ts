import ExportTask from '../models/ExportTask';
// import { DocumentService } from './DocumentService'; // 假设 DocumentService 在别处实例化并注入
import { taskQueueService } from './TaskQueueService'; // 确认路径和初始化
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import sequelize from '../config/database'; // 引入 sequelize 实例用于事务
import Document /*, { DocumentAttributes } */ from '../models/Document'; // 引入 Document 模型, 暂时不导入 DocumentAttributes
// import User from '../models/User'; // 如果需要获取创建者姓名，取消注释

// --- 定义导入数据的类型，手动列出可导入字段 ---
// (替代 Omit<DocumentAttributes,...> 以避免导入问题)
interface DocumentImportDataBase {
    docName?: string | null;
    docTypeName?: string | null;
    sourceDepartmentName?: string | null;
    submitter?: string | null;
    receiver?: string | null;
    signer?: string | null;
    storageLocation?: string | null;
    remarks?: string | null;
    handoverDate?: Date | null;
    // --- 根据 EXCEL_COLUMN_MAP 添加其他可能导入的字段 ---
    // docSerialNumber?: string | null;
    // securityLevel?: string | null;
    // retentionPeriod?: string | null;
    // keywords?: string | null;
    // archiveDate?: Date | null;
}
type DocumentImportData = Partial<DocumentImportDataBase>; // 使用 Partial 允许部分属性
// ------------------------------------------

// --- 定义 Excel 列名到数据库字段名/处理键的映射 ---
// 键是 Excel 列名，值是 DocumentImportDataBase 的键或 `ignore_` 前缀字符串
const EXCEL_COLUMN_MAP: Record<string, keyof DocumentImportDataBase | `ignore_${string}`> = {
    '文档名称': 'docName', // 对应数据库 doc_name, 必填
    '文档类型': 'docTypeName', // 对应数据库 doc_type_name, 允许为空
    '来源部门': 'sourceDepartmentName', // 对应数据库 source_department_name, 允许为空
    '提交人': 'submitter', // 对应数据库 submitter, 必填
    '接收人': 'receiver', // 对应数据库 receiver, 必填
    '签收（章）人': 'signer', // 对应数据库 signer, 允许为空
    '保管位置': 'storageLocation', // 对应数据库 storage_location, 允许为空
    '备注': 'remarks', // 对应数据库 remarks, 允许为空
    '交接日期': 'handoverDate', // 对应数据库 handover_date, 允许为空
    // --- 新增或调整的列, 根据需要添加映射 ---
    // '文档编号': 'docSerialNumber',
    // '密级': 'securityLevel',
    // '保管期限': 'retentionPeriod',
    // '页数': 'pageCount',
    // '份数': 'copyCount',
    // '主题词': 'keywords',
    // '归档日期': 'archiveDate',
    // --- 忽略的列 ---
    '文档 ID': 'ignore_id',
    '创建人': 'ignore_created_by', // 由系统处理
    '创建时间': 'ignore_created_at', // 由系统处理
    '最后修改人': 'ignore_updated_by', // 由系统处理
    '最后修改时间': 'ignore_updated_at', // 由系统处理
};
// ------------------------------------------

// --- 定义必填的 Excel 列 (使用 Excel 中的表头名称), 根据数据库实际 NOT NULL 列更新 ---
const REQUIRED_EXCEL_COLUMNS = [
    '文档名称', // doc_name
    '提交人',   // submitter
    '接收人',   // receiver
    // '密级', // security_level - 待确认是否必填
    // '保管期限', // retention_period - 待确认是否必填
    // '页数', // page_count - 待确认是否必填
    // '份数', // copy_count - 待确认是否必填
];
// ------------------------------------------

export class ImportService {
    // private documentService: DocumentService; // 假设通过构造函数注入

    constructor(/* documentService?: DocumentService */) { // 设为可选或移除
        // this.documentService = documentService;
        // 将 ImportService 实例注入 TaskQueueService
        // 确保 taskQueueService 已经被正确初始化
        if (taskQueueService) {
          taskQueueService.setImportService(this);
        } else {
           console.error("[ImportService] TaskQueueService is not initialized!");
           // 在实际应用中，这可能应该阻止服务启动
           // throw new Error("TaskQueueService must be initialized before ImportService");
        }
    }

    /**
     * @description 创建一个新的文档导入任务记录
     * @param userId 用户 ID
     * @param originalFileName 上传的原始文件名
     * @param uploadedFileName 服务器上存储的唯一文件名 (在 uploads/ 目录下)
     * @returns {Promise<ExportTask>} 创建的任务对象
     */
    async createImportTask(userId: number, originalFileName: string, uploadedFileName: string): Promise<ExportTask> {
        console.log(`[ImportService] Creating import task for user: ${userId}, original file: ${originalFileName}, uploaded file: ${uploadedFileName}`);

        const safeUploadedFileName = path.basename(uploadedFileName);
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads'); // 定义 uploads 目录
        const filePath = path.join(uploadsDir, safeUploadedFileName); // 构造指向 uploads 目录的文件路径
        const fileType = path.extname(originalFileName).toLowerCase().substring(1);

        // 检查文件类型是否有效（虽然 Multer 会过滤，但这里可以加一层保险）
        const isValidExcelType = ['xls', 'xlsx'].includes(fileType);
        const taskFileType = isValidExcelType ? fileType as ('xlsx' | 'xls') : 'unknown';
        if (!isValidExcelType) {
            // 如果文件类型无效，直接抛出错误，避免创建任务
            console.error(`[ImportService] Invalid file type detected: ${fileType} for file ${originalFileName}`);
            throw new Error(`无效的文件类型 '${fileType}'，请上传 Excel 文件 (.xls, .xlsx)`);
        }

        try {
            // 确保 uploads 目录存在 (虽然 Multer 配置里也做了，但这里再确认一次无害)
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // 验证文件是否存在 (理论上文件应该已被上传到 uploadsDir)
             if (!fs.existsSync(filePath)) {
                 console.error(`[ImportService] Uploaded file not found at path: ${filePath}.`);
                 throw new Error(`上传的文件未在服务器上找到，请重新上传`);
             }

            const newTask = await ExportTask.create({
                userId,
                taskType: 'document_import',
                status: 0, // Pending
                originalFileName: originalFileName,
                fileName: null,
                fileType: taskFileType,
                filePath: safeUploadedFileName,
                progress: 0,
                totalRows: null,
                processedRows: null,
                successCount: null,
                failureCount: null,
                errorDetails: null,
                queryCriteria: null,
                selectedFields: null,
                exportScope: null,
                selectedIds: null,
                currentPageIds: null,
                errorMessage: null,
            });

            console.log(`[ImportService] Created new import task ${newTask.id}`);

            // !! 确保 taskQueueService 已被注入并可用
            if (taskQueueService) {
                taskQueueService.addTask(newTask.id);
                console.log(`[ImportService] Task ${newTask.id} added to queue.`);
            } else {
                 // 这个情况理论上不应该发生，因为我们会在 app.ts 中确保注入
                 console.error(`[ImportService Critical Error] TaskQueueService not available when trying to add task ${newTask.id}. Dependency injection might have failed.`);
                 newTask.status = 3; // Failed
                 newTask.errorMessage = '任务队列服务不可用，无法处理导入任务';
                 await newTask.save();
                 throw new Error('任务队列服务不可用 (内部错误)');
            }

            return newTask;
        } catch (error) {
            // === 更详细的日志记录 ===
            console.error("\n--- DETAILED ERROR START ---");
            console.error("[ImportService] Caught error object:", error); // 打印完整错误对象
            if (error instanceof Error) {
                console.error(`[ImportService] Error Name: ${error.name}`);
                console.error(`[ImportService] Error Message: ${error.message}`);
                // Sequelize 错误通常将原始数据库错误放在 original 属性中
                if ((error as any).original) {
                    console.error("[ImportService] Sequelize Original Error:", (error as any).original);
                }
                // 如果是验证错误，打印详细信息
                 if (error.name === 'SequelizeValidationError' && (error as any).errors) {
                     console.error('[ImportService] Sequelize Validation Errors:', (error as any).errors);
                 }
            } else {
                console.error("[ImportService] Caught non-Error object:", error);
            }
             console.error("--- DETAILED ERROR END ---\n");
            // === 日志记录结束 ===

            console.error('[ImportService] Failed to create import task record. Raw error message:', (error instanceof Error) ? error.message : String(error));
            
            // 清理逻辑... 
            const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
            const potentialFilePath = path.join(uploadsDir, path.basename(uploadedFileName)); // 使用传入的 uploadedFileName
            if (fs.existsSync(potentialFilePath)) {
                try {
                    fs.unlinkSync(potentialFilePath);
                    console.log(`[API Cleanup] Deleted uploaded file due to task creation failure: ${potentialFilePath}`);
                } catch (unlinkErr) {
                    console.error(`[API Cleanup] Failed to delete file ${potentialFilePath}:`, unlinkErr);
                }
            }

            let message = '创建导入任务数据库记录失败，请稍后重试';
             if (error instanceof Error) {
                 message = error.message; // 使用原始消息，除非被覆盖
                 if (error.name === 'SequelizeValidationError') {
                     message = '数据验证失败: ' + (error as any).errors?.map((e: any) => e.message).join(', ') || error.message;
                 } else if (error.name === 'SequelizeUniqueConstraintError') {
                     message = '数据唯一性冲突: ' + (error as any).errors?.map((e: any) => e.message).join(', ') || error.message;
                 } else if (error.name === 'SequelizeForeignKeyConstraintError') {
                      message = '外键约束失败，关联数据可能不存在。' + ` (Details: ${error.message})`;
                 } else if (error.name === 'SequelizeDatabaseError') {
                     // 尝试从 original error 获取更具体信息
                     const originalMsg = (error as any).original?.message || error.message;
                     message = `数据库操作失败: ${originalMsg}`; 
                     // 如果仍然不够具体，保留通用消息
                     // message = '创建导入任务时数据库操作失败，请检查模型定义或约束。';
                 }
             }
            // 抛出可能更具体的消息
            throw new Error(message);
        }
    }

    /**
     * @description 处理文档导入任务的核心逻辑
     * @param taskId 任务 ID
     */
    async processImportTask(taskId: number): Promise<void> {
        console.log(`[ImportService] Processing import task ${taskId}...`);
        let task: ExportTask | null = null;
        const processingStartTime = Date.now();
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
        let filePath: string | null = null;
        const errors: { row: number; error: string }[] = [];
        const documentsToInsert: DocumentImportData[] = [];

        try {
            task = await ExportTask.findByPk(taskId);
            if (!task || task.taskType !== 'document_import' || task.status !== 0) {
                console.log(`[ImportService] Task ${taskId} check failed. Skipping.`);
                return;
            }

            task.status = 1;
            task.progress = 5;
            await task.save();

            if (!task.filePath) throw new Error(`Task ${taskId} missing file path.`);
            filePath = path.join(uploadsDir, task.filePath);
            if (!fs.existsSync(filePath)) throw new Error(`Import file does not exist: ${filePath}`);

            console.log(`[ImportService] Task ${taskId}: Reading Excel: ${filePath}`);
            let workbook: xlsx.WorkBook;
            try { workbook = xlsx.readFile(filePath); } catch (e: any) { throw new Error(`Failed to read Excel: ${e.message}`); }

            const sheetName = workbook.SheetNames[0];
            if (!sheetName) throw new Error(`Excel no sheets: ${task.originalFileName}`);
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) throw new Error(`Cannot read sheet: ${sheetName}`);

            let jsonData: any[][];
            try { jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null, raw: false }); } catch (e: any) { throw new Error(`Failed to parse sheet: ${e.message}`); }

            if (!jsonData || jsonData.length < 2) throw new Error("Excel empty or no header");

            const headerRow: string[] = jsonData[0].map(cell => String(cell).trim());
            console.log(`[ImportService] Task ${taskId}: Headers: ${headerRow.join(', ')}`);

            // -- 修改表头检查逻辑 --
            // const definedColumns = Object.keys(EXCEL_COLUMN_MAP);
            // const expectedColumns = definedColumns.filter(key => typeof EXCEL_COLUMN_MAP[key as keyof typeof EXCEL_COLUMN_MAP] === 'string' && !(EXCEL_COLUMN_MAP[key as keyof typeof EXCEL_COLUMN_MAP] as string).startsWith('ignore_'));
            // const missingExpectedColumns = expectedColumns.filter(col => !headerRow.includes(col));
            // if (missingExpectedColumns.length > 0) {
            //     throw new Error(`Excel missing required columns: ${missingExpectedColumns.join(', ')}`);
            // }

            // 只检查 REQUIRED_EXCEL_COLUMNS 是否都存在于 headerRow 中
            const missingRequiredColumns = REQUIRED_EXCEL_COLUMNS.filter(reqCol => !headerRow.includes(reqCol));
            if (missingRequiredColumns.length > 0) {
                throw new Error(`Excel is missing required columns: ${missingRequiredColumns.join(', ')}`);
            }
            // -- 表头检查逻辑修改结束 --

            const requiredColumnIndices = REQUIRED_EXCEL_COLUMNS.map(reqCol => {
                const index = headerRow.indexOf(reqCol);
                if (index === -1) throw new Error(`Logic error: Cannot find required column '${reqCol}' in header`);
                return { colName: reqCol, index };
            });

            const totalRows = jsonData.length - 1;
            task.totalRows = totalRows;
            task.processedRows = 0;
            task.successCount = 0;
            task.failureCount = 0;
            await task.save();

            console.log(`[ImportService] Task ${taskId}: Processing rows (Total: ${totalRows})`);
            const columnMapIndices: Record<string, number> = {};
            headerRow.forEach((col, index) => { columnMapIndices[col] = index; });

            for (let i = 1; i < jsonData.length; i++) {
                const rowData = jsonData[i];
                const rowNumber = i + 1;
                let rowHasError = false;
                const documentData: DocumentImportData = {};

                for (const { colName, index } of requiredColumnIndices) {
                    const cellValue = rowData[index];
                    if (cellValue === null || String(cellValue).trim() === '') {
                        errors.push({ row: rowNumber, error: `Required column '${colName}' is empty` });
                        rowHasError = true;
                        break;
                    }
                }

                if (rowHasError) {
                    task.failureCount = (task.failureCount || 0) + 1;
                } else {
                    for (const excelColName in EXCEL_COLUMN_MAP) {
                        const dbFieldName = EXCEL_COLUMN_MAP[excelColName as keyof typeof EXCEL_COLUMN_MAP];
                        const colIndex = columnMapIndices[excelColName];
                        if (typeof colIndex === 'undefined') continue;
                        const cellValue = rowData[colIndex];
                        if (typeof dbFieldName === 'string' && dbFieldName.startsWith('ignore_')) continue;
                        if (typeof dbFieldName !== 'string') continue;

                        if (cellValue !== null && String(cellValue).trim() !== '') {
                            const trimmedValue = String(cellValue).trim();
                            if (dbFieldName === 'handoverDate') {
                                const parsedDate = this.parseExcelDate(cellValue);
                                if (parsedDate) documentData.handoverDate = parsedDate;
                                else { errors.push({ row: rowNumber, error: `Invalid date format in column '${excelColName}': ${cellValue}` }); rowHasError = true; }
                            } else if (dbFieldName === 'docName') documentData.docName = trimmedValue;
                            else if (dbFieldName === 'docTypeName') documentData.docTypeName = trimmedValue;
                            else if (dbFieldName === 'sourceDepartmentName') documentData.sourceDepartmentName = trimmedValue;
                            else if (dbFieldName === 'submitter') documentData.submitter = trimmedValue;
                            else if (dbFieldName === 'receiver') documentData.receiver = trimmedValue;
                            else if (dbFieldName === 'signer') documentData.signer = trimmedValue;
                            else if (dbFieldName === 'storageLocation') documentData.storageLocation = trimmedValue;
                            else if (dbFieldName === 'remarks') documentData.remarks = trimmedValue;
                        } else {
                            if (!REQUIRED_EXCEL_COLUMNS.includes(excelColName)) {
                                if (dbFieldName === 'docTypeName') documentData.docTypeName = null;
                                else if (dbFieldName === 'sourceDepartmentName') documentData.sourceDepartmentName = null;
                                else if (dbFieldName === 'signer') documentData.signer = null;
                                else if (dbFieldName === 'storageLocation') documentData.storageLocation = null;
                                else if (dbFieldName === 'remarks') documentData.remarks = null;
                                else if (dbFieldName === 'handoverDate') documentData.handoverDate = null;
                            } else {
                                errors.push({ row: rowNumber, error: `Required column '${excelColName}' is unexpectedly empty` });
                                rowHasError = true;
                            }
                        }
                        if (rowHasError) break;
                    }
                }

                if (!rowHasError) {
                    documentsToInsert.push(documentData);
                    task.successCount = (task.successCount || 0) + 1;
                } else {
                    task.failureCount = (task.failureCount || 0) + 1;
                }

                task.processedRows = (task.processedRows || 0) + 1;
                task.progress = 5 + Math.round(((task.processedRows || 0) / totalRows) * 85);

                if (i % 100 === 0 || i === jsonData.length - 1) {
                     console.log(`[ImportService] Task ${taskId}: Processed ${task.processedRows}/${totalRows}. Progress: ${task.progress}%`);
                    await task.save();
                }
            }

            console.log(`[ImportService] Task ${taskId}: Processed rows. Success: ${task.successCount}, Failure: ${task.failureCount}. Inserting...`);
            if (documentsToInsert.length > 0) {
                const transaction = await sequelize.transaction();
                try {
                    await Document.bulkCreate(documentsToInsert as any[], { transaction, ignoreDuplicates: false });
                    await transaction.commit();
                    console.log(`[ImportService] Task ${taskId}: Inserted ${documentsToInsert.length} documents.`);
                    task.progress = 95;
                } catch (bulkError: any) {
                    await transaction.rollback();
                    console.error(`[ImportService] Task ${taskId}: Bulk insert failed:`, bulkError);
                    task.failureCount = (task.failureCount || 0) + (task.successCount || 0);
                    task.successCount = 0;
                    errors.push({ row: 0, error: `Bulk insert failed: ${bulkError.message}` });
                    throw new Error('Database error during bulk insert');
                }
            } else {
                console.log(`[ImportService] Task ${taskId}: No valid documents to insert.`);
                 task.progress = 95;
            }

            task.status = errors.length === 0 ? 2 : 3;
            task.progress = 100;
            task.errorDetails = errors.length > 0 ? JSON.stringify(errors) : null;
            if (errors.length > 0) {
                 if (task.status === 3) {
                     task.errorMessage = `Import finished with ${task.failureCount} failed rows. Check error details.`;
                 } else {
                     task.errorMessage = task.errorMessage || `Import finished with ${errors.length} errors.`;
                 }
                console.warn(`[ImportService] Task ${taskId} finished with errors. Status: ${task.status}. Errors: ${errors.length}`);
            } else {
                 task.errorMessage = null;
                 console.log(`[ImportService] Task ${taskId} completed successfully. Status: ${task.status}`);
            }
            await task.save();

        } catch (error: any) {
            console.error(`[ImportService] Error processing task ${taskId}:`, error);
            if (task) {
                task.status = 3;
                task.progress = task.progress || 5;
                task.errorMessage = error.message || 'Unknown error during import processing';
                if (errors.length > 0 && !task.errorDetails) {
                    task.errorDetails = JSON.stringify(errors);
                }
                await task.save();
            }
        } finally {
            const processingEndTime = Date.now();
            const duration = (processingEndTime - processingStartTime) / 1000;
             console.log(`[ImportService] Finished task ${taskId}. Duration: ${duration.toFixed(2)}s. Status: ${task?.status}`);
        }
    }

    /**
     * @description 解析 Excel 日期单元格的值
     * @param cellValue 单元格的值 (可能是数字、字符串或日期对象)
     * @returns {Date | null} 解析后的 Date 对象或 null
     */
     private parseExcelDate(cellValue: any): Date | null {
        if (cellValue === null || typeof cellValue === 'undefined') {
            return null;
        }
        if (cellValue instanceof Date) {
            return isNaN(cellValue.getTime()) ? null : cellValue;
        }
        if (typeof cellValue === 'number') {
            try {
                const date = xlsx.SSF.parse_date_code(cellValue);
                if (date) {
                    return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0);
                }
            } catch (e) {
                 console.warn(`[ImportService] Failed to parse Excel date number ${cellValue}:`, e);
                 return null;
            }
        }
        if (typeof cellValue === 'string') {
            const trimmedValue = cellValue.trim();
            if (trimmedValue === '') return null;
            const timestamp = Date.parse(trimmedValue);
            if (!isNaN(timestamp)) return new Date(timestamp);
        }
        console.warn(`[ImportService] Could not parse date value:`, cellValue);
        return null;
    }
}

// 移除 initializeImportService 和 getImportService 函数
// 移除全局 importServiceInstance 变量