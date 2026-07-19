import type { EndpointConfig } from "../types"

// Direct re-export: Rolldown drops the whole aggregate `export {}` below if it
// contains a re-exported import binding, so SCHOOLS is forwarded on its own line.
export { SCHOOLS } from "@novanis/shared"

export const isDev = import.meta.env.DEV
export const isMock = isDev && false

// Same-origin deploys build without VITE_SERVER_URL: endpoints become
// relative paths ("/health/sms"). Dev still requires it, since Vite serves
// the web on its own port.
export const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? ""

if (!SERVER_URL && isDev) throw new Error("VITE_SERVER_URL is not defined")

export const DEFAULT_ERROR_MESSAGE = "Something went wrong"

const createUrl = (endpoint: string) => `${SERVER_URL}/${endpoint}`

export const ENDPOINTS: Record<string, EndpointConfig> = {
  HEALTH_SMS: {
    endpoint: {
      real: createUrl("health/sms"),
      mock: "https://run.mocky.io/v3/c6831c53-0201-4cc5-970e-257d4a1a685b",
    },
    overlay: "show",
  },
  CITY: {
    endpoint: {
      real: createUrl("city"),
      mock: "https://run.mocky.io/v3/fd55269c-ef09-4d06-8400-0888a30cf6ee",
    },
    overlay: "hide",
  },
  LOGIN: {
    endpoint: {
      real: createUrl("login"),
      mock: "https://run.mocky.io/v3/a1dc1050-84f3-44b5-9564-9d5a2876bf09",
    },
    // Feedback lives on the submit button (inline spinner), not a
    // full-screen scrim over the form.
    overlay: "hide",
  },
  REFRESH_CAPTCHA: {
    endpoint: {
      real: createUrl("login/captchaRefresh"),
      mock: "https://run.mocky.io/v3/92769a52-469f-4148-a593-8fe549940b20",
    },
    overlay: "hide",
  },
  YEARS: {
    endpoint: {
      real: createUrl("dashboard/years"),
      mock: "https://run.mocky.io/v3/252c9bb8-3abd-4741-a4e9-2368514332bf",
    },
    overlay: "show",
  },
  TERMS: {
    endpoint: {
      real: createUrl("dashboard/terms/"),
      mock: "https://run.mocky.io/v3/",
    },
    overlay: "show",
  },
  DIARY: {
    endpoint: {
      real: createUrl("dashboard/diary/"),
      mock: "https://run.mocky.io/v3/",
    },
    overlay: "optional",
  },
  SUBJECT: {
    endpoint: {
      real: createUrl("dashboard/subject"),
      mock: "https://run.mocky.io/v3/2fc47f41-b422-4fa3-9677-fd9013e27f12",
    },
    overlay: "hide",
  },
  GRADES: {
    endpoint: {
      real: createUrl("dashboard/grades"),
      mock: "https://run.mocky.io/v3/a3da8e69-1e20-48d9-9b2f-f5d98aca8f61",
    },
    overlay: "optional",
  },
}

export const DA_LINK = "https://ko-fi.com/meowzya"
export const TG_LINK = "https://t.me/roarinx"
export const GH_LINK = "https://github.com/Meowzyaa/enis2"

export const DEFAULT_RANGES = [0, 40, 65, 85, 100]
