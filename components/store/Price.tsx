import clsx from "clsx";
import { formatMoney } from "@/lib/format";
import type { Money } from "@/lib/shopify/types";

export default function Price({
  min,
  max,
  compareAt,
  className,
}: {
  min: Money;
  max?: Money;
  compareAt?: Money | null;
  className?: string;
}) {
  const ranged = max && Number(max.amount) > Number(min.amount);
  const onSale = compareAt && Number(compareAt.amount) > Number((max ?? min).amount);
  return (
    <p className={clsx("tabular-nums", className)}>
      {ranged ? `From ${formatMoney(min)}` : formatMoney(min)}
      {onSale && (
        <s className="ml-2 text-mist" aria-label={`Was ${formatMoney(compareAt)}`}>
          {formatMoney(compareAt)}
        </s>
      )}
    </p>
  );
}
