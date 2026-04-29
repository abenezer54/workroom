"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  Edit2,
  Eye,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ArchiveProjectDialog } from "@/components/projects/archive-project-dialog";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [notice, setNotice] = useState<string | null>(null);

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
      setNotice(
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
      setNotice(`${archiveTarget?.title ?? "Project"} was archived.`);
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
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button asChild size="sm" type="button" variant="secondary">
              <Link href={`/dashboard/projects/${row.original.id}`}>
                <Eye className="h-4 w-4" aria-hidden="true" />
                View
              </Link>
            </Button>
            <Button
              onClick={() => {
                setNotice(null);
                setFormProject(row.original);
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
              setNotice(null);
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

      {notice ? (
        <div className="rounded-md border border-success-border bg-success-soft px-4 py-3 text-sm text-success">
          {notice}
        </div>
      ) : null}

      <Card>
        <CardContent className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_220px_260px]">
          <div className="space-y-2">
            <Label htmlFor="project-search">Search</Label>
            <div className="relative">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-status">Status</Label>
            <Select
              id="project-status"
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              value={status}
            >
              <option value="ALL">All active statuses</option>
              {PROJECT_STATUSES.map((projectStatus) => (
                <option key={projectStatus} value={projectStatus}>
                  {formatStatus(projectStatus)}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-client">Client</Label>
            <Select
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
        </CardContent>
      </Card>

      {isInitialLoading ? (
        <LoadingState label="Loading projects" />
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
          setNotice(null);
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
            setNotice(null);
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
