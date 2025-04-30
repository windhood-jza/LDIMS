import DocumentFile from "../models/DocumentFile";
import {
  executePythonScript,
  PythonExecutionResult,
} from "../utils/pythonExecutor";
import { getStoragePath } from "../config/storage"; // 假设我们用这个函数获取存储根路径
import * as path from "path";

// 可以在这里定义更具体的错误类型
class ContentProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentProcessingError";
  }
}

/**
 * @class ContentProcessingService
 * @description 处理单个文件内容提取的服务
 */
export class ContentProcessingService {
  /**
   * @method processContentExtractionTask
   * @description 处理单个文件内容提取任务的核心逻辑
   * @param {number} fileId - document_files 表中的文件 ID
   * @throws {ContentProcessingError} 如果文件记录未找到或处理中发生无法恢复的错误
   */
  async processContentExtractionTask(fileId: number): Promise<void> {
    console.log(
      `[ContentProcessingService] Starting task for file ID: ${fileId}`
    );

    let documentFile: DocumentFile | null = null;

    try {
      // 1. 获取文件记录
      documentFile = await DocumentFile.findByPk(fileId);
      if (!documentFile) {
        throw new ContentProcessingError(
          `DocumentFile record not found for ID: ${fileId}`
        );
      }

      // 检查状态，避免重复处理 (可选但推荐)
      if (
        documentFile.processingStatus !== "pending" &&
        documentFile.processingStatus !== "failed"
      ) {
        // 如果允许重试 'failed' 状态，可以调整此逻辑
        console.log(
          `[ContentProcessingService] File ID: ${fileId} status is '${documentFile.processingStatus}', skipping processing.`
        );
        return;
      }

      // 更新状态为 'processing'
      documentFile.processingStatus = "processing";
      await documentFile.save();
      console.log(
        `[ContentProcessingService] File ID: ${fileId} status updated to 'processing'.`
      );

      // 2. 构建文件物理路径
      const storageRoot = await getStoragePath(); // 获取配置的文件存储根目录
      if (!documentFile.filePath) {
        throw new ContentProcessingError(
          `File path is missing for DocumentFile ID: ${fileId}`
        );
      }
      // 注意：filePath 设计为相对路径，包含子目录和结构化文件名
      const fullFilePath = path.resolve(storageRoot, documentFile.filePath);
      console.log(
        `[ContentProcessingService] Full file path for ID ${fileId}: ${fullFilePath}`
      );

      // 3. 准备 Python 脚本参数
      const args: string[] = [fullFilePath];

      // 检查是否配置并使用 Azure DI
      const azureEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
      const azureKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY; // Key 由脚本内部检查环境变量

      if (azureEndpoint) {
        console.log(
          `[ContentProcessingService] Azure DI Endpoint found, adding to args for file ID: ${fileId}`
        );
        args.push("--azure-endpoint", azureEndpoint);
        // Key 不需要作为参数传递给脚本
      }

      // 4. 调用 executePythonScript 执行 Python 脚本
      console.log(
        `[ContentProcessingService] Executing python script for file ID: ${fileId}...`
      );
      //   - 调用新的统一处理脚本
      const result: PythonExecutionResult = await executePythonScript(
        "process_document.py", // <--- 使用新的脚本名
        args
        // 可以根据需要调整超时时间
        // 600000 // 例如：10 分钟
      );

      // 5. 处理结果
      if (result.success) {
        // 成功
        console.log(
          `[ContentProcessingService] Python script successful for file ID: ${fileId}. Output length: ${
            result.output?.length ?? 0
          }`
        );
        // ---- 添加日志 ----
        console.log(
          `[ContentProcessingService] Extracted content before DB save (first 100 chars): ${
            result.output?.substring(0, 100) ?? "null"
          }`
        );
        // -----------------
        documentFile.extractedContent = result.output; // 允许保存 null 或空字符串
        documentFile.processingStatus = "completed";
      } else {
        // 失败 (包括脚本内部错误 exitCode != 0 或执行超时/错误)
        console.error(
          `[ContentProcessingService] Python script failed for file ID: ${fileId}. Exit code: ${
            result.exitCode
          }. Timed out: ${
            !result.exitCode && result.error?.includes("timed out")
          }. Error: ${result.error}`
        );
        documentFile.processingStatus = "failed";
        // 可以考虑将 result.error 存入数据库的错误信息字段 (如果添加了该字段)
        // documentFile.processingError = result.error;
      }

      // 6. 保存最终状态
      await documentFile.save();
      console.log(
        `[ContentProcessingService] File ID: ${fileId} final status saved as '${documentFile.processingStatus}'.`
      );
    } catch (error: any) {
      console.error(
        `[ContentProcessingService] Unhandled error processing file ID: ${fileId}:`,
        error
      );
      // 如果在更新状态前发生错误，尝试将状态标记为失败
      if (
        documentFile &&
        documentFile.processingStatus !== "completed" &&
        documentFile.processingStatus !== "failed"
      ) {
        try {
          documentFile.processingStatus = "failed";
          // documentFile.processingError = error.message; // 记录错误
          await documentFile.save();
          console.error(
            `[ContentProcessingService] Marked file ID: ${fileId} as failed due to unhandled error.`
          );
        } catch (saveError) {
          console.error(
            `[ContentProcessingService] Failed to save error status for file ID: ${fileId}:`,
            saveError
          );
        }
      }
      // 重新抛出错误，让 BullMQ Worker 知道任务失败
      throw new ContentProcessingError(
        `Failed to process file ID ${fileId}: ${error.message}`
      );
    }
  }
}

// 导出服务实例或类本身，取决于你的应用架构
export const contentProcessingService = new ContentProcessingService();
