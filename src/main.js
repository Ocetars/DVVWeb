import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { clerkPlugin } from '@clerk/vue'
import { inject } from '@vercel/analytics'
import { SpeedInsights } from "@vercel/speed-insights/vue"

import App from './App.vue'
import router from './router'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('请在 .env.local 文件中添加 Clerk Publishable Key')
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(clerkPlugin, {
  publishableKey: PUBLISHABLE_KEY
})

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册 Speed Insights 组件
app.component('SpeedInsights', SpeedInsights)

// 注入 Vercel Analytics，使用 auto 模式
inject({
  mode: 'auto',
  debug: true
})

app.mount('#app')
