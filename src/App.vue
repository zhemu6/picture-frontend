<template>
  <div id="app">
    <a-config-provider :locale="zhCN">
      <BasicLayout />
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN' // 引入 ant-design-vue 的中文语言包
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 引入 dayjs 的中文语言包
dayjs.locale('zh-cn') // 设置 dayjs 的默认语言为中文
import BasicLayout from '@/layouts/BasicLayout.vue'
</script>

<style scoped></style>
