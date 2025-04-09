import sequelize from '../config/database';
import User from './User';
import Department from './Department';
import DocType from './DocType';
import Document from './Document';
import OperationLog from './OperationLog';
import SearchCondition from './SearchCondition';
import ExportTask from './ExportTask';

// --- 定义模型关联 ---

// User <-> Department (一对多: 一个部门有多个用户)
Department.hasMany(User, { foreignKey: 'departmentId', as: 'users' });
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

// DocType <-> User (一对多: 一个用户创建多个文档类型)
User.hasMany(DocType, { foreignKey: 'createdBy', as: 'createdDocTypes' });
DocType.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Document <-> DocType (一对多: 一个文档类型对应多个文档)
DocType.hasMany(Document, { foreignKey: 'docTypeId', as: 'documents' });
Document.belongsTo(DocType, { foreignKey: 'docTypeId', as: 'docType' });

// Document <-> Department (一对多: 一个部门来源多个文档)
Department.hasMany(Document, { foreignKey: 'sourceDepartmentId', as: 'sourceDocuments' });
Document.belongsTo(Department, { foreignKey: 'sourceDepartmentId', as: 'sourceDepartment' });

// OperationLog <-> User (一对多: 一个用户产生多个操作日志)
User.hasMany(OperationLog, { foreignKey: 'userId', as: 'operationLogs' });
OperationLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// SearchCondition <-> User (一对多: 一个用户保存多个查询条件)
User.hasMany(SearchCondition, { foreignKey: 'userId', as: 'searchConditions' });
SearchCondition.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ExportTask <-> User (一对多: 一个用户创建多个导出任务)
User.hasMany(ExportTask, { foreignKey: 'userId', as: 'exportTasks' });
ExportTask.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- 导出所有模型和 Sequelize 实例 ---

export {
  sequelize,
  User,
  Department,
  DocType,
  Document,
  OperationLog,
  SearchCondition,
  ExportTask,
}; 