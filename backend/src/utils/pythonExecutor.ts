import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import * as path from "path";

/**
 * @interface PythonExecutionResult
 * @description Python 脚本执行结果的结构
 */
export interface PythonExecutionResult {
  success: boolean; // 是否成功执行 (主要看 exitCode === 0 且无超时/启动错误)
  output: string | null; // 标准输出内容
  error: string | null; // 标准错误内容 或 执行错误信息 (警告也会在这里)
  exitCode: number | null; // Python 脚本退出码
}

// 默认超时时间（毫秒）
const DEFAULT_TIMEOUT = 300000; // 5 分钟

/**
 * @function executePythonScript
 * @description 执行一个 Python 脚本并返回结果
 * @param {string} scriptName - Python 脚本的文件名 (相对于 scripts 目录)
 * @param {string[]} args - 传递给 Python 脚本的命令行参数数组
 * @param {number} [timeout=DEFAULT_TIMEOUT] - 超时时间 (毫秒)
 * @returns {Promise<PythonExecutionResult>} 包含执行结果的 Promise
 */
export const executePythonScript = (
  scriptName: string,
  args: string[] = [],
  timeout: number = DEFAULT_TIMEOUT
): Promise<PythonExecutionResult> => {
  return new Promise((resolve) => {
    // 1. 确定 Python 可执行文件路径
    const pythonExecutable =
      process.env.PYTHON_EXECUTABLE_PATH ||
      path.resolve(__dirname, "../../venv/Scripts/python.exe");
    console.log(
      `[PythonExecutor] Using Python executable: ${pythonExecutable}`
    );

    // 2. 构建 Python 脚本的完整路径
    const scriptDir = path.resolve(__dirname, "../python-scripts");
    const scriptPath = path.join(scriptDir, scriptName);
    console.log(`[PythonExecutor] Script path: ${scriptPath}`);

    let stdoutData = "";
    let stderrData = "";
    let processError: Error | null = null; // 记录 spawn 本身的错误
    let timedOut = false;
    let pythonProcess: ChildProcessWithoutNullStreams | null = null;

    // 设置超时计时器
    const timer = setTimeout(() => {
      timedOut = true;
      stderrData += `\n[Executor Error] Execution timed out after ${
        timeout / 1000
      } seconds.`; // 追加超时信息到 stderr
      console.error(`[PythonExecutor] Script ${scriptName} timed out.`);
      if (pythonProcess) {
        pythonProcess.kill("SIGKILL");
      }
    }, timeout);

    try {
      // 3. 启动 Python 子进程
      pythonProcess = spawn(pythonExecutable, [scriptPath, ...args], {
        timeout: timeout,
        stdio: ["pipe", "pipe", "pipe"],
      });

      // 捕获标准输出
      pythonProcess.stdout.on("data", (data) => {
        stdoutData += data.toString("utf8");
      });

      // 捕获标准错误
      pythonProcess.stderr.on("data", (data) => {
        stderrData += data.toString("utf8");
      });

      // 监听进程错误事件 (例如，命令找不到 'spawn ENOENT')
      pythonProcess.on("error", (err) => {
        console.error(
          `[PythonExecutor] Failed to start subprocess for ${scriptName}:`,
          err
        );
        processError = err; // 记录启动错误
        // close 事件仍然会触发
      });

      // 监听进程关闭事件
      pythonProcess.on("close", (code) => {
        clearTimeout(timer); // 清除超时计时器
        console.log(
          `[PythonExecutor] Script ${scriptName} closed with code ${code}. Timed out: ${timedOut}`
        );

        // **优化核心：判断成功逻辑**
        // 成功条件：进程启动没问题 (processError=null)，执行未超时 (timedOut=false)，退出码为 0 (code=0)
        const isSuccess = !processError && !timedOut && code === 0;

        // 准备最终的错误信息字符串
        let finalError = stderrData.trim() || null;
        if (processError) {
          // 如果有启动错误，优先/附加显示
          finalError = `Spawn Error: ${processError.message}${
            finalError ? `\n--- Stderr ---\n` + finalError : ""
          }`;
        } else if (timedOut && !finalError) {
          // 如果超时但 stderr 为空，补充超时信息
          finalError = `Execution timed out after ${timeout / 1000} seconds.`;
        }

        const result: PythonExecutionResult = {
          success: isSuccess,
          output: stdoutData.trim() || null,
          error: finalError, // 包含 stderr 内容和可能的启动/超时错误
          exitCode: code,
        };

        if (!isSuccess && result.error) {
          console.error(
            `[PythonExecutor] Execution failed. Exit code: ${code}. Error captured: ${result.error}`
          );
        } else if (!isSuccess) {
          console.error(
            `[PythonExecutor] Execution failed. Exit code: ${code}. No specific error captured in stderr/spawn.`
          );
        }

        resolve(result);
      });
    } catch (error: any) {
      // 同步的 spawn 错误 (非常罕见)
      clearTimeout(timer);
      console.error(
        `[PythonExecutor] Error spawning python process for ${scriptName}:`,
        error
      );
      resolve({
        success: false,
        output: null,
        error: `Failed to spawn process: ${error.message}`,
        exitCode: null,
      });
    }
  });
};
