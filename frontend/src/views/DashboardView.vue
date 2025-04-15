<template>
  <div class="dashboard-container" v-loading="loading">
    <!-- 1. 统计卡片区 -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-header">文档总数</div>
          <div class="card-body">{{ summaryData?.stats?.totalDocuments?.count ?? '-' }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-header">文档类型数</div>
          <div class="card-body">{{ summaryData?.stats?.docTypes?.count ?? '-' }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-header">部门数</div>
          <div class="card-body">{{ summaryData?.stats?.departments?.count ?? '-' }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-header">用户数</div>
          <div class="card-body">{{ summaryData?.stats?.users?.count ?? '-' }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 2. 图表区 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card shadow="always">
          <template #header>
            <div class="card-header">文档类型分布</div>
          </template>
          <div ref="docTypeChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="always">
          <template #header>
            <div class="card-header">部门文档分布</div>
          </template>
          <div ref="departmentChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 3. 近期活动与状态 (可选，后续添加) -->
    <!-- ... -->

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { getDashboardSummary } from '@/services/api/dashboard'; // 确保路径正确
import type { DashboardSummaryData } from '@/types/dashboard'; // 确保路径正确
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const summaryData = ref<DashboardSummaryData | null>(null);
const docTypeChartRef = ref<HTMLElement | null>(null);
const departmentChartRef = ref<HTMLElement | null>(null);

let docTypeChartInstance: echarts.ECharts | null = null;
let departmentChartInstance: echarts.ECharts | null = null;

/**
 * @description 获取仪表盘汇总数据
 */
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getDashboardSummary();
    // 在赋值前打印 res 的内容，确认拦截器返回的是什么
    console.log('API response (res):', res);
    // 直接将 res 赋值给 summaryData
    summaryData.value = res;
    console.log('Dashboard data (after assignment):', summaryData.value);
    // 数据加载后渲染图表
    await nextTick(); // 确保 DOM 更新完毕
    renderCharts();
  } catch (error) {
    console.error("获取仪表盘数据失败:", error);
    ElMessage.error('获取仪表盘数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/**
 * @description 渲染所有图表
 */
const renderCharts = () => {
  if (summaryData.value) {
    renderDocTypeChart(summaryData.value.charts.docsByType);
    renderDepartmentChart(summaryData.value.charts.docsByDepartment);
  }
};

/**
 * @description 渲染文档类型饼图
 * @param {NameValueData[]} data 图表数据
 */
const renderDocTypeChart = (data: DashboardSummaryData['charts']['docsByType']) => {
  if (!docTypeChartRef.value) return;
  if (!docTypeChartInstance) {
    docTypeChartInstance = echarts.init(docTypeChartRef.value);
  }
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: '文档数量',
        type: 'pie',
        radius: '70%',
        center: ['65%', '50%'], // 调整中心位置以适应图例
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  docTypeChartInstance.setOption(option);
};

/**
 * @description 渲染部门文档饼图
 * @param {NameValueData[]} data 图表数据
 */
const renderDepartmentChart = (data: DashboardSummaryData['charts']['docsByDepartment']) => {
  if (!departmentChartRef.value) return;
  if (!departmentChartInstance) {
    departmentChartInstance = echarts.init(departmentChartRef.value);
  }
  const option: echarts.EChartsOption = {
     tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: '文档数量',
        type: 'pie',
        radius: '70%',
        center: ['65%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  departmentChartInstance.setOption(option);
};

// 组件挂载后获取数据
onMounted(() => {
  fetchData();
});

// 监听窗口大小变化，重绘图表 (可选但推荐)
// window.addEventListener('resize', () => {
//   docTypeChartInstance?.resize();
//   departmentChartInstance?.resize();
// });

</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.summary-cards .el-card {
  margin-bottom: 20px;
  text-align: center;
}

.summary-cards .card-header {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

.summary-cards .card-body {
  font-size: 24px;
  font-weight: bold;
}

.chart-section .el-card {
  margin-bottom: 20px;
}

.chart-section .card-header {
  font-weight: bold;
}
</style>
