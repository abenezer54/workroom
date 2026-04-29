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
import { Textarea } from "@/components/ui/textarea";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
} from "@/lib/api/tasks";
import { taskFormSchema, type TaskFormValues } from "@/lib/validations/task";

type TaskFormModalProps = {
  error?: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  task?: Task | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
};

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  due_date: "",
};

export function TaskFormModal({
  error,
  isOpen,
  isSubmitting,
  task,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset(
      task
        ? {
            title: task.title,
            description: task.description ?? "",
            status: task.status,
            priority: task.priority,
            due_date: task.due_date ?? "",
          }
        : defaultValues,
    );
  }, [form, isOpen, task]);

  if (!isOpen) {
    return null;
  }

  return (
    <DialogOverlay>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
            <DialogDescription>
              Track a task or milestone tied to this project.
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={form.formState.errors.title?.message} label="Title">
              <Input disabled={isSubmitting} {...form.register("title")} />
            </Field>

            <Field
              error={form.formState.errors.due_date?.message}
              label="Due date"
            >
              <Input
                disabled={isSubmitting}
                type="date"
                {...form.register("due_date")}
              />
            </Field>

            <Field
              error={form.formState.errors.status?.message}
              label="Status"
            >
              <Select
                disabled={isSubmitting}
                {...form.register("status")}
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              error={form.formState.errors.priority?.message}
              label="Priority"
            >
              <Select
                disabled={isSubmitting}
                {...form.register("priority")}
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {formatStatus(priority)}
                  </option>
                ))}
              </Select>
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
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {task ? "Save changes" : "Create task"}
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
