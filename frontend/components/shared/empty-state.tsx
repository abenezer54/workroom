import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

export function EmptyState({
  title,
  description,
  icon: Icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted-foreground">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      ) : null}
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
