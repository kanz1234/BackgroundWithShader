// import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Tres from '@tresjs/core'

import 'normalize.css'

import '@/styles/icon/iconfont.css'

import i18n from '@/i18n'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Tres)
app.use(i18n)
app.mount('#app')
