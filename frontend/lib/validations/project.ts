import { z } from "zod";

import { PROJECT_STATUSES } from "@/lib/api/projects";

export const projectFormSchema = z.object({
  client_id: z.string().min(1, "Choose a client."),
  title: z.string().trim().min(1, "Project title is required."),
  description: z.string().optional(),
  status: z.enum(PROJECT_STATUSES, "Choose a valid status."),
  start_date: z.string().optional(),
  deadline: z.string().optional(),
  budget: z
    .number("Budget must be a number.")
    .min(0, "Budget must be 0 or greater."),
  progress: z
    .number("Progress must be a number.")
    .min(0, "Progress must be at least 0.")
    .max(100, "Progress cannot be more than 100."),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
