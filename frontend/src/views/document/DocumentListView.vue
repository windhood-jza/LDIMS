<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDocuments,
  deleteDocument,
  type DocumentInfo,
  type DocumentListQuery,
} from '@/services/api/document'
import { getDepartmentList, type Department } from '@/services/api/department' // 确认路径
import { getDocTypeList, type DocType } from '@/services/api/doctype' // 确认路径
import { formatTime } from '@/utils/date'
import DocumentForm from './components/DocumentForm.vue' // 确认路径
import { Search, Refresh, Plus, Upload, Download, View, Edit, Delete } from '@element-plus/icons-vue' // 导入图标

// ... (其他导入和常量)

const searchParams = reactive<Partial<DocumentListQuery>>({
  docName: '',
  submitter: '',
  receiver: '',
  signer: '',
  handoverStartDate: undefined,
  handoverEndDate: undefined,
  page: 1,
  pageSize: 10,
  docTypeName: '',
  departmentName: '',
})

const docTypeList = ref<DocType[]>([])
const departmentList = ref<Department[]>([])
const loading = ref(false)
const tableData = ref<DocumentInfo[]>([])
const total = ref(0)
const documentFormRef = ref<InstanceType<typeof DocumentForm> | null>(null)

// 获取文档类型列表
const fetchDocTypes = async () => {
  try {
    // 假设 getDocTypeList 获取的是完整列表
    const res = await getDocTypeList({ page: 1, pageSize: 999 }) // 获取所有类型用于下拉
    if (res.code === 0) {
      docTypeList.value = res.data.list
    } else {
      ElMessage.error(res.message || '获取文档类型失败')
    }
  } catch (error) {
    console.error('获取文档类型列表失败:', error)
    ElMessage.error('获取文档类型列表时发生错误')
  }
}

// 获取部门列表
const fetchDepartments = async () => {
  try {
    console.log("[DocumentListView:fetchDepartments] Fetching departments..."); // 添加日志
    const res = await getDepartmentList(); // <--- 修正：不传递参数
    console.log("[DocumentListView:fetchDepartments] Received departments response:", res); // 添加日志

    // 后续处理需要基于 getDepartmentList 返回的实际结构
    // 假设它直接返回 DepartmentInfo[] 数组
    if (Array.isArray(res)) {
       departmentList.value = res;
    } else {
       // 如果返回结构是 { code: 0, data: [], ... } 或其他形式，需要调整
       console.error("Unexpected response structure from getDepartmentList:", res);
       ElMessage.error('获取部门列表失败: 响应格式错误');
       departmentList.value = []; // 清空
    }

  } catch (error) {
    console.error('获取部门列表失败:', error);
    ElMessage.error('获取部门列表时发生错误');
     departmentList.value = []; // 清空
  }
}

// 获取文档列表
const fetchDocuments = async () => {
  loading.value = true;
  console.log('[DocumentListView:fetchDocuments] Entry. searchParams:', JSON.stringify(searchParams, null, 2));
  try {
    const params: Partial<DocumentListQuery> = {};
    console.log('[DocumentListView:fetchDocuments] Initial empty params:', JSON.stringify(params));

    params.page = searchParams.page;
    params.pageSize = searchParams.pageSize;
    console.log('[DocumentListView:fetchDocuments] params after page/pageSize:', JSON.stringify(params));

    console.log("<<<< DEBUG POINT 1: BEFORE PARAM ASSIGNMENT >>>>"); // <-- 新增标记

    if (searchParams.docName) {
        params.docName = searchParams.docName;
    }
    if (searchParams.submitter) {
        params.submitter = searchParams.submitter;
    }
    if (searchParams.receiver) {
        params.receiver = searchParams.receiver;
    }
     if (searchParams.signer) {
         params.signer = searchParams.signer;
     }

    console.log("<<<< DEBUG POINT 2: AFTER STANDARD PARAMS, BEFORE DEPARTMENT >>>>"); // <-- 新增标记

    console.log(`Checking searchParams.departmentName: '${searchParams.departmentName}'`);
    if (searchParams.departmentName) {
        params.departmentName = searchParams.departmentName; // 关键赋值
        console.log('Params AFTER assigning departmentName:', JSON.stringify(params));
    } else {
         console.log('searchParams.departmentName is empty.');
    }

    console.log("<<<< DEBUG POINT 3: AFTER DEPARTMENT, BEFORE DOCTYPE >>>>"); // <-- 新增标记

    console.log(`Checking searchParams.docTypeName: '${searchParams.docTypeName}'`);
    if (searchParams.docTypeName) { // 确认这里的 searchParams 拼写正确
        params.docTypeName = searchParams.docTypeName;
         console.log('Params AFTER assigning docTypeName:', JSON.stringify(params));
    } else {
         console.log('searchParams.docTypeName is empty.');
    }

    console.log("<<<< DEBUG POINT 4: AFTER DOCTYPE, BEFORE DATES >>>>"); // <-- 新增标记

    if (searchParams.handoverStartDate) {
       params.handoverStartDate = formatTime(searchParams.handoverStartDate, 'YYYY-MM-DD');
    }
     if (searchParams.handoverEndDate) {
        params.handoverEndDate = formatTime(searchParams.handoverEndDate, 'YYYY-MM-DD');
     }

    console.log("<<<< DEBUG POINT 5: AFTER DATES, BEFORE FINAL CHECK >>>>"); // <-- 新增标记

    // --- 保留之前的最终检查 ---
    console.log('[DocumentListView:fetchDocuments] Check params JUST BEFORE sending:');
    console.log('>>> params has departmentName:', params.hasOwnProperty('departmentName'), 'Value:', params.departmentName);
    console.log('>>> params has sourceDepartmentId:', params.hasOwnProperty('sourceDepartmentId'), 'Value:', params.sourceDepartmentId); // 再次检查
    console.log('Complete params object:', JSON.stringify(params, null, 2));
    // -----------------------------

    console.log("<<<< DEBUG POINT 6: BEFORE CALLING getDocuments >>>>"); // <-- 新增标记

    const res = await getDocuments(params);

    // 简化响应处理 (需要根据实际返回调整)
    console.log('[DocumentListView:fetchDocuments] Received response from getDocuments:', res);
    if (res && Array.isArray(res.list)) {
        tableData.value = res.list;
        total.value = res.total ?? 0;
         console.log('[DocumentListView:fetchDocuments] Data updated.');
    } else {
        console.error('[DocumentListView:fetchDocuments] Invalid response structure in simplified version:', res);
        tableData.value = [];
        total.value = 0;
        ElMessage.error('获取列表失败: 响应格式错误');
    }

  } catch (error) {
      console.error('[DocumentListView:fetchDocuments] Error during fetch (Simplified): ', error);
       ElMessage.error('获取列表时发生错误 (Simplified)');
       tableData.value = [];
       total.value = 0;
  } finally {
    loading.value = false;
  }
}

// ... (重置搜索, 处理分页, 处理编辑/删除/查看等函数)

const handleReset = () => {
  searchParams.docName = ''
  searchParams.submitter = ''
  searchParams.receiver = ''
  searchParams.signer = ''
  searchParams.handoverStartDate = undefined
  searchParams.handoverEndDate = undefined
  searchParams.docTypeName = ''
  searchParams.departmentName = ''
  searchParams.page = 1
  fetchDocuments()
}

const handleSearch = () => {
  console.log('[DocumentListView:handleSearch] Triggered. searchParams BEFORE reset:', JSON.stringify(searchParams)); // Log search params on search click
  searchParams.page = 1
  console.log('[DocumentListView:handleSearch] Calling fetchDocuments...');
  fetchDocuments()
}

const handleSizeChange = (val: number) => {
  searchParams.pageSize = val
  searchParams.page = 1 // 切换每页数量时重置到第一页
  fetchDocuments()
}

const handleCurrentChange = (val: number) => {
  searchParams.page = val
  fetchDocuments()
}

const handleAdd = () => {
  documentFormRef.value?.open()
}

const handleEdit = (row: DocumentInfo) => {
  documentFormRef.value?.open(row.id)
}

const handleDelete = (row: DocumentInfo) => {
  ElMessageBox.confirm(`确定要删除文档 "${row.docName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await deleteDocument(row.id)
        if (res.code === 0) {
          ElMessage.success('删除成功')
          // 重新加载数据，考虑当前页是否为空
          if (tableData.value.length === 1 && searchParams.page && searchParams.page > 1) {
            searchParams.page -= 1
          }
          fetchDocuments()
        } else {
          ElMessage.error(res.message || '删除失败')
        }
      } catch (error) {
        console.error('删除文档失败:', error)
        ElMessage.error('删除文档时发生错误')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

const handleView = (row: DocumentInfo) => {
  // TODO: 实现查看详情逻辑，可能打开一个模态框或跳转页面
  console.log('查看:', row)
  ElMessage.info('查看功能待实现')
}


// 组件挂载时加载初始数据
onMounted(() => {
  fetchDocTypes()
  fetchDepartments()
  fetchDocuments()
})
</script>

<template>
  <div class="document-list-view">
    <el-card shadow="never">
      <el-form :inline="true" :model="searchParams" class="search-form" label-width="70px">
        <el-form-item label="文档名称">
          <el-input v-model="searchParams.docName" placeholder="输入文档名称" clearable />
        </el-form-item>
        <el-form-item label="提交人">
          <el-input v-model="searchParams.submitter" placeholder="输入提交人" clearable />
        </el-form-item>
        <el-form-item label="接收人">
          <el-input v-model="searchParams.receiver" placeholder="输入接收人" clearable />
        </el-form-item>
        <el-form-item label="文档类型">
          <el-select
            v-model="searchParams.docTypeName"
            placeholder="选择或输入文档类型"
            clearable
            filterable
            allow-create
            style="width: 180px"
          >
            <el-option
              v-for="item in docTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="来源部门">
           <el-select
            v-model="searchParams.departmentName"
            placeholder="选择或输入来源部门"
            clearable
            filterable
            allow-create
            style="width: 180px"
          >
            <el-option
              v-for="item in departmentList"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="签收人">
          <el-input v-model="searchParams.signer" placeholder="输入签收人" clearable />
        </el-form-item>
         <el-form-item label="交接日期">
             <el-date-picker
                v-model="searchParams.handoverStartDate"
                type="date"
                placeholder="开始日期"
                value-format="YYYY-MM-DD"
                style="width: 140px;"
             />
            <span style="margin: 0 5px;">至</span>
             <el-date-picker
                v-model="searchParams.handoverEndDate"
                type="date"
                placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 140px;"
             />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
             <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 15px;">
       <div class="toolbar">
         <el-button type="primary" @click="handleAdd">
           <el-icon><Plus /></el-icon> 新增文档
         </el-button>
         <el-button type="success" disabled>
           <el-icon><Upload /></el-icon> 批量导入
         </el-button>
          <el-button type="warning" disabled>
           <el-icon><Download /></el-icon> 导出
         </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%; margin-top: 15px;" border stripe>
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column prop="id" label="ID" width="80" align="center" sortable />
         <el-table-column prop="docName" label="文档名称" min-width="250" show-overflow-tooltip sortable />
         <el-table-column prop="docTypeName" label="文档类型" width="150" align="center" />
         <el-table-column prop="departmentName" label="来源部门" width="150" align="center" />
         <el-table-column prop="submitter" label="提交人" width="120" align="center" />
         <el-table-column prop="receiver" label="接收人" width="120" align="center" />
         <el-table-column prop="signer" label="签收人" width="120" align="center" />
         <el-table-column prop="handoverDate" label="交接日期" width="130" align="center" sortable>
             <template #default="{ row }">
                {{ formatTime(row.handoverDate, 'YYYY-MM-DD') || '-' }}
            </template>
         </el-table-column>
         <el-table-column prop="createdByName" label="创建人" width="120" align="center" />
         <el-table-column prop="createdAt" label="创建时间" width="170" align="center" sortable>
           <template #default="{ row }">
             {{ formatTime(row.createdAt) }}
           </template>
         </el-table-column>
         <el-table-column label="操作" width="180" align="center" fixed="right">
           <template #default="{ row }">
             <el-button type="primary" link size="small" @click="handleView(row)">
                <el-icon><View /></el-icon>查看
             </el-button>
             <el-button type="warning" link size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>编辑
             </el-button>
             <el-button type="danger" link size="small" @click="handleDelete(row)">
               <el-icon><Delete /></el-icon>删除
             </el-button>
           </template>
         </el-table-column>
       </el-table>

       <el-pagination
         v-if="total > 0"
         style="margin-top: 15px; justify-content: flex-end;"
         :current-page="searchParams.page"
         :page-size="searchParams.pageSize"
         :page-sizes="[10, 20, 50, 100]"
         :total="total"
         layout="total, sizes, prev, pager, next, jumper"
         @size-change="handleSizeChange"
         @current-change="handleCurrentChange"
       />
    </el-card>

    <DocumentForm ref="documentFormRef" @success="fetchDocuments" />
  </div>
</template>

<style lang="scss" scoped>
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px; /* 增加元素间距 */
   row-gap: 10px; /* 增加行间距 */
  align-items: center; /* 垂直居中对齐 */

  .el-form-item {
    margin-bottom: 0; /* 移除默认的 margin-bottom，让 gap 控制间距 */
     // display: flex; // 确保label和input在同一行
     // align-items: center; // 垂直居中label和input
  }

  .search-buttons {
    // margin-left: auto; /* 移除这个，让按钮自然排列 */
     margin-left: 10px; /* 可以添加少量左边距 */
  }
}

.toolbar {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-start; /* 按钮靠左 */
}

// 可以在这里添加全局样式或覆盖 Element Plus 的样式
// 例如，如果表格内容过长需要特殊处理
// :deep(.el-table .cell) {
//   // white-space: normal; // 允许换行
//   // word-break: break-all; // 强制单词换行
// }
</style> 