<template>
  <el-dialog
    :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
    v-model="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="user-form"
    >
      <el-form-item label="用户名" prop="username">
        <el-input 
          v-model="formData.username" 
          placeholder="请输入用户名"
          :disabled="dialogType === 'edit'"
        ></el-input>
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="formData.realName" placeholder="请输入真实姓名"></el-input>
      </el-form-item>
      <el-form-item label="所属部门" prop="departmentId">
        <el-select v-model="formData.departmentId" placeholder="请选择部门" class="full-width">
          <el-option
            v-for="dept in props.departments"
            :key="dept.id"
            :label="dept.name"
            :value="dept.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="formData.role" placeholder="请选择角色" class="full-width">
          <el-option label="管理员" value="admin"></el-option>
          <el-option label="录入员" value="editor"></el-option>
          <el-option label="查看员" value="viewer"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
          inline-prompt
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
      <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password
        ></el-input>
      </el-form-item>
      <el-form-item v-if="dialogType === 'add'" label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// Added 'nextTick' to import (Fixes: Cannot find name 'nextTick')
import { ref, reactive, defineProps, nextTick } from 'vue'; 
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
// Note: The path below seems incorrect, adjust if necessary
// We need the request type for creating a user, assuming it exists
import type { UserInfo, CreateUserRequest, UpdateUserRequest } from '../../../../backend/src/types/user'; 
import { createUser, updateUser } from '@/services/api/user';
// Note: The path below seems incorrect, adjust if necessary
import type { DepartmentInfo } from '@backend-types/department'; 

// 定义 Props 来接收部门数据
const props = defineProps<{
  departments: DepartmentInfo[]; // 声明接收一个名为 departments 的 prop，类型为 DepartmentInfo 数组
}>();

const emit = defineEmits(['success']);

const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = reactive({
  id: undefined as number | undefined,
  username: '',
  realName: '',
  departmentId: undefined as number | undefined,
  role: '',
  status: 1,
  password: '',
  confirmPassword: '',
});

// 表单验证规则 (保持不变)
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  departmentId: [
    { required: true, message: '请选择所属部门', trigger: 'change' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
  password: [
    { 
      required: true, 
      message: '请输入密码', 
      trigger: 'blur',
      validator: (_rule: any, value: string, callback: Function) => { 
        if (dialogType.value === 'add' && !value) {
          callback(new Error('请输入密码'));
        } else {
          // Check confirm password validity when password changes in add mode
          if (dialogType.value === 'add' && formData.confirmPassword) {
             formRef.value?.validateField('confirmPassword');
          }
          callback();
        }
      }
    },
    { min: 6, message: '密码长度不能小于 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    {
      required: true,
      message: '请再次输入密码',
      trigger: 'blur',
      validator: (_rule: any, value: string, callback: Function) => { 
        if (dialogType.value === 'add') {
          if (!value) {
            callback(new Error('请再次输入密码'));
          } else if (value !== formData.password) {
            callback(new Error('两次输入密码不一致'));
          } else {
            callback();
          }
        } else {
          callback(); // Edit mode doesn't need confirm password validation
        }
      }
    },
  ],
});

// 打开弹窗
const open = (type: 'add' | 'edit', data?: UserInfo) => {
  dialogType.value = type;
  dialogVisible.value = true;
  
  // Reset validation before potential assignments
  nextTick(() => {
    formRef.value?.clearValidate(); 
  });

  if (type === 'edit' && data) {
    Object.assign(formData, {
      id: data.id,
      username: data.username,
      realName: data.realName,
      departmentId: data.departmentId,
      role: data.role,
      status: data.status,
      password: '', // Clear password fields for edit mode
      confirmPassword: '',
    });
  } else {
    // 新增时重置表单
    Object.assign(formData, {
      id: undefined,
      username: '',
      realName: '',
      departmentId: undefined,
      role: '',
      status: 1,
      password: '',
      confirmPassword: '',
    });
     // Reset specific fields in case they weren't covered by resetFields
     nextTick(() => {
         // Only reset fields relevant to add mode, avoid username in edit
         formRef.value?.resetFields(['realName', 'departmentId', 'role', 'password', 'confirmPassword']);
         if (dialogType.value === 'add') {
             formRef.value?.resetFields(['username']);
         }
     });
  }
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  // Reset form data to initial state when closing
  Object.assign(formData, {
      id: undefined,
      username: '',
      realName: '',
      departmentId: undefined,
      role: '',
      status: 1,
      password: '',
      confirmPassword: '',
  });
  nextTick(() => {
    formRef.value?.resetFields(); 
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // Prepare data based on dialog type
        if (dialogType.value === 'add') {
          // Assume CreateUserRequest is defined and expects these fields
          const createData: CreateUserRequest = { 
            username: formData.username,
            realName: formData.realName,
            departmentId: formData.departmentId!, // Assuming departmentId is required and not undefined here due to validation
            // FIX: Assert role type (was line 251)
            role: formData.role as 'admin' | 'editor' | 'viewer', 
            status: Number(formData.status), // Assuming status is optional in CreateUserRequest based on backend types
            password: formData.password, 
          };
          console.log('提交的创建数据:', createData);
          await createUser(createData); 
          ElMessage.success('创建成功');
        } else {
          // Assume UpdateUserRequest is defined and expects these fields
          // Also ensure ID exists for update
          if (!formData.id) {
              ElMessage.error('无法更新用户：用户ID丢失');
              loading.value = false;
              return;
          }
          // FIX: Add id to updateData and adjust type (was line 267-272)
          // Assuming UpdateUserRequest itself doesn't include id
          const updateData: UpdateUserRequest & { id: number } = { 
            id: formData.id!, 
            realName: formData.realName,
            departmentId: formData.departmentId!, // Assuming required
            // FIX: Assert role type (was line 270)
            role: formData.role as 'admin' | 'editor' | 'viewer', 
            status: Number(formData.status),
          };
          console.log('提交的更新数据:', updateData);
          // FIX: Pass only updateData (assuming updateUser expects id within the object) (was line 274)
          await updateUser(updateData); 
          ElMessage.success('更新成功');
        }
        
        emit('success');
        handleClose();
      } catch (error: any) {
        console.error('表单提交错误:', error);
        ElMessage.error(error.message || '操作失败');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 暴露方法给父组件
defineExpose({
  open,
});
</script>

<style scoped>
.user-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 20px; /* Add some padding for scrollbar */
}
.full-width {
    width: 100%;
}
/* Optional: Adjust dialog footer padding if form scrolls */
.dialog-footer {
  padding-top: 10px; 
}
</style>