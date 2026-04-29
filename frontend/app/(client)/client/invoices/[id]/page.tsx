"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import {
  errorMessage,
  formatCurrency,
  formatDate,
  PortalSectionError,
} from "@/components/client-portal/portal-helpers";
import { ProjectDetailSkeleton } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  MetadataGrid,
  MetadataItem,
  WorkspaceSection,
  WorkspaceSectionContent,
  WorkspaceSectionHeader,
  WorkspaceSectionTitle,
} from "@/components/shared/workspace-section";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClientInvoice, getClientProjects } from "@/lib/api/client-portal";

export default function ClientInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const invoiceId = params.id;

  const invoiceQuery = useQuery({
    queryKey: ["client-invoice", invoiceId],
    queryFn: () => getClientInvoice(invoiceId),
  });

  const projectsQuery = useQuery({
    queryKey: ["client-projects", "invoice-detail-options"],
    queryFn: () => getClientProjects(),
  });

  const projectMap = useMemo(
    () =>
      new Map(
        (projectsQuery.data ?? []).map((project) => [project.id, project]),
      ),
    [projectsQuery.data],
  );

  const invoice = invoiceQuery.data;
  const project = invoice?.project_id
    ? projectMap.get(invoice.project_id)
    : undefined;
  const loadError = invoiceQuery.error ?? projectsQuery.error;

  if (invoiceQuery.isLoading || projectsQuery.isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (loadError || !invoice) {
    return (
      <div className="space-y-4">
        <Button asChild type="button" variant="secondary">
          <Link href="/client/invoices">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to invoices
          </Link>
        </Button>
        <PortalSectionError
          message={
            errorMessage(loadError) ?? "The invoice could not be loaded."
          }
          onRetry={() => {
            invoiceQuery.refetch();
            projectsQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button asChild type="button" variant="secondary">
            <Link href="/client/invoices">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to invoices
            </Link>
          </Button>
        }
        description="Read-only invoice details and line items."
        title={invoice.invoice_number}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <WorkspaceSection>
          <WorkspaceSectionHeader>
            <div className="flex flex-wrap items-center gap-2">
              <WorkspaceSectionTitle>Invoice Details</WorkspaceSectionTitle>
              <StatusBadge status={invoice.status} />
            </div>
          </WorkspaceSectionHeader>
          <WorkspaceSectionContent>
            <MetadataGrid>
              <MetadataItem
                label="Project"
                value={project?.title ?? "No project"}
              />
              <MetadataItem
                label="Issue date"
                value={formatDate(invoice.issue_date)}
              />
              <MetadataItem
                label="Due date"
                value={formatDate(invoice.due_date)}
              />
              <MetadataItem
                label="Status"
                value={formatStatus(invoice.status)}
              />
            </MetadataGrid>
          </WorkspaceSectionContent>
        </WorkspaceSection>

        <WorkspaceSection className="xl:self-start">
          <WorkspaceSectionHeader>
            <WorkspaceSectionTitle>Total</WorkspaceSectionTitle>
          </WorkspaceSectionHeader>
          <WorkspaceSectionContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
                <ReceiptText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(invoice.total)}
                </p>
                <p className="text-xs text-muted-foreground">Invoice total</p>
              </div>
            </div>
          </WorkspaceSectionContent>
        </WorkspaceSection>
      </div>

      <WorkspaceSection>
        <WorkspaceSectionHeader>
          <WorkspaceSectionTitle>Line Items</WorkspaceSectionTitle>
        </WorkspaceSectionHeader>
        <Table className="min-w-[620px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(invoice.items ?? []).map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatCurrency(item.unit_price)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <WorkspaceSectionContent>
          <div className="ml-auto mt-5 max-w-sm space-y-3">
            <TotalRow
              label="Subtotal"
              value={formatCurrency(invoice.subtotal)}
            />
            <TotalRow label="Tax" value={formatCurrency(invoice.tax)} />
            <TotalRow
              label="Discount"
              value={formatCurrency(invoice.discount)}
            />
            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </WorkspaceSectionContent>
      </WorkspaceSection>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
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
