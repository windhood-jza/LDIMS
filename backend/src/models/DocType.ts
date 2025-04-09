import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义 DocType 模型的属性接口
interface DocTypeAttributes {
  id: number;
  name: string;
  parentId: number;
  level: number;
  sortOrder: number;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null; // 修改: 允许 null
}

// 定义创建 DocType 时可选的属性
interface DocTypeCreationAttributes extends Optional<DocTypeAttributes, 'id' | 'parentId' | 'sortOrder' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

// 定义 DocType 模型类
class DocType extends Model<DocTypeAttributes, DocTypeCreationAttributes> implements DocTypeAttributes {
  public id!: number;
  public name!: string;
  public parentId!: number;
  public level!: number;
  public sortOrder!: number;
  public createdBy!: number;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null; // 由 paranoid 模式管理
}

// 初始化 DocType 模型
DocType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '类型名称',
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'parent_id',
      comment: '父级ID，顶级为0',
    },
    level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '层级：1-一级，2-二级，3-三级',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
      comment: '排序号',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by',
      comment: '创建人ID',
      // 注意：外键关联将在模型关联部分定义
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
    // 显式定义 deletedAt 字段及其数据库映射
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deletedAt' // 明确数据库列名
    }
  },
  {
    sequelize,
    tableName: 'doc_types',
    timestamps: true,
    underscored: false,
    comment: '文档类型表',
    indexes: [
      { unique: false, fields: ['parent_id'], name: 'idx_parent' },
      { unique: false, fields: ['level'], name: 'idx_level' },
    ],
    paranoid: true,
    deletedAt: 'deletedAt' // 保留
  }
);

export default DocType; 