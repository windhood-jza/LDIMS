import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database'; // 确认路径正确

// 属性接口 (保持 camelCase)
interface ExportTaskAttributes {
  id: number;
  userId: number;
  taskType: 'document_export' | 'document_import';
  status: 0 | 1 | 2 | 3;
  originalFileName: string | null; // camelCase in model and DB
  fileName: string | null;
  fileType: string | null;
  filePath: string | null;
  progress: number | null;
  totalRows: number | null;
  processedRows: number | null;
  successCount: number | null;
  failureCount: number | null;
  errorDetails: string | null;
  errorMessage: string | null;
  queryCriteria: string | null;
  selectedFields: string | null;
  exportScope: 'all' | 'selected' | 'currentPage' | null;
  selectedIds: string | null;
  currentPageIds: number[] | null; // <-- 确保类型是 number[] | null
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建接口
interface ExportTaskCreationAttributes extends Optional<ExportTaskAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// 模型类 (保持 camelCase)
class ExportTask extends Model<ExportTaskAttributes, ExportTaskCreationAttributes> implements ExportTaskAttributes {
  public id!: number;
  public userId!: number;
  public taskType!: 'document_export' | 'document_import';
  public status!: 0 | 1 | 2 | 3;
  public originalFileName!: string | null;
  public fileName!: string | null;
  public fileType!: string | null;
  public filePath!: string | null;
  public progress!: number | null;
  public totalRows!: number | null;
  public processedRows!: number | null;
  public successCount!: number | null;
  public failureCount!: number | null;
  public errorDetails!: string | null;
  public errorMessage!: string | null;
  public queryCriteria!: string | null;
  public selectedFields!: string | null;
  public exportScope!: 'all' | 'selected' | 'currentPage' | null;
  public selectedIds!: string | null;
  public currentPageIds!: number[] | null; // <-- 确保类型是 number[] | null

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型定义
ExportTask.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    // userId -> user_id (underscored: true 会自动处理)
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '发起任务的用户ID',
    },
    // taskType -> task_type
    taskType: {
      type: DataTypes.ENUM('document_export', 'document_import'),
      allowNull: false,
      comment: '任务类型',
    },
    status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '任务状态 (0:排队中, 1:处理中, 2:已完成, 3:失败)',
    },
    // originalFileName -> originalFileName (显式指定 field)
    originalFileName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'originalFileName', // <-- 显式指定数据库列名
      comment: '导入任务的原始文件名',
    },
    // fileName -> file_name
    fileName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '导出任务生成的文件名',
    },
    // fileType -> file_type
    fileType: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '文件类型 (xlsx, csv)',
    },
    // filePath -> file_path
    filePath: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '服务器上的文件路径或安全文件名',
    },
    progress: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
    },
    // totalRows -> total_rows
    totalRows: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '导入任务的总行数',
    },
    // processedRows -> processed_rows
    processedRows: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '导入任务已处理的行数',
    },
    // successCount -> success_count
    successCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '导入任务成功的行数',
    },
    // failureCount -> failure_count
    failureCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '导入任务失败的行数',
    },
    // errorDetails -> error_details
    errorDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '导入任务详细错误信息 (JSON)',
    },
    // errorMessage -> error_message
     errorMessage: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '任务失败时的总体错误消息',
    },
    // queryCriteria -> query_criteria
    queryCriteria: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '导出任务的查询条件 (JSON)',
    },
    // selectedFields -> selected_fields
    selectedFields: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '导出任务选择的字段 (JSON array)',
    },
    // exportScope -> export_scope (根据你的截图调整)
    exportScope: {
      type: DataTypes.ENUM('all', 'selected', 'currentPage'),
      allowNull: true,
      field: 'export_Scope', // <-- 显式指定数据库列名 (根据截图调整)
      comment: '导出范围',
    },
    // selectedIds -> selected_ids
    selectedIds: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '导出选中的 ID 列表 (JSON array)',
    },
    // currentPageIds -> currentPageIds (显式指定 field)
    currentPageIds: {
      type: DataTypes.JSON, // <-- 修改为 DataTypes.JSON
      allowNull: true,
      field: 'currentPageIds', // <-- 显式指定数据库列名
      comment: '导出当前页的 ID 列表 (JSON 数组)',
    },
    // createdAt -> created_at
    // updatedAt -> updated_at
  },
  {
    tableName: 'export_tasks', // 确认表名正确
    sequelize,
    timestamps: true, // 启用时间戳
    underscored: true, // <--- 设置为 true 以匹配 snake_case
    modelName: 'ExportTask',
  }
);

export default ExportTask;