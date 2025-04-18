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
          <el-form-item label="文档名称" prop="doc_name">
            <el-input v-model="formData.doc_name" placeholder="请输入文档名称" :disabled="isViewMode"/>
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
  doc_name: '',
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
  doc_name: [{ required: true, message: '请输入文档名称', trigger: 'blur' }],
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
  
  // Initialize editing state based on mode
  isEditingDocType.value = (type === 'add');     // True for add, false for edit/view
  isEditingDepartment.value = (type === 'add'); // True for add, false for edit/view

  // Helper function to safely parse potential string IDs to number | null
  const parseId = (id: number | string | undefined | null): number | null => {
    if (id === undefined || id === null || id === '') {
      return null;
    }
    if (typeof id === 'number') {
      return id;
    }
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? null : parsed;
  };

  nextTick(() => {
     formRef.value?.resetFields();
     Object.assign(formData, getInitialFormData());
     console.log('[Dialog] FormData after reset:', JSON.parse(JSON.stringify(formData)));

     if ((type === 'edit' || type === 'view') && data) {
       console.log('[Dialog] Populating form for edit/view. Data ID:', data.id);
       console.log('[Dialog] Data docTypeId:', data.docTypeId, typeof data.docTypeId);
       console.log('[Dialog] Data sourceDepartmentId:', data.sourceDepartmentId, typeof data.sourceDepartmentId);

       // FIX: Assign null if data.id is undefined
       currentId.value = data.id ?? null; 
       // Populate formData directly, handling types explicitly
       formData.doc_name = data.doc_name ?? '';
       formData.submitter = data.submitter ?? '';
       formData.receiver = data.receiver ?? '';
       formData.signer = data.signer ?? null;
       formData.storageLocation = data.storageLocation ?? null;
       formData.handoverDate = data.handoverDate ?? null;
       formData.remarks = data.remarks ?? '';
       
       // Parse IDs into explicitly typed temporary variables, using type assertion
       // (Keeping the assertion as it seemed necessary before, though might be redundant now)
       const parsedDocTypeId: number | null = parseId(data.docTypeId) as number | null;
       const parsedSourceDepartmentId: number | null = parseId(data.sourceDepartmentId) as number | null;

       // Assign from temporary variables
       formData.docTypeId = parsedDocTypeId;
       formData.sourceDepartmentId = parsedSourceDepartmentId;
       
       formData.docTypeName = data.docTypeName ?? null;
       // Use departmentName from the list data
       formData.sourceDepartmentName = data.departmentName ?? null; 

       console.log('[Dialog] FormData after population:', JSON.parse(JSON.stringify(formData)));

       // Checks related to tree data (ensure IDs passed are numbers or null)
       const docTypeIdForCheck = parseId(data.docTypeId);
       const deptIdForCheck = parseId(data.sourceDepartmentId);

       const typeNodeExists = props.docTypeTreeData?.some(node => checkNodeExists(node, docTypeIdForCheck));
       const deptNodeExists = props.departmentTreeData?.some(node => checkNodeExists(node, deptIdForCheck));
       console.log(`[Dialog] Node exists check in docTypeTreeData for ID ${data.docTypeId}?`, typeNodeExists);
       console.log(`[Dialog] Node exists check in departmentTreeData for ID ${data.sourceDepartmentId}?`, deptNodeExists);

     }
  });
};

// 辅助函数：递归检查树中是否存在某个 ID
const checkNodeExists = (node: any, targetId: number | null | undefined): boolean => {
    if (!node || targetId === null || targetId === undefined) return false;
    if (node.id === targetId) return true;
    if (node.children && node.children.length > 0) {
        return node.children.some((child: any) => checkNodeExists(child, targetId));
    }
    return false;
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

    // Build payload based on mode
    let payload: Partial<CreateDocumentRequest | UpdateDocumentRequest> = {
      docName: formData.doc_name,
      submitter: formData.submitter,
      receiver: formData.receiver,
      signer: formData.signer ?? undefined,
      storageLocation: formData.storageLocation ?? undefined,
      handoverDate: formData.handoverDate,
      remarks: formData.remarks,
      // Use names based on updated document.ts type definitions (Keep these if backend uses them)
      // docTypeName: formData.docTypeName ?? undefined, 
      // sourceDepartmentName: formData.sourceDepartmentName ?? undefined, 
      // Ensure IDs are included for creation/update
      docTypeId: formData.docTypeId,          // <-- Include docTypeId
      sourceDepartmentId: formData.sourceDepartmentId // <-- Include sourceDepartmentId
    };
    
    // Remove properties that are explicitly null or empty string if backend prefers omission
    // Example (adjust based on backend needs):
    // if (submitData.signer === null) delete submitData.signer;
    // if (submitData.storageLocation === null) delete submitData.storageLocation;

    console.log('[Dialog] Submitting data:', payload);

    if (mode.value === 'add') {
      await createDocument(payload as CreateDocumentRequest);
      ElMessage.success('文档新增成功');
    } else if (mode.value === 'edit' && currentId.value) {
      // Pass currentId.value safely, although it should be number here
      await updateDocument(currentId.value, payload as UpdateDocumentRequest);
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