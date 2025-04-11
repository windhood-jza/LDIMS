import express, { Request, Response, NextFunction, Router } from 'express';
import authenticateToken from '../middleware/authenticateToken';
import { ExportService } from '../services/ExportService';
import { DocumentService } from '../services/DocumentService'; // 需要 DocumentService 来实例化 ExportService
import { DocumentListQuery } from '../types/document.d';
import { validationResult, body, query as queryValidator, param as paramValidator } from 'express-validator';
import * as fs from 'fs'; // 引入 Node.js fs 模块用于检查文件是否存在
import * as path from 'path'; // 引入 path 模块

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
        // 验证请求体
        body('fileType').isIn(['excel', 'csv']).withMessage('无效的文件类型'),
        body('fields').isArray({ min: 1 }).withMessage('必须指定至少一个导出字段'),
        // query 条件可以允许为空或部分提供，ExportService 会处理
        body('query').optional().isObject().withMessage('查询条件必须是对象格式'),
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

            const { query, fields, fileType } = req.body;
            const exportOptions = { fields, fileType };

            // query 可以为空对象 {}
            const finalQuery: DocumentListQuery = query || {}; 

            const newTask = await exportService.createExportTask(finalQuery, exportOptions, userId);
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

            const page = (req.query.page as number | undefined) ?? 1;
            const pageSize = (req.query.pageSize as number | undefined) ?? 10;

            const result = await exportService.getTasksByUserId(userId, page, pageSize);
            
            // 格式化返回的分页数据
             const responseData = {
                list: result.list.map(task => ({
                    id: task.id,
                    userId: task.userId,
                    taskType: task.taskType,
                    status: task.status,
                    fileName: task.fileName,
                    fileType: task.fileType,
                    progress: task.progress,
                    filePath: task.filePath, // 可能会暴露服务器路径，考虑是否只在下载时使用
                    errorMessage: task.errorMessage,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt,
                })),
                total: result.total,
                page: page,
                pageSize: pageSize,
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