import { SandboxedJob } from "bullmq";
import { contentProcessingService } from "../services/ContentProcessingService";
import { logger } from "../utils/logger";

/**
 * 这是沙盒化的处理器文件。
 * 它在一个独立的子进程中运行，专门负责执行耗时的任务。
 * BullMQ 的 Worker 会将任务 Job 传递给这个文件来执行。
 * 
 * @param job SandboxedJob 对象，包含了任务的数据
 */
module.exports = async (job: SandboxedJob) => {
  logger.info(`[Processor] Starting sandboxed processing for job #${job.id}.`);

  if (
    !job.data ||
    typeof job.data.fileId !== "number" ||
    typeof job.data.filePath !== "string"
  ) {
    logger.error(`[Processor] Job data is invalid for job #${job.id}.`);
    throw new Error("Job data is missing or invalid.");
  }

  try {
    // 调用我们现有的、包含了所有实际处理逻辑的服务
    const result = await contentProcessingService.processContentExtractionTask(
      job.data
    );
    logger.info(`[Processor] Job #${job.id} completed successfully.`);
    // 沙盒处理器可以返回一个结果，这个结果会被保存在 Job 的 returnvalue 中
    return result;
  } catch (error: any) {
    logger.error(
      `[Processor] Error processing job #${job.id}: ${error.message}`,
      error.stack
    );
    // 在沙盒处理器中抛出异常，会导致 BullMQ 将任务标记为 "failed"
    throw error;
  }
};
