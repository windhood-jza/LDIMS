import ExportTask from '../models/ExportTask';
// import { DocumentService } from './DocumentService'; // 假设 DocumentService 在别处实例化并注入
import { taskQueueService } from './TaskQueueService'; // 确认路径和初始化
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import sequelize from '../config/database'; // 引入 sequelize 实例用于事务
import Document from '../models/Document'; // 引入 Document 模型
// import User from '../models/User'; // 如果需要获取创建者姓名，取消注释

// --- 定义 Excel 列名到数据库字段名/处理键的映射 ---
const EXCEL_COLUMN_MAP: Record<string, string> = {
    '文档名称': 'docName',
    '文档类型': 'docTypeName', // 直接用名称
    '来源部门': 'sourceDepartmentName', // 直接用名称
    '提交人': 'submitter',
    '接收人': 'receiver',
    '签收（章）人': 'signer',
    '交接日期': 'handoverDate',
    '保管位置': 'storageLocation',
    '备注': 'remarks',
    // --- 忽略的列 ---
    // '文档 ID': 'ignore_id',
};
// ------------------------------------------

// --- 定义必填的 Excel 列 (使用 Excel 中的表头名称) ---
const REQUIRED_EXCEL_COLUMNS = ['文档名称', '来源部门', '提交人', '接收人'];
// ------------------------------------------

// 导出 ImportService 类，以便其他模块可以导入类型
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

        try {
            // 确保 uploads 目录存在
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
                console.log(`[ImportService] Created uploads directory: ${uploadsDir}`);
            }

            // 验证文件是否存在 (理论上文件应该已被上传到 uploadsDir)
             if (!fs.existsSync(filePath)) {
                 console.error(`[ImportService] Uploaded file not found at path: ${filePath}. It might have been moved or deleted.`);
                 throw new Error(`上传的文件未在服务器上找到，请重新上传`);
             }

            const newTask = await ExportTask.create({
                userId,
                taskType: 'document_import',
                status: 0, // Pending
                originalFileName: originalFileName, // 存储原始文件名
                fileName: null, // 导入任务通常没有输出文件名
                fileType: ['xlsx', 'xls'].includes(fileType) ? fileType as ('xlsx' | 'xls') : 'unknown',
                filePath: safeUploadedFileName, // 只存储处理后的安全文件名
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
                errorMessage: null, // 初始化 errorMessage
            });

            console.log(`[ImportService] Created new import task ${newTask.id}`);

            // 确保 taskQueueService 可用再添加任务
            if (taskQueueService) {
                taskQueueService.addTask(newTask.id);
                console.log(`[ImportService] Task ${newTask.id} added to queue.`);
            } else {
                 console.error(`[ImportService] TaskQueueService not available, task ${newTask.id} was not added to the queue.`);
                 // 更新任务状态为失败
                 newTask.status = 3; // Failed
                 newTask.errorMessage = '任务队列服务不可用，无法处理导入任务';
                 await newTask.save();
                 throw new Error('任务队列服务不可用');
            }

            return newTask;
        } catch (error) {
            console.error('[ImportService] Failed to create import task record:', error);
            // 创建记录失败时，不需要删除文件，因为文件可能仍然有用或上传过程可能有问题
            // try {
            //     if (fs.existsSync(filePath)) {
            //         fs.unlinkSync(filePath);
            //         console.log(`[ImportService] Deleted potentially uploaded file due to task creation failure: ${filePath}`);
            //     }
            // } catch (unlinkError) {
            //     console.error(`[ImportService] Error deleting potentially uploaded file ${filePath}:`, unlinkError);
            // }

            let message = '创建导入任务数据库记录失败，请稍后重试';
            if (error instanceof Error) {
                if (error.message.includes('上传的文件未在服务器上找到')) {
                    message = error.message;
                } else if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
                    console.error('Sequelize Error:', error);
                    message = '创建导入任务时数据库操作失败，请检查模型定义或约束。';
                } else if (error.message === '任务队列服务不可用') {
                    message = error.message; // 保留队列服务错误
                }
            }
            // 重新抛出错误，让上层调用者知道创建失败
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
        let filePath: string | null = null; // 文件路径变量
        const errors: { row: number; error: string }[] = []; // 存储行级错误

        try {
            task = await ExportTask.findByPk(taskId);
            // 检查任务是否存在、是否为导入任务、是否处于待处理状态
            if (!task || task.taskType !== 'document_import' || task.status !== 0 ) {
                console.log(`[ImportService] Task ${taskId} not found, not an import task, or not in pending state (Status: ${task?.status}). Skipping.`);
                return; // 静默退出
            }

            // --- 1. 更新任务状态为处理中 ---
            task.status = 1; // processing
            task.progress = 5; // 初始进度：开始处理
            await task.save();

            // --- 构造文件路径并检查文件是否存在 ---
            if (!task.filePath) {
                throw new Error(`Task ${taskId} is missing file path information.`);
            }
            filePath = path.join(uploadsDir, task.filePath); // 赋值给外部变量
            if (!fs.existsSync(filePath)) {
                // 文件确实找不到了，这是一个关键错误
                throw new Error(`Import file does not exist at the specified path (Task ${taskId}, Path: ${filePath}).`);
            }

            // --- 2. 读取 Excel 文件 ---
            console.log(`[ImportService] Task ${taskId}: Reading Excel file: ${filePath}`);
            let workbook: xlsx.WorkBook;
            try {
                workbook = xlsx.readFile(filePath);
            } catch (readError: any) {
                throw new Error(`Failed to read Excel file ${task.originalFileName || filePath}: ${readError.message}`);
            }

            const sheetName = workbook.SheetNames[0];
            if (!sheetName) {
                throw new Error(`Excel file ${task.originalFileName || filePath} does not contain any worksheets.`);
            }
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                throw new Error(`Could not read worksheet '${sheetName}' from Excel file.`);
            }

            // 使用 raw: false 尝试让库解析日期等类型
            let jsonData: any[][];
            try {
                jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null, raw: false });
            } catch (parseError: any) {
                 throw new Error(`Failed to parse data from worksheet '${sheetName}': ${parseError.message}`);
            }


            if (!jsonData) { throw new Error('Could not parse data from Excel file.'); }

            const headerRowRaw: any[] = jsonData[0] || []; // 获取表头行，处理空文件情况
            const headerRow = headerRowRaw.map(cell => String(cell || '').trim()).filter(Boolean);
            // 过滤掉完全为空或只有空单元格的行
            const dataRows = jsonData.slice(1).filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));

            // --- 验证表头是否包含必需列 ---
            const headerSet = new Set(headerRow);
            const missingHeaders = REQUIRED_EXCEL_COLUMNS.filter(reqCol => !headerSet.has(reqCol));
            if (missingHeaders.length > 0) {
                throw new Error(`Excel file is missing required columns: ${missingHeaders.join(', ')}`);
            }

            // --- 更新任务初始统计信息 ---
            task.totalRows = dataRows.length;
            task.processedRows = 0;
            task.successCount = 0;
            task.failureCount = 0;
            await task.save(); // 保存 totalRows

            // 如果过滤后没有有效数据行
            if (task.totalRows === 0) {
                console.log(`[ImportService] Task ${taskId}: No data rows found after filtering header and empty rows.`);
                task.status = 2; // Completed (无数据处理)
                task.progress = 100;
                task.processedRows = 0;
                // 最终状态将在 finally 中保存
                return; // 跳转到 finally 清理和保存
            }

            console.log(`[ImportService] Task ${taskId}: Found ${task.totalRows} data rows to process.`);

            // --- 4. 逐行处理数据 (使用事务) ---
            const transaction = await sequelize.transaction();
            let currentProgress = 5; // 声明进度变量

            try {
                // 构建 header 到 index 的映射，提高查找效率
                const headerIndexMap: Record<string, number> = {};
                headerRow.forEach((header, index) => {
                    headerIndexMap[header] = index;
                });

                const documentsToBulkCreate: Partial<Document>[] = []; // 存储待批量插入的数据
                const progressUpdateInterval = Math.max(1, Math.floor(task.totalRows / 20)); // 大约每 5% 更新一次进度

                for (let i = 0; i < dataRows.length; i++) {
                    const rowData = dataRows[i];
                    const excelRowIndex = i + 2; // Excel 中的实际行号
                    task.processedRows = i + 1; // 更新已处理行数

                    try {
                        const documentToCreate: Partial<Document> = {}; // 用于构建单个文档对象
                        let validationError: string | null = null;

                        // a. 验证必填字段
                        for (const requiredHeader of REQUIRED_EXCEL_COLUMNS) {
                            const mappedKey = EXCEL_COLUMN_MAP[requiredHeader];
                            const cellIndex = headerIndexMap[requiredHeader];

                            if (cellIndex === undefined || cellIndex >= rowData.length) {
                                validationError = `列 '${requiredHeader}' 在数据行 ${excelRowIndex} 中不存在或索引无效`;
                                break;
                            }
                            const cellValue = rowData[cellIndex] !== null && rowData[cellIndex] !== undefined ? String(rowData[cellIndex]).trim() : null;
                            if (cellValue === null || cellValue === '') {
                                validationError = `列 '${requiredHeader}' 在行 ${excelRowIndex} 的值不能为空`;
                                break;
                            }
                            if (!(mappedKey in Document.getAttributes())) {
                                console.warn(`[ImportService] Task ${taskId}, Row ${excelRowIndex}: Mapped key '${mappedKey}' for required header '${requiredHeader}' not found in Document model attributes. Skipping assignment.`);
                                continue; // 跳过这个无效的映射键
                            }
                            (documentToCreate as any)[mappedKey] = cellValue;
                        }
                        if (validationError) {
                            throw new Error(validationError); // 抛出行级错误
                        }

                        // b. 处理可选字段
                        for (const header of headerRow) {
                            if (REQUIRED_EXCEL_COLUMNS.includes(header)) continue; // 跳过已处理的必填项

                            const mappedKey = EXCEL_COLUMN_MAP[header];
                            // 跳过未映射、忽略或在模型中不存在的字段
                            if (!mappedKey || mappedKey.startsWith('ignore_') || !(mappedKey in Document.getAttributes())) {
                                if (mappedKey && !(mappedKey in Document.getAttributes())) {
                                    console.warn(`[ImportService] Task ${taskId}, Row ${excelRowIndex}: Mapped key '${mappedKey}' for optional header '${header}' not found in Document model attributes. Skipping.`);
                                }
                                continue;
                            }

                            const cellIndex = headerIndexMap[header];
                            if (cellIndex === undefined || cellIndex >= rowData.length) continue; // 跳过无效索引

                            const cellValueRaw = rowData[cellIndex]; // 保留原始值用于日期解析

                            if (mappedKey === 'handoverDate') {
                                documentToCreate.handoverDate = this.parseExcelDate(cellValueRaw);
                                // 可选：如果原始值非空但解析失败，记录警告
                                if (cellValueRaw !== null && cellValueRaw !== undefined && String(cellValueRaw).trim() !== '' && documentToCreate.handoverDate === null) {
                                    console.warn(`[ImportService] Task ${taskId}, Row ${excelRowIndex}: Invalid or unparseable date value for '${header}'. Value: '${cellValueRaw}'. Setting handoverDate to null.`);
                                }
                            } else if (([] as string[]).includes(mappedKey)) { // 其他特殊字段处理占位符
                                // TODO: 添加其他需要特殊处理的字段逻辑
                            } else {
                                // 其他可选字段，直接赋值 (如果单元格为空或undefined，值为 null)
                                const cellValue = cellValueRaw !== null && cellValueRaw !== undefined ? String(cellValueRaw).trim() : null;
                                (documentToCreate as any)[mappedKey] = cellValue;
                            }
                        }

                        // c. 设置创建者信息 (示例)
                        // documentToCreate.createdBy = task.userId;
                        // try {
                        //    const user = await User.findByPk(task.userId);
                        //    documentToCreate.createdByName = user ? user.realName : `User_${task.userId}`;
                        // } catch (userError) {
                        //    console.warn(`[ImportService] Task ${taskId}: Failed to fetch user name for user ${task.userId}:`, userError);
                        //    documentToCreate.createdByName = `User_${task.userId}`;
                        // }


                        // d. 将验证通过的数据添加到待插入列表
                        documentsToBulkCreate.push(documentToCreate);

                    } catch (rowError: any) {
                        // 捕获并记录行级错误
                        task.failureCount = (task.failureCount || 0) + 1;
                        errors.push({ row: excelRowIndex, error: rowError.message || '未知行处理错误' });
                    }

                    // e. 更新进度 (异步，不阻塞循环)
                    if (task.processedRows % progressUpdateInterval === 0 || task.processedRows === task.totalRows) {
                        currentProgress = 5 + Math.floor((task.processedRows / task.totalRows) * 90); // 5% 读取 + 90% 处理
                        ExportTask.update({ progress: currentProgress }, { where: { id: taskId } })
                            .catch(updateErr => console.error(`[ImportService] Task ${taskId}: Failed to update progress asynchronously:`, updateErr));
                    }
                } // --- 结束 for 循环 ---

                // --- 5. 执行批量插入 ---
                if (documentsToBulkCreate.length > 0) {
                    console.log(`[ImportService] Task ${taskId}: Attempting to bulk create ${documentsToBulkCreate.length} documents.`);
                    try {
                        // 使用 as any[] 作为类型断言解决复杂类型问题，并启用验证
                        await Document.bulkCreate(documentsToBulkCreate as any[], { transaction, validate: true });
                        task.successCount = documentsToBulkCreate.length; // 成功数等于尝试批量插入的数量
                        console.log(`[ImportService] Task ${taskId}: Bulk create successful.`);
                    } catch (bulkError: any) {
                        // 特殊处理批量创建失败
                        console.error(`[ImportService] Task ${taskId}: Bulk create failed:`, bulkError);
                        task.successCount = 0; // 假设全部失败
                        task.failureCount = task.totalRows; // 标记所有原始行失败
                        errors.length = 0; // 清除之前的行级错误
                        // 记录更具体的批量错误信息
                        const bulkErrorMessage = bulkError.errors && Array.isArray(bulkError.errors)
                            ? bulkError.errors.map((e: any) => `Record ${e.index || '?'}: ${e.message}`).join('; ')
                            : bulkError.message;
                        errors.push({ row: 0, error: `数据库批量插入失败: ${bulkErrorMessage}` });
                        // 抛出错误，由外层 catch 回滚事务
                        throw bulkError;
                    }
                } else {
                    // 没有有效数据可插入（所有行都有错误）
                    console.log(`[ImportService] Task ${taskId}: No valid documents to bulk create.`);
                    task.successCount = 0;
                }

                // --- 6. 提交事务 ---
                await transaction.commit();
                console.log(`[ImportService] Task ${taskId}: Transaction committed.`);
                // 最终状态将在 finally 中根据 errors 判断并设置

            } catch (transactionError: any) {
                // --- 事务处理失败 ---
                await transaction.rollback(); // 确保回滚
                console.error(`[ImportService] Task ${taskId}: Transaction rolled back due to error:`, transactionError);
                task.status = 3; // 设置为失败
                task.progress = currentProgress; // 保留失败前的进度

                // 根据错误类型记录信息
                if (transactionError.name && transactionError.name.includes('BulkRecordError') || (errors.length > 0 && errors[0].error.includes('数据库批量插入失败'))) {
                    // 错误很可能来自 bulkCreate 的 catch 块
                    // errors 数组应该已被填充
                    task.errorMessage = errors[0]?.error || '数据库批量插入失败';
                    // successCount 和 failureCount 应该在 bulkCreate 的 catch 中被设置
                } else {
                    // 其他事务错误 (例如连接中断、约束冲突等)
                    task.failureCount = task.totalRows || 0; // 标记所有行失败
                    task.successCount = 0;
                    // 记录新的总体错误
                    if (!errors.some(e => e.row === 0)) { // 避免重复记录总体错误
                       errors.push({ row: 0, error: `事务处理失败: ${transactionError.message}` });
                    }
                    task.errorMessage = `事务处理失败: ${transactionError.message}`;
                }
                 // 不需要再次抛出错误
            }

        } catch (error: any) {
            // --- 处理 processImportTask 级别的致命错误 ---
            console.error(`[ImportService] Task ${taskId}: Unrecoverable error during processing:`, error);
            if (task) {
                task.status = 3; // 标记为失败
                task.errorMessage = error.message || '处理导入任务时发生未知严重错误';
                // 尝试设置统计数据，如果它们尚未被设置
                task.totalRows = task.totalRows ?? 0;
                task.failureCount = task.totalRows; // 致命错误，所有行都失败
                task.successCount = 0;
                task.processedRows = task.processedRows ?? 0;
                // 记录总体错误信息到 details
                if (!errors.some(e => e.row === 0)) {
                    errors.push({row: 0, error: task.errorMessage ?? '未知严重错误'});
                }
                task.errorDetails = JSON.stringify(errors);
                // 尝试保存错误状态，但不阻塞
                await task.save().catch(saveErr => console.error(`[ImportService] Task ${taskId}: Failed to save final error state after unrecoverable error:`, saveErr));
            } else {
                 console.error(`[ImportService] Task ${taskId}: Could not retrieve task to record final error state.`);
            }
        } finally {
            // --- 无论成功失败，都执行最终处理 ---
            if (task) {
                // --- 5. 最终更新任务状态 ---
                task.errorDetails = errors.length > 0 ? JSON.stringify(errors) : null;
                // 确保 success/failure count 不为 null
                task.successCount = task.successCount ?? 0;
                task.failureCount = task.failureCount ?? (task.totalRows ?? 0) - task.successCount;
                // 确保 processedRows 有值
                task.processedRows = task.processedRows ?? (task.totalRows ?? 0);

                // 设置最终状态 (如果尚未明确设为失败)
                if (task.status !== 3) {
                    // 如果有行级错误 或 成功数+失败数 != 总行数(异常), 则标记为失败
                    if (errors.length > 0 || (task.successCount + task.failureCount !== task.totalRows)) {
                         task.status = 3; // Failed
                         if (!task.errorMessage) { // 如果没有更严重的错误信息
                            task.errorMessage = errors.length > 0
                                ? `导入完成，但有 ${errors.length} 行数据处理失败。`
                                : `导入完成，但统计数据异常 (成功: ${task.successCount}, 失败: ${task.failureCount}, 总计: ${task.totalRows})。`;
                         }
                    } else {
                         task.status = 2; // Completed
                         task.errorMessage = null; // 清除可能存在的旧错误消息
                    }
                    task.progress = 100; // 处理流程结束
                }

                const duration = (Date.now() - processingStartTime) / 1000;
                console.log(`[ImportService] Task ${taskId}: Finalizing. Status: ${task.status}, Success: ${task.successCount}, Failure: ${task.failureCount}, Duration: ${duration.toFixed(2)}s`);

                // 最后一次保存任务状态
                await task.save().catch(saveErr => console.error(`[ImportService] Task ${taskId}: Failed to save final task state:`, saveErr));
            }

            // --- 6. 删除上传的临时文件 ---
            if (filePath && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`[ImportService] Task ${taskId}: Deleted temporary file: ${filePath}`);
                } catch (unlinkError) {
                    console.error(`[ImportService] Task ${taskId}: Error deleting temporary file ${filePath}:`, unlinkError);
                }
            }
        }
    }

    /**
     * @description 解析 Excel 日期 (处理 Date 对象、数字和字符串格式)
     * @param cellValue Excel 单元格原始值 (来自 sheet_to_json raw: false)
     * @returns {Date | null} 解析后的 Date 对象或 null
     */
     private parseExcelDate(cellValue: any): Date | null {
        if (cellValue === null || cellValue === undefined || String(cellValue).trim() === '') {
            return null;
        }

        // 如果已经是 Date 对象 (xlsx 库在 raw:false 时可能直接解析)
        if (cellValue instanceof Date) {
            if (!isNaN(cellValue.getTime())) {
                return cellValue;
            } else {
                return null; // 无效的 Date 对象
            }
        }

        let parsedDate: Date | null = null;

        if (typeof cellValue === 'number') {
            // 尝试使用 xlsx 库内置的日期代码解析
            try {
                if (xlsx.SSF && xlsx.SSF.parse_date_code) {
                    const dateInfo = xlsx.SSF.parse_date_code(cellValue);
                    if (dateInfo) {
                        parsedDate = new Date(dateInfo.y, dateInfo.m - 1, dateInfo.d, dateInfo.H || 0, dateInfo.M || 0, dateInfo.S || 0);
                        // 检查年份是否合理
                        if (parsedDate && (parsedDate.getFullYear() < 1900 || parsedDate.getFullYear() > 2100)) {
                             console.warn(`[ImportService] Parsed numeric date resulted in an unusual year (${parsedDate.getFullYear()}). Value: ${cellValue}. Setting to null.`);
                             parsedDate = null;
                        }
                    }
                } else {
                    console.warn('[ImportService] xlsx.SSF.parse_date_code is not available. Numeric date parsing might be unreliable.');
                    // 回退：尝试将数字视为 Unix 时间戳 (毫秒)
                    if (cellValue > 10000000000) {
                         parsedDate = new Date(cellValue);
                    }
                }
            } catch (e) {
                console.warn(`[ImportService] Error parsing numeric date value ${cellValue} with xlsx.SSF:`, e);
            }
        } else if (typeof cellValue === 'string') {
            // 尝试直接解析字符串日期 (可以改进以支持更多格式)
            const trimmedValue = cellValue.trim();
            if (trimmedValue) { // 仅在非空时尝试解析
               parsedDate = new Date(trimmedValue);
               // 检查年份是否合理
               if (parsedDate && (parsedDate.getFullYear() < 1900 || parsedDate.getFullYear() > 2100)) {
                   console.warn(`[ImportService] Parsed string date resulted in an unusual year (${parsedDate.getFullYear()}). Value: '${cellValue}'. Setting to null.`);
                   parsedDate = null;
               }
            }
        }

        // 最终检查解析结果是否有效
        if (parsedDate && !isNaN(parsedDate.getTime())) {
            return parsedDate;
        } else {
            return null;
        }
    }

} // --- End of ImportService class ---

// --- 服务实例化与导出 ---
// 推荐使用依赖注入容器管理
let importServiceInstance: ImportService | null = null;

export const initializeImportService = (/* documentService?: DocumentService */) => {
    if (!importServiceInstance) {
        importServiceInstance = new ImportService(/* documentService */);
        console.log('[ImportService] Initialized.');
    }
    return importServiceInstance;
};

// 导出单例 (确保在使用前已调用 initializeImportService)
export { importServiceInstance as importService };