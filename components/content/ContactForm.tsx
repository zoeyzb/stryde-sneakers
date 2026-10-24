"use client";

import { useState } from "react";

const TOPICS = ["Order", "Returns", "Sizing", "Press", "Other"];

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | { error: string }>("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => null)) as { ok: boolean; error?: string } | null;
      setStatus(res.ok && json?.ok ? "sent" : { error: json?.error ?? "We couldn't send your message." });
    } catch {
      setStatus({ error: "We couldn't reach the server. Please try again." });
    }
  }

  if (status === "sent") {
    return (
      <p role="status" className="border border-line p-6 text-sm">
        Thanks — your message was sent. We&apos;ll reply to the email you provided.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs text-mist">
          Name
          <input name="name" required maxLength={120} autoComplete="name" className="field" />
        </label>
        <label className="grid gap-2 text-xs text-mist">
          Email
          <input name="email" type="email" required maxLength={254} autoComplete="email" className="field" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs text-mist">
          Topic
          <select name="topic" className="field bg-ink" defaultValue="Order">
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-xs text-mist">
          Order number (optional)
          <input name="order" maxLength={40} className="field" placeholder="#1001" />
        </label>
      </div>
      <label className="grid gap-2 text-xs text-mist">
        Message
        <textarea name="message" required minLength={10} maxLength={5000} rows={6} className="field h-auto py-3" />
      </label>
      <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      {typeof status === "object" && (
        <p role="alert" className="text-sm text-red-300">
          {status.error}
        </p>
      )}
      <button type="submit" className="btn-primary justify-self-start" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
