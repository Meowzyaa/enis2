# NovaNIS

> Электронный дневник - a fast, adaptive client for the electronic school
> journal used in NIS schools.

NovaNIS is one of many _enis_ implementations, an unofficial client for the
e-journal used in Nazarbayev Intellectual Schools.

[approximate history](https://wsehl.notion.site/wsehl/enis2-docs-3a033e48f5c94eb7aa153bd3c103d729)

## Stack

A Turborepo monorepo:

- **apps/web-mars** - Vue 3.5 + Vite 8 + Pinia + vue-router, Tailwind CSS v4,
  TypeScript, PWA. Two screens: **Дневник ЖКО** (diary) and **Табель
  успеваемости** (report card).
- **apps/api** - Fastify 5 CORS-bypass proxy (TypeScript, run via `tsx`).
- **packages/shared** - shared TypeScript utilities/config.

## Known issues

As described in [enis-proxy](https://github.com/superhooman/enis-proxy), NIS has
no public API, so a small server acts as an interlayer to bypass CORS (the
proxy approach no longer works). This adds latency and some privacy concerns.

## Getting started

Requires [Node.js](https://nodejs.org) **20+** and [Yarn](https://yarnpkg.com)
(classic). See `.nvmrc`.

```bash
# 1. Copy the env template and fill in your own secrets
cp .env.development .env
#    set JWT_SECRET and a 32-byte CRYPT_KEY in .env

# 2. Install (also builds @novanis/shared)
yarn install

# 3. Run api + web together
yarn dev
```

### Scripts

| Command          | What it does                                  |
| ---------------- | --------------------------------------------- |
| `yarn dev`       | Run the api and web app in watch mode (Turbo) |
| `yarn build`     | Build the web app to `apps/web-mars/dist/`    |
| `yarn typecheck` | `tsc` / `vue-tsc` across all workspaces       |
| `yarn lint`      | ESLint 9 (flat config) over the monorepo      |

## API documentation

Starting the server exposes Swagger UI with request/response schemas at
[http://localhost:4000/docs](http://localhost:4000/docs).

## Contributing

- Fork the repo and create your branch from `trunk`
- Submit a pull request

## License

[MIT](/LICENSE)
