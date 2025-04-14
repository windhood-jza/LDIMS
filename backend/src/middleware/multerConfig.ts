import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // 用于生成唯一文件名

// 确保 uploads 目录存在
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储引擎
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // 设置文件存储路径
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名: uuid + 原始文件扩展名
        const uniqueSuffix = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

// 配置 Multer 实例
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 50 // 限制文件大小为 50MB (根据需要调整)
    },
    fileFilter: (req, file, cb) => {
        // 只接受 Excel 文件
        const allowedTypes = /excel|spreadsheetml/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extName) {
            return cb(null, true);
        } else {
            cb(new Error('文件类型错误，请上传 Excel 文件 (.xls, .xlsx)'));
        }
    }
});

export default upload; 