import { NextResponse, type NextRequest } from "next/server";
import { getCustomerAccountConfig, getSiteUrl } from "@/lib/shopify/config";
import { openIdConfig } from "@/lib/customer/auth";
import { clearSession, readSession } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const config = getCustomerAccountConfig();
  const home = new URL("/", request.url);
  if (!config) return NextResponse.redirect(home, 303);

  const session = await readSession(config.sessionSecret);
  await clearSession();
  if (!session?.idToken) return NextResponse.redirect(home, 303);

  try {
    const { end_session_endpoint } = await openIdConfig(config);
    const url = new URL(end_session_endpoint);
    url.searchParams.set("id_token_hint", session.idToken);
    url.searchParams.set("post_logout_redirect_uri", getSiteUrl());
    return NextResponse.redirect(url, 303);
  } catch {
    return NextResponse.redirect(home, 303);
  }
}
