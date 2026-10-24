"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import clsx from "clsx";
import { SORT_OPTIONS } from "@/lib/shopify/sort";
import type { Filter } from "@/lib/shopify/types";

export default function CollectionFilters({ filters }: { filters: Filter[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const active = params.getAll("filter");

  function push(next: URLSearchParams) {
    next.delete("after");
    startTransition(() => router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  }

  function toggle(input: string) {
    const next = new URLSearchParams(params.toString());
    const values = next.getAll("filter");
    next.delete("filter");
    const updated = values.includes(input) ? values.filter((v) => v !== input) : [...values, input];
    updated.forEach((v) => next.append("filter", v));
    push(next);
  }

  const usable = filters.filter((f) => f.type === "LIST" && f.values.length > 0);

  return (
    <div
      className={clsx("flex flex-col gap-4 border-y border-line py-4 transition-opacity", pending && "opacity-60")}
      aria-busy={pending}
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {usable.map((filter) => (
            <fieldset key={filter.id}>
              <legend className="eyebrow text-mist mb-3">{filter.label}</legend>
              <div className="flex flex-wrap gap-2">
                {filter.values.map((value) => {
                  const on = active.includes(value.input);
                  return (
                    <button
                      key={value.id}
                      type="button"
                      aria-pressed={on}
                      disabled={!on && value.count === 0}
                      onClick={() => toggle(value.input)}
                      className={clsx(
                        "text-xs px-3 py-1.5 border transition-colors disabled:opacity-30",
                        on ? "border-ivory text-ivory" : "border-line text-mist hover:text-ivory"
                      )}
                    >
                      {value.label}
                      <span className="ml-1.5 text-mist/70 tabular-nums">{value.count}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
        <label className="flex items-center gap-2 eyebrow text-mist">
          Sort
          <select
            value={params.get("sort") ?? "featured"}
            onChange={(e) => {
              const next = new URLSearchParams(params.toString());
              if (e.target.value === "featured") next.delete("sort");
              else next.set("sort", e.target.value);
              push(next);
            }}
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
      {active.length > 0 && (
        <button
          type="button"
          className="self-start text-xs text-mist underline underline-offset-4 hover:text-ivory"
          onClick={() => {
            const next = new URLSearchParams(params.toString());
            next.delete("filter");
            push(next);
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
