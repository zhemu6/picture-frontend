<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <!--头部-->
      <a-layout-header class ="header">
        <GlobalHeader />
      </a-layout-header>
      <!-- 中间部分（内容） -->
      <a-layout-content  class = "content" >
        <router-view />
      </a-layout-content>
      <!-- 底部 -->
      <a-layout-footer class = "footer">
        <a href="https://github.com/zhemu6" target="_blank">
           云摄 by 折木
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">

import GlobalHeader from "@/components/GlobalHeader.vue";

</script>

<style scoped>
#basicLayout {
}

#basicLayout .header {
  background:white;
  color: unset;
  padding-inline: 20px;
  margin-bottom: 16px;
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 28px;
  padding: 20px;
}
#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}



</style>
