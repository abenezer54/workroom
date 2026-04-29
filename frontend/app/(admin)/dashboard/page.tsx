import { CalendarClock, FileText, FolderKanban, Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A quiet overview of clients, active work, deadlines, and billing."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Clients"
          value="--"
          helper="Connected accounts"
          icon={Users}
        />
        <StatsCard
          label="Active projects"
          value="--"
          helper="Work in progress"
          icon={FolderKanban}
        />
        <StatsCard
          label="Pending invoices"
          value="--"
          helper="Sent or overdue"
          icon={FileText}
        />
        <StatsCard
          label="Upcoming"
          value="--"
          helper="Deadlines and milestones"
          icon={CalendarClock}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Recent projects</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="Dashboard data connects here"
              description="The admin dashboard endpoint is ready; detailed dashboard cards will be connected in the feature phase."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoice overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <StatusBadge status="SENT" />
            <StatusBadge status="PAID" />
            <StatusBadge status="OVERDUE" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
