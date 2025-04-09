<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <!-- Sidebar -->
      <el-aside width="200px" class="sidebar">
        <div class="logo">LDIMS</div>
        <el-menu
          default-active="/dashboard" 
          class="el-menu-vertical-demo"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
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
          <!-- 更多菜单项 -->
        </el-menu>
      </el-aside>

      <el-container>
        <!-- Header -->
        <el-header class="header">
          <div class="breadcrumb">
            <!-- 面包屑导航 -->
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ $route.meta.title || '页面' }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="user-info">
            <el-dropdown>
              <span class="el-dropdown-link">
                Admin <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item>修改密码</el-dropdown-item>
                  <el-dropdown-item divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- Main Content -->
        <el-main class="main-content">
          <router-view></router-view> <!-- 路由视图，用于显示子页面 -->
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { 
  House, 
  Files, 
  Collection, 
  User, 
  OfficeBuilding, 
  Setting, 
  ArrowDown 
} from '@element-plus/icons-vue';

// 这里可以添加布局相关的逻辑，例如获取用户信息等

</script>

<style scoped>
.common-layout, .layout-container {
  height: 100vh;
  display: flex;
}

.sidebar {
  background-color: #304156;
  color: #fff;
  overflow-y: auto; /* 如果菜单过长，允许滚动 */
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  background-color: #263445; /* Logo 背景色稍深 */
}

.el-menu {
  border-right: none; /* 移除菜单右边框 */
}

.el-menu-item.is-active {
  /* 可以添加选中项的特殊样式 */
}

.header {
  background-color: #fff;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
}

.breadcrumb {
  /* 面包屑样式 */
}

.user-info {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
  display: flex;
  align-items: center;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  height: calc(100vh - 60px); /* 计算主内容区域高度，减去Header高度 */
  overflow-y: auto; /* 如果内容过长，允许滚动 */
}

/* 隐藏滚动条但保留滚动功能 (适用于 Webkit 内核浏览器) */
.sidebar::-webkit-scrollbar, .main-content::-webkit-scrollbar {
  display: none; 
}
.sidebar, .main-content {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style> 