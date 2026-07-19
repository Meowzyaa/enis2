import type { FastifyInstance } from "fastify"
import { IPINFO_TOKEN } from "../../config/index.js"

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              city: { type: "string" },
              region: { type: "string" },
            },
          },
        },
        tags: ["miscellaneous"],
      },
    },
    async (req, reply) => {
      const token = IPINFO_TOKEN

      const ips = req.ips ?? []
      const requestIp = ips[ips.length - 1]

      const res = (await fetch(
        `https://ipinfo.io/${requestIp}/json?token=${token}`
      ).then((res) => res.json())) as { city?: string; region?: string }

      await reply.send({ city: res.city || "", region: res.region || "" })
    }
  )
}
