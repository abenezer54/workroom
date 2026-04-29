import { apiClient } from "@/lib/api/client";

export type AdminDashboard = {
  summary_cards: AdminDashboardSummaryCards;
  recent_projects: AdminDashboardProject[];
  upcoming_deadlines: AdminDashboardDeadline[];
  recent_updates: AdminDashboardProjectUpdate[];
  invoice_overview: AdminDashboardInvoiceOverview;
};

export type AdminDashboardSummaryCards = {
  total_clients: number;
  active_projects: number;
  pending_invoices: number;
  completed_tasks: number;
};

export type AdminDashboardProject = {
  id: string;
  title: string;
  client_name: string;
  status: string;
  deadline?: string | null;
  progress: number;
};

export type AdminDashboardDeadline = {
  id: string;
  title: string;
  type: "PROJECT" | "TASK" | string;
  due_date?: string | null;
  status: string;
};

export type AdminDashboardProjectUpdate = {
  id: string;
  project_id: string;
  project_title: string;
  title: string;
  content_preview: string;
  created_at: string;
};

export type AdminDashboardInvoiceOverview = {
  total_outstanding: number;
  paid_total: number;
  overdue_total: number;
  draft_count: number;
  sent_count: number;
  paid_count: number;
  overdue_count: number;
};

export function getAdminDashboard() {
  return apiClient<AdminDashboard>("/dashboard/admin", {
    method: "GET",
  });
}
