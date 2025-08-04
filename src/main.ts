import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import { VueMasonryPlugin } from 'vue-masonry';

import App from './App.vue'
import router from './router'
import VueCropper from 'vue-cropper';
import 'vue-cropper/dist/index.css'
import '@/access' // 直接导入，设置路由守卫

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(VueMasonryPlugin);
app.use(VueCropper)
app.use(Antd)

app.mount('#app')
