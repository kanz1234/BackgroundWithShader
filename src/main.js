// import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Tres from '@tresjs/core'


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Tres)
app.mount('#app')
