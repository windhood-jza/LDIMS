<template>
  <div class="export-task-list-view">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>我的后台任务</span>
          <div class="filter-controls">
            <el-radio-group v-model="filterTaskType" @change="fetchData" size="small">
              <el-radio-button label="all">所有任务</el-radio-button>
              <el-radio-button label="document_export">文档导出</el-radio-button>
              <el-radio-button label="document_import">文档导入</el-radio-button>
            </el-radio-group>
            <el-button type="primary" :icon="'Refresh'" @click="fetchData" :loading="loading" style="margin-left: 10px;">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tasks" v-loading="loading" style="width: 100%">
        <el-table-column prop="taskType" label="任务类型" width="120">
           <template #default="{ row }">
            <span>{{ formatTaskType(row.taskType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="任务 ID" width="100" />
        <el-table-column prop="fileName" label="文件名/源" min-width="180" show-overflow-tooltip>
           <template #default="{ row }">
            {{ row.fileName || row.originalFileName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="fileType" label="文件类型" width="100">
           <template #default="{ row }">
            <el-tag v-if="row.fileType" :type="row.fileType === 'xlsx' ? 'success' : 'primary'" size="small">{{ row.fileType?.toUpperCase() }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">{{ formatStatus(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总行数" width="100" align="center">
           <template #default="{ row }">
             <span v-if="row.taskType === 'document_import'">{{ row.totalRows ?? '-' }}</span>
             <span v-else>-</span>
           </template>
        </el-table-column>
        <el-table-column label="成功数" width="100" align="center">
           <template #default="{ row }">
             <span v-if="row.taskType === 'document_import'" style="color: #67C23A;">{{ row.successCount ?? '-' }}</span>
             <span v-else>-</span>
           </template>
        </el-table-column>
        <el-table-column label="失败数" width="100" align="center">
           <template #default="{ row }">
             <span v-if="row.taskType === 'document_import'" :style="{ color: row.failureCount > 0 ? '#F56C6C' : '#606266' }">
               {{ row.failureCount ?? '-' }}
             </span>
             <span v-else>-</span>
           </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress v-if="row.status === 1" :percentage="row.progress || 0" :stroke-width="8" striped striped-flow />
            <span v-else-if="row.status === 2">完成</span>
            <span v-else-if="row.status === 3">失败</span>
            <span v-else-if="row.status === 0">排队中</span>
            <span v-else>{{ row.progress !== null ? `${row.progress}%` : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" :formatter="formatDateTime" sortable />
         <el-table-column prop="errorDetails" label="错误信息" min-width="150" show-overflow-tooltip>
           <template #default="{ row }">
            <el-button v-if="row.status === 3 && row.errorDetails" type="danger" link size="small" @click="showErrorDetails(row)">查看错误</el-button>
            <span v-else-if="row.status === 3">未知错误</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.taskType === 'document_export' && row.status === 2 && row.filePath"
              type="primary"
              size="small"
              link
              @click="handleDownload(row)"
              :loading="row.downloading"
            >
              下载
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        @size-change="fetchData"
        @current-change="fetchData"
        class="pagination-container"
      />
    </el-card>

    <!-- 错误详情弹窗 -->
    <el-dialog
      v-model="errorDialogVisible"
      title="错误详情"
      width="60%"
      top="5vh"
    >
      <div style="max-height: 70vh; overflow-y: auto;">
        <pre style="white-space: pre-wrap; word-wrap: break-word;">{{ currentErrorDetails }}</pre>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="errorDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElTag, ElDialog, ElButton } from 'element-plus'
import { getTasks, downloadTaskFile } from '@/services/api/task'
import type { Task, TaskQuery, TaskStatus } from '@/types/export'
import { saveAs } from 'file-saver'

// --- 任务类型过滤状态 ---
const filterTaskType = ref<'all' | 'document_export' | 'document_import'>('document_export');
// --- 错误详情弹窗状态 ---
const errorDialogVisible = ref(false);
const currentErrorDetails = ref('');
// -----------------------

const tasks = ref<(Task & { downloading?: boolean })[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive<TaskQuery>({
  page: 1,
  pageSize: 10
})

let refreshInterval: number | null = null;

/**
 * @description 获取任务列表数据
 */
const fetchData = async () => {
  loading.value = true
  try {
    const params: TaskQuery = {
      ...query,
      taskType: filterTaskType.value === 'all' ? undefined : filterTaskType.value
    };

    const data = await getTasks(params);

    if (data && Array.isArray(data.list) && typeof data.total === 'number') {
        tasks.value = data.list.map((task: Task) => ({ ...task, downloading: false }));
        total.value = data.total;

        const processingTasks = tasks.value.some(task => task.status === 0 || task.status === 1);
        if (processingTasks && !refreshInterval) {
          startAutoRefresh();
        } else if (!processingTasks && refreshInterval) {
          stopAutoRefresh();
        }
    } else {
      console.error('Invalid data structure received from getTasks:', data);
      ElMessage.error('获取任务列表失败：数据格式错误');
      tasks.value = [];
      total.value = 0;
    }

  } catch (error: any) {
    console.error("Fetch tasks error:", error);
    const message = error?.response?.data?.message || error?.message || '获取任务列表时发生错误';
    ElMessage.error(message);
    tasks.value = [];
    total.value = 0;
  } finally {
    loading.value = false
  }
}

/**
 * @description 处理下载文件
 * @param {Task & { downloading?: boolean }} task - 任务对象
 */
const handleDownload = async (task: Task & { downloading?: boolean }) => {
  if (!task.id) return;
  task.downloading = true;
  try {
    const blob = await downloadTaskFile(task.id);
    saveAs(blob, task.fileName || `export_${task.id}.${task.fileType || 'xlsx'}`);
  } catch (error) {
    console.error("Download file error:", error);
    ElMessage.error('下载文件失败，请稍后重试或检查任务状态。');
  } finally {
    task.downloading = false;
  }
};

/**
 * @description 格式化状态显示
 * @param {TaskStatus} status - 状态值
 * @returns {string}
 */
const formatStatus = (status: TaskStatus): string => {
  switch (status) {
    case 0: return '排队中';
    case 1: return '处理中';
    case 2: return '已完成';
    case 3: return '失败';
    default: return '未知';
  }
}

/**
 * @description 获取状态标签类型
 * @param {TaskStatus} status - 状态值
 * @returns {string}
 */
const getStatusTagType = (status: TaskStatus): ('primary' | 'warning' | 'success' | 'danger' | 'info') => {
  switch (status) {
    case 0: return 'primary';
    case 1: return 'warning';
    case 2: return 'success';
    case 3: return 'danger';
    default: return 'info';
  }
}

/**
 * @description 格式化日期时间
 * @param _row
 * @param _column
 * @param {string | null} cellValue - 日期时间值
 * @returns {string}
 */
const formatDateTime = (_row: any, _column: any, cellValue: string | null): string => {
  if (!cellValue) return ''
  try {
    const date = new Date(cellValue)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch (e) {
    return ''
  }
}

/**
 * @description 启动自动刷新
 */
const startAutoRefresh = () => {
  if (refreshInterval) return;
  refreshInterval = window.setInterval(() => {
    console.log('Auto refreshing tasks...');
    const refreshQuery: TaskQuery = {
       page: query.page,
       pageSize: query.pageSize,
       taskType: filterTaskType.value === 'all' ? undefined : filterTaskType.value
     };
    getTasks(refreshQuery).then(data => {
        if (data && Array.isArray(data.list)) {
            const hasProcessing = data.list.some((task: Task) => task.status === 0 || task.status === 1);
            if (hasProcessing) {
                fetchData();
            } else {
                stopAutoRefresh();
                fetchData();
            }
        }
    }).catch(err => {
        console.error("Auto refresh error:", err);
        stopAutoRefresh();
    });
  }, 5000);
}

/**
 * @description 停止自动刷新
 */
const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('Stopped auto refreshing tasks.');
  }
}

/**
 * @description 格式化任务类型显示
 * @param {string | undefined} taskType - 任务类型值
 * @returns {string}
 */
const formatTaskType = (taskType: string | undefined): string => {
  switch (taskType) {
    case 'document_export': return '文档导出';
    case 'document_import': return '文档导入';
    default: return '未知类型';
  }
}

/**
 * @description 显示错误详情弹窗
 * @param {Task} task - 包含错误信息的任务对象
 */
const showErrorDetails = (task: Task) => {
  if (task.errorDetails) {
    try {
      const parsedDetails = JSON.parse(task.errorDetails);
      currentErrorDetails.value = JSON.stringify(parsedDetails, null, 2);
    } catch (e) {
      currentErrorDetails.value = task.errorDetails;
    }
  } else {
    currentErrorDetails.value = '没有可用的错误详情。';
  }
  errorDialogVisible.value = true;
};

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  stopAutoRefresh();
})

</script>

<style scoped>
.export-task-list-view {
  /* padding: 20px; */ /* 移除内边距，保持一致性 */
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter-controls {
  display: flex;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.el-progress {
  width: 100%;
}
.el-table .el-table__cell {
  &.error-column {
    /* background-color: #fef0f0; */
  }
}
pre {
  background-color: #f4f4f5;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
}
</style> 