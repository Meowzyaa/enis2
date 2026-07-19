import dotenv from "dotenv"
import { Agent } from "undici"

dotenv.config()

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is missing`)
  return value
}

export const JWT_SECRET = requireEnv("JWT_SECRET")

export const CRYPT_KEY = requireEnv("CRYPT_KEY")
if (Buffer.byteLength(CRYPT_KEY) !== 32)
  throw new Error("CRYPT_KEY must be exactly 32 bytes (aes-256-gcm)")

export const PORT = Number(process.env.PORT ?? 4000)

// Comma-separated allowlist of origins; unset = any origin (public API,
// auth travels in the Authorization header, not cookies).
export const CORS_ORIGIN: string[] | string =
  process.env.CORS_ORIGIN?.split(",") ?? "*"

// Some school SMS hosts serve broken TLS chains. Opt in to skipping
// verification for those fetches ONLY (never process-wide) with
// NIS_INSECURE_TLS=1; spread these options into every NIS fetch.
// (Cast bridges installed undici's Agent to @types/node's undici-types.)
export const NIS_FETCH_OPTS: RequestInit =
  process.env.NIS_INSECURE_TLS === "1"
    ? {
        dispatcher: new Agent({
          connect: { rejectUnauthorized: false },
        }) as unknown as RequestInit["dispatcher"],
      }
    : {}

export const IPINFO_TOKEN = process.env.IPINFO_TOKEN
if (!IPINFO_TOKEN) {
  console.warn("IPINFO_TOKEN is missing")
}

export const FAKE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
