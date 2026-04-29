import { apiClient } from "@/lib/api/client";

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type Task = {
  id: string;
  agency_id: string;
  project_id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskFilters = {
  status?: TaskStatus | "ALL";
  priority?: TaskPriority | "ALL";
};

export type TaskPayload = {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
};

export function getProjectTasks(projectId: string, filters: TaskFilters = {}) {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.priority && filters.priority !== "ALL") {
    params.set("priority", filters.priority);
  }

  const query = params.toString();

  return apiClient<Task[]>(
    `/projects/${projectId}/tasks${query ? `?${query}` : ""}`,
    {
      method: "GET",
    },
  );
}

export function createTask(projectId: string, payload: TaskPayload) {
  return apiClient<Task>(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: normalizeTaskPayload(payload),
  });
}

export function updateTask(id: string, payload: TaskPayload) {
  return apiClient<Task>(`/tasks/${id}`, {
    method: "PATCH",
    body: normalizeTaskPayload(payload),
  });
}

export function deleteTask(id: string) {
  return apiClient<null>(`/tasks/${id}`, {
    method: "DELETE",
  });
}

function normalizeTaskPayload(payload: TaskPayload) {
  return {
    title: payload.title.trim(),
    description: emptyToNull(payload.description),
    status: payload.status,
    priority: payload.priority,
    due_date: emptyToNull(payload.due_date),
  };
}

function emptyToNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
