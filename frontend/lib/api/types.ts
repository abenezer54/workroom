export type UserRole = "AGENCY_ADMIN" | "CLIENT";

export type CurrentUser = {
  id: string;
  agency_id?: string | null;
  client_id?: string | null;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AuthResponse = {
  user: CurrentUser;
  access_token: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: unknown;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiErrorBody;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse;
