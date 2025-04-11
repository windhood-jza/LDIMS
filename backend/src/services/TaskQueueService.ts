import { ExportService } from './ExportService'; // 稍后会创建 ExportService

/**
 * @interface Task
 * @description 任务队列中的任务对象
 */
interface Task {
  id: number;
  // 可以添加其他任务相关信息，如类型、重试次数等
}

/**
 * @class TaskQueueService
 * @description 一个简单的内存后台任务队列服务
 */
class TaskQueueService {
  private taskQueue: Task[] = [];
  private isProcessing: boolean = false;
  private exportService: ExportService | null = null; // 稍后注入 ExportService 实例

  /**
   * @description 设置 ExportService 实例 (用于依赖注入)
   * @param service ExportService 实例
   */
  public setExportService(service: ExportService): void {
    this.exportService = service;
  }

  /**
   * @description 添加新任务到队列
   * @param taskId 任务 ID
   */
  public addTask(taskId: number): void {
    console.log(`[TaskQueue] Adding task ${taskId} to queue.`);
    this.taskQueue.push({ id: taskId });
    this.processNextTask(); // 尝试处理下一个任务
  }

  /**
   * @description 处理队列中的下一个任务
   * @private
   */
  private async processNextTask(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) {
      // 如果正在处理或队列为空，则返回
      if (this.isProcessing) console.log('[TaskQueue] Already processing a task.');
      if (this.taskQueue.length === 0) console.log('[TaskQueue] Queue is empty.');
      return;
    }

    this.isProcessing = true;
    const task = this.taskQueue.shift(); // 从队列头部取出一个任务

    if (!task) {
        this.isProcessing = false;
        return; // 以防万一
    }

    console.log(`[TaskQueue] Processing task ${task.id}...`);

    // 使用 setTimeout 模拟异步处理，避免阻塞事件循环
    setTimeout(async () => {
      try {
        if (!this.exportService) {
          throw new Error('ExportService not initialized in TaskQueueService.');
        }
        // 调用实际的任务处理逻辑 (假设 ExportService 有 processExportTask 方法)
        await this.exportService.processExportTask(task.id);
        console.log(`[TaskQueue] Task ${task.id} processed successfully.`);
      } catch (error) {
        console.error(`[TaskQueue] Error processing task ${task.id}:`, error);
        // 可以在这里添加失败处理逻辑，例如更新任务状态为 failed
        // 如果 ExportService.processExportTask 内部处理了失败状态更新，这里可能不需要额外操作
      } finally {
        this.isProcessing = false;
        console.log(`[TaskQueue] Finished processing task ${task.id}. Triggering next.`);
        this.processNextTask(); // 处理完一个后，尝试处理下一个
      }
    }, 0); // 立即放入事件循环的下一个 tick
  }

    /**
     * @description 获取当前队列长度 (仅用于调试或监控)
     * @returns {number} 队列中的任务数量
     */
    public getQueueLength(): number {
        return this.taskQueue.length;
    }
}

// 使用单例模式导出 TaskQueueService 实例
export const taskQueueService = new TaskQueueService(); 