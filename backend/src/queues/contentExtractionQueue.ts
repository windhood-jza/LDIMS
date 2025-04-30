import { Queue, QueueOptions } from 'bullmq';
import redisConfig from '../config/redis'; // 导入我们之前创建的 Redis 配置

// 队列名称，最好使用常量或枚举管理
export const CONTENT_EXTRACTION_QUEUE_NAME = 'content-extraction';

// 默认的作业选项
const defaultJobOptions: QueueOptions['defaultJobOptions'] = {
  attempts: 3, // 如果任务失败，最多尝试 3 次
  backoff: {
    type: 'exponential', // 重试间隔时间指数增长
    delay: 5000, // 第一次重试延迟 5 秒
  },
  removeOnComplete: {
    count: 1000, // 保留最近 1000 个成功完成的任务记录
    age: 24 * 3600, // 保留最多 24 小时的成功任务记录 (单位：秒)
  },
  removeOnFail: {
    count: 5000, // 保留最近 5000 个失败的任务记录
    age: 7 * 24 * 3600, // 保留最多 7 天的失败任务记录
  },
};

// 创建并导出内容提取队列实例
export const contentExtractionQueue = new Queue(CONTENT_EXTRACTION_QUEUE_NAME, {
  connection: redisConfig, // 使用导入的 Redis 配置
  defaultJobOptions: defaultJobOptions, // 应用默认作业选项
});

// 添加一些日志确认队列已初始化
console.log(`BullMQ queue '${CONTENT_EXTRACTION_QUEUE_NAME}' initialized.`);

// 可选：添加事件监听器用于调试或监控
contentExtractionQueue.on('error', (error) => {
  console.error(`BullMQ queue '${CONTENT_EXTRACTION_QUEUE_NAME}' error:`, error);
}); 