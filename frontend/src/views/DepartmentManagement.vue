<template>
  <div class="department-management-page">
    <el-row :gutter="20">
      <!-- 左侧部门树 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>部门列表</span>
              <el-button type="primary" :icon="Plus" @click="handleAddTopLevel"
                >新增顶级部门</el-button
              >
            </div>
          </template>
          <el-input
            v-model="filterText"
            placeholder="输入关键字进行过滤"
            clearable
            style="margin-bottom: 15px"
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
                  <el-button
                    type="primary"
                    link
                    :icon="Plus"
                    @click.stop="handleAddChild(data)"
                    >新增子级</el-button
                  >
                  <el-button
                    type="danger"
                    link
                    :icon="Delete"
                    @click.stop="handleDelete(data)"
                    >删除</el-button
                  >
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
                  style="margin-left: 10px"
                >
                  删除
                </el-button>
                <el-button
                  type="primary"
                  :icon="Check"
                  @click="handleSave"
                  :loading="formLoading"
                  :disabled="!selectedDepartment || !selectedDepartment.id"
                  style="margin-left: 10px"
                >
                  保存
                </el-button>
              </div>
            </div>
          </template>
          <div v-if="selectedDepartment" class="form-content">
            <el-form
              ref="formRef"
              :model="departmentForm"
              :rules="formRules"
              label-width="100px"
            >
              <el-form-item label="部门名称" prop="name">
                <el-input
                  v-model="departmentForm.name"
                  placeholder="请输入部门名称"
                ></el-input>
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
                  style="width: 100%"
                  :render-after-expand="false"
                  :disabled="isEditingSelfOrChild"
                />
              </el-form-item>
              <el-form-item label="排序号" prop="sortOrder">
                <el-input-number
                  v-model="departmentForm.sortOrder"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="创建时间">
                <el-input
                  :value="formatDateTime(selectedDepartment.createdAt)"
                  disabled
                />
              </el-form-item>
              <el-form-item label="更新时间">
                <el-input
                  :value="formatDateTime(selectedDepartment.updatedAt)"
                  disabled
                />
              </el-form-item>
            </el-form>
          </div>
          <el-empty
            v-else
            description="请在左侧选择一个部门进行查看或编辑"
          ></el-empty>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增/编辑部门对话框 (使用一个简单的对话框先) -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @closed="resetDialogForm"
    >
      <el-form
        ref="dialogFormRef"
        :model="dialogForm"
        :rules="dialogFormRules"
        label-width="100px"
      >
        <el-form-item label="部门名称" prop="name">
          <el-input
            v-model="dialogForm.name"
            placeholder="请输入部门名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="上级部门">
          <el-input :value="dialogParentName" disabled />
        </el-form-item>
        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number
            v-model="dialogForm.sortOrder"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleDialogSubmit"
            :loading="dialogLoading"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// Re-added 'nextTick' import below (was line 141)
import { ref, reactive, onMounted, watch, computed, nextTick } from "vue";
import {
  ElTree,
  ElCard,
  ElRow,
  ElCol,
  ElButton,
  ElInput,
  ElForm,
  ElFormItem,
  ElEmpty,
  ElTreeSelect,
  ElInputNumber,
  ElDialog,
  ElMessage,
  ElMessageBox,
} from "element-plus";
import { Plus, Delete, RefreshLeft, Check } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
// import type Node from 'element-plus/es/components/tree/src/model/node';
import {
  getDepartmentTree,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/services/api/department";
import type {
  DepartmentInfo,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from "@ldims/types";
import { format, parseISO } from "date-fns";

// --- Refs ---
const treeRef = ref<InstanceType<typeof ElTree>>();
const formRef = ref<FormInstance>();
const dialogFormRef = ref<FormInstance>();

// --- State ---
const filterText = ref("");
const departmentTree = ref<DepartmentInfo[]>([]);
const treeLoading = ref(false);
const selectedDepartment = ref<DepartmentInfo | null>(null);
const formLoading = ref(false);
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const dialogMode = ref<"addTopLevel" | "addChild" | "edit">("addTopLevel");
const dialogParentId = ref<number | null>(null);
const dialogParentName = ref<string>("无 (顶级部门)");

// --- Reactive Forms ---
const departmentForm = reactive<Partial<DepartmentInfo>>({
  id: undefined,
  name: "",
  parentId: null,
  sortOrder: 0,
});
const dialogForm = reactive<CreateDepartmentRequest>({
  name: "",
  parentId: null,
  sortOrder: 0,
});

// --- Computed ---
const treeProps = {
  children: "children",
  label: "name",
};
const treeSelectProps = { ...treeProps, disabled: "disabled" }; // 用于TreeSelect
const dialogTitle = computed(() =>
  dialogMode.value === "addTopLevel" ? "新增顶级部门" : "新增子部门"
);

// 简单的将树转为TreeSelect需要的数据，并标记自身及子孙不可选 (编辑时)
const treeSelectData = computed(() => {
  const disableNodes = (
    nodes: DepartmentInfo[],
    nodeToDisableId: number | undefined
  ): any[] => {
    if (!nodes) return []; // Handle case where nodes might be undefined initially
    return nodes.map((node) => {
      let disabled = false;
      if (node.id === nodeToDisableId) {
        disabled = true;
      }
      const children = node.children
        ? disableNodes(node.children, nodeToDisableId)
        : undefined;

      // Recursive check to disable children if any ancestor is the node being edited
      const isDescendantOfDisabled = (
        currentNode: DepartmentInfo,
        targetId: number | undefined
      ): boolean => {
        if (!targetId) return false;
        if (currentNode.parentId === targetId) return true;
        if (currentNode.parentId === null || currentNode.parentId === undefined)
          return false;

        const parentNode = findNodeById(
          departmentTree.value,
          currentNode.parentId
        );
        if (parentNode) {
          return isDescendantOfDisabled(parentNode, targetId);
        }
        return false;
      };

      // Disable self and all descendants
      if (
        node.id === departmentForm.id ||
        isDescendantOfDisabled(node, departmentForm.id)
      ) {
        disabled = true;
      }

      return { ...node, id: node.id, name: node.name, children, disabled }; // Ensure basic properties exist
    });
  };

  // Helper to find node by ID in the original tree (needed for ancestor check)
  const findNodeById = (
    nodes: DepartmentInfo[] | undefined,
    id: number
  ): DepartmentInfo | null => {
    if (!nodes) return null;
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 在编辑模式下，禁用当前节点及其所有子节点作为父节点
  return disableNodes(departmentTree.value, departmentForm.id);
});

// 是否正在编辑部门且试图将其父级设为自身或子级 (简化判断)
const isEditingSelfOrChild = computed(() => {
  // This computation is now handled within treeSelectData by disabling nodes.
  // Keeping the computed property might be useful for other logic if needed.
  return !!departmentForm.id;
});

// --- Form Rules ---
const formRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
  // parentId might need validation if required, but typically null means top-level
});
const dialogFormRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
});

// --- Methods ---
// 格式化日期时间
const formatDateTime = (dateTimeString?: string | null) => {
  // Allow null
  if (!dateTimeString) return "N/A";
  try {
    // Removed instanceof check (was line 264)
    // Attempt to parse ISO string directly
    return format(parseISO(dateTimeString), "yyyy-MM-dd HH:mm:ss");
  } catch (e) {
    console.error("Error parsing date:", dateTimeString, e); // Log error
    return dateTimeString; // Return original string if parsing fails
  }
};

// 加载部门树
const fetchTree = async () => {
  treeLoading.value = true;
  try {
    departmentTree.value = await getDepartmentTree();
    console.log(
      "Fetched department tree:",
      JSON.stringify(departmentTree.value, null, 2)
    ); // Log fetched data
    // 如果有选中的节点，更新选中节点的信息
    if (selectedDepartment.value && selectedDepartment.value.id !== undefined) {
      updateSelectedDepartmentInfo(selectedDepartment.value.id);
    } else {
      selectedDepartment.value = null; // Clear selection if previous selection is invalid
      resetForm(); // Reset form if no valid selection
    }
  } catch (error) {
    console.error("加载部门树失败:", error);
    ElMessage.error("加载部门树失败");
    departmentTree.value = []; // Clear tree on error
  } finally {
    treeLoading.value = false;
  }
};

// 根据 ID 查找并更新右侧表单的选中部门信息
const updateSelectedDepartmentInfo = (id: number) => {
  const findNode = (
    nodes: DepartmentInfo[],
    targetId: number
  ): DepartmentInfo | null => {
    for (const node of nodes) {
      if (node.id === targetId) {
        return node;
      }
      if (node.children) {
        const found = findNode(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };
  const node = findNode(departmentTree.value, id);
  if (node) {
    selectedDepartment.value = { ...node }; // Use spread to avoid reactivity issues
    // Update form data reactively
    departmentForm.id = node.id;
    departmentForm.name = node.name;
    departmentForm.parentId = node.parentId;
    departmentForm.sortOrder = node.sortOrder;
    // Add console log here
    console.log(
      `[DepartmentManagement] Assigned value to departmentForm.sortOrder: ${departmentForm.sortOrder}`
    );
    // Clear validation state after updating form
    nextTick(() => {
      // Use nextTick
      formRef.value?.clearValidate();
    });
  } else {
    // Node not found after fetch (e.g., deleted), clear selection
    selectedDepartment.value = null;
    resetForm();
  }
};

// 监听过滤文本变化
watch(filterText, (val) => {
  treeRef.value!.filter(val);
});

// 过滤节点方法
// Changed 'data' type to 'any' below (was line 342)
const filterNode = (value: string, data: any): boolean => {
  if (!value) return true;
  // Assume data has a 'name' property for filtering
  return data.name?.includes(value);
};

// 节点点击事件
const handleNodeClick = (data: DepartmentInfo) => {
  // Use DepartmentInfo
  console.log("Node clicked:", data);
  selectedDepartment.value = { ...data }; // Use spread operator
  // Update form data
  departmentForm.id = data.id;
  departmentForm.name = data.name;
  departmentForm.parentId = data.parentId;
  departmentForm.sortOrder = data.sortOrder;
  // Clear validation state when node changes
  nextTick(() => {
    // Use nextTick
    formRef.value?.clearValidate();
  });
};

// 重置表单
const resetForm = () => {
  if (selectedDepartment.value) {
    // Reset form to selected department's data
    departmentForm.id = selectedDepartment.value.id;
    departmentForm.name = selectedDepartment.value.name;
    departmentForm.parentId = selectedDepartment.value.parentId;
    departmentForm.sortOrder = selectedDepartment.value.sortOrder;
    // Clear validation state after resetting
    nextTick(() => {
      // Use nextTick
      formRef.value?.clearValidate();
    });
  } else {
    // Clear form if nothing is selected
    departmentForm.id = undefined;
    departmentForm.name = "";
    departmentForm.parentId = null;
    departmentForm.sortOrder = 0;
    formRef.value?.resetFields(); // Also call resetFields for initial state
  }
};

// 保存部门信息
const handleSave = async () => {
  if (
    !formRef.value ||
    !selectedDepartment.value ||
    departmentForm.id === undefined
  )
    return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      formLoading.value = true;
      try {
        const updateData: UpdateDepartmentRequest = {
          name: departmentForm.name,
          parentId: departmentForm.parentId,
          sortOrder: departmentForm.sortOrder ?? 0, // Provide default if possibly undefined
        };
        await updateDepartment(departmentForm.id!, updateData); // Assert non-null ID
        ElMessage.success("部门信息保存成功");
        await fetchTree(); // 重新加载树以更新信息
        // Keep the node selected after save if needed
        // updateSelectedDepartmentInfo(departmentForm.id!); // Re-fetch potentially updated data
      } catch (error: any) {
        console.error("保存部门信息失败:", error);
        ElMessage.error(error.message || "保存失败");
      } finally {
        formLoading.value = false;
      }
    }
  });
};

// --- 新增/删除相关方法 ---

// 重置新增对话框表单
const resetDialogForm = () => {
  dialogForm.name = "";
  dialogForm.parentId = null;
  dialogForm.sortOrder = 0;
  dialogFormRef.value?.resetFields();
};

// 打开新增顶级部门对话框
const handleAddTopLevel = () => {
  resetDialogForm();
  dialogMode.value = "addTopLevel";
  dialogParentId.value = null;
  dialogParentName.value = "无 (顶级部门)";
  dialogVisible.value = true;
};

// 打开新增子部门对话框
const handleAddChild = (data: DepartmentInfo) => {
  resetDialogForm();
  dialogMode.value = "addChild";
  dialogParentId.value = data.id ?? null; // Use null if id is somehow undefined
  dialogParentName.value = data.name;
  dialogForm.parentId = data.id ?? null; // Pre-fill parentId
  dialogVisible.value = true;
};

// 处理新增对话框提交
const handleDialogSubmit = async () => {
  if (!dialogFormRef.value) return;

  await dialogFormRef.value.validate(async (valid) => {
    if (valid) {
      dialogLoading.value = true;
      try {
        const createData: CreateDepartmentRequest = {
          name: dialogForm.name,
          parentId: dialogParentId.value, // Use the stored parent ID
          sortOrder: dialogForm.sortOrder ?? 0,
        };
        console.log(
          "[DepartmentManagement] Creating department with data:",
          JSON.stringify(createData)
        );
        await createDepartment(createData);
        ElMessage.success("部门创建成功");
        dialogVisible.value = false;
        await fetchTree(); // 重新加载树
        // Optionally select the newly created node? Requires getting its ID back.
      } catch (error: any) {
        console.error("创建部门失败:", error);
        ElMessage.error(error.message || "创建失败");
      } finally {
        dialogLoading.value = false;
      }
    }
  });
};

// 删除部门
const handleDelete = async (data: DepartmentInfo) => {
  if (!data || data.id === undefined) {
    ElMessage.warning("无法删除：部门数据无效");
    return;
  }
  // 检查是否有子部门
  if (data.children && data.children.length > 0) {
    ElMessage.warning("该部门下有子部门，请先删除子部门");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除部门 "${data.name}" 吗？此操作不可恢复。`,
      "警告",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    formLoading.value = true; // Indicate loading state
    await deleteDepartment(data.id);
    ElMessage.success(`部门 "${data.name}" 删除成功`);

    // 如果删除的是当前选中的部门，则清空右侧表单
    if (selectedDepartment.value && selectedDepartment.value.id === data.id) {
      selectedDepartment.value = null;
      resetForm();
    }

    await fetchTree(); // 重新加载树
  } catch (error: any) {
    // Handle cancellation ('cancel') or actual error
    if (error !== "cancel") {
      console.error("删除部门失败:", error);
      ElMessage.error(error.message || "删除失败");
    }
  } finally {
    formLoading.value = false;
  }
};

// --- Lifecycle ---
onMounted(() => {
  fetchTree();
});
</script>

<style scoped>
.department-management-page {
  padding: 0;
}

.el-card {
  height: calc(100vh - 100px); /* Adjust based on layout */
  display: flex;
  flex-direction: column;
}

.el-card :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;
}

.el-card :deep(.el-card__body) {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
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

.custom-tree-node span:last-child {
  margin-left: 10px;
  display: none; /* Initially hide buttons */
}

/* Show buttons on hover */
.el-tree-node__content:hover .custom-tree-node span:last-child {
  display: inline-block;
}

.form-content {
  padding-top: 10px;
}

.el-empty {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Ensure TreeSelect dropdown is wide enough */
:deep(.el-tree-select__popper) {
  min-width: fit-content; /* Adjust as needed */
}

/* Dialog style */
.dialog-footer {
  text-align: right;
}
</style>
