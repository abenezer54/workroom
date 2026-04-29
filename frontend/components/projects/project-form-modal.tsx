"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/shared/empty-state";
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
import { Textarea } from "@/components/ui/textarea";
import type { Client } from "@/lib/api/clients";
import { PROJECT_STATUSES, type Project } from "@/lib/api/projects";
import {
  projectFormSchema,
  type ProjectFormValues,
} from "@/lib/validations/project";

type ProjectFormModalProps = {
  activeClients: Client[];
  error?: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  project?: Project | null;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => void;
};

const defaultValues: ProjectFormValues = {
  client_id: "",
  title: "",
  description: "",
  status: "PLANNING",
  start_date: "",
  deadline: "",
  budget: 0,
  progress: 0,
};

export function ProjectFormModal({
  activeClients,
  error,
  isOpen,
  isSubmitting,
  project,
  onClose,
  onSubmit,
}: ProjectFormModalProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset(
      project
        ? {
            client_id: project.client_id,
            title: project.title,
            description: project.description ?? "",
            status: project.status,
            start_date: project.start_date ?? "",
            deadline: project.deadline ?? "",
            budget: project.budget / 100,
            progress: project.progress,
          }
        : {
            ...defaultValues,
            client_id: activeClients[0]?.id ?? "",
          },
    );
  }, [activeClients, form, isOpen, project]);

  if (!isOpen) {
    return null;
  }

  const title = project ? "Edit Project" : "Add Project";
  const description = project
    ? "Update client work, dates, budget, and progress."
    : "Create a project tied to an active client.";

  return (
    <DialogOverlay>
      <DialogContent className="max-w-2xl">
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

        {activeClients.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              title="No active clients"
              description="Create or reactivate a client before adding a project."
            />
            <div className="mt-5 flex justify-end">
              <Button onClick={onClose} type="button" variant="secondary">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-5 px-5 py-5 sm:px-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {error ? <ErrorState message={error} /> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                error={form.formState.errors.client_id?.message}
                label="Client"
              >
                <Select
                  disabled={isSubmitting}
                  {...form.register("client_id")}
                >
                  {activeClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company_name
                        ? `${client.name} · ${client.company_name}`
                        : client.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                error={form.formState.errors.status?.message}
                label="Status"
              >
                <Select
                  disabled={isSubmitting}
                  {...form.register("status")}
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                error={form.formState.errors.title?.message}
                label="Project title"
              >
                <Input disabled={isSubmitting} {...form.register("title")} />
              </Field>

              <Field
                error={form.formState.errors.progress?.message}
                label="Progress"
              >
                <Input
                  disabled={isSubmitting}
                  max={100}
                  min={0}
                  type="number"
                  {...form.register("progress", { valueAsNumber: true })}
                />
              </Field>

              <Field
                error={form.formState.errors.start_date?.message}
                label="Start date"
              >
                <Input
                  disabled={isSubmitting}
                  type="date"
                  {...form.register("start_date")}
                />
              </Field>

              <Field
                error={form.formState.errors.deadline?.message}
                label="Deadline"
              >
                <Input
                  disabled={isSubmitting}
                  type="date"
                  {...form.register("deadline")}
                />
              </Field>

              <Field
                error={form.formState.errors.budget?.message}
                label="Budget"
              >
                <Input
                  disabled={isSubmitting}
                  min={0}
                  step="0.01"
                  type="number"
                  {...form.register("budget", { valueAsNumber: true })}
                />
              </Field>
            </div>

            <Field
              error={form.formState.errors.description?.message}
              label="Description"
            >
              <Textarea
                disabled={isSubmitting}
                {...form.register("description")}
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
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                {project ? "Save changes" : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        )}
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
