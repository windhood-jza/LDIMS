import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义 ExportTask 模型的属性接口
interface ExportTaskAttributes {
  id: number;
  userId: number;
  taskType: string;
  status: number;
  filePath: string | null;
  errorMessage: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// 定义创建 ExportTask 时可选的属性
interface ExportTaskCreationAttributes extends Optional<ExportTaskAttributes, 'id' | 'status' | 'filePath' | 'errorMessage' | 'createdAt' | 'updatedAt'> {}

// 定义 ExportTask 模型类
class ExportTask extends Model<ExportTaskAttributes, ExportTaskCreationAttributes> implements ExportTaskAttributes {
  public id!: number;
  public userId!: number;
  public taskType!: string;
  public status!: number;
  public filePath!: string | null;
  public errorMessage!: string | null;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化 ExportTask 模型
ExportTask.init(
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
      comment: '用户ID',
      // 外键关联将在模型关联部分定义
    },
    taskType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'task_type',
      comment: '任务类型：文档导出/报表导出',
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '状态：0-待处理，1-处理中，2-完成，3-失败',
    },
    filePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'file_path',
      comment: '文件路径',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
      comment: '错误信息',
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
    tableName: 'export_tasks',
    timestamps: true,
    underscored: true,
    comment: '导出任务表',
    indexes: [
      { fields: ['user_id'], name: 'idx_user' },
      { fields: ['status'], name: 'idx_status' },
    ],
  }
);

export default ExportTask; 