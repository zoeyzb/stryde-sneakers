import { NextResponse } from "next/server";
import { escapeHtml, isEmailConfigured, sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";
import { normaliseEmail } from "@/lib/validation";

export const dynamic = "force-dynamic";

const TOPICS = ["Order", "Returns", "Sizing", "Press", "Other"] as const;

function fail(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  const to = process.env.STORE_CONTACT_EMAIL;
  if (!to || !isEmailConfigured()) {
    return fail(503, "The contact form isn't connected yet.");
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid request.");
  }
  if (typeof body.company === "string" && body.company.length > 0) {
    return fail(400, "Invalid request.");
  }

  const email = normaliseEmail(body.email);
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";
  const order = typeof body.order === "string" ? body.order.trim().slice(0, 40) : "";
  const topic = TOPICS.find((t) => t === body.topic) ?? "Other";

  if (!email) return fail(422, "Enter a valid email address.");
  if (!name) return fail(422, "Enter your name.");
  if (message.length < 10) return fail(422, "Tell us a little more (at least 10 characters).");

  if (!(await rateLimit("contact", 4, 10 * 60 * 1000))) {
    return fail(429, "Too many messages. Please try again in a few minutes.");
  }

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Topic: ${topic}`,
    order ? `Order: ${order}` : null,
    "",
    message,
  ].filter((l) => l !== null) as string[];

  try {
    await sendEmail({
      to,
      replyTo: email,
      subject: `[STRYDE contact] ${topic}${order ? ` · ${order}` : ""} — ${name}`,
      text: lines.join("\n"),
      html: `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(lines.join("\n"))}</pre>`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return fail(502, "We couldn't send your message. Please try again or email us directly.");
  }
}
