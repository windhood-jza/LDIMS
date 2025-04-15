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
          <div class="filter-group">
            <el-tree-select
              v-model="searchForm.docTypeId"
              placeholder="选择精确类型"
              :data="docTypeTree"
              :props="treeProps"
              check-strictly
              :render-after-expand="false"
              clearable
              :loading="treeLoading"
              style="width: 180px;"
              @change="handleDocTypeSelect"
            />
            <el-input
              v-model="searchForm.docTypeNameFilter"
              placeholder="或输入模糊类型"
              clearable
              style="width: 150px;"
              @input="handleDocTypeNameInput"
              @clear="() => { searchForm.docTypeNameFilter = '' }"
            />
          </div>
        </el-form-item>
        <el-form-item label="来源部门" prop="sourceDepartmentId">
          <div class="filter-group">
            <el-tree-select
              v-model="searchForm.sourceDepartmentId"
              placeholder="选择精确部门"
              :data="departmentTree"
              :props="treeProps"
              check-strictly
              :render-after-expand="false"
              clearable
              :loading="treeLoading"
              style="width: 180px;"
              @change="handleDepartmentSelect"
            />
            <el-input
              v-model="searchForm.sourceDepartmentNameFilter"
              placeholder="或输入模糊部门"
              clearable
              style="width: 150px;"
              @input="handleDepartmentNameInput"
              @clear="() => { searchForm.sourceDepartmentNameFilter = '' }"
            />
          </div>
        </el-form-item>
        <el-form-item label="签章人" prop="signer">
           <el-input
             v-model="searchForm.signer"
             placeholder="签章人"
             clearable
             style="width: 120px"
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
            <el-button type="success" @click="handleImportClick" :icon="UploadFilled">批量导入</el-button>
            <el-button type="warning" @click="handleExport" :icon="Download" style="margin-left: 10px;">批量导出</el-button>
         </div>
       </div>

      <!-- 数据表格 -->
      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        stripe
        border
        @sort-change="handleSortChange"
        :default-sort="{ prop: 'createdAt', order: 'descending' }"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" :reserve-selection="true" />
        <el-table-column prop="id" label="ID" width="80" sortable />
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
      ref="documentFormDialogRef" 
      :doc-type-tree-data="docTypeTree" 
      :department-tree-data="departmentTree"
      @success="fetchData"
     />

    <!-- 导出选项弹窗 -->
    <ExportOptionsDialog ref="exportOptionsDialogRef" />

    <!-- 导入对话框组件 -->
    <ImportDialog ref="importDialogRef" />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElTable, ElPagination, ElMessage, ElMessageBox, ElForm, FormInstance, Sort, ElInput, ElTreeSelect } from 'element-plus';
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
import type { DocumentInfo, DocumentListQuery } from '@/types/document';
import type { TreeNode } from '@/types/common';
import { getDocuments, deleteDocument } from '@/services/api/document';
import { getDocTypeTree } from '@/services/api/doctype';
import { getDepartmentTree } from '@/services/api/department';
import { requestExport } from '@/services/api/task';
import DocumentFormDialog from '@/components/DocumentFormDialog.vue';
import ExportOptionsDialog from '@/components/ExportOptionsDialog.vue';
import ImportDialog from '@/components/ImportDialog.vue';

// --- ref 定义 ---
const searchFormRef = ref<FormInstance>();
const documentFormDialogRef = ref<InstanceType<typeof DocumentFormDialog> | null>(null);
const exportOptionsDialogRef = ref<InstanceType<typeof ExportOptionsDialog> | null>(null);
const importDialogRef = ref<InstanceType<typeof ImportDialog> | null>(null);
const tableRef = ref();
const selectedDocumentIds = ref<number[]>([]);

// --- 状态定义 ---
const searchForm = reactive<Partial<DocumentListQuery> & { handoverDateRange: [string, string] | null, docTypeNameFilter?: string, sourceDepartmentNameFilter?: string }>({
  docName: '',
  submitter: '',
  receiver: '',
  docTypeId: null,
  sourceDepartmentId: null,
  docTypeNameFilter: '',
  sourceDepartmentNameFilter: '',
  signer: '',
  handoverDateRange: null,
  page: 1,
  pageSize: 10,
});

const tableData = ref<DocumentInfo[]>([]);
const loading = ref(false);
const treeLoading = ref(false);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const docTypeTree = ref<TreeNode[]>([]);
const departmentTree = ref<TreeNode[]>([]);
const treeProps = { value: 'id', label: 'name', children: 'children' };

// --- API 调用与数据处理 ---
const fetchData = async (sortOptions?: Sort) => {
  loading.value = true;
  try {
    const params: DocumentListQuery = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      docName: searchForm.docName || undefined,
      submitter: searchForm.submitter || undefined,
      receiver: searchForm.receiver || undefined,
      docTypeId: searchForm.docTypeId ?? undefined,
      docTypeNameFilter: searchForm.docTypeId ? undefined : (searchForm.docTypeNameFilter || undefined),
      sourceDepartmentId: searchForm.sourceDepartmentId ?? undefined,
      sourceDepartmentNameFilter: searchForm.sourceDepartmentId ? undefined : (searchForm.sourceDepartmentNameFilter || undefined),
      signer: searchForm.signer || undefined,
      handoverDateStart: searchForm.handoverDateRange?.[0] || undefined,
      handoverDateEnd: searchForm.handoverDateRange?.[1] || undefined,
      sortField: sortOptions?.prop,
      sortOrder: sortOptions?.order === 'descending' ? 'DESC' : (sortOptions?.order === 'ascending' ? 'ASC' : undefined),
    };
    Object.keys(params).forEach(key => {
        const k = key as keyof DocumentListQuery;
        if (params[k] === undefined || params[k] === null || params[k] === '') {
            delete params[k];
        }
    });

    // 调用 API
    const result = await getDocuments(params);
    
    // --- 新增日志：打印最原始的 result ---
    console.log('[DocumentListView] Raw response from getDocuments service:', result);

    // --- 检查返回的数据结构 ---
    if (result && Array.isArray(result.list) && typeof result.total === 'number') {
        console.log('[DocumentListView] Trying to extract from result directly');
        tableData.value = result.list;
        pagination.total = result.total;
    } else {
        console.error('Invalid data structure received from getDocuments:', result);
        ElMessage.error('获取文档列表失败：数据格式错误');
        tableData.value = [];
        pagination.total = 0;
    }

  } catch (error: any) {
    console.error("Fetch documents error:", error)
    const message = error?.response?.data?.message || error?.message || '获取文档列表时发生错误';
    ElMessage.error(message);
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const fetchDocTypeTree = async () => {
  treeLoading.value = true;
  try {
    docTypeTree.value = await getDocTypeTree();
  } catch (error) {
    console.error("Error fetching document type tree:", error);
    ElMessage.error('获取文档类型失败');
  } finally {
    treeLoading.value = false;
  }
};

const fetchDepartmentTree = async () => {
  treeLoading.value = true;
  try {
    departmentTree.value = await getDepartmentTree();
  } catch (error) {
    console.error("Error fetching department tree:", error);
    ElMessage.error('获取部门失败');
  } finally {
    treeLoading.value = false;
  }
};

// --- 事件处理 ---
const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

const resetSearch = () => {
  searchFormRef.value?.resetFields();
  searchForm.docTypeId = null;
  searchForm.sourceDepartmentId = null;
  searchForm.docTypeNameFilter = '';
  searchForm.sourceDepartmentNameFilter = '';
  searchForm.handoverDateRange = null;
  searchForm.docName = '';
  searchForm.submitter = '';
  searchForm.receiver = '';
  searchForm.signer = '';
  handleSearch();
};

const handleSortChange = (sort: Sort) => {
    const { prop, order } = sort;
    if (prop && order) {
        fetchData({ prop, order });
    } else {
        // 清除排序条件，可以重新获取默认排序的数据
        fetchData();
    }
};

const handleSizeChange = (val: number) => {
  fetchData();
};

const handleCurrentChange = (val: number) => {
  fetchData();
};

// --- CRUD 实现 ---
const openAddDialog = () => {
  if (documentFormDialogRef.value) {
      documentFormDialogRef.value.open('add');
  } else {
      console.error('DocumentFormDialog reference is null');
      ElMessage.error('无法打开新增对话框，请刷新重试');
  }
};

const openEditDialog = (row: DocumentInfo) => {
  if (documentFormDialogRef.value) {
      // 添加日志：检查传递给对话框的树数据
      console.log('[ListView] Before opening edit dialog - docTypeTree:', JSON.stringify(docTypeTree.value));
      console.log('[ListView] Before opening edit dialog - departmentTree:', JSON.stringify(departmentTree.value));
      documentFormDialogRef.value.open('edit', row);
  } else {
      console.error('DocumentFormDialog reference is null');
      ElMessage.error('无法打开编辑对话框，请刷新重试');
  }
};

const openViewDialog = (row: DocumentInfo) => {
  if (documentFormDialogRef.value) {
      // 添加日志：检查传递给对话框的树数据
      console.log('[ListView] Before opening view dialog - docTypeTree:', JSON.stringify(docTypeTree.value));
      console.log('[ListView] Before opening view dialog - departmentTree:', JSON.stringify(departmentTree.value));
      documentFormDialogRef.value.open('view', row);
  } else {
      console.error('DocumentFormDialog reference is null');
      ElMessage.error('无法打开查看对话框，请刷新重试');
  }
};

const handleDelete = async (row: DocumentInfo) => {
  try {
    await ElMessageBox.confirm(`确定要删除文档 "${row.docName}" 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    loading.value = true;
    await deleteDocument(row.id);
    ElMessage.success(`删除文档 "${row.docName}" 成功`);
    fetchData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文档失败:', error);
      ElMessage.error(`删除文档失败: ${(error as Error)?.message || '未知错误'}`);
    }
  } finally {
      loading.value = false;
  }
};

const handleSelectionChange = (selection: DocumentInfo[]) => {
  selectedDocumentIds.value = selection.map(item => item.id);
  console.log('[Debug] DocumentListView: Selection changed, selected IDs:', selectedDocumentIds.value);
};

const handleExport = () => {
  if (exportOptionsDialogRef.value) {
    const currentPageIds = tableData.value.map((item: DocumentInfo) => item.id);

    exportOptionsDialogRef.value.open(
      searchForm,
      selectedDocumentIds.value,
      currentPageIds
    );
  }
};

// --- 新增：批量导入处理函数 ---
const handleImportClick = async () => {
  console.log('[DocumentListView] handleImportClick called');
  if (!importDialogRef.value) {
    console.error('[DocumentListView] Import dialog reference is null');
    ElMessage.error('导入对话框组件未正确加载，请刷新页面重试');
    return;
  }
  try {
    console.log('[DocumentListView] Opening import dialog...');
    await importDialogRef.value.open();
    console.log('[DocumentListView] Import dialog opened successfully.');
  } catch (error) {
    console.error('[DocumentListView] Error opening import dialog:', error);
    ElMessage.error('打开导入对话框时发生错误，请刷新页面重试');
  }
};

// --- 工具函数 ---
const formatDisplayDate = (dateInput: string | number | Date | undefined | null, onlyDate: boolean = false): string => {
  if (!dateInput) return '-';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    if (onlyDate) return `${year}-${month}-${day}`;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting date:', dateInput, error);
    return '-';
  }
};

const formatDate = (date: Date | string | null): string => {
  return formatDisplayDate(date, true);
};

const formatDateTime = (date: Date | string | null): string => {
  return formatDisplayDate(date);
};

// --- 生命周期钩子 ---
onMounted(() => {
  console.log('[DocumentListView] onMounted STARTING...');
  fetchDocTypeTree();
  fetchDepartmentTree();
  fetchData();
});

const handleDocTypeSelect = (value: number | null) => {
  if (value !== null) {
    searchForm.docTypeNameFilter = '';
  }
};
const handleDocTypeNameInput = (value: string) => {
  if (value) {
    searchForm.docTypeId = null;
  }
};
const handleDepartmentSelect = (value: number | null) => {
  if (value !== null) {
    searchForm.sourceDepartmentNameFilter = '';
  }
};
const handleDepartmentNameInput = (value: string) => {
  if (value) {
    searchForm.sourceDepartmentId = null;
  }
};

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

.filter-group {
  display: flex;
  align-items: center; 
  gap: 5px; 
}

/* 移除之前可能干扰布局的 el-form-item__content 样式 */
:deep(.el-form-item__content) {
  /* 确保这里没有 display: block 或类似的样式 */
}

/* 确保 el-upload 内的按钮样式正常 */
.el-upload {
    display: inline-block; /* 使其与旁边的按钮对齐 */
    margin-right: 10px; /* 可以调整与其他按钮的间距 */
}

/* 可能需要调整 toolbar 内按钮的垂直对齐方式 */
.toolbar-buttons {
    display: flex;
    align-items: center; /* 尝试垂直居中对齐 */
}

</style> 