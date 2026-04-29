import type { CurrentUser, UserRole } from "@/lib/api/types";

export const ADMIN_ROLE: UserRole = "AGENCY_ADMIN";
export const CLIENT_ROLE: UserRole = "CLIENT";

export function isAgencyAdmin(user: CurrentUser | null | undefined) {
  return user?.role === ADMIN_ROLE;
}

export function isClient(user: CurrentUser | null | undefined) {
  return user?.role === CLIENT_ROLE;
}

export function dashboardPathForRole(role: UserRole) {
  return role === ADMIN_ROLE ? "/dashboard" : "/client";
}
