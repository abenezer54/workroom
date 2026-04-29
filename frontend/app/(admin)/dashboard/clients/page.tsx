"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Archive, Edit2, Plus, RefreshCw, Search, SlidersHorizontal, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ArchiveClientDialog } from "@/components/clients/archive-client-dialog";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TablePageSkeleton } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkspaceToolbar } from "@/components/shared/workspace-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import {
  archiveClient,
  CLIENT_STATUSES,
  createClient,
  getClients,
  updateClient,
  type Client,
  type ClientPayload,
  type ClientStatus,
} from "@/lib/api/clients";
import type { ClientFormValues } from "@/lib/validations/client";

type StatusFilter = ClientStatus | "ALL";

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [formClient, setFormClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Client | null>(null);

  const clientsQuery = useQuery({
    queryKey: ["clients", { search, status }],
    queryFn: () => getClients({ search, status }),
  });

  const saveClientMutation = useMutation({
    mutationFn: (values: ClientPayload) =>
      formClient ? updateClient(formClient.id, values) : createClient(values),
    onSuccess(client) {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast(
        formClient
          ? `${client.name} was updated.`
          : `${client.name} was added.`,
      );
      setIsFormOpen(false);
      setFormClient(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (client: Client) => archiveClient(client.id),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast(`${archiveTarget?.name ?? "Client"} was archived.`);
      setArchiveTarget(null);
    },
  });

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Client",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {row.original.company_name || "No company"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "company_name",
        header: "Company",
        cell: ({ row }) => row.original.company_name || "—",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => row.original.phone || "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              onClick={() => {
                setFormClient(row.original);
                setIsFormOpen(true);
              }}
              size="icon"
              title="Edit"
              type="button"
              variant="ghost"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              disabled={row.original.status === "ARCHIVED"}
              onClick={() => {
                setArchiveTarget(row.original);
              }}
              size="icon"
              title="Archive"
              type="button"
              variant="ghost"
            >
              <Archive className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const clients = clientsQuery.data ?? [];
  const saveError = errorMessage(saveClientMutation.error);
  const archiveError = errorMessage(archiveMutation.error);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button
            onClick={() => {
              setFormClient(null);
              setIsFormOpen(true);
            }}
            type="button"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Client
          </Button>
        }
        description="Manage client relationships and company details."
        title="Clients"
      />

      <WorkspaceToolbar>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="pl-9"
              id="client-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, company, or email"
              value={search}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SlidersHorizontal
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <Select
              className="w-44"
              id="client-status"
              onChange={(event) =>
                setStatus(event.target.value as StatusFilter)
              }
              value={status}
            >
              <option value="ALL">All statuses</option>
              {CLIENT_STATUSES.map((clientStatus) => (
                <option key={clientStatus} value={clientStatus}>
                  {formatStatus(clientStatus)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </WorkspaceToolbar>

      {clientsQuery.isLoading ? (
        <TablePageSkeleton />
      ) : clientsQuery.isError ? (
        <div className="space-y-4">
          <ErrorState
            title="Clients could not load"
            message={
              errorMessage(clientsQuery.error) ??
              "The clients request could not be completed."
            }
          />
          <Button
            onClick={() => clientsQuery.refetch()}
            type="button"
            variant="secondary"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : clients.length === 0 && !search && status === "ALL" ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to start organizing project work and invoices."
        />
      ) : (
        <DataTable
          columns={columns}
          data={clients}
          emptyDescription="Try adjusting the search term or status filter."
          emptyTitle="No clients match these filters"
        />
      )}

      <ClientFormModal
        client={formClient}
        error={saveError}
        isOpen={isFormOpen}
        isSubmitting={saveClientMutation.isPending}
        onClose={() => {
          if (saveClientMutation.isPending) {
            return;
          }

          saveClientMutation.reset();
          setIsFormOpen(false);
          setFormClient(null);
        }}
        onSubmit={(values: ClientFormValues) => {
          saveClientMutation.mutate(values);
        }}
      />

      <ArchiveClientDialog
        client={archiveTarget}
        error={archiveError}
        isArchiving={archiveMutation.isPending}
        onCancel={() => {
          if (archiveMutation.isPending) {
            return;
          }

          archiveMutation.reset();
          setArchiveTarget(null);
        }}
        onConfirm={() => {
          if (archiveTarget) {
            archiveMutation.mutate(archiveTarget);
          }
        }}
      />
    </div>
  );
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
