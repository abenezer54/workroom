import Link from "next/link";

import { cn } from "@/lib/utils";

export function AppLogo({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-3",
        isDark ? "text-sidebar-foreground" : "text-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold shadow-[0_1px_1px_rgba(0,0,0,0.32)]",
          isDark
            ? "border-sidebar-border bg-surface-2 text-sidebar-foreground"
            : "border-primary bg-primary text-primary-foreground",
        )}
      >
        W
      </span>
      <span className="text-base font-semibold">Workroom</span>
    </Link>
  );
}
