import type { ReactNode } from "react";

import { AppLogo } from "@/components/shared/app-logo";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="linear-app flex min-h-screen bg-background">
      <section className="linear-sidebar hidden flex-1 border-r border-sidebar-border bg-sidebar px-10 py-8 lg:flex lg:flex-col">
        <AppLogo variant="dark" />
        <div className="mt-auto max-w-md space-y-4 pb-8">
          <p className="text-sm font-medium text-sidebar-muted">
            Client work, organized
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-sidebar-foreground">
            A calm workspace for project updates, tasks, and invoices.
          </h1>
          <p className="text-sm leading-6 text-sidebar-muted">
            Workroom keeps agency operations and client visibility in one
            focused portal.
          </p>
          <div className="grid gap-2 pt-4">
            <div className="h-2 w-36 rounded-full bg-surface-4" />
            <div className="h-2 w-52 rounded-full bg-surface-3" />
            <div className="h-2 w-28 rounded-full bg-accent/80" />
          </div>
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <AppLogo />
          </div>
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
