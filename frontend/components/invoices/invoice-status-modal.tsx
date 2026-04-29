"use client";

import { Loader2, X } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  INVOICE_STATUSES,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/api/invoices";

type InvoiceStatusModalProps = {
  error?: string | null;
  invoice: Invoice | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (status: InvoiceStatus) => void;
};

export function InvoiceStatusModal({
  error,
  invoice,
  isSubmitting,
  onClose,
  onSubmit,
}: InvoiceStatusModalProps) {
  if (!invoice) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 py-6">
      <section
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-border bg-card"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Change Status
            </h2>
            <p className="text-sm text-muted-foreground">
              Update {invoice.invoice_number}.
            </p>
          </div>
          <Button
            aria-label="Close"
            disabled={isSubmitting}
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <form
          className="space-y-5 px-5 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onSubmit(formData.get("status") as InvoiceStatus);
          }}
        >
          {error ? <ErrorState message={error} /> : null}
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={invoice.status}
              disabled={isSubmitting}
              name="status"
            >
              {INVOICE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {formatStatus(item)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Save status
            </Button>
          </div>
        </form>
      </section>
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
