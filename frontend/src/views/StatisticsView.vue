<template>
  <div class="statistics-view">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>按部门统计</span>
            </div>
          </template>
          <div ref="departmentChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>按文档类型统计</span>
            </div>
          </template>
          <div ref="docTypeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElRow, ElCol, ElCard } from 'element-plus';
import { getStatsByDepartment, getStatsByDocType } from '@/services/api/statistics';
import type { NameValueData } from '@backend-types/statistics';
import * as echarts from 'echarts/core';
import {
    BarChart,
    PieChart,
    // LineChart,
    // PieChart
} from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    // 如果需要其他组件，在此导入
    // DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册 ECharts 必须的组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    BarChart,
    PieChart,
    CanvasRenderer
]);

const departmentChartRef = ref<HTMLElement | null>(null);
const docTypeChartRef = ref<HTMLElement | null>(null);

let departmentChart: echarts.ECharts | null = null;
let docTypeChart: echarts.ECharts | null = null;

/**
 * @description 初始化部门统计饼图
 * @param {NameValueData[]} data - 统计数据
 */
const initDepartmentChart = (data: NameValueData[]) => {
  if (departmentChartRef.value && !departmentChart) {
    departmentChart = echarts.init(departmentChartRef.value);
  }
  if (departmentChart) {
    const option = {
      title: {
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle'
      },
      series: [
        {
          name: '文档数量',
          type: 'pie',
          radius: '70%',
          center: ['60%', '55%'],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}: {d}%'
          }
        }
      ]
    };
    departmentChart.setOption(option);
  }
};

/**
 * @description 初始化文档类型统计饼图
 * @param {NameValueData[]} data - 统计数据
 */
const initDocTypeChart = (data: NameValueData[]) => {
  if (docTypeChartRef.value && !docTypeChart) {
    docTypeChart = echarts.init(docTypeChartRef.value);
  }
  if (docTypeChart) {
     const option = {
        title: {
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 'middle'
        },
        series: [
            {
                name: '文档数量',
                type: 'pie',
                radius: '70%',
                center: ['60%', '55%'],
                data: data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    formatter: '{b}: {d}%'
                }
            }
        ]
    };
    docTypeChart.setOption(option);
  }
};


const fetchData = async () => {
  try {
    const [deptData, typeData] = await Promise.all([
      getStatsByDepartment(),
      getStatsByDocType()
    ]);
    console.log('Department Stats:', deptData);
    console.log('DocType Stats:', typeData);
    
    // 使用 nextTick 确保 DOM 元素已准备好
    nextTick(() => {
        initDepartmentChart(deptData);
        initDocTypeChart(typeData);
    });

  } catch (error) {
    console.error('Failed to fetch statistics data:', error);
    ElMessage.error('获取统计数据失败');
  }
};

onMounted(() => {
  fetchData();
});

// 可选：添加图表 resize 监听
// window.addEventListener('resize', () => {
//   departmentChart?.resize();
//   docTypeChart?.resize();
// });

// onUnmounted(() => {
//   window.removeEventListener('resize', ...);
//   departmentChart?.dispose();
//   docTypeChart?.dispose();
// });

</script>

<style scoped>
.statistics-view {
  padding: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 400px; /* Adjust height as needed */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 