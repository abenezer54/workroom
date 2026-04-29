import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatsCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatsCard({
  label,
  value,
  helper,
  icon: Icon,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 p-5 transition-colors hover:bg-surface-2/35",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        {helper ? (
          <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
        ) : null}
      </div>
      {Icon ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-accent-border bg-accent-soft text-accent">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
}
