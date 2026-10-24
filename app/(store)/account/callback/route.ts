import { NextResponse, type NextRequest } from "next/server";
import { getCustomerAccountConfig } from "@/lib/shopify/config";
import { exchangeCode, idTokenNonce } from "@/lib/customer/auth";
import { takeOAuthState, writeSession } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const config = getCustomerAccountConfig();
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/account?error=${reason}`, request.url));
  if (!config) return fail("not-configured");

  const params = request.nextUrl.searchParams;
  const saved = await takeOAuthState(config.sessionSecret);
  if (!saved || params.get("state") !== saved.state) return fail("state");
  if (params.get("error")) return fail("denied");
  const code = params.get("code");
  if (!code) return fail("code");

  try {
    const session = await exchangeCode(config, code, saved.verifier);
    if (idTokenNonce(session.idToken) !== saved.nonce) return fail("nonce");
    await writeSession(session, config.sessionSecret);
  } catch (err) {
    console.error("[account] token exchange failed", err);
    return fail("token");
  }
  return NextResponse.redirect(new URL(saved.returnTo, request.url));
}
