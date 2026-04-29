import { getStoredToken } from "@/lib/auth/token";

import type { ApiErrorBody, ApiResponse } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, error: ApiErrorBody) {
    super(error.message);
    this.name = "ApiError";
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = options.token ?? getStoredToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || payload?.success === false) {
    const error =
      payload && payload.success === false
        ? payload.error
        : {
            code: "REQUEST_ERROR",
            message: "The request could not be completed.",
          };
    throw new ApiError(response.status, error);
  }

  if (!payload || payload.success !== true) {
    throw new ApiError(response.status, {
      code: "INVALID_RESPONSE",
      message: "The API returned an unexpected response.",
    });
  }

  return payload.data;
}
