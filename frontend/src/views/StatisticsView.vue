<template>
  <div class="statistics-container">
    <div class="filter-container">
      <el-card shadow="hover">
        <div class="date-range-picker">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
          <el-button type="primary" @click="applyDateFilter">应用筛选</el-button>
          <el-button @click="resetDateFilter">重置</el-button>
        </div>
      </el-card>
    </div>
    
    <div class="charts-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>按部门统计</span>
              </div>
            </template>
            <div ref="departmentChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>按文档类型统计</span>
              </div>
            </template>
            <div ref="docTypeChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
} from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { getStatsByDepartment, getStatsByDocType } from '@/services/api/statistics';
import type { NameValueData } from '@backend-types/statistics';
import { ElMessage } from 'element-plus';

// 注册需要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
  ToolboxComponent
]);

const departmentChartRef = ref<HTMLElement | null>(null);
const docTypeChartRef = ref<HTMLElement | null>(null);
const departmentChart = ref<echarts.ECharts | null>(null);
const docTypeChart = ref<echarts.ECharts | null>(null);
const dateRange = ref<[string, string] | null>(null);
const isLoading = ref(false);

// 获取部门统计数据
const fetchDepartmentStats = async () => {
  try {
    isLoading.value = true;
    const params = dateRange.value ? {
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    } : undefined;
    
    const data = await getStatsByDepartment(params);
    renderDepartmentChart(data);
  } catch (error) {
    console.error('获取部门统计数据失败:', error);
    ElMessage.error('获取部门统计数据失败');
  } finally {
    isLoading.value = false;
  }
};

// 获取文档类型统计数据
const fetchDocTypeStats = async () => {
  try {
    isLoading.value = true;
    const params = dateRange.value ? {
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    } : undefined;
    
    const data = await getStatsByDocType(params);
    renderDocTypeChart(data);
  } catch (error) {
    console.error('获取文档类型统计数据失败:', error);
    ElMessage.error('获取文档类型统计数据失败');
  } finally {
    isLoading.value = false;
  }
};

// 渲染部门统计图表
const renderDepartmentChart = (data: NameValueData[]) => {
  if (!departmentChartRef.value) return;
  
  if (!departmentChart.value) {
    departmentChart.value = echarts.init(departmentChartRef.value);
  }
  
  const option = {
    title: {
      text: '文档按部门分布',
      left: 'center',
      subtext: data.length > 0 ? `总数量: ${data.reduce((sum, item) => sum + item.value, 0)}` : '',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 40,
      bottom: 20,
      selectedMode: true
    },
    toolbox: {
      show: true,
      feature: {
        dataView: { show: true, readOnly: true, title: '查看数据' },
        saveAsImage: { show: true, title: '保存为图片' },
        restore: { show: true, title: '还原' }
      }
    },
    series: [
      {
        name: '部门文档数',
        type: 'pie',
        radius: ['35%', '70%'],
        center: ['40%', '55%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c} ({d}%)',
          fontSize: 12,
          alignTo: 'labelLine',
          overflow: 'break',
          color: '#444'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#222'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          smooth: true
        },
        labelLayout: {
          hideOverlap: true
        },
        data: data
      }
    ]
  };
  
  departmentChart.value.setOption(option);
  window.addEventListener('resize', () => {
    departmentChart.value?.resize();
  });
};

// 渲染文档类型统计图表
const renderDocTypeChart = (data: NameValueData[]) => {
  if (!docTypeChartRef.value) return;
  
  if (!docTypeChart.value) {
    docTypeChart.value = echarts.init(docTypeChartRef.value);
  }
  
  const option = {
    title: {
      text: '文档按类型分布',
      left: 'center',
      subtext: data.length > 0 ? `总数量: ${data.reduce((sum, item) => sum + item.value, 0)}` : '',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 40,
      bottom: 20,
      selectedMode: true
    },
    toolbox: {
      show: true,
      feature: {
        dataView: { show: true, readOnly: true, title: '查看数据' },
        saveAsImage: { show: true, title: '保存为图片' },
        restore: { show: true, title: '还原' }
      }
    },
    series: [
      {
        name: '类型文档数',
        type: 'pie',
        radius: ['35%', '70%'],
        center: ['40%', '55%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c} ({d}%)',
          fontSize: 12,
          alignTo: 'labelLine',
          overflow: 'break',
          color: '#444'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#222'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          smooth: true
        },
        labelLayout: {
          hideOverlap: true
        },
        data: data
      }
    ]
  };
  
  docTypeChart.value.setOption(option);
  window.addEventListener('resize', () => {
    docTypeChart.value?.resize();
  });
};

// 日期范围变更处理
const handleDateRangeChange = (val: [string, string] | null) => {
  dateRange.value = val;
};

// 应用日期筛选
const applyDateFilter = () => {
  fetchDepartmentStats();
  fetchDocTypeStats();
};

// 重置日期筛选
const resetDateFilter = () => {
  dateRange.value = null;
  fetchDepartmentStats();
  fetchDocTypeStats();
};

// 初始化
onMounted(() => {
  fetchDepartmentStats();
  fetchDocTypeStats();
});
</script>

<style scoped>
.statistics-container {
  padding: 0; /* 完全移除外边距 */
}

.filter-container {
  margin-bottom: 5px; /* 进一步减小筛选区域的下边距 */
}

.date-range-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.charts-container {
  margin-top: 5px; /* 进一步减小图表区域的上边距 */
}

.chart-card {
  margin-bottom: 5px; /* 进一步减小图表卡片的下边距 */
}

.chart {
  height: 450px; /* 增加图表高度，填满更多空间 */
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 覆盖Element Plus卡片的默认内边距 */
:deep(.el-card__body) {
  padding: 10px;
}

:deep(.el-card__header) {
  padding: 10px;
}
</style> 