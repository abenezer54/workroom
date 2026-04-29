import { apiClient } from "@/lib/api/client";

import type {
  AuthResponse,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
} from "./types";

export function login(request: LoginRequest) {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: request,
  });
}

export function register(request: RegisterRequest) {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: request,
  });
}

export function me(token?: string | null) {
  return apiClient<CurrentUser>("/auth/me", {
    method: "GET",
    token,
  });
}
