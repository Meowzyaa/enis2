import { useRouter } from "vue-router"
import useAuthStore from "../stores/auth"
import useHealthStore from "../stores/health"
import useSettingsStore from "../stores/settings"
import { notify } from "../services/notify"

/**
 * Shared data-fetch orchestration: runs a fetcher and, on a 401, silently
 * re-logs-in when "remember me" is on (then retries once) or ends the session.
 * Network errors fall back to an availability check.
 */
export function useSession() {
  const router = useRouter()
  const authStore = useAuthStore()
  const healthStore = useHealthStore()
  const settingsStore = useSettingsStore()

  const endSession = (message = "Session ended") => {
    authStore.logout()
    notify.show({ type: "danger", message })
    router.push({ name: "login" })
  }

  // Resolves true on success so views can tell "load failed" apart from
  // "loaded fine but genuinely empty" when rendering empty states.
  const guarded = async (fetcher: () => Promise<void>): Promise<boolean> => {
    try {
      await fetcher()
      return true
    } catch (error: any) {
      const isUnauthorized = error?.response?.status === 401
      if (isUnauthorized && settingsStore.settings.rememberMe) {
        try {
          await authStore.login({})
          await fetcher()
          return true
        } catch {
          endSession()
        }
      } else if (isUnauthorized) {
        endSession()
      } else {
        // Generic failure: tell the user, then probe availability (which only
        // surfaces UI when the service is actually down). Don't let a failing
        // health probe turn into an unhandled rejection.
        notify.show({
          type: "danger",
          message: error?.response?.data?.message ?? "Something went wrong",
        })
        await healthStore.checkAvailability().catch(() => {})
      }
      return false
    }
  }

  return { endSession, guarded }
}
