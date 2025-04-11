<template>
  <el-dialog
    v-model="dialogVisible"
    title="导出选项"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form label-width="100px">
      <el-form-item label="选择字段">
        <el-checkbox-group v-model="selectedFields">
          <!-- 字段选项将动态加载或预定义 -->
          <el-checkbox v-for="field in availableFields" :key="field.value" :label="field.value">
            {{ field.label }}
          </el-checkbox>
        </el-checkbox-group>
        <el-button type="text" @click="selectAllFields" style="margin-left: 10px;">全选</el-button>
        <el-button type="text" @click="deselectAllFields">取消全选</el-button>
      </el-form-item>
      <el-form-item label="文件类型">
        <el-radio-group v-model="fileType">
          <el-radio label="xlsx">Excel (.xlsx)</el-radio>
          <el-radio label="csv">CSV (.csv)</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确认导出
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineExpose, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { requestExport } from '@/services/api/export' // 确认路径是否正确

interface FieldOption {
  label: string;
  value: string;
}

// 可选的字段列表，需要根据实际 DocumentInfo 结构定义
// 可以考虑从外部传入或在此处硬编码
const availableFields = ref<FieldOption[]>([
  { label: '文档 ID', value: 'id' },
  { label: '文档名称', value: 'docName' },
  { label: '文档类型', value: 'docTypeName' },
  { label: '来源部门', value: 'sourceDepartmentName' }, // 注意这里是 Name
  { label: '提交人', value: 'submitter' },
  { label: '接收人', value: 'receiver' },
  { label: '签收（章）人', value: 'signer' },
  { label: '交接日期', value: 'handoverDate' },
  { label: '保管位置', value: 'storageLocation' },
  { label: '备注', value: 'remarks' },
  { label: '创建人', value: 'createdByName' },
  { label: '创建时间', value: 'createdAt' },
  { label: '最后修改人', value: 'updatedByName' }, // 假设有这个字段
  { label: '最后修改时间', value: 'updatedAt' },
]);

const dialogVisible = ref(false)
const loading = ref(false)
const selectedFields = ref<string[]>([])
const fileType = ref('xlsx') // 默认导出 xlsx
const currentQueryCriteria = ref<any>(null) // 用于存储触发导出时的查询条件

const emit = defineEmits(['export-started']) // 定义导出开始事件

/**
 * @description 打开弹窗
 * @param {any} query - 当前的查询条件
 */
const open = (query: any) => {
  currentQueryCriteria.value = query;
  // 默认全选所有字段
  selectedFields.value = availableFields.value.map(f => f.value);
  dialogVisible.value = true
}

/**
 * @description 关闭弹窗
 */
const handleClose = () => {
  if (loading.value) return; // 防止提交过程中关闭
  dialogVisible.value = false
  // 清理状态可以在这里做，但 open 时会重置
}

/**
 * @description 提交导出请求
 */
const handleSubmit = async () => {
  if (!selectedFields.value.length) {
    ElMessage.warning('请至少选择一个要导出的字段');
    return;
  }
  loading.value = true;
  try {
    // 假设 requestExport 在成功时直接返回 data: { taskId: number }
    const resultData = await requestExport(currentQueryCriteria.value, selectedFields.value, fileType.value);

    // 检查返回的数据是否包含 taskId
    if (resultData && typeof resultData.taskId === 'number') {
      // 成功路径
      console.log('[Debug] handleSubmit: Success path executing.');
      ElMessage.success('导出任务已创建，请稍后在"导出任务"页面查看进度和下载。');
      emit('export-started', resultData.taskId); // 触发事件，传递任务 ID
      handleClose();
    } else {
      // 如果成功但数据结构不对（理论上不太可能发生）
      console.error('Invalid data structure received after creating export task:', resultData);
      console.log('[Debug] handleSubmit: Invalid data structure path executing.');
      ElMessage.error('创建导出任务失败：响应数据异常');
    }
  } catch (error: any) { // 捕获 API 调用本身的错误 (例如 4xx, 5xx)
    console.error('Request export error:', error);
    const message = error?.response?.data?.message || error?.message || '创建导出任务时发生错误';
    console.log('[Debug] handleSubmit: Catch block executing.');
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
}

/**
 * @description 全选所有字段
 */
const selectAllFields = () => {
  selectedFields.value = availableFields.value.map(f => f.value);
}

/**
 * @description 取消全选所有字段
 */
const deselectAllFields = () => {
  selectedFields.value = [];
}

// 暴露 open 方法给父组件调用
defineExpose({
  open
})
</script>

<style scoped>
/* 可以添加一些样式 */
.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
}
.el-checkbox {
  width: 150px; /* 控制每行显示数量 */
  margin-right: 10px;
  margin-bottom: 5px;
}
</style> 