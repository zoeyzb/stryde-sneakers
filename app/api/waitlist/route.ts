import { NextResponse } from "next/server";
import { AdminNotConfiguredError } from "@/lib/shopify/admin";
import { rateLimit } from "@/lib/rateLimit";
import { HANDLE, normaliseEmail } from "@/lib/validation";
import { joinWaitlist, type WaitlistSource } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

const SOURCES: WaitlistSource[] = ["next-drop", "restock"];

function fail(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid request.");
  }

  // Honeypot field: real visitors never see or fill it.
  if (typeof body.company === "string" && body.company.length > 0) {
    return fail(400, "Invalid request.");
  }

  const email = normaliseEmail(body.email);
  if (!email) return fail(422, "Enter a valid email address.");

  const source = SOURCES.find((s) => s === body.source);
  if (!source) return fail(400, "Invalid request.");

  const productHandle = typeof body.productHandle === "string" ? body.productHandle : undefined;
  if (source === "restock" && (!productHandle || !HANDLE.test(productHandle))) {
    return fail(400, "Invalid product.");
  }

  const marketingConsent = body.marketingConsent === true;
  if (source === "next-drop" && !marketingConsent) {
    return fail(422, "Please confirm you'd like to receive emails about STRYDE drops.");
  }

  if (!(await rateLimit("waitlist", 6, 10 * 60 * 1000))) {
    return fail(429, "Too many attempts. Please try again in a few minutes.");
  }

  try {
    const outcome = await joinWaitlist({ email, source, productHandle, marketingConsent });
    return NextResponse.json({ ok: true, outcome });
  } catch (err) {
    if (err instanceof AdminNotConfiguredError) {
      return fail(503, "Sign-ups aren't connected yet, so we couldn't save your email.");
    }
    console.error("[waitlist]", err);
    return fail(502, "We couldn't save your email just now. Please try again.");
  }
}
