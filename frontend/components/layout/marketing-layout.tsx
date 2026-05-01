import type { ReactNode } from "react";
import Link from "next/link";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wr-app min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/[0.075] bg-background/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between">
          <AppLogo variant="dark" />
          <div className="flex items-center gap-5">
            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-8 text-sm font-normal text-muted-foreground md:flex"
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
            <span className="hidden h-5 w-px bg-white/[0.14] md:block" aria-hidden="true" />
            <nav className="flex items-center gap-3" aria-label="Account links">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="font-normal text-muted-foreground"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden rounded-full border-white/80 bg-[#f7f8f8] px-4 font-normal text-background hover:bg-text-secondary sm:inline-flex"
              >
                <Link href="/login">View Demo</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
