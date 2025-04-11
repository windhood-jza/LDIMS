<template>
  <div class="export-task-list-view">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>我的导出任务</span>
          <el-button type="primary" :icon="'Refresh'" @click="fetchData" :loading="loading">刷新</el-button>
        </div>
      </template>

      <el-table :data="tasks" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="任务 ID" width="100" />
        <el-table-column prop="fileName" label="文件名称" min-width="200" show-overflow-tooltip>
           <template #default="{ row }">
            {{ row.fileName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="fileType" label="文件类型" width="100">
           <template #default="{ row }">
            <el-tag :type="row.fileType === 'xlsx' ? 'success' : 'primary'" size="small">{{ row.fileType?.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">{{ formatStatus(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress v-if="row.status === 'processing'" :percentage="row.progress || 0" :stroke-width="8" striped striped-flow />
            <span v-else>{{ row.progress !== null ? `${row.progress}%` : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" :formatter="formatDateTime" sortable />
         <el-table-column prop="errorMessage" label="错误信息" min-width="150" show-overflow-tooltip>
           <template #default="{ row }">
            <span style="color: #F56C6C;">{{ row.errorMessage || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              :disabled="row.status !== 2 || !row.filePath"
              @click="handleDownload(row)"
              :loading="row.downloading"
            >
              下载
            </el-button>
            <!-- 可以添加删除或重试按钮 -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElTag } from 'element-plus'
import { getExportTasks, downloadExportFile } from '@/services/api/export'
import type { ExportTask, ExportTaskQuery, ExportTaskStatus } from '@/types/export' // 确认类型路径
import { saveAs } from 'file-saver' // 需要安装 file-saver: npm install file-saver @types/file-saver

const tasks = ref<(ExportTask & { downloading?: boolean })[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive<ExportTaskQuery>({
  page: 1,
  pageSize: 10
})

let refreshInterval: number | null = null;

/**
 * @description 获取任务列表数据
 */
const fetchData = async () => {
  // console.log('[Debug] fetchData function called!'); // 移除调试日志
  loading.value = true
  try {
    // 假设 getExportTasks 在成功时直接返回 data 部分，失败时抛出错误
    const data = await getExportTasks(query);

    // --- 移除调试日志 ---
    // console.log('[Debug] Received data directly:', JSON.stringify(data));
    // console.log('[Debug] Array.isArray(data.list):', Array.isArray(data?.list));
    // console.log('[Debug] typeof data.total:', typeof data?.total);
    // --- 结束日志 ---

    // 检查返回的数据结构是否符合预期
    if (data && Array.isArray(data.list) && typeof data.total === 'number') {
        tasks.value = data.list.map(task => ({ ...task, downloading: false }));
        total.value = data.total;

        // 检查是否有正在处理的任务，如果有，则设置定时刷新
        const processingTasks = tasks.value.some(task => task.status === 'pending' || task.status === 'processing');
        if (processingTasks && !refreshInterval) {
          startAutoRefresh();
        } else if (!processingTasks && refreshInterval) {
          stopAutoRefresh();
        }
    } else {
      // 如果数据结构不符合预期（理论上不应发生，除非API或拦截器行为改变）
      console.error('Invalid data structure received from getExportTasks:', data);
      ElMessage.error('获取任务列表失败：数据格式错误');
      tasks.value = [];
      total.value = 0;
    }

  } catch (error: any) { // 捕获 API 调用本身抛出的错误
    console.error("Fetch export tasks error:", error);
    // 尝试从 error 对象中获取后端返回的错误信息 (如果 Axios 拦截器有处理)
    const message = error?.response?.data?.message || error?.message || '获取任务列表时发生错误';
    ElMessage.error(message);
    tasks.value = []; // 清空列表
    total.value = 0;
  } finally {
    loading.value = false
  }
}

/**
 * @description 处理下载文件
 * @param {ExportTask & { downloading?: boolean }} task - 任务对象
 */
const handleDownload = async (task: ExportTask & { downloading?: boolean }) => {
  if (!task.id) return;
  task.downloading = true;
  try {
    const blob = await downloadExportFile(task.id);
    // 使用 file-saver 下载 blob
    saveAs(blob, task.fileName || `export_${task.id}.${task.fileType || 'xlsx'}`);
  } catch (error) {
    console.error("Download export file error:", error);
    ElMessage.error('下载文件失败，请稍后重试或检查任务状态。');
  } finally {
    task.downloading = false;
  }
};

/**
 * @description 格式化状态显示
 * @param {ExportTaskStatus} status - 状态值
 * @returns {string}
 */
const formatStatus = (status: ExportTaskStatus): string => {
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
 * @param {ExportTaskStatus} status - 状态值
 * @returns {string}
 */
const getStatusTagType = (status: ExportTaskStatus): ('primary' | 'warning' | 'success' | 'danger' | 'info') => {
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
  if (refreshInterval) return; // 防止重复启动
  refreshInterval = window.setInterval(() => {
    console.log('Auto refreshing export tasks...');
    // 只获取第一页数据来检查状态，避免不必要的全量刷新
    // 或者可以专门做一个只获取状态的 API
    getExportTasks({ page: 1, pageSize: query.pageSize }).then(res => {
        if (res.code === 200) {
            const hasProcessing = res.data.list.some(task => task.status === 'pending' || task.status === 'processing');
            if (hasProcessing) {
                // 如果当前页面有变化或者有任务完成/失败，则刷新当前页
                // 简单起见，这里只要还有任务在处理就刷新当前页数据
                fetchData();
            } else {
                // 所有任务都处理完了，停止刷新并最后刷新一次
                stopAutoRefresh();
                fetchData();
            }
        }
    }).catch(err => {
        console.error("Auto refresh error:", err);
        // 可以选择停止刷新或忽略错误
        stopAutoRefresh();
    });
  }, 5000); // 每 5 秒刷新一次
}

/**
 * @description 停止自动刷新
 */
const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('Stopped auto refreshing export tasks.');
  }
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  stopAutoRefresh(); // 组件卸载时停止刷新
})

</script>

<style scoped>
.export-task-list-view {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
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
</style> 