import path from "path";
import fs from "fs";
import { SystemConfig } from "../models"; // Use index to import models

// --- 默认配置 ---
// Default to project_root/uploads (relative to dist/src/config usually)
// Adjust if your build structure is different
const DEFAULT_STORAGE_PATH = path.resolve(__dirname, "../../uploads");
const FILE_STORAGE_CONFIG_KEY = "FILE_STORAGE_PATH";

// Cache the path once fetched
let storagePath: string | null = null;
let documentSubPath: string | null = null;

/**
 * Ensures the given directory path exists. Creates it recursively if not.
 * @param dirPath Absolute path to the directory.
 */
const ensureDirectoryExists = (dirPath: string): void => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.info(`Created directory: ${dirPath}`);
    }
  } catch (error) {
    console.error(`Failed to create directory ${dirPath}:`, error);
    // Depending on severity, you might want to throw or exit
    throw new Error(`Storage directory ${dirPath} could not be created.`);
  }
};

/**
 * 获取文件存储根路径。
 * 优先从数据库 system_configs 表读取 FILE_STORAGE_PATH。
 * 如果数据库读取失败或未配置，则使用默认路径。
 * 确保返回的路径存在，如果不存在则尝试创建。
 * @param forceReload - 如果为 true，则强制重新从数据库加载路径。
 * @returns {Promise<string>} 文件存储的绝对路径
 */
export const getStoragePath = async (forceReload = false): Promise<string> => {
  if (storagePath && !forceReload) {
    return storagePath;
  }

  let resolvedPath: string;
  try {
    const configEntry = await SystemConfig.findOne({
      where: { configKey: FILE_STORAGE_CONFIG_KEY },
    });

    if (configEntry && configEntry.configValue) {
      resolvedPath = path.resolve(configEntry.configValue); // Ensure absolute path
      console.info(`Storage path loaded from DB: ${resolvedPath}`);
    } else {
      resolvedPath = DEFAULT_STORAGE_PATH;
      console.warn(
        `Config key '${FILE_STORAGE_CONFIG_KEY}' not found in DB or has empty value, using default: ${resolvedPath}`
      );
      // You might want to add logic here to create the default entry in the DB if it's missing
      // await SystemConfig.findOrCreate({ where: { configKey: FILE_STORAGE_CONFIG_KEY }, defaults: { configValue: DEFAULT_STORAGE_PATH, description: 'Default file storage path' } });
    }
  } catch (error) {
    console.error("Error fetching storage path from DB, using default:", error);
    resolvedPath = DEFAULT_STORAGE_PATH;
  }

  // Ensure the resolved directory exists
  ensureDirectoryExists(resolvedPath);

  storagePath = resolvedPath; // Cache the result
  return storagePath;
};

/**
 * 获取文档文件 (`documents` 子目录) 的存储路径。
 * @param forceReload - 如果为 true，则强制重新从数据库加载根路径。
 * @returns {Promise<string>} 文档存储的绝对路径
 */
export const getDocumentStoragePath = async (
  forceReload = false
): Promise<string> => {
  if (documentSubPath && !forceReload) {
    return documentSubPath;
  }
  const rootPath = await getStoragePath(forceReload);
  const docPath = path.join(rootPath, "documents");

  // Ensure the subdirectory exists
  ensureDirectoryExists(docPath);

  documentSubPath = docPath; // Cache the result
  return documentSubPath;
};

// Optional: Function to clear cached paths if needed (e.g., after config update)
export const clearCachedStoragePaths = (): void => {
  storagePath = null;
  documentSubPath = null;
  console.info("Cleared cached storage paths.");
};
