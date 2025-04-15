<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <!-- Sidebar -->
      <el-aside width="200px" class="sidebar">
        <div class="logo">LDIMS</div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
          :collapse-transition="false"
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/documents">
            <el-icon><Files /></el-icon>
            <span>文档管理</span>
          </el-menu-item>
          <el-menu-item index="/doc-types">
             <el-icon><Collection /></el-icon>
            <span>文档类型</span>
          </el-menu-item>
          <el-menu-item index="/users">
             <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/departments">
            <el-icon><OfficeBuilding /></el-icon>
            <span>部门管理</span>
          </el-menu-item>
           <el-menu-item index="/settings">
             <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
          <el-menu-item index="/export-tasks">
            <el-icon><Download /></el-icon>
            <span>导入导出</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <span>统计报表</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container class="main-container">
        <!-- Header -->
        <el-header class="header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link user-info">
                <el-avatar :size="30" :src="avatarUrl"/>
                <span class="username">{{ username }}</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- Main Content -->
        <el-main class="main-content">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  ElContainer, ElAside, ElHeader, ElMain, ElMenu, ElMenuItem, ElIcon,
  ElDropdown, ElDropdownMenu, ElDropdownItem, ElAvatar,
  ElBreadcrumb, ElBreadcrumbItem
} from 'element-plus';
import {
  House,
  Files,
  Collection,
  User,
  OfficeBuilding, // 确保已引入
  Setting,
  ArrowDown,
  Download,
  DataAnalysis // <<< Import the new icon
} from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// 根据当前路由计算激活的菜单项
const activeMenu = computed(() => route.path);

// 模拟用户信息和头像
const username = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!).username : '未登录';
const avatarUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23409eff'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`;

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    router.push('/login');
  }
};

</script>

<style scoped>
/* 基本布局和容器 */
.common-layout, .layout-container {
  height: 100vh;
  display: flex;
}

/* 侧边栏 */
.sidebar {
  background-color: #304156;
  color: #fff;
  overflow-y: auto;
  height: 100%;
}

/* Logo */
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  background-color: #263445;
  color: white;
}
.logo img {
  width: 28px;
  height: 28px;
  margin-right: 10px;
  vertical-align: middle;
}

/* 菜单 */
.el-menu {
  border-right: none;
}

/* 修复菜单项激活时的边框和样式 */
.el-menu-item.is-active {
    border-left: 3px solid #409eff;
}
/* 统一菜单项 padding */
.el-menu-item {
    padding-left: 20px !important;
}
.el-menu-item.is-active {
    padding-left: 17px !important;
}
/* 鼠标悬停时效果 */
.el-menu-item:hover {
    background-color: #263445 !important;
}
/* 图标和文字间距 */
.el-menu-item .el-icon {
    margin-right: 5px;
}

/* 主容器 */
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  flex: 1;
}

/* 顶部 Header */
.header {
  background-color: #fff;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
  height: 60px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 面包屑 */
.breadcrumb {
  /* 样式 */
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  margin-right: 4px;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
}

/* 主内容区域 */
.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

/* 隐藏滚动条但保留滚动功能 (适用于 Webkit 内核浏览器) */
.sidebar::-webkit-scrollbar, .main-content::-webkit-scrollbar {
  display: none;
}
.sidebar, .main-content {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>