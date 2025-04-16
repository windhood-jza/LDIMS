<template>
  <div class="user-management-page">
    <!-- 搜索与操作区域 -->
    <el-card class="control-card" shadow="never">
      <div class="control-container">
        <!-- 搜索表单 -->
        <el-form :inline="true" :model="searchParams" class="search-form" @submit.prevent="handleSearch">
          <el-form-item label="关键字">
            <el-input v-model="searchParams.keyword" placeholder="用户名/姓名" clearable></el-input>
          </el-form-item>
          <el-form-item label="部门">
            <el-tree-select
              v-model="searchParams.departmentId"
              :data="departments"
              :props="{ label: 'name', children: 'children', value: 'id' }"
              placeholder="请选择部门"
              clearable
              filterable
              check-strictly
              node-key="id"
              default-expand-all
              style="width: 180px;"
            />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="searchParams.role" placeholder="请选择角色" clearable>
              <el-option label="管理员" value="admin"></el-option>
              <el-option label="录入员" value="editor"></el-option>
              <el-option label="查看员" value="viewer"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchParams.status" placeholder="请选择状态" clearable>
              <el-option label="启用" :value="1"></el-option>
              <el-option label="禁用" :value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
            <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="handleAddUser" :icon="Plus">新增用户</el-button>
          <!-- 其他批量操作按钮 -->
        </div>
      </div>
    </el-card>

    <!-- 用户列表区域 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <!-- Table Columns -->
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" width="150"></el-table-column>
        <el-table-column prop="realName" label="真实姓名" width="150"></el-table-column>
        <el-table-column prop="role" label="角色" width="120">
           <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">{{ formatRole(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="departmentName" label="所属部门" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.departmentName || '未分配' }} </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch 
              v-model="row.status" 
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
           <template #default="{ row }">
             {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }">
            <div class="action-links">
              <el-button type="primary" link :icon="Edit" @click="handleEditUser(row)">编辑</el-button>
              <el-button type="danger" link :icon="Delete" @click="handleDeleteUser(row)">删除</el-button>
              <el-button type="warning" link :icon="Key" @click="handleResetPassword(row)">重置密码</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        class="pagination-container"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        v-model:current-page="paginationParams.page"
        v-model:page-size="paginationParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑用户弹窗 -->
    <UserFormDialog ref="userDialogRef" :departments="departments" @success="fetchUsers" />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElTable, ElTableColumn, ElCard, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElPagination, ElTag, ElSwitch, ElMessage, ElMessageBox, ElTreeSelect } from 'element-plus';
import { Search, Refresh, Plus, Edit, Delete, Key } from '@element-plus/icons-vue';
import { getUsers, updateUserStatus, deleteUser, resetUserPassword } from '@/services/api/user';
import type { UserInfo } from '../../../backend/src/types/user';
import { format, parseISO } from 'date-fns';
import UserFormDialog from './components/UserFormDialog.vue';
import { getDepartmentTree } from '@/services/api/department';
import type { DepartmentInfo } from '@backend-types/department';

const loading = ref(false);
const tableData = ref<UserInfo[]>([]);
const total = ref(0);

const searchParams = reactive({
  keyword: '',
  departmentId: undefined as number | undefined,
  role: undefined as string | undefined,
  status: undefined as number | undefined,
});

const paginationParams = reactive({
  page: 1,
  pageSize: 20,
});

// 部门数据
const departments = ref<DepartmentInfo[]>([]);

// 获取部门列表
const fetchDepartments = async () => {
  try {
    const data = await getDepartmentTree();
    departments.value = data;
  } catch (error: any) {
    console.error('获取部门树失败:', error);
    ElMessage.error(error.message || '获取部门树失败');
  }
};

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = {
      ...searchParams,
      page: paginationParams.page,
      pageSize: paginationParams.pageSize,
    };
    // 过滤掉 undefined 或空字符串的参数
    const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        // @ts-ignore
        acc[key] = value;
      }
      return acc;
    }, {});

    const data = await getUsers(filteredParams);
    tableData.value = data.list;
    total.value = data.total;
  } catch (error: any) {
    console.error('获取用户列表失败:', error);
    ElMessage.error(error.message || '获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  paginationParams.page = 1; // 搜索时回到第一页
  fetchUsers();
};

// 重置搜索
const resetSearch = () => {
  searchParams.keyword = '';
  searchParams.departmentId = undefined;
  searchParams.role = undefined;
  searchParams.status = undefined;
  handleSearch();
};

// 分页大小改变
const handleSizeChange = (val: number) => {
  paginationParams.pageSize = val;
  fetchUsers();
};

// 当前页改变
const handleCurrentChange = (val: number) => {
  paginationParams.page = val;
  fetchUsers();
};

// 格式化角色显示
const formatRole = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    editor: '录入员',
    viewer: '查看员',
  };
  return roleMap[role] || '未知';
};

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  switch (role) {
    case 'admin': return 'danger';
    case 'editor': return 'warning';
    case 'viewer': return 'info';
    default: return 'info';
  }
};

// 格式化日期时间
const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return '';
  try {
    return format(parseISO(dateTimeString), 'yyyy-MM-dd HH:mm:ss');
  } catch (e) {
    console.error('日期格式化错误:', e);
    return dateTimeString; // 返回原始字符串以防出错
  }
};

// 处理状态改变
const handleStatusChange = async (row: UserInfo) => {
  loading.value = true;
  try {
    await updateUserStatus(row.id, row.status);
    ElMessage.success('状态更新成功');
  } catch (error: any) {
    ElMessage.error('状态更新失败: ' + error.message);
    // 状态改回去
    row.status = row.status === 1 ? 0 : 1;
  } finally {
    loading.value = false;
  }
};

// 删除用户
const handleDeleteUser = (row: UserInfo) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.realName}" 吗？`, 
    '警告', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    loading.value = true;
    try {
      await deleteUser(row.id);
      ElMessage.success('删除成功');
      fetchUsers(); // 重新加载列表
    } catch (error: any) {
      ElMessage.error('删除失败: ' + error.message);
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    ElMessage.info('已取消删除');          
  });
};

// 用户表单弹窗引用
const userDialogRef = ref();

// 新增用户
const handleAddUser = () => {
  userDialogRef.value?.open('add');
};

// 编辑用户
const handleEditUser = (row: UserInfo) => {
  userDialogRef.value?.open('edit', row);
};

// 重置密码
const handleResetPassword = (row: UserInfo) => {
  ElMessageBox.confirm(
    `确定要重置用户 "${row.realName}" 的密码吗？`, 
    '警告', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    loading.value = true;
    try {
      await resetUserPassword(row.id);
      ElMessage.success('密码重置成功');
    } catch (error: any) {
      ElMessage.error('密码重置失败: ' + error.message);
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    ElMessage.info('已取消重置密码');          
  });
};

// 组件挂载后加载数据
onMounted(() => {
  fetchUsers();
  fetchDepartments();
});

</script>

<style scoped>
.user-management-page {
  padding: 0;
}

.control-card {
  margin-bottom: 15px;
  /* 确保 Card 内容区域没有不必要的内边距影响布局 */
  :deep(.el-card__body) {
    padding-bottom: 10px; /* 减少一点底部内边距 */
  }
}

.control-container {
  display: flex;
  justify-content: space-between;
  align-items: center; /* 改为 center 使垂直居中对齐 */
  flex-wrap: wrap; /* 允许换行 */
  gap: 10px; /* 容器内元素的间距 */
}

.search-form {
  display: flex;
  flex-wrap: wrap; /* 允许表单项换行 */
  gap: 10px; /* 表单项之间的间距 */
  align-items: center; /* 内部元素也居中对齐 */
  /* margin-bottom: 10px; */ /* 因为 control-container 有 gap，这里可能不需要 */
}

/* 调整 Element Plus 默认的 inline form item 底部边距 */
.search-form .el-form-item {
  margin-bottom: 0 !important;
  /* 确保 label 和 input 垂直居中 */
  display: flex;
  align-items: center;
}

.action-buttons {
  /* 按钮区域的样式 */
  /* 使用 flex 布局可能更好控制，但当前结构也行 */
}

.table-card {
  /* 表格卡片样式 */
}

/* 表格操作列按钮水平排列 */
.action-links {
  display: inline-flex; /* 使用 inline-flex 使按钮水平排列 */
  gap: 8px; /* 按钮之间的间距 */
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 统一搜索区域控件高度 */
.search-form .el-input,
.search-form .el-select,
.search-form .el-button {
  height: 36px;
  /* 对于 Select 和 Input，可能需要调整内部元素使其垂直居中 */
  :deep(.el-input__wrapper), :deep(.el-select__wrapper) {
      height: 100%;
      box-sizing: border-box;
  }
}

/* 为下拉选择框设置固定宽度 */
.search-form .el-select {
  width: 150px; /* 或根据需要调整宽度 */
}

/* 如果按钮高度不一致，也可以单独为按钮设置 */
/* .control-container .el-button {
  height: 36px;
} */

/* 为下拉选择框设置固定宽度 - 对 TreeSelect 可能也需要调整 */
.search-form .el-tree-select {
  width: 180px; /* 或根据需要调整宽度 */
  height: 36px; /* 保持高度一致 */
   :deep(.el-select__wrapper) {
      height: 100%;
      box-sizing: border-box;
  }
}

</style>
