import { CalendarClock, FileText, FolderKanban } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="A read-only view of your active projects, updates, and invoices."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Active projects"
          value="--"
          helper="Assigned to your account"
          icon={FolderKanban}
        />
        <StatsCard
          label="Pending invoices"
          value="--"
          helper="Open billing items"
          icon={FileText}
        />
        <StatsCard
          label="Upcoming"
          value="--"
          helper="Milestones and deadlines"
          icon={CalendarClock}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client portal</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Portal data connects here"
            description="The client dashboard foundation is ready for the feature pages that will load project, update, and invoice data."
          />
        </CardContent>
      </Card>
    </div>
  );
}
