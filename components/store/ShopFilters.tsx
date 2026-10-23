"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import clsx from "clsx";
import { SORT_OPTIONS } from "@/lib/shopify/sort";

export default function ShopFilters({ productTypes }: { productTypes: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("after");
    startTransition(() => router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  }

  const type = params.get("type");
  const availability = params.get("availability");

  return (
    <div className={clsx("flex flex-col gap-6 transition-opacity", pending && "opacity-60")} aria-busy={pending}>
      <form
        id="search"
        role="search"
        className="flex gap-2 max-w-xl scroll-mt-24"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q");
          update({ q: typeof q === "string" && q.trim() ? q.trim() : null });
        }}
      >
        <label htmlFor="shop-search" className="sr-only">
          Search products
        </label>
        <input
          id="shop-search"
          name="q"
          type="search"
          defaultValue={params.get("q") ?? ""}
          placeholder="Search tees, hoodies, jackets…"
          className="field"
        />
        <button type="submit" className="btn-ghost shrink-0">
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
        {productTypes.length > 0 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
            {[null, ...productTypes].map((t) => (
              <button
                key={t ?? "all"}
                type="button"
                aria-pressed={type === t || (!t && !type)}
                onClick={() => update({ type: t })}
                className={clsx(
                  "eyebrow px-3 py-2 border transition-colors",
                  type === t || (!t && !type)
                    ? "border-ivory text-ivory"
                    : "border-line text-mist hover:text-ivory"
                )}
              >
                {t ?? "All"}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 eyebrow text-mist">
            Availability
            <select
              value={availability ?? ""}
              onChange={(e) => update({ availability: e.target.value || null })}
              className="bg-ink border border-line text-ivory text-xs tracking-normal normal-case font-sans h-9 px-2"
            >
              <option value="">All</option>
              <option value="in-stock">In stock</option>
              <option value="sold-out">Sold out</option>
            </select>
          </label>
          <label className="flex items-center gap-2 eyebrow text-mist">
            Sort
            <select
              value={params.get("sort") ?? "featured"}
              onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })}
              className="bg-ink border border-line text-ivory text-xs tracking-normal normal-case font-sans h-9 px-2"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
