<template>
  <div class="dashboard-container" v-loading="loading">
    <!-- 1. 统计卡片区 -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-header">文档总数</div>
          <div class="card-body">
            {{ summaryData?.stats?.totalDocuments?.count ?? "-" }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-header">文档类型数</div>
          <div class="card-body">
            {{ summaryData?.stats?.docTypes?.count ?? "-" }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-header">部门数</div>
          <div class="card-body">
            {{ summaryData?.stats?.departments?.count ?? "-" }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-header">用户数</div>
          <div class="card-body">
            {{ summaryData?.stats?.users?.count ?? "-" }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 2. 图表区 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card shadow="always" class="chart-card">
          <template #header>
            <div class="chart-header-container">
              <span class="card-header">文档类型分布</span>
              <div class="chart-type-selector">
                <el-radio-group
                  v-model="docTypeChartType"
                  size="small"
                  @change="handleDocTypeChartTypeChange"
                >
                  <el-radio-button :value="'treemap'">矩形树图</el-radio-button>
                  <el-radio-button :value="'bar'">条形图</el-radio-button>
                  <el-radio-button :value="'pie'">饼图</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div class="chart-container">
            <div ref="docTypeChartRef" class="chart-dom"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="always" class="chart-card">
          <template #header>
            <div class="chart-header-container">
              <span class="card-header">部门文档分布</span>
              <div class="chart-type-selector">
                <el-radio-group
                  v-model="deptChartType"
                  size="small"
                  @change="handleDeptChartTypeChange"
                >
                  <el-radio-button :value="'treemap'">矩形树图</el-radio-button>
                  <el-radio-button :value="'bar'">条形图</el-radio-button>
                  <el-radio-button :value="'pie'">饼图</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div class="chart-container">
            <div ref="departmentChartRef" class="chart-dom"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 3. 近期活动与状态 (可选，后续添加) -->
    <!-- ... -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { getDashboardSummary } from "@/services/api/dashboard";
import type { DashboardSummaryData } from "@ldims/types";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";

const loading = ref(false);
const summaryData = ref<DashboardSummaryData | null>(null);
const docTypeChartRef = ref<HTMLElement | null>(null);
const departmentChartRef = ref<HTMLElement | null>(null);

// 图表类型选择
const docTypeChartType = ref<"treemap" | "bar" | "pie">("treemap");
const deptChartType = ref<"treemap" | "bar" | "pie">("treemap");

// 图表是否已初始化
const chartsInitialized = ref(false);

// 图表实例
let docTypeChartInstance: echarts.ECharts | null = null;
let departmentChartInstance: echarts.ECharts | null = null;

// 为图表生成颜色
const generateColors = (count: number): string[] => {
  // 主题色区间
  const baseColors = [
    ["#4e79a7", "#6993bc", "#86aed0"], // 蓝色系
    ["#59a14f", "#7eb975", "#9fd19c"], // 绿色系
    ["#f28e2b", "#f5a654", "#f8be7e"], // 橙色系
    ["#e15759", "#e67c7e", "#eb9fa1"], // 红色系
    ["#76b7b2", "#93c6c2", "#b0d6d3"], // 青色系
    ["#edc948", "#f1d46b", "#f5df8f"], // 黄色系
  ];

  const colors: string[] = [];
  const colorGroups = baseColors.length;

  for (let i = 0; i < count; i++) {
    const groupIndex = i % colorGroups;
    const shadeIndex = Math.min(
      Math.floor(i / colorGroups),
      baseColors[groupIndex].length - 1
    );
    colors.push(baseColors[groupIndex][shadeIndex]);
  }

  return colors;
};

// 图表类型切换处理器
const handleDocTypeChartTypeChange = () => {
  if (
    summaryData.value &&
    summaryData.value.charts &&
    summaryData.value.charts.docsByType
  ) {
    renderDocTypeChart(summaryData.value.charts.docsByType);
  } else {
    console.warn("切换图表类型失败：文档类型数据不可用");
  }
};

const handleDeptChartTypeChange = () => {
  if (
    summaryData.value &&
    summaryData.value.charts &&
    summaryData.value.charts.docsByDepartment
  ) {
    renderDepartmentChart(summaryData.value.charts.docsByDepartment);
  } else {
    console.warn("切换图表类型失败：部门数据不可用");
  }
};

/**
 * @description 获取仪表盘汇总数据
 */
const fetchData = async () => {
  loading.value = true;
  try {
    console.log("正在获取仪表盘数据...");
    const res = await getDashboardSummary();
    console.log("仪表盘API响应:", res);

    // 验证数据结构
    if (!res || !res.charts) {
      throw new Error("API返回数据结构不正确");
    }

    if (!res.charts.docsByType || !res.charts.docsByDepartment) {
      console.warn("图表数据缺失或格式不正确");
    }

    summaryData.value = res;
    // 数据加载后渲染图表
    await nextTick(); // 确保 DOM 更新完毕
    renderCharts();
  } catch (error) {
    console.error("获取仪表盘数据失败:", error);
    ElMessage.error("获取仪表盘数据失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

/**
 * @description 渲染所有图表
 */
const renderCharts = () => {
  if (!summaryData.value || !summaryData.value.charts) {
    console.warn("无法渲染图表：数据不完整");
    return;
  }

  // 确保在DOM完全渲染后再初始化图表
  nextTick(() => {
    // 添加较长延迟确保DOM已完全渲染并有高度
    setTimeout(() => {
      console.log("开始初始化图表...");
      try {
        if (
          summaryData.value?.charts.docsByType &&
          summaryData.value.charts.docsByType.length > 0
        ) {
          renderDocTypeChart(summaryData.value.charts.docsByType);
        } else {
          console.warn("文档类型图表数据为空");
        }

        if (
          summaryData.value?.charts.docsByDepartment &&
          summaryData.value.charts.docsByDepartment.length > 0
        ) {
          renderDepartmentChart(summaryData.value.charts.docsByDepartment);
        } else {
          console.warn("部门图表数据为空");
        }

        chartsInitialized.value = true;
        console.log("图表初始化完成");

        // 在图表初始化完成后，确保尺寸正确适应容器
        setTimeout(() => {
          handleResize();
          // 再次调整以确保完美适配
          setTimeout(() => {
            handleResize();
          }, 300);
        }, 200);
      } catch (error) {
        console.error("图表渲染过程中出错：", error);
      }
    }, 600); // 延长延迟时间到600ms
  });
};

/**
 * @description 渲染文档类型图表
 * @param {NameValueData[]} data 图表数据
 */
const renderDocTypeChart = (
  data: DashboardSummaryData["charts"]["docsByType"]
) => {
  if (!docTypeChartRef.value) {
    console.warn("文档类型图表DOM引用不存在");
    return;
  }

  if (!data || data.length === 0) {
    console.warn("文档类型数据为空，不渲染图表");
    return;
  }

  try {
    // 销毁旧实例
    if (docTypeChartInstance) {
      docTypeChartInstance.dispose();
      docTypeChartInstance = null;
    }

    // 强制指定尺寸初始化
    docTypeChartInstance = echarts.init(docTypeChartRef.value, null, {
      renderer: "canvas",
    });

    console.log("文档类型图表实例已创建");

    // 复制并按值降序排序
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    // 为每个项目生成颜色
    const colors = generateColors(sortedData.length);

    // 基于选择的图表类型配置选项
    let option: echarts.EChartsOption;

    switch (docTypeChartType.value) {
      case "treemap":
        // 将数据转换为树形结构
        const treeData = sortedData.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: colors[index % colors.length],
          },
        }));

        option = {
          tooltip: {
            formatter: "{b}: {c} 个文档",
          },
          series: [
            {
              type: "treemap",
              data: treeData,
              width: "90%",
              height: "85%",
              top: "center",
              left: "center",
              breadcrumb: { show: false },
              roam: false,
              nodeClick: false,
              itemStyle: {
                borderColor: "#fff",
                borderWidth: 1,
              },
              label: {
                show: true,
                formatter: "{b}\n{c}",
                fontSize: 12,
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: "rgba(0, 0, 0, 0.3)",
                },
              },
              levels: [
                {
                  itemStyle: {
                    borderColor: "#fff",
                    borderWidth: 2,
                  },
                },
                {
                  itemStyle: {
                    borderColorSaturation: 0.6,
                  },
                },
              ],
            },
          ],
        };
        break;

      case "bar":
        // 控制显示项数量，只显示前15项
        const limitedData = sortedData.slice(0, 15);
        const otherSum = sortedData
          .slice(15)
          .reduce((sum, item) => sum + item.value, 0);

        if (otherSum > 0) {
          limitedData.push({ name: "其他类型", value: otherSum });
        }

        option = {
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
            formatter: "{b}: {c} 个文档",
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "5%",
            top: "3%",
            containLabel: true,
          },
          xAxis: {
            type: "value",
            boundaryGap: [0, 0.01],
          },
          yAxis: {
            type: "category",
            data: limitedData.map((item) => item.name),
            axisLabel: {
              interval: 0,
              width: 80,
              overflow: "truncate",
              fontSize: 11,
            },
          },
          series: [
            {
              name: "文档数量",
              type: "bar",
              data: limitedData.map((item, index) => ({
                value: item.value,
                itemStyle: {
                  color: colors[index] || colors[0],
                },
              })),
              itemStyle: {
                borderRadius: [0, 4, 4, 0],
                // 渐变色
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: "#5470c6" },
                  { offset: 1, color: "#91cc75" },
                ]),
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: "rgba(0, 0, 0, 0.3)",
                },
              },
            },
          ],
        };
        break;

      case "pie":
        // 控制饼图项数，只取前10项，其余为"其他"
        const topData = sortedData.slice(0, 10);
        const otherValue = sortedData
          .slice(10)
          .reduce((sum, item) => sum + item.value, 0);

        if (otherValue > 0) {
          topData.push({ name: "其他类型", value: otherValue });
        }

        option = {
          tooltip: {
            trigger: "item",
            formatter: "{b}: {c} 个文档 ({d}%)",
          },
          legend: {
            type: "scroll",
            orient: "vertical",
            right: 10,
            top: 25,
            bottom: 25,
            pageButtonItemGap: 5,
            pageButtonGap: 5,
            data: topData.map((item) => item.name),
          },
          series: [
            {
              name: "文档数量",
              type: "pie",
              radius: ["20%", "75%"],
              center: ["45%", "55%"],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 6,
                borderColor: "#fff",
                borderWidth: 2,
              },
              label: {
                show: false,
                position: "center",
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: "bold",
                },
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              },
              labelLine: {
                show: false,
              },
              data: topData.map((item, index) => ({
                name: item.name,
                value: item.value,
                itemStyle: {
                  color: colors[index],
                },
              })),
            },
          ],
        };
        break;
    }

    console.log("正在设置文档类型图表选项");
    docTypeChartInstance.setOption(option);
    console.log("文档类型图表选项已设置");
  } catch (error) {
    console.error("渲染文档类型图表时出错：", error);
  }
};

/**
 * @description 渲染部门文档图表
 * @param {NameValueData[]} data 图表数据
 */
const renderDepartmentChart = (
  data: DashboardSummaryData["charts"]["docsByDepartment"]
) => {
  if (!departmentChartRef.value) {
    console.warn("部门图表DOM引用不存在");
    return;
  }

  if (!data || data.length === 0) {
    console.warn("部门数据为空，不渲染图表");
    return;
  }

  try {
    // 销毁旧实例
    if (departmentChartInstance) {
      departmentChartInstance.dispose();
      departmentChartInstance = null;
    }

    // 强制指定尺寸初始化
    departmentChartInstance = echarts.init(departmentChartRef.value, null, {
      renderer: "canvas",
    });

    console.log("部门图表实例已创建");

    // 复制并按值降序排序
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    // 为每个项目生成颜色
    const colors = generateColors(sortedData.length);

    // 基于选择的图表类型配置选项
    let option: echarts.EChartsOption;

    switch (deptChartType.value) {
      case "treemap":
        // 将数据转换为树形结构
        const treeData = sortedData.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: colors[index % colors.length],
          },
        }));

        option = {
          tooltip: {
            formatter: "{b}: {c} 个文档",
          },
          series: [
            {
              type: "treemap",
              data: treeData,
              width: "90%",
              height: "85%",
              top: "center",
              left: "center",
              breadcrumb: { show: false },
              roam: false,
              nodeClick: false,
              itemStyle: {
                borderColor: "#fff",
                borderWidth: 1,
              },
              label: {
                show: true,
                formatter: "{b}\n{c}",
                fontSize: 12,
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: "rgba(0, 0, 0, 0.3)",
                },
              },
              levels: [
                {
                  itemStyle: {
                    borderColor: "#fff",
                    borderWidth: 2,
                  },
                },
                {
                  itemStyle: {
                    borderColorSaturation: 0.6,
                  },
                },
              ],
            },
          ],
        };
        break;

      case "bar":
        // 控制显示项数量，只显示前15项
        const limitedData = sortedData.slice(0, 15);
        const otherSum = sortedData
          .slice(15)
          .reduce((sum, item) => sum + item.value, 0);

        if (otherSum > 0) {
          limitedData.push({ name: "其他部门", value: otherSum });
        }

        option = {
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
            formatter: "{b}: {c} 个文档",
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "5%",
            top: "3%",
            containLabel: true,
          },
          xAxis: {
            type: "value",
            boundaryGap: [0, 0.01],
          },
          yAxis: {
            type: "category",
            data: limitedData.map((item) => item.name),
            axisLabel: {
              interval: 0,
              width: 80,
              overflow: "truncate",
              fontSize: 11,
            },
          },
          series: [
            {
              name: "文档数量",
              type: "bar",
              data: limitedData.map((item, index) => ({
                value: item.value,
                itemStyle: {
                  color: colors[index] || colors[0],
                },
              })),
              itemStyle: {
                borderRadius: [0, 4, 4, 0],
                // 渐变色 - 使用不同于文档类型的色系
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: "#5e40a4" },
                  { offset: 1, color: "#b678c4" },
                ]),
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: "rgba(0, 0, 0, 0.3)",
                },
              },
            },
          ],
        };
        break;

      case "pie":
        // 控制饼图项数，只取前10项，其余为"其他"
        const topData = sortedData.slice(0, 10);
        const otherValue = sortedData
          .slice(10)
          .reduce((sum, item) => sum + item.value, 0);

        if (otherValue > 0) {
          topData.push({ name: "其他部门", value: otherValue });
        }

        option = {
          tooltip: {
            trigger: "item",
            formatter: "{b}: {c} 个文档 ({d}%)",
          },
          legend: {
            type: "scroll",
            orient: "vertical",
            right: 10,
            top: 25,
            bottom: 25,
            pageButtonItemGap: 5,
            pageButtonGap: 5,
            data: topData.map((item) => item.name),
          },
          series: [
            {
              name: "文档数量",
              type: "pie",
              radius: ["20%", "75%"],
              center: ["45%", "55%"],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 6,
                borderColor: "#fff",
                borderWidth: 2,
              },
              label: {
                show: false,
                position: "center",
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: "bold",
                },
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              },
              labelLine: {
                show: false,
              },
              data: topData.map((item, index) => ({
                name: item.name,
                value: item.value,
                itemStyle: {
                  color: colors[index],
                },
              })),
            },
          ],
        };
        break;
    }

    console.log("正在设置部门图表选项");
    departmentChartInstance.setOption(option);
    console.log("部门图表选项已设置");
  } catch (error) {
    console.error("渲染部门图表时出错：", error);
  }
};

// 组件挂载后获取数据
onMounted(() => {
  // 先调整延迟一段时间后再获取数据
  setTimeout(() => {
    fetchData();
  }, 300);

  // 监听窗口大小变化，重绘图表
  window.addEventListener("resize", handleResize);
});

// 在组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

// 处理窗口大小变化的函数
const handleResize = () => {
  if (docTypeChartInstance) {
    docTypeChartInstance.resize();
  }
  if (departmentChartInstance) {
    departmentChartInstance.resize();
  }
};
</script>

<style scoped>
.dashboard-container {
  /* 移除内边距，让其跟随父级布局 */
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

.chart-section {
  margin-bottom: 0; /* 移除chart-section的底部边距 */
}

.chart-section .el-card {
  margin-bottom: 20px; /* 恢复卡片默认底部边距 */
}

.chart-card {
  height: 500px; /* 稍微调整卡片高度 */
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 430px; /* 对应调整图表容器高度 */
  position: relative;
  padding: 5px; /* 减小内边距 */
}

.chart-dom {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.chart-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-section .card-header {
  font-weight: bold;
}

.chart-type-selector {
  margin-left: auto;
}
</style>
