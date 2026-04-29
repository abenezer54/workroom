import { z } from "zod";

import { CLIENT_STATUSES } from "@/lib/api/clients";

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, "Client name is required."),
  email: z.email("Enter a valid email address."),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(CLIENT_STATUSES, "Choose a valid status."),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
