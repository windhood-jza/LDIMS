import ExportTask from '../models/ExportTask';
import { DocumentService } from './DocumentService'; // 确保路径正确
import { taskQueueService } from './TaskQueueService'; // 确保路径正确
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import sequelize from '../config/database'; // 引入 sequelize 实例用于事务
import Document from '../models/Document'; // 引入 Document 模型

// --- 定义 Excel 列名到数据库字段名/处理键的映射 ---
// 使用更明确的处理键，不一定完全对应数据库字段
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
    // --- 忽略的列 (不从 Excel 读取或由系统处理) ---
    // '文档 ID': 'ignore_id',
    // '创建人': 'ignore_createdBy',
    // '创建时间': 'ignore_createdAt',
    // '最后修改人': 'ignore_updatedBy',
    // '最后修改时间': 'ignore_updatedAt',
};
// ------------------------------------------

// --- 定义必填的 Excel 列 (使用 Excel 中的表头名称) ---
const REQUIRED_EXCEL_COLUMNS = ['文档名称', '来源部门', '提交人', '接收人'];
// ------------------------------------------


export class ImportService {
    private documentService: DocumentService;

    constructor(documentService: DocumentService) {
        this.documentService = documentService;
        // 将 ImportService 实例注入 TaskQueueService (需要在 TaskQueueService 中添加 setImportService 方法)
        taskQueueService.setImportService(this);
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

        // 确保 uploadedFileName 只是文件名，而不是完整路径
        const safeUploadedFileName = path.basename(uploadedFileName);
        const filePath = path.join(__dirname, '..', '..', 'uploads', safeUploadedFileName); // 构造指向 uploads 目录的文件路径
        const fileType = path.extname(originalFileName).toLowerCase().substring(1); // 获取文件类型 (xlsx 或 xls)

        try {
            // 验证文件是否存在
            if (!fs.existsSync(filePath)) {
                console.error(`[ImportService] Uploaded file not found at path: ${filePath}`);
                throw new Error(`上传的文件未找到，请重新上传`);
            }

            const newTask = await ExportTask.create({
                userId,
                taskType: 'document_import', // 明确任务类型
                status: 0, // Pending
                fileName: originalFileName, // 存储原始文件名
                fileType: ['xlsx', 'xls'].includes(fileType) ? fileType as ('xlsx' | 'xls') : 'unknown', // 简单类型检查
                filePath: safeUploadedFileName, // 只存储文件名，更安全
                progress: 0,
                totalRows: null,
                processedRows: null,
                successCount: null,
                failureCount: null,
                errorDetails: null,
                queryCriteria: null,
                selectedFields: null,
                // exportScope: null, // 如果数据库允许 NULL
                // selectedIds: null,
                // currentPageIds: null,
            });

            console.log(`[ImportService] Created new import task ${newTask.id}`);

            // 将任务添加到队列
            taskQueueService.addTask(newTask.id);
            console.log(`[ImportService] Task ${newTask.id} added to queue.`);

            return newTask;
        } catch (error) {
            console.error('[ImportService] Failed to create import task record:', error);
            // 考虑删除已上传的文件，避免孤立文件
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`[ImportService] Deleted uploaded file due to task creation failure: ${filePath}`);
                }
            } catch (unlinkError) {
                console.error(`[ImportService] Error deleting uploaded file ${filePath}:`, unlinkError);
            }
            // 抛出更友好的错误信息
            if (error instanceof Error && error.message.includes('上传的文件未找到')) {
                throw error;
            }
            throw new Error('创建导入任务数据库记录失败，请稍后重试');
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

        try {
            task = await ExportTask.findByPk(taskId);
            if (!task || task.status !== 0 || task.taskType !== 'document_import') {
                console.log(`[ImportService] Task ${taskId} not found, not pending, or not an import task.`);
                return;
            }

            // 1. 更新任务状态为处理中
            task.status = 1; // processing
            task.progress = 5; // 初始进度
            await task.save();

            const filePath = path.join(__dirname, '..', '..', 'uploads', task.filePath || ''); // 从存储的文件名构造路径
            if (!task.filePath || !fs.existsSync(filePath)) {
                throw new Error(`导入文件路径无效或文件不存在 (Task ${taskId}, Path: ${filePath})`);
            }

            // 2. 读取 Excel 文件
            console.log(`[ImportService] Task ${taskId}: Reading Excel file: ${filePath}`);
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });

            if (!jsonData || jsonData.length < 1) { throw new Error('Excel 文件为空'); }

            const headerRowRaw: any[] = jsonData[0];
            const headerRow = headerRowRaw.map(cell => String(cell || '').trim()).filter(Boolean);
            const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));

            // --- 验证表头是否包含所有必需列 ---
            const headerSet = new Set(headerRow);
            const missingHeaders = REQUIRED_EXCEL_COLUMNS.filter(reqCol => !headerSet.has(reqCol));
            if (missingHeaders.length > 0) {
                throw new Error(`Excel 文件缺少必需的列: ${missingHeaders.join(', ')}`);
            }
            // -------------------------------------

            task.totalRows = dataRows.length;
            task.processedRows = 0;
            task.successCount = 0;
            task.failureCount = 0;
            const errors: { row: number; error: string }[] = [];
            await task.save();

            if (task.totalRows === 0) {
                 console.log(`[ImportService] Task ${taskId}: No data rows found after filtering.`);
                 task.status = 2; // Completed (没有数据处理)
                 task.progress = 100;
                 await task.save();
                 // 可选删除文件
                 // fs.unlinkSync(filePath);
                 return;
            }

            console.log(`[ImportService] Task ${taskId}: Found ${task.totalRows} data rows to process.`);

            // --- 4. 逐行处理 (使用事务) ---
            const transaction = await sequelize.transaction();
            try {
                // 构建 header 到 index 的映射，提高效率
                const headerIndexMap: Record<string, number> = {};
                headerRow.forEach((header, index) => {
                    headerIndexMap[header] = index;
                });

                // --- 用于批量插入的数组 ---
                const documentsToBulkCreate: Partial<Document>[] = [];
                // -------------------------

                for (let i = 0; i < dataRows.length; i++) {
                    const rowData = dataRows[i];
                    const excelRowIndex = i + 2;
                    task.processedRows = i + 1;
                    let rowSuccess = false;

                    try {
                        // a. 提取并验证必填字段值
                        const documentToCreate: Partial<Document> = {};
                        let validationError: string | null = null;
                        for (const requiredHeader of REQUIRED_EXCEL_COLUMNS) {
                            const mappedKey = EXCEL_COLUMN_MAP[requiredHeader];
                            const cellIndex = headerIndexMap[requiredHeader];
                            const cellValue = rowData[cellIndex] !== null ? String(rowData[cellIndex]).trim() : null;
                            if (cellValue === null || cellValue === '') {
                                validationError = `列 '${requiredHeader}' 的值不能为空`;
                                break; // 找到一个空值就停止检查该行
                            }
                            (documentToCreate as any)[mappedKey] = cellValue;
                        }
                        if (validationError) {
                            throw new Error(validationError);
                        }

                        // b. 处理可选字段 (映射、转换、空值)
                        for (const header of headerRow) {
                            if (REQUIRED_EXCEL_COLUMNS.includes(header)) continue; // 跳过已处理的必填项

                            const mappedKey = EXCEL_COLUMN_MAP[header];
                            if (!mappedKey || mappedKey.startsWith('ignore_')) continue; // 跳过未映射或忽略的列

                            const cellIndex = headerIndexMap[header];
                            const cellValue = rowData[cellIndex] !== null ? String(rowData[cellIndex]).trim() : null;

                            if (mappedKey === 'handoverDate') {
                                if (cellValue) {
                                    let parsedDate: Date | null = null;
                                    const excelDateValue = rowData[cellIndex]; // 保留原始 Excel 值用于解析
                                    if (typeof excelDateValue === 'number') {
                                        parsedDate = xlsx.SSF.parse_date_code(excelDateValue);
                                    } else if (typeof excelDateValue === 'string') {
                                        parsedDate = new Date(excelDateValue);
                                    }
                                    // 检查解析结果是否有效
                                    if (parsedDate && !isNaN(parsedDate.getTime())) {
                                        documentToCreate.handoverDate = parsedDate;
                                    } else {
                                        // 对于可选日期字段，值无效或为空时设为 null
                                        console.warn(`[ImportService] Task ${taskId}, Row ${excelRowIndex}: Invalid or empty date for '${header}', setting to null.`);
                                        documentToCreate.handoverDate = null;
                                    }
                                } else {
                                    documentToCreate.handoverDate = null; // Excel 单元格为空，设为 null
                                }
                            } else if (([] as string[]).includes(mappedKey)) {
                                 // --- TODO: 添加其他特定字段的处理逻辑 ---
                            } else {
                                // 对于其他可选字段，直接赋值 (null 如果单元格为空)
                                (documentToCreate as any)[mappedKey] = cellValue;
                            }
                        }

                        // c. 设置 createdBy (假设由上传用户决定)
                        // documentToCreate.createdBy = task.userId; // 或者从 task 关联的 User 获取姓名?
                        // 按照数据库设计，createdBy 存储姓名，这里需要获取用户名
                        // const user = await User.findByPk(task.userId, { transaction });
                        // documentToCreate.createdBy = user?.realName || `User_${task.userId}`;

                        // d. 数据库插入 (修改为添加到批量列表)
                        // ⚠️ 注意：sourceDepartmentId 未设置，如果数据库强制 NOT NULL 会失败！
                        // await Document.create(documentToCreate as any, { transaction });
                        documentsToBulkCreate.push(documentToCreate as Document);

                        task.successCount = (task.successCount || 0) + 1;
                        rowSuccess = true;

                    } catch (rowError: any) {
                        console.error(`[ImportService] Task ${taskId}, Row ${excelRowIndex}: Error - ${rowError.message}`);
                        task.failureCount = (task.failureCount || 0) + 1;
                        errors.push({ row: excelRowIndex, error: rowError.message || '未知行处理错误' });
                    }
                }

                // --- 执行批量插入 ---
                if (documentsToBulkCreate.length > 0) {
                    console.log(`[ImportService] Task ${taskId}: Attempting to bulk create ${documentsToBulkCreate.length} documents.`);
                    await Document.bulkCreate(documentsToBulkCreate as any[], { transaction });
                    console.log(`[ImportService] Task ${taskId}: Bulk create successful.`);
                } else {
                    console.log(`[ImportService] Task ${taskId}: No valid documents to bulk create.`);
                }
                // -------------------

                // 循环结束后，提交事务
                await transaction.commit();
                console.log(`[ImportService] Task ${taskId}: Transaction committed.`);

            } catch (transactionError: any) {
                // 如果事务处理中发生无法恢复的错误 (包括 bulkCreate 失败)，则回滚
                await transaction.rollback();
                console.error(`[ImportService] Task ${taskId}: Transaction rolled back due to error:`, transactionError);
                // 将此错误记为任务的总体错误
                // 如果是批量创建错误，可能需要调整错误信息和统计
                if (transactionError.message && transactionError.message.includes('bulkCreate')) {
                    task.failureCount = task.totalRows; // 假设批量失败导致所有行都失败
                    task.successCount = 0;
                    // 清空可能存在的行级错误，因为整体失败了
                    errors.length = 0;
                    errors.push({ row: 0, error: `批量插入失败: ${transactionError.message}` });
                } else if (transactionError.message) {
                     errors.push({ row: 0, error: `事务处理失败: ${transactionError.message}` });
                }
                throw new Error(`导入过程中发生严重错误，事务已回滚: ${transactionError.message}`);
            }
            // ----------------------------------------------------

            // 5. 处理完成，更新最终状态
            const processingEndTime = Date.now();
            console.log(`[ImportService] Task ${taskId}: Row processing finished in ${(processingEndTime - processingStartTime) / 1000} seconds.`);

            task.progress = 100;
            task.status = task.failureCount > 0 ? 3 : 2; // 3: failed, 2: completed
            task.errorDetails = errors.length > 0 ? JSON.stringify(errors) : null;
            // 更新最终的统计数据
            task.processedRows = dataRows.length; // 确保最终 processedRows 是总行数
            await task.save();

            console.log(`[ImportService] Task ${taskId} finished. Status: ${task.status}, Success: ${task.successCount}, Failure: ${task.failureCount}`);

            // 6. (可选) 删除临时文件
            try {
                fs.unlinkSync(filePath);
                console.log(`[ImportService] Task ${taskId}: Deleted temporary file ${filePath}`);
            } catch (unlinkError) {
                console.error(`[ImportService] Task ${taskId}: Error deleting temporary file ${filePath}:`, unlinkError);
            }

        } catch (error: any) {
            console.error(`[ImportService] Failed to process import task ${taskId}:`, error);
            if (task) {
                task.status = 3; // failed
                task.errorMessage = error.message || '处理导入任务时发生未知错误';
                task.progress = task.progress || 5; // 保留已有进度或设置一个值
                // 确保其他统计字段不是 null (如果是首次出错)
                task.processedRows = task.processedRows || 0;
                task.successCount = task.successCount || 0;
                task.failureCount = task.failureCount || (task.totalRows || 0); // 如果完全失败
                try {
                    await task.save();
                } catch (saveError) {
                     console.error(`[ImportService] Task ${taskId}: Failed to save error state:`, saveError);
                }
            }
             // 如果文件路径已知且存在，尝试删除
            if (task?.filePath) {
                const failedFilePath = path.join(__dirname, '..', '..', 'uploads', task.filePath);
                 try {
                    if (fs.existsSync(failedFilePath)) {
                        fs.unlinkSync(failedFilePath);
                        console.log(`[ImportService] Task ${taskId}: Deleted temporary file ${failedFilePath} after processing failure.`);
                    }
                } catch (unlinkError) {
                    console.error(`[ImportService] Task ${taskId}: Error deleting temporary file ${failedFilePath} after failure:`, unlinkError);
                }
            }
        }
    }
}

// --- 创建并导出服务实例 ---
const documentServiceInstance = new DocumentService();
export const importService = new ImportService(documentServiceInstance);