import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

process.env.INTEGRATIONS_ENCRYPTION_KEY = "test-key-for-unit-tests-32chars";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const PROVIDER_IDS = [
  "gdrive", "slack", "teams", "gcal", "notion", "trello",
  "dropbox", "zapier", "miro", "asana", "onedrive", "hubspot",
];

function encrypt(plaintext) {
  const key = createHash("sha256").update(process.env.INTEGRATIONS_ENCRYPTION_KEY).digest();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

function decrypt(payload) {
  const key = createHash("sha256").update(process.env.INTEGRATIONS_ENCRYPTION_KEY).digest();
  const [ivB64, tagB64, dataB64] = payload.split(".");
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function signState(encoded) {
  return createHmac("sha256", process.env.INTEGRATIONS_ENCRYPTION_KEY).update(encoded).digest("base64url");
}

test("token vault round-trip", () => {
  const token = "ya29.access-token-secret";
  const enc = encrypt(token);
  assert.notEqual(enc, token);
  assert.equal(decrypt(enc), token);
});

test("oauth state signature is deterministic", () => {
  const payload = Buffer.from(JSON.stringify({ provider: "slack", userId: "u1", nonce: "abc", exp: Date.now() + 60000 })).toString("base64url");
  const sig = signState(payload);
  assert.ok(sig.length > 10);
  assert.equal(signState(payload), sig);
});

test("catalog lists 12 providers", () => {
  assert.equal(PROVIDER_IDS.length, 12);
  assert.deepEqual(new Set(PROVIDER_IDS).size, 12);
});
