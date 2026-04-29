"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import {
  getTasks,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type AgencyTask,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/api/tasks";

type StatusFilter = TaskStatus | "ALL";
type PriorityFilter = TaskPriority | "ALL";

export default function TasksPage() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [priority, setPriority] = useState<PriorityFilter>("ALL");

  const tasksQuery = useQuery({
    queryKey: ["tasks", { priority, status }],
    queryFn: () => getTasks({ priority, status }),
  });

  const columns = useMemo<ColumnDef<AgencyTask>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Task",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {row.original.project_title}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "project_title",
        header: "Project",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <StatusBadge status={row.original.priority} />,
      },
      {
        accessorKey: "due_date",
        header: "Due date",
        cell: ({ row }) => formatDate(row.original.due_date),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => formatDateTime(row.original.created_at),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <Button asChild size="sm" type="button" variant="secondary">
            <Link href={`/dashboard/projects/${row.original.project_id}`}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View Project
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  const tasks = tasksQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        description="Track milestones and work items across all active projects."
        title="Tasks"
      />

      <div className="rounded-md border border-border bg-accent-soft px-4 py-3 text-sm text-foreground">
        Tasks are created and edited inside each project.
      </div>

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <FilterSelect
            id="task-status"
            label="Status"
            onChange={(value) => setStatus(value as StatusFilter)}
            value={status}
          >
            <option value="ALL">All statuses</option>
            {TASK_STATUSES.map((item) => (
              <option key={item} value={item}>
                {formatStatus(item)}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            id="task-priority"
            label="Priority"
            onChange={(value) => setPriority(value as PriorityFilter)}
            value={priority}
          >
            <option value="ALL">All priorities</option>
            {TASK_PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {formatStatus(item)}
              </option>
            ))}
          </FilterSelect>
        </CardContent>
      </Card>

      {tasksQuery.isLoading ? (
        <LoadingState label="Loading tasks" />
      ) : tasksQuery.isError ? (
        <div className="space-y-4">
          <ErrorState
            title="Tasks could not load"
            message={errorMessage(tasksQuery.error)}
          />
          <Button onClick={() => tasksQuery.refetch()} type="button" variant="secondary">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Tasks from active project work will appear here."
        />
      ) : (
        <DataTable
          columns={columns}
          data={tasks}
          emptyDescription="Try adjusting the status or priority filters."
          emptyTitle="No tasks match these filters"
        />
      )}
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
      <select
        className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </div>
  );
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "The tasks request could not be completed.";
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
