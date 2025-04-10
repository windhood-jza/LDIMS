<template>
  <div class="department-management-page">
    <el-row :gutter="20">
      <!-- 左侧部门树 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>部门列表</span>
              <el-button type="primary" :icon="Plus" @click="handleAddTopLevel">新增顶级部门</el-button>
            </div>
          </template>
          <el-input
            v-model="filterText"
            placeholder="输入关键字进行过滤"
            clearable
            style="margin-bottom: 15px;"
          />
          <el-tree
            ref="treeRef"
            :data="departmentTree"
            :props="treeProps"
            node-key="id"
            highlight-current
            default-expand-all
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
            v-loading="treeLoading"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span>{{ node.label }}</span>
                <span>
                  <el-button type="primary" link :icon="Plus" @click.stop="handleAddChild(data)">新增子级</el-button>
                  <el-button type="danger" link :icon="Delete" @click.stop="handleDelete(data)">删除</el-button>
                </span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧部门信息表单 -->
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>部门信息</span>
              <div>
                <el-button
                  :icon="RefreshLeft" 
                  @click="resetForm"
                  :disabled="!selectedDepartment"
                >
                  重置
                </el-button>
                <el-button
                  type="danger"
                  :icon="Delete"
                  @click="handleDelete(selectedDepartment!)" 
                  :disabled="!selectedDepartment || !selectedDepartment.id"
                  style="margin-left: 10px;"
                >
                  删除
                </el-button>
                <el-button 
                  type="primary" 
                  :icon="Check" 
                  @click="handleSave" 
                  :loading="formLoading" 
                  :disabled="!selectedDepartment || !selectedDepartment.id"
                  style="margin-left: 10px;"
                >
                  保存
                </el-button>
              </div>
            </div>
          </template>
          <div v-if="selectedDepartment" class="form-content">
            <el-form ref="formRef" :model="departmentForm" :rules="formRules" label-width="100px">
              <el-form-item label="部门名称" prop="name">
                <el-input v-model="departmentForm.name" placeholder="请输入部门名称"></el-input>
              </el-form-item>
               <el-form-item label="上级部门" prop="parentId">
                 <el-tree-select
                    v-model="departmentForm.parentId"
                    :data="treeSelectData"
                    :props="treeSelectProps"
                    node-key="id"
                    check-strictly
                    filterable
                    clearable
                    placeholder="选择上级部门 (不选为顶级)"
                    style="width: 100%;"
                    :render-after-expand="false"
                    :disabled="isEditingSelfOrChild"
                  />
               </el-form-item>
              <el-form-item label="排序号" prop="sortOrder">
                 <el-input-number v-model="departmentForm.sortOrder" :min="0" style="width: 100%;"/>
              </el-form-item>
              <el-form-item label="创建时间">
                <el-input :value="formatDateTime(selectedDepartment.createdAt)" disabled />
              </el-form-item>
               <el-form-item label="更新时间">
                 <el-input :value="formatDateTime(selectedDepartment.updatedAt)" disabled />
              </el-form-item>
            </el-form>
          </div>
          <el-empty v-else description="请在左侧选择一个部门进行查看或编辑"></el-empty>
        </el-card>
      </el-col>
    </el-row>

     <!-- 新增/编辑部门对话框 (使用一个简单的对话框先) -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @closed="resetDialogForm">
        <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogFormRules" label-width="100px">
            <el-form-item label="部门名称" prop="name">
                <el-input v-model="dialogForm.name" placeholder="请输入部门名称"></el-input>
            </el-form-item>
            <el-form-item label="上级部门">
                <el-input :value="dialogParentName" disabled />
            </el-form-item>
            <el-form-item label="排序号" prop="sortOrder">
                 <el-input-number v-model="dialogForm.sortOrder" :min="0" style="width: 100%;"/>
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
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { ElTree, ElCard, ElRow, ElCol, ElButton, ElInput, ElForm, ElFormItem, ElEmpty, ElTreeSelect, ElInputNumber, ElDialog, ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete, RefreshLeft, Check } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import type Node from 'element-plus/es/components/tree/src/model/node'; // 类型
import { getDepartmentTree, createDepartment, updateDepartment, deleteDepartment } from '@/services/api/department';
import type { DepartmentInfo, CreateDepartmentRequest, UpdateDepartmentRequest } from '@backend-types/department';
import { format, parseISO } from 'date-fns';

// --- Refs ---
const treeRef = ref<InstanceType<typeof ElTree>>();
const formRef = ref<FormInstance>();
const dialogFormRef = ref<FormInstance>();

// --- State ---
const filterText = ref('');
const departmentTree = ref<DepartmentInfo[]>([]);
const treeLoading = ref(false);
const selectedDepartment = ref<DepartmentInfo | null>(null);
const formLoading = ref(false);
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const dialogMode = ref<'addTopLevel' | 'addChild' | 'edit'>('addTopLevel');
const dialogParentId = ref<number | null>(null);
const dialogParentName = ref<string>('无 (顶级部门)');

// --- Reactive Forms ---
const departmentForm = reactive<Partial<DepartmentInfo>>({
    id: undefined,
    name: '',
    parentId: null,
    sortOrder: 0,
});
const dialogForm = reactive<CreateDepartmentRequest>({
    name: '',
    parentId: null,
    sortOrder: 0,
});

// --- Computed ---
const treeProps = {
  children: 'children',
  label: 'name',
};
const treeSelectProps = { ...treeProps, disabled: 'disabled' }; // 用于TreeSelect
const dialogTitle = computed(() => dialogMode.value === 'addTopLevel' ? '新增顶级部门' : '新增子部门');

// 简单的将树转为TreeSelect需要的数据，并标记自身及子孙不可选 (编辑时)
const treeSelectData = computed(() => {
    const disableNodes = (nodes: DepartmentInfo[], nodeToDisableId: number | undefined): any[] => {
        if (!nodeToDisableId) return nodes; // 新增顶级时不禁
        return nodes.map(node => {
            let disabled = false;
            if (node.id === nodeToDisableId) {
                 disabled = true;
            }
            const children = node.children ? disableNodes(node.children, nodeToDisableId) : undefined;
            // 如果父节点被禁用，则所有子节点也应被禁用 (虽然check-strictly允许选择)
            if (children?.some(c => c.disabled || c.id === nodeToDisableId)) {
               // Simplified check - a more robust check would traverse up
               // In check-strictly mode, disabling parent doesn't automatically disable children selection
               // We disable direct selection of self
            }

             // Disable self
            if (node.id === departmentForm.id) {
                disabled = true;
            }

            return { ...node, children, disabled };
        });
    };
    // 在编辑模式下，禁用当前节点及其所有子节点作为父节点
    return disableNodes(departmentTree.value, departmentForm.id);
});

// 是否正在编辑部门且试图将其父级设为自身或子级 (简化判断)
const isEditingSelfOrChild = computed(() => {
  return !!departmentForm.id; // 简化：编辑时总是禁用 TreeSelect 的自身节点
});


// --- Form Rules ---
const formRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
});
const dialogFormRules = reactive<FormRules>({
    name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
});

// --- Methods ---
// 格式化日期时间
const formatDateTime = (dateTimeString?: string) => {
  if (!dateTimeString) return 'N/A';
  try {
    return format(parseISO(dateTimeString), 'yyyy-MM-dd HH:mm:ss');
  } catch (e) {
    return dateTimeString;
  }
};

// 加载部门树
const fetchTree = async () => {
  treeLoading.value = true;
  try {
    departmentTree.value = await getDepartmentTree();
    // 如果有选中的节点，更新选中节点的信息
    if (selectedDepartment.value) {
      updateSelectedDepartmentInfo(selectedDepartment.value.id);
    }
  } catch (error) {
    ElMessage.error('加载部门树失败');
    console.error(error);
  } finally {
    treeLoading.value = false;
  }
};

// 过滤树节点
const filterNode = (value: string, data: DepartmentInfo) => {
  if (!value) return true;
  return data.name.includes(value);
};

// 监听过滤文本变化
watch(filterText, (val) => {
  treeRef.value?.filter(val);
});

// 更新右侧表单数据
const updateForm = (data: DepartmentInfo | null) => {
    selectedDepartment.value = data;
    if (data) {
        departmentForm.id = data.id;
        departmentForm.name = data.name;
        departmentForm.parentId = data.parentId;
        departmentForm.sortOrder = data.sortOrder ?? 0;
    } else {
        departmentForm.id = undefined;
        departmentForm.name = '';
        departmentForm.parentId = null;
        departmentForm.sortOrder = 0;
        formRef.value?.resetFields(); // 清除校验
    }
};

// 树节点点击
const handleNodeClick = (data: DepartmentInfo) => {
  updateForm(data);
};

// 更新选中部门的信息 (在树刷新后保持选中状态和表单数据)
const updateSelectedDepartmentInfo = (id: number) => {
    const findNode = (nodes: DepartmentInfo[]): DepartmentInfo | null => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNode(node.children);
                if (found) return found;
            }
        }
        return null;
    };
    const nodeData = findNode(departmentTree.value);
    updateForm(nodeData);
     if (nodeData) {
        treeRef.value?.setCurrentKey(id); // 保持高亮
    }
};


// --- CRUD Operations ---

// 重置对话框表单
const resetDialogForm = () => {
    dialogForm.name = '';
    dialogForm.parentId = null;
    dialogForm.sortOrder = 0;
    dialogFormRef.value?.resetFields();
};

// 打开新增顶级部门对话框
const handleAddTopLevel = () => {
    dialogMode.value = 'addTopLevel';
    dialogParentId.value = null;
    dialogParentName.value = '无 (顶级部门)';
    resetDialogForm();
    dialogVisible.value = true;
};

// 打开新增子部门对话框
const handleAddChild = (data: DepartmentInfo) => {
    dialogMode.value = 'addChild';
    dialogParentId.value = data.id;
    dialogParentName.value = data.name;
    resetDialogForm();
    dialogForm.parentId = data.id; // 设置父ID
    dialogVisible.value = true;
};


// 处理对话框提交 (新增)
const handleDialogSubmit = async () => {
    if (!dialogFormRef.value) return;
    await dialogFormRef.value.validate(async (valid) => {
        if (valid) {
            dialogLoading.value = true;
             dialogForm.parentId = dialogParentId.value; // 确认父ID
            try {
                await createDepartment(dialogForm);
                ElMessage.success('部门创建成功');
                dialogVisible.value = false;
                await fetchTree(); // 刷新树
            } catch (error: any) {
                 ElMessage.error(error.message || '部门创建失败');
                 console.error(error);
            } finally {
                dialogLoading.value = false;
            }
        }
    });
};


// 保存表单 (更新)
const handleSave = async () => {
  if (!formRef.value || !selectedDepartment.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      formLoading.value = true;
      const updateData: UpdateDepartmentRequest = {
          name: departmentForm.name,
          parentId: departmentForm.parentId,
          sortOrder: departmentForm.sortOrder
      };
      try {
        await updateDepartment(selectedDepartment.value!.id, updateData);
        ElMessage.success('部门信息更新成功');
        // 保存后需要刷新树，因为 parentName 可能改变
        const currentSelectedId = selectedDepartment.value!.id; // 保存当前ID
        await fetchTree();
        // 刷新后重新选中并更新表单
        updateSelectedDepartmentInfo(currentSelectedId);

      } catch (error: any) {
          ElMessage.error(error.message || '部门信息更新失败');
          console.error(error);
      } finally {
        formLoading.value = false;
      }
    }
  });
};

// 删除部门
const handleDelete = (data: DepartmentInfo) => {
    ElMessageBox.confirm(
        `确定要删除部门 "${data.name}" 吗？其子部门（如有）不会被删除，请先处理。`,
        '警告',
        {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        treeLoading.value = true; // 使用树的加载状态
        try {
            await deleteDepartment(data.id);
            ElMessage.success('部门删除成功');
             // 如果删除的是当前选中的部门，则清空表单
            if (selectedDepartment.value && selectedDepartment.value.id === data.id) {
                 updateForm(null);
            }
            await fetchTree(); // 刷新树
        } catch (error: any) {
             ElMessage.error(error.message || '删除部门失败');
             console.error(error);
        } finally {
             treeLoading.value = false;
        }
    }).catch(() => {
        ElMessage.info('已取消删除');
    });
};

// 重置右侧表单为其原始选中状态
const resetForm = () => {
  if (selectedDepartment.value) {
    updateForm(selectedDepartment.value);
    formRef.value?.clearValidate(); // 清除可能的验证错误提示
    ElMessage.info('表单已重置');
  } else {
     ElMessage.warning('请先选择一个部门');
  }
};

// --- Lifecycle ---
onMounted(() => {
  fetchTree();
});

</script>

<style scoped>
.department-management-page {
  /* padding: 20px; */ /* Padding is on main-content now */
  height: 100%; /* 让页面容器占满父容器高度 */
}

/* 让 Row 和 Col 也占满高度 */
.el-row,
.el-col {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
/* 控制按钮只在 hover 时显示 */
.custom-tree-node span:last-child {
    /* display: none; */ /* 改为一直显示可能更好操作 */
    /* opacity: 0; */
    /* transition: opacity 0.2s ease-in-out; */
}
.el-tree-node__content:hover .custom-tree-node span:last-child {
    /* display: inline-block; */
    /* opacity: 1; */
}

.form-content {
    /* margin-top: 20px; */ /* Card header 有 padding */
}

.el-form {
    max-width: 95%; /* 稍微留点边距 */
    /* max-width: 600px; */ /* Maybe too restrictive */
}

.el-card {
    height: 100%; /* 让卡片占满 Col 高度 */
    display: flex;
    flex-direction: column;
}

:deep(.el-card__body) {
    flex: 1; /* 让 body 填充剩余空间 */
    overflow-y: auto; /* 内容超出时内部滚动 */
    padding: 20px; /* 确保 body 有内边距 */
}

/* 隐藏滚动条但保留滚动功能 (适用于 Webkit 内核浏览器) */
:deep(.el-card__body)::-webkit-scrollbar {
  display: none;
}
:deep(.el-card__body) {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

</style> 