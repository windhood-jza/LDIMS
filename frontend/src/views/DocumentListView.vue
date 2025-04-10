<template>
  <div class="document-list-view">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" ref="searchFormRef" label-width="70px" class="search-form">
        <el-form-item label="文档名称" prop="docName">
          <el-input
            v-model="searchForm.docName"
            placeholder="输入文档名称"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="提交人" prop="submitter">
          <el-input
            v-model="searchForm.submitter"
            placeholder="输入提交人"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="接收人" prop="receiver">
          <el-input
            v-model="searchForm.receiver"
            placeholder="输入接收人"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="文档类型" prop="docTypeId">
          <el-tree-select
            v-model="searchForm.docTypeId"
            placeholder="选择文档类型"
            :data="docTypeTree"
            :props="treeProps"
            check-strictly
            :render-after-expand="false"
            clearable
            :loading="treeLoading"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="来源部门" prop="sourceDepartmentId">
          <el-tree-select
            v-model="searchForm.sourceDepartmentId"
            placeholder="选择来源部门"
            :data="departmentTree"
            :props="treeProps"
            check-strictly
            :render-after-expand="false"
            clearable
            :loading="treeLoading"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="签章人" prop="signer">
           <el-input
             v-model="searchForm.signer"
             placeholder="签章人"
             clearable
             style="width: 150px"
           />
        </el-form-item>
        <el-form-item label="交接日期" prop="handoverDateRange">
          <el-date-picker
            v-model="searchForm.handoverDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="" class="search-buttons">
          <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
          <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 工具栏和列表区域 -->
    <el-card class="table-card" shadow="never">
       <div class="toolbar">
         <div class="toolbar-buttons">
            <el-button type="primary" @click="openAddDialog" :icon="Plus">新增文档</el-button>
            <el-button type="success" @click="openImportDialog" :icon="UploadFilled">批量导入</el-button>
            <el-button type="warning" @click="openExportDialog" :icon="Download">导出</el-button>
         </div>
       </div>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%" stripe border @sort-change="handleSortChange" :default-sort="{ prop: 'createdAt', order: 'descending' }">
         <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" sortable="custom" />
        <el-table-column prop="docName" label="文档名称" min-width="200" show-overflow-tooltip sortable="custom" />
        <el-table-column prop="docTypeName" label="文档类型" width="150" />
        <el-table-column prop="departmentName" label="来源部门" width="150" />
        <el-table-column prop="submitter" label="提交人" width="120" sortable="custom" />
        <el-table-column prop="receiver" label="接收人" width="120" />
        <el-table-column prop="signer" label="签章人" width="120" sortable="custom" />
        <el-table-column prop="handoverDate" label="交接日期" width="120" align="center" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.handoverDate) }}
          </template>
        </el-table-column>
         <el-table-column prop="createdBy" label="创建人" width="120" />
         <el-table-column prop="createdAt" label="创建时间" width="160" align="center" sortable="custom">
             <template #default="{ row }">
                 {{ formatDateTime(row.createdAt) }}
             </template>
         </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="View" @click="openViewDialog(row)">查看</el-button>
            <el-button type="primary" link size="small" :icon="Edit" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination-container"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗组件 -->
    <DocumentFormDialog
      ref="formDialogRef" 
      :doc-type-tree-data="docTypeTree" 
      :department-tree-data="departmentTree"
      @success="fetchData"
     />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElTable, ElPagination, ElMessage, ElMessageBox, ElForm, FormInstance, Sort } from 'element-plus';
import {
    Search,
    Refresh,
    Plus,
    UploadFilled,
    Download,
    Edit,
    Delete,
    View,
    RefreshRight
} from '@element-plus/icons-vue';
import type { DocumentInfo, DocumentListQuery } from '@/types/document.d';
import { getDocuments, deleteDocument } from '@/services/api/document';
import { getDocTypeTree } from '@/services/api/doctype';
import { getDepartmentTree } from '@/services/api/department';
import DocumentFormDialog from '@/components/DocumentFormDialog.vue';

// 优化：定义更精确的树节点类型
interface TreeNode {
    id: number;
    name: string;
    children?: TreeNode[];
}

// --- 状态定义 ---
const searchFormRef = ref<FormInstance>();
const searchForm = reactive<Partial<DocumentListQuery> & { handoverDateRange: [string, string] | null }>({
  docName: '',
  submitter: '',
  receiver: '',
  docTypeId: null,
  sourceDepartmentId: null,
  signer: '',
  handoverDateRange: null,
  page: 1,
  pageSize: 10,
});

const tableData = ref<DocumentInfo[]>([]);
const loading = ref(false);
const treeLoading = ref(false); // 新增：树数据加载状态
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const docTypeTree = ref<TreeNode[]>([]); // 使用 TreeNode 类型
const departmentTree = ref<TreeNode[]>([]); // 使用 TreeNode 类型
const treeProps = { value: 'id', label: 'name', children: 'children' };

const formDialogRef = ref<InstanceType<typeof DocumentFormDialog> | null>(null);

// --- API 调用与数据处理 ---

// 获取文档列表
const fetchData = async (sortParams?: { prop: string; order: string }) => {
  loading.value = true;
  try {
    const params: DocumentListQuery = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      docName: searchForm.docName || undefined,
      submitter: searchForm.submitter || undefined,
      receiver: searchForm.receiver || undefined,
      docTypeId: searchForm.docTypeId ?? undefined,
      sourceDepartmentId: searchForm.sourceDepartmentId ?? undefined,
      signer: searchForm.signer || undefined,
      handoverDateStart: searchForm.handoverDateRange?.[0] || undefined,
      handoverDateEnd: searchForm.handoverDateRange?.[1] || undefined,
      sortField: sortParams?.prop,
      sortOrder: sortParams?.order === 'descending' ? 'DESC' : (sortParams?.order === 'ascending' ? 'ASC' : undefined),
    };
    Object.keys(params).forEach(key => {
        const k = key as keyof DocumentListQuery;
        if (params[k] === undefined || params[k] === null || params[k] === '') {
            delete params[k];
        }
    });

    // 调用 API
    const res = await getDocuments(params);
    
    // --- 新增日志：打印最原始的 res ---
    console.log('[DocumentListView] Raw response from getDocuments service:', res);

    // --- 尝试不同的数据提取路径 ---
    let listData: DocumentInfo[] = [];
    let totalCount: number = 0;

    // 尝试路径 1: res.data.data (对应情况 1 - 后端 success 包装了 data)
    if (res && res.data && res.data.data && Array.isArray(res.data.data.list)) {
      console.log('[DocumentListView] Trying to extract from res.data.data');
      listData = res.data.data.list || [];
      totalCount = res.data.data.total || 0;
    }
    // 尝试路径 2: res.data (对应情况 2 - 服务层返回 response.data)
    else if (res && res.data && Array.isArray(res.data.list)) {
      console.log('[DocumentListView] Trying to extract from res.data');
      listData = res.data.list || [];
      totalCount = res.data.total || 0;
    }
    // 尝试路径 3: res (对应情况 3 - 服务层直接返回 {list, total})
    else if (res && Array.isArray(res.list)) {
      console.log('[DocumentListView] Trying to extract from res directly');
      listData = res.list || [];
      totalCount = res.total || 0;
    }
    // 如果以上路径都找不到 list 数组
    else {
      console.error('[DocumentListView] Could not find list array in response structure:', res);
      // 保持列表为空， total 为 0
    }

    // --- 赋值 ---
    console.log('[DocumentListView] Final list data to assign:', listData);
    console.log('[DocumentListView] Final total count to assign:', totalCount);
    tableData.value = listData;
    pagination.total = totalCount;

  } catch (error) {
    console.error("获取文档列表失败:", error);
    ElMessage.error("获取文档列表失败");
    tableData.value = []; // 出错时清空列表
    pagination.total = 0; // 出错时重置总数
  } finally {
    loading.value = false;
  }
};

// 获取文档类型树
const fetchDocTypes = async () => {
  treeLoading.value = true;
  try {
    docTypeTree.value = await getDocTypeTree();
  } catch (error) {
    // 错误提示已在 API 函数中处理
    // console.error("获取文档类型失败:", error);
    // ElMessage.error("获取文档类型失败");
  } finally {
      treeLoading.value = false;
  }
};

// 获取部门树
const fetchDepartments = async () => {
  treeLoading.value = true;
  try {
    departmentTree.value = await getDepartmentTree();
  } catch (error) {
     // 错误提示已在 API 函数中处理
     // console.error("获取部门失败:", error);
     // ElMessage.error("获取部门失败");
  } finally {
       treeLoading.value = false;
  }
};

// --- 事件处理 ---

// 处理搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

// 重置搜索表单
const resetSearch = () => {
  searchFormRef.value?.resetFields();
  searchForm.handoverDateRange = null;
  handleSearch();
};

// 处理表格排序变化
const handleSortChange = (sortData: Sort) => {
    const { prop, order } = sortData;
    if (prop && order) {
        fetchData({ prop, order });
    } else {
        // 清除排序条件，可以重新获取默认排序的数据
        fetchData();
    }
};

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  fetchData();
};

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  fetchData();
};

// --- CRUD 实现 ---
const openAddDialog = () => {
  formDialogRef.value?.open('add', undefined);
};

const openEditDialog = (row: DocumentInfo) => {
  formDialogRef.value?.open('edit', row);
};

const openViewDialog = (row: DocumentInfo) => {
  formDialogRef.value?.open('view', row);
};

const handleDelete = async (row: DocumentInfo) => {
  try {
    await ElMessageBox.confirm(`确定要删除文档 "${row.docName}" 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    loading.value = true; // 添加删除时的加载状态
    await deleteDocument(row.id);
    ElMessage.success(`删除文档 "${row.docName}" 成功`);
    fetchData(); // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文档失败:', error);
      // 考虑显示更具体的后端错误信息
      ElMessage.error(`删除文档失败: ${(error as Error)?.message || '未知错误'}`);
    }
  } finally {
      loading.value = false;
  }
};

const openImportDialog = () => {
  ElMessage.info("导入功能待实现");
};

const openExportDialog = () => {
  ElMessage.info("导出功能待实现");
};

// --- 工具函数 ---
const formatDate = (date: Date | string | null): string => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    // 检查日期是否有效
    if (isNaN(d.getTime())) return '-';
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return String(date);
  }
};

const formatDateTime = (date: Date | string | null): string => {
    if (!date) return '-';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleString('zh-CN', { hour12: false }); // 指定中文和24小时制
    } catch (e) {
        return String(date);
    }
};

// --- 生命周期钩子 ---
onMounted(() => {
  fetchDocTypes();
  fetchDepartments();
  fetchData(); // 初始加载，无排序
});

</script>

<style scoped>
.document-list-view {
  padding: 0;
}

.search-card {
  margin-bottom: 5px;
  :deep(.el-card__body) {
    padding: 15px 15px 0 15px; 
  }
  border: none;
  box-shadow: none;
  border-radius: 0;
}

.search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: flex-start;
}
.search-form .el-form-item {
    margin-bottom: 15px;
    margin-right: 0;
}
.search-buttons {
    margin-left: auto;
    display: flex;
    gap: 8px;
}

.table-card {
    border: none;
    box-shadow: none;
    border-radius: 0;
    :deep(.el-card__body) {
        padding: 15px;
    }
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.toolbar-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.el-table .el-button + .el-button {
    margin-left: 8px;
}

:deep(.el-tree-select__popper) {
    min-width: fit-content;
}

</style> 