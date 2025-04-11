import ExportTask from '../models/ExportTask';
import { DocumentService } from './DocumentService'; // 确保路径正确
import { taskQueueService } from './TaskQueueService'; // 确保路径正确
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import sequelize from '../config/database'; // 引入 sequelize 实例用于事务
import Document from '../models/Document'; // 引入 Document 模型

// --- 定义 Excel 列名到数据库字段名的映射 ---
// !!! 非常重要：您需要根据实际 Excel 模板来定义这个映射 !!!
// 示例：假设 Excel 表头是中文，数据库字段是驼峰或下划线
const EXCEL_COLUMN_MAP: Record<string, keyof Document | string> = { // 使用 keyof Document 提高类型安全，或 string 处理自定义逻辑
    '文档名称': 'docName',
    '文档类型': 'docTypeName', // 假设 Excel 提供名称，需要后续查找 ID
    '来源部门': 'sourceDepartmentName', // 假设 Excel 提供名称
    '提交人': 'submitter',
    '接收人': 'receiver',
    '签收（章）人': 'signer',
    '交接日期': 'handoverDate', // 需要处理日期格式
    '保管位置': 'storageLocation',
    '备注': 'remarks',
    // '创建人': 'createdByName', // 通常由系统自动记录或根据上传用户设置
    // '创建时间': 'createdAt', // 通常由系统自动记录
    // ... 其他需要的字段映射 ...
};
// ------------------------------------------

// --- 定义必填的 Excel 列 ---
// !!! 您需要根据业务需求定义哪些列是必须存在的 !!!
const REQUIRED_EXCEL_COLUMNS = ['文档名称'];
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
            const jsonData: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null }); // defval: null 保留空单元格

            if (!jsonData || jsonData.length < 1) { // 至少需要表头
                 throw new Error('Excel 文件为空');
            }

            // 3. 获取表头和数据行
            const headerRowRaw: any[] = jsonData[0];
            const headerRow = headerRowRaw.map(cell => String(cell || '').trim()).filter(Boolean); // 清理并移除空表头
            const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== '')); // 过滤掉完全是空单元格的行

            // --- 验证表头 ---
            const missingHeaders = REQUIRED_EXCEL_COLUMNS.filter(reqCol => !headerRow.includes(reqCol));
            if (missingHeaders.length > 0) {
                throw new Error(`Excel 文件缺少必需的列: ${missingHeaders.join(', ')}`);
            }
            // -----------------

            task.totalRows = dataRows.length;
            task.processedRows = 0;
            task.successCount = 0;
            task.failureCount = 0;
            const errors: { row: number; error: string }[] = [];
            await task.save(); // 保存 totalRows

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
                for (let i = 0; i < dataRows.length; i++) {
                    const rowData = dataRows[i];
                    const excelRowIndex = i + 2; // Excel 中的实际行号
                    task.processedRows = i + 1;
                    let rowSuccess = false;

                    try {
                        // a. 将行数据映射到对象
                        const docDataRaw: Record<string, any> = {};
                        headerRow.forEach((header, index) => {
                            const mappedKey = EXCEL_COLUMN_MAP[header] || header; // 使用映射或原始表头
                            docDataRaw[mappedKey] = rowData[index] !== null ? String(rowData[index]).trim() : null;
                        });

                        // b. 数据验证 (基础)
                        const requiredDbFields = REQUIRED_EXCEL_COLUMNS.map(h => EXCEL_COLUMN_MAP[h] || h);
                        for (const field of requiredDbFields) {
                            if (docDataRaw[field] === null || docDataRaw[field] === '') {
                                throw new Error(`列 '${Object.keys(EXCEL_COLUMN_MAP).find(key => EXCEL_COLUMN_MAP[key] === field) || field}' 的值不能为空`);
                            }
                        }

                        // c. 数据转换和准备 (示例)
                        const documentToCreate: Partial<Document> = {
                            docName: docDataRaw.docName,
                            submitter: docDataRaw.submitter || null,
                            receiver: docDataRaw.receiver || null,
                            signer: docDataRaw.signer || null,
                            storageLocation: docDataRaw.storageLocation || null,
                            remarks: docDataRaw.remarks || null,
                            // 假设由 service/controller 填充 createdBy
                            // 假设数据库自动处理 createdAt/updatedAt
                        };

                        // 处理日期 (更健壮的方式)
                        if (docDataRaw.handoverDate) {
                            const dateValue = docDataRaw.handoverDate;
                            let parsedDate: Date | null = null;
                            if (typeof dateValue === 'number') { // Excel 数字日期
                                parsedDate = xlsx.SSF.parse_date_code(dateValue);
                            } else if (typeof dateValue === 'string') {
                                // 尝试解析常见日期格式
                                parsedDate = new Date(dateValue);
                                if (isNaN(parsedDate.getTime())) { // 无效日期
                                     parsedDate = null;
                                     console.warn(`[ImportService] Task ${taskId}, Row ${excelRowIndex}: Invalid date format for handoverDate: ${dateValue}`);
                                }
                            }
                             if (parsedDate && !isNaN(parsedDate.getTime())) {
                                documentToCreate.handoverDate = parsedDate;
                            } else {
                                 documentToCreate.handoverDate = null;
                            }
                        } else {
                            documentToCreate.handoverDate = null;
                        }


                        // --- TODO: 处理 docTypeName 和 sourceDepartmentName ---
                        // 1. 从 docDataRaw 获取名称
                        // 2. 调用 DocType.findOne({ where: { name: ... } }) 查找 ID
                        // 3. 调用 Department.findOne({ where: { name: ... } }) 查找 ID
                        // 4. 如果找到，设置 documentToCreate.docTypeName 和 documentToCreate.sourceDepartmentName
                        // 5. 如果找不到，根据业务规则处理（报错、跳过、设置默认值？）
                        // 示例（简化，需要错误处理和缓存优化）:
                         if (docDataRaw.docTypeName) {
                              // const docType = await DocType.findOne({ where: { name: docDataRaw.docTypeName }, transaction });
                              // if (docType) documentToCreate.docTypeName = docType.name; // 或者存 ID?
                              // else throw new Error(`未找到文档类型: ${docDataRaw.docTypeName}`);
                              documentToCreate.docTypeName = docDataRaw.docTypeName; // 暂存名字
                         }
                         if (docDataRaw.sourceDepartmentName) {
                              // const department = await Department.findOne({ where: { name: docDataRaw.sourceDepartmentName }, transaction });
                              // if (department) documentToCreate.sourceDepartmentName = department.name; // 或者存 ID?
                              // else throw new Error(`未找到来源部门: ${docDataRaw.sourceDepartmentName}`);
                              documentToCreate.sourceDepartmentName = docDataRaw.sourceDepartmentName; // 暂存名字
                         }
                        // -----------------------------------------------------


                        // d. 创建文档 (在事务中)
                        // 注意：需要调整 create 方法以接受 Partial<Document> 并返回创建的实例或ID
                        await Document.create(documentToCreate as any, { transaction, hooks: true }); // 强制类型转换需要谨慎
                        // 假设 DocumentService.create 在内部处理 createdBy

                        task.successCount = (task.successCount || 0) + 1;
                        rowSuccess = true;

                    } catch (rowError: any) {
                        console.error(`[ImportService] Task ${taskId}, Row ${excelRowIndex}: Error processing row - ${rowError.message}`);
                        task.failureCount = (task.failureCount || 0) + 1;
                        errors.push({ row: excelRowIndex, error: rowError.message || '未知行处理错误' });
                        // 不抛出错误，继续处理下一行
                    }

                    // e. 定期更新进度 (移到循环外，减少数据库写操作)
                    // if ((i + 1) % 10 === 0 || (i + 1) === dataRows.length) { }
                }

                // 循环结束后，提交事务
                await transaction.commit();
                console.log(`[ImportService] Task ${taskId}: Transaction committed.`);

            } catch (transactionError) {
                // 如果事务处理中发生无法恢复的错误，则回滚
                await transaction.rollback();
                console.error(`[ImportService] Task ${taskId}: Transaction rolled back due to error:`, transactionError);
                // 将此错误记为任务的总体错误
                throw new Error('导入过程中发生严重错误，事务已回滚');
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