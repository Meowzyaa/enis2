import { ref } from "vue"
import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { login as _login, refreshCaptcha } from "../api"
import { notify } from "../services/notify.js"
import useYearsStore from "./years.js"
import useTermsStore from "./terms.js"
import useDiaryStore from "./diary.js"
import useGradesStore from "./grades.js"
import useSettingsStore from "./settings.js"
import useSubjectStore from "./subject.js"

export default defineStore("auth", () => {
  const token = useStorage("token", "")
  const authenticated = useStorage("authenticated", false)

  const captcha = ref<string | null>(null)

  // Resolve stores lazily; auth and diary import each other, so destructuring
  // their actions at setup time yields `undefined` (circular init).
  const clearStore = () => {
    useYearsStore().clearYears()
    useTermsStore().clearTerms()
    useDiaryStore().clearDiary()
    useGradesStore().clearGrades()
    useSettingsStore().clearSettings()
    useSubjectStore().clearSubject()
  }

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const login = async (credentials: Record<string, unknown>) => {
    try {
      const data = await _login(credentials)
      setToken(data.token)
      captcha.value = null
      authenticated.value = true
    } catch (error: any) {
      authenticated.value = false
      // A network error has no `response`; only adopt a token when present.
      const failedToken = error?.response?.data?.token
      if (failedToken) setToken(failedToken)
      notify.show({
        type: "danger",
        // Prefer the upstream reason (e.g. wrong password) over a generic one.
        message:
          error?.response?.data?.message ?? "Could not log in, please try again",
      })
      return Promise.reject(error)
    }
  }
  const logout = () => {
    token.value = null
    authenticated.value = false
    clearStore()
  }
  const updateCaptcha = async () => {
    try {
      const data = await refreshCaptcha()

      captcha.value = data.captcha
    } catch (error) {
      return Promise.reject(error)
    }
  }
  return {
    token,
    captcha,
    authenticated,
    login,
    logout,
    updateCaptcha,
    setToken,
  }
})
