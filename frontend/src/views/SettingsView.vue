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
          <el-icon><Setting /></el-icon> // Setting is unused if this is commented out
          <span>数据库配置</span>
        </el-menu-item>
        <el-menu-item index="serviceConfig">
          <el-icon><Platform /></el-icon> // Platform is unused if this is commented out
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
             <el-input v-model="logQuery.userId" placeholder="用户ID或用户名" clearable style="width: 180px;" />
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
                :model-value="logDateRange ?? undefined"
                @update:modelValue="val => logDateRange = val ?? undefined"
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
                   {{ operationTypeNames[row.operationType as OperationType] || row.operationType }}
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
// Removed Ref import (was line 124)
import { ref, reactive, onMounted, watch } from 'vue';
// Removed Setting, Platform import (was line 125) - They are only used in commented out template code
import { Document, Search, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElTable, ElTableColumn, ElPagination, ElDatePicker, ElForm, ElFormItem, ElInput, ElButton, ElIcon, ElContainer, ElAside, ElMain, ElMenu, ElMenuItem, ElSelect, ElOption, ElOptionGroup } from 'element-plus';
import { getOperationLogs } from '@/services/api/system'; // Assuming this path is correct
import type { OperationLogQuery, OperationLogInfo } from '@backend-types/operationLog'; // Assuming this path alias is correct
// Removed PageResult import (was line 129)
import { OperationType, OperationTypeNames, OperationTypeGroups } from '@/types/system'; // Assuming this path is correct

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
const logDateRange = ref<[string, string] | null>(null); // Keep null for logic, handle in template
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
    console.log('Fetching logs with query:', JSON.stringify(logQuery)); // 添加调试日志
    logLoading.value = true;
    try {
        const params: { [key: string]: string | number } = {}; // Use an index signature for dynamic params
        for (const key in logQuery) {
            const typedKey = key as keyof OperationLogQuery;
            const value = logQuery[typedKey];
            // Ensure value is not undefined, null, or empty string before assigning
            if (value !== '' && value !== null && value !== undefined) {
                // Now TS knows params can accept string keys, and value is string | number
                params[typedKey] = value;
            }
        }
        // Cast is likely still needed as getOperationLogs expects OperationLogQuery
        const result = await getOperationLogs(params as OperationLogQuery);
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
    logDateRange.value = null; // Resetting still uses null
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
  border-right: 1px solid #e4e7ed;
  background-color: #f4f4f5;
}

.settings-menu {
  border-right: none; /* 移除 el-menu 默认的右边框 */
  height: 100%;
}

/* 可以根据需要调整菜单项样式 */
.settings-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
}

.settings-menu .el-menu-item.is-active {
  background-color: #ecf5ff !important; /* Element Plus 蓝色背景 */
}

.settings-main {
  padding: 20px;
}

.settings-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.settings-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.log-search-form .el-form-item {
    margin-right: 15px;
    margin-bottom: 15px; /* 增加底部间距 */
}

/* 特别调整 Select 组件宽度 */
.operation-type-select {
    width: 200px; /* 根据需要调整宽度 */
}

</style>