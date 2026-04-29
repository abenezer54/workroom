import { z } from "zod";

import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/api/tasks";

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Task title is required."),
  description: z.string().optional(),
  status: z.enum(TASK_STATUSES, "Choose a valid status."),
  priority: z.enum(TASK_PRIORITIES, "Choose a valid priority."),
  due_date: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
