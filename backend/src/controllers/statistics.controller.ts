import { Request, Response } from "express";
import { Op } from "sequelize";
import Document from "../models/Document";
import { NameValueData } from "@ldims/types";

/**
 * @description 获取按部门统计的文档数量
 * @param {Request} req - 请求对象，可能包含startDate和endDate查询参数
 * @param {Response} res - 响应对象
 */
export const getStatsByDepartment = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // 构建日期筛选条件
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [
          new Date(startDate as string),
          new Date(endDate as string),
        ],
      };
    }

    // 按部门分组并统计文档数量
    const stats = await Document.findAll({
      where: dateFilter,
      attributes: [
        "sourceDepartmentName",
        [
          Document.sequelize!.fn("COUNT", Document.sequelize!.col("id")),
          "count",
        ],
      ],
      group: ["sourceDepartmentName"],
      order: [
        [
          Document.sequelize!.fn("COUNT", Document.sequelize!.col("id")),
          "DESC",
        ],
      ],
    });

    // 转换为前端需要的格式
    const result: NameValueData[] = stats.map((item: any) => ({
      name: item.sourceDepartmentName,
      value: Number(item.getDataValue("count")),
    }));

    res.json(result);
  } catch (error) {
    console.error("统计部门文档数量错误:", error);
    res.status(500).json({ message: "获取部门统计数据失败" });
  }
};

/**
 * @description 获取按文档类型统计的文档数量
 * @param {Request} req - 请求对象，可能包含startDate和endDate查询参数
 * @param {Response} res - 响应对象
 */
export const getStatsByDocType = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // 构建日期筛选条件
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [
          new Date(startDate as string),
          new Date(endDate as string),
        ],
      };
    }

    // 按文档类型分组并统计文档数量
    const stats = await Document.findAll({
      where: dateFilter,
      attributes: [
        "docTypeName",
        [
          Document.sequelize!.fn("COUNT", Document.sequelize!.col("id")),
          "count",
        ],
      ],
      group: ["docTypeName"],
      order: [
        [
          Document.sequelize!.fn("COUNT", Document.sequelize!.col("id")),
          "DESC",
        ],
      ],
    });

    // 转换为前端需要的格式
    const result: NameValueData[] = stats.map((item: any) => ({
      name: item.docTypeName,
      value: Number(item.getDataValue("count")),
    }));

    res.json(result);
  } catch (error) {
    console.error("统计文档类型数量错误:", error);
    res.status(500).json({ message: "获取文档类型统计数据失败" });
  }
};
