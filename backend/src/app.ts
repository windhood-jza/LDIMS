import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, isConnected } from './config/database';
import { success } from './utils/response';
import routes from './routes'; // 引入主路由
import uploadRouter from './routes/upload';
import multer from 'multer';
import morgan from 'morgan';

// --- 导入服务初始化函数 ---
import { initializeImportService } from './services/ImportService';
// import { initializeTaskQueueService } from './services/TaskQueueService'; // TaskQueueService 使用单例模式导出实例
// --- 只需确保 ImportService 初始化即可 ---

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); // 添加 morgan 日志中间件

// --- 服务初始化 ---
// !! 注意: ImportService 依赖 TaskQueueService 注入自身
// !! 但 TaskQueueService 实例已在导入时创建
// !! 只需调用 ImportService 的初始化即可
initializeImportService();    // 初始化 ImportService (它内部会调用 taskQueueService.setImportService)
// ------------------

// --- API 路由 ---
app.use('/api/v1', routes);
app.use('/api/v1', uploadRouter);

// 基础路由
app.get('/api/v1/health', (req, res) => {
  res.json(success({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: {
      connected: isConnected
    }
  }, '服务正常运行'));
});

// --- 全局错误处理中间件 (暂时简化) ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Simplified Global Error Handler:", err);

    // 暂时只返回 500 错误
    res.status(500).json({ message: '服务器内部错误 (简化测试)' });

    // 注意：原始的 Multer 和其他错误处理逻辑暂时被注释掉了
    /*
    // 处理 Multer 错误
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: '文件大小超过限制 (最大 10MB)' });
        }
        return res.status(400).json({ message: `文件上传字段错误: ${err.message}` });
    }
    // 处理文件过滤器抛出的错误或其他特定错误
    if (err.message && err.message.includes('仅支持上传')) {
         return res.status(400).json({ message: err.message });
    }
    const statusCode = err.status || 500;
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
                    ? '服务器内部错误'
                    : err.message || '未知服务器错误';
    res.status(statusCode).json({ message });
    */
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