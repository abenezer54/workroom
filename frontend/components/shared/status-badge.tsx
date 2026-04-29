import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

const success = new Set(["ACTIVE", "COMPLETED", "PAID", "DONE"]);
const warning = new Set(["IN_PROGRESS", "SENT", "MEDIUM", "REVIEW"]);
const danger = new Set([
  "BLOCKED",
  "CANCELED",
  "CANCELLED",
  "HIGH",
  "OVERDUE",
  "URGENT",
]);
const info = new Set(["PLANNING", "LOW", "CLIENT"]);

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = success.has(status)
    ? "success"
    : warning.has(status)
      ? "warning"
      : danger.has(status)
        ? "danger"
        : info.has(status)
          ? "info"
          : "neutral";

  return (
    <Badge variant={variant}>
      {status
        .toLowerCase()
        .split("_")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ")}
    </Badge>
  );
}
