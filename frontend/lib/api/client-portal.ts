import { apiClient } from "@/lib/api/client";
import type { Invoice, InvoiceFilters } from "@/lib/api/invoices";
import type { Project, ProjectFilters } from "@/lib/api/projects";
import type { ProjectUpdate } from "@/lib/api/project-updates";
import type { Task, TaskFilters } from "@/lib/api/tasks";

export type ClientDashboard = {
  active_projects: number;
  project_progress_cards: ClientDashboardProject[];
  recent_updates: ClientDashboardUpdate[];
  pending_invoices: ClientDashboardInvoice[];
  upcoming_milestones: ClientDashboardMilestone[];
};

export type ClientDashboardProject = {
  id: string;
  title: string;
  status: string;
  deadline?: string | null;
  progress: number;
};

export type ClientDashboardUpdate = {
  id: string;
  project_id: string;
  project_title: string;
  title: string;
  content_preview: string;
  created_at: string;
};

export type ClientDashboardInvoice = {
  id: string;
  invoice_number: string;
  status: string;
  due_date?: string | null;
  total: number;
};

export type ClientDashboardMilestone = {
  id: string;
  project_id: string;
  title: string;
  type: string;
  due_date?: string | null;
  status: string;
};

export function getClientDashboard() {
  return apiClient<ClientDashboard>("/dashboard/client", {
    method: "GET",
  });
}

export function getClientProjects(filters: ProjectFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  const query = params.toString();

  return apiClient<Project[]>(`/projects${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function getClientProject(id: string) {
  return apiClient<Project>(`/projects/${id}`, {
    method: "GET",
  });
}

export function getClientProjectTasks(
  projectId: string,
  filters: TaskFilters = {},
) {
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

export function getClientProjectUpdates(projectId: string) {
  return apiClient<ProjectUpdate[]>(`/projects/${projectId}/updates`, {
    method: "GET",
  });
}

export function getClientInvoices(filters: InvoiceFilters = {}) {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }
  if (filters.project_id && filters.project_id !== "ALL") {
    params.set("project_id", filters.project_id);
  }

  const query = params.toString();

  return apiClient<Invoice[]>(`/invoices${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function getClientInvoice(id: string) {
  return apiClient<Invoice>(`/invoices/${id}`, {
    method: "GET",
  });
}
