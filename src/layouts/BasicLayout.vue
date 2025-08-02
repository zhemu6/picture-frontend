<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <!--头部-->
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <!-- 中间部分（内容） -->
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <!-- 底部 -->
      <a-layout-footer ref="footerRef" class="footer">
        <div class="footer-content">
          <div class="footer-left">
            <div class="brand-info">
              <span class="brand-name">云摄</span>
              <span class="brand-author">by 折木</span>
            </div>
            <div class="footer-links">
              <a href="https://github.com/zhemu6" target="_blank" class="github-link">
                <svg class="github-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path
                    fill="currentColor"
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>
          <div class="footer-right">
            <div class="visitor-counter">
              <svg class="visitor-icon" viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                />
              </svg>
              <!-- todo 实现底下访问量的统计实现  -->
              <span class="visitor-text">访问量</span>
              <span class="visitor-count">{{ visitorCount }}</span>
            </div>
          </div>
        </div>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import GlobalHeader from '@/components/GlobalHeader.vue'

// 访问人数
const visitorCount = ref(0)
const footerRef = ref()

// 模拟访问人数统计
const updateVisitorCount = () => {
  // 从localStorage获取访问次数
  const stored = localStorage.getItem('visitor-count')
  let count = stored ? parseInt(stored) : 1000 // 初始值设为1000

  // 检查今天是否已经访问过
  const today = new Date().toDateString()
  const lastVisit = localStorage.getItem('last-visit')

  if (lastVisit !== today) {
    count += Math.floor(Math.random() * 10) + 1 // 每天随机增加1-10次访问
    localStorage.setItem('visitor-count', count.toString())
    localStorage.setItem('last-visit', today)
  }

  visitorCount.value = count
}

// 动态设置底部间距
const setFooterPadding = () => {
  nextTick(() => {
    if (footerRef.value) {
      const footerHeight = footerRef.value.offsetHeight
      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`)
    }
  })
}

onMounted(() => {
  updateVisitorCount()
  setFooterPadding()

  // 监听窗口大小变化
  window.addEventListener('resize', setFooterPadding)
})
</script>

<style scoped>
:root {
  --footer-height: 80px; /* 默认底部高度 */
}

#basicLayout {
}

#basicLayout .header {
  background: white;
  color: unset;
  padding-inline: 20px;
  margin-bottom: 16px;
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 28px;
  padding: 20px;
  /* 简化底部间距，因为现在是透明的 */
  padding-bottom: 40px;
  min-height: calc(100vh - 200px); /* 确保内容区域有最小高度 */
}

#basicLayout .footer {
  background: rgba(255, 255, 255, 0.4);
  border-top: 1px solid rgba(226, 232, 240, 0.3);
  padding: 12px 20px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  backdrop-filter: blur(20px);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.footer-content {
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
