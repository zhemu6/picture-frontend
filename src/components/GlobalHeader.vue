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
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <!-- 右侧登录按钮 -->
      <a-col flex="120px">
        <div class="user-login-status">
          <!-- 如果id存在 就认为登录了 -->
          <div v-if="loginUserStore.loginUser.id">
            {{loginUserStore.loginUser.userName ?? '无名'}}
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
import { h, ref } from 'vue'
import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/userLoginUserStore'

// 用户登录状态
const loginUserStore = useLoginUserStore()

const current = ref<string[]>(['home'])
const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(MailOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/about',
    icon: () => h(AppstoreOutlined),
    label: '关于',
    title: '关于',
  },
  {
    key: 'others',
    label: h('a', { href: 'https://github.com/zhemu6', target: '_blank' }, '折木'),
    title: '折木',
  },
])

const router = useRouter()

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  });
};
// 其中高亮的实现 是通过current的值来设置的 afterEach函数可以获得将要跳转的页面 将他的路径赋值给他即可
router.afterEach((to,from,next) => {
  current.value = [to.path]
})

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
</style>
