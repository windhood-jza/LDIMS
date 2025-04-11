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
            <el-upload
              :action="uploadUrl" 
              :headers="uploadHeaders"
              :show-file-list="false" 
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              accept=".xlsx, .xls" 
              style="margin-left: 10px; display: inline-block;" 
            >
              <el-button type="success" :icon="UploadFilled" :loading="isUploading">批量导入</el-button>
            </el-upload>
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
      ref="formDialogRef" 
      :doc-type-tree-data="docTypeTree" 
      :department-tree-data="departmentTree"
      @success="fetchData"
     />

    <!-- 导出选项弹窗 -->
    <ExportOptionsDialog ref="exportOptionsDialogRef" />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue';
import { ElTable, ElPagination, ElMessage, ElMessageBox, ElForm, FormInstance, Sort, ElInput, ElTreeSelect, ElUpload } from 'element-plus';
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
import type { UploadResponse, ImportRequestParams } from '@/types/export';
import { getDocuments, deleteDocument } from '@/services/api/document';
import { getDocTypeTree } from '@/services/api/doctype';
import { getDepartmentTree } from '@/services/api/department';
import { requestImport } from '@/services/api/export';
import DocumentFormDialog from '@/components/DocumentFormDialog.vue';
import ExportOptionsDialog from '@/components/ExportOptionsDialog.vue';
import type { UploadProps, UploadRawFile } from 'element-plus';

// --- ref 定义 ---
const searchFormRef = ref<FormInstance>();
const documentFormDialogRef = ref<InstanceType<typeof DocumentFormDialog> | null>(null);
const exportOptionsDialogRef = ref<InstanceType<typeof ExportOptionsDialog> | null>(null);
const tableRef = ref(); // 表格实例 (如果需要调用方法)
const selectedDocumentIds = ref<number[]>([]); // 存储选中行的 ID
const isUploading = ref(false); // 控制导入按钮的加载状态

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
const treeLoading = ref(false); // 新增：树数据加载状态
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const docTypeTree = ref<TreeNode[]>([]); // 使用 TreeNode 类型
const departmentTree = ref<TreeNode[]>([]); // 使用 TreeNode 类型
const treeProps = { value: 'id', label: 'name', children: 'children' };

// --- 计算属性 (获取上传 URL 和 Headers) ---
const uploadUrl = computed(() => {
    // 确保使用完整的 API 地址
    // 假设后端 API 基础路径已通过环境变量或其他方式配置
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/upload/excel`;
});

const uploadHeaders = computed(() => {
    // 从 localStorage 或其他地方获取 token
    const token = localStorage.getItem('accessToken'); // 或你的 token 存储键
    return {
        Authorization: `Bearer ${token}`
    };
});

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
      docTypeNameFilter: searchForm.docTypeId ? undefined : (searchForm.docTypeNameFilter || undefined),
      sourceDepartmentId: searchForm.sourceDepartmentId ?? undefined,
      sourceDepartmentNameFilter: searchForm.sourceDepartmentId ? undefined : (searchForm.sourceDepartmentNameFilter || undefined),
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
  documentFormDialogRef.value?.open('add', undefined);
};

const openEditDialog = (row: DocumentInfo) => {
  documentFormDialogRef.value?.open('edit', row);
};

const openViewDialog = (row: DocumentInfo) => {
  documentFormDialogRef.value?.open('view', row);
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

/**
 * @description 表格行选择变化时触发
 * @param {DocumentInfo[]} selection - 当前选中的行对象数组
 */
const handleSelectionChange = (selection: DocumentInfo[]) => {
  selectedDocumentIds.value = selection.map(item => item.id);
  console.log('[Debug] DocumentListView: Selection changed, selected IDs:', selectedDocumentIds.value); // 添加日志
};

/**
 * @description 处理批量导出按钮点击
 */
const handleExport = () => {
  if (exportOptionsDialogRef.value) {
    // 获取当前页数据的 ID 列表
    const currentPageIds = tableData.value.map(item => item.id);

    exportOptionsDialogRef.value.open(
      searchForm, // 传递当前的搜索条件 (用于 'all' 范围)
      selectedDocumentIds.value, // 传递选中的 ID 列表 (用于 'selected' 范围)
      currentPageIds // <-- 新增: 传递当前页的 ID 列表
    );
  }
};

// --- 上传处理函数 ---

/**
 * @description 上传文件之前的钩子：检查文件类型和大小
 */
const beforeUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('只能上传 Excel 文件 (.xlsx 或 .xls)!');
    return false;
  }
  if (rawFile.size > maxSize) {
    ElMessage.error('文件大小不能超过 10MB!');
    return false;
  }
  isUploading.value = true; // 开始上传，显示加载状态
  return true; // 允许上传
}

/**
 * @description 文件上传成功后的回调
 */
const handleUploadSuccess: UploadProps['onSuccess'] = (response: UploadResponse, uploadFile) => {
  console.log('Upload success:', response);
  isUploading.value = false; // 上传结束
  // 触发导入任务创建
  if (response && response.fileName && response.originalName) {
      triggerImportTask(response.fileName, response.originalName);
  } else {
      ElMessage.error(response?.message || '文件上传成功，但服务器返回数据异常');
  }
}

/**
 * @description 文件上传失败后的回调
 */
const handleUploadError: UploadProps['onError'] = (error: any, uploadFile) => {
  console.error('Upload error:', error);
  isUploading.value = false; // 上传结束
  // 尝试解析错误信息
  let message = '文件上传失败';
  try {
      const errorData = JSON.parse(error.message || '{}');
      message = errorData.message || message;
  } catch (e) {
      // 如果 error.message 不是 JSON 字符串，直接使用
      if (error.message) {
          message = error.message;
      }
  }
  ElMessage.error(message);
}

/**
 * @description 触发后台导入任务
 */
const triggerImportTask = async (fileName: string, originalName: string) => {
    try {
        const params: ImportRequestParams = { fileName, originalName };
        const result = await requestImport(params);
        if (result && result.taskId) {
            ElMessage.success(`导入任务已创建 (ID: ${result.taskId})，请稍后在任务列表查看进度。`);
            // 可以考虑跳转到任务列表页面或提供链接
        } else {
             ElMessage.error('启动导入任务失败：服务器响应异常');
        }
    } catch (error: any) {
        console.error('Request import task error:', error);
        const message = error?.response?.data?.message || error?.message || '启动导入任务时发生错误';
        ElMessage.error(message);
    }
}

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