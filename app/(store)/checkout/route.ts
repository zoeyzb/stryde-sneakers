import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** A demo-only handoff: never requests card details or creates an order. */
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/sold-out", request.url), 303);
}
