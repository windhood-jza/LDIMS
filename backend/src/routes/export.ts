import express, { Request, Response, NextFunction, Router } from 'express';
import authenticateToken from '../middleware/authenticateToken';
import { ExportService } from '../services/ExportService';
import { DocumentService } from '../services/DocumentService'; // 需要 DocumentService 来实例化 ExportService
import { DocumentListQuery } from '../types/document.d';
import { validationResult, body, query as queryValidator, param as paramValidator } from 'express-validator';
import * as fs from 'fs'; // 引入 Node.js fs 模块用于检查文件是否存在
import * as path from 'path'; // 引入 path 模块
import ExportTask from '../models/ExportTask'; // 修改为默认导入

// --- 实例化服务 --- 
// !! 注意：这里假设 DocumentService 已经被实例化并且可用
// !! 在实际应用中，这应该通过依赖注入或在 app.ts 中统一处理
// !! 这里暂时创建一个临时的 DocumentService 实例，后续需要调整
const documentService = new DocumentService(); 
const exportService = new ExportService(documentService);

const router: Router = express.Router();

// --- 路由定义 ---

/**
 * @route   POST /api/v1/documents/export
 * @desc    创建文档导出任务
 * @access  Private (需要认证)
 */
router.post(
    '/documents/export',
    authenticateToken,
    [
        body('fields').isArray({ min: 1 }).withMessage('必须选择至少一个导出字段'),
        body('fields.*').isString().isIn([
            'id', 'docName', 'docTypeName', 'sourceDepartmentName', 'submitter', 'receiver',
            'signer', 'handoverDate', 'storageLocation', 'remarks', 'createdByName',
            'createdAt', 'updatedByName', 'updatedAt'
            // 根据需要添加其他允许的字段
        ]).withMessage('包含无效的字段名'),
        body('fileType').isIn(['xlsx', 'csv']).withMessage('无效的文件类型'),
        body('exportScope').isIn(['all', 'selected', 'currentPage']).withMessage('无效的导出范围'),
        body('selectedIds').if(body('exportScope').equals('selected'))
            .isArray({ min: 1 }).withMessage('导出选中项时必须提供 selectedIds'),
        body('selectedIds.*').if(body('exportScope').equals('selected'))
            .isInt({ min: 1 }).withMessage('selectedIds 必须是有效的数字 ID'),
        body('currentPageIds').if(body('exportScope').equals('currentPage'))
            .isArray({ min: 1 }).withMessage('导出当前页时必须提供 currentPageIds'),
        body('currentPageIds.*').if(body('exportScope').equals('currentPage'))
            .isInt({ min: 1 }).withMessage('currentPageIds 必须是有效的数字 ID'),
        body('query').optional().isObject(),
        body('query.docName').optional().isString(),
        body('query.submitter').optional().isString(),
        body('query.receiver').optional().isString(),
        body('query.docTypeId').optional().isInt({ min: 1 }),
        body('query.sourceDepartmentId').optional().isInt({ min: 1 }),
        body('query.docTypeNameFilter').optional().isString(),
        body('query.sourceDepartmentNameFilter').optional().isString(),
        body('query.signer').optional().isString(),
        body('query.handoverDateRange').optional().isArray({ min: 2, max: 2 }),
        body('query.handoverDateRange.*').optional().isISO8601().toDate(),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ code: 400, message: '请求参数验证失败', errors: errors.array() });
            return;
        }

        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ code: 401, message: '无法获取用户信息' });
                return;
            }

            const { fields, fileType, query, exportScope, selectedIds, currentPageIds } = req.body;
            const exportOptions = { fields, fileType };

            // query 可以为空对象 {}
            const finalQuery: DocumentListQuery = query || {};

            // 将 selectedIds (如果存在) 转换为 JSON 字符串
            const selectedIdsJson = exportScope === 'selected' ? JSON.stringify(selectedIds || []) : null;
            const currentPageIdsJson = exportScope === 'currentPage' ? JSON.stringify(currentPageIds || []) : null;

            const newTask = await exportService.createExportTask(
                finalQuery,
                exportOptions,
                userId,
                exportScope,      // 传递新字段
                selectedIdsJson,  // 传递新字段 (JSON 字符串或 null)
                currentPageIdsJson  // 传递新字段 (JSON 字符串或 null)
            );
            res.status(201).json({ code: 201, message: '导出任务已创建', data: { taskId: newTask.id } });
            return;
        } catch (error) {
             console.error('[API Error] /documents/export:', error);
             const message = error instanceof Error ? error.message : '创建导出任务时出错';
             res.status(500).json({ code: 500, message: message });
             return;
        }
    }
);

/**
 * @route   GET /api/v1/export-tasks
 * @desc    获取当前用户的导出任务列表 (分页)
 * @access  Private
 */
router.get(
    '/export-tasks',
    authenticateToken,
    [
        queryValidator('page').optional().isInt({ min: 1 }).toInt().withMessage('页码必须是正整数'),
        queryValidator('pageSize').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('每页数量必须是1到100之间的整数'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ code: 400, message: '查询参数验证失败', errors: errors.array() });
            return;
        }

        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ code: 401, message: '无法获取用户信息' });
                return;
            }

            // 直接使用验证器处理后的值，如果不存在，服务层会处理默认值
            const page = req.query.page as number | undefined; // 验证器已确保是 number 或 undefined
            const pageSize = req.query.pageSize as number | undefined; // 验证器已确保是 number 或 undefined

            // 传递给服务层，让服务层处理默认值 (getTasksByUserId 有默认值 page=1, pageSize=10)
            const result = await exportService.getTasksByUserId(userId, page, pageSize);
            
            // 格式化返回的分页数据
             const responseData = {
                list: result.list.map((task: ExportTask) => ({
                    id: task.id,
                    userId: task.userId,
                    status: task.status,
                    fileName: task.fileName,
                    fileType: task.fileType,
                    queryCriteria: task.queryCriteria,
                    selectedFields: task.selectedFields,
                    progress: task.progress,
                    filePath: task.filePath,
                    errorMessage: task.errorMessage,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt,
                })),
                total: result.total,
                page: Number(page ?? 1),
                pageSize: Number(pageSize ?? 10),
            };

            res.status(200).json({ code: 200, message: '获取成功', data: responseData });
            return;

        } catch (error) {
            console.error('[API Error] /export-tasks:', error);
            const message = error instanceof Error ? error.message : '获取任务列表时出错';
            res.status(500).json({ code: 500, message: message });
            return;
        }
    }
);

/**
 * @route   GET /api/v1/export-tasks/:taskId
 * @desc    获取单个导出任务详情
 * @access  Private
 */
router.get(
    '/export-tasks/:taskId',
    authenticateToken,
    [paramValidator('taskId').isInt().toInt().withMessage('任务ID必须是整数')],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ code: 400, message: '参数验证失败', errors: errors.array() });
            return;
        }

        try {
            const userId = req.user?.id;
            const taskId = parseInt(req.params.taskId, 10);

            if (!userId) {
                res.status(401).json({ code: 401, message: '无法获取用户信息' });
                return;
            }

            const task = await exportService.getTaskById(taskId, userId);

            if (!task) {
                // 区分是任务不存在还是无权访问
                // 为了安全，通常不明确提示"无权限"，而是统一返回 404
                res.status(404).json({ code: 404, message: '导出任务未找到' });
                return;
            }
            
            // 格式化返回数据
             const responseData = {
                id: task.id,
                userId: task.userId,
                taskType: task.taskType,
                status: task.status,
                fileName: task.fileName,
                fileType: task.fileType,
                queryCriteria: task.queryCriteria, // 考虑是否返回查询条件
                progress: task.progress,
                selectedFields: task.selectedFields, // 考虑是否返回选择的字段
                filePath: task.filePath,
                errorMessage: task.errorMessage,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
            };

            res.status(200).json({ code: 200, message: '获取成功', data: responseData });
            return;

        } catch (error) {
            console.error(`[API Error] /export-tasks/${req.params.taskId}:`, error);
            const message = error instanceof Error ? error.message : '获取任务详情时出错';
            res.status(500).json({ code: 500, message: message });
            return;
        }
    }
);

/**
 * @route   GET /api/v1/export-tasks/:taskId/download
 * @desc    下载已完成的导出文件
 * @access  Private
 */
router.get(
    '/export-tasks/:taskId/download',
    authenticateToken,
    [paramValidator('taskId').isInt().toInt().withMessage('任务ID必须是整数')],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ code: 400, message: '参数验证失败', errors: errors.array() });
            return;
        }

        try {
            const userId = req.user?.id;
            const taskId = parseInt(req.params.taskId, 10);

            if (!userId) {
                res.status(401).json({ code: 401, message: '无法获取用户信息' });
                return;
            }

            console.log(`[API Download] User ${userId} requesting download for task ${taskId}`);

            const task = await exportService.getTaskById(taskId, userId);

            if (!task) {
                console.log(`[API Download] Task ${taskId} not found or user ${userId} not authorized.`);
                res.status(404).json({ code: 404, message: '导出任务未找到' });
                return;
            }

            // 检查任务状态是否为"完成" (status code 2)
            if (task.status !== 2) {
                 console.log(`[API Download] Task ${taskId} is not completed (status: ${task.status}).`);
                res.status(400).json({ code: 400, message: '任务尚未完成，无法下载' });
                return;
            }

            // 检查文件路径是否存在
            if (!task.filePath) {
                console.error(`[API Download] Task ${taskId} completed but filePath is missing.`);
                res.status(500).json({ code: 500, message: '任务文件路径丢失' });
                return;
            }

            // 检查物理文件是否存在
            try {
                await fs.promises.access(task.filePath, fs.constants.R_OK); // 检查文件是否存在且可读
                console.log(`[API Download] File found at ${task.filePath}. Starting download...`);
            } catch (fileError) {
                console.error(`[API Download] File not accessible at path ${task.filePath}:`, fileError);
                res.status(404).json({ code: 404, message: '导出文件不存在或无法访问' });
                return;
            }

            // 使用 res.download 发送文件
            // 第一个参数是文件在服务器上的绝对路径
            // 第二个参数是可选的，指定下载时显示给用户的文件名，如果省略则使用原始文件名
            const downloadFileName = task.fileName || path.basename(task.filePath);
            res.download(task.filePath, downloadFileName, (err) => {
                if (err) {
                    // 需要在这里处理下载过程中可能发生的错误，例如连接中断
                    // res.headersSent 检查是否已开始发送响应头，如果已发送则无法再发送错误 JSON
                    if (!res.headersSent) {
                         console.error(`[API Download] Error sending file ${task.filePath}:`, err);
                         res.status(500).json({ code: 500, message: '下载文件时发生错误' });
                    } else {
                         console.error(`[API Download] Error after headers sent for file ${task.filePath}:`, err);
                         // 可能需要记录日志，但无法再向客户端发送消息
                    }
                } else {
                    console.log(`[API Download] File ${downloadFileName} sent successfully.`);
                    // 下载成功完成
                }
            });

        } catch (error) {
            console.error(`[API Error] /export-tasks/${req.params.taskId}/download:`, error);
            if (!res.headersSent) {
                const message = error instanceof Error ? error.message : '处理下载请求时出错';
                res.status(500).json({ code: 500, message: message });
            }
        }
    }
);

export default router; 