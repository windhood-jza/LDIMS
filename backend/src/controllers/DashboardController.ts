// LDIMS/backend/src/controllers/DashboardController.ts
import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService';
import { success } from '../utils/response'; // 假设有统一的成功响应工具

export class DashboardController {
    // private dashboardService: DashboardService; // 不再需要实例化

    constructor() {
        // this.dashboardService = new DashboardService(); // 不再需要实例化
        // 绑定 this (如果 getSummary 保持为实例方法，则需要，但调用静态方法不需要实例，所以 getSummary 方法本身可以考虑改为静态，或者保留bind)
        // 如果 getSummary 保持为实例方法，则绑定仍有意义，确保 Express 路由调用时 this 指向正确。暂时保留。
        this.getSummary = this.getSummary.bind(this);
    }

    /**
     * @route GET /api/v1/dashboard/summary
     * @description 获取仪表盘汇总数据
     */
    async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.debug('[DashboardController] Request received for dashboard summary.');
        try {
            //直接调用静态方法
            const summaryData = await DashboardService.getSummaryData();
            console.debug('[DashboardController] Summary data fetched successfully.');
            res.json(success(summaryData));
        } catch (error) {
            console.error('[DashboardController] Error fetching summary data:', error);
            next(error); // 交给全局错误处理中间件
        }
    }
} 