"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  CheckSquare,
  DollarSign,
  MessageSquareText,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import {
  errorMessage,
  formatCurrency,
  formatDate,
  formatDateTime,
  PortalSectionError,
} from "@/components/client-portal/portal-helpers";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ProjectDetailSkeleton,
  SectionListSkeleton,
} from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  MetadataGrid,
  MetadataItem,
  WorkspaceList,
  WorkspaceListRow,
  WorkspaceSection,
  WorkspaceSectionContent,
  WorkspaceSectionHeader,
  WorkspaceSectionTitle,
} from "@/components/shared/workspace-section";
import { Button } from "@/components/ui/button";
import {
  getClientProject,
  getClientProjectTasks,
  getClientProjectUpdates,
} from "@/lib/api/client-portal";

export default function ClientProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const projectQuery = useQuery({
    queryKey: ["client-project", projectId],
    queryFn: () => getClientProject(projectId),
  });

  const tasksQuery = useQuery({
    queryKey: ["client-project-tasks", projectId],
    queryFn: () => getClientProjectTasks(projectId),
  });

  const updatesQuery = useQuery({
    queryKey: ["client-project-updates", projectId],
    queryFn: () => getClientProjectUpdates(projectId),
  });

  const project = projectQuery.data;
  const { setPageTitle } = usePageTitle();
  useEffect(() => {
    if (project?.title) setPageTitle(project.title);
  }, [project?.title, setPageTitle]);
  const tasks = tasksQuery.data ?? [];
  const updates = useMemo(
    () =>
      [...(updatesQuery.data ?? [])].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [updatesQuery.data],
  );

  if (projectQuery.isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (projectQuery.isError || !project) {
    return (
      <div className="space-y-4">
        <Button asChild type="button" variant="secondary">
          <Link href="/client/projects">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to projects
          </Link>
        </Button>
        <PortalSectionError
          message={
            errorMessage(projectQuery.error) ??
            "The project could not be loaded."
          }
          onRetry={() => projectQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button asChild type="button" variant="secondary">
            <Link href="/client/projects">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to projects
            </Link>
          </Button>
        }
        description="Project details, milestones, and updates shared by your agency."
        title={project.title}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <WorkspaceSection>
          <WorkspaceSectionHeader>
            <div className="flex flex-wrap items-center gap-2">
              <WorkspaceSectionTitle>Project Overview</WorkspaceSectionTitle>
              <StatusBadge status={project.status} />
            </div>
          </WorkspaceSectionHeader>
          <WorkspaceSectionContent className="space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">
              {project.description || "No project description has been added."}
            </p>
            <ProgressBar label="Progress" value={project.progress} />
            <MetadataGrid>
              <MetadataItem
                label="Start date"
                value={formatDate(project.start_date)}
              />
              <MetadataItem
                label="Deadline"
                value={formatDate(project.deadline)}
              />
              <MetadataItem
                label="Created"
                value={formatDateTime(project.created_at)}
              />
              <MetadataItem
                label="Status"
                value={formatStatus(project.status)}
              />
            </MetadataGrid>
          </WorkspaceSectionContent>
        </WorkspaceSection>

        <WorkspaceSection className="xl:self-start">
          <WorkspaceSectionHeader>
            <WorkspaceSectionTitle>Project Terms</WorkspaceSectionTitle>
          </WorkspaceSectionHeader>
          <WorkspaceSectionContent>
            <div className="flex items-center gap-3 pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
                <DollarSign className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(project.budget)}
                </p>
                <p className="text-xs text-muted-foreground">Project budget</p>
              </div>
            </div>
            <MetadataGrid className="grid-cols-1 sm:grid-cols-1">
              <MetadataItem
                label="Timeline"
                value={`${formatDate(project.start_date)} to ${formatDate(
                  project.deadline,
                )}`}
              />
            </MetadataGrid>
          </WorkspaceSectionContent>
        </WorkspaceSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <WorkspaceSection>
          <WorkspaceSectionHeader>
            <WorkspaceSectionTitle>Tasks and Milestones</WorkspaceSectionTitle>
          </WorkspaceSectionHeader>
          {tasksQuery.isLoading ? (
            <WorkspaceSectionContent className="p-0">
              <SectionListSkeleton rows={4} />
            </WorkspaceSectionContent>
          ) : tasksQuery.isError ? (
            <WorkspaceSectionContent>
              <PortalSectionError
                message={
                  errorMessage(tasksQuery.error) ?? "Tasks could not load."
                }
                onRetry={() => tasksQuery.refetch()}
              />
            </WorkspaceSectionContent>
          ) : tasks.length === 0 ? (
            <WorkspaceSectionContent>
              <EmptyState
                description="Shared milestones and tasks will appear here."
                icon={CheckSquare}
                title="No tasks yet"
              />
            </WorkspaceSectionContent>
          ) : (
            <WorkspaceList>
              {tasks.map((task) => (
                <WorkspaceListRow key={task.id} className="py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      {task.title}
                    </h2>
                    <StatusBadge status={task.status} />
                    <StatusBadge status={task.priority} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {task.description || "No description."}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                    Due {formatDate(task.due_date)}
                  </p>
                </WorkspaceListRow>
              ))}
            </WorkspaceList>
          )}
        </WorkspaceSection>

        <WorkspaceSection>
          <WorkspaceSectionHeader>
            <WorkspaceSectionTitle>Project Updates</WorkspaceSectionTitle>
          </WorkspaceSectionHeader>
          {updatesQuery.isLoading ? (
            <WorkspaceSectionContent className="p-0">
              <SectionListSkeleton rows={3} />
            </WorkspaceSectionContent>
          ) : updatesQuery.isError ? (
            <WorkspaceSectionContent>
              <PortalSectionError
                message={
                  errorMessage(updatesQuery.error) ?? "Updates could not load."
                }
                onRetry={() => updatesQuery.refetch()}
              />
            </WorkspaceSectionContent>
          ) : updates.length === 0 ? (
            <WorkspaceSectionContent>
              <EmptyState
                description="Project updates will appear here after they are posted."
                icon={MessageSquareText}
                title="No updates yet"
              />
            </WorkspaceSectionContent>
          ) : (
            <WorkspaceList>
              {updates.map((update) => (
                <WorkspaceListRow key={update.id} className="py-4">
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
                </WorkspaceListRow>
              ))}
            </WorkspaceList>
          )}
        </WorkspaceSection>
      </div>
    </div>
  );
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
