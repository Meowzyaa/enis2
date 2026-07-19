import { createApp } from "vue"
import { createPinia } from "pinia"
import { registerSW } from "virtual:pwa-register"
import App from "./App.vue"
import router from "./router"
import useAuthStore from "./stores/auth"
import useSettingsStore from "./stores/settings"
import "./assets/globals.css"

registerSW({ immediate: true })

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Burn any persisted session on cold start unless the user opted into "Remember
// me". Without this the stored token/authenticated flag keeps a dead session
// alive on reopen, so the user lands in the app with credentials the server has
// already expired.
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
if (!settingsStore.settings.rememberMe) {
  authStore.token = ""
  authStore.authenticated = false
}

app.use(router).mount("#app")
