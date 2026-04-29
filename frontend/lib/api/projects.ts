import { apiClient } from "@/lib/api/client";

export const PROJECT_STATUSES = [
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "ON_HOLD",
  "ARCHIVED",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type Project = {
  id: string;
  agency_id: string;
  client_id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  start_date?: string | null;
  deadline?: string | null;
  budget: number;
  progress: number;
  created_at: string;
  updated_at: string;
};

export type ProjectFilters = {
  search?: string;
  status?: ProjectStatus | "ALL";
  client_id?: string | "ALL";
};

export type ProjectPayload = {
  client_id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  start_date?: string | null;
  deadline?: string | null;
  budget: number;
  progress: number;
};

export function getProjects(filters: ProjectFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.client_id && filters.client_id !== "ALL") {
    params.set("client_id", filters.client_id);
  }

  const query = params.toString();

  return apiClient<Project[]>(`/projects${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function getProject(id: string) {
  return apiClient<Project>(`/projects/${id}`, {
    method: "GET",
  });
}

export function createProject(payload: ProjectPayload) {
  return apiClient<Project>("/projects", {
    method: "POST",
    body: normalizeProjectPayload(payload),
  });
}

export function updateProject(id: string, payload: ProjectPayload) {
  return apiClient<Project>(`/projects/${id}`, {
    method: "PATCH",
    body: normalizeProjectPayload(payload),
  });
}

export function archiveProject(id: string) {
  return apiClient<null>(`/projects/${id}`, {
    method: "DELETE",
  });
}

function normalizeProjectPayload(payload: ProjectPayload) {
  return {
    client_id: payload.client_id,
    title: payload.title.trim(),
    description: emptyToNull(payload.description),
    status: payload.status,
    start_date: emptyToNull(payload.start_date),
    deadline: emptyToNull(payload.deadline),
    budget: payload.budget,
    progress: payload.progress,
  };
}

function emptyToNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
