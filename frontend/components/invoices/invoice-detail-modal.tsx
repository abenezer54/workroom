"use client";

import { X } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DialogContent,
  DialogHeader,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client } from "@/lib/api/clients";
import type { Invoice } from "@/lib/api/invoices";
import type { Project } from "@/lib/api/projects";

type InvoiceDetailModalProps = {
  client?: Client;
  invoice: Invoice | null;
  project?: Project;
  onClose: () => void;
};

export function InvoiceDetailModal({
  client,
  invoice,
  project,
  onClose,
}: InvoiceDetailModalProps) {
  if (!invoice) {
    return null;
  }

  return (
    <DialogOverlay>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {invoice.invoice_number}
              </h2>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {clientLabel(client)} {project ? `· ${project.title}` : ""}
            </p>
          </div>
          <Button
            aria-label="Close"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DialogHeader>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Summary label="Issue date" value={formatDate(invoice.issue_date)} />
            <Summary label="Due date" value={formatDate(invoice.due_date)} />
            <Summary label="Subtotal" value={formatCurrency(invoice.subtotal)} />
            <Summary label="Total" value={formatCurrency(invoice.total)} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border border-border">
                <Table className="min-w-[620px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit price</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(invoice.items ?? []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 grid gap-2 sm:ml-auto sm:max-w-xs">
                <TotalRow label="Subtotal" value={invoice.subtotal} />
                <TotalRow label="Tax" value={invoice.tax} />
                <TotalRow label="Discount" value={-invoice.discount} />
                <TotalRow label="Total" value={invoice.total} strong />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="linear-panel rounded-md border border-border bg-surface-1 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function TotalRow({
  label,
  strong,
  value,
}: {
  label: string;
  strong?: boolean;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold text-foreground" : "font-medium text-foreground"}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function clientLabel(client?: Client) {
  if (!client) {
    return "Unknown client";
  }
  return client.company_name ? `${client.name} · ${client.company_name}` : client.name;
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No date";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
