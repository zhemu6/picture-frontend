<template>
  <div id="globalSider">
    <a-layout-sider v-if="loginUserStore.loginUser.id" breakpoint="lg" class="sider" width="200">
      <a-menu
        mode="inline"
        v-model:selectedKeys="current"
        :items="menuItems"
        @click="doMenuClick"
      />
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref, watchEffect } from 'vue'

import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController'
import { PictureOutlined, UserOutlined } from '@ant-design/icons-vue'
import { SPACE_TYPE_ENUM } from '@/constants/space'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController'
// 菜单列表
const fixedMenuItems = [
  {
    key: '/',
    label: '公共图库',
    icon: () => h(PictureOutlined),
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
    label: '创建团队',
    icon: () => h(UserOutlined),
  },
]

const router = useRouter()
// 团队空间列表
const teamSpaceList = ref<API.SpaceUserVO[]>([])

const menuItems = computed(() => {
  // 如果没有空间 直接显示固定空间
  if (teamSpaceList.value.length < 0) {
    return fixedMenuItems
  }
  // 有团队空间 展示固定菜单和团队空间菜单
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
    const space = spaceUser.space
    return {
      key: '/space/' + spaceUser.spaceId,
      label: space?.spaceName,
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '团队空间',
    key: 'teamSpace',
    children: teamSpaceSubMenus,
  }
  return [...fixedMenuItems, teamSpaceMenuGroup]
})

// 加载团队空间列表
const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}
const loginUserStore = useLoginUserStore()

/**
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  // 登录才加载
  if (loginUserStore.loginUser.id) {
    fetchTeamSpaceList()
  }
})

// 当前选中菜单
const current = ref<string[]>([])
// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, failure) => {
  current.value = [to.path]
})

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

// 其中高亮的实现 是通过current的值来设置的 afterEach函数可以获得将要跳转的页面 将他的路径赋值给他即可
router.afterEach((to, from, next) => {
  current.value = [to.path]
})
</script>

<style scoped>
#globalSider {
  height: 100%;
}

/* 侧边栏容器美化 */
:deep(.ant-layout-sider) {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-right: 1px solid #e2e8f0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

:deep(.ant-layout-sider-collapsed) {
  box-shadow: 1px 0 4px rgba(0, 0, 0, 0.04);
}

/* 菜单整体样式 */
:deep(.ant-menu) {
  background: transparent;
  border-right: none;
  padding: 16px 8px;
  font-size: 14px;
}

/* 菜单项样式 */
:deep(.ant-menu-item) {
  margin: 4px 0;
  border-radius: 12px;
  height: 44px;
  line-height: 44px;
  padding: 0 16px;
  color: #64748b;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

:deep(.ant-menu-item::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.5s ease;
}

:deep(.ant-menu-item:hover::before) {
  left: 100%;
}

:deep(.ant-menu-item:hover) {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
  transform: translateX(4px);
  border-color: rgba(102, 126, 234, 0.2);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

/* 选中状态 */
:deep(.ant-menu-item-selected) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white !important;
  font-weight: 600;
  transform: translateX(6px);
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

:deep(.ant-menu-item-selected::after) {
  display: none;
}

/* 菜单图标美化 */
:deep(.ant-menu-item .anticon) {
  font-size: 16px;
  margin-right: 12px;
  transition: all 0.3s ease;
}

:deep(.ant-menu-item:hover .anticon) {
  transform: scale(1.1);
  color: #667eea;
}

:deep(.ant-menu-item-selected .anticon) {
  color: white;
  transform: scale(1.15);
}

/* 菜单组标题样式 */
:deep(.ant-menu-item-group-title) {
  padding: 12px 16px 8px;
  color: #667eea;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
}

:deep(.ant-menu-item-group-title::after) {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: linear-gradient(90deg, #667eea, transparent);
  border-radius: 1px;
}

/* 菜单组列表样式 */
:deep(.ant-menu-item-group-list) {
  margin-bottom: 16px;
}

:deep(.ant-menu-item-group .ant-menu-item) {
  padding-left: 24px;
  margin: 2px 0;
  height: 40px;
  line-height: 40px;
  font-size: 13px;
  position: relative;
}

:deep(.ant-menu-item-group .ant-menu-item::before) {
  content: '';
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: #cbd5e1;
  border-radius: 50%;
  transition: all 0.3s ease;
}

:deep(.ant-menu-item-group .ant-menu-item:hover::before) {
  background: #667eea;
  transform: translateY(-50%) scale(1.5);
}

:deep(.ant-menu-item-group .ant-menu-item-selected::before) {
  background: white;
  transform: translateY(-50%) scale(1.8);
}

/* 折叠状态优化 */
:deep(.ant-layout-sider-collapsed .ant-menu-item) {
  padding: 0;
  text-align: center;
  height: 48px;
  line-height: 48px;
}

:deep(.ant-layout-sider-collapsed .ant-menu-item .anticon) {
  margin-right: 0;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  :deep(.ant-layout-sider) {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    z-index: 99;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 768px) {
  :deep(.ant-menu) {
    padding: 12px 4px;
  }

  :deep(.ant-menu-item) {
    height: 40px;
    line-height: 40px;
    padding: 0 12px;
    font-size: 13px;
  }

  :deep(.ant-menu-item .anticon) {
    font-size: 14px;
    margin-right: 8px;
  }
}

/* 滚动条美化 */
:deep(.ant-layout-sider) {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

:deep(.ant-layout-sider::-webkit-scrollbar) {
  width: 6px;
}

:deep(.ant-layout-sider::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.ant-layout-sider::-webkit-scrollbar-thumb) {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
  transition: background 0.3s ease;
}

:deep(.ant-layout-sider::-webkit-scrollbar-thumb:hover) {
  background: rgba(102, 126, 234, 0.5);
}
</style>
