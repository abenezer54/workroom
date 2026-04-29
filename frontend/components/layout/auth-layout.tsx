import type { ReactNode } from "react";

import { AppLogo } from "@/components/shared/app-logo";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen bg-background">
      <section className="hidden flex-1 border-r border-border bg-muted px-10 py-8 lg:flex lg:flex-col">
        <AppLogo />
        <div className="mt-auto max-w-md space-y-4 pb-8">
          <p className="text-sm font-medium text-accent">Client work, organized</p>
          <h1 className="text-3xl font-semibold leading-tight text-foreground">
            A calm workspace for project updates, tasks, and invoices.
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Workroom keeps agency operations and client visibility in one
            focused portal.
          </p>
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
