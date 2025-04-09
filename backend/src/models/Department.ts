import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义 Department 模型的属性接口
interface DepartmentAttributes {
  id: number;
  name: string;
  code: string;
  parentId: number;
  level: number;
  sortOrder: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// 定义创建 Department 时可选的属性
interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, 'id' | 'parentId' | 'sortOrder' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

// 定义 Department 模型类
class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes> implements DepartmentAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId!: number;
  public level!: number;
  public sortOrder!: number;
  public status!: number;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

// 初始化 Department 模型
Department.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '部门名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '部门编码',
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'parent_id',
      comment: '父级部门ID，顶级为0',
    },
    level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '层级：1-一级部门，2-二级部门',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
      comment: '排序号',
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态: 1-启用, 0-禁用',
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deletedAt'
    }
  },
  {
    sequelize,
    tableName: 'departments',
    timestamps: true,
    underscored: false,
    comment: '部门表',
    indexes: [
      { unique: false, fields: ['parent_id'], name: 'idx_parent' },
      { unique: true, fields: ['code'], name: 'idx_code' },
    ],
    paranoid: true,
    deletedAt: 'deletedAt'
  }
);

export default Department; 