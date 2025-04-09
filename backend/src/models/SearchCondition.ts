import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义 SearchCondition 模型的属性接口
interface SearchConditionAttributes {
  id: number;
  userId: number;
  name: string;
  conditions: object; // JSON 类型在 Sequelize 中通常用 object 或 JSON 类型表示
  isCommon: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// 定义创建 SearchCondition 时可选的属性
interface SearchConditionCreationAttributes extends Optional<SearchConditionAttributes, 'id' | 'isCommon' | 'createdAt' | 'updatedAt'> {}

// 定义 SearchCondition 模型类
class SearchCondition extends Model<SearchConditionAttributes, SearchConditionCreationAttributes> implements SearchConditionAttributes {
  public id!: number;
  public userId!: number;
  public name!: string;
  public conditions!: object;
  public isCommon!: boolean;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化 SearchCondition 模型
SearchCondition.init(
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '条件名称',
    },
    conditions: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '查询条件',
    },
    isCommon: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_common',
      comment: '是否常用',
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
    tableName: 'search_conditions',
    timestamps: true,
    underscored: true,
    comment: '查询条件表',
    indexes: [
      { fields: ['user_id'], name: 'idx_user' },
    ],
  }
);

export default SearchCondition; 