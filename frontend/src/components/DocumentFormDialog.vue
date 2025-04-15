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
            <el-input v-model="formData.docName" placeholder="请输入文档名称" :disabled="isViewMode"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文档类型" prop="docTypeName">
             <el-input v-if="isViewMode" :model-value="formData.docTypeName" disabled placeholder="---" />
             <template v-else-if="!isEditingDocType">
               <el-input :model-value="formData.docTypeName" disabled placeholder="未指定" style="width: calc(100% - 70px); margin-right: 8px;" />
               <el-button @click="isEditingDocType = true" :disabled="isViewMode">更改</el-button>
             </template>
             <el-tree-select
               v-else
               :model-value="formData.docTypeId"
               @update:modelValue="handleDocTypeChange"
               placeholder="请选择新文档类型"
               :data="props.docTypeTreeData"
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
          <el-form-item label="来源部门" prop="sourceDepartmentName">
             <el-input v-if="isViewMode" :model-value="formData.sourceDepartmentName" disabled placeholder="---" />
             <template v-else-if="!isEditingDepartment">
               <el-input :model-value="formData.sourceDepartmentName" disabled placeholder="未指定" style="width: calc(100% - 70px); margin-right: 8px;" />
               <el-button @click="isEditingDepartment = true" :disabled="isViewMode">更改</el-button>
             </template>
             <el-tree-select
               v-else
               :model-value="formData.sourceDepartmentId"
               @update:modelValue="handleDepartmentChange"
               placeholder="请选择新来源部门"
               :data="props.departmentTreeData"
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
               :disabled="isViewMode"
             />
          </el-form-item>
        </el-col>
      </el-row>
       <el-row :gutter="20">
         <el-col :span="12">
           <el-form-item label="提交人" prop="submitter">
             <el-input v-model="formData.submitter" placeholder="请输入提交人" :disabled="isViewMode"/>
           </el-form-item>
         </el-col>
         <el-col :span="12">
           <el-form-item label="接收人" prop="receiver">
             <el-input v-model="formData.receiver" placeholder="请输入接收人" :disabled="isViewMode"/>
           </el-form-item>
         </el-col>
       </el-row>
       <el-row :gutter="20">
         <el-col :span="12">
           <el-form-item label="签署人" prop="signer">
             <el-input v-model="formData.signer" placeholder="请输入签署人 (可选)" :disabled="isViewMode"/>
           </el-form-item>
         </el-col>
         <el-col :span="12">
           <el-form-item label="存放位置" prop="storageLocation">
             <el-input v-model="formData.storageLocation" placeholder="请输入存放位置 (可选)" :disabled="isViewMode"/>
           </el-form-item>
         </el-col>
       </el-row>
      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          rows="3"
          placeholder="请输入备注信息 (可选)"
          :disabled="isViewMode"
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
import { ref, reactive, computed, nextTick, defineExpose } from 'vue';
import { ElDialog, ElForm, ElMessage, FormInstance, FormRules } from 'element-plus';
import type { CreateDocumentRequest, UpdateDocumentRequest, DocumentInfo } from '@/types/document';
import type { TreeNode } from '@/types/common';
// 假设 API 函数已定义并导出
import { createDocument, updateDocument } from '@/services/api/document';

// --- Props --- (从父组件接收数据)
interface Props {
  docTypeTreeData: TreeNode[]; // Use TreeNode[]
  departmentTreeData: TreeNode[]; // Use TreeNode[]
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

// --- Editing State (New) ---
const isEditingDocType = ref(false);
const isEditingDepartment = ref(false);

// 表单数据 (类型应与 Create/Update 请求 DTO 匹配)
// 使用函数返回初始状态，方便重置
const getInitialFormData = () => ({
  docName: '',
  docTypeId: null as number | null, // ID for submission ONLY when changed
  docTypeName: '' as string | null, // Name from database record
  sourceDepartmentId: null as number | null, // ID for submission ONLY when changed
  sourceDepartmentName: '' as string | null, // Name from database record
  submitter: '',
  receiver: '',
  signer: null as string | null,
  storageLocation: null as string | null,
  handoverDate: null as string | null,
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

// --- 表单验证规则 (Focus on name/other required fields) ---
const rules = reactive<FormRules>({
  docName: [{ required: true, message: '请输入文档名称', trigger: 'blur' }],
  // Validate names if necessary, or rely on backend validation
  // docTypeName: [{ required: true, message: '文档类型不能为空', trigger: 'change' }], 
  // sourceDepartmentName: [{ required: true, message: '来源部门不能为空', trigger: 'change' }],
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
  console.log('[Dialog] Open called with type:', type, 'and data:', data);
  mode.value = type;
  dialogVisible.value = true;
  loading.value = false;
  currentId.value = null;
  // Reset editing state
  isEditingDocType.value = false; 
  isEditingDepartment.value = false;

  nextTick(() => {
     formRef.value?.resetFields();
     // Reset formData, including IDs to null initially
     Object.assign(formData, getInitialFormData());
     // console.log('[Dialog] FormData after reset:', JSON.parse(JSON.stringify(formData))); // Keep this log if useful

     if ((type === 'edit' || type === 'view') && data) {
       console.log('[Dialog - open] Received data:', JSON.parse(JSON.stringify(data))); // <<< Log 1: Raw data
       currentId.value = data.id;

       // Directly assign names from data
       console.log(`[Dialog - open] Assigning docTypeName from data: '${data.docTypeName}'`); // <<< Log 2: docTypeName value
       formData.docName = data.docName;
       formData.docTypeName = data.docTypeName;

       console.log(`[Dialog - open] Assigning sourceDepartmentName from data: '${data.departmentName}'`); // <<< Log 3: departmentName value
       formData.sourceDepartmentName = data.departmentName; // Use departmentName from DocumentInfo

       formData.submitter = data.submitter;
       formData.receiver = data.receiver;
       formData.signer = data.signer;
       formData.storageLocation = data.storageLocation;
       formData.handoverDate = data.handoverDate ? new Date(data.handoverDate).toISOString().split('T')[0] : null;
       formData.remarks = data.remarks ?? '';

       // Reset IDs - they will only be set if user selects a new value
       formData.docTypeId = null;
       formData.sourceDepartmentId = null;

       console.log('[Dialog - open] FormData populated for edit/view:', JSON.parse(JSON.stringify(formData))); // <<< Log 4: Final formData
     } else if (type === 'add') {
         // Ensure names and IDs are null/empty for add mode
         formData.docTypeName = null;
         formData.sourceDepartmentName = null;
         formData.docTypeId = null;
         formData.sourceDepartmentId = null;
         // Enter editing state immediately for add mode
         isEditingDocType.value = true; 
         isEditingDepartment.value = true;
     }
  });
};

// --- TreeSelect Change 事件处理：更新 ID 和 Name ---
const handleDocTypeChange = (selectedId: number | null) => {
    formData.docTypeId = selectedId; // Store the ID for submission
    // Find the name corresponding to the selected ID to update display
    const findNodeById = (nodes: TreeNode[] | undefined, targetId: number | null): TreeNode | null => {
        if (!nodes || targetId === null) return null;
        for (const node of nodes) {
            if (node.id === targetId) return node;
            if (node.children && node.children.length > 0) {
                const found = findNodeById(node.children, targetId);
                if (found) return found;
            }
        }
        return null;
    };
    const selectedNode = findNodeById(props.docTypeTreeData, selectedId);
    formData.docTypeName = selectedNode ? selectedNode.name : null; // Update name in formData
    console.log(`[Dialog] DocType changed. Selected ID: ${selectedId}, Updated Name: ${formData.docTypeName}`);
};

const handleDepartmentChange = (selectedId: number | null) => {
    formData.sourceDepartmentId = selectedId; // Store the ID for submission
    // Find the name corresponding to the selected ID
     const findNodeById = (nodes: TreeNode[] | undefined, targetId: number | null): TreeNode | null => {
        if (!nodes || targetId === null) return null;
        for (const node of nodes) {
            if (node.id === targetId) return node;
            if (node.children && node.children.length > 0) {
                const found = findNodeById(node.children, targetId);
                if (found) return found;
            }
        }
        return null;
    };
    const selectedNode = findNodeById(props.departmentTreeData, selectedId);
    formData.sourceDepartmentName = selectedNode ? selectedNode.name : null; // Update name in formData
     console.log(`[Dialog] Department changed. Selected ID: ${selectedId}, Updated Name: ${formData.sourceDepartmentName}`);
};

// 处理提交
const handleSubmit = async () => {
  if (isViewMode.value || !formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    // Prepare data for submission
    const submitData: Partial<CreateDocumentRequest | UpdateDocumentRequest> = {
        // Include all potentially changed fields
        docName: formData.docName,
        submitter: formData.submitter,
        receiver: formData.receiver,
        signer: formData.signer,
        storageLocation: formData.storageLocation,
        handoverDate: formData.handoverDate,
        remarks: formData.remarks,
        // Include IDs - backend will use these if present to update names
        docTypeId: formData.docTypeId, 
        sourceDepartmentId: formData.sourceDepartmentId,
        // Optionally include names too, depending on backend implementation
        // docTypeName: formData.docTypeName, 
        // sourceDepartmentName: formData.sourceDepartmentName,
    };
    
    // Remove null IDs if backend expects undefined or omitted fields for no change
    if (submitData.docTypeId === null) delete submitData.docTypeId;
    if (submitData.sourceDepartmentId === null) delete submitData.sourceDepartmentId;

    console.log('[Dialog] Submitting data:', submitData);

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
    open
});

</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style> 