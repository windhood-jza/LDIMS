export interface DocTypeInfo {
    id: number;
    name: string;
    parentId: number | null;
    parentName?: string | null;
    sort: number;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    children?: DocTypeInfo[];
}
export interface CreateDocTypeRequest {
    name: string;
    parentId: number | null;
    sortOrder?: number;
    description?: string | null;
}
export interface UpdateDocTypeRequest {
    name?: string;
    parentId?: number | null;
    sortOrder?: number;
    description?: string | null;
}
export interface DocTypeListQuery {
    name?: string;
    parentId?: string | number | null;
}
