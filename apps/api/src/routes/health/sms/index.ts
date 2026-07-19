import type { FastifyInstance } from "fastify"
import { NIS_FETCH_OPTS } from "../../../config/index.js"

const SECOND = 1000

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: { city: string } }>(
    "",
    {
      schema: {
        querystring: fastify.getSchema("domain"),
        tags: ["miscellaneous"],
      },
    },
    async (req, reply) => {
      const controller = new AbortController()

      const timeoutId = setTimeout(() => controller.abort(), 15 * SECOND)

      try {
        const res = await fetch(
          `https://sms.${req.query.city}.nis.edu.kz/root`,
          {
            redirect: "manual",
            signal: controller.signal,
            ...NIS_FETCH_OPTS,
          }
        )

        clearTimeout(timeoutId)

        return reply.send({ alive: res.status < 400 })
      } catch {
        return reply.send({ alive: false })
      }
    }
  )
}
