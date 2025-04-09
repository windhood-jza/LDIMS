import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, isConnected } from './config/database';
import { success } from './utils/response';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('全局错误处理:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
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