// LDIMS/backend/src/controllers/SystemController.ts
import { Request, Response, NextFunction } from "express";
import {
  SystemConfigService,
  SystemConfigMap,
} from "../services/SystemConfigService";
import { OperationLogService } from "../services/OperationLogService";
import { OperationLogQuery } from "@ldims/types";
import { success } from "../utils/response"; // 假设有统一的成功响应工具
import { validateRequest } from "../middleware/validation"; // 假设有请求验证中间件
import { body, query } from "express-validator"; // 用于请求验证
import { clearCachedStoragePaths } from "../config/storage"; // **新增**: 导入清除缓存函数

// --- Controller for System Configuration and Logs ---

export class SystemController {
  private systemConfigService: SystemConfigService;
  private operationLogService: OperationLogService;

  constructor() {
    this.systemConfigService = new SystemConfigService();
    this.operationLogService = new OperationLogService();
    // 绑定 this 以确保在路由处理函数中能正确访问 service
    this.getAllConfigs = this.getAllConfigs.bind(this);
    this.updateConfigs = this.updateConfigs.bind(this);
    this.getDbStatus = this.getDbStatus.bind(this);
    this.getLogs = this.getLogs.bind(this);
  }

  // --- System Config Methods ---

  /**
   * @route GET /api/v1/system/config
   * @description 获取所有系统配置
   */
  async getAllConfigs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const configs = await this.systemConfigService.getAllConfigs();
      res.json(success(configs));
    } catch (error) {
      next(error); // 交给错误处理中间件
    }
  }

  /**
   * @route PUT /api/v1/system/config
   * @description 更新系统配置 (需要管理员权限)
   */
  async updateConfigs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // req.body 应该是一个键值对对象，例如 { 'db_host': 'new_host', 'log_retention_days': '180' }
      const configsToUpdate: SystemConfigMap = req.body;
      // 这里可以添加更严格的验证，例如只允许更新特定的键
      if (
        typeof configsToUpdate !== "object" ||
        configsToUpdate === null ||
        Array.isArray(configsToUpdate)
      ) {
        return next(new Error("请求体必须是配置键值对对象"));
      }
      await this.systemConfigService.updateConfigs(configsToUpdate);

      // **新增逻辑: 如果更新了文件存储路径，清除缓存**
      if (configsToUpdate.hasOwnProperty("FILE_STORAGE_PATH")) {
        console.log(
          "[SystemController] FILE_STORAGE_PATH updated, clearing cache."
        );
        clearCachedStoragePaths(); // 调用清除缓存函数
      }

      res.json(success(null, "系统配置更新成功"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/v1/system/db-status
   * @description 获取数据库连接状态
   */
  async getDbStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const status = await this.systemConfigService.getDbStatus();
      res.json(success(status));
    } catch (error) {
      next(error);
    }
  }

  // --- Operation Log Methods ---

  /**
   * @route GET /api/v1/system/logs
   * @description 查询操作日志 (分页、筛选)
   */
  async getLogs(
    req: Request<{}, {}, {}, OperationLogQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 从 req.query 获取查询参数，类型已通过泛型指定
      const queryParams: OperationLogQuery = {
        page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
        pageSize: req.query.pageSize
          ? parseInt(String(req.query.pageSize), 10)
          : undefined,
        userId: req.query.userId,
        operationType: req.query.operationType,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortField: req.query.sortField,
        sortOrder: req.query.sortOrder,
      };

      // 验证分页参数
      if (queryParams.page !== undefined && isNaN(queryParams.page)) {
        return next(new Error("页码必须是数字"));
      }
      if (queryParams.pageSize !== undefined && isNaN(queryParams.pageSize)) {
        return next(new Error("页面大小必须是数字"));
      }

      const result = await this.operationLogService.list(queryParams);
      res.json(success(result));
    } catch (error) {
      next(error);
    }
  }
}

// --- Validation Rules ---

export const updateConfigsValidation = [
  body().isObject().withMessage("请求体必须是对象"),
  // 可以添加更具体的验证规则，例如检查特定 key 的 value 类型
  // body('log_retention_days').optional().isInt({ min: 0 }).withMessage('日志保留天数必须是非负整数'),
  validateRequest, // 应用验证规则
];

export const getLogsValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("页码必须是正整数"),
  query("pageSize")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("页面大小必须在 1 到 100 之间"),
  query("userId").optional().isString().trim().escape(),
  query("operationType").optional().isString().trim().escape(),
  query("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("开始日期格式无效"),
  query("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("结束日期格式无效")
    .custom((value, { req }) => {
      if (req.query?.startDate && value < req.query.startDate) {
        throw new Error("结束日期不能早于开始日期");
      }
      return true;
    }),
  query("sortField")
    .optional()
    .isIn(["createdAt", "userId", "operationType", "username"])
    .withMessage("无效的排序字段"),
  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("排序顺序必须是 ASC 或 DESC"),
  validateRequest,
];
