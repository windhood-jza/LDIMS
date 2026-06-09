import { Worker, Job } from "bullmq";
import os from "os";
import redisConfig from "../config/redis"; // Redis 配置
import { CONTENT_EXTRACTION_QUEUE_NAME } from "../queues/contentExtractionQueue"; // 队列名称
import { contentProcessingService } from "../services/ContentProcessingService"; // <--- 导入实际的处理服务
import DocumentFile from "../models/DocumentFile"; // 导入模型
import { contentExtractionQueue } from "../queues/contentExtractionQueue"; // 队列实例
import { logger } from "../utils/logger";

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

logger.info(
  `[Worker] Setting up content extraction worker with concurrency: ${concurrency}`
);

// 创建 Worker 实例
const worker = new Worker(
  CONTENT_EXTRACTION_QUEUE_NAME, // 监听的队列名称
  async (job: Job) => {
    // 这是处理器函数 (processor function)
    logger.info(`[Worker] Processing job #${job.id}.`);
    // 修改：验证 job.data 的结构
    if (
      !job.data ||
      typeof job.data.fileId !== "number" ||
      typeof job.data.filePath !== "string"
    ) {
      throw new Error(
        "Job data is missing or invalid (requires fileId and filePath)."
      );
    }
    // 调用实际的处理逻辑
    // 使用导入的 service instance，并传递整个 job.data 对象
    await contentProcessingService.processContentExtractionTask(job.data); // <--- 修改：传递整个 job.data
  },
  {
    connection: redisConfig, // Redis 连接配置
    concurrency: concurrency, // 并发设置
    // 增加锁的持续时间，给耗时的OCR任务足够的时间
    // 这是解决 "stalled" 问题的关键
    lockDuration: 10 * 60 * 1000, // 10 分钟
    // 通过官方选项，向底层的 fork 函数传递参数，以隐藏 Windows 上的弹窗
    workerForkOptions: {
      detached: true,
    },
  }
);

// --- 在 Worker 启动时，自动检查并重新入队所有 pending 文件 ---
(async () => {
  try {
    logger.info("[Worker Bootstrap] Scanning for pending files to enqueue...");
    const pendingFiles = await DocumentFile.findAll({
      where: { processingStatus: "pending" },
      attributes: ["id", "filePath"],
    });

    if (pendingFiles.length === 0) {
      logger.info("[Worker Bootstrap] No pending files found.");
      return;
    }

    let enqueuedCount = 0;
    for (const file of pendingFiles) {
      if (!file.filePath) continue;
      try {
        await contentExtractionQueue.add("process-file", {
          fileId: file.id,
          filePath: file.filePath,
        });
        enqueuedCount++;
      } catch (e) {
        logger.error(
          `[Worker Bootstrap] Failed to enqueue file ID ${file.id}:`,
          e
        );
      }
    }
    logger.info(
      `[Worker Bootstrap] Enqueued ${enqueuedCount}/${pendingFiles.length} pending files.`
    );
  } catch (bootstrapErr) {
    logger.error(
      "[Worker Bootstrap] Error scanning/enqueuing pending files:",
      bootstrapErr
    );
  }
})();

// --- Event Listeners for Monitoring/Logging ---

worker.on("completed", (job: Job, returnValue: any) => {
  logger.info(`[Worker] Job #${job.id} completed successfully.`);
});

worker.on("failed", (job: Job | undefined, error: Error) => {
  if (job) {
    logger.error(
      `[Worker] Job #${job.id} failed after ${job.attemptsMade} attempts with error: ${error.message}`,
      error.stack
    );
  } else {
    logger.error(
      `[Worker] A job failed with error: ${error.message}`,
      error.stack
    );
  }
});

worker.on("error", (error) => {
  // 通常是连接 Redis 等非任务本身的问题
  logger.error("[Worker] Worker encountered an error:", error);
});

worker.on("active", (job: Job) => {
  logger.debug(`[Worker] Job #${job.id} is now active.`);
});

worker.on("stalled", (jobId: string) => {
  logger.warn(`[Worker] Job #${jobId} has stalled.`);
});

logger.info(
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
