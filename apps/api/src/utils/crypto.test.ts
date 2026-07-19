import assert from "node:assert"
import test from "node:test"

process.env.JWT_SECRET ??= "test-secret"
process.env.CRYPT_KEY ??= "0123456789abcdef0123456789abcdef"

const { encrypt, decrypt } = await import("./crypto.js")

test("roundtrip", () => {
  const hash = encrypt("s3cret-пароль")!
  assert.strictEqual(decrypt(hash), "s3cret-пароль")
})

test("fresh IV per call", () => {
  const a = encrypt("same")!
  const b = encrypt("same")!
  assert.notStrictEqual(a.iv, b.iv)
  assert.notStrictEqual(a.content, b.content)
})

test("tampered ciphertext rejected", () => {
  const hash = encrypt("intact")!
  const flipped = (parseInt(hash.content.slice(0, 2), 16) ^ 0xff)
    .toString(16)
    .padStart(2, "0")
  hash.content = flipped + hash.content.slice(2)
  assert.throws(() => decrypt(hash))
})

test("legacy hash without tag rejected, not looped through", () => {
  const hash = encrypt("legacy")!
  // @ts-expect-error simulating a pre-GCM token payload
  delete hash.tag
  assert.throws(() => decrypt(hash))
})
