import { Router } from 'express';
import StatisticsController from '../controllers/StatisticsController';
import authenticateToken from '../middleware/authenticateToken'; // Assuming auth middleware exists

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: 统计报表相关接口
 */

/**
 * @swagger
 * /statistics/by-department:
 *   get:
 *     summary: 按部门统计文档数量
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NameValueData' # Reference the schema defined in types
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
    '/by-department',
    authenticateToken, // Add authentication middleware
    StatisticsController.getStatsByDepartment
);

/**
 * @swagger
 * /statistics/by-doc-type:
 *   get:
 *     summary: 按文档类型统计文档数量
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NameValueData'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
    '/by-doc-type',
    authenticateToken,
    StatisticsController.getStatsByDocType
);

export default router; 