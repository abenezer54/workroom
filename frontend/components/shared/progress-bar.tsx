import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  label?: string;
  className?: string;
};

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="font-medium text-foreground">{normalizedValue}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-md bg-muted">
        <div
          className="h-full rounded-md bg-accent"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
