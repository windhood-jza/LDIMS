import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义 Document 模型的属性接口
interface DocumentAttributes {
  id: number;
  docName: string;
  docTypeName: string | null;
  sourceDepartmentName: string | null;
  submitter: string;
  receiver: string;
  signer: string | null;
  storageLocation: string | null;
  remarks: string | null;
  handoverDate: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// 定义创建 Document 时可选的属性
interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'signer' | 'storageLocation' | 'remarks' | 'handoverDate' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'docTypeName' | 'sourceDepartmentName'> {}

// 定义 Document 模型类
class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id!: number;
  public docName!: string;
  public docTypeName!: string | null;
  public sourceDepartmentName!: string | null;
  public submitter!: string;
  public receiver!: string;
  public signer!: string | null;
  public storageLocation!: string | null;
  public remarks!: string | null;
  public handoverDate!: Date | null;
  public createdBy!: string | null;
  public updatedBy!: string | null;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

// 初始化 Document 模型
Document.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    docName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'doc_name',
      comment: '文档名称',
    },
    docTypeName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'doc_type_name',
      comment: '文档类型名称',
    },
    sourceDepartmentName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'source_department_name',
      comment: '来源部门名称',
    },
    submitter: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '提交人',
    },
    receiver: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '接收人',
    },
    signer: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '落款人, 允许为空',
    },
    storageLocation: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'storage_location',
      comment: '保管位置',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注说明',
    },
    handoverDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'handover_date',
      comment: '交接日期, 允许为空',
    },
    createdBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'created_by',
      comment: '创建人姓名, 允许为空',
    },
    updatedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'updated_by',
      comment: '最后修改人姓名, 允许为空',
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
    tableName: 'documents',
    timestamps: true,
    underscored: false,
    comment: '文档信息表',
    indexes: [
      { fields: ['handover_date'], name: 'idx_handover_date' },
      { fields: ['doc_name'], name: 'idx_doc_name' },
      { fields: ['doc_type_name'], name: 'idx_doc_type_name' },
      { fields: ['source_department_name'], name: 'idx_source_department_name' },
    ],
    paranoid: true,
    deletedAt: 'deletedAt'
  }
);

export default Document; 