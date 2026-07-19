import type { FastifyInstance } from "fastify"

export default async function (fastify: FastifyInstance) {
  fastify.get("", { schema: { tags: ["miscellaneous"] } }, () => {
    return { message: "I'm alive" }
  })
}
