import fp from "fastify-plugin"
import { FAKE_USER_AGENT, NIS_FETCH_OPTS } from "../config/index.js"
import { httpError } from "../types.js"
import type { ApiResult } from "../types.js"

const unauthorizedErrorMessages = [
  "Сессия пользователя была завершена, перезагрузите страницу",
  "Время работы с дневником завершено. Для продолжения необходимо обновить модуль",
]

const isUnauthorizedErrorMessage = (message: string): boolean => {
  return unauthorizedErrorMessages.indexOf(message) !== -1
}

export default fp(async function plugin(fastify) {
  fastify.decorate(
    "api",
    async ({ cookie = "", body, url, method = "GET" }) => {
      const options: RequestInit = {
        method,
        headers: { cookie, "user-agent": FAKE_USER_AGENT },
        ...NIS_FETCH_OPTS,
      }

      if (method === "POST") options.body = body as RequestInit["body"]

      const response = await fetch(url, options)

      if (!response.ok) {
        throw httpError(response.statusText, response.status)
      }

      const isJSON =
        response.headers.get("content-type") === "text/json; charset=utf-8"

      if (!isJSON) {
        const message = await response.text()

        if (isUnauthorizedErrorMessage(message)) {
          throw httpError("Сессия пользователя была завершена", 401)
        }

        throw httpError(message, 400)
      }

      const json = (await response.json()) as ApiResult

      if (!json.success) {
        if (isUnauthorizedErrorMessage(String(json.message))) {
          throw httpError("Время работы с дневником завершено", 401)
        }

        throw httpError(String(json.details || json.message), 400)
      }

      json.statusCode = response.status

      json.cookie = fastify.cookieParse(response)

      return json
    }
  )
})
