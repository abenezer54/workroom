"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  projectUpdateFormSchema,
  type ProjectUpdateFormValues,
} from "@/lib/validations/project-update";

type ProjectUpdateFormModalProps = {
  error?: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectUpdateFormValues) => void;
};

const defaultValues: ProjectUpdateFormValues = {
  title: "",
  content: "",
};

export function ProjectUpdateFormModal({
  error,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: ProjectUpdateFormModalProps) {
  const form = useForm<ProjectUpdateFormValues>({
    resolver: zodResolver(projectUpdateFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [form, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 py-6">
      <section
        aria-modal="true"
        className="max-h-[calc(100vh-3rem)] w-full max-w-xl overflow-y-auto rounded-lg border border-border bg-card"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Add Update
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Publish a project update for this workspace.
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

          <Field error={form.formState.errors.title?.message} label="Title">
            <Input disabled={isSubmitting} {...form.register("title")} />
          </Field>

          <Field
            error={form.formState.errors.content?.message}
            label="Content"
          >
            <textarea
              className="min-h-36 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              {...form.register("content")}
            />
          </Field>

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
              Create update
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
