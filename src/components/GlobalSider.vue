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
import { h, ref } from 'vue'

import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController'
import { PictureOutlined,UserOutlined  } from '@ant-design/icons-vue'
// 菜单列表
const menuItems = [
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
]

const router = useRouter()

// 当前选中菜单
const current = ref<string[]>([])
// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, failure) => {
  current.value = [to.path]
})

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 用户登录状态
const loginUserStore = useLoginUserStore()

// 其中高亮的实现 是通过current的值来设置的 afterEach函数可以获得将要跳转的页面 将他的路径赋值给他即可
router.afterEach((to, from, next) => {
  current.value = [to.path]
})
</script>


<style scoped>

.globalSider {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.brand-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-author {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.github-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #24292e;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(36, 41, 46, 0.2);
}

.github-link:hover {
  background: #1a1e22;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(36, 41, 46, 0.3);
  color: white;
}

.github-icon {
  transition: transform 0.3s ease;
}

.github-link:hover .github-icon {
  transform: rotate(360deg);
}

.footer-right {
  display: flex;
  align-items: center;
}

.visitor-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(241, 245, 249, 0.8);
  border-radius: 20px;
  border: 1px solid rgba(203, 213, 225, 0.5);
  font-size: 14px;
  color: #475569;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.visitor-icon {
  color: #3b82f6;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0.5;
  }
}

.visitor-text {
  font-weight: 500;
}

.visitor-count {
  font-weight: 700;
  color: #3b82f6;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  min-width: 40px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .footer-left {
    flex-direction: column;
    gap: 12px;
  }

  .brand-info {
    flex-direction: column;
    gap: 4px;
  }

  .github-link {
    padding: 6px 12px;
    font-size: 13px;
  }

  .visitor-counter {
    padding: 6px 12px;
    font-size: 13px;
  }

  /* 移动端调整内容区域的底部间距 */
  #basicLayout .content {
    padding-bottom: 60px;
  }
}

@media (max-width: 480px) {
  #basicLayout .footer {
    padding: 16px;
  }

  .brand-name {
    font-size: 16px;
  }

  .brand-author {
    font-size: 12px;
  }

  /* 小屏幕调整内容区域的底部间距 */
  #basicLayout .content {
    padding-bottom: 80px;
  }
}
</style>
