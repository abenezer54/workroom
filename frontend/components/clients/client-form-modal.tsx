"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
    <DialogOverlay>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
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
              <Select
                disabled={isSubmitting}
                {...form.register("status")}
              >
                {CLIENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </Select>
            </Field>
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
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {client ? "Save changes" : "Create client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogOverlay>
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
