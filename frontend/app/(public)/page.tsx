import { ArrowRight, CheckCircle2 } from "lucide-react";

import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <MarketingLayout>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1fr_420px] lg:items-center">
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

        <Card>
          <CardContent className="space-y-5 p-5">
            <StatsCard
              label="Active projects"
              value="12"
              helper="Across retained client work"
              icon={CheckCircle2}
            />
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-sm font-semibold text-foreground">
                Recent update
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Dashboard metrics connected and ready for client portal review.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </MarketingLayout>
  );
}
