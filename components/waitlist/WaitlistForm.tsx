"use client";

import { useId, useState } from "react";
import clsx from "clsx";

type Props = {
  source: "next-drop" | "restock";
  productHandle?: string;
  productTitle?: string;
  compact?: boolean;
  className?: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; outcome: "created" | "updated" | "duplicate" }
  | { kind: "error"; message: string };

const SUCCESS = {
  "next-drop": {
    created: "You're on the list. We'll email you when the next drop opens.",
    updated: "You're on the list. We'll email you when the next drop opens.",
    duplicate: "You're already on the list — nothing more to do.",
  },
  restock: {
    created: "Saved. We'll email you once if it becomes available again.",
    updated: "Saved. We'll email you once if it becomes available again.",
    duplicate: "You've already asked to be notified for this piece.",
  },
} as const;

export default function WaitlistForm({ source, productHandle, productTitle, compact, className }: Props) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const requireConsent = source === "next-drop";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          productHandle,
          marketingConsent: consent,
          company: form.get("company"),
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok: true; outcome: "created" | "updated" | "duplicate" }
        | { ok: false; error: string }
        | null;
      if (res.ok && json?.ok) setStatus({ kind: "done", outcome: json.outcome });
      else setStatus({ kind: "error", message: (json && !json.ok && json.error) || "We couldn't save your email. Please try again." });
    } catch {
      setStatus({ kind: "error", message: "We couldn't reach the server. Please try again." });
    }
  }

  if (status.kind === "done") {
    return (
      <p role="status" className={clsx("text-sm text-ivory/90 border border-line px-4 py-4", className)}>
        {SUCCESS[source][status.outcome]}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={clsx("flex flex-col gap-3", className)} noValidate={false}>
      <div className={clsx("flex gap-2", compact ? "flex-row" : "flex-col sm:flex-row")}>
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
          aria-describedby={`${id}-help`}
        />
        <button
          type="submit"
          className="btn-primary shrink-0"
          disabled={status.kind === "sending" || (requireConsent && !consent)}
        >
          {status.kind === "sending" ? "Saving…" : source === "restock" ? "Notify me" : "Join the list"}
        </button>
      </div>
      <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex items-start gap-3 text-xs leading-5 text-mist cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-4 accent-ivory shrink-0"
          required={requireConsent}
        />
        <span>
          {requireConsent
            ? "Email me about STRYDE drops and news. Unsubscribe at any time."
            : "Also email me about future STRYDE drops (optional)."}{" "}
          See our{" "}
          <a href="/privacy" className="underline underline-offset-4">
            privacy policy
          </a>
          .
        </span>
      </label>
      <p id={`${id}-help`} className="sr-only">
        {source === "restock"
          ? `We'll send one email if ${productTitle ?? "this piece"} becomes available again.`
          : "We'll email you when the next STRYDE drop opens."}
      </p>
      {status.kind === "error" && (
        <p role="alert" className="text-sm text-red-300">
          {status.message}
        </p>
      )}
    </form>
  );
}
