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
            <el-form-item label="排序号" prop="sortOrder">
              <el-input-number v-model="formData.sortOrder" :min="0" controls-position="right" style="width: 100%;"></el-input-number>
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input type="textarea" v-model="formData.description" :rows="4" placeholder="请输入描述信息"></el-input>
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
            <el-form-item label="排序号" prop="sortOrder">
                 <el-input-number v-model="dialogForm.sortOrder" :min="0" controls-position="right" style="width: 100%;"/>
              </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input type="textarea" v-model="dialogForm.description" :rows="4" placeholder="请输入描述信息"></el-input>
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
// Removed ElRow, ElCol from import below (was line 131)
import { ElCard, ElTree, ElButton, ElForm, ElFormItem, ElInput, ElInputNumber, ElTreeSelect, ElMessage, ElMessageBox, ElEmpty, ElDialog } from 'element-plus'; 
import { Plus, Delete, RefreshLeft, Check } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { getDocTypeTree, createDocType, updateDocType, deleteDocType } from '../services/api/doctype';
// Assuming backend types use sortOrder in requests, but sort in DocTypeInfo
import type { DocTypeInfo, CreateDocTypeRequest, UpdateDocTypeRequest } from '@backend-types/doctype'; 

console.log('DocTypeManagement script setup executing...');

const docTypeTreeRef = ref<InstanceType<typeof ElTree>>();
const docTypeFormRef = ref<FormInstance>();
const dialogFormRef = ref<FormInstance>();

const docTypeTree = ref<DocTypeInfo[]>([]);
const loading = ref(false);
const selectedDocType = ref<DocTypeInfo | null>(null);
// Renamed sort to sortOrder (line 154) - Represents data for update request
const formData = reactive<Partial<DocTypeInfo> & { sortOrder?: number }>({
  id: undefined,
  name: '',
  parentId: null,
  sortOrder: 0, 
  description: '',
});

const dialogVisible = ref(false);
const dialogLoading = ref(false);
const dialogMode = ref<'addTopLevel' | 'addChild'>('addTopLevel');
const dialogParentId = ref<number | null>(null);
const dialogParentName = ref<string>('无 (作为顶级类型)');
// Renamed sort to sortOrder (line 164) - Represents data for create request
const dialogForm = reactive<Partial<CreateDocTypeRequest>>({
    name: '',
    parentId: null,
    sortOrder: 0, 
    description: '',
});

const dialogTitle = computed(() => dialogMode.value === 'addTopLevel' ? '新增顶级文档类型' : '新增子文档类型');

// Computed property for tree select data needs careful handling of null parentId
const docTypeTreeForSelect = computed(() => {
    // Helper to disable nodes that are the current node or its descendants
    const disableSelfAndDescendants = (nodes: DocTypeInfo[], nodeToDisableId: number | undefined): any[] => {
        if (!nodes || nodeToDisableId === undefined) return nodes; // Return original if no node selected for edit

        // Flatten tree for easier lookup if needed
        const flattenTree = (nodesToFlatten: DocTypeInfo[]): DocTypeInfo[] => {
            let result: DocTypeInfo[] = [];
            nodesToFlatten.forEach(node => {
                result.push(node);
                if (node.children) {
                    result = result.concat(flattenTree(node.children));
                }
            });
            return result;
        };
        const flatTree = flattenTree(docTypeTree.value); // Assuming docTypeTree has the full tree

        const findNodeByIdFlat = (flatNodes: DocTypeInfo[], id: number | null): DocTypeInfo | null => {
             if (id === null) return null;
             return flatNodes.find(node => node.id === id) || null;
        };


        return nodes.map(node => {
            let disabled = false;
            // Disable the node itself if it's the one being edited
            if (node.id === nodeToDisableId) {
                disabled = true;
            }
            // Recursively check if the node is a descendant of the edited node
            let isDescendantFlag = false;
             let tempNode: DocTypeInfo | null = node;
             while(tempNode?.parentId !== null && tempNode?.parentId !== undefined) {
                 if (tempNode.parentId === nodeToDisableId) {
                     isDescendantFlag = true;
                     break;
                 }
                 tempNode = findNodeByIdFlat(flatTree, tempNode.parentId);
                 if (!tempNode) break; // Parent not found
             }
             if (isDescendantFlag) {
                 disabled = true;
             }


            return {
                ...node,
                disabled: disabled,
                children: node.children ? disableSelfAndDescendants(node.children, nodeToDisableId) : undefined
            };
        });
    };

    // Prepare data for tree select, adding '无' option and disabling nodes if editing
    const dataForSelect = disableSelfAndDescendants(docTypeTree.value, formData.id);
    // Add top-level option correctly
    return [{ id: null, name: '无 (作为顶级类型)', children: [], disabled: false }, ...dataForSelect]; 
});


const isEditingSelfOrChild = computed(() => {
    // This logic is complex and might be better handled by disabling options in treeSelectData
    // Simplified check: Are we editing AND is the selected parent the same as the node ID?
    if (!formData.id) return false; // Not editing
    return formData.parentId === formData.id; // Should not happen if disabled correctly
});


const treeProps = {
  label: 'name',
  children: 'children',
  value: 'id',
};

// Renamed sort to sortOrder (line 247)
const formRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  sortOrder: [{ type: 'number', message: '排序号必须为数字' }], 
});

// Renamed sort to sortOrder (line 252)
const dialogFormRules = reactive<FormRules>({
    name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
    sortOrder: [{ type: 'number', message: '排序号必须为数字' }], 
});

const fetchDocTypeTree = async () => {
  console.log('fetchDocTypeTree started...');
  loading.value = true;
  try {
    const data = await getDocTypeTree();
    console.log('fetchDocTypeTree data received:', data);
    docTypeTree.value = data;
    // If a node was previously selected, try to re-select it and update form
    if (selectedDocType.value?.id !== undefined) {
       updateSelectedInfo(selectedDocType.value.id);
    } else {
        // Clear selection and form if nothing was selected or selection invalid
        selectedDocType.value = null;
        resetForm();
    }
  } catch (error: any) {
    console.error('fetchDocTypeTree error:', error);
    ElMessage.error(error.message || '获取文档类型失败');
    docTypeTree.value = []; // Clear tree on error
    selectedDocType.value = null; // Clear selection
    resetForm(); // Reset form
  } finally {
    loading.value = false;
  }
};

// Helper to find node by ID (recursive) - ensure it uses the correct tree data
const findNodeByIdRecursive = (nodes: DocTypeInfo[] | undefined, id: number): DocTypeInfo | null => {
    if (!nodes) return null;
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeByIdRecursive(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

// Updates the selectedDocType and formData based on ID
const updateSelectedInfo = (id: number) => {
    const nodeData = findNodeByIdRecursive(docTypeTree.value, id);
    if (nodeData) {
        selectedDocType.value = { ...nodeData }; // Clone to prevent direct modification
        Object.assign(formData, {
            id: nodeData.id,
            name: nodeData.name,
            parentId: nodeData.parentId,
            // Renamed sort to sortOrder (line 270) - Use 'sort' from DocTypeInfo
            sortOrder: nodeData.sort ?? 0, 
            description: nodeData.description ?? '',
        });
        nextTick(() => {
             docTypeFormRef.value?.clearValidate(); // Clear validation on selection change
             docTypeTreeRef.value?.setCurrentKey(id); // Highlight selected node in tree
        });
    } else {
        // If node not found (e.g., after deletion/refresh), clear selection
        selectedDocType.value = null;
        resetForm();
    }
};


const handleNodeClick = (data: DocTypeInfo) => {
  console.log('handleNodeClick called with data:', data);
  if (data.id !== undefined) {
      updateSelectedInfo(data.id); // Use central function to update state
  } else {
      console.warn("Clicked node has no ID:", data);
      selectedDocType.value = null;
      resetForm();
  }
};

// Renamed sort to sortOrder (lines 303, 312)
const resetForm = () => {
    if (selectedDocType.value) {
         // Reset form to reflect the currently selected node's data
         Object.assign(formData, {
            id: selectedDocType.value.id,
            name: selectedDocType.value.name,
            parentId: selectedDocType.value.parentId,
            // Use 'sort' from selectedDocType (DocTypeInfo)
            sortOrder: selectedDocType.value.sort ?? 0, 
            description: selectedDocType.value.description ?? '',
        });
    } else {
         // Clear form completely if no node is selected
         Object.assign(formData, {
            id: undefined,
            name: '',
            parentId: null,
            sortOrder: 0, 
            description: '',
        });
    }
     nextTick(() => {
        docTypeFormRef.value?.clearValidate(); // Always clear validation on reset
    });
};

// Added handleReset function definition
const handleReset = () => {
    resetForm();
};

const handleSubmit = async () => {
    if (!docTypeFormRef.value || !selectedDocType.value || formData.id === undefined) {
        console.warn("Form submit aborted. Ref or selection missing.");
        return;
    }

    await docTypeFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true;
            try {
                 // Renamed sort to sortOrder (line 368) - Build UpdateDocTypeRequest
                const updateData: UpdateDocTypeRequest = {
                    name: formData.name,
                    parentId: formData.parentId,
                    sortOrder: formData.sortOrder, 
                    description: formData.description,
                };
                await updateDocType(formData.id!, updateData); // Assert non-null ID
                ElMessage.success('文档类型更新成功');
                await fetchDocTypeTree(); // Reload tree
                // Re-select the updated node
                updateSelectedInfo(formData.id!);

            } catch (error: any) {
                console.error("Update DocType Error:", error);
                ElMessage.error(error.message || '更新失败');
            } finally {
                loading.value = false;
            }
        } else {
            console.log('Form validation failed.');
        }
    });
};

// --- Dialog Methods ---
// Renamed sort to sortOrder
const resetDialogForm = () => {
    Object.assign(dialogForm, {
        name: '',
        parentId: null,
        sortOrder: 0, 
        description: '',
    });
    dialogFormRef.value?.resetFields();
};

const handleAddTopLevel = () => {
    resetDialogForm();
    dialogMode.value = 'addTopLevel';
    dialogParentId.value = null;
    dialogParentName.value = '无 (作为顶级类型)';
    dialogForm.parentId = null; // Set parentId for the form
    dialogVisible.value = true;
};

const handleAddChild = (data: DocTypeInfo) => {
    resetDialogForm();
    dialogMode.value = 'addChild';
    dialogParentId.value = data.id ?? null;
    dialogParentName.value = data.name;
    dialogForm.parentId = data.id ?? null; // Set parentId for the form
    dialogVisible.value = true;
};

const handleDialogSubmit = async () => {
     if (!dialogFormRef.value) return;

     await dialogFormRef.value.validate(async (valid) => {
         if (valid) {
             dialogLoading.value = true;
             try {
                 // Renamed sort to sortOrder (line 429) - Build CreateDocTypeRequest
                 const createData: CreateDocTypeRequest = {
                     name: dialogForm.name!, // Assert non-null as it's required
                     parentId: dialogParentId.value, // Use stored parent ID from open function
                     sortOrder: dialogForm.sortOrder, 
                     description: dialogForm.description,
                 };
                 await createDocType(createData);
                 ElMessage.success('文档类型创建成功');
                 dialogVisible.value = false;
                 await fetchDocTypeTree(); // Reload tree
                 // Optionally select the new node (would need ID from backend response)

             } catch (error: any) {
                 console.error("Create DocType Error:", error);
                 ElMessage.error(error.message || '创建失败');
             } finally {
                 dialogLoading.value = false;
             }
         }
     });
};


// Prefixed unused 'node' param below (was line 333)
const handleDelete = async (_node: any, data: DocTypeInfo | null) => { 
  if (!data || data.id === undefined) {
    ElMessage.warning('无法删除，节点数据无效。');
    return;
  }

  // Check for children using the data fetched from the tree
  const nodeInTree = findNodeByIdRecursive(docTypeTree.value, data.id);
  if (nodeInTree && nodeInTree.children && nodeInTree.children.length > 0) {
      ElMessage.warning('该类型下有子类型，请先删除子类型。');
      return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除文档类型 "${data.name}" 吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    loading.value = true; // Use main loading indicator
    await deleteDocType(data.id);
    ElMessage.success(`文档类型 "${data.name}" 删除成功`);

    // If deleted node was selected, clear selection and form
    if (selectedDocType.value && selectedDocType.value.id === data.id) {
      selectedDocType.value = null;
      resetForm();
    }

    await fetchDocTypeTree(); // Reload tree

  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete DocType Error:', error);
      ElMessage.error(error.message || '删除失败');
    }
  } finally {
      loading.value = false;
  }
};


onMounted(() => {
  fetchDocTypeTree();
});

</script>

<style scoped>
.doctype-management-page {
  display: flex;
  height: calc(100vh - 60px); /* Adjust based on your layout's header height */
  padding: 0; /* Remove padding if container handles it */
}

.tree-aside {
  /* width: 350px; */ /* Fixed width might be better */
  border-right: 1px solid #e4e7ed;
  padding: 0;
  height: 100%;
  display: flex; /* Ensure card fills height */
  flex-direction: column; /* Ensure card fills height */
}

.tree-card {
  height: 100%; /* Make card fill aside */
  display: flex; /* Allow body to grow */
  flex-direction: column; /* Allow body to grow */
  border: none; /* Remove card border if desired */
  box-shadow: none; /* Remove shadow if desired */
   border-radius: 0;
}
.tree-card :deep(.el-card__header) {
    padding: 15px;
    border-bottom: 1px solid #ebeef5;
}
.tree-card :deep(.el-card__body) {
  flex-grow: 1; /* Allow tree area to take remaining space */
  overflow-y: auto; /* Add scroll if tree is tall */
  padding: 15px;
}

.full-height-tree {
    /* Ensure tree takes available space if needed, useful with overflow */
    /* height: 100%; */
}


.form-main {
  padding: 0;
  height: 100%;
  display: flex; /* Ensure card fills height */
  flex-direction: column; /* Ensure card fills height */
}

.form-card {
  height: 100%;
   display: flex; /* Allow body to grow */
  flex-direction: column; /* Allow body to grow */
   border: none;
   box-shadow: none;
    border-radius: 0;
}
.form-card :deep(.el-card__header) {
    padding: 15px;
     border-bottom: 1px solid #ebeef5;
}
.form-card :deep(.el-card__body) {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}


.clearfix::after {
  content: "";
  display: table;
  clear: both;
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
   display: none; /* Initially hide */
}

/* Show buttons on hover */
.el-tree-node__content:hover .custom-tree-node span:last-child {
  display: inline-block;
}

.form-content {
  padding-top: 15px;
}

.el-empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Dialog style */
.dialog-footer {
  text-align: right;
}
</style>