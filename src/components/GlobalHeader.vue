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
                    <a href="javascript:;">个人主页</a>
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
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 16px;
  margin-left: 16px;
}

.logo {
  height: 48px;
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
  padding: 0 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.025);
}

.user-dropdown {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.85);
  text-decoration: none;
}

.username {
  margin: 0 4px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
