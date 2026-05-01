import type { ReactNode } from "react";
import Link from "next/link";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wr-app min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/[0.075] bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <AppLogo variant="dark" />
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-9 text-sm font-medium text-muted-foreground md:flex"
          >
            <Link className="transition-colors hover:text-foreground" href="#product">
              Product
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#features">
              Features
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#workflow">
              Workflow
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#portal">
              Portal
            </Link>
          </nav>
          <nav className="flex items-center gap-3" aria-label="Account links">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="hidden rounded-full border-white/80 bg-[#f7f8f8] px-4 text-background hover:bg-text-secondary sm:inline-flex"
            >
              <Link href="/login">View Demo</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
