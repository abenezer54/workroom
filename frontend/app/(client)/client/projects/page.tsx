"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Eye, FolderKanban, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  errorMessage,
  formatCurrency,
  formatDate,
  PortalSectionError,
} from "@/components/client-portal/portal-helpers";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getClientProjects } from "@/lib/api/client-portal";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/api/projects";

export default function ClientProjectsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "ALL">("ALL");

  const projectsQuery = useQuery({
    queryKey: ["client-projects", { search, status }],
    queryFn: () => getClientProjects({ search, status }),
  });

  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        description="A read-only view of the projects currently visible to your account."
        title="Projects"
      />

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-2">
            <Label htmlFor="client-project-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                id="client-project-search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects"
                value={search}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-project-status">Status</Label>
            <Select
              id="client-project-status"
              onChange={(event) =>
                setStatus(event.target.value as ProjectStatus | "ALL")
              }
              value={status}
            >
              <option value="ALL">All statuses</option>
              {PROJECT_STATUSES.map((projectStatus) => (
                <option key={projectStatus} value={projectStatus}>
                  {formatStatus(projectStatus)}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {projectsQuery.isLoading ? (
        <LoadingState label="Loading projects" />
      ) : projectsQuery.isError ? (
        <PortalSectionError
          message={
            errorMessage(projectsQuery.error) ?? "Projects could not be loaded."
          }
          onRetry={() => projectsQuery.refetch()}
        />
      ) : projects.length === 0 && !search && status === "ALL" ? (
        <EmptyState
          description="Projects shared with your account will appear here."
          icon={FolderKanban}
          title="No projects yet"
        />
      ) : projects.length === 0 ? (
        <EmptyState
          description="Try adjusting the search term or status filter."
          icon={Search}
          title="No projects match these filters"
        />
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        {project.title}
                      </h2>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {project.description ||
                        "Project details will be shared as work progresses."}
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4" aria-hidden="true" />
                        Deadline {formatDate(project.deadline)}
                      </span>
                      <span>Budget {formatCurrency(project.budget)}</span>
                    </div>
                  </div>
                  <Button asChild type="button" variant="secondary">
                    <Link href={`/client/projects/${project.id}`}>
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      View
                    </Link>
                  </Button>
                </div>
                <ProgressBar
                  className="mt-5"
                  label="Progress"
                  value={project.progress}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
