import type { ReactNode } from "react";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <AppLogo />
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/login">Log in</a>
            </Button>
            <Button asChild size="sm">
              <a href="/register">Create account</a>
            </Button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
