// frontend/src/types/common.ts
// Add common types like pagination, results etc. here.

/**
 * Tree Node structure (compatible with DepartmentInfo/DocTypeInfo for TreeSelect/Tree)
 */
export interface TreeNode {
  id: number | string;
  name: string; // Use 'name' to match DepartmentInfo/DocTypeInfo label
  label?: string; // Keep label for flexibility if needed elsewhere
  children?: TreeNode[];
  // Add optional properties from DepartmentInfo/DocTypeInfo if needed for compatibility
  code?: string;
  parentId?: number | null; // 添加 parentId，允许 null
  level?: number;
  sortOrder?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow other properties
}

/**
 * Generic Pagination Result Type
 */
export interface PageResult<T = any> {
  list: T[];
  total: number;
  page?: number;     // Optional, depending on API design
  pageSize?: number; // Optional, depending on API design
}

// export {}; // No longer needed as we have exports 