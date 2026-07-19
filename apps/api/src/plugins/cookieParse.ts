import fp from "fastify-plugin"

const plugin = fp(async function plugin(fastify) {
  fastify.decorate("cookieParse", (res: Response) => {
    const rawCookies = res.headers.getSetCookie()

    if (!rawCookies || rawCookies.length === 0) return null

    return rawCookies.map((cookie) => cookie.split(";")[0]).join("; ")
  })
})

export default plugin
