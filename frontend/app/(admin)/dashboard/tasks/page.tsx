"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckSquare,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TablePageSkeleton } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkspaceToolbar } from "@/components/shared/workspace-section";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
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
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              asChild
              size="icon"
              title="View project"
              type="button"
              variant="ghost"
            >
              <Link href={`/dashboard/projects/${row.original.project_id}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const tasks = tasksQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        description="Track milestones and work items across all active projects. To create or edit tasks, open the project."
        title="Tasks"
      />

      <WorkspaceToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <Select
            className="w-40"
            id="task-status"
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            value={status}
          >
            <option value="ALL">All statuses</option>
            {TASK_STATUSES.map((item) => (
              <option key={item} value={item}>
                {formatStatus(item)}
              </option>
            ))}
          </Select>
          <Select
            className="w-40"
            id="task-priority"
            onChange={(event) =>
              setPriority(event.target.value as PriorityFilter)
            }
            value={priority}
          >
            <option value="ALL">All priorities</option>
            {TASK_PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {formatStatus(item)}
              </option>
            ))}
          </Select>
        </div>
      </WorkspaceToolbar>

      {tasksQuery.isLoading ? (
        <TablePageSkeleton />
      ) : tasksQuery.isError ? (
        <div className="space-y-4">
          <ErrorState
            title="Tasks could not load"
            message={errorMessage(tasksQuery.error)}
          />
          <Button
            onClick={() => tasksQuery.refetch()}
            type="button"
            variant="secondary"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
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
