"use client";

import { Loader2 } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/api/tasks";

type DeleteTaskDialogProps = {
  error?: string | null;
  isDeleting: boolean;
  task: Task | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteTaskDialog({
  error,
  isDeleting,
  task,
  onCancel,
  onConfirm,
}: DeleteTaskDialogProps) {
  if (!task) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 py-6">
      <section
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-border bg-card"
        role="dialog"
      >
        <div className="space-y-2 border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Delete Task
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Delete {task.title}? This removes the task from the project.
          </p>
        </div>
        <div className="space-y-5 px-5 py-5">
          {error ? <ErrorState message={error} /> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              disabled={isDeleting}
              onClick={onCancel}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={onConfirm}
              type="button"
              variant="destructive"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Delete
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
