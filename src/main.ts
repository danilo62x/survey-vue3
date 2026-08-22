import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import VueApexCharts from 'vue3-apexcharts'
import router from './router'
import i18n from './i18n'
import App from './App.vue'

import './assets/styles/app.css'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(VueApexCharts)

router.isReady().then(() => {
  app.mount('#app')
})
