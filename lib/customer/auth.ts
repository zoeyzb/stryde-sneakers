import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { getCustomerAccountConfig, getSiteUrl, type CustomerAccountConfig } from "../shopify/config";
import { clearSession, readSession, writeSession, type CustomerSession } from "./session";

export const CUSTOMER_ACCOUNT_API_VERSION =
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION ?? "2026-10";

type OpenIdConfig = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
};

type CustomerApiConfig = { graphql_api: string };

async function discover<T>(config: CustomerAccountConfig, path: string): Promise<T> {
  const res = await fetch(`https://${config.storeDomain}/.well-known/${path}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Customer Account discovery failed (${res.status})`);
  return res.json();
}

export const openIdConfig = (c: CustomerAccountConfig) =>
  discover<OpenIdConfig>(c, "openid-configuration");
const customerApiConfig = (c: CustomerAccountConfig) =>
  discover<CustomerApiConfig>(c, "customer-account-api");

export const redirectUri = () => `${getSiteUrl()}/account/callback`;

export function pkce() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export const randomToken = () => randomBytes(16).toString("base64url");

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
};

async function tokenRequest(config: CustomerAccountConfig, params: Record<string, string>) {
  const { token_endpoint } = await openIdConfig(config);
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Origin: getSiteUrl(),
    "User-Agent": "STRYDE storefront",
  };
  const secret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;
  if (secret) {
    headers.Authorization = `Basic ${Buffer.from(`${config.clientId}:${secret}`).toString("base64")}`;
  }
  const res = await fetch(token_endpoint, {
    method: "POST",
    headers,
    body: new URLSearchParams({ client_id: config.clientId, ...params }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Customer Account token request failed (${res.status})`);
  const json = (await res.json()) as TokenResponse;
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    idToken: json.id_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  } satisfies CustomerSession;
}

export function exchangeCode(config: CustomerAccountConfig, code: string, verifier: string) {
  return tokenRequest(config, {
    grant_type: "authorization_code",
    redirect_uri: redirectUri(),
    code,
    code_verifier: verifier,
  });
}

/** Reads the `nonce` claim; the token came straight from the token endpoint over TLS. */
export function idTokenNonce(idToken: string | undefined) {
  if (!idToken) return null;
  try {
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString("utf8"));
    return typeof payload.nonce === "string" ? payload.nonce : null;
  } catch {
    return null;
  }
}

/** Returns a valid session, refreshing the access token when it is close to expiry. */
export async function getValidSession(config: CustomerAccountConfig) {
  const session = await readSession(config.sessionSecret);
  if (!session) return null;
  if (session.expiresAt - Date.now() > 60_000) return session;
  if (!session.refreshToken) return null;
  try {
    const refreshed = await tokenRequest(config, {
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
    });
    const next = { ...refreshed, idToken: refreshed.idToken ?? session.idToken };
    await writeSession(next, config.sessionSecret).catch(() => {});
    return next;
  } catch {
    await clearSession().catch(() => {});
    return null;
  }
}

export async function customerAccountFetch<T>(
  config: CustomerAccountConfig,
  session: CustomerSession,
  query: string,
  variables?: Record<string, unknown>
) {
  const { graphql_api } = await customerApiConfig(config);
  const endpoint = graphql_api.replace(/\/api\/[^/]+\/graphql/, `/api/${CUSTOMER_ACCOUNT_API_VERSION}/graphql`);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: session.accessToken },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Customer Account API responded with ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data ?? null;
}

export { getCustomerAccountConfig };
