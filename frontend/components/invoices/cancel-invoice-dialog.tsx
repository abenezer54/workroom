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
import type { Invoice } from "@/lib/api/invoices";

type CancelInvoiceDialogProps = {
  error?: string | null;
  invoice: Invoice | null;
  isCancelling: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function CancelInvoiceDialog({
  error,
  invoice,
  isCancelling,
  onCancel,
  onConfirm,
}: CancelInvoiceDialogProps) {
  if (!invoice) {
    return null;
  }

  return (
    <DialogOverlay>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle>Cancel Invoice</DialogTitle>
            <DialogDescription>
              Cancel {invoice.invoice_number}? This will mark the invoice as
              cancelled.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          {error ? <ErrorState message={error} /> : null}
          <DialogFooter className="border-t-0 pt-0">
            <Button
              disabled={isCancelling}
              onClick={onCancel}
              type="button"
              variant="secondary"
            >
              Keep invoice
            </Button>
            <Button
              disabled={isCancelling}
              onClick={onConfirm}
              type="button"
              variant="destructive"
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Cancel invoice
            </Button>
          </DialogFooter>
        </DialogBody>
      </DialogContent>
    </DialogOverlay>
  );
}
