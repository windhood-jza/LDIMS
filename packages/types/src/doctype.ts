// 定义后端接口返回的文档类型基础信息结构
export interface DocTypeInfo {
  id: number;
  name: string;
  parentId: number | null; // 父级ID，顶级为 null
  parentName?: string | null; // 父级名称 (可选，后端可能返回)
  sort: number; // 排序号 (使用 sortOrder 映射而来)
  description?: string | null; // 描述 (可选)
  createdAt: string; // 创建时间 (ISO 格式字符串)
  updatedAt: string; // 更新时间 (ISO 格式字符串)
  children?: DocTypeInfo[]; // 子类型 (用于树结构)
}

// 定义创建文档类型的请求体结构
export interface CreateDocTypeRequest {
  name: string; // 类型名称 (必填)
  parentId: number | null; // 父级ID (顶级为 null)
  sortOrder?: number; // 排序号 (可选，对应模型的 sortOrder)
  description?: string | null; // 描述 (可选)
}

// 定义更新文档类型的请求体结构
export interface UpdateDocTypeRequest {
  name?: string; // 类型名称 (可选)
  parentId?: number | null; // 父级ID (可选)
  sortOrder?: number; // 排序号 (可选，对应模型的 sortOrder)
  description?: string | null; // 描述 (可选)
}

// 新增：定义文档类型列表查询参数的接口
export interface DocTypeListQuery {
  name?: string; // 按名称模糊查询
  parentId?: string | number | null; // 按父级ID查询 (可以是数字、'null' 字符串或 null)
  // 可以根据需要添加其他查询参数，例如分页参数 page, pageSize
} 