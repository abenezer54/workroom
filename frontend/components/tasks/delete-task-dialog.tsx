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
    <DialogOverlay>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Delete {task.title}? This removes the task from the project.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          {error ? <ErrorState message={error} /> : null}
          <DialogFooter className="border-t-0 pt-0">
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
          </DialogFooter>
        </DialogBody>
      </DialogContent>
    </DialogOverlay>
  );
}
