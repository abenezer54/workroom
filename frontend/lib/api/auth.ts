import { apiClient } from "@/lib/api/client";

import type {
  AuthResponse,
  CurrentUser,
  GoogleAuthRequest,
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
    body: {
      name: request.name,
      email: request.email,
      password: request.password,
    },
  });
}

export function googleSignIn(request: GoogleAuthRequest) {
  return apiClient<AuthResponse>("/auth/google", {
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
