import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import DepartmentManagement from '../views/DepartmentManagement.vue'; // 引入部门管理视图
import { ElMessage } from 'element-plus'; // 引入提示

// --- 获取存储的用户信息 (假设登录成功后存储了 user 对象) ---
const getUserInfo = () => {
  const userJson = localStorage.getItem('userInfo');
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    console.error("无法解析存储的用户信息:", e);
    localStorage.removeItem('userInfo'); // 清除无效信息
    localStorage.removeItem('authToken');
    return null;
  }
};

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
        meta: { title: '操作日志', requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'export-tasks',
        name: 'ExportTaskList',
        component: () => import('../views/ExportTaskList.vue'),
        meta: { title: '导出任务', requiresAuth: true }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('../views/StatisticsView.vue'),
        meta: { title: '统计报表', requiresAuth: true }
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
  const isAuthenticated = !!localStorage.getItem('authToken');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRoles = to.meta.roles as string[] | undefined; // 获取路由所需的角色

  console.log(`路由守卫: 前往 ${to.path}, 需要认证: ${requiresAuth}, 需要角色: ${requiredRoles}, 已认证: ${isAuthenticated}`);

  if (requiresAuth && !isAuthenticated) {
    console.log('未认证，重定向到登录页');
    next({ name: 'Login', query: { redirect: to.fullPath } }); // 添加 redirect 参数
  } else if (to.name === 'Login' && isAuthenticated) {
    console.log('已认证，访问登录页，重定向到仪表盘');
    next({ name: 'Dashboard' });
  } else if (requiresAuth && isAuthenticated && requiredRoles) {
    // 需要认证、已认证，且需要特定角色
    const userInfo = getUserInfo();
    const userRole = userInfo?.role;

    if (!userRole) {
      console.error('已认证但无法获取用户角色信息，可能需要重新登录');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('authToken');
      ElMessage.error('用户角色信息丢失，请重新登录');
      next({ name: 'Login' });
    } else if (requiredRoles.includes(userRole)) {
      // 用户角色满足要求，放行
       console.log(`角色 '${userRole}' 满足要求 [${requiredRoles.join(', ')}]，放行`);
      next();
    } else {
      // 用户角色不满足要求，显示提示并阻止导航
      console.warn(`角色 '${userRole}' 不满足要求 [${requiredRoles.join(', ')}]，阻止导航`);
      ElMessage.warning('抱歉，您没有权限访问该页面');
      next(false); // <--- 阻止导航
    }
  }
   else {
    // 其他情况正常放行
    console.log('不需要特定角色或无需认证，放行');
    next();
  }
});

export default router; 