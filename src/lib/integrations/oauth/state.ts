import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { ProviderId } from "../types";

const COOKIE_NAME = "mf_oauth_state";
const TTL_MS = 10 * 60 * 1000;

function signingSecret(): string {
  return (
    process.env.INTEGRATIONS_ENCRYPTION_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "dev-oauth-state-secret"
  );
}

interface StatePayload {
  provider: ProviderId;
  userId: string;
  nonce: string;
  exp: number;
}

function sign(data: string): string {
  return createHmac("sha256", signingSecret()).update(data).digest("base64url");
}

export function createOAuthState(provider: ProviderId, userId: string): string {
  const payload: StatePayload = {
    provider,
    userId,
    nonce: randomBytes(16).toString("hex"),
    exp: Date.now() + TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyOAuthState(state: string): StatePayload {
  const [encoded, sig] = state.split(".");
  if (!encoded || !sig) throw new Error("State OAuth invalide");
  const expected = sign(encoded);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Signature state OAuth invalide");
  }
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as StatePayload;
  if (payload.exp < Date.now()) throw new Error("State OAuth expiré");
  return payload;
}

export { COOKIE_NAME };

export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

export function callbackUrl(provider: ProviderId): string {
  return `${appUrl()}/api/integrations/oauth/callback/${provider}`;
}

export function isDevMock(): boolean {
  return process.env.INTEGRATIONS_DEV_MOCK === "true";
}
