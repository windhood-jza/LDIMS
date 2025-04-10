<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="60%"
    :before-close="handleClose"
    draggable
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="isViewMode ? {} : rules"
      label-width="100px"
      v-loading="loading"
      :disabled="isViewMode"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="文档名称" prop="docName">
            <el-input v-model="formData.docName" placeholder="请输入文档名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文档类型" prop="docTypeId">
             <el-tree-select
               v-model="formData.docTypeId"
               placeholder="请选择文档类型"
               :data="docTypeTreeData"
               :props="treeProps"
               check-strictly
               :render-after-expand="false"
               clearable
               style="width: 100%"
             />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="来源部门" prop="sourceDepartmentId">
             <el-tree-select
               v-model="formData.sourceDepartmentId"
               placeholder="请选择来源部门"
               :data="departmentTreeData"
               :props="treeProps"
               check-strictly
               :render-after-expand="false"
               clearable
               style="width: 100%"
             />
          </el-form-item>
        </el-col>
        <el-col :span="12">
           <el-form-item label="交接日期" prop="handoverDate">
             <el-date-picker
               v-model="formData.handoverDate"
               type="date"
               placeholder="选择交接日期"
               value-format="YYYY-MM-DD"
               style="width: 100%"
             />
          </el-form-item>
        </el-col>
      </el-row>
       <el-row :gutter="20">
         <el-col :span="12">
           <el-form-item label="提交人" prop="submitter">
             <el-input v-model="formData.submitter" placeholder="请输入提交人" />
           </el-form-item>
         </el-col>
         <el-col :span="12">
           <el-form-item label="接收人" prop="receiver">
             <el-input v-model="formData.receiver" placeholder="请输入接收人" />
           </el-form-item>
         </el-col>
       </el-row>
       <el-row :gutter="20">
         <el-col :span="12">
           <el-form-item label="签署人" prop="signer">
             <el-input v-model="formData.signer" placeholder="请输入签署人 (可选)" />
           </el-form-item>
         </el-col>
         <el-col :span="12">
           <el-form-item label="存放位置" prop="storageLocation">
             <el-input v-model="formData.storageLocation" placeholder="请输入存放位置 (可选)" />
           </el-form-item>
         </el-col>
       </el-row>
      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          rows="3"
          placeholder="请输入备注信息 (可选)"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">{{ isViewMode ? '关闭' : '取消' }}</el-button>
        <el-button v-if="!isViewMode" type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import { ElDialog, ElForm, ElMessage, FormInstance, FormRules } from 'element-plus';
import type { CreateDocumentRequest, UpdateDocumentRequest, DocumentInfo } from '@/types/document.d';
// 假设 API 函数已定义并导出
import { createDocument, updateDocument } from '@/services/api/document';

// --- Props --- (从父组件接收数据)
interface Props {
  docTypeTreeData: any[]; // 文档类型树数据
  departmentTreeData: any[]; // 部门树数据
}
const props = defineProps<Props>();

// --- Emits --- (向父组件发送事件)
const emit = defineEmits(['success']);

// --- 组件状态 ---
const dialogVisible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();
const mode = ref<'add' | 'edit' | 'view'>('add');
const currentId = ref<number | null>(null);

// 表单数据 (类型应与 Create/Update 请求 DTO 匹配)
// 使用函数返回初始状态，方便重置
const getInitialFormData = () => ({
  docName: '',
  docTypeId: null as number | null,
  sourceDepartmentId: null as number | null,
  submitter: '',
  receiver: '',
  signer: null as string | null,
  storageLocation: '',
  handoverDate: null as string | null, // DatePicker v-model 通常是 string
  remarks: '',
});
let formData = reactive(getInitialFormData());

// --- 计算属性 ---
const isViewMode = computed(() => mode.value === 'view');
const dialogTitle = computed(() => {
    if (mode.value === 'add') return '新增文档';
    if (mode.value === 'edit') return '编辑文档';
    return '查看文档详情'; // view 模式
});
const treeProps = { value: 'id', label: 'name', children: 'children' };

// --- 表单验证规则 ---
const rules = reactive<FormRules>({
  docName: [{ required: true, message: '请输入文档名称', trigger: 'blur' }],
  sourceDepartmentId: [{ required: true, message: '请选择来源部门', trigger: 'change' }],
  submitter: [{ required: true, message: '请输入提交人', trigger: 'blur' }],
  receiver: [{ required: true, message: '请输入接收人', trigger: 'blur' }],
  signer: [{ max: 50, message: '签章人名称过长', trigger: 'blur' }],
  storageLocation: [{ max: 100, message: '存放位置过长', trigger: 'blur' }],
  remarks: [{ max: 1000, message: '备注过长', trigger: 'blur' }],
});

// --- 方法 ---

/**
 * 打开弹窗
 * @param type 操作类型 'add', 'edit' 或 'view'
 * @param data 编辑或查看时传入的文档数据
 */
const open = (type: 'add' | 'edit' | 'view', data?: DocumentInfo) => {
  mode.value = type;
  dialogVisible.value = true;
  loading.value = false;
  currentId.value = null;

  nextTick(() => {
     formRef.value?.resetFields(); // 重置验证状态和部分字段
     // 手动深度重置 formData
     Object.assign(formData, getInitialFormData());

     if ((type === 'edit' || type === 'view') && data) { // 编辑和查看都需要填充数据
       currentId.value = data.id;
       formData.docName = data.docName;
       formData.docTypeId = data.docTypeId;
       formData.sourceDepartmentId = data.sourceDepartmentId;
       formData.submitter = data.submitter;
       formData.receiver = data.receiver;
       formData.signer = data.signer;
       formData.storageLocation = data.storageLocation ?? '';
       formData.handoverDate = data.handoverDate ? new Date(data.handoverDate).toISOString().split('T')[0] : null;
       formData.remarks = data.remarks ?? '';
     }
  });
};

// 处理提交
const handleSubmit = async () => {
  if (isViewMode.value || !formRef.value) return; // 查看模式或 ref 无效则不提交

  try {
    await formRef.value.validate();
    loading.value = true;

    // 准备提交的数据
    const submitData: Partial<CreateDocumentRequest | UpdateDocumentRequest> = {};
    // 只包含已定义的字段，避免传递额外属性
    Object.keys(getInitialFormData()).forEach(key => {
        const k = key as keyof typeof formData;
        if (formData[k] !== undefined && formData[k] !== '') { // 只提交非空或非 undefined 的值
             (submitData as any)[k] = formData[k];
        } else if (formData[k] === null) { // 如果需要提交 null
             (submitData as any)[k] = null;
        }
    });
    // 特殊处理日期，确保格式正确
     if (formData.handoverDate) {
        submitData.handoverDate = formData.handoverDate;
     }

    if (mode.value === 'add') {
      await createDocument(submitData as CreateDocumentRequest);
      ElMessage.success('文档新增成功');
    } else if (mode.value === 'edit' && currentId.value) {
      await updateDocument(currentId.value, submitData as UpdateDocumentRequest);
      ElMessage.success('文档更新成功');
    }

    dialogVisible.value = false;
    emit('success');

  } catch (error) {
    console.error('提交文档失败:', error);
    // 考虑显示更详细的后端错误信息
    ElMessage.error(`操作失败: ${(error as Error)?.message || '请检查表单或联系管理员'}`);
  } finally {
    loading.value = false;
  }
};

// 处理关闭
const handleClose = () => {
  if (loading.value) return;
  dialogVisible.value = false;
};

// --- 暴露方法给父组件 ---
defineExpose({
  open,
});

</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style> 