<template>
  <el-container class="settings-container">
    <!-- 左侧菜单 -->
    <el-aside width="200px" class="settings-aside">
      <el-menu
        :default-active="activeSection"
        class="settings-menu"
        @select="handleMenuSelect"
        background-color="#f4f4f5"
        text-color="#303133"
        active-text-color="#409EFF"
      >
        <!-- 新增基本设置菜单项 -->
        <el-menu-item index="basicSettings">
          <el-icon><Setting /></el-icon>
          <span>基本设置</span>
        </el-menu-item>
        <!-- 操作日志菜单项 -->
        <el-menu-item index="operationLog">
          <el-icon><Document /></el-icon>
          <span>操作日志</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容区 -->
    <el-main class="settings-main">
      <!-- 基本设置内容区 -->
      <div v-if="activeSection === 'basicSettings'" class="settings-section">
        <h2>基本设置</h2>
        <el-card class="box-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>存储设置</span>
            </div>
          </template>
          <el-form
            :model="configForm"
            label-width="120px"
            ref="configFormRef"
            @submit.prevent
          >
            <el-form-item label="文件存储路径" prop="FILE_STORAGE_PATH">
              <el-input
                v-model="configForm.FILE_STORAGE_PATH"
                placeholder="请输入服务器上的绝对路径"
              ></el-input>
              <div class="el-form-item__tip">
                服务器上的绝对路径，请确保存储路径存在且服务有读写权限。修改后可能需要重启后端服务。
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="handleSaveConfigs"
                :loading="configLoading"
                >保存设置</el-button
              >
            </el-form-item>
          </el-form>
        </el-card>
        <!-- 可以在这里添加其他基本设置卡片 -->
      </div>

      <!-- 操作日志内容区 (保持不变) -->
      <div v-if="activeSection === 'operationLog'" class="settings-section">
        <h2>操作日志</h2>
        <!-- 筛选区域 -->
        <el-form :inline="true" :model="logQuery" class="log-search-form">
          <el-form-item label="操作用户">
            <el-input
              v-model="logQuery.userId"
              placeholder="用户ID或用户名"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="操作类型">
            <el-select
              v-model="logQuery.operationType"
              placeholder="请选择操作类型"
              clearable
              class="operation-type-select"
            >
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
              @update:modelValue="(val) => (logDateRange = val ?? undefined)"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              clearable
              style="width: 240px"
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
          <el-table-column
            prop="createdAt"
            label="操作时间"
            width="180"
            sortable="custom"
          />
          <el-table-column label="操作用户" width="150" sortable="custom">
            <template #default="{ row }">
              {{ row.realName || row.username || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="操作类型" width="150" sortable="custom">
            <template #default="{ row }">
              {{
                operationTypeNames[row.operationType as OperationType] ||
                row.operationType
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="operationContent"
            label="操作内容"
            min-width="250"
          />
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
          style="margin-top: 20px; display: flex; justify-content: flex-end"
        />
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { Setting, Document, Search, Refresh } from "@element-plus/icons-vue";
import {
  ElMessage,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElIcon,
  ElContainer,
  ElAside,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElSelect,
  ElOption,
  ElOptionGroup,
  ElCard,
  FormInstance,
} from "element-plus";
import {
  getOperationLogs,
  getSystemConfigs,
  updateSystemConfigs,
} from "@/services/api/system";
import type {
  OperationLogQuery,
  OperationLogInfo,
} from "@backend-types/operationLog";
import {
  OperationType,
  OperationTypeNames,
  OperationTypeGroups,
} from "@/types/system";

// 假设 SystemConfigMap 类型定义
interface SystemConfigMap {
  [key: string]: string | number | boolean | null | undefined;
  FILE_STORAGE_PATH?: string;
}

// --- 响应式状态 ---
const activeSection = ref<string>("basicSettings"); // 默认激活基本设置

// 配置相关状态
const configLoading = ref(false);
const configFormRef = ref<FormInstance>();
const configForm = reactive<Partial<SystemConfigMap>>({
  FILE_STORAGE_PATH: "",
});

// 操作类型映射 (日志用)
const operationTypeNames = OperationTypeNames;
const operationTypeGroups = OperationTypeGroups;

// 日志相关状态 (保持不变)
const logQuery = reactive<OperationLogQuery>({
  page: 1,
  pageSize: 10,
  userId: "",
  operationType: "",
  startDate: "",
  endDate: "",
  sortField: "createdAt",
  sortOrder: "DESC",
});
const logDateRange = ref<[string, string] | null>(null);
const logs = ref<OperationLogInfo[]>([]);
const logTotal = ref<number>(0);
const logLoading = ref<boolean>(false);

// --- 生命周期钩子 ---
onMounted(() => {
  fetchConfigs(); // 获取配置
  fetchLogs(); // 获取日志 (如果默认显示日志，或者希望预加载)
});

// --- 监听器 ---
watch(logDateRange, (newRange) => {
  logQuery.startDate = newRange?.[0] || "";
  logQuery.endDate = newRange?.[1] || "";
});

// --- 方法 ---

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  activeSection.value = index;
  // 可选：如果切换到配置且尚未加载，则加载；如果切换到日志且尚未加载，则加载
  // if (index === 'basicSettings' && !configForm.FILE_STORAGE_PATH) fetchConfigs();
  // if (index === 'operationLog' && logs.value.length === 0) fetchLogs();
};

// 获取配置
const fetchConfigs = async () => {
  configLoading.value = true;
  try {
    const configs = await getSystemConfigs();
    if (configs && configs.FILE_STORAGE_PATH !== undefined) {
      configForm.FILE_STORAGE_PATH = configs.FILE_STORAGE_PATH;
    }
    console.log("Fetched system configs:", configs);
  } catch (error) {
    ElMessage.error("获取系统配置失败");
    console.error("Fetch configs error:", error);
  } finally {
    configLoading.value = false;
  }
};

// 保存配置
const handleSaveConfigs = async () => {
  configLoading.value = true;
  try {
    const payload: Partial<SystemConfigMap> = {
      FILE_STORAGE_PATH: configForm.FILE_STORAGE_PATH,
    };
    await updateSystemConfigs(payload);
    ElMessage.success("系统设置保存成功");
  } catch (error) {
    ElMessage.error("保存系统设置失败");
    console.error("Save configs error:", error);
  } finally {
    configLoading.value = false;
  }
};

// 日志相关方法 (保持不变)
const fetchLogs = async () => {
  console.log("Fetching logs with query:", JSON.stringify(logQuery)); // 添加调试日志
  logLoading.value = true;
  try {
    const params: { [key: string]: string | number } = {}; // Use an index signature for dynamic params
    for (const key in logQuery) {
      const typedKey = key as keyof OperationLogQuery;
      const value = logQuery[typedKey];
      // Ensure value is not undefined, null, or empty string before assigning
      if (value !== "" && value !== null && value !== undefined) {
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
const handleLogSortChange = ({
  prop,
  order,
}: {
  prop: string | null;
  order: "ascending" | "descending" | null;
}) => {
  if (prop) {
    logQuery.sortField = prop;
    logQuery.sortOrder = order === "ascending" ? "ASC" : "DESC";
  } else {
    logQuery.sortField = "createdAt";
    logQuery.sortOrder = "DESC";
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
  logQuery.userId = "";
  logQuery.operationType = "";
  logQuery.startDate = "";
  logQuery.endDate = "";
  logDateRange.value = null; // Resetting still uses null
  logQuery.sortField = "createdAt";
  logQuery.sortOrder = "DESC";
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

.box-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.el-form-item__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
