<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <!-- 左侧的logo -->
      <a-col flex="200px">
        <RouterLink to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.png" alt="logo" />
            <div class="title">云摄</div>
          </div>
        </RouterLink>
      </a-col>
      <!-- 中间的菜单选项 -->
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="menus"
          @click="doMenuClick"
        />
      </a-col>
      <!-- 右侧登录按钮 -->
      <a-col flex="120px">
        <div class="user-login-status">
          <!-- 如果id存在 就认为登录了 -->
          <div v-if="loginUserStore.loginUser.id" class="user-info">
            <!-- 用户头像、昵称和下拉菜单整合在一起 -->
            <a-dropdown>
              <a class="user-dropdown" @click.prevent>
                <a-space>
                  <a-avatar :src="loginUserStore.loginUser.userAvatar" size="small" />
                  <span class="username">{{ loginUserStore.loginUser.userName ?? '无名' }}</span>
                  <DownOutlined />
                </a-space>
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <a @click="doClickUser(loginUserStore.loginUser)">个人主页</a>
                  </a-menu-item>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <!-- 否则没登陆展示登录按钮 -->
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import {
  MailOutlined,
  HomeOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { DownOutlined } from '@ant-design/icons-vue'
import { userLogoutUsingPost } from '@/api/userController'
import { routes } from '@/router/routes'
import checkAccess from '@/access/checkAccess'

// 把路由项转换为菜单项
const menuToRouteItem = (item: any) => {
  const isHome = item.path === '/'
  return {
    key: item.path,
    label: item.name,
    title: item.name,
    icon: isHome ? h(item.meta?.icon ?? HomeOutlined) : undefined, // 仅在主页路径时显示 icon
  }
}

// 过滤菜单项
const items = computed(() => {
  return routes
    .filter((item) => {
      if (item.meta?.hideInMenu) {
        return false
      }
      // 根据权限过滤菜单，有权限则返回 true，则保留该菜单
      return checkAccess(loginUserStore.loginUser, item.meta?.access as string)
    })
    .map(menuToRouteItem) // 转换为菜单项格式
})

// 获取菜单项
const menus = ref<MenuProps['items']>(items)

// 用户登录状态
const loginUserStore = useLoginUserStore()

const current = ref<string[]>(['home'])

const router = useRouter()

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 其中高亮的实现 是通过current的值来设置的 afterEach函数可以获得将要跳转的页面 将他的路径赋值给他即可
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

// 退出登录事件用户注销
const doLogout = async () => {
  const res = await userLogoutUsingPost()
  // 注销成功
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({ userName: '未登录' })
    message.success('退出登录成功')
    await router.push({ path: '/user/login' })
  } else {
    message.error('退出登录失败,' + res.data.message)
  }
}

// 点击个人主页跳转到用户详情页面
// 点击图片跳转到图片详情页面
const doClickUser = (user: API.UserVO) => {
  router.push({
    path: `/user/${user.id}`,
  })
}
</script>

<style scoped>
#globalHeader {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

#globalHeader :deep(.ant-row) {
  height: 64px;
  align-items: center;
}

.title-bar {
  display: flex;
  align-items: center;
  padding: 8px 0;
  transition: all 0.3s ease;
}

.title-bar:hover {
  transform: translateY(-1px);
}

.title {
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
  margin-left: 16px;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo {
  height: 40px;
  width: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 菜单样式美化 */
#globalHeader :deep(.ant-menu) {
  background: transparent;
  border-bottom: none;
  font-weight: 500;
  font-size: 15px;
}

#globalHeader :deep(.ant-menu-item) {
  border-radius: 8px;
  margin: 0 4px;
  transition: all 0.3s ease;
  color: #64748b;
}

#globalHeader :deep(.ant-menu-item:hover) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transform: translateY(-1px);
}

#globalHeader :deep(.ant-menu-item-selected) {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

#globalHeader :deep(.ant-menu-item-selected::after) {
  display: none;
}

.user-login-status {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #e2e8f0;
  backdrop-filter: blur(10px);
  height: 32px;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.user-dropdown {
  display: flex;
  align-items: center;
  color: #1e293b;
  text-decoration: none;
  font-weight: 500;
}

.username {
  margin: 0 8px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #374151;
  font-weight: 500;
}

/* 登录按钮美化 */
#globalHeader :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 20px;
  padding: 0 24px;
  height: 36px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

#globalHeader :deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* 用户头像美化 */
#globalHeader :deep(.ant-avatar) {
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.user-info:hover :deep(.ant-avatar) {
  border-color: #3b82f6;
  transform: scale(1.05);
}

/* 下拉箭头美化 */
#globalHeader :deep(.anticon-down) {
  color: #64748b;
  transition: all 0.3s ease;
}

.user-info:hover :deep(.anticon-down) {
  color: #3b82f6;
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  #globalHeader {
    padding: 0 16px;
  }

  .title {
    font-size: 18px;
    margin-left: 12px;
  }

  .logo {
    height: 36px;
    width: 36px;
  }

  .username {
    max-width: 60px;
  }
}

@media (max-width: 576px) {
  #globalHeader {
    padding: 0 12px;
  }

  .title {
    font-size: 16px;
    margin-left: 8px;
  }

  .username {
    display: none;
  }
}
</style>
