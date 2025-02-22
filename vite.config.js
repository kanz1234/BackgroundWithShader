import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { templateCompilerOptions } from '@tresjs/core'
import glsl from 'vite-plugin-glsl';
// https://vite.dev/config/
import path from 'path';
// 添加全局 SCSS 文件

export default defineConfig({
  plugins: [
    vue({
      // Other config
      // script:{
      //   propsDestructure:false
      // },
      ...templateCompilerOptions
    }),
    vueJsx(),
    vueDevTools(),
    glsl(),

    
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
})
