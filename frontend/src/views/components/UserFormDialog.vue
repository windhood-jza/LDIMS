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
import { ref, reactive, watch, defineProps } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import type { UserInfo } from '../../../../backend/src/types/user';
import { createUser, updateUser } from '@/services/api/user';
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

// 表单验证规则
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
      validator: (rule: any, value: string, callback: Function) => {
        if (dialogType.value === 'add' && !value) {
          callback(new Error('请输入密码'));
        } else {
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
      validator: (rule: any, value: string, callback: Function) => {
        if (dialogType.value === 'add') {
          if (!value) {
            callback(new Error('请再次输入密码'));
          } else if (value !== formData.password) {
            callback(new Error('两次输入密码不一致'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      }
    },
  ],
});

// 打开弹窗
const open = (type: 'add' | 'edit', data?: UserInfo) => {
  dialogType.value = type;
  dialogVisible.value = true;
  
  if (type === 'edit' && data) {
    Object.assign(formData, {
      id: data.id,
      username: data.username,
      realName: data.realName,
      departmentId: data.departmentId,
      role: data.role,
      status: data.status,
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
  }
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  formRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 确保status为数值类型
        const submitData = {
          ...formData,
          status: Number(formData.status),
          // 编辑时不提交密码字段
          ...(dialogType.value === 'edit' ? { password: undefined } : {}),
        };
        
        console.log('提交的表单数据:', submitData);
        
        if (dialogType.value === 'add') {
          await createUser(submitData);
          ElMessage.success('创建成功');
        } else {
          await updateUser(submitData);
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
  padding-right: 20px;
}

.full-width {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 