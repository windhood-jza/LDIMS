import { Worker, Job } from "bullmq";
import os from "os";
import redisConfig from "../config/redis"; // Redis 配置
import { CONTENT_EXTRACTION_QUEUE_NAME } from "../queues/contentExtractionQueue"; // 队列名称
import { contentProcessingService } from "../services/ContentProcessingService"; // <--- 导入实际的处理服务

// Placeholder for the actual processing function
// We will implement this service/function later
// const processContentExtractionTask = async (fileId: number): Promise<void> => { // <--- 移除占位符
//   console.log(
//     `[Worker Stub] Received task for file ID: ${fileId}. Actual processing logic TBD.`
//   );
//   // Simulate some work
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   // In real implementation, call Python script here
//   // and update database based on result
// };

// --- Worker Configuration ---

// 确定并发数：使用 CPU 核心数减 1 (至少为 1)，可以根据服务器负载调整
const concurrency = Math.max(1, os.cpus().length - 1);

console.log(
  `[Worker] Setting up content extraction worker with concurrency: ${concurrency}`
);

// 创建 Worker 实例
const worker = new Worker(
  CONTENT_EXTRACTION_QUEUE_NAME, // 监听的队列名称
  async (job: Job) => {
    // 这是处理器函数 (processor function)
    console.log(`[Worker] Processing job #${job.id} with data:`, job.data);
    if (!job.data || typeof job.data.fileId !== "number") {
      throw new Error("Job data is missing or fileId is not a number.");
    }
    // 调用实际的处理逻辑
    // 使用导入的 service instance
    await contentProcessingService.processContentExtractionTask(
      job.data.fileId
    ); // <--- 调用实际服务
  },
  {
    connection: redisConfig, // Redis 连接配置
    concurrency: concurrency, // 并发设置
    // 可以添加更多 Worker 配置项，例如锁的持续时间等
    // lockDuration: 60000, // 锁的最长持续时间 (毫秒)
  }
);

// --- Event Listeners for Monitoring/Logging ---

worker.on("completed", (job: Job, returnValue: any) => {
  console.log(`[Worker] Job #${job.id} completed successfully.`);
});

worker.on("failed", (job: Job | undefined, error: Error) => {
  if (job) {
    console.error(
      `[Worker] Job #${job.id} failed after ${job.attemptsMade} attempts with error: ${error.message}`,
      error.stack
    );
  } else {
    console.error(
      `[Worker] A job failed with error: ${error.message}`,
      error.stack
    );
  }
});

worker.on("error", (error) => {
  // 通常是连接 Redis 等非任务本身的问题
  console.error("[Worker] Worker encountered an error:", error);
});

worker.on("active", (job: Job) => {
  console.log(`[Worker] Job #${job.id} is now active.`);
});

worker.on("stalled", (jobId: string) => {
  console.warn(`[Worker] Job #${jobId} has stalled.`);
});

console.log(
  `[Worker] Content extraction worker listening to queue '${CONTENT_EXTRACTION_QUEUE_NAME}'...`
);

// 通常不直接导出 worker 实例，除非需要从外部控制它 (如优雅关闭)
// export default worker;

// --- Graceful Shutdown Handling (Example) ---
// 在实际应用中，你可能需要处理 SIGINT 和 SIGTERM 信号来实现优雅关闭
/*
async function shutdown() {
  console.log('[Worker] Shutting down worker...');
  await worker.close();
  console.log('[Worker] Worker closed.');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
*/
