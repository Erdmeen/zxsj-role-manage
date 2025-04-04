import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);
app.use(Antd);
app.mount('#app')

// 禁止右键菜单
document.addEventListener('contextmenu', function (e) {
    const isDev = import.meta.env.DEV;
    if (!isDev) {
        e.preventDefault();
    }
});
