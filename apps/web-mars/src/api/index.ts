import axios from "axios"
import { nanoid } from "nanoid"
import { ENDPOINTS, DEFAULT_ERROR_MESSAGE, isMock } from "../config"
import useLoaderStore from "../stores/loader"
import useAuthStore from "../stores/auth"
import useSettingsStore from "../stores/settings"

const api = axios.create({
  timeout: 1000 * 30, // 30 seconds
})

const findEndpoint = (url: string): string | undefined => {
  return Object.keys(ENDPOINTS).find((key) => {
    const value = ENDPOINTS[key].endpoint
    return url.includes(isMock ? value.mock : value.real)
  })
}

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const loaderStore = useLoaderStore()
    const settingsStore = useSettingsStore()

    const { school: city } = settingsStore.settings
    const { token } = authStore

    const endpoint = findEndpoint(config.url ?? "")
    const id = nanoid()

    config.headers.Authorization = `Bearer ${token}`
    config.params = { ...config.params, city }
    config.id = id

    loaderStore.loadingQueue.push({ key: endpoint, id })

    return config
  },
  (error: unknown) => {
    console.log(`API Call error: ${error}`)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    const id = response.config.id

    const loaderStore = useLoaderStore()
    loaderStore.loadingQueue = loaderStore.loadingQueue.filter((item) => {
      return item.id !== id
    })

    return response.data
  },
  (error: any) => {
    const loaderStore = useLoaderStore()

    // Always dequeue, even on a network/timeout error with no response,
    // otherwise the loading queue leaks and the blocking overlay sticks.
    const config = error.response?.config ?? error.config
    const id = config?.id
    if (id) {
      loaderStore.loadingQueue = loaderStore.loadingQueue.filter(
        (item) => item.id !== id
      )
    }

    if (!error.response) return Promise.reject(error)

    // A gateway/timeout error can have a response with no (or non-object) body,
    // so guard before writing the fallback message.
    if (!error.response.data || typeof error.response.data !== "object")
      error.response.data = {}
    if (!error.response.data.message)
      error.response.data.message = DEFAULT_ERROR_MESSAGE

    return Promise.reject(error)
  }
)

const createEndpoint = (name: string): string => {
  const item = ENDPOINTS[name].endpoint
  return isMock ? item.mock : item.real
}

export const checkHealth = (): Promise<any> => {
  return api.get(createEndpoint("HEALTH_SMS"))
}

export const getCity = (): Promise<any> => {
  return api.get(createEndpoint("CITY"), { timeout: 1500 })
}

export const login = (credentials: Record<string, unknown> = {}): Promise<any> => {
  return api.post(createEndpoint("LOGIN"), credentials)
}

export const refreshCaptcha = (): Promise<any> => {
  return api.get(createEndpoint("REFRESH_CAPTCHA"))
}

export const getYears = (): Promise<any> => {
  return api.get(createEndpoint("YEARS"))
}

export const getTerms = (yearId: string): Promise<any> => {
  return api.get(createEndpoint("TERMS") + yearId)
}

export const getDiary = (termId: string): Promise<any> => {
  return api.get(createEndpoint("DIARY") + termId)
}

export const getSubject = (
  journalId: string,
  evaluations: string[]
): Promise<any> => {
  return api.get(createEndpoint("SUBJECT"), {
    params: { journalId, evaluations },
  })
}

export const getGrades = (yearID: string): Promise<any> => {
  return api.get(createEndpoint("GRADES"), { params: { yearID } })
}
