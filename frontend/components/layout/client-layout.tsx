"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { useRequireRole } from "@/hooks/use-require-role";
import { CLIENT_ROLE } from "@/lib/auth/roles";

export function ClientLayout({ children }: { children: ReactNode }) {
  const auth = useRequireRole(CLIENT_ROLE);

  if (auth.isLoading || !auth.user || auth.user.role !== CLIENT_ROLE) {
    return (
      <div className="min-h-screen bg-background p-6">
        <LoadingState label="Checking portal access" />
      </div>
    );
  }

  return <AppShell variant="client">{children}</AppShell>;
}
