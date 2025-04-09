import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库连接状态管理
export let isConnected = false;

// 数据库配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'LDIMS_DB',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql' as const,
  logging: process.env.NODE_ENV !== 'production' ? console.log : false
};

// 创建Sequelize实例
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试连接并设置状态
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    isConnected = true;
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    isConnected = false;
    console.error('数据库连接失败:', error);
    return false;
  }
};

// 即使连接失败也不影响服务启动
testConnection().catch(err => {
  console.error('初始数据库连接测试失败，服务仍将继续运行:', err);
});

export default sequelize; 