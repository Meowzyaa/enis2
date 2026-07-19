import { existsSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import fastify from "fastify"
import autoload from "@fastify/autoload"
// Type-only: pulls in the reply.sendFile augmentation from @fastify/static.
import type {} from "@fastify/static"
import { PORT, JWT_SECRET, CORS_ORIGIN } from "./config/index.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = fastify({ trustProxy: true })

// Single-service deploy: when the web has been built (yarn build at the
// root), serve it from the same origin. Dev uses the Vite server instead.
// In production the build is mandatory - a missing one means the deploy is
// broken, so fail the boot instead of silently serving 404s.
const WEB_BUILD = join(__dirname, "../../web-mars/dist")
const serveWeb = existsSync(join(WEB_BUILD, "index.html"))
if (!serveWeb && process.env.NODE_ENV === "production")
  throw new Error(`Missing web build at ${WEB_BUILD} - did vite build run?`)

// Auth is a Bearer header, not cookies, so no `credentials` needed.
app.register(import("@fastify/cors"), { origin: CORS_ORIGIN })

// Registered global:false; only routes that opt in (login) are limited.
app.register(import("@fastify/rate-limit"), { global: false })

if (process.env.NODE_ENV !== "production") {
  app.register(import("@fastify/swagger"), {
    swagger: {
      info: {
        title: "NovaNIS",
        description: "NovaNIS API documentation",
        version: "1.0.0",
      },
    },
  })

  app.register(import("@fastify/swagger-ui"), {
    routePrefix: "/docs",
    uiConfig: {
      deepLinking: true,
      docExpansion: "none",
      displayRequestDuration: true,
    },
  })

  console.log(`Docs on: http://localhost:${PORT}/docs`)
}

app.register(import("@fastify/compress"))

// After compress, so the asset routes pick up its onSend hook (hooks only
// apply to routes registered later). Hashed /assets never change between
// deploys, hence immutable; index: false sends `/` through the not-found
// fallback below, which serves the shell with maxAge 0 so it revalidates.
if (serveWeb) {
  app.register(import("@fastify/static"), {
    root: WEB_BUILD,
    maxAge: "30d",
    immutable: true,
    index: false,
  })

  // Explicit route: with index disabled the wildcard 403s on "/" instead
  // of falling through to the not-found handler.
  app.get("/", (req, reply) =>
    reply.sendFile("index.html", { maxAge: 0, immutable: false }),
  )
}

app.setNotFoundHandler((req, reply) => {
  // SPA fallback: browser navigations (Accept: text/html) get the shell so
  // client routes (/login, /diary, /tabel) survive a refresh. Everything
  // else - missing hashed assets after a redeploy, mistyped API calls -
  // keeps the JSON 404 instead of a misleading 200 + HTML.
  if (serveWeb && req.method === "GET" && req.headers.accept?.includes("text/html"))
    return reply.sendFile("index.html", { maxAge: 0, immutable: false })
  reply.code(404).send({ message: "Service not found" })
})

app.register(autoload, { dir: join(__dirname, "schema") })
app.register(autoload, { dir: join(__dirname, "plugins") })
app.register(autoload, {
  dir: join(__dirname, "routes"),
  routeParams: true,
})

// Tokens embed (encrypted) NIS credentials for silent re-login, so they
// must not live forever; each successful login re-issues a fresh one.
app.register(import("@fastify/jwt"), {
  secret: JWT_SECRET,
  sign: { expiresIn: "30d" },
})

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) return console.log(err)
  console.info(`App is alive on port ${PORT}`)
})
