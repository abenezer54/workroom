"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  Edit2,
  Eye,
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ArchiveProjectDialog } from "@/components/projects/archive-project-dialog";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TablePageSkeleton } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkspaceToolbar } from "@/components/shared/workspace-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import { getClients, type Client } from "@/lib/api/clients";
import {
  archiveProject,
  createProject,
  getProjects,
  PROJECT_STATUSES,
  updateProject,
  type Project,
  type ProjectPayload,
  type ProjectStatus,
} from "@/lib/api/projects";
import type { ProjectFormValues } from "@/lib/validations/project";

type StatusFilter = ProjectStatus | "ALL";

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [clientId, setClientId] = useState<string>("ALL");
  const [formProject, setFormProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Project | null>(null);

  const projectsQuery = useQuery({
    queryKey: ["projects", { clientId, search, status }],
    queryFn: () =>
      getProjects({
        client_id: clientId,
        search,
        status,
      }),
  });

  const clientsQuery = useQuery({
    queryKey: ["clients", "project-options"],
    queryFn: () => getClients(),
  });

  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const activeClients = clients.filter((client) => client.status === "ACTIVE");
  const clientMap = useMemo(() => {
    return new Map(clients.map((client) => [client.id, client]));
  }, [clients]);

  const saveProjectMutation = useMutation({
    mutationFn: (values: ProjectPayload) =>
      formProject
        ? updateProject(formProject.id, values)
        : createProject(values),
    onSuccess(project) {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      toast(
        formProject
          ? `${project.title} was updated.`
          : `${project.title} was added.`,
      );
      setIsFormOpen(false);
      setFormProject(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (project: Project) => archiveProject(project.id),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      toast(`${archiveTarget?.title ?? "Project"} was archived.`);
      setArchiveTarget(null);
    },
  });

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Project",
        cell: ({ row }) => {
          const client = clientMap.get(row.original.client_id);
          return (
            <div>
              <p className="font-medium text-foreground">
                {row.original.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {clientLabel(client)}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => (
          <div className="min-w-32">
            <ProgressBar value={row.original.progress} />
            <p className="mt-1 text-xs text-muted-foreground">
              {row.original.progress}% complete
            </p>
          </div>
        ),
      },
      {
        accessorKey: "deadline",
        header: "Deadline",
        cell: ({ row }) => formatDate(row.original.deadline),
      },
      {
        accessorKey: "budget",
        header: "Budget",
        cell: ({ row }) => formatCurrency(row.original.budget),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => formatDateTime(row.original.created_at),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              asChild
              size="icon"
              title="View"
              type="button"
              variant="ghost"
            >
              <Link href={`/dashboard/projects/${row.original.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              onClick={() => {
                setFormProject(row.original);
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
    [clientMap],
  );

  const projects = projectsQuery.data ?? [];
  const saveError = errorMessage(saveProjectMutation.error);
  const archiveError = errorMessage(archiveMutation.error);
  const isInitialLoading = projectsQuery.isLoading || clientsQuery.isLoading;
  const loadError = projectsQuery.error ?? clientsQuery.error;

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button
            onClick={() => {
              setFormProject(null);
              setIsFormOpen(true);
            }}
            type="button"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Project
          </Button>
        }
        description="Track client work, progress, budgets, and deadlines."
        title="Projects"
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
              id="project-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search project title"
              value={search}
            />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <SlidersHorizontal
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <Select
              className="w-40"
              id="project-status"
              onChange={(event) =>
                setStatus(event.target.value as StatusFilter)
              }
              value={status}
            >
              <option value="ALL">All statuses</option>
              {PROJECT_STATUSES.map((projectStatus) => (
                <option key={projectStatus} value={projectStatus}>
                  {formatStatus(projectStatus)}
                </option>
              ))}
            </Select>
            <Select
              className="w-48"
              disabled={clientsQuery.isLoading}
              id="project-client"
              onChange={(event) => setClientId(event.target.value)}
              value={clientId}
            >
              <option value="ALL">All clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {clientLabel(client)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </WorkspaceToolbar>

      {isInitialLoading ? (
        <TablePageSkeleton />
      ) : loadError ? (
        <div className="space-y-4">
          <ErrorState
            title="Projects could not load"
            message={
              errorMessage(loadError) ??
              "The projects request could not be completed."
            }
          />
          <Button
            onClick={() => {
              projectsQuery.refetch();
              clientsQuery.refetch();
            }}
            type="button"
            variant="secondary"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : projects.length === 0 &&
        !search &&
        status === "ALL" &&
        clientId === "ALL" ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Add a project once you have an active client ready for work."
        />
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          emptyDescription="Try adjusting the search term, status, or client filter."
          emptyTitle="No projects match these filters"
        />
      )}

      <ProjectFormModal
        activeClients={activeClients}
        error={saveError}
        isOpen={isFormOpen}
        isSubmitting={saveProjectMutation.isPending}
        project={formProject}
        onClose={() => {
          if (saveProjectMutation.isPending) {
            return;
          }

          saveProjectMutation.reset();
          setIsFormOpen(false);
          setFormProject(null);
        }}
        onSubmit={(values) => {
          saveProjectMutation.mutate(toProjectPayload(values));
        }}
      />

      <ArchiveProjectDialog
        error={archiveError}
        isArchiving={archiveMutation.isPending}
        project={archiveTarget}
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

function toProjectPayload(values: ProjectFormValues): ProjectPayload {
  return {
    client_id: values.client_id,
    title: values.title,
    description: values.description,
    status: values.status,
    start_date: values.start_date,
    deadline: values.deadline,
    budget: Math.round(values.budget * 100),
    progress: Math.round(values.progress),
  };
}

function clientLabel(client?: Client) {
  if (!client) {
    return "Unknown client";
  }

  return client.company_name
    ? `${client.name} · ${client.company_name}`
    : client.name;
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

function formatDateTime(value: string) {
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
