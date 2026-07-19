import "@fastify/jwt"

/** AES-256-GCM value produced by `utils/crypto`. */
export interface EncryptedHash {
  iv: string
  content: string
  tag: string
}

/** Credentials persisted inside the signed JWT. */
export interface Account {
  login: string
  password: string | EncryptedHash
}

/** Loose shape of an upstream NIS (SMS) JSON response. */
export interface ApiResult {
  success?: boolean
  message?: string
  details?: string
  statusCode?: number
  cookie?: string | null
  // Upstream payloads are dynamic; callers narrow as needed.
  data?: any
  [key: string]: unknown
}

export interface ApiOptions {
  cookie?: string
  body?: unknown
  url: string
  method?: string
}

/**
 * Error carrying an upstream/HTTP status. The codebase attaches numeric HTTP
 * codes to `code`, which the global error handler inspects.
 */
export interface AppError extends Error {
  code?: string | number
  statusCode?: number
  validation?: Array<{ message?: string; dataPath?: string }>
  validationContext?: string
}

/** Build an Error carrying an HTTP status code. */
export const httpError = (message: string, code: number): AppError => {
  const err = new Error(message) as AppError
  err.code = code
  return err
}

declare module "fastify" {
  interface FastifyInstance {
    mergeCookies(oldCookie: string, newCookie: string): string
    cookieParse(res: Response): string | null
    api(options: ApiOptions): Promise<ApiResult>
  }
  interface FastifyRequest {
    cookies: string
    account: Account | ""
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { cookies: string; account: Account }
    user: { cookies: string; account: Account }
  }
}
