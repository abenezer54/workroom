import { apiClient } from "@/lib/api/client";

export const CLIENT_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export type Client = {
  id: string;
  agency_id: string;
  name: string;
  email: string;
  company_name?: string | null;
  phone?: string | null;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
};

export type ClientFilters = {
  search?: string;
  status?: ClientStatus | "ALL";
};

export type ClientPayload = {
  name: string;
  email: string;
  company_name?: string | null;
  phone?: string | null;
  status: ClientStatus;
};

export function getClients(filters: ClientFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  const query = params.toString();

  return apiClient<Client[]>(`/clients${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function createClient(payload: ClientPayload) {
  return apiClient<Client>("/clients", {
    method: "POST",
    body: normalizeClientPayload(payload),
  });
}

export function updateClient(id: string, payload: ClientPayload) {
  return apiClient<Client>(`/clients/${id}`, {
    method: "PATCH",
    body: normalizeClientPayload(payload),
  });
}

export function archiveClient(id: string) {
  return apiClient<null>(`/clients/${id}`, {
    method: "DELETE",
  });
}

function normalizeClientPayload(payload: ClientPayload) {
  return {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    company_name: emptyToNull(payload.company_name),
    phone: emptyToNull(payload.phone),
    status: payload.status,
  };
}

function emptyToNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
