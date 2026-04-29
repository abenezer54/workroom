"use client";

import { X } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 py-6">
      <section
        aria-modal="true"
        className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-card"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
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
        </div>

        <div className="space-y-5 px-5 py-5">
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
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted text-xs font-medium text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Unit price</th>
                      <th className="px-4 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(invoice.items ?? []).map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-4 py-3">
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
