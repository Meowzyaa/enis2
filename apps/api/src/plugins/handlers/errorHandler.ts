import fp from "fastify-plugin"
import type { AppError } from "../../types.js"

const plugin = fp(async function plugin(fastify) {
  fastify.setErrorHandler((rawErr, req, reply) => {
    const err = rawErr as AppError
    const { validation, message } = err
    // Own errors carry the HTTP status in `code`; fastify plugins
    // (e.g. rate-limit's 429) use `statusCode`.
    const code = err.code ?? err.statusCode

    if (validation) {
      const message = validate(err)
      return reply.code(400).send({ message })
    }

    if (code === "ETIMEDOUT" || code === 503)
      return reply.code(503).send({ message: "Попробуйте снова" })

    if (code && typeof code === "number" && code > 200 && code < 600)
      return reply.code(code).send({ message })

    reply.code(500).send({ message: "Сервис временно недоступен" })
    console.log(err)
  })
})

const validate = ({ validationContext, validation }: AppError) => {
  const result = validation![0]!
  const errorVar = result.dataPath ? result.dataPath.substring(1) : ""
  const message = `${errorVar} ${result.message}`

  switch (validationContext) {
    case "querystring":
      return `Invalid query parameters: ${message}`
    case "params":
      return `Invalid ${errorVar}`
    case "body":
      return `Invalid body: ${message}`
    default:
      return "Перезайдите"
  }
}

export default plugin
