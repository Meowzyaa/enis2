import crypto from "crypto"
import { CRYPT_KEY } from "../config/index.js"
import type { EncryptedHash } from "../types.js"

// GCM: fresh IV per message + auth tag, so ciphertexts can't be XOR'd
// against each other (the old fixed-IV CTR flaw) or silently tampered with.
const algorithm = "aes-256-gcm"

export const encrypt = (text: string): EncryptedHash | null => {
  if (!text) return null
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(algorithm, CRYPT_KEY, iv)

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
  }
}

/** Throws on a tampered or legacy (pre-GCM) hash; callers treat that as "no password". */
export const decrypt = (hash: EncryptedHash): string => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    CRYPT_KEY,
    Buffer.from(hash.iv, "hex")
  )
  decipher.setAuthTag(Buffer.from(hash.tag ?? "", "hex"))

  return Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]).toString("utf8")
}
