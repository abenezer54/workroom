"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  FileText,
  FolderKanban,
  MessageSquareText,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

import {
  errorMessage,
  formatCurrency,
  formatDate,
  formatDateTime,
  PortalSectionError,
} from "@/components/client-portal/portal-helpers";
import { EmptyState } from "@/components/shared/empty-state";
import { ClientPortalSkeleton } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  WorkspaceList,
  WorkspaceListRow,
  WorkspaceSection,
  WorkspaceSectionContent,
  WorkspaceSectionHeader,
  WorkspaceSectionTitle,
} from "@/components/shared/workspace-section";
import { Button } from "@/components/ui/button";
import { getClientDashboard } from "@/lib/api/client-portal";

export default function ClientPage() {
  const dashboardQuery = useQuery({
    queryKey: ["client-dashboard"],
    queryFn: getClientDashboard,
  });

  if (dashboardQuery.isLoading) {
    return <ClientPortalSkeleton />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="space-y-4">
        <PageHeader
          description="Track project progress, updates, and invoices in one place."
          title="Client Portal"
        />
        <PortalSectionError
          message={
            errorMessage(dashboardQuery.error) ??
            "The client portal could not be loaded."
          }
          onRetry={() => dashboardQuery.refetch()}
        />
      </div>
    );
  }

  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        description="Track project progress, updates, and invoices in one place."
        title="Client Portal"
      />

      <div className="wr-panel grid overflow-hidden rounded-lg border border-white/[0.075] bg-[#0b0c0d] md:grid-cols-3">
        <StatsCard
          className="border-b border-white/[0.065] md:border-b-0 md:border-r"
          helper="Currently in progress"
          icon={FolderKanban}
          label="Active projects"
          value={dashboard.active_projects}
        />
        <StatsCard
          className="border-b border-white/[0.065] md:border-b-0 md:border-r"
          helper="Sent or overdue"
          icon={FileText}
          label="Pending invoices"
          value={dashboard.pending_invoices.length}
        />
        <StatsCard
          helper="Open dated milestones"
          icon={CalendarClock}
          label="Upcoming milestones"
          value={dashboard.upcoming_milestones.length}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <WorkspaceSection>
          <WorkspaceSectionHeader>
            <div className="flex w-full items-center justify-between gap-3">
              <WorkspaceSectionTitle>Project Progress</WorkspaceSectionTitle>
              <Button asChild size="sm" type="button" variant="secondary">
                <Link href="/client/projects">View projects</Link>
              </Button>
            </div>
          </WorkspaceSectionHeader>
          {dashboard.project_progress_cards.length === 0 ? (
            <WorkspaceSectionContent>
              <EmptyState
                description="Active project progress will appear here when work is underway."
                icon={FolderKanban}
                title="No active projects"
              />
            </WorkspaceSectionContent>
          ) : (
            <WorkspaceList>
              {dashboard.project_progress_cards.map((project) => (
                <WorkspaceListRow key={project.id} className="py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-foreground">
                          {project.title}
                        </h2>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Deadline {formatDate(project.deadline)}
                      </p>
                    </div>
                    <Button asChild size="sm" type="button" variant="secondary">
                      <Link href={`/client/projects/${project.id}`}>View</Link>
                    </Button>
                  </div>
                  <ProgressBar
                    className="mt-4"
                    label="Progress"
                    value={project.progress}
                  />
                </WorkspaceListRow>
              ))}
            </WorkspaceList>
          )}
        </WorkspaceSection>

        <WorkspaceSection>
          <WorkspaceSectionHeader>
            <WorkspaceSectionTitle>Recent Updates</WorkspaceSectionTitle>
          </WorkspaceSectionHeader>
          {dashboard.recent_updates.length === 0 ? (
            <WorkspaceSectionContent>
              <EmptyState
                description="Recent project updates will appear here as they are posted."
                icon={MessageSquareText}
                title="No updates yet"
              />
            </WorkspaceSectionContent>
          ) : (
            <WorkspaceList>
              {dashboard.recent_updates.map((update) => (
                <WorkspaceListRow key={update.id}>
                  <p className="text-xs font-medium text-muted-foreground">
                    {update.project_title}
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-foreground">
                    {update.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {update.content_preview}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatDateTime(update.created_at)}
                  </p>
                </WorkspaceListRow>
              ))}
            </WorkspaceList>
          )}
        </WorkspaceSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <WorkspaceSection>
          <WorkspaceSectionHeader>
            <div className="flex w-full items-center justify-between gap-3">
              <WorkspaceSectionTitle>Pending Invoices</WorkspaceSectionTitle>
              <Button asChild size="sm" type="button" variant="secondary">
                <Link href="/client/invoices">View invoices</Link>
              </Button>
            </div>
          </WorkspaceSectionHeader>
          {dashboard.pending_invoices.length === 0 ? (
            <WorkspaceSectionContent>
              <EmptyState
                description="Open invoices will appear here when they are sent."
                icon={FileText}
                title="No pending invoices"
              />
            </WorkspaceSectionContent>
          ) : (
            <WorkspaceList>
              {dashboard.pending_invoices.map((invoice) => (
                <WorkspaceListRow
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  key={invoice.id}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-foreground">
                        {invoice.invoice_number}
                      </h2>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due {formatDate(invoice.due_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(invoice.total)}
                    </p>
                    <Button asChild size="sm" type="button" variant="secondary">
                      <Link href={`/client/invoices/${invoice.id}`}>View</Link>
                    </Button>
                  </div>
                </WorkspaceListRow>
              ))}
            </WorkspaceList>
          )}
        </WorkspaceSection>

        <WorkspaceSection>
          <WorkspaceSectionHeader>
            <WorkspaceSectionTitle>Upcoming Milestones</WorkspaceSectionTitle>
          </WorkspaceSectionHeader>
          {dashboard.upcoming_milestones.length === 0 ? (
            <WorkspaceSectionContent>
              <EmptyState
                description="Upcoming project milestones will appear here when dated tasks are available."
                icon={RefreshCw}
                title="No upcoming milestones"
              />
            </WorkspaceSectionContent>
          ) : (
            <WorkspaceList>
              {dashboard.upcoming_milestones.map((milestone) => (
                <WorkspaceListRow className="py-4" key={milestone.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      {milestone.title}
                    </h2>
                    <StatusBadge status={milestone.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Due {formatDate(milestone.due_date)}
                  </p>
                  <Button
                    asChild
                    className="mt-3"
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    <Link href={`/client/projects/${milestone.project_id}`}>
                      View project
                    </Link>
                  </Button>
                </WorkspaceListRow>
              ))}
            </WorkspaceList>
          )}
        </WorkspaceSection>
      </div>
    </div>
  );
}
