"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Client } from "@/lib/api/clients";
import { INVOICE_STATUSES, type Invoice } from "@/lib/api/invoices";
import type { Project } from "@/lib/api/projects";
import {
  invoiceFormSchema,
  type InvoiceFormValues,
} from "@/lib/validations/invoice";

type InvoiceFormModalProps = {
  activeClients: Client[];
  error?: string | null;
  invoice?: Invoice | null;
  isOpen: boolean;
  isLoading?: boolean;
  isSubmitting: boolean;
  projects: Project[];
  onClose: () => void;
  onSubmit: (values: InvoiceFormValues) => void;
};

const defaultValues: InvoiceFormValues = {
  client_id: "",
  project_id: "",
  status: "DRAFT",
  issue_date: new Date().toISOString().slice(0, 10),
  due_date: "",
  tax: 0,
  discount: 0,
  items: [{ description: "", quantity: 1, unit_price: 0 }],
};

export function InvoiceFormModal({
  activeClients,
  error,
  invoice,
  isOpen,
  isLoading = false,
  isSubmitting,
  projects,
  onClose,
  onSubmit,
}: InvoiceFormModalProps) {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
  });

  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset(
      invoice
        ? {
            client_id: invoice.client_id,
            project_id: invoice.project_id ?? "",
            status: invoice.status,
            issue_date: invoice.issue_date,
            due_date: invoice.due_date ?? "",
            tax: invoice.tax / 100,
            discount: invoice.discount / 100,
            items:
              invoice.items && invoice.items.length > 0
                ? invoice.items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price / 100,
                  }))
                : defaultValues.items,
          }
        : {
            ...defaultValues,
            client_id: activeClients[0]?.id ?? "",
          },
    );
  }, [activeClients, form, invoice, isOpen]);

  const selectedClientId = useWatch({
    control: form.control,
    name: "client_id",
  });
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const watchedTax = useWatch({ control: form.control, name: "tax" });
  const watchedDiscount = useWatch({ control: form.control, name: "discount" });

  const filteredProjects = useMemo(
    () =>
      selectedClientId
        ? projects.filter((project) => project.client_id === selectedClientId)
        : projects,
    [projects, selectedClientId],
  );
  const subtotal = (watchedItems ?? []).reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0,
  );
  const total = Math.max(
    0,
    subtotal + (Number(watchedTax) || 0) - (Number(watchedDiscount) || 0),
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 py-6">
      <section
        aria-modal="true"
        className="max-h-[calc(100vh-3rem)] w-full max-w-4xl overflow-y-auto rounded-lg border border-border bg-card"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              {invoice ? "Edit Invoice" : "New Invoice"}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Build line items and preview totals before saving.
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

        {isLoading ? (
          <div className="p-5">
            <div className="rounded-md border border-border px-4 py-3 text-sm text-muted-foreground">
              Loading invoice details...
            </div>
          </div>
        ) : activeClients.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No active clients"
              description="Create or reactivate a client before creating an invoice."
            />
            <div className="mt-5 flex justify-end">
              <Button onClick={onClose} type="button" variant="secondary">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-5 px-5 py-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {error ? <ErrorState message={error} /> : null}

            <div className="grid gap-4 lg:grid-cols-4">
              <Field error={form.formState.errors.client_id?.message} label="Client">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  {...form.register("client_id")}
                >
                  {activeClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {clientLabel(client)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field error={form.formState.errors.project_id?.message} label="Project">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  {...form.register("project_id")}
                >
                  <option value="">No project</option>
                  {filteredProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field error={form.formState.errors.status?.message} label="Status">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  {...form.register("status")}
                >
                  {INVOICE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field error={form.formState.errors.issue_date?.message} label="Issue date">
                <Input
                  disabled={isSubmitting}
                  type="date"
                  {...form.register("issue_date")}
                />
              </Field>

              <Field error={form.formState.errors.due_date?.message} label="Due date">
                <Input
                  disabled={isSubmitting}
                  type="date"
                  {...form.register("due_date")}
                />
              </Field>

              <Field error={form.formState.errors.tax?.message} label="Tax">
                <Input
                  disabled={isSubmitting}
                  min={0}
                  step="0.01"
                  type="number"
                  {...form.register("tax", { valueAsNumber: true })}
                />
              </Field>

              <Field error={form.formState.errors.discount?.message} label="Discount">
                <Input
                  disabled={isSubmitting}
                  min={0}
                  step="0.01"
                  type="number"
                  {...form.register("discount", { valueAsNumber: true })}
                />
              </Field>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Line items</Label>
                <Button
                  disabled={isSubmitting}
                  onClick={() =>
                    append({ description: "", quantity: 1, unit_price: 0 })
                  }
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add item
                </Button>
              </div>
              {form.formState.errors.items?.root?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.items.root.message}
                </p>
              ) : null}
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    className="grid gap-3 rounded-md border border-border p-3 lg:grid-cols-[1fr_120px_140px_auto]"
                    key={field.id}
                  >
                    <Field
                      error={form.formState.errors.items?.[index]?.description?.message}
                      label="Description"
                    >
                      <Input
                        disabled={isSubmitting}
                        {...form.register(`items.${index}.description`)}
                      />
                    </Field>
                    <Field
                      error={form.formState.errors.items?.[index]?.quantity?.message}
                      label="Quantity"
                    >
                      <Input
                        disabled={isSubmitting}
                        min={0.01}
                        step="0.01"
                        type="number"
                        {...form.register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                    <Field
                      error={form.formState.errors.items?.[index]?.unit_price?.message}
                      label="Unit price"
                    >
                      <Input
                        disabled={isSubmitting}
                        min={0}
                        step="0.01"
                        type="number"
                        {...form.register(`items.${index}.unit_price`, {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                    <div className="flex items-end">
                      <Button
                        aria-label="Remove item"
                        disabled={isSubmitting || fields.length === 1}
                        onClick={() => remove(index)}
                        size="icon"
                        type="button"
                        variant="secondary"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 rounded-md border border-border bg-muted p-4 sm:grid-cols-3">
              <TotalPreview label="Subtotal" value={subtotal} />
              <TotalPreview label="Tax less discount" value={(Number(watchedTax) || 0) - (Number(watchedDiscount) || 0)} />
              <TotalPreview label="Total" value={total} strong />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button
                disabled={isSubmitting}
                onClick={onClose}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                {invoice ? "Save changes" : "Create invoice"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function TotalPreview({
  label,
  strong,
  value,
}: {
  label: string;
  strong?: boolean;
  value: number;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={strong ? "text-xl font-semibold text-foreground" : "text-sm font-semibold text-foreground"}>
        {formatCurrencyDollars(value)}
      </p>
    </div>
  );
}

function clientLabel(client: Client) {
  return client.company_name ? `${client.name} · ${client.company_name}` : client.name;
}

function formatCurrencyDollars(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
