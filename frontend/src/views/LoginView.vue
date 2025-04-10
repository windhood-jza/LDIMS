<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-banner">
        <div class="banner-content">
          <h1>文档信息管理系统</h1>
          <p>高效的文档管理平台，助力企业信息化建设。提供文档录入、存储、查询和统计分析等全方位功能，让文档管理更简单。</p>
        </div>
      </div>
      <div class="login-form-container">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <div class="login-header">
             <!-- 暂时移除 SVG Logo 以简化 -->
            <h2>欢迎使用</h2>
            <p>请登录您的账号</p>
          </div>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" show-password size="large"></el-input>
          </el-form-item>
          <el-form-item>
             <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit" :loading="loading" class="login-btn" size="large">
              登 录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { useRouter } from 'vue-router';
import { loginUser } from '@/services/api/auth'; // 引入真实的登录 API

const router = useRouter();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);

const loginForm = reactive({
  username: '',
  password: ''
});

const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 调用真实的登录 API
        const response = await loginUser(loginForm);
        
        // 后端 API 成功响应 (code 200)，包含 token 和 user
        const { token, user } = response.data; 

        // 存储 Token 和用户信息
        localStorage.setItem('authToken', token);
        localStorage.setItem('userInfo', JSON.stringify(user));
        console.log('登录成功，Token:', token);
        console.log('用户信息:', user);

        ElMessage.success(response.message || '登录成功');
        // 跳转到仪表盘页面
        router.push('/dashboard');

      } catch (error: any) {
        // API 调用失败 (网络错误或后端返回非200 code)
        // 响应拦截器已经处理了错误消息提取
        console.error('登录失败:', error);
        ElMessage.error(error.message || '登录失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    } else {
      console.log('表单验证失败');
      return false;
    }
  });
};

</script>

<style scoped>
.login-page {
  height: 100vh;
  overflow: hidden;
}
.login-container {
  display: flex;
  width: 100%;
  height: 100%;
}
.login-banner {
  flex: 1;
  background: linear-gradient(135deg, #1890ff 0%, #1d39c4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 40px;
}
.banner-content {
  max-width: 600px;
}
.banner-content h1 {
  font-size: 40px; /* 调整大小 */
  margin-bottom: 20px;
}
.banner-content p {
  font-size: 16px; /* 调整大小 */
  opacity: 0.9;
  line-height: 1.8;
}
.login-form-container {
  width: 450px; /* 调整宽度 */
  background: white;
  padding: 50px 40px; /* 调整内边距 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.login-header {
  text-align: center;
  margin-bottom: 30px; /* 调整间距 */
}
.login-header h2 {
  color: #1f2f3d;
  font-size: 22px; /* 调整大小 */
  margin-bottom: 8px;
}
.login-header p {
  color: #909399;
  font-size: 14px;
}
.login-form {
  width: 100%;
}
.login-btn {
  width: 100%;
  /* Element Plus Button 默认有高度，size="large" 控制大小 */
}

/* 响应式调整，小屏幕隐藏 Banner */
@media (max-width: 992px) {
  .login-banner {
    display: none;
  }
  .login-form-container {
    width: 100%;
    max-width: 400px; /* 限制小屏幕下的最大宽度 */
    margin: auto; /* 居中 */
  }
}
</style> 