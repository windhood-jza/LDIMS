import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, isConnected } from './config/database';
import { success } from './utils/response';
import multer from 'multer';
import morgan from 'morgan';

// --- 导入服务类 ---
import { DocumentService } from './services/DocumentService';
import { ExportService } from './services/ExportService';
import { ImportService } from './services/ImportService';
import { DocTypeService } from './services/DocTypeService';
import { taskQueueService } from './services/TaskQueueService';

// --- 导入主路由创建函数 ---
import { createApiRouter } from './routes/index';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --- 服务实例化与依赖注入 ---
const documentService = new DocumentService();
const exportService = new ExportService(documentService);
const importService = new ImportService();
const docTypeService = new DocTypeService();

// 手动注入 ImportService 到 TaskQueueService
if (taskQueueService) {
    taskQueueService.setImportService(importService);
    console.log("[App] ImportService injected into TaskQueueService.");
} else {
    console.error("[App Critical Error] TaskQueueService instance not found. Import processing will fail.");
}

// 组合所有服务实例到一个对象中
const services = {
    documentService,
    exportService,
    importService,
    docTypeService,
};

// --- 创建并挂载主 API 路由 ---
const apiRouter = createApiRouter(services);
app.use('/api/v1', apiRouter);

// --- 基础路由 ---
app.get('/api/v1/health', (req, res) => {
  res.json(success({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: {
      connected: isConnected
    }
  }, '服务正常运行'));
});

// --- 全局错误处理中间件 ---
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error("Global Error Handler:", err);

    // 处理 Multer 错误
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ code: 400, message: '文件大小超过限制 (最大 50MB)' });
            return;
        }
        res.status(400).json({ code: 400, message: `文件上传处理错误: ${err.message}` });
        return;
    }
    // 处理文件过滤器抛出的错误
    if (err.message && err.message.includes('文件类型错误')) {
         res.status(400).json({ code: 400, message: err.message });
         return;
    }
    // 处理其他已知错误类型 (例如 Sequelize 验证错误)
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ code: 400, message: '数据验证失败', errors: err.errors?.map((e: any) => e.message) || [err.message] });
        return;
    }
    if (err.name === 'SequelizeDatabaseError') {
         console.error("Database Error:", err.original);
         res.status(500).json({ code: 500, message: '数据库操作失败' });
         return;
    }

    // 兜底处理
    const statusCode = err.status || 500;
    const message = (err instanceof Error ? err.message : String(err)) || '未知服务器错误';
    const finalMessage = statusCode === 500 && process.env.NODE_ENV === 'production' ? '服务器内部错误' : message;

    res.status(statusCode).json({ code: statusCode, message: finalMessage });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  
  // 测试数据库连接
  testConnection()
    .then(connected => {
      if (connected) {
        console.log('初始化数据库连接成功');
      } else {
        console.log('初始化数据库连接失败，服务仍将继续运行');
      }
    })
    .catch(err => {
      console.error('测试数据库连接时出错:', err);
    });
});

export default app; 