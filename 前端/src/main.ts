import axios from 'axios';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
axios.defaults.withCredentials = true; // 使得 axios 请求自动携带 Cookie
const app = createApp(App);


app.use(router);
app.use(ElementPlus);
app.mount('#app');