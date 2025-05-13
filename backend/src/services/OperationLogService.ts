import { Op, WhereOptions, Order } from "sequelize";
import { OperationLog, User } from "../models"; // 导入 OperationLog 和 User 模型
import { PageResult } from "../utils/response"; // 假设有分页结果类型
import { format } from "date-fns"; // 用于格式化日期
import { Request } from "express";
import sequelize from "sequelize";

// 导入枚举和类型
import {
  OperationLogQuery,
  OperationLogInfo,
  OperationType,
  OperationTypeNames,
} from "@ldims/types";

/**
 * @class OperationLogService
 * @description 提供操作日志查询的服务
 */
export class OperationLogService {
  /**
   * @description 查询操作日志列表 (分页、筛选、排序)
   * @param {OperationLogQuery} query - 查询参数
   * @returns {Promise<PageResult<OperationLogInfo>>} 返回分页的操作日志列表
   */
  async list(query: OperationLogQuery): Promise<PageResult<OperationLogInfo>> {
    console.debug(
      "[OperationLogService] list called with query:",
      JSON.stringify(query)
    );

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const where: WhereOptions<OperationLog> = {};
    let userFilterCondition: WhereOptions<User> | undefined = undefined;

    // 用户筛选 (可以是 ID 或模糊用户名)
    if (query.userId) {
      const userIdNum = parseInt(String(query.userId), 10);
      if (!isNaN(userIdNum)) {
        where.userId = userIdNum; // 精确匹配用户ID
      } else {
        // 只根据 realName 进行大小写不敏感的模糊匹配
        // 直接构造 User 模型的 where 条件
        userFilterCondition = {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("LOWER", sequelize.col("user.real_name")), // 使用实际的数据库列名 real_name
              Op.like,
              "%" + String(query.userId).toLowerCase() + "%" // 将查询字符串转为小写并添加 %%
            ),
          ],
        };
      }
    }

    // 操作类型筛选 (精确匹配)
    if (query.operationType) {
      // 检查是否是有效的枚举值，如果是则精确匹配
      if (
        Object.values(OperationType).includes(
          query.operationType as OperationType
        )
      ) {
        where.operationType = query.operationType;
      } else {
        // 否则进行模糊匹配
        where.operationType = { [Op.like]: `%${query.operationType}%` };
      }
    }

    // 日期范围筛选
    if (query.startDate && query.endDate) {
      where.createdAt = {
        [Op.between]: [
          `${query.startDate} 00:00:00`,
          `${query.endDate} 23:59:59`,
        ],
      };
    } else if (query.startDate) {
      where.createdAt = { [Op.gte]: `${query.startDate} 00:00:00` };
    } else if (query.endDate) {
      where.createdAt = { [Op.lte]: `${query.endDate} 23:59:59` };
    }

    // 排序
    let order: Order = [["createdAt", "DESC"]]; // 默认按创建时间降序
    if (
      query.sortField &&
      ["createdAt", "userId", "operationType"].includes(query.sortField)
    ) {
      // 确保排序字段安全
      order = [[query.sortField, query.sortOrder === "ASC" ? "ASC" : "DESC"]];
      // 如果按用户名排序，需要特殊处理
      if (query.sortField === "username") {
        order = [
          [
            { model: User, as: "user" },
            "username",
            query.sortOrder === "ASC" ? "ASC" : "DESC",
          ],
        ];
      }
    }

    console.debug(
      "[OperationLogService] Constructed WHERE clause:",
      JSON.stringify(where)
    );
    console.debug(
      "[OperationLogService] Constructed User Filter Condition:",
      JSON.stringify(userFilterCondition)
    );
    console.debug(
      "[OperationLogService] Constructed ORDER clause:",
      JSON.stringify(order)
    );

    try {
      const { count, rows } = await OperationLog.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["username", "realName"],
            where: userFilterCondition,
            required: !!userFilterCondition,
          },
        ],
        order,
        limit,
        offset,
        distinct: true, // 配合 include 使用，确保 count 准确
      });

      console.debug(`[OperationLogService] Found ${count} logs.`);

      const list: OperationLogInfo[] = rows.map((log) =>
        this.formatLogInfo(log)
      );

      return {
        list,
        total: count,
        page,
        pageSize,
      };
    } catch (error: any) {
      console.error("[OperationLogService] Error listing logs:", error);
      throw new Error(`查询操作日志失败: ${error.message}`);
    }
  }

  /**
   * @description 格式化日志信息，添加用户名和真实姓名并格式化时间
   * @param {OperationLog} log - Sequelize OperationLog 实例
   * @returns {OperationLogInfo}
   */
  private formatLogInfo(log: OperationLog): OperationLogInfo {
    // --- BEGIN DEBUGGING ---
    console.log(`[DEBUG OperationLogService] Formatting log ID: ${log.id}`);
    console.log(
      `[DEBUG OperationLogService] Raw log.operationContent:`,
      log.operationContent
    );
    if (log.operationContent && typeof log.operationContent === "string") {
      const rawContentBuffer = Buffer.from(log.operationContent, "utf8"); // Assume it SHOULD be utf8
      console.log(
        `[DEBUG OperationLogService] log.operationContent as UTF8 Buffer (hex):`,
        rawContentBuffer.toString("hex")
      );

      // Attempt to see if it was mis-interpreted as latin1 when it was actually utf8
      const fromLatin1ToUtf8 = Buffer.from(
        log.operationContent,
        "latin1"
      ).toString("utf8");
      console.log(
        `[DEBUG OperationLogService] log.operationContent (interpreted as latin1 then to utf8):`,
        fromLatin1ToUtf8
      );

      // Attempt to see if it's double encoded (e.g. UTF8 bytes interpreted as a string, then that string re-encoded to UTF8)
      // This is less common for this specific乱码 pattern but good to check.
      // First, assume log.operationContent is a string that *represents* UTF-8 bytes that were mis-read as (e.g.) latin1
      // So, get the presumed original bytes by treating the string as latin1
      const presumedOriginalUtf8Bytes = Buffer.from(
        log.operationContent,
        "latin1"
      );
      // Then, try to interpret those bytes as a UTF-8 string
      const interpretAsUtf8 = presumedOriginalUtf8Bytes.toString("utf8");
      console.log(
        `[DEBUG OperationLogService] log.operationContent (Buffer from latin1 -> toString utf8):`,
        interpretAsUtf8
      );
    } else {
      console.log(
        `[DEBUG OperationLogService] log.operationContent is null or not a string.`
      );
    }
    // --- END DEBUGGING ---

    return {
      id: log.id,
      userId: log.userId,
      // @ts-ignore - User 可能不在每个 log 上，如果不是内连接
      username: log.user?.username || null,
      // @ts-ignore - 真实姓名
      realName: log.user?.realName || null,
      operationType: log.operationType,
      operationContent: log.operationContent,
      ipAddress: log.ipAddress,
      createdAt: format(log.createdAt, "yyyy-MM-dd HH:mm:ss"), // 格式化时间
    };
  }

  /**
   * 创建操作日志
   * @param userId 操作用户ID
   * @param operationType 操作类型 (使用 OperationType 枚举)
   * @param operationContent 操作内容
   * @param ipAddress IP地址
   */
  public static async createLog(
    userId: number,
    operationType: OperationType,
    operationContent: string,
    ipAddress: string
  ): Promise<void> {
    console.log("[OperationLogService.createLog] Attempting to create log..."); // 确认方法调用
    console.log(
      `[OperationLogService.createLog] Data: userId=${userId}, type=${operationType}, content=${operationContent}, ip=${ipAddress}`
    ); // 打印数据
    try {
      await OperationLog.create({
        userId,
        operationType,
        operationContent,
        ipAddress,
      });
      console.log(
        "[OperationLogService.createLog] Log creation call completed successfully."
      ); // 确认调用完成
    } catch (error) {
      console.error(
        "[OperationLogService.createLog] Error creating operation log:",
        error
      ); // 修改错误日志前缀以区分
      // 日志创建失败不应影响主要业务流程
    }
  }

  /**
   * 获取用户真实姓名
   * @param userId 用户ID
   * @returns 真实姓名或null
   */
  private static async getUserRealName(userId: number): Promise<string | null> {
    try {
      const user = await User.findByPk(userId, {
        attributes: ["realName"],
      });
      return user?.realName || null;
    } catch (error) {
      console.error("获取用户真实姓名失败:", error);
      return null;
    }
  }

  /**
   * 从请求对象创建操作日志的便捷方法
   * @param req Express请求对象
   * @param operationType 操作类型 (使用 OperationType 枚举)
   * @param operationContent 操作内容
   */
  public static async logFromRequest(
    req: Request,
    operationType: OperationType,
    operationContent: string
  ): Promise<void> {
    console.log("--- logFromRequest called ---"); // 标识方法被调用
    console.log("req.user:", JSON.stringify(req.user)); // 打印 req.user 内容
    const userId = (req.user as any)?.id;
    if (!userId) {
      console.warn("[OperationLogService] 无法记录日志: 请求中未找到用户ID");
      return;
    }

    const ipAddress =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      "未知IP";

    await OperationLogService.createLog(
      userId,
      operationType,
      operationContent,
      ipAddress
    );
  }

  /**
   * 记录用户操作详细内容（包含变更前后的数据）
   * @param req Express请求对象
   * @param operationType 操作类型
   * @param targetId 目标对象ID
   * @param targetName 目标对象名称
   * @param details 变更详情对象
   */
  public static async logDetailedChange(
    req: Request,
    operationType: OperationType,
    targetId: number,
    targetName: string,
    details?: Record<string, { before: any; after: any }>
  ): Promise<void> {
    // 目标真实姓名
    let targetRealName = targetName;

    // 如果是用户相关操作，获取真实姓名
    if (
      operationType === OperationType.USER_UPDATE ||
      operationType === OperationType.USER_ENABLE ||
      operationType === OperationType.USER_DISABLE ||
      operationType === OperationType.PASSWORD_RESET
    ) {
      try {
        const realName = await this.getUserRealName(targetId);
        if (realName) {
          targetRealName = realName;
        }
      } catch (error) {
        console.error("获取目标用户真实姓名失败:", error);
      }
    }

    // 构建基本内容
    let content = `${OperationTypeNames[operationType]}：${targetRealName}(ID: ${targetId})`;

    // 如果有详细变更信息，添加到内容中
    if (details && Object.keys(details).length > 0) {
      const changeDetails = Object.entries(details)
        .filter(([_, { before, after }]) => before !== after) // 只记录有变化的字段
        .map(([field, { before, after }]) => {
          // 对于密码字段，不显示具体值
          if (field === "password") {
            return `${field}: ******`;
          }
          return `${field}: ${before} → ${after}`;
        })
        .join("，");

      if (changeDetails) {
        content += `，变更：${changeDetails}`;
      }
    }

    await OperationLogService.logFromRequest(req, operationType, content);
  }
}

// 导出单例 (如果需要)
// export const operationLogService = new OperationLogService();
