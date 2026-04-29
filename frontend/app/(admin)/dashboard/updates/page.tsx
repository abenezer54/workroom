"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, MessageSquareText, RefreshCw } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import { getUpdates } from "@/lib/api/project-updates";

export default function UpdatesPage() {
  const updatesQuery = useQuery({
    queryKey: ["updates"],
    queryFn: () => getUpdates(),
  });

  const updates = updatesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        description="Review recent project communication across your client work."
        title="Updates"
      />

      <div className="rounded-md border border-info-border bg-info-soft px-4 py-3 text-sm text-info">
        Updates are posted from each project detail page.
      </div>

      {updatesQuery.isLoading ? (
        <LoadingState label="Loading updates" />
      ) : updatesQuery.isError ? (
        <div className="space-y-4">
          <ErrorState
            title="Updates could not load"
            message={errorMessage(updatesQuery.error)}
          />
          <Button onClick={() => updatesQuery.refetch()} type="button" variant="secondary">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : updates.length === 0 ? (
        <EmptyState
          description="Recent project communication will appear here after updates are posted."
          icon={MessageSquareText}
          title="No updates yet"
        />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {updates.map((update) => (
              <article
                className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto]"
                key={update.id}
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-accent">
                    {update.project_title}
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-foreground">
                    {update.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {update.content}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDateTime(update.created_at)}
                  </p>
                </div>
                <Button asChild size="sm" type="button" variant="secondary">
                  <Link href={`/dashboard/projects/${update.project_id}`}>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    View Project
                  </Link>
                </Button>
              </article>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "The updates request could not be completed.";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
