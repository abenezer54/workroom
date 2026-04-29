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
import type { Client } from "@/lib/api/clients";

type ArchiveClientDialogProps = {
  client: Client | null;
  error?: string | null;
  isArchiving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ArchiveClientDialog({
  client,
  error,
  isArchiving,
  onCancel,
  onConfirm,
}: ArchiveClientDialogProps) {
  if (!client) {
    return null;
  }

  return (
    <DialogOverlay>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle>Archive Client</DialogTitle>
            <DialogDescription>
            Archive {client.name}? The client will be removed from the active
            clients list.
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
