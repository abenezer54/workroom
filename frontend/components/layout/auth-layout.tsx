import type { ReactNode } from "react";

import { AppLogo } from "@/components/shared/app-logo";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="wr-app flex min-h-screen bg-background">
      <section className="relative hidden flex-1 overflow-hidden border-r border-white/[0.055] bg-[#0a0a0a] px-10 py-10 lg:flex lg:flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[-1px] z-0 h-full w-full"
        >
          <div
            className="absolute inset-x-[-18%] bottom-0 h-full opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 100%, rgba(185, 198, 210, 0.38) 0%, rgba(112, 124, 134, 0.24) 34%, rgba(38, 44, 49, 0.12) 58%, transparent 78%), radial-gradient(ellipse at 16% 96%, rgba(105, 117, 126, 0.24) 0%, rgba(44, 51, 57, 0.14) 42%, transparent 70%), radial-gradient(ellipse at 84% 96%, rgba(105, 117, 126, 0.24) 0%, rgba(44, 51, 57, 0.14) 42%, transparent 70%), linear-gradient(180deg, transparent 0%, rgba(8, 9, 10, 0.18) 40%, rgba(86, 96, 105, 0.2) 78%, rgba(168, 181, 194, 0.24) 100%)",
              maskImage:
                "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex h-full flex-col">
          <AppLogo className="text-white" />
          <div className="mt-auto max-w-[480px] space-y-4 pb-12">
            <h1 className="text-3xl font-medium leading-[1.08] text-white sm:text-4xl lg:text-5xl">
              The client workspace for agencies and consultants.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
              Plan projects, share updates, track invoices, and give every client
              a clear portal.
            </p>
          </div>
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[360px]">
          <div className="mb-8 lg:hidden">
            <AppLogo />
          </div>
          <div className="mb-8 space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-medium text-foreground">{title}</h1>
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
