"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Archive, Edit2, Plus, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ArchiveClientDialog } from "@/components/clients/archive-client-dialog";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [notice, setNotice] = useState<string | null>(null);

  const clientsQuery = useQuery({
    queryKey: ["clients", { search, status }],
    queryFn: () => getClients({ search, status }),
  });

  const saveClientMutation = useMutation({
    mutationFn: (values: ClientPayload) =>
      formClient
        ? updateClient(formClient.id, values)
        : createClient(values),
    onSuccess(client) {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setNotice(
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
      setNotice(`${archiveTarget?.name ?? "Client"} was archived.`);
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
            <p className="font-medium text-foreground">
              {row.original.name}
            </p>
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
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setNotice(null);
                setFormClient(row.original);
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
              disabled={row.original.status === "ARCHIVED"}
              onClick={() => {
                setNotice(null);
                setArchiveTarget(row.original);
              }}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
              Archive
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
              setNotice(null);
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

      {notice ? (
        <div className="rounded-md border border-[#D7E7DA] bg-[#E7F1E9] px-4 py-3 text-sm text-[#3F6B4F]">
          {notice}
        </div>
      ) : null}

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-2">
            <Label htmlFor="client-search">Search</Label>
            <div className="relative">
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-status">Status</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
              id="client-status"
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              value={status}
            >
              <option value="ALL">All active statuses</option>
              {CLIENT_STATUSES.map((clientStatus) => (
                <option key={clientStatus} value={clientStatus}>
                  {formatStatus(clientStatus)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {clientsQuery.isLoading ? (
        <LoadingState label="Loading clients" />
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
          setNotice(null);
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
            setNotice(null);
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
