import { NextResponse, type NextRequest } from "next/server";
import { getCustomerAccountConfig, getHostedAccountUrl } from "@/lib/shopify/config";
import { openIdConfig, pkce, randomToken, redirectUri } from "@/lib/customer/auth";
import { writeOAuthState } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const config = getCustomerAccountConfig();
  if (!config) {
    const hosted = getHostedAccountUrl();
    return NextResponse.redirect(hosted ?? new URL("/account", request.url));
  }

  const returnTo = request.nextUrl.searchParams.get("returnTo");
  const { verifier, challenge } = pkce();
  const state = randomToken();
  const nonce = randomToken();
  await writeOAuthState(
    {
      state,
      nonce,
      verifier,
      returnTo: returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/account",
    },
    config.sessionSecret
  );

  const { authorization_endpoint } = await openIdConfig(config);
  const url = new URL(authorization_endpoint);
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return NextResponse.redirect(url);
}
