<template>
  <el-container class="settings-container">
    <!-- 左侧菜单 (保留结构，只显示日志) -->
    <el-aside width="200px" class="settings-aside">
      <el-menu
        :default-active="activeSection"
        class="settings-menu"
        @select="handleMenuSelect"
        background-color="#f4f4f5"
        text-color="#303133"
        active-text-color="#409EFF"
      >
        <!-- 保留数据库配置和服务配置的注释，方便未来恢复 -->
        <!--
        <el-menu-item index="dbConfig">
          <el-icon><Setting /></el-icon>
          <span>数据库配置</span>
        </el-menu-item>
        <el-menu-item index="serviceConfig">
          <el-icon><Platform /></el-icon>
          <span>服务配置</span>
        </el-menu-item>
        -->
        <el-menu-item index="operationLog">
         <el-icon><Document /></el-icon>
          <span>操作日志</span>
        </el-menu-item>
        <!-- 未来可在此处添加新的菜单项 -->
      </el-menu>
    </el-aside>

    <!-- 右侧内容区 (只显示日志) -->
    <el-main class="settings-main">
      <div class="settings-section"> <!-- 直接渲染日志内容 -->
        <h2>操作日志</h2>

        <!-- 筛选区域 -->
        <el-form :inline="true" :model="logQuery" class="log-search-form">
           <el-form-item label="操作用户">
             <el-input v-model="logQuery.userId" placeholder="用户ID或用户名" clearable />
           </el-form-item>
           <el-form-item label="操作类型">
             <el-select v-model="logQuery.operationType" placeholder="请选择操作类型" clearable class="operation-type-select">
               <el-option-group
                 v-for="group in operationTypeGroups"
                 :key="group.label"
                 :label="group.label"
               >
                 <el-option
                   v-for="type in group.types"
                   :key="type"
                   :label="operationTypeNames[type]"
                   :value="type"
                 />
               </el-option-group>
             </el-select>
           </el-form-item>
           <el-form-item label="操作时间">
              <el-date-picker
                v-model="logDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                clearable
                style="width: 240px;"
              />
           </el-form-item>
           <el-form-item>
             <el-button type="primary" @click="handleLogSearch">
               <el-icon><Search /></el-icon> 查询
             </el-button>
             <el-button @click="resetLogSearch">
               <el-icon><Refresh /></el-icon> 重置
             </el-button>
           </el-form-item>
        </el-form>

        <!-- 日志列表 -->
         <el-table
           :data="logs"
           v-loading="logLoading"
           style="width: 100%"
           border
           @sort-change="handleLogSortChange"
         >
           <el-table-column prop="id" label="ID" width="80" sortable="custom" />
           <el-table-column prop="createdAt" label="操作时间" width="180" sortable="custom" />
           <el-table-column label="操作用户" width="150" sortable="custom">
                <template #default="{ row }">
                   {{ row.realName || row.username || '-' }}
                </template>
           </el-table-column>
           <el-table-column label="操作类型" width="150" sortable="custom">
                <template #default="{ row }">
                   {{ operationTypeNames[row.operationType] || row.operationType }}
                </template>
           </el-table-column>
           <el-table-column prop="operationContent" label="操作内容" min-width="250" />
           <el-table-column prop="ipAddress" label="IP 地址" width="150" />
         </el-table>

        <!-- 分页 -->
        <el-pagination
          v-if="logTotal > 0"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="logTotal"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="logQuery.pageSize"
          :current-page="logQuery.page"
          @size-change="handleLogSizeChange"
          @current-change="handleLogPageChange"
          style="margin-top: 20px; display: flex; justify-content: flex-end;"
        />
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
// 恢复导入的图标和组件
import { Setting, Platform, Document, Search, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElTable, ElTableColumn, ElPagination, ElDatePicker, ElForm, ElFormItem, ElInput, ElButton, ElIcon, ElContainer, ElAside, ElMain, ElMenu, ElMenuItem, ElSelect, ElOption, ElOptionGroup } from 'element-plus';
// 只保留 getOperationLogs
import { getOperationLogs } from '@/services/api/system';
import type { OperationLogQuery, OperationLogInfo } from '@backend-types/services/OperationLogService';
import type { PageResult } from '@backend-types/utils/response';
// 导入操作类型枚举和名称映射
import { OperationType, OperationTypeNames, OperationTypeGroups } from '@/types/system';

// --- 响应式状态 ---
const activeSection = ref<string>('operationLog'); // 默认激活日志

// 操作类型映射 - 便于模板使用
const operationTypeNames = OperationTypeNames;
const operationTypeGroups = OperationTypeGroups;

// 日志相关状态 (保持不变)
const logQuery = reactive<OperationLogQuery>({ 
    page: 1,
    pageSize: 10,
    userId: '',
    operationType: '',
    startDate: '',
    endDate: '',
    sortField: 'createdAt',
    sortOrder: 'DESC',
 });
const logDateRange = ref<[string, string] | null>(null);
const logs = ref<OperationLogInfo[]>([]);
const logTotal = ref<number>(0);
const logLoading = ref<boolean>(false);

// --- 生命周期钩子 ---
onMounted(() => {
  fetchLogs(); // 初始加载日志
});

// --- 监听器 ---
watch(logDateRange, (newRange) => {
  logQuery.startDate = newRange?.[0] || '';
  logQuery.endDate = newRange?.[1] || '';
});


// --- 方法 ---

/**
 * @description 处理菜单项选择事件 (保留结构，虽然目前只有一个有效项)
 */
const handleMenuSelect = (index: string) => {
  // 暂时不需要根据 index 切换内容，但保留函数以便未来扩展
  activeSection.value = index;
  // 如果未来添加了其他菜单项，可以在这里添加加载逻辑
};


// 日志相关方法 (保持不变)
const fetchLogs = async () => { 
    logLoading.value = true;
    try {
        const params: OperationLogQuery = {};
        for (const key in logQuery) {
            if (logQuery[key as keyof OperationLogQuery] !== '' && logQuery[key as keyof OperationLogQuery] !== null) {
                params[key as keyof OperationLogQuery] = logQuery[key as keyof OperationLogQuery];
            }
        }
        const result = await getOperationLogs(params);
        logs.value = result.list;
        logTotal.value = result.total;
    } catch (error: any) {
        ElMessage.error(`获取操作日志失败: ${error.message}`);
        logs.value = [];
        logTotal.value = 0;
    } finally {
        logLoading.value = false;
    }
 };
const handleLogSizeChange = (size: number) => { 
    logQuery.pageSize = size;
    logQuery.page = 1;
    fetchLogs();
 };
const handleLogPageChange = (page: number) => { 
    logQuery.page = page;
    fetchLogs();
 };
const handleLogSortChange = ({ prop, order }: { prop: string | null; order: 'ascending' | 'descending' | null }) => { 
    if (prop) {
        logQuery.sortField = prop;
        logQuery.sortOrder = order === 'ascending' ? 'ASC' : 'DESC';
    } else {
        logQuery.sortField = 'createdAt';
        logQuery.sortOrder = 'DESC';
    }
    logQuery.page = 1;
    fetchLogs();
 };
const handleLogSearch = () => { 
    logQuery.page = 1;
    fetchLogs();
 };
const resetLogSearch = () => { 
    logQuery.page = 1;
    logQuery.userId = '';
    logQuery.operationType = '';
    logQuery.startDate = '';
    logQuery.endDate = '';
    logDateRange.value = null;
    logQuery.sortField = 'createdAt';
    logQuery.sortOrder = 'DESC';
    fetchLogs();
 };

</script>

<style scoped>
/* 恢复之前的样式 */
.settings-container {
  height: calc(100vh - 60px);
  border-top: 1px solid #e4e7ed;
}

.settings-aside {
  background-color: #f4f4f5;
  border-right: 1px solid #e4e7ed;
  height: 100%;
}

.settings-menu {
  border-right: none;
  height: 100%;
}

.settings-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
}
.settings-menu .el-menu-item.is-active {
    background-color: #e6f7ff;
}


.settings-main {
  padding: 20px;
  background-color: #ffffff;
  height: 100%;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-section h2 {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-size: 18px;
  color: #303133;
}

.log-search-form .el-form-item {
  margin-bottom: 10px;
}

.operation-type-select {
  width: 180px;
}

.settings-section {
  margin-bottom: 20px;
}

.log-search-form {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style> 