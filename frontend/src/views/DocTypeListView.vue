<template>
  <el-container class="doctype-management-page">
    <el-aside width="547px" class="tree-aside">
      <el-card class="tree-card" shadow="never">
        <template #header>
          <div class="clearfix">
            <span>文档类型</span>
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
          class="full-height-tree"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span>
                <el-button type="primary" link :icon="Plus" @click.stop="handleAddChild(data)">新增子级</el-button>
                <el-button type="danger" link :icon="Delete" @click.stop="handleDelete(node, data)">删除</el-button>
              </span>
            </span>
          </template>
        </el-tree>
      </el-card>
    </el-aside>

    <el-main class="form-main">
      <el-card class="form-card" shadow="never">
        <template #header>
          <div class="clearfix">
            <span>文档类型信息</span>
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
          </el-form>
        </div>
        <el-empty v-else description="请在左侧选择一个文档类型进行查看或编辑"></el-empty>
      </el-card>
    </el-main>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @closed="resetDialogForm">
        <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogFormRules" label-width="100px">
            <el-form-item label="类型名称" prop="name">
                <el-input v-model="dialogForm.name" placeholder="请输入类型名称"></el-input>
            </el-form-item>
            <el-form-item label="上级类型">
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

  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { ElRow, ElCol, ElCard, ElTree, ElButton, ElForm, ElFormItem, ElInput, ElInputNumber, ElTreeSelect, ElMessage, ElMessageBox, ElEmpty, ElDialog } from 'element-plus';
import { Plus, Delete, RefreshLeft, Check } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { getDocTypeTree, createDocType, updateDocType, deleteDocType } from '../services/api/doctype';
import type { DocTypeInfo, CreateDocTypeRequest, UpdateDocTypeRequest } from '@backend-types/doctype';

console.log('DocTypeManagement script setup executing...');

const docTypeTreeRef = ref<InstanceType<typeof ElTree>>();
const docTypeFormRef = ref<FormInstance>();
const dialogFormRef = ref<FormInstance>();

const docTypeTree = ref<DocTypeInfo[]>([]);
const loading = ref(false);
const selectedDocType = ref<DocTypeInfo | null>(null);
const formData = reactive<Partial<DocTypeInfo>>({
  id: undefined,
  name: '',
  parentId: null,
  sort: 0,
  description: '',
});

const dialogVisible = ref(false);
const dialogLoading = ref(false);
const dialogMode = ref<'addTopLevel' | 'addChild'>('addTopLevel');
const dialogParentId = ref<number | null>(null);
const dialogParentName = ref<string>('无 (作为顶级类型)');
const dialogForm = reactive<Omit<CreateDocTypeRequest, 'sortOrder'> & { sort?: number }>({
    name: '',
    parentId: null,
    sort: 0,
    description: '',
});

const dialogTitle = computed(() => dialogMode.value === 'addTopLevel' ? '新增顶级文档类型' : '新增子文档类型');

const docTypeTreeForSelect = computed(() => [
  { id: null, name: '无 (作为顶级类型)', children: docTypeTree.value }
]);

const isEditingSelfOrChild = computed(() => {
  if (!selectedDocType.value || !formData.parentId) return false;
  return formData.parentId === selectedDocType.value.id;
});

const treeProps = {
  label: 'name',
  children: 'children',
  value: 'id',
};

const formRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  sort: [{ type: 'number', message: '排序号必须为数字' }],
});

const dialogFormRules = reactive<FormRules>({
    name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
    sort: [{ type: 'number', message: '排序号必须为数字' }],
});

const fetchDocTypeTree = async () => {
  console.log('fetchDocTypeTree started...');
  loading.value = true;
  try {
    const data = await getDocTypeTree();
    console.log('fetchDocTypeTree data received:', data);
    docTypeTree.value = data;
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
    selectedDocType.value = nodeData;
    if (nodeData) {
        Object.assign(formData, {
          ...nodeData,
          sort: nodeData.sort ?? 0
        });
        nextTick(() => {
             docTypeTreeRef.value?.setCurrentKey(id);
        });
    } else {
        selectedDocType.value = null;
        resetForm();
    }
};

const handleNodeClick = (data: DocTypeInfo) => {
  console.log('handleNodeClick called with data:', data);
  selectedDocType.value = data;
  Object.assign(formData, {
    ...data,
    sort: data.sort ?? 0
  });
  nextTick(() => {
    docTypeFormRef.value?.clearValidate();
  });
};

const resetForm = () => {
  if (selectedDocType.value) {
    Object.assign(formData, {
        ...selectedDocType.value,
        sort: selectedDocType.value.sort ?? 0
    });
    nextTick(() => {
      docTypeFormRef.value?.clearValidate();
    });
  } else {
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

const handleReset = () => {
  if (!selectedDocType.value) {
     ElMessage.warning('请先选择一个文档类型');
     return;
  }
  resetForm();
  ElMessage.info('表单已重置');
};

const resetDialogForm = () => {
    dialogForm.name = '';
    dialogForm.parentId = null;
    dialogForm.sort = 0;
    dialogForm.description = '';
    dialogFormRef.value?.resetFields();
};

const handleAddTopLevel = () => {
    dialogMode.value = 'addTopLevel';
    dialogParentId.value = null;
    dialogParentName.value = '无 (作为顶级类型)';
    resetDialogForm();
    dialogVisible.value = true;
};

const handleAddChild = (parentData: DocTypeInfo) => {
    dialogMode.value = 'addChild';
    dialogParentId.value = parentData.id;
    dialogParentName.value = parentData.name;
    resetDialogForm();
    dialogVisible.value = true;
};

const handleDialogSubmit = async () => {
    if (!dialogFormRef.value) return;
    try {
        await dialogFormRef.value.validate();
        dialogLoading.value = true;
        const requestData: CreateDocTypeRequest = {
          name: dialogForm.name,
          parentId: dialogParentId.value,
          sortOrder: dialogForm.sort ?? 0,
          description: dialogForm.description,
        };
        await createDocType(requestData);
        ElMessage.success('新增成功');
        dialogVisible.value = false;
        await fetchDocTypeTree();
        nextTick(() => {
            if (selectedDocType.value && selectedDocType.value.id) {
                docTypeTreeRef.value?.setCurrentKey(selectedDocType.value.id);
                handleNodeClick(selectedDocType.value);
            }
        });
    } catch (error: any) {
         ElMessage.error(error.message || '新增失败');
         console.error('新增失败:', error);
    } finally {
        dialogLoading.value = false;
    }
};

const handleDelete = async (node: any, data: DocTypeInfo | null) => {
  const targetData = data || selectedDocType.value;
  if (!targetData || !targetData.id) {
      ElMessage.warning('请先选择要删除的文档类型');
      return;
  }

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
    loading.value = true;
    await deleteDocType(targetData.id);
    ElMessage.success('删除成功');
    if (selectedDocType.value?.id === targetData.id) {
      selectedDocType.value = null;
      resetForm();
    }
    await fetchDocTypeTree();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
      console.error('删除失败:', error);
    }
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!docTypeFormRef.value || !selectedDocType.value?.id) return;
  try {
    await docTypeFormRef.value.validate();
    loading.value = true;
    const requestData: UpdateDocTypeRequest = {
      name: formData.name,
      parentId: formData.parentId,
      sortOrder: Number(formData.sort ?? 0),
      description: formData.description,
    };
    await updateDocType(selectedDocType.value.id, requestData);
    ElMessage.success('更新成功');
    await fetchDocTypeTree();
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败');
    console.error('更新失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log('DocTypeManagement onMounted hook called.');
  fetchDocTypeTree();
});
</script>

<style scoped>
.doctype-management-page.el-container {
  height: calc(100vh - 100px);
  gap: 20px;
}

.tree-aside,
.form-main {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
}

.tree-card,
.form-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-card :deep(.el-card__header),
.form-card :deep(.el-card__header) {
  flex-shrink: 0;
}

.tree-card :deep(.el-card__body),
.form-card :deep(.el-card__body) {
  flex-grow: 1;
  overflow-y: auto;
}

.full-height-tree {
    height: 100%;
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

.custom-tree-node span:last-child {
  margin-left: 10px;
}

.dialog-footer {
    text-align: right;
}

.el-form-item :deep(.el-tree-select) {
    width: 100%;
}
</style>