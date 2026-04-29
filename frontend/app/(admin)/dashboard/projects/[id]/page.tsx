"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  DollarSign,
  Edit2,
  ListChecks,
  MessageSquareText,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { ProjectUpdateFormModal } from "@/components/project-updates/project-update-form-modal";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import { getClients, type Client } from "@/lib/api/clients";
import {
  createProjectUpdate,
  getProjectUpdates,
  type ProjectUpdatePayload,
} from "@/lib/api/project-updates";
import {
  getProject,
  updateProject,
  type ProjectPayload,
} from "@/lib/api/projects";
import {
  createTask,
  deleteTask,
  getProjectTasks,
  updateTask,
  type Task,
  type TaskPayload,
} from "@/lib/api/tasks";
import type { ProjectFormValues } from "@/lib/validations/project";
import type { TaskFormValues } from "@/lib/validations/task";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const queryClient = useQueryClient();
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskForEdit, setTaskForEdit] = useState<Task | null>(null);
  const [taskForDelete, setTaskForDelete] = useState<Task | null>(null);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
  });

  const tasksQuery = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: () => getProjectTasks(projectId),
  });

  const updatesQuery = useQuery({
    queryKey: ["project-updates", projectId],
    queryFn: () => getProjectUpdates(projectId),
  });

  const clientsQuery = useQuery({
    queryKey: ["clients", "project-detail-options"],
    queryFn: () => getClients(),
  });

  const project = projectQuery.data;
  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const clientMap = useMemo(() => {
    return new Map(clients.map((client) => [client.id, client]));
  }, [clients]);
  const projectClient = project ? clientMap.get(project.client_id) : undefined;
  const formClients = useMemo(() => {
    const activeClients = clients.filter((client) => client.status === "ACTIVE");
    if (!project || activeClients.some((client) => client.id === project.client_id)) {
      return activeClients;
    }

    const currentClient = clientMap.get(project.client_id);
    return currentClient ? [...activeClients, currentClient] : activeClients;
  }, [clientMap, clients, project]);

  const updateProjectMutation = useMutation({
    mutationFn: (values: ProjectPayload) => updateProject(projectId, values),
    onSuccess(updatedProject) {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setNotice(`${updatedProject.title} was updated.`);
      setIsProjectFormOpen(false);
    },
  });

  const saveTaskMutation = useMutation({
    mutationFn: (values: TaskPayload) =>
      taskForEdit ? updateTask(taskForEdit.id, values) : createTask(projectId, values),
    onSuccess(task) {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setNotice(
        taskForEdit ? `${task.title} was updated.` : `${task.title} was added.`,
      );
      setTaskForEdit(null);
      setIsTaskFormOpen(false);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (task: Task) => deleteTask(task.id),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setNotice(`${taskForDelete?.title ?? "Task"} was deleted.`);
      setTaskForDelete(null);
    },
  });

  const createUpdateMutation = useMutation({
    mutationFn: (values: ProjectUpdatePayload) =>
      createProjectUpdate(projectId, values),
    onSuccess(update) {
      queryClient.invalidateQueries({ queryKey: ["project-updates", projectId] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setNotice(`${update.title} was added.`);
      setIsUpdateFormOpen(false);
    },
  });

  const pageError = projectQuery.error ?? clientsQuery.error;

  if (projectQuery.isLoading || clientsQuery.isLoading) {
    return <LoadingState label="Loading project" />;
  }

  if (pageError || !project) {
    return (
      <div className="space-y-4">
        <Button asChild type="button" variant="secondary">
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to projects
          </Link>
        </Button>
        <ErrorState
          title="Project could not load"
          message={
            errorMessage(pageError) ?? "The project request could not be completed."
          }
        />
        <Button
          onClick={() => {
            projectQuery.refetch();
            clientsQuery.refetch();
          }}
          type="button"
          variant="secondary"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  const tasks = tasksQuery.data ?? [];
  const updates = [...(updatesQuery.data ?? [])].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button asChild type="button" variant="secondary">
              <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to projects
              </Link>
            </Button>
            <Button
              onClick={() => {
                setNotice(null);
                setIsProjectFormOpen(true);
              }}
              type="button"
              variant="secondary"
            >
              <Edit2 className="h-4 w-4" aria-hidden="true" />
              Edit project
            </Button>
            <Button
              onClick={() => {
                setNotice(null);
                setTaskForEdit(null);
                setIsTaskFormOpen(true);
              }}
              type="button"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add task
            </Button>
            <Button
              onClick={() => {
                setNotice(null);
                setIsUpdateFormOpen(true);
              }}
              type="button"
              variant="accent"
            >
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
              Add update
            </Button>
          </>
        }
        description={clientLabel(projectClient)}
        title={project.title}
      />

      {notice ? (
        <div className="rounded-md border border-success-border bg-success-soft px-4 py-3 text-sm text-success">
          {notice}
        </div>
      ) : null}

      <ProjectSummary project={project} client={projectClient} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <TasksSection
          error={tasksQuery.error}
          isLoading={tasksQuery.isLoading}
          onAdd={() => {
            setNotice(null);
            setTaskForEdit(null);
            setIsTaskFormOpen(true);
          }}
          onDelete={(task) => {
            setNotice(null);
            setTaskForDelete(task);
          }}
          onEdit={(task) => {
            setNotice(null);
            setTaskForEdit(task);
            setIsTaskFormOpen(true);
          }}
          onRetry={() => tasksQuery.refetch()}
          tasks={tasks}
        />
        <UpdatesSection
          error={updatesQuery.error}
          isLoading={updatesQuery.isLoading}
          onAdd={() => {
            setNotice(null);
            setIsUpdateFormOpen(true);
          }}
          onRetry={() => updatesQuery.refetch()}
          updates={updates}
        />
      </div>

      <ProjectFormModal
        activeClients={formClients}
        error={errorMessage(updateProjectMutation.error)}
        isOpen={isProjectFormOpen}
        isSubmitting={updateProjectMutation.isPending}
        project={project}
        onClose={() => {
          if (updateProjectMutation.isPending) {
            return;
          }

          updateProjectMutation.reset();
          setIsProjectFormOpen(false);
        }}
        onSubmit={(values) => {
          setNotice(null);
          updateProjectMutation.mutate(toProjectPayload(values));
        }}
      />

      <TaskFormModal
        error={errorMessage(saveTaskMutation.error)}
        isOpen={isTaskFormOpen}
        isSubmitting={saveTaskMutation.isPending}
        task={taskForEdit}
        onClose={() => {
          if (saveTaskMutation.isPending) {
            return;
          }

          saveTaskMutation.reset();
          setTaskForEdit(null);
          setIsTaskFormOpen(false);
        }}
        onSubmit={(values) => {
          setNotice(null);
          saveTaskMutation.mutate(toTaskPayload(values));
        }}
      />

      <DeleteTaskDialog
        error={errorMessage(deleteTaskMutation.error)}
        isDeleting={deleteTaskMutation.isPending}
        task={taskForDelete}
        onCancel={() => {
          if (deleteTaskMutation.isPending) {
            return;
          }

          deleteTaskMutation.reset();
          setTaskForDelete(null);
        }}
        onConfirm={() => {
          if (taskForDelete) {
            setNotice(null);
            deleteTaskMutation.mutate(taskForDelete);
          }
        }}
      />

      <ProjectUpdateFormModal
        error={errorMessage(createUpdateMutation.error)}
        isOpen={isUpdateFormOpen}
        isSubmitting={createUpdateMutation.isPending}
        onClose={() => {
          if (createUpdateMutation.isPending) {
            return;
          }

          createUpdateMutation.reset();
          setIsUpdateFormOpen(false);
        }}
        onSubmit={(values) => {
          setNotice(null);
          createUpdateMutation.mutate(values);
        }}
      />
    </div>
  );
}

function ProjectSummary({
  client,
  project,
}: {
  client?: Client;
  project: NonNullable<Awaited<ReturnType<typeof getProject>>>;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Project Overview</CardTitle>
            <StatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm leading-6 text-muted-foreground">
            {project.description || "No project description has been added."}
          </p>
          <ProgressBar label="Progress" value={project.progress} />
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryItem label="Client" value={clientLabel(client)} />
            <SummaryItem label="Start date" value={formatDate(project.start_date)} />
            <SummaryItem label="Deadline" value={formatDate(project.deadline)} />
            <SummaryItem label="Created" value={formatDateTime(project.created_at)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted px-4 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
              <DollarSign className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(project.budget)}
              </p>
              <p className="text-xs text-muted-foreground">Approved budget</p>
            </div>
          </div>
          <SummaryItem
            label="Project timeline"
            value={`${formatDate(project.start_date)} to ${formatDate(project.deadline)}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function TasksSection({
  error,
  isLoading,
  onAdd,
  onDelete,
  onEdit,
  onRetry,
  tasks,
}: {
  error: unknown;
  isLoading: boolean;
  onAdd: () => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onRetry: () => void;
  tasks: Task[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Tasks and Milestones</CardTitle>
          <Button onClick={onAdd} size="sm" type="button" variant="secondary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState label="Loading tasks" />
        ) : error ? (
          <SectionError
            message={errorMessage(error) ?? "Tasks could not be loaded."}
            onRetry={onRetry}
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            description="Add tasks or milestones to track project progress."
            icon={ListChecks}
            title="No tasks yet"
          />
        ) : (
          <div className="divide-y divide-border rounded-md border border-border">
            {tasks.map((task) => (
              <article key={task.id} className="px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-foreground">
                        {task.title}
                      </h2>
                      <StatusBadge status={task.status} />
                      <StatusBadge status={task.priority} />
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {task.description || "No description."}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarClock className="h-4 w-4" aria-hidden="true" />
                      Due {formatDate(task.due_date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      onClick={() => onEdit(task)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => onDelete(task)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UpdatesSection({
  error,
  isLoading,
  onAdd,
  onRetry,
  updates,
}: {
  error: unknown;
  isLoading: boolean;
  onAdd: () => void;
  onRetry: () => void;
  updates: Awaited<ReturnType<typeof getProjectUpdates>>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Project Updates</CardTitle>
          <Button onClick={onAdd} size="sm" type="button" variant="secondary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add update
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState label="Loading updates" />
        ) : error ? (
          <SectionError
            message={errorMessage(error) ?? "Updates could not be loaded."}
            onRetry={onRetry}
          />
        ) : updates.length === 0 ? (
          <EmptyState
            description="Add a project update to keep recent work visible."
            icon={MessageSquareText}
            title="No updates yet"
          />
        ) : (
          <div className="divide-y divide-border rounded-md border border-border">
            {updates.map((update) => (
              <article key={update.id} className="px-4 py-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <h2 className="text-sm font-semibold text-foreground">
                    {update.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(update.created_at)}
                  </p>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {update.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SectionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-4">
      <ErrorState message={message} />
      <Button onClick={onRetry} type="button" variant="secondary">
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Retry
      </Button>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="linear-panel rounded-md border border-border bg-surface-1 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
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

function toTaskPayload(values: TaskFormValues): TaskPayload {
  return {
    title: values.title,
    description: values.description,
    status: values.status,
    priority: values.priority,
    due_date: values.due_date,
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
