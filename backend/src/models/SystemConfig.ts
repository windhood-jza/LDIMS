import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * @interface SystemConfigAttributes
 * @description 系统配置模型的属性接口
 */
interface SystemConfigAttributes {
  id: number;
  configKey: string; // 配置键名 (e.g., 'db_host', 'api_base_url')
  configValue: string; // 配置值
  description: string | null; // 配置项描述
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * @interface SystemConfigCreationAttributes
 * @description 创建系统配置时可选的属性
 */
interface SystemConfigCreationAttributes extends Optional<SystemConfigAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

/**
 * @class SystemConfig
 * @extends Model<SystemConfigAttributes, SystemConfigCreationAttributes>
 * @implements SystemConfigAttributes
 * @description 系统配置模型类
 */
class SystemConfig extends Model<SystemConfigAttributes, SystemConfigCreationAttributes> implements SystemConfigAttributes {
  public id!: number;
  public configKey!: string;
  public configValue!: string;
  public description!: string | null;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化 SystemConfig 模型
SystemConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    configKey: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true, // 配置键应该是唯一的
      field: 'config_key',
      comment: '配置键名',
    },
    configValue: {
      type: DataTypes.TEXT, // 使用 TEXT 类型以存储可能较长的配置值
      allowNull: false,
      field: 'config_value',
      comment: '配置值',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '配置项描述',
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'system_configs',
    timestamps: true, // 启用 createdAt 和 updatedAt
    underscored: true, // 字段名使用下划线
    comment: '系统配置表',
    indexes: [
        { unique: true, fields: ['config_key'], name: 'idx_config_key' }, // 唯一索引
    ],
  }
);

export default SystemConfig; 