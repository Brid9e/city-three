import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

import './style.scss'

createApp(App).use(createPinia()).mount('#app')
