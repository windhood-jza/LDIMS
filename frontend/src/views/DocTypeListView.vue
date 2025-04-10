<template>
  <div class="doctype-management-page">
    <el-row :gutter="20">
      <!-- 左侧树形结构 -->
      <el-col :span="8">
        <el-card class="tree-card" shadow="never">
          <template #header>
            <div class="clearfix">
              <span>文档类型</span>
              <!-- 修改：调用打开新增顶级对话框的方法 -->
              <el-button type="primary" :icon="Plus" style="float: right;" @click="handleAddTopLevel">新增顶级</el-button>
            </div>
          </template>
          <el-tree
            ref="docTypeTreeRef"
            :data="docTypeTree"
            :props="treeProps"
            node-key="id"
            highlight-current
            default-expand-all
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
            v-loading="loading"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span>{{ node.label }}</span>
                <span>
                  <!-- 修改：调用打开新增子级对话框的方法 -->
                  <el-button type="primary" link :icon="Plus" @click.stop="handleAddChild(data)"> </el-button>
                  <el-button type="danger" link :icon="Delete" @click.stop="handleDelete(node, data)"> </el-button>
                </span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧表单 -->
      <el-col :span="16">
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="clearfix">
              <!-- 修改：固定标题 -->
              <span>文档类型信息</span>
              <!-- 修改：将操作按钮移到头部 -->
              <div style="float: right;">
                 <el-button
                    :icon="RefreshLeft"
                    @click="handleReset"
                    :disabled="!selectedDocType"
                  >
                    重置
                  </el-button>
                 <el-button
                    type="danger"
                    :icon="Delete"
                    @click="handleDelete(null, selectedDocType!)" 
                    :disabled="!selectedDocType || !selectedDocType.id"
                    style="margin-left: 10px;"
                  >
                    删除
                  </el-button>
                 <el-button
                    type="primary"
                    :icon="Check"
                    @click="handleSubmit"
                    :loading="loading"
                    :disabled="!selectedDocType || !selectedDocType.id"
                    style="margin-left: 10px;"
                  >
                    保存
                  </el-button>
              </div>
            </div>
          </template>
          <!-- 修改：添加 v-if 判断和 el-empty -->
          <div v-if="selectedDocType" class="form-content">
            <el-form ref="docTypeFormRef" :model="formData" :rules="formRules" label-width="100px">
              <el-form-item label="类型名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入类型名称"></el-input>
              </el-form-item>
              <el-form-item label="上级类型" prop="parentId">
                <el-tree-select
                  v-model="formData.parentId"
                  :data="docTypeTreeForSelect"
                  :props="treeProps"
                  node-key="id"
                  placeholder="选择上级类型 (不选则为顶级)"
                  clearable
                  filterable
                  check-strictly
                  :render-after-expand="false"
                  style="width: 100%;"
                  :disabled="isEditingSelfOrChild" 
                />
              </el-form-item>
              <el-form-item label="排序号" prop="sort">
                <el-input-number v-model="formData.sort" :min="0" controls-position="right" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="描述" prop="description">
                <el-input type="textarea" v-model="formData.description" rows="4" placeholder="请输入描述信息"></el-input>
              </el-form-item>
              <!-- 移除底部的保存和重置按钮 -->
            </el-form>
          </div>
          <el-empty v-else description="请在左侧选择一个文档类型进行查看或编辑"></el-empty>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增文档类型对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @closed="resetDialogForm">
        <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogFormRules" label-width="100px">
            <el-form-item label="类型名称" prop="name">
                <el-input v-model="dialogForm.name" placeholder="请输入类型名称"></el-input>
            </el-form-item>
            <el-form-item label="上级类型">
                <!-- 直接显示父级名称 -->
                <el-input :value="dialogParentName" disabled />
            </el-form-item>
            <el-form-item label="排序号" prop="sort">
                 <el-input-number v-model="dialogForm.sort" :min="0" controls-position="right" style="width: 100%;"/>
              </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input type="textarea" v-model="dialogForm.description" rows="4" placeholder="请输入描述信息"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleDialogSubmit" :loading="dialogLoading">确定</el-button>
            </span>
        </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
// 导入所需图标和组件
import { ElRow, ElCol, ElCard, ElTree, ElButton, ElForm, ElFormItem, ElInput, ElInputNumber, ElTreeSelect, ElMessage, ElMessageBox, ElEmpty, ElDialog } from 'element-plus';
import { Plus, Delete, RefreshLeft, Check } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
// 使用相对路径导入
import { getDocTypeTree, createDocType, updateDocType, deleteDocType } from '../services/api/doctype';
import type { DocTypeInfo, CreateDocTypeRequest, UpdateDocTypeRequest } from '@backend-types/doctype';

console.log('DocTypeManagement script setup executing...');

// Refs
const docTypeTreeRef = ref<InstanceType<typeof ElTree>>();
const docTypeFormRef = ref<FormInstance>();
const dialogFormRef = ref<FormInstance>(); // 新增对话框表单 ref

// State
const docTypeTree = ref<DocTypeInfo[]>([]);
const loading = ref(false); // 通用加载状态，用于树和保存按钮
const selectedDocType = ref<DocTypeInfo | null>(null); // 当前选中的节点数据
const formData = reactive<Partial<DocTypeInfo>>({ // 右侧编辑表单数据
  id: undefined,
  name: '',
  parentId: null,
  sort: 0,
  description: '',
});

// 新增对话框状态
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const dialogMode = ref<'addTopLevel' | 'addChild'>('addTopLevel');
const dialogParentId = ref<number | null>(null);
const dialogParentName = ref<string>('无 (作为顶级类型)');
const dialogForm = reactive<CreateDocTypeRequest>({ // 新增对话框表单数据
    name: '',
    parentId: null, // parentId 在提交时根据 dialogParentId 设置
    sort: 0,
    description: '',
});

// Computed
// 对话框标题
const dialogTitle = computed(() => dialogMode.value === 'addTopLevel' ? '新增顶级文档类型' : '新增子文档类型');

// 用于上级类型选择的树数据 (添加根节点)
const docTypeTreeForSelect = computed(() => [
  { id: null, name: '无 (作为顶级类型)', children: docTypeTree.value }
]);

// 检查是否正在编辑节点且试图选择自身作为父节点
const isEditingSelfOrChild = computed(() => {
  if (!selectedDocType.value || !formData.parentId) return false;
  // 简单检查：不允许父级是自己
  return formData.parentId === selectedDocType.value.id;
  // 注意：严格的循环引用检查应在后端进行
});


// Tree Props
const treeProps = {
  label: 'name',
  children: 'children',
  value: 'id', // for el-tree-select
};

// Form Rules (右侧编辑表单)
const formRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  sort: [{ type: 'number', message: '排序号必须为数字' }],
});

// 新增对话框表单规则
const dialogFormRules = reactive<FormRules>({
    name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
    sort: [{ type: 'number', message: '排序号必须为数字' }], // 允许为空或0
});

// --- Methods ---

// 获取文档类型树
const fetchDocTypeTree = async () => {
  console.log('fetchDocTypeTree started...');
  loading.value = true;
  try {
    const data = await getDocTypeTree();
    console.log('fetchDocTypeTree data received:', data);
    docTypeTree.value = data;
     // 如果有选中的节点，刷新后尝试保持选中和表单数据
     if (selectedDocType.value) {
        updateSelectedInfo(selectedDocType.value.id);
     }
  } catch (error: any) {
    console.error('fetchDocTypeTree error:', error);
    ElMessage.error(error.message || '获取文档类型失败');
  } finally {
    loading.value = false;
  }
};

// 查找并更新选中节点信息 (用于刷新后保持状态)
const updateSelectedInfo = (id: number) => {
     const findNode = (nodes: DocTypeInfo[]): DocTypeInfo | null => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNode(node.children);
                if (found) return found;
            }
        }
        return null;
    };
    const nodeData = findNode(docTypeTree.value);
    selectedDocType.value = nodeData; // 更新选中数据
    if (nodeData) {
        Object.assign(formData, nodeData); // 更新表单
        nextTick(() => {
             docTypeTreeRef.value?.setCurrentKey(id); // 保持树高亮
        });
    } else {
        // 如果刷新后找不到原节点 (可能被删除)，则清空右侧选择
        selectedDocType.value = null;
        resetForm(); // 清空表单
    }
};


// 处理节点点击
const handleNodeClick = (data: DocTypeInfo) => {
  console.log('handleNodeClick called with data:', data);
  selectedDocType.value = data;
  // 将节点数据填充到右侧编辑表单
  Object.assign(formData, data);
  nextTick(() => {
    docTypeFormRef.value?.clearValidate(); // 清除校验状态
  });
};

// 重置右侧编辑表单
const resetForm = () => {
  if (selectedDocType.value) {
    // 重置为当前选中的数据
    Object.assign(formData, selectedDocType.value);
    nextTick(() => {
      docTypeFormRef.value?.clearValidate();
    });
  } else {
    // 没有选中项时清空表单
    formData.id = undefined;
    formData.name = '';
    formData.parentId = null;
    formData.sort = 0;
    formData.description = '';
    nextTick(() => {
      docTypeFormRef.value?.clearValidate();
    });
  }
};

// 处理重置按钮点击 (右侧头部)
const handleReset = () => {
  if (!selectedDocType.value) {
     ElMessage.warning('请先选择一个文档类型');
     return;
  }
  resetForm();
  ElMessage.info('表单已重置');
};

// --- 新增对话框相关方法 ---

// 重置对话框表单
const resetDialogForm = () => {
    dialogForm.name = '';
    dialogForm.parentId = null; // 这个字段在提交时设置
    dialogForm.sort = 0;
    dialogForm.description = '';
    dialogFormRef.value?.resetFields(); // 重置校验状态
};

// 打开新增顶级对话框
const handleAddTopLevel = () => {
    dialogMode.value = 'addTopLevel';
    dialogParentId.value = null; // 目标父ID
    dialogParentName.value = '无 (作为顶级类型)'; // 显示给用户看
    resetDialogForm(); // 清空表单
    dialogVisible.value = true;
};

// 打开新增子级对话框
const handleAddChild = (parentData: DocTypeInfo) => {
    dialogMode.value = 'addChild';
    dialogParentId.value = parentData.id; // 目标父ID
    dialogParentName.value = parentData.name; // 显示给用户看
    resetDialogForm(); // 清空表单
    // dialogForm.parentId 不在此处设置，在提交时根据 dialogParentId 设置
    dialogVisible.value = true;
};

// 处理对话框提交 (新增)
const handleDialogSubmit = async () => {
    if (!dialogFormRef.value) return;
    await dialogFormRef.value.validate(async (valid) => {
        if (valid) {
            dialogLoading.value = true;
             // 构造请求体，parentId 使用 dialogParentId
             const payload: CreateDocTypeRequest = {
                 name: dialogForm.name,
                 parentId: dialogParentId.value, // 使用记录的父ID
                 sort: dialogForm.sort ?? 0,
                 description: dialogForm.description
             };
            console.log('handleDialogSubmit payload:', payload); // 打印提交的数据
            try {
                const createdData = await createDocType(payload);
                ElMessage.success('新增成功');
                dialogVisible.value = false;
                await fetchDocTypeTree(); // 刷新树
                // 新增后选中新节点
                nextTick(() => {
                    if (createdData && createdData.id) {
                        docTypeTreeRef.value?.setCurrentKey(createdData.id);
                        handleNodeClick(createdData); // 触发选中逻辑
                    }
                });
            } catch (error: any) {
                 ElMessage.error(error.message || '新增失败');
                 console.error('新增失败:', error); // 打印详细错误
            } finally {
                dialogLoading.value = false;
            }
        } else {
           console.log('Dialog form validation failed');
        }
    });
};

// --- 编辑和删除方法 (针对右侧表单或树节点) ---

// 处理删除 (可由右侧头部按钮或树节点按钮触发)
const handleDelete = async (node: any, data: DocTypeInfo | null) => { // data 可以为 null (当从头部按钮触发时)
  // 优先使用 data (树节点触发)，否则使用 selectedDocType (头部按钮触发)
  const targetData = data || selectedDocType.value;
  if (!targetData || !targetData.id) {
      ElMessage.warning('请先选择要删除的文档类型');
      return;
  }

  // 检查子节点 (使用 Tree 组件的方法更可靠)
  const checkNode = docTypeTreeRef.value?.getNode(targetData.id);
  if (checkNode && checkNode.childNodes && checkNode.childNodes.length > 0) {
      ElMessage.warning('请先删除该类型下的所有子类型');
      return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除文档类型 "${targetData.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    loading.value = true; // 使用通用 loading
    await deleteDocType(targetData.id);
    ElMessage.success('删除成功');
    // 如果删除的是当前选中的节点，则清空右侧
    if (selectedDocType.value?.id === targetData.id) {
      selectedDocType.value = null; // 清空选中状态
      resetForm(); // 清空表单
    }
    await fetchDocTypeTree(); // 重新加载树
  } catch (error: any) {
    if (error !== 'cancel') { // 用户点击取消时不提示错误
      ElMessage.error(error.message || '删除失败');
      console.error('删除失败:', error); // 打印详细错误
    }
  } finally {
    loading.value = false;
  }
};

// 处理表单提交 (更新 - 由右侧头部保存按钮触发)
const handleSubmit = async () => {
  // 确保有选中的节点且表单有效
  if (!selectedDocType.value || !selectedDocType.value.id) {
      ElMessage.warning('请先选择要保存的文档类型');
      return;
  }
  if (!docTypeFormRef.value) return;

  console.log('handleSubmit (Update) called. formData:', JSON.parse(JSON.stringify(formData)));

  await docTypeFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 构造请求体
        const payload: UpdateDocTypeRequest = {
          name: formData.name,
          parentId: formData.parentId,
          sort: formData.sort ?? 0,
          description: formData.description,
        };
        console.log('Update payload:', payload); // 打印提交数据

        await updateDocType(selectedDocType.value!.id, payload);
        ElMessage.success('更新成功');

        // 更新成功后重新加载树，并保持选中状态
        const currentSelectedId = selectedDocType.value!.id;
        await fetchDocTypeTree();
        // fetchDocTypeTree 内部会调用 updateSelectedInfo 来恢复状态
        // updateSelectedInfo(currentSelectedId); // 理论上不需要再次调用

      } catch (error: any) {
        ElMessage.error(error.message || '更新失败');
        console.error('更新失败:', error); // 打印详细错误
      } finally {
        loading.value = false;
      }
    } else {
       console.log('Form validation failed');
    }
  });
};

// --- Lifecycle Hooks ---
onMounted(() => {
  console.log('DocTypeManagement onMounted hook called.');
  fetchDocTypeTree();
});
</script>

<style scoped>
.doctype-management-page {
  padding: 20px;
}

.tree-card, .form-card {
  height: calc(100vh - 140px); /* 调整高度以适应布局 */
  display: flex;
  flex-direction: column;
}

/* 使 Card Body 可滚动 */
.tree-card :deep(.el-card__body),
.form-card :deep(.el-card__body) {
  flex-grow: 1; /* 填充剩余空间 */
  overflow-y: auto; /* 内容超出时滚动 */
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

/* 悬停显示按钮 */
.custom-tree-node span:last-child {
  margin-left: 10px;
  visibility: hidden;
}
.el-tree-node__content:hover .custom-tree-node span:last-child {
  visibility: visible;
}

/* 对话框样式 */
.dialog-footer {
    text-align: right;
}

/* 可以添加一些 TreeSelect 的样式微调 */
.el-form-item :deep(.el-tree-select) {
    width: 100%; /* 确保 TreeSelect 宽度正确 */
}
</style>