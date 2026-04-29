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
import { Textarea } from "@/components/ui/textarea";
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
    <DialogOverlay>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle>Add Update</DialogTitle>
            <DialogDescription>
              Publish a project update for this workspace.
            </DialogDescription>
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

          <Field error={form.formState.errors.title?.message} label="Title">
            <Input disabled={isSubmitting} {...form.register("title")} />
          </Field>

          <Field
            error={form.formState.errors.content?.message}
            label="Content"
          >
            <Textarea
              className="min-h-36"
              disabled={isSubmitting}
              {...form.register("content")}
            />
          </Field>

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
              Create update
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
