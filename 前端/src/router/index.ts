import Login from '@/components/Login.vue';
import AuthView from '@/views/AuthView.vue';
import CostEstimation from '@/views/CostEstimation.vue'; // 造价综合评估管理
import FunctionPointAnalysis from '@/views/FunctionPointAnalysis.vue'; // 功能点分析管理
import Profile from '@/views/Profile.vue';
import ProfileManager from '@/views/ProfileManager.vue';
import ProjectManagement from '@/views/ProjectManagement.vue'; // 项目管理
import ReportGeneration from '@/views/ReportGeneration.vue'; // 报告生成管理
import ReportReview from '@/views/ReportReview.vue'; // 报告审核管理
import Settings from '@/views/Settings.vue';
import TenantManagement from '@/views/TenantManagement.vue'; // 租户管理
import UserManagement from '@/views/UserManagement.vue';
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/auth',
    component: AuthView,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
        meta: { breadcrumb: '登录' }
      },
    ]
  },
  { path: '/用户管理', component: UserManagement, meta: { breadcrumb: '用户管理' } },
  { path: '/个人信息管理', name: 'Profile', component: Profile, meta: { breadcrumb: '个人中心' } },
  { path: '/settings', name: 'Settings', component: Settings, meta: { breadcrumb: '设置' } },
  { path: '/admin/profile', name: 'ProfileManager', component: ProfileManager, meta: { breadcrumb: '管理员个人中心' } },
  { path: '/租户管理', name: 'TenantManagement', component: TenantManagement, meta: { breadcrumb: '租户管理' } },
  { path: '/项目管理', name: 'ProjectManagement', component: ProjectManagement, meta: { breadcrumb: '项目管理' } },
  { path: '/功能点分析管理', name: 'FunctionPointAnalysis', component: FunctionPointAnalysis, meta: { breadcrumb: '功能点分析' } },
  { path: '/造价综合评估管理', name: 'CostEstimation', component: CostEstimation, meta: { breadcrumb: '造价综合评估' } },
  { path: '/报告生成管理', name: 'ReportGeneration', component: ReportGeneration, meta: { breadcrumb: '报告生成' } },
  { path: '/报告审核管理', name: 'ReportReview', component: ReportReview, meta: { breadcrumb: '报告审核' } },
  { path: '/', redirect: '/auth/login' }  // 默认跳转到登录页面
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
