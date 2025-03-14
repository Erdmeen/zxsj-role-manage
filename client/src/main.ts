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
    e.preventDefault();
});

// 禁止键盘快捷键
document.addEventListener('keydown', function (e) {
    // 禁止 Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "x")) {
        e.preventDefault();
    }
});
