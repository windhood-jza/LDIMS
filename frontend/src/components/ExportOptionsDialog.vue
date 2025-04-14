<template>
  <el-dialog
    v-model="dialogVisible"
    title="导出选项"
    width="650px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form label-width="100px">
      <el-form-item label="导出范围">
        <el-radio-group v-model="exportScope">
          <el-radio label="all">全部 (根据筛选条件)</el-radio>
          <el-radio label="currentPage" :disabled="!hasCurrentPageItems">
            当前页 ({{ currentPageItemCount }} 项)
          </el-radio>
          <el-radio label="selected" :disabled="!hasSelectedItems">
            选中项 ({{ selectedItemCount }} 项)
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="选择字段">
        <el-row :gutter="10" style="width: 100%; margin-bottom: 10px;">
          <el-col :span="12">
            <el-button type="primary" link @click="selectAllFields">全选</el-button>
            <el-button type="primary" link @click="deselectAllFields" style="margin-left: 15px;">取消全选</el-button>
          </el-col>
        </el-row>
        <el-checkbox-group v-model="selectedFields">
          <el-row :gutter="5" style="width: 100%;">
            <el-col :span="8" v-for="field in availableFields" :key="field.value">
              <el-checkbox :label="field.value" style="margin-bottom: 8px;">
                {{ field.label }}
              </el-checkbox>
            </el-col>
          </el-row>
        </el-checkbox-group>
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
import { ref, computed, defineExpose, defineEmits, watch } from 'vue'
import { ElMessage, ElCheckboxGroup, ElCheckbox, ElRow, ElCol, ElRadioGroup, ElRadio, ElButton, ElDialog, ElForm, ElFormItem } from 'element-plus'
import { requestExport } from '@/services/api/task'
import type { ExportRequestParams, ExportScope, DocumentExportRequestParams } from '@/types/export';

interface FieldOption {
  label: string;
  value: string;
}

// 可选的字段列表
const availableFields = ref<FieldOption[]>([
  { label: '文档 ID', value: 'id' },
  { label: '文档名称', value: 'docName' },
  { label: '文档类型', value: 'docTypeName' },
  { label: '来源部门', value: 'sourceDepartmentName' },
  { label: '提交人', value: 'submitter' },
  { label: '接收人', value: 'receiver' },
  { label: '签收（章）人', value: 'signer' },
  { label: '交接日期', value: 'handoverDate' },
  { label: '保管位置', value: 'storageLocation' },
  { label: '备注', value: 'remarks' },
  { label: '创建人', value: 'createdByName' },
  { label: '创建时间', value: 'createdAt' },
  { label: '最后修改人', value: 'updatedByName' },
  { label: '最后修改时间', value: 'updatedAt' },
]);

const dialogVisible = ref(false)
const loading = ref(false)
const selectedFields = ref<string[]>([])
const fileType = ref('xlsx')
const exportScope = ref<ExportScope>('all')
const currentQueryCriteria = ref<any>(null)
const currentSelectedIds = ref<number[]>([])
const currentCurrentPageIds = ref<number[]>([])

const emit = defineEmits(['export-started'])

const hasSelectedItems = computed(() => currentSelectedIds.value.length > 0)
const selectedItemCount = computed(() => currentSelectedIds.value.length)
const hasCurrentPageItems = computed(() => currentCurrentPageIds.value.length > 0)
const currentPageItemCount = computed(() => currentCurrentPageIds.value.length)

/**
 * @description 打开弹窗
 * @param {any} query - 当前的查询条件
 * @param {number[]} [selectedItemIds=[]] - 选中项 ID
 * @param {number[]} [currentPageIds=[]] - 当前页 ID
 */
const open = (query: any, selectedItemIds: number[] = [], currentPageIds: number[] = []) => {
  console.log('[Debug] ExportOptionsDialog: Received selectedItemIds:', selectedItemIds);
  console.log('[Debug] ExportOptionsDialog: Received currentPageIds:', currentPageIds);
  currentQueryCriteria.value = query;
  currentSelectedIds.value = selectedItemIds;
  currentCurrentPageIds.value = currentPageIds;
  selectedFields.value = availableFields.value.map(f => f.value);

  if (selectedItemIds.length > 0) {
      exportScope.value = 'selected';
  } else if (currentPageIds.length > 0) {
      exportScope.value = 'currentPage';
  } else {
      exportScope.value = 'all';
  }

  dialogVisible.value = true
}

/**
 * @description 关闭弹窗
 */
const handleClose = () => {
  if (loading.value) return;
  dialogVisible.value = false
}

/**
 * @description 提交导出请求
 */
const handleSubmit = async () => {
  if (!selectedFields.value.length) {
    ElMessage.warning('请至少选择一个要导出的字段');
    return;
  }
  if (exportScope.value === 'selected' && !hasSelectedItems.value) {
      ElMessage.warning('请先在表格中勾选要导出的文档');
      return;
  }
  if (exportScope.value === 'currentPage' && !hasCurrentPageItems.value) {
      ElMessage.warning('当前页没有可导出的数据');
      return;
  }

  loading.value = true;
  try {
    const params: DocumentExportRequestParams = {
        fields: selectedFields.value,
        fileType: fileType.value as ('xlsx' | 'csv'),
        exportScope: exportScope.value,
    };

    if (exportScope.value === 'all' && currentQueryCriteria.value) {
        const rawQuery = currentQueryCriteria.value;
        const cleanQuery: Record<string, any> = {};

        const allowedQueryFields = [
            'docName', 'submitter', 'receiver', 'docTypeId', 'sourceDepartmentId',
            'docTypeNameFilter', 'sourceDepartmentNameFilter', 'signer'
        ];

        for (const key of allowedQueryFields) {
            if (rawQuery[key] !== null && rawQuery[key] !== undefined && rawQuery[key] !== '') {
                cleanQuery[key] = rawQuery[key];
            }
        }

        if (rawQuery.handoverDateRange && Array.isArray(rawQuery.handoverDateRange) && rawQuery.handoverDateRange.length === 2) {
            cleanQuery.handoverDateStart = rawQuery.handoverDateRange[0];
            cleanQuery.handoverDateEnd = rawQuery.handoverDateRange[1];
        }

        if (cleanQuery.docTypeNameFilter === '') delete cleanQuery.docTypeNameFilter;
        if (cleanQuery.sourceDepartmentNameFilter === '') delete cleanQuery.sourceDepartmentNameFilter;

        if (Object.keys(cleanQuery).length > 0) {
             params.query = cleanQuery;
        }

    } else if (exportScope.value === 'selected') {
        params.selectedIds = currentSelectedIds.value;
    } else if (exportScope.value === 'currentPage') {
        params.currentPageIds = currentCurrentPageIds.value;
    }

    console.log('[Debug] Export Request Params:', JSON.stringify(params));

    const resultData = await requestExport(params);

    if (resultData && typeof resultData.taskId === 'number') {
      console.log('[Debug] handleSubmit: Success path executing.');
      ElMessage.success('导出任务已创建，请稍后在"导出任务"页面查看进度和下载。');
      emit('export-started', resultData.taskId);
      handleClose();
    } else {
      console.error('Invalid data structure received after creating export task:', resultData);
      console.log('[Debug] handleSubmit: Invalid data structure path executing.');
      ElMessage.error('创建导出任务失败：响应数据异常');
    }
  } catch (error: any) {
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
/* 优化复选框样式 */
.el-checkbox-group .el-col {
  margin-bottom: 8px;
}
.el-checkbox {
  margin-right: 0;
}
</style> 