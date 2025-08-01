import {
  MailOutlined,
  HomeOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'

import { ACCESS_CONSTANTS } from '@/constants/access'

import { h } from 'vue'

const routes = [
  {
    path: '/',
    name: '主页',
    // component: HomeView,
    component: () => import('@/pages/HomePage.vue'),

    meta: {
      icon: () => h(HomeOutlined),
    },
  },
  {
    path: '/user/login',
    name: '用户登录',
    // component: UserLoginPage,
    component: () => import('@/pages/user/UserLoginPage.vue'),
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/user/register',
    name: '用户注册',
    component: () => import('@/pages/user/UserRegisterPage.vue'),

    // component: UserRegisterPage,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/admin/userManage',
    name: '用户管理',
    component: () => import('@/pages/admin/UserManagePagev1.vue'),
    // component: UserManagePage,
    meta: {
      access: ACCESS_CONSTANTS.ADMIN,
    },
  },

  {
    path: '/add_picture',
    name: '创建图片',
    component: () => import('@/pages/AddPicturePage.vue'),
    // component: UserManagePage,
    meta: {
      // access: ACCESS_CONSTANTS.ADMIN,
    },
  },

  {
    path: '/add_picture/batch',
    name: '批量创建图片',
    component: () => import('@/pages/AddPictureBatchPage.vue'),
    // component: UserManagePage,
    meta: {
      hideInMenu: true,
      access: ACCESS_CONSTANTS.ADMIN,
    },
  },

  {
    path: '/admin/pictureManage',
    name: '图片管理',
    component: () => import('@/pages/admin/PictureManagePage.vue'),
    // component: UserManagePage,
    meta: {
      access: ACCESS_CONSTANTS.ADMIN,
    },
  },

  {
    path: '/picture/:id',
    name: '图片详情',
    props: true,
    component: () => import('@/pages/PictureDetailPage.vue'),
    // component: UserManagePage,
    meta: {
      hideInMenu: true,
    },
  },

  {
    path: '/noAuth',
    name: '无权限页面',
    // 懒加载
    component: () => import('@/pages/NoAuthPage.vue'),
    // component: NoAuthPage,
    meta: {
      hideInMenu: true,
    },
  },
]

export { routes }
