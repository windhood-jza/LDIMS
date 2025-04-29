import { DataTypes, Model, Optional, Association, ForeignKey } from "sequelize";
import sequelize from "../config/database";
import Document from "./Document"; // 引入 Document 模型

// 定义 DocumentFile 模型的属性接口
interface DocumentFileAttributes {
  id: number;
  documentId: ForeignKey<Document["id"]>; // 明确外键类型
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number; // 使用 number 替代 BIGINT
  sequence: number;
  extractedContent: string | null;
  processingStatus:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "ocr_fallback";
  createdAt?: Date;
  updatedAt?: Date;
}

// 定义创建 DocumentFile 时可选的属性
interface DocumentFileCreationAttributes
  extends Optional<
    DocumentFileAttributes,
    "id" | "extractedContent" | "createdAt" | "updatedAt"
  > {}

// 定义 DocumentFile 模型类
class DocumentFile
  extends Model<DocumentFileAttributes, DocumentFileCreationAttributes>
  implements DocumentFileAttributes
{
  public id!: number;
  public documentId!: ForeignKey<Document["id"]>;
  public fileName!: string;
  public filePath!: string;
  public fileType!: string;
  public fileSize!: number;
  public sequence!: number;
  public extractedContent!: string | null;
  public processingStatus!:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "ocr_fallback";

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联对象 (Eager loading 时填充)
  public readonly document?: Document;

  // 定义关联的静态属性
  public static associations: {
    document: Association<DocumentFile, Document>;
  };

  // 定义关联的方法
  static associate(models: any) {
    // DocumentFile belongs to Document
    DocumentFile.belongsTo(models.Document, {
      foreignKey: "documentId", // 当前模型的外键
      as: "document", // 关联的别名
      // onDelete 和 onUpdate 通常在 hasMany 端定义，或者在数据库层面由外键约束处理
    });
  }
}

// 初始化 DocumentFile 模型
DocumentFile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "document_id",
      comment: "关联的文档ID",
      references: {
        model: "documents", // 关联的表名
        key: "id", // 关联表的主键
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "file_name",
      comment: "原始文件名",
    },
    filePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "file_path",
      comment: "存储路径(相对根目录)",
    },
    fileType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "file_type",
      comment: "文件MIME类型或扩展名",
    },
    fileSize: {
      type: DataTypes.BIGINT, // 保持 BIGINT 以匹配数据库
      allowNull: false,
      field: "file_size",
      comment: "文件大小(字节)",
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "sequence",
      comment: "文件顺序索引(从0开始)",
    },
    extractedContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "extracted_content",
      comment: "提取/识别的内容",
    },
    processingStatus: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "completed",
        "failed",
        "ocr_fallback"
      ),
      allowNull: false,
      defaultValue: "pending",
      field: "processing_status",
      comment: "内容处理状态",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "document_files",
    timestamps: true,
    underscored: true, // 保持 true
    comment: "文档关联文件表",
    indexes: [
      { fields: ["document_id"] }, // 外键索引已通过定义自动创建，或在数据库层面创建
      { fields: ["document_id", "sequence"], name: "idx_document_id_sequence" }, // 联合索引用于排序
    ],
    // DocumentFile 不需要 paranoid，它的生命周期应随 Document (如果需要软删，由 Document 的删除决定)
  }
);

export default DocumentFile;
