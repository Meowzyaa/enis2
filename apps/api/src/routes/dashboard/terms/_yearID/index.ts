import type { FastifyInstance } from "fastify"
import { getCurrentQuarter } from "@novanis/shared"

export default async function (fastify: FastifyInstance) {
  fastify.get<{
    Querystring: { city: string }
    Params: { yearID: string }
  }>(
    "",
    {
      schema: {
        querystring: fastify.getSchema("domain"),
        headers: fastify.getSchema("token"),
        params: {
          type: "object",
          required: ["yearID"],
          properties: {
            yearID: { type: "string", minLength: 36, maxLength: 36 },
          },
        },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                Name: { type: "string" },
                Id: { type: "string" },
                isActual: { type: "boolean", default: false },
              },
            },
          },
        },
        tags: ["dashboard"],
      },
    },
    async (req, reply) => {
      const cookie = req.cookies

      const params = new URLSearchParams()
      params.append("schoolYearId", req.params.yearID)

      const periods = await fastify.api({
        method: "POST",
        url: `https://sms.${req.query.city}.nis.edu.kz/Ref/GetPeriods`,
        body: params,
        cookie,
      })

      const sortedPeriods = periods.data.sort((a: any, b: any) => {
        if (a.Name < b.Name) return -1;
        if (a.Name > b.Name) return 1;
        return 0;
      });

      sortedPeriods[getCurrentQuarter() - 1].isActual = true;
      await reply.send(sortedPeriods);
    }
  )
}
