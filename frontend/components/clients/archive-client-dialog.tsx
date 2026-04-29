"use client";

import { Loader2 } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 py-6">
      <section
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-border bg-card"
        role="dialog"
      >
        <div className="space-y-2 border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Archive Client
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Archive {client.name}? The client will be removed from the active
            clients list.
          </p>
        </div>
        <div className="space-y-5 px-5 py-5">
          {error ? <ErrorState message={error} /> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
          </div>
        </div>
      </section>
    </div>
  );
}
