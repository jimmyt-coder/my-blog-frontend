
// 1. 核心库导入
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

// 2. 插件与组件库导入
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 必须引入组件样式

// 3. 根组件导入
import App from './App.vue'

// 4. Axios 全局配置
// 优先使用环境变量里的地址，如果没有定义（比如本地运行），则默认使用 127.0.0.1
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

// 5. 创建并配置应用实例
const app = createApp(App)

app.use(createPinia())    // 状态管理
app.use(router)           // 路由
app.use(ElementPlus)      // UI组件库

// 6. 挂载应用 (必须在所有 use 之后)
app.mount('#app')