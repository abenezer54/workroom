import Link from "next/link";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white text-black shadow-[0_1px_1px_rgba(0,0,0,0.24)]",
        className,
      )}
      aria-hidden="true"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 6.25v11.5h4.25V10.1h5.5v7.65H19V6.25"
          stroke="currentColor"
          strokeWidth="2.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.25 17.75h5.5"
          stroke="currentColor"
          strokeWidth="2.35"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

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
      aria-label="workroom home"
    >
      <LogoMark />
      <span className="text-xl font-semibold leading-none">workroom</span>
    </Link>
  );
}
