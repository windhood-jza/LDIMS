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
   * @param {Request} req - Express 请求对象，可能包含日期范围参数
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - Express next 中间件函数
   */
  async getStatsByDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      // 提取日期参数
      const dateParams = startDate && endDate ? {
        startDate: startDate as string,
        endDate: endDate as string
      } : undefined;
      
      console.log('[StatisticsController] getStatsByDepartment with dateParams:', dateParams);
      
      const data = await StatisticsService.getStatsByDepartment(dateParams);
      res.status(200).json(success(data));
    } catch (error) {
      next(error); // 将错误传递给错误处理中间件
    }
  }

  /**
   * @description 获取按文档类型统计的数据
   * @param {Request} req - Express 请求对象，可能包含日期范围参数
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - Express next 中间件函数
   */
  async getStatsByDocType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      // 提取日期参数
      const dateParams = startDate && endDate ? {
        startDate: startDate as string,
        endDate: endDate as string
      } : undefined;
      
      console.log('[StatisticsController] getStatsByDocType with dateParams:', dateParams);
      
      const data = await StatisticsService.getStatsByDocType(dateParams);
      res.status(200).json(success(data));
    } catch (error) {
      next(error);
    }
  }
}

export default new StatisticsController(); 