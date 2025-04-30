import { RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

// 确保在应用启动时已经调用过 dotenv.config()
// 如果没有，可以在这里补上，但不推荐在这里调用
// dotenv.config(); 

// Redis 连接配置
// 优先从环境变量读取，如果环境变量未设置，则使用默认值
const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1', // Redis 服务器地址
  port: parseInt(process.env.REDIS_PORT || '6379', 10), // Redis 端口
  password: process.env.REDIS_PASSWORD || undefined, // Redis 密码，如果环境变量未设置则为 undefined
  maxRetriesPerRequest: null, // 允许无限重试连接 (根据需要调整)
  // 可以根据需要添加更多 ioredis 支持的配置项
  // 例如：db: 0, // 选择数据库
};

// 可选：添加一些日志来确认配置被正确加载
console.log(`Redis config loaded: host=${redisConfig.host}, port=${redisConfig.port}, password provided=${!!redisConfig.password}`);

export default redisConfig; 