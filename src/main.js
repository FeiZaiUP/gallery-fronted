import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

// 配置全局变量，用于存储 API 基础 URL
app.config.globalProperties.$apiBaseUrl = 'http://192.168.1.175:8000';

app.use(router); // 挂载 Vue Router
app.mount('#app');
// 在 main.js 中设置

