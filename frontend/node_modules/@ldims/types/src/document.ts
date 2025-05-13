/**
 * @interface DocumentInfo
 * @description API 返回的文档信息结构
 * @property {number} id - 文档 ID
 * @property {string} docName - 文档名称
 * @property {string | null} docTypeName - 文档类型名称
 * @property {string | null} departmentName - 来源部门名称
 * @property {string | null} submitter - 提交人
 * @property {string | null} receiver - 接收人
 * @property {string | null} signer - 签章人
 * @property {string | null} storageLocation - 保管位置
 * @property {Date | null} handoverDate - 交接日期
 * @property {string | null} remarks - 备注
 * @property {string | null} createdByName - 创建人显示名称
 * @property {string | null} updatedBy - 更新人姓名
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 * @property {SimplifiedDocumentFile[]} files - 关联的文件列表 (可选)
 * @property {number} fileCount - 关联文件的数量 (可选, 用于列表页)
 */
export interface DocumentInfo {
  id: number;
  docName: string;
  docTypeName: string | null;
  departmentName: string | null;
  submitter: string | null;
  receiver: string | null;
  signer: string | null;
  storageLocation: string | null;
  handoverDate: Date | null;
  remarks: string | null;
  createdByName: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  files?: SimplifiedDocumentFile[];
  fileCount?: number;
}

/**
 * @interface CreateDocumentRequest
 * @description 创建文档的请求体结构
 * @property {string} docName - 文档名称 (必须)
 * @property {number} [docTypeId] - 文档类型 ID (可选)
 * @property {number} sourceDepartmentId - 来源部门 ID (必须)
 * @property {string} submitter - 提交人 (必须)
 * @property {string} receiver - 接收人 (必须)
 * @property {string | null} [signer] - 签章人 (可选, 可为 null)
 * @property {string} [storageLocation] - 保管位置 (可选)
 * @property {string | Date | null} [handoverDate] - 交接日期 (可选, 可为 null)
 * @property {string} [remarks] - 备注 (可选)
 */
export interface CreateDocumentRequest {
  docName: string;
  docTypeId?: number | null;
  sourceDepartmentId: number;
  submitter: string;
  receiver: string;
  signer?: string | null;
  storageLocation?: string;
  handoverDate?: string | Date | null;
  remarks?: string;
}

/**
 * @interface UpdateDocumentRequest
 * @description 更新文档的请求体结构 (所有字段可选)
 */
export interface UpdateDocumentRequest {
  docName?: string;
  docTypeId?: number | null;
  sourceDepartmentId?: number;
  submitter?: string;
  receiver?: string;
  signer?: string | null;
  storageLocation?: string;
  handoverDate?: string | Date | null;
  remarks?: string;
}

/**
 * @interface DocumentListQuery
 * @description 文档列表查询参数接口
 * @property {string} [docName] - 文档名称
 * @property {string} [submitter] - 提交人
 * @property {string} [receiver] - 接收人
 * @property {string} [docTypeName] - 文档类型名称
 * @property {string} [departmentName] - 来源部门名称
 * @property {string} [signer] - 签章人
 * @property {string} [handoverStartDate] - 交接日期开始 (YYYY-MM-DD)
 * @property {string} [handoverEndDate] - 交接日期结束 (YYYY-MM-DD)
 * @property {number} [page] - 页码 (从 1 开始)
 * @property {number} [pageSize] - 每页数量
 * @property {string} [sortField] - 排序字段
 * @property {'ASC' | 'DESC'} [sortOrder] - 排序顺序
 * @property {number} [sourceDepartmentId] - 来源部门 ID (用于查询)
 * @property {number} [docTypeId] - 文档类型 ID (用于查询)
 * @property {string} [docTypeNameFilter] - 文档类型名称 (模糊查询)
 * @property {string} [sourceDepartmentNameFilter] - 来源部门名称 (模糊查询)
 */
export interface DocumentListQuery {
  docName?: string;
  submitter?: string;
  receiver?: string;
  docTypeName?: string;
  departmentName?: string;
  signer?: string;
  handoverStartDate?: string;
  handoverEndDate?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
  sourceDepartmentId?: number;
  docTypeId?: number;
  docTypeNameFilter?: string;
  sourceDepartmentNameFilter?: string;
}

/**
 * @interface SimplifiedDocumentFile
 * @description 用于在文档信息中展示的简化文件信息类型
 * @property {number} id - 文件 ID
 * @property {string} fileName - 原始文件名
 * @property {string} fileType - 文件类型
 * @property {number} fileSize - 文件大小
 * @property {number} sequence - 序列号
 * @property {string} processingStatus - 处理状态
 * @property {Date | undefined} createdAt - 创建时间
 * @property {Date | undefined} updatedAt - 更新时间
 */
export interface SimplifiedDocumentFile {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  sequence: number;
  processingStatus:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "ocr_fallback";
  createdAt?: Date;
  updatedAt?: Date;
}
