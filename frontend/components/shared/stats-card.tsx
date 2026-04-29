import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type StatsCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: LucideIcon;
};

export function StatsCard({ label, value, helper, icon: Icon }: StatsCardProps) {
  return (
    <Card className="transition-colors hover:border-input">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          {helper ? (
            <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
          ) : null}
        </div>
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-accent-border bg-accent-soft text-accent">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
