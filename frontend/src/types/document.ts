// frontend/src/types/document.ts
// Add necessary document-related types here.

// **新增：用于展示的简化文件信息类型**
export interface SimplifiedDocumentFile {
  id: number;
  fileName: string; // 原始文件名
  fileType: string;
  fileSize: number;
  sequence: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'ocr_fallback';
  createdAt?: string; // 前端通常处理字符串日期
  updatedAt?: string;
}

export interface DocumentInfo {
  // Define properties based on backend model or usage
  id?: number;
  docName?: string;
  docTypeName?: string;
  sourceDepartmentName?: string;
  submitter?: string;
  receiver?: string;
  signer?: string;
  handoverDate?: string | null;
  storageLocation?: string;
  remarks?: string;
  createdByName?: string;
  createdAt?: string;
  updatedByName?: string;
  updatedAt?: string;
  docTypeId?: number | string;
  sourceDepartmentId?: number | string;
  files?: SimplifiedDocumentFile[]; // **新增**: 关联的文件列表
  fileCount?: number; // **新增**: 关联文件数量
  [key: string]: any;
}

export interface DocumentListQuery {
  // Define query parameters based on usage
  page?: number;
  pageSize?: number;
  keyword?: string;
  docName?: string;
  submitter?: string;
  receiver?: string;
  docTypeId?: number | string | null;
  sourceDepartmentId?: number | string | null;
  docTypeNameFilter?: string;
  sourceDepartmentNameFilter?: string;
  signer?: string;
  handoverDateRange?: [string, string] | null;
  [key: string]: any;
}

export interface CreateDocumentRequest {
  // Define properties needed for creation
  docName: string;
  submitter: string;
  receiver: string;
  signer?: string;
  storageLocation?: string;
  remarks?: string;
  handoverDate?: string | null;
  docTypeName?: string;
  sourceDepartmentName?: string;
  docTypeId?: number | null;
  sourceDepartmentId?: number | null;
}

export interface UpdateDocumentRequest {
  // Define properties allowed for update
  docName?: string;
  submitter?: string;
  receiver?: string;
  signer?: string;
  storageLocation?: string;
  remarks?: string;
  handoverDate?: string | null;
  docTypeName?: string;
  sourceDepartmentName?: string;
  docTypeId?: number | null;
  sourceDepartmentId?: number | null;
}

// Ensure it's treated as a module if no other exports exist initially
// export {}; 