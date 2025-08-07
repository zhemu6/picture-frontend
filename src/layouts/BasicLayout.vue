<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <!--头部-->
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <!-- 中间部分（内容） -->
      <a-layout>
        <GlobalSider class="sider" />
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>
      <!-- 底部 -->
      <a-layout-footer ref="footerRef" class="footer">
        <GlobalFooter />
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
import GlobalSider from '@/components/GlobalSider.vue'

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
  margin-bottom: 1px;
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 28px;
  padding: 28px;
  /* 简化底部间距，因为现在是透明的 */
  padding-bottom: 40px;
  min-height: calc(100vh - 200px); /* 确保内容区域有最小高度 */
}

#basicLayout .sider {
  background: linear-gradient(to right, #fefefe, #fff);
  border-right: 0.5px solid #eee;

}
#basicLayout :deep(.ant-menu-root){
  border-bottom: none !important;
  border-inline-end: none !important;
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

</style>
