import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  FolderKanban,
} from "lucide-react";
import type { ComponentType } from "react";

import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <MarketingLayout>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1fr_460px] lg:items-center">
        <div className="space-y-8">
          <PageHeader
            title="Client work, organized in one calm workspace."
            description="Workroom brings projects, tasks, updates, invoices, and client visibility into one focused portal for service businesses."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <a href="/login">
                Open workspace
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href="/register">Create agency account</a>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b border-border bg-sidebar px-5 py-4 text-sidebar-foreground">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Agency Overview</p>
                <Badge variant="info">Live workspace</Badge>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <PreviewMetric
                  icon={FolderKanban}
                  label="Active projects"
                  value="12"
                />
                <PreviewMetric
                  icon={CircleDollarSign}
                  label="Pending invoices"
                  value="$18k"
                />
              </div>
              <div className="wr-panel rounded-md border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Website launch
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Northstar Studio
                    </p>
                  </div>
                  <Badge variant="success">In Progress</Badge>
                </div>
                <ProgressBar className="mt-4" value={72} />
              </div>
              <div className="wr-panel rounded-md border border-border bg-muted/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />
                  Recent update
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Dashboard metrics connected and ready for client portal review.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </MarketingLayout>
  );
}

function PreviewMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="wr-panel rounded-md border border-border bg-muted/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
