// Shared front-end domain types. Upstream NIS payloads are loosely shaped, so
// dynamic records are intentionally typed as `any` where modelling them fully
// would add noise without safety.

import "axios"

export type Theme = "dark" | "light"
export type SortBy = "score" | "name"
export type NotificationType = "info" | "success" | "warning" | "danger"

export interface Settings {
  tab: string
  year: string
  theme: Theme
  school: string
  rememberMe: boolean
  sortBy: SortBy
  hideEmpty: boolean
}

export interface NotificationOptions {
  id?: string
  message: string
  type?: NotificationType
  delay?: number
  progress?: boolean
  closable?: boolean
  actions?: Record<string, unknown>
}

export interface QueueItem {
  key?: string
  id: string
}

export interface Year {
  value: string
  label: string
  isActual: boolean
}

export interface EndpointConfig {
  endpoint: { real: string; mock: string }
  overlay: "show" | "hide" | "optional"
}

// Allow attaching a request id to axios configs (used by the loader interceptor).
declare module "axios" {
  interface InternalAxiosRequestConfig {
    id?: string
  }
  interface AxiosRequestConfig {
    id?: string
  }
}
