import clsx from "clsx";

export default function SoldOutLabel({ className, large }: { className?: string; large?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 bg-ink/80 backdrop-blur-sm border border-ivory/25 text-ivory font-display uppercase",
        large ? "px-4 py-2 text-[11px] tracking-[0.4em]" : "px-2.5 py-1 text-[9px] tracking-[0.32em]",
        className
      )}
    >
      <span aria-hidden className="size-1 rounded-full bg-ivory/70" />
      Sold out
    </span>
  );
}
