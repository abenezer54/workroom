"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye, FileText } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  errorMessage,
  formatCurrency,
  formatDate,
  PortalSectionError,
} from "@/components/client-portal/portal-helpers";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  getClientInvoices,
  getClientProjects,
} from "@/lib/api/client-portal";
import {
  INVOICE_STATUSES,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/api/invoices";
import type { Project } from "@/lib/api/projects";
import type { ColumnDef } from "@tanstack/react-table";

export default function ClientInvoicesPage() {
  const [status, setStatus] = useState<InvoiceStatus | "ALL">("ALL");
  const [projectId, setProjectId] = useState("ALL");

  const invoicesQuery = useQuery({
    queryKey: ["client-invoices", { status, projectId }],
    queryFn: () => getClientInvoices({ status, project_id: projectId }),
  });

  const projectsQuery = useQuery({
    queryKey: ["client-projects", "invoice-options"],
    queryFn: () => getClientProjects(),
  });

  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const invoices = invoicesQuery.data ?? [];
  const isLoading = invoicesQuery.isLoading || projectsQuery.isLoading;
  const loadError = invoicesQuery.error ?? projectsQuery.error;

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoice_number",
        header: "Invoice",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.invoice_number}
          </span>
        ),
      },
      {
        header: "Project",
        cell: ({ row }) => projectTitle(projectMap.get(row.original.project_id ?? "")),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "issue_date",
        header: "Issue Date",
        cell: ({ row }) => formatDate(row.original.issue_date),
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }) => formatDate(row.original.due_date),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-medium">{formatCurrency(row.original.total)}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button asChild size="sm" type="button" variant="secondary">
            <Link href={`/client/invoices/${row.original.id}`}>
              <Eye className="h-4 w-4" aria-hidden="true" />
              View details
            </Link>
          </Button>
        ),
      },
    ],
    [projectMap],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        description="Review invoices shared with your account."
        title="Invoices"
      />

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="client-invoice-status">Status</Label>
            <select
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-soft"
              id="client-invoice-status"
              onChange={(event) =>
                setStatus(event.target.value as InvoiceStatus | "ALL")
              }
              value={status}
            >
              <option value="ALL">All statuses</option>
              {INVOICE_STATUSES.map((invoiceStatus) => (
                <option key={invoiceStatus} value={invoiceStatus}>
                  {formatStatus(invoiceStatus)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-invoice-project">Project</Label>
            <select
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-soft"
              disabled={projectsQuery.isLoading}
              id="client-invoice-project"
              onChange={(event) => setProjectId(event.target.value)}
              value={projectId}
            >
              <option value="ALL">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingState label="Loading invoices" />
      ) : loadError ? (
        <PortalSectionError
          message={errorMessage(loadError) ?? "Invoices could not be loaded."}
          onRetry={() => {
            invoicesQuery.refetch();
            projectsQuery.refetch();
          }}
        />
      ) : invoices.length === 0 && status === "ALL" && projectId === "ALL" ? (
        <EmptyState
          description="Invoices shared with your account will appear here."
          icon={FileText}
          title="No invoices yet"
        />
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          emptyDescription="Try adjusting the status or project filter."
          emptyTitle="No invoices match these filters"
        />
      )}
    </div>
  );
}

function projectTitle(project?: Project) {
  return project?.title ?? "No project";
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
