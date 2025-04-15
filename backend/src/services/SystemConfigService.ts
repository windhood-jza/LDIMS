// LDIMS/backend/src/services/SystemConfigService.ts
import SystemConfig from '../models/SystemConfig';
import sequelize, { testConnection, isConnected } from '../config/database'; // 导入 sequelize 实例和测试函数
import { Transaction } from 'sequelize';

/**
 * @description 系统配置项键值对
 */
export type SystemConfigMap = Record<string, string>;

/**
 * @class SystemConfigService
 * @description 提供系统配置管理和数据库状态检查的服务
 */
export class SystemConfigService {

    /**
     * @description 获取所有系统配置项
     * @returns {Promise<SystemConfigMap>} 返回键值对形式的配置
     */
    async getAllConfigs(): Promise<SystemConfigMap> {
        try {
            const configs = await SystemConfig.findAll({
                attributes: ['configKey', 'configValue']
            });
            const configMap: SystemConfigMap = {};
            configs.forEach((config: SystemConfig) => {
                configMap[config.configKey] = config.configValue;
            });
            console.debug('[SystemConfigService] Fetched all configs:', configMap);
            return configMap;
        } catch (error: any) {
            console.error('[SystemConfigService] Error fetching all configs:', error);
            throw new Error(`获取系统配置失败: ${error.message}`);
        }
    }

    /**
     * @description 批量更新系统配置项
     * @param {SystemConfigMap} configsToUpdate - 需要更新的配置键值对
     * @returns {Promise<void>}
     * @throws {Error} 如果更新过程中发生错误
     */
    async updateConfigs(configsToUpdate: SystemConfigMap): Promise<void> {
        console.debug('[SystemConfigService] Updating configs:', configsToUpdate);
        const transaction: Transaction = await sequelize.transaction();
        try {
            for (const key in configsToUpdate) {
                if (Object.prototype.hasOwnProperty.call(configsToUpdate, key)) {
                    const value = configsToUpdate[key];
                    // 使用 findOne + update 或 findOrCreate + update 的模式
                    // 这里简化为直接 update，假设 key 总是存在 (通过种子数据或 UI 控制)
                    const [affectedRows] = await SystemConfig.update(
                        { configValue: value },
                        { where: { configKey: key }, transaction }
                    );
                    if (affectedRows === 0) {
                         // 如果没有更新任何行，可能意味着该键不存在，可以考虑创建或抛出错误
                         // 为了简化，我们先假设键总是存在
                         console.warn(`[SystemConfigService] Config key '${key}' not found during update.`);
                         // 或者可以选择创建它:
                         // await SystemConfig.create({ configKey: key, configValue: value }, { transaction });
                         // 这里我们选择继续，允许部分更新成功
                    }
                }
            }
            await transaction.commit();
            console.debug('[SystemConfigService] Configs updated successfully.');
        } catch (error: any) {
            await transaction.rollback();
            console.error('[SystemConfigService] Error updating configs:', error);
            throw new Error(`更新系统配置失败: ${error.message}`);
        }
    }

     /**
     * @description 获取当前数据库连接状态
     * @returns {Promise<{ connected: boolean; message: string }>} 返回连接状态和消息
     */
    async getDbStatus(): Promise<{ connected: boolean; message: string }> {
        try {
             console.debug('[SystemConfigService] Checking DB status...');
            // 尝试重新执行连接测试，获取最新状态
            const connected = await testConnection();
            const message = connected ? '数据库连接成功' : '数据库连接失败';
            console.debug(`[SystemConfigService] DB Status: ${message}`);
            return { connected, message };
        } catch (error: any) {
             // testConnection 内部会处理错误日志，这里直接返回失败状态
             console.error('[SystemConfigService] Error during DB status check:', error);
            return { connected: false, message: `检查数据库连接时出错: ${error.message}` };
        }
    }
}

// 导出单例 (如果需要)
// export const systemConfigService = new SystemConfigService(); 