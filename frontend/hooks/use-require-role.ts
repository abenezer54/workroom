"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { UserRole } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { dashboardPathForRole } from "@/lib/auth/roles";

export function useRequireRole(role: UserRole) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    if (!auth.user) {
      router.replace("/login");
      return;
    }

    if (auth.user.role !== role) {
      router.replace(dashboardPathForRole(auth.user.role));
    }
  }, [auth.isLoading, auth.user, role, router]);

  return auth;
}
