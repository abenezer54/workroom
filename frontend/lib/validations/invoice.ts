import { z } from "zod";

import { INVOICE_STATUSES } from "@/lib/api/invoices";

export const invoiceItemFormSchema = z.object({
  description: z.string().trim().min(1, "Description is required."),
  quantity: z
    .number("Quantity must be a number.")
    .gt(0, "Quantity must be greater than 0."),
  unit_price: z
    .number("Unit price must be a number.")
    .min(0, "Unit price must be 0 or greater."),
});

export const invoiceFormSchema = z
  .object({
    client_id: z.string().min(1, "Choose a client."),
    project_id: z.string().optional(),
    status: z.enum(INVOICE_STATUSES, "Choose a valid status."),
    issue_date: z.string().min(1, "Issue date is required."),
    due_date: z.string().optional(),
    tax: z.number("Tax must be a number.").min(0, "Tax must be 0 or greater."),
    discount: z
      .number("Discount must be a number.")
      .min(0, "Discount must be 0 or greater."),
    items: z
      .array(invoiceItemFormSchema)
      .min(1, "At least one invoice item is required."),
  })
  .refine(
    (values) =>
      !values.due_date ||
      !values.issue_date ||
      values.due_date >= values.issue_date,
    {
      message: "Due date cannot be before issue date.",
      path: ["due_date"],
    },
  );

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
