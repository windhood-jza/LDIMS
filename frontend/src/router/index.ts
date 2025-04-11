import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import DepartmentManagement from '../views/DepartmentManagement.vue'; // 引入部门管理视图

// 定义路由规则
const routes: Array<RouteRecordRaw> = [
  {
    path: '/', // 根路径，通常重定向到仪表盘或登录页
    redirect: '/dashboard',
    component: DefaultLayout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'), // 懒加载
        meta: { title: '仪表盘', requiresAuth: true } // 页面标题，用于面包屑
      },
      {
        path: 'documents',
        name: 'DocumentList',
        component: () => import('../views/DocumentListView.vue'),
        meta: { title: '文档管理', requiresAuth: true }
      },
      {
        path: 'doc-types',
        name: 'DocTypeList',
        component: () => import('../views/DocTypeListView.vue'),
        meta: { title: '文档类型管理', requiresAuth: true }
      },
       {
        path: 'users',
        name: 'UserList',
        component: () => import('../views/UserListView.vue'),
        meta: { title: '用户管理', requiresAuth: true }
      },
       {
        path: 'departments',
        name: 'DepartmentManagement',
        component: DepartmentManagement,
        meta: { title: '部门管理', requiresAuth: true }
      },
       {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/SettingsView.vue'),
        meta: { title: '系统设置', requiresAuth: true }
      },
      {
        path: 'export-tasks',
        name: 'ExportTaskList',
        component: () => import('../views/ExportTaskList.vue'),
        meta: { title: '导出任务', requiresAuth: true }
      }
      // ... 其他使用 DefaultLayout 的页面路由
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录' }
  },
  // 可以添加 404 页面等
  // {
  //   path: '/:pathMatch(.*)*', 
  //   name: 'NotFound', 
  //   component: () => import('../views/NotFoundView.vue') 
  // }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// --- 路由守卫 ---
router.beforeEach((to, from, next) => {
  // 简单检查 localStorage 中是否有 token
  const isAuthenticated = !!localStorage.getItem('authToken'); 
  // 检查目标路由或其任何匹配的父路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  console.log(`路由守卫: 前往 ${to.path}, 需要认证: ${requiresAuth}, 已认证: ${isAuthenticated}`);

  if (requiresAuth && !isAuthenticated) {
    // 如果目标路由需要认证且用户未认证，重定向到登录页
    console.log('未认证，重定向到登录页');
    next({ name: 'Login' });
  } else if (to.name === 'Login' && isAuthenticated) {
    // 如果用户已认证，但试图访问登录页，可以重定向到仪表盘
    console.log('已认证，访问登录页，重定向到仪表盘');
    next({ name: 'Dashboard' }); 
  } else {
    // 其他情况（需要认证且已认证，或不需要认证）正常放行
    next();
  }
});

export default router; 