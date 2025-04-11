// LDIMS/backend/src/routes/upload.ts
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authenticateToken from '../middleware/authenticateToken'; // 确保路径正确

const router = express.Router();

// --- 配置 Multer ---

// 确保 uploads 目录存在
const uploadDir = path.join(__dirname, '..', '..', 'uploads'); // 指向 backend/uploads/
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
  } catch (err) {
    console.error(`Error creating upload directory ${uploadDir}:`, err);
    // 目录创建失败可能导致后续 multer 出错
  }
} else {
  console.log(`Upload directory already exists: ${uploadDir}`);
}


// 配置存储引擎
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 再次检查目录是否存在
    if (!fs.existsSync(uploadDir)) {
        return cb(new Error(`Upload directory ${uploadDir} does not exist.`), '');
    }
    cb(null, uploadDir); // 保存到 uploads/ 目录
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名，保留原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname).toLowerCase()); // 统一小写扩展名
  }
});

// 文件过滤器，只允许 Excel 文件
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true); // 接受文件
  } else {
    // 创建一个 Error 对象传递给回调，以便错误处理中间件捕获
    cb(new Error('仅支持上传 Excel 文件 (.xlsx, .xls)'));
  }
};

// 配置 multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制文件大小为 10MB (可调整)
  }
});

// --- 定义上传路由 ---

// POST /upload/excel - 处理 Excel 文件上传
router.post(
  '/upload/excel',
  authenticateToken,
  (req: any, res: any, next: any) => { // 将 multer 调用移到这里以更好地处理错误
      const uploader = upload.single('excelFile'); // 'excelFile' 是前端 input 的 name
      uploader(req, res, (err: any) => {
          if (err) {
              // 将 Multer 错误传递给下一个错误处理中间件
              return next(err);
          }
          // 如果没有文件被上传 (可能被 fileFilter 拒绝且未抛错)
          if (!req.file && !res.headersSent) {
               return res.status(400).json({ message: '未选择文件或文件类型不符合要求' });
          }
          // 文件上传成功（或 fileFilter 抛错由 next(err) 处理），继续
          next();
      });
  },
  (req: any, res: any) => {
    // 这个处理程序只有在 multer 成功处理文件或 fileFilter 未抛错时执行
    if (!req.file) {
        // 作为保险措施
        return res.status(400).json({ message: '上传处理异常：未找到文件' });
    }
    console.log('File uploaded successfully:', req.file);

    // 返回上传成功的信息
    res.status(200).json({
      message: '文件上传成功',
      fileName: req.file.filename, // 返回生成的文件名
      originalName: req.file.originalname // 原始文件名
    });
  }
);

export default router;