import type { FastifyInstance } from "fastify"
import { NIS_FETCH_OPTS } from "../../../config/index.js"

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: { city: string } }>(
    "",
    {
      schema: {
        querystring: fastify.getSchema("domain"),
        headers: fastify.getSchema("token"),
        response: {
          200: {
            type: "object",
            properties: {
              captcha: { type: "string" },
              token: { type: "string" },
            },
          },
        },
        tags: ["login"],
      },
    },
    async (req, reply) => {
      const { cookies } = req

      const response = (await fetch(
        `https://sms.${req.query.city}.nis.edu.kz/root/Account/RefreshCaptcha`,
        { headers: { cookie: cookies }, ...NIS_FETCH_OPTS }
      ).then((res) => res.json())) as {
        data?: { base64img?: string }
        message?: string
      }

      if (!response.data?.base64img)
        return reply
          .code(400)
          .send({ message: response.message || "Что-то пошло не так" })

      return reply.code(200).send({ captcha: response.data.base64img })
    }
  )
}
