"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLIENT_STATUSES, type Client } from "@/lib/api/clients";
import {
  clientFormSchema,
  type ClientFormValues,
} from "@/lib/validations/client";

type ClientFormModalProps = {
  client?: Client | null;
  error?: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => void;
};

const defaultValues: ClientFormValues = {
  name: "",
  email: "",
  company_name: "",
  phone: "",
  status: "ACTIVE",
};

export function ClientFormModal({
  client,
  error,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: ClientFormModalProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset(
      client
        ? {
            name: client.name,
            email: client.email,
            company_name: client.company_name ?? "",
            phone: client.phone ?? "",
            status: client.status,
          }
        : defaultValues,
    );
  }, [client, form, isOpen]);

  if (!isOpen) {
    return null;
  }

  const title = client ? "Edit Client" : "Add Client";
  const description = client
    ? "Update relationship details for this client."
    : "Create a client record for projects, updates, and invoices.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 py-6">
      <section
        aria-modal="true"
        className="max-h-[calc(100vh-3rem)] w-full max-w-xl overflow-y-auto rounded-lg border border-border bg-card"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
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
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {error ? <ErrorState message={error} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              error={form.formState.errors.name?.message}
              label="Client name"
            >
              <Input
                autoComplete="name"
                disabled={isSubmitting}
                {...form.register("name")}
              />
            </Field>

            <Field error={form.formState.errors.email?.message} label="Email">
              <Input
                autoComplete="email"
                disabled={isSubmitting}
                type="email"
                {...form.register("email")}
              />
            </Field>

            <Field
              error={form.formState.errors.company_name?.message}
              label="Company name"
            >
              <Input disabled={isSubmitting} {...form.register("company_name")} />
            </Field>

            <Field error={form.formState.errors.phone?.message} label="Phone">
              <Input
                autoComplete="tel"
                disabled={isSubmitting}
                {...form.register("phone")}
              />
            </Field>

            <Field error={form.formState.errors.status?.message} label="Status">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                {...form.register("status")}
              >
                {CLIENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </Field>
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
              {client ? "Save changes" : "Create client"}
            </Button>
          </div>
        </form>
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

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
