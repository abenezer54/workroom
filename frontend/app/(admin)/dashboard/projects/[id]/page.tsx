import { ArrowLeft, FolderKanban } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export default function ProjectDetailPlaceholderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button asChild type="button" variant="secondary">
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to projects
            </Link>
          </Button>
        }
        description="Project detail will be implemented in a later phase."
        title="Project Detail"
      />
      <EmptyState
        description="The projects list can link here now, while the full project detail, tasks, updates, and invoices remain out of scope for this phase."
        icon={FolderKanban}
        title="Project detail is not built yet"
      />
    </div>
  );
}
