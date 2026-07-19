import fp from "fastify-plugin"
import { httpError } from "../../types.js"
import type { Account } from "../../types.js"

const plugin = fp(async function plugin(fastify) {
  fastify.decorateRequest("cookies", "")
  fastify.decorateRequest("account", "")

  fastify.addHook("preValidation", async (req) => {
    if (!req.headers.authorization) return
    try {
      const token = req.headers.authorization.replace("Bearer ", "")
      const decoded = fastify.jwt.verify<{
        cookies: string
        account: Account
      }>(token)
      req.cookies = decoded.cookies
      req.account = decoded.account
    } catch (e) {
      // The web always sends an Authorization header (empty before login),
      // so only routes that declare the token schema get a hard 401 on a
      // bad token; /login re-auths from body credentials.
      const requiresToken =
        (req.routeOptions.schema?.headers as { $id?: string } | undefined)
          ?.$id === "token"
      if (requiresToken && !req.routeOptions.url?.startsWith("/login"))
        throw httpError("Session expired", 401)
    }
  })
})

export default plugin
