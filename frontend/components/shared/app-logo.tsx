import Link from "next/link";

import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3 text-foreground", className)}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-sm font-semibold">
        W
      </span>
      <span className="text-base font-semibold">Workroom</span>
    </Link>
  );
}
