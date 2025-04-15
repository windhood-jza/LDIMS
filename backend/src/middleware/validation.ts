import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { fail } from '../utils/response'; // 假设有统一的失败响应工具

/**
 * @description Middleware to handle validation errors from express-validator.
 * If there are validation errors, it sends a 400 response. Otherwise, calls next().
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn('[Validation Middleware] Validation errors:', errors.array());
        // 将错误数组格式化为更友好的消息 (可选)
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        res.status(400).json(fail(`请求参数验证失败: ${errorMessages}`, 400));
        return;
    }
    next();
}; 