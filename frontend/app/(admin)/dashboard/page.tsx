"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  FolderKanban,
  MessageSquareText,
  RefreshCw,
  Users,
} from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api/client";
import {
  getAdminDashboard,
  type AdminDashboard,
  type AdminDashboardDeadline,
  type AdminDashboardProject,
  type AdminDashboardProjectUpdate,
} from "@/lib/api/dashboard";

export default function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });

  if (dashboardQuery.isLoading) {
    return <LoadingState label="Loading dashboard" />;
  }

  if (dashboardQuery.isError) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Dashboard could not load"
          message={errorMessage(dashboardQuery.error)}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => dashboardQuery.refetch()}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  const dashboard = dashboardQuery.data;

  if (!dashboard) {
    return <LoadingState label="Preparing dashboard" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your clients, projects, invoices, and recent work."
      />

      <SummaryCards dashboard={dashboard} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <RecentProjects projects={dashboard.recent_projects} />
        <InvoiceOverview dashboard={dashboard} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <UpcomingDeadlines deadlines={dashboard.upcoming_deadlines} />
        <RecentUpdates updates={dashboard.recent_updates} />
      </div>
    </div>
  );
}

function SummaryCards({ dashboard }: { dashboard: AdminDashboard }) {
  const summary = dashboard.summary_cards;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        label="Total Clients"
        value={summary.total_clients}
        helper="Active client records"
        icon={Users}
      />
      <StatsCard
        label="Active Projects"
        value={summary.active_projects}
        helper="Currently in progress"
        icon={FolderKanban}
      />
      <StatsCard
        label="Pending Invoices"
        value={summary.pending_invoices}
        helper="Sent or overdue"
        icon={FileText}
      />
      <StatsCard
        label="Completed Tasks"
        value={summary.completed_tasks}
        helper="Closed work items"
        icon={CheckCircle2}
      />
    </div>
  );
}

function RecentProjects({ projects }: { projects: AdminDashboardProject[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <SectionEmpty
            icon={FolderKanban}
            title="No recent projects"
            description="Recent project activity will appear here once projects are created."
          />
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <Table className="min-w-[680px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="align-top">
                      <p className="font-medium text-foreground">
                        {project.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {project.client_name}
                      </p>
                    </TableCell>
                    <TableCell className="align-top">
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="align-top text-muted-foreground">
                      {formatDate(project.deadline)}
                    </TableCell>
                    <TableCell className="min-w-36 align-top">
                      <ProgressBar value={project.progress} />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {project.progress}% complete
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingDeadlines({
  deadlines,
}: {
  deadlines: AdminDashboardDeadline[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <SectionEmpty
            icon={CalendarClock}
            title="No upcoming deadlines"
            description="Project deadlines and task due dates will appear here."
          />
        ) : (
          <div className="divide-y divide-border rounded-md border border-border">
            {deadlines.map((deadline) => (
              <div
                key={`${deadline.type}-${deadline.id}`}
                className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">
                      {deadline.title}
                    </p>
                    <Badge variant="info">{formatStatus(deadline.type)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Due {formatDate(deadline.due_date)}
                  </p>
                </div>
                <StatusBadge status={deadline.status} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentUpdates({ updates }: { updates: AdminDashboardProjectUpdate[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Updates</CardTitle>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <SectionEmpty
            icon={MessageSquareText}
            title="No recent updates"
            description="Published project updates will appear here for quick review."
          />
        ) : (
          <div className="divide-y divide-border rounded-md border border-border">
            {updates.map((update) => (
              <article key={update.id} className="px-4 py-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-accent">
                      {update.project_title}
                    </p>
                    <h2 className="mt-1 text-sm font-semibold text-foreground">
                      {update.title}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(update.created_at)}
                  </p>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {update.content_preview || "No update preview available."}
                </p>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InvoiceOverview({ dashboard }: { dashboard: AdminDashboard }) {
  const invoice = dashboard.invoice_overview;
  const counts = [
    { label: "Draft", value: invoice.draft_count, status: "DRAFT" },
    { label: "Sent", value: invoice.sent_count, status: "SENT" },
    { label: "Paid", value: invoice.paid_count, status: "PAID" },
    { label: "Overdue", value: invoice.overdue_count, status: "OVERDUE" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3">
          <InvoiceAmount
            label="Outstanding"
            value={invoice.total_outstanding}
            helper="Sent and overdue invoices"
          />
          <InvoiceAmount
            label="Paid"
            value={invoice.paid_total}
            helper="Collected invoice total"
          />
          <InvoiceAmount
            label="Overdue"
            value={invoice.overdue_total}
            helper="Past-due invoice total"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {counts.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/70 px-3 py-2"
            >
              <StatusBadge status={item.status} />
              <span className="text-sm font-semibold text-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InvoiceAmount({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="linear-panel rounded-md border border-border bg-card px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
        <p className="text-base font-semibold text-foreground">
          {formatCurrency(value)}
        </p>
      </div>
    </div>
  );
}

function SectionEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/60 px-6 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="mt-3 text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function errorMessage(error: Error) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "The dashboard request could not be completed.";
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

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
