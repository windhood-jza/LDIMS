import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import { getDocumentStoragePath } from "../config/storage"; // Import from the new storage config
import fs from "fs/promises"; // Import fs.promises for mkdir

// --- 配置常量 ---
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB (adjust as needed)
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  // 可以根据需要添加更多类型，例如:
  // 'application/vnd.ms-excel', // .xls
  // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  // 'application/vnd.ms-powerpoint',
  // 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
const MAX_FILES_PER_UPLOAD = 10; // Max 10 files per upload request

// --- 文件过滤器 ---
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    console.warn(
      `[DocumentUpload] Rejected file: Invalid mimetype - ${file.originalname} (${file.mimetype})`
    );
    cb(null, false); // Reject file silently
    // 或者抛出错误以便上层捕获: cb(new Error(`不支持的文件类型: ${file.mimetype}`));
  }
};

// --- 存储引擎 (修改) ---
// 现在 Multer 只负责保存到根存储路径下的临时文件
// DocumentService 将负责创建子目录和重命名/移动文件
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadPath = await getDocumentStoragePath(); // 获取根存储路径
      // 确保根存储路径存在 (虽然通常应该存在，但作为防御性编程)
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath); // 直接指定根路径为目标
    } catch (error) {
      console.error(
        "[DocumentUpload] Failed to get or create document storage path for multer:",
        error
      );
      cb(error as Error, "");
    }
  },
  filename: (req, file, cb) => {
    // 生成临时的唯一文件名: uuid.original_extension
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

// --- 创建 Multer 实例 ---
const documentUpload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_UPLOAD, // Limit number of files
  },
  fileFilter: fileFilter,
});

// --- 导出中间件 ---

/**
 * Multer middleware specifically for handling document file uploads.
 * Expects files under the field name 'files'.
 * Saves files temporarily to the root storage path with unique names.
 */
export const documentUploadMiddleware = documentUpload.array(
  "files",
  MAX_FILES_PER_UPLOAD
);

// If single file uploads for documents were ever needed:
// export const singleDocumentUploadMiddleware = documentUpload.single('file');
