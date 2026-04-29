"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Edit2, Eye, Plus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { CancelInvoiceDialog } from "@/components/invoices/cancel-invoice-dialog";
import { InvoiceDetailModal } from "@/components/invoices/invoice-detail-modal";
import { InvoiceFormModal } from "@/components/invoices/invoice-form-modal";
import { InvoiceStatusModal } from "@/components/invoices/invoice-status-modal";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import { getClients, type Client } from "@/lib/api/clients";
import {
  cancelInvoice,
  createInvoice,
  getInvoice,
  getInvoices,
  INVOICE_STATUSES,
  updateInvoice,
  updateInvoiceStatus,
  type Invoice,
  type InvoicePayload,
  type InvoiceStatus,
} from "@/lib/api/invoices";
import { getProjects } from "@/lib/api/projects";
import type { InvoiceFormValues } from "@/lib/validations/invoice";

type StatusFilter = InvoiceStatus | "ALL";

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [clientId, setClientId] = useState("ALL");
  const [projectId, setProjectId] = useState("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [detailInvoiceId, setDetailInvoiceId] = useState<string | null>(null);
  const [statusInvoice, setStatusInvoice] = useState<Invoice | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Invoice | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const invoicesQuery = useQuery({
    queryKey: ["invoices", { clientId, projectId, status }],
    queryFn: () =>
      getInvoices({
        client_id: clientId,
        project_id: projectId,
        status,
      }),
  });

  const clientsQuery = useQuery({
    queryKey: ["clients", "invoice-options"],
    queryFn: () => getClients(),
  });

  const projectsQuery = useQuery({
    queryKey: ["projects", "invoice-options"],
    queryFn: () => getProjects(),
  });

  const editInvoiceQuery = useQuery({
    queryKey: ["invoice", editInvoiceId],
    queryFn: () => getInvoice(editInvoiceId ?? ""),
    enabled: Boolean(editInvoiceId),
  });

  const detailInvoiceQuery = useQuery({
    queryKey: ["invoice", detailInvoiceId],
    queryFn: () => getInvoice(detailInvoiceId ?? ""),
    enabled: Boolean(detailInvoiceId),
  });

  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const clientMap = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients],
  );
  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );
  const activeClients = clients.filter((client) => client.status !== "ARCHIVED");

  const saveInvoiceMutation = useMutation({
    mutationFn: (values: InvoicePayload) =>
      editInvoiceId ? updateInvoice(editInvoiceId, values) : createInvoice(values),
    onSuccess(invoice) {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", invoice.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setNotice(
        editInvoiceId
          ? `${invoice.invoice_number} was updated.`
          : `${invoice.invoice_number} was created.`,
      );
      setIsFormOpen(false);
      setEditInvoiceId(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ invoice, nextStatus }: { invoice: Invoice; nextStatus: InvoiceStatus }) =>
      updateInvoiceStatus(invoice.id, nextStatus),
    onSuccess(invoice) {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", invoice.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setNotice(`${invoice.invoice_number} status was updated.`);
      setStatusInvoice(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (invoice: Invoice) => cancelInvoice(invoice.id),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setNotice(`${cancelTarget?.invoice_number ?? "Invoice"} was cancelled.`);
      setCancelTarget(null);
    },
  });

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoice_number",
        header: "Invoice",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">
              {row.original.invoice_number}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {clientLabel(clientMap.get(row.original.client_id))}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "project_id",
        header: "Project",
        cell: ({ row }) =>
          row.original.project_id
            ? projectMap.get(row.original.project_id)?.title ?? "Unknown project"
            : "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "issue_date",
        header: "Issue date",
        cell: ({ row }) => formatDate(row.original.issue_date),
      },
      {
        accessorKey: "due_date",
        header: "Due date",
        cell: ({ row }) => formatDate(row.original.due_date),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => formatCurrency(row.original.total),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                setNotice(null);
                setDetailInvoiceId(row.original.id);
              }}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              View
            </Button>
            <Button
              onClick={() => {
                setNotice(null);
                setEditInvoiceId(row.original.id);
                setIsFormOpen(true);
              }}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Edit2 className="h-4 w-4" aria-hidden="true" />
              Edit
            </Button>
            <Button
              onClick={() => {
                setNotice(null);
                setStatusInvoice(row.original);
              }}
              size="sm"
              type="button"
              variant="secondary"
            >
              Status
            </Button>
            <Button
              disabled={row.original.status === "CANCELLED"}
              onClick={() => {
                setNotice(null);
                setCancelTarget(row.original);
              }}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Ban className="h-4 w-4" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        ),
      },
    ],
    [clientMap, projectMap],
  );

  const invoices = invoicesQuery.data ?? [];
  const isInitialLoading =
    invoicesQuery.isLoading || clientsQuery.isLoading || projectsQuery.isLoading;
  const loadError = invoicesQuery.error ?? clientsQuery.error ?? projectsQuery.error;

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button
            onClick={() => {
              setNotice(null);
              setEditInvoiceId(null);
              setIsFormOpen(true);
            }}
            type="button"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Invoice
          </Button>
        }
        description="Manage billing, invoice status, and client balances."
        title="Invoices"
      />

      {notice ? (
        <div className="rounded-md border border-success-border bg-success-soft px-4 py-3 text-sm text-success">
          {notice}
        </div>
      ) : null}

      <Card>
        <CardContent className="grid gap-4 p-5 lg:grid-cols-3">
          <FilterSelect
            id="invoice-status"
            label="Status"
            onChange={(value) => setStatus(value as StatusFilter)}
            value={status}
          >
            <option value="ALL">All statuses</option>
            {INVOICE_STATUSES.map((item) => (
              <option key={item} value={item}>
                {formatStatus(item)}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            id="invoice-client"
            label="Client"
            onChange={setClientId}
            value={clientId}
          >
            <option value="ALL">All clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {clientLabel(client)}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            id="invoice-project"
            label="Project"
            onChange={setProjectId}
            value={projectId}
          >
            <option value="ALL">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </FilterSelect>
        </CardContent>
      </Card>

      {isInitialLoading ? (
        <LoadingState label="Loading invoices" />
      ) : loadError ? (
        <div className="space-y-4">
          <ErrorState
            title="Invoices could not load"
            message={
              errorMessage(loadError) ??
              "The invoices request could not be completed."
            }
          />
          <Button
            onClick={() => {
              invoicesQuery.refetch();
              clientsQuery.refetch();
              projectsQuery.refetch();
            }}
            type="button"
            variant="secondary"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : invoices.length === 0 &&
        status === "ALL" &&
        clientId === "ALL" &&
        projectId === "ALL" ? (
        <EmptyState
          title="No invoices yet"
          description="Create your first invoice once client work is ready for billing."
        />
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          emptyDescription="Try adjusting the status, client, or project filters."
          emptyTitle="No invoices match these filters"
        />
      )}

      <InvoiceFormModal
        activeClients={activeClients}
        error={errorMessage(saveInvoiceMutation.error)}
        invoice={editInvoiceQuery.data ?? null}
        isLoading={Boolean(editInvoiceId) && editInvoiceQuery.isLoading}
        isOpen={isFormOpen}
        isSubmitting={saveInvoiceMutation.isPending}
        projects={projects}
        onClose={() => {
          if (saveInvoiceMutation.isPending) {
            return;
          }
          saveInvoiceMutation.reset();
          setIsFormOpen(false);
          setEditInvoiceId(null);
        }}
        onSubmit={(values) => {
          setNotice(null);
          saveInvoiceMutation.mutate(toInvoicePayload(values));
        }}
      />

      <InvoiceDetailModal
        client={
          detailInvoiceQuery.data
            ? clientMap.get(detailInvoiceQuery.data.client_id)
            : undefined
        }
        invoice={detailInvoiceQuery.data ?? null}
        onClose={() => setDetailInvoiceId(null)}
        project={
          detailInvoiceQuery.data?.project_id
            ? projectMap.get(detailInvoiceQuery.data.project_id)
            : undefined
        }
      />

      <InvoiceStatusModal
        error={errorMessage(statusMutation.error)}
        invoice={statusInvoice}
        isSubmitting={statusMutation.isPending}
        onClose={() => {
          if (statusMutation.isPending) {
            return;
          }
          statusMutation.reset();
          setStatusInvoice(null);
        }}
        onSubmit={(nextStatus) => {
          if (statusInvoice) {
            setNotice(null);
            statusMutation.mutate({ invoice: statusInvoice, nextStatus });
          }
        }}
      />

      <CancelInvoiceDialog
        error={errorMessage(cancelMutation.error)}
        invoice={cancelTarget}
        isCancelling={cancelMutation.isPending}
        onCancel={() => {
          if (cancelMutation.isPending) {
            return;
          }
          cancelMutation.reset();
          setCancelTarget(null);
        }}
        onConfirm={() => {
          if (cancelTarget) {
            setNotice(null);
            cancelMutation.mutate(cancelTarget);
          }
        }}
      />
    </div>
  );
}

function FilterSelect({
  children,
  id,
  label,
  onChange,
  value,
}: {
  children: React.ReactNode;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </Select>
    </div>
  );
}

function toInvoicePayload(values: InvoiceFormValues): InvoicePayload {
  return {
    client_id: values.client_id,
    project_id: values.project_id,
    status: values.status,
    issue_date: values.issue_date,
    due_date: values.due_date,
    tax: Math.round(values.tax * 100),
    discount: Math.round(values.discount * 100),
    items: values.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: Math.round(item.unit_price * 100),
    })),
  };
}

function clientLabel(client?: Client) {
  if (!client) {
    return "Unknown client";
  }
  return client.company_name ? `${client.name} · ${client.company_name}` : client.name;
}

function errorMessage(error: unknown) {
  if (!error) {
    return null;
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  return "The request could not be completed.";
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No date";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
