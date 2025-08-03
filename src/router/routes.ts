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
    component: () => import('@/pages/HomePage.vue'),

    meta: {
      icon: () => h(HomeOutlined),
    },
  },
  {
    path: '/user/login',
    name: '用户登录',
    component: () => import('@/pages/user/UserLoginPage.vue'),
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/user/register',
    name: '用户注册',
    component: () => import('@/pages/user/UserRegisterPage.vue'),
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/admin/userManage',
    name: '用户管理',
    component: () => import('@/pages/admin/UserManagePagev1.vue'),
    meta: {
      access: ACCESS_CONSTANTS.ADMIN,
    },
  },

  {
    path: '/add_picture',
    name: '创建图片',
    component: () => import('@/pages/AddPicturePage.vue'),
    meta: {
      access: ACCESS_CONSTANTS.USER,
      // access: ACCESS_CONSTANTS.ADMIN,
    },
  },

  {
    path: '/add_picture/batch',
    name: '批量创建图片',
    component: () => import('@/pages/AddPictureBatchPage.vue'),

    meta: {
      hideInMenu: true,
      access: ACCESS_CONSTANTS.ADMIN,
    },
  },

  {
    path: '/admin/pictureManage',
    name: '图片管理',
    component: () => import('@/pages/admin/PictureManagePage.vue'),
    meta: {
      access: ACCESS_CONSTANTS.ADMIN,
    },
  },

  {
    path: '/user/:id',
    name: '用户个人主页',
    props: true,
    component: () => import('@/pages/user/UserPersonalPage.vue'),
    meta: {
      hideInMenu: true,
    },

  },

  {
    path: '/picture/:id',
    name: '图片详情',
    props: true,
    component: () => import('@/pages/PictureDetailPage.vue'),
    meta: {
      hideInMenu: true,
    },
  },

  {
    path: '/admin/spaceManage',
    name: '空间管理',
    component: () => import('@/pages/admin/SpaceManagePage.vue'),
    meta: {
      access: ACCESS_CONSTANTS.ADMIN,
    },
  },

  {
    path: '/add_space',
    name: '创建空间',
    component: () => import('@/pages/AddSpacePage.vue'),

    meta: {
      access: ACCESS_CONSTANTS.USER,
    },
  },
  {
    path: '/my_space',
    name: '我的空间',
    component: () => import('@/pages/MySpacePage.vue'),

    meta: {
      access: ACCESS_CONSTANTS.USER,
      // access: ACCESS_CONSTANTS.ADMIN,
    },
  },

  {
    path: '/space/:id',
    name: '空间详情',
    props: true,
    component: () => import('@/pages/SpaceDetailPage.vue'),
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
