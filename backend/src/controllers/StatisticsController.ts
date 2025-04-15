import { Request, Response, NextFunction } from 'express';
import StatisticsService from '../services/StatisticsService';
import { success } from '../utils/response';

/**
 * @class StatisticsController
 * @description 处理统计相关的 API 请求
 */
class StatisticsController {

  /**
   * @description 获取按部门统计的数据
   * @param {Request} _req - Express 请求对象 (未使用)
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - Express next 中间件函数
   */
  async getStatsByDepartment(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await StatisticsService.getStatsByDepartment();
      res.status(200).json(success(data));
    } catch (error) {
      next(error); // 将错误传递给错误处理中间件
    }
  }

  /**
   * @description 获取按文档类型统计的数据
   * @param {Request} _req - Express 请求对象 (未使用)
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - Express next 中间件函数
   */
  async getStatsByDocType(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await StatisticsService.getStatsByDocType();
      res.status(200).json(success(data));
    } catch (error) {
      next(error);
    }
  }
}

export default new StatisticsController(); 