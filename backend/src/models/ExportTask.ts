import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义 ExportTask 模型的属性接口
interface ExportTaskAttributes {
  id: number;
  userId: number;
  taskType: 'document_export' | 'document_import';
  status: number;
  fileName: string | null;
  fileType: string | null;
  queryCriteria: string | null;
  progress: number | null;
  selectedFields: string | null;
  filePath: string | null;
  errorMessage: string | null;
  exportScope: 'all' | 'selected' | 'currentPage';
  selectedIds: string | null;
  currentPageIds: string | null;
  totalRows: number | null;
  processedRows: number | null;
  successCount: number | null;
  failureCount: number | null;
  errorDetails: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// 定义创建 ExportTask 时可选的属性
interface ExportTaskCreationAttributes extends Optional<ExportTaskAttributes, 'id' | 'status' | 'fileName' | 'fileType' | 'queryCriteria' | 'progress' | 'selectedFields' | 'filePath' | 'errorMessage' | 'exportScope' | 'selectedIds' | 'currentPageIds' | 'totalRows' | 'processedRows' | 'successCount' | 'failureCount' | 'errorDetails' | 'createdAt' | 'updatedAt'> {}

// 定义 ExportTask 模型类
class ExportTask extends Model<ExportTaskAttributes, ExportTaskCreationAttributes> implements ExportTaskAttributes {
  public id!: number;
  public userId!: number;
  public taskType!: 'document_export' | 'document_import';
  public status!: number;
  public fileName!: string | null;
  public fileType!: string | null;
  public queryCriteria!: string | null;
  public progress!: number | null;
  public selectedFields!: string | null;
  public filePath!: string | null;
  public errorMessage!: string | null;
  public exportScope!: 'all' | 'selected' | 'currentPage';
  public selectedIds!: string | null;
  public currentPageIds!: string | null;
  public totalRows!: number | null;
  public processedRows!: number | null;
  public successCount!: number | null;
  public failureCount!: number | null;
  public errorDetails!: string | null;

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
      type: DataTypes.ENUM('document_export', 'document_import'),
      allowNull: false,
      defaultValue: 'document_export',
      field: 'task_type',
      comment: '任务类型: document_export, document_import',
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '状态：0-待处理，1-处理中，2-完成，3-失败',
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'file_name',
      comment: '文件名 (导入时原始文件名/导出时生成文件名)',
    },
    fileType: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'file_type',
      comment: '文件类型 (e.g., xlsx, csv)',
    },
    queryCriteria: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'query_criteria',
      comment: '导出时使用的查询条件 (JSON)',
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'progress',
      comment: '任务进度 (0-100)',
      validate: {
        min: 0,
        max: 100,
      }
    },
    selectedFields: {
      type: DataTypes.TEXT('medium'),
      allowNull: true,
      field: 'selected_fields',
      comment: '用户选择的导出字段 (JSON 数组)',
    },
    filePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'file_path',
      comment: '文件路径 (导入/导出)',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
      comment: '总体错误信息',
    },
    exportScope: {
      type: DataTypes.ENUM('all', 'selected', 'currentPage'),
      allowNull: false,
      defaultValue: 'all',
      field: 'export_scope',
      comment: '导出范围: all(根据查询条件), selected(根据选中ID), currentPage(根据当前页)',
    },
    selectedIds: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'selected_ids',
      comment: '选中项的 ID 列表 (JSON 数组)',
    },
    currentPageIds: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'currentPageIds',
      comment: '当前页的 ID 列表 (JSON 数组)',
    },
    totalRows: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'total_rows',
      comment: '导入文件总行数'
    },
    processedRows: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'processed_rows',
      comment: '已处理行数'
    },
    successCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'success_count',
      comment: '成功导入行数'
    },
    failureCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'failure_count',
      comment: '导入失败行数'
    },
    errorDetails: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'error_details',
      comment: '详细错误信息 (例如 JSON 数组 [{row: number, error: string}])'
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
    comment: '导出与导入任务表',
    indexes: [
      { fields: ['user_id'], name: 'idx_user' },
      { fields: ['status'], name: 'idx_status' },
      { fields: ['task_type'], name: 'idx_task_type' },
    ],
  }
);

export default ExportTask; 