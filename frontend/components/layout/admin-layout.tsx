"use client";

import type { ReactNode } from "react";

import { LoadingState } from "@/components/shared/loading-state";
import { AppShell } from "@/components/layout/app-shell";
import { useRequireRole } from "@/hooks/use-require-role";
import { ADMIN_ROLE } from "@/lib/auth/roles";

export function AdminLayout({ children }: { children: ReactNode }) {
  const auth = useRequireRole(ADMIN_ROLE);

  if (auth.isLoading || !auth.user || auth.user.role !== ADMIN_ROLE) {
    return (
      <div className="wr-app flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <LoadingState label="Checking workspace access" />
        </div>
      </div>
    );
  }

  return <AppShell variant="admin">{children}</AppShell>;
}
