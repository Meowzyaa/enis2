import type { FastifyInstance } from "fastify"
import { FAKE_USER_AGENT, NIS_FETCH_OPTS } from "../../../config/index.js"

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: { city: string; yearID: string } }>(
    "",
    {
      schema: {
        headers: fastify.getSchema("token"),
        querystring: {
          type: "object",
          required: ["city", "yearID"],
          properties: {
            city: fastify.getSchema("city"),
            yearID: { type: "string" },
          },
        },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                SubjectName: { type: "string" },
                FirstPeriod: { type: "string" },
                SecondPeriod: { type: "string" },
                FirstHalfYear: { type: "string" },
                ThirdPeriod: { type: "string" },
                ForthPeriod: { type: "string" },
                SecondHalfYear: { type: "string" },
                Exam: { type: "string" },
                Year: { type: "string" },
                Final: { type: "string" },
              },
            },
          },
        },
        tags: ["dashboard"],
      },
    },
    async (req, reply) => {
      const { city, yearID } = req.query
      const baseUrl = `https://sms.${city}.nis.edu.kz`

      const params = new URLSearchParams()
      let cookie = req.cookies

      // Loading the report-card page selects the role in the session
      // (otherwise every /reportcard call answers "не выбрана роль").
      const indexResponse = await fetch(`${baseUrl}/reportcard/index/0`, {
        headers: { cookie, "user-agent": FAKE_USER_AGENT },
        ...NIS_FETCH_OPTS,
      })
      const indexCookie = fastify.cookieParse(indexResponse)
      if (indexCookie) cookie = fastify.mergeCookies(cookie, indexCookie)

      // ponytail: pick the first role; add selection UI only if an account
      // ever has multiple report-card roles.
      const roles = await fastify.api({
        method: "POST",
        cookie,
        url: `${baseUrl}/reportcard/GetRoles`,
      })
      params.append("roleId", roles.data[0].Id)

      const organization = await fastify.api({
        method: "POST",
        body: params,
        cookie,
        url: `${baseUrl}/reportcard/GetOrganizations`,
      })

      params.append("schoolYearId", yearID)
      params.append("organizationId", organization.data[0].Id)
      params.append("organizationInternalId", organization.data[0].Id)

      const parallels = await fastify.api({
        method: "POST",
        body: params,
        cookie,
        url: `${baseUrl}/reportcard/GetParallels`,
      })

      params.append("parallelId", parallels.data[0].Id)

      const klasses = await fastify.api({
        method: "POST",
        body: params,
        cookie,
        url: `${baseUrl}/reportcard/GetKlasses`,
      })

      params.append("klassId", klasses.data[0].Id)

      const students = await fastify.api({
        method: "POST",
        body: params,
        cookie,
        url: `${baseUrl}/reportcard/GetStudents`,
      })

      params.append("personId", students.data[0].Id)
      params.append("isEditable", "true")
      // NIS expects this exact (legacy) serialization - see note below.
      params.append("group", "[object Object]")

      const { data: url, cookie: resCookie } = await fastify.api({
        method: "POST",
        body: params,
        cookie,
        url: `${baseUrl}/reportcard/GetUrl`,
      })

      let newCookies = fastify.mergeCookies(cookie, resCookie ?? "")

      // Visiting the GetUrl link selects the report-card role and sets a
      // session cookie; capture & merge it (otherwise GetData → "не выбрана
      // роль"). Mirrors the diary route.
      const roleResponse = await fetch(url, {
        headers: {
          cookie: newCookies,
          "user-agent": FAKE_USER_AGENT,
        },
        ...NIS_FETCH_OPTS,
      })
      const roleCookie = fastify.cookieParse(roleResponse)
      if (roleCookie) newCookies = fastify.mergeCookies(newCookies, roleCookie)

      const grades = await fastify.api({
        method: "POST",
        body: params,
        cookie: newCookies,
        url: `${baseUrl}/ReportCardByStudent/GetData`,
      })

      const array = grades.data.filter(
        (grade: any) =>
          grade.IsNotChosen && grade.ComponentName === "Инвариантный компонент"
      )

      // remove item duplicates
      await reply.send([
        ...new Map(
          array.map((item: any) => [item["SubjectName"], item])
        ).values(),
      ])
    }
  )
}
