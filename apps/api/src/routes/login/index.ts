import type { FastifyInstance } from "fastify"
import { encrypt, decrypt } from "../../utils/crypto.js"
import { FAKE_USER_AGENT, NIS_FETCH_OPTS } from "../../config/index.js"
import type { Account, ApiResult, EncryptedHash } from "../../types.js"

const getDecryptedPassword = (
  password?: string | EncryptedHash
): string | undefined => {
  if (password && typeof password === "object") {
    // Legacy or tampered hash → treat as "no saved password" (401 below).
    try {
      return decrypt(password)
    } catch {
      return undefined
    }
  }
  return password
}

export default async function (fastify: FastifyInstance) {
  fastify.post<{
    Querystring: { city: string }
    Body: { login?: string; password?: string; captchaInput?: string }
  }>(
    "",
    {
      schema: {
        querystring: fastify.getSchema("domain"),
        headers: fastify.getSchema("token"),
        body: {
          type: "object",
          properties: {
            login: { type: "string", minLength: 12, maxLength: 12 },
            password: { type: "string", minLength: 1 },
            captchaInput: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              token: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              message: { type: "string" },
              token: { type: "string" },
              data: {
                type: "object",
                properties: {
                  base64img: { type: "string" },
                },
              },
            },
          },
        },
        tags: ["login"],
      },
      config: {
        // Credential endpoint proxying to NIS: keep brute force off it.
        rateLimit: { max: 10, timeWindow: "1 minute" },
      },
    },
    async (req, reply) => {
      const { captchaInput } = req.body
      const { cookies: userCookies, account } = req

      const mergedCookies = fastify.mergeCookies(
        userCookies,
        "lang=ru-RU; path=/"
      )

      const savedAccount = typeof account === "object" ? account : undefined

      const login = req.body.login || savedAccount?.login

      const password =
        req.body.password || getDecryptedPassword(savedAccount?.password)

      if (!(login && password))
        return reply
          .code(401)
          .send({ message: "Neither token nor credentials were provided" })

      const params = new URLSearchParams()
      params.append("login", login)
      params.append("password", password)
      params.append("captchaInput", captchaInput || "")
      params.append("twoFactorAuthCode", "")
      params.append("application2FACode", "")

      const res = await fetch(
        `https://sms.${req.query.city}.nis.edu.kz/root/Account/LogOn`,
        {
          method: "POST",
          headers: {
            cookie: mergedCookies,
            "user-agent": FAKE_USER_AGENT,
          },
          body: params,
          ...NIS_FETCH_OPTS,
        }
      )
      const body = (await res.json()) as ApiResult

      const updatedCookies = fastify.cookieParse(res)
      const cookies = fastify.mergeCookies(mergedCookies, updatedCookies ?? "")

      const accountPayload: Account = {
        login,
        password: encrypt(password) as EncryptedHash,
      }
      body.token = fastify.jwt.sign({ cookies, account: accountPayload })

      const statusCode = body.success ? 200 : 400
      body.data = Object.assign({}, body.data)

      return reply.code(statusCode).send(body)
    }
  )
}
