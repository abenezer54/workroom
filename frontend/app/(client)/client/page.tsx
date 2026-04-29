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
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientDashboard } from "@/lib/api/client-portal";

export default function ClientPage() {
  const dashboardQuery = useQuery({
    queryKey: ["client-dashboard"],
    queryFn: getClientDashboard,
  });

  if (dashboardQuery.isLoading) {
    return <LoadingState label="Loading client portal" />;
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

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          helper="Currently in progress"
          icon={FolderKanban}
          label="Active projects"
          value={dashboard.active_projects}
        />
        <StatsCard
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Project Progress</CardTitle>
              <Button asChild size="sm" type="button" variant="secondary">
                <Link href="/client/projects">View projects</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dashboard.project_progress_cards.length === 0 ? (
              <EmptyState
                description="Active project progress will appear here when work is underway."
                icon={FolderKanban}
                title="No active projects"
              />
            ) : (
              <div className="divide-y divide-border rounded-md border border-border">
                {dashboard.project_progress_cards.map((project) => (
                  <article key={project.id} className="px-4 py-4">
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
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.recent_updates.length === 0 ? (
              <EmptyState
                description="Recent project updates will appear here as they are posted."
                icon={MessageSquareText}
                title="No updates yet"
              />
            ) : (
              <div className="space-y-4">
                {dashboard.recent_updates.map((update) => (
                  <article
                    className="rounded-md border border-border px-4 py-3"
                    key={update.id}
                  >
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
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Pending Invoices</CardTitle>
              <Button asChild size="sm" type="button" variant="secondary">
                <Link href="/client/invoices">View invoices</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dashboard.pending_invoices.length === 0 ? (
              <EmptyState
                description="Open invoices will appear here when they are sent."
                icon={FileText}
                title="No pending invoices"
              />
            ) : (
              <div className="divide-y divide-border rounded-md border border-border">
                {dashboard.pending_invoices.map((invoice) => (
                  <article
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
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
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.upcoming_milestones.length === 0 ? (
              <EmptyState
                description="Upcoming project milestones will appear here when dated tasks are available."
                icon={RefreshCw}
                title="No upcoming milestones"
              />
            ) : (
              <div className="divide-y divide-border rounded-md border border-border">
                {dashboard.upcoming_milestones.map((milestone) => (
                  <article className="px-4 py-4" key={milestone.id}>
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
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
