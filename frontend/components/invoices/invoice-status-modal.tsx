"use client";

import { Loader2, X } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
    <DialogOverlay>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>Update {invoice.invoice_number}.</DialogDescription>
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
        </DialogHeader>
        <form
          className="space-y-5 px-5 py-5 sm:px-6"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onSubmit(formData.get("status") as InvoiceStatus);
          }}
        >
          {error ? <ErrorState message={error} /> : null}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              defaultValue={invoice.status}
              disabled={isSubmitting}
              name="status"
            >
              {INVOICE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {formatStatus(item)}
                </option>
              ))}
            </Select>
          </div>
          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogOverlay>
  );
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
