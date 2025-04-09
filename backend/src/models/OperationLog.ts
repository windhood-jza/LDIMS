import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义 OperationLog 模型的属性接口
interface OperationLogAttributes {
  id: number;
  userId: number;
  operationType: string;
  operationContent: string;
  ipAddress: string;
  createdAt?: Date;
}

// 定义创建 OperationLog 时可选的属性 (id, createdAt 会自动生成)
interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt'> {}

// 定义 OperationLog 模型类
class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public userId!: number;
  public operationType!: string;
  public operationContent!: string;
  public ipAddress!: string;

  // 时间戳
  public readonly createdAt!: Date;
}

// 初始化 OperationLog 模型
OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      comment: '操作用户ID',
      // 外键关联将在模型关联部分定义
    },
    operationType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'operation_type',
      comment: '操作类型',
    },
    operationContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'operation_content',
      comment: '操作内容',
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'ip_address',
      comment: 'IP地址',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'operation_logs',
    timestamps: true, // 启用 createdAt
    updatedAt: false, // 禁用 updatedAt (日志通常不更新)
    underscored: true,
    comment: '操作日志表',
    indexes: [
      { fields: ['user_id'], name: 'idx_user' },
      { fields: ['created_at'], name: 'idx_created_at' },
    ],
  }
);

export default OperationLog; 