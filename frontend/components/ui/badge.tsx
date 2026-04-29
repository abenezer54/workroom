import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "border-[#E5E7EB] bg-[#F3F4F6] text-[#6B7280]",
        success: "border-[#D7E7DA] bg-[#E7F1E9] text-[#3F6B4F]",
        warning: "border-[#F0DFC2] bg-[#F8EFD9] text-[#B7791F]",
        danger: "border-[#F3D5D5] bg-[#FBEAEA] text-[#B94A48]",
        info: "border-[#E5E7EB] bg-[#F3F4F6] text-[#6B7280]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
