import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import type { TokenSet } from "./types";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;

function getKey(): Buffer {
  const raw = process.env.INTEGRATIONS_ENCRYPTION_KEY;
  if (!raw && process.env.INTEGRATIONS_DEV_MOCK === "true") {
    return createHash("sha256").update("dev-mock-key").digest();
  }
  if (!raw || raw.length < 16) {
    throw new Error("INTEGRATIONS_ENCRYPTION_KEY manquant ou trop court (min 16 caractères)");
  }
  return createHash("sha256").update(raw).digest();
}

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

export function decryptToken(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Token chiffré invalide");
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export interface StoredTokens {
  accessTokenEnc: string;
  refreshTokenEnc?: string;
  expiresAt?: string;
  tokenType: string;
  scopes: string[];
}

export function serializeTokens(tokens: TokenSet): StoredTokens {
  return {
    accessTokenEnc: encryptToken(tokens.accessToken),
    refreshTokenEnc: tokens.refreshToken ? encryptToken(tokens.refreshToken) : undefined,
    expiresAt: tokens.expiresAt?.toISOString(),
    tokenType: tokens.tokenType ?? "Bearer",
    scopes: tokens.scopes ?? [],
  };
}

export function deserializeTokens(stored: StoredTokens): TokenSet {
  return {
    accessToken: decryptToken(stored.accessTokenEnc),
    refreshToken: stored.refreshTokenEnc ? decryptToken(stored.refreshTokenEnc) : undefined,
    expiresAt: stored.expiresAt ? new Date(stored.expiresAt) : undefined,
    tokenType: stored.tokenType,
    scopes: stored.scopes,
  };
}

export function isTokenExpired(expiresAt?: string | null, bufferMs = 5 * 60 * 1000): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() - bufferMs <= Date.now();
}
