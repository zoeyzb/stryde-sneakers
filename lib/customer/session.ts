import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "stryde_session";
export const OAUTH_COOKIE = "stryde_oauth";

export type CustomerSession = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
};

export type OAuthState = {
  state: string;
  nonce: string;
  verifier: string;
  returnTo: string;
};

function key(secret: string) {
  return createHash("sha256").update(secret).digest();
}

export function seal(value: unknown, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

export function unseal<T>(sealed: string | undefined, secret: string): T | null {
  if (!sealed) return null;
  try {
    const raw = Buffer.from(sealed, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(secret), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const json = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function readSession(secret: string) {
  return unseal<CustomerSession>((await cookies()).get(SESSION_COOKIE)?.value, secret);
}

export async function writeSession(session: CustomerSession, secret: string) {
  (await cookies()).set(SESSION_COOKIE, seal(session, secret), {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function writeOAuthState(value: OAuthState, secret: string) {
  (await cookies()).set(OAUTH_COOKIE, seal(value, secret), { ...cookieBase, maxAge: 600 });
}

export async function takeOAuthState(secret: string) {
  const store = await cookies();
  const value = unseal<OAuthState>(store.get(OAUTH_COOKIE)?.value, secret);
  store.delete(OAUTH_COOKIE);
  return value;
}
