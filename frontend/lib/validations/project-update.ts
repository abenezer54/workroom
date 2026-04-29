import { z } from "zod";

export const projectUpdateFormSchema = z.object({
  title: z.string().trim().min(1, "Update title is required."),
  content: z.string().trim().min(1, "Update content is required."),
});

export type ProjectUpdateFormValues = z.infer<
  typeof projectUpdateFormSchema
>;
