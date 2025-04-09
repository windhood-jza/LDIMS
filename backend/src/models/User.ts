import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义 User 模型的属性接口
interface UserAttributes {
  id: number;
  username: string;
  password: string;
  realName: string;
  role: 'admin' | 'editor' | 'viewer';
  departmentId: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 定义创建 User 时可选的属性 (id, createdAt, updatedAt 会自动生成)
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// 定义 User 模型类
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public role!: 'admin' | 'editor' | 'viewer';
  public departmentId!: number;
  public status!: number;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化 User 模型
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名',
    },
    password: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '密码',
    },
    realName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'real_name', // 映射到数据库的 snake_case 字段名
      comment: '真实姓名',
    },
    role: {
      type: DataTypes.ENUM('admin', 'editor', 'viewer'),
      allowNull: false,
      comment: '用户角色',
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'department_id', // 映射
      comment: '所属部门ID',
      // 注意：外键关联将在模型关联部分定义
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
      field: 'created_at', // 映射
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at', // 映射
    },
  },
  {
    sequelize,
    tableName: 'users', // 明确指定表名
    timestamps: true, // 启用时间戳 (createdAt, updatedAt)
    underscored: true, // 使用 snake_case 命名法 (如 created_at)
    comment: '用户表', // 表注释
    indexes: [
      { unique: false, fields: ['department_id'], name: 'idx_department' },
      { unique: true, fields: ['username'], name: 'idx_username' },
    ],
  }
);

export default User; 