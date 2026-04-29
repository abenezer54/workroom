import { apiClient } from "@/lib/api/client";

export const INVOICE_STATUSES = [
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "CANCELLED",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
  updated_at: string;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  agency_id: string;
  client_id: string;
  project_id?: string | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  items?: InvoiceItem[];
  created_at: string;
  updated_at: string;
};

export type InvoiceFilters = {
  status?: InvoiceStatus | "ALL";
  client_id?: string | "ALL";
  project_id?: string | "ALL";
};

export type InvoiceItemPayload = {
  description: string;
  quantity: number;
  unit_price: number;
};

export type InvoicePayload = {
  client_id: string;
  project_id?: string | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string | null;
  tax: number;
  discount: number;
  items: InvoiceItemPayload[];
};

export function getInvoices(filters: InvoiceFilters = {}) {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }
  if (filters.client_id && filters.client_id !== "ALL") {
    params.set("client_id", filters.client_id);
  }
  if (filters.project_id && filters.project_id !== "ALL") {
    params.set("project_id", filters.project_id);
  }

  const query = params.toString();

  return apiClient<Invoice[]>(`/invoices${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function getInvoice(id: string) {
  return apiClient<Invoice>(`/invoices/${id}`, {
    method: "GET",
  });
}

export function createInvoice(payload: InvoicePayload) {
  return apiClient<Invoice>("/invoices", {
    method: "POST",
    body: normalizeInvoicePayload(payload),
  });
}

export function updateInvoice(id: string, payload: InvoicePayload) {
  return apiClient<Invoice>(`/invoices/${id}`, {
    method: "PATCH",
    body: normalizeInvoicePayload(payload),
  });
}

export function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  return apiClient<Invoice>(`/invoices/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function cancelInvoice(id: string) {
  return apiClient<null>(`/invoices/${id}`, {
    method: "DELETE",
  });
}

function normalizeInvoicePayload(payload: InvoicePayload) {
  return {
    client_id: payload.client_id,
    project_id: emptyToNull(payload.project_id),
    status: payload.status,
    issue_date: payload.issue_date,
    due_date: emptyToNull(payload.due_date),
    tax: payload.tax,
    discount: payload.discount,
    items: payload.items.map((item) => ({
      description: item.description.trim(),
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  };
}

function emptyToNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
