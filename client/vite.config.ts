import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Inspector from 'vite-plugin-vue-inspector'

// https://vite.dev/config/
export default defineConfig({
  base: '/zxsj-role-manage/',
  plugins: [vue()],
})
