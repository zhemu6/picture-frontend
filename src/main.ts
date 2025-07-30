import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import App from './App.vue'
import router from './router'

import '@/access' // 直接导入，设置路由守卫

const app = createApp(App)
app.use(createPinia())
app.use(router)

app.use(Antd)

app.mount('#app')
