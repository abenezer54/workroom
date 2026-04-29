import { apiClient } from "@/lib/api/client";

export type ProjectUpdate = {
  id: string;
  agency_id: string;
  project_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type AgencyProjectUpdate = ProjectUpdate & {
  project_title: string;
};

export type ProjectUpdatePayload = {
  title: string;
  content: string;
};

export function getProjectUpdates(projectId: string) {
  return apiClient<ProjectUpdate[]>(`/projects/${projectId}/updates`, {
    method: "GET",
  });
}

export function getUpdates(filters: { project_id?: string | "ALL" } = {}) {
  const params = new URLSearchParams();

  if (filters.project_id && filters.project_id !== "ALL") {
    params.set("project_id", filters.project_id);
  }

  const query = params.toString();

  return apiClient<AgencyProjectUpdate[]>(`/updates${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function createProjectUpdate(
  projectId: string,
  payload: ProjectUpdatePayload,
) {
  return apiClient<ProjectUpdate>(`/projects/${projectId}/updates`, {
    method: "POST",
    body: {
      title: payload.title.trim(),
      content: payload.content.trim(),
    },
  });
}
