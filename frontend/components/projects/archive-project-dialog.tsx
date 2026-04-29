"use client";

import { Loader2 } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import {
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/lib/api/projects";

type ArchiveProjectDialogProps = {
  error?: string | null;
  isArchiving: boolean;
  project: Project | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ArchiveProjectDialog({
  error,
  isArchiving,
  project,
  onCancel,
  onConfirm,
}: ArchiveProjectDialogProps) {
  if (!project) {
    return null;
  }

  return (
    <DialogOverlay>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle>Archive Project</DialogTitle>
            <DialogDescription>
              Archive {project.title}? The project will be removed from the
              active projects list.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          {error ? <ErrorState message={error} /> : null}
          <DialogFooter className="border-t-0 pt-0">
            <Button
              disabled={isArchiving}
              onClick={onCancel}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              disabled={isArchiving}
              onClick={onConfirm}
              type="button"
              variant="destructive"
            >
              {isArchiving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Archive
            </Button>
          </DialogFooter>
        </DialogBody>
      </DialogContent>
    </DialogOverlay>
  );
}
