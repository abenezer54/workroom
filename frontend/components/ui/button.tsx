import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow,filter] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "linear-button linear-button-primary border border-accent-border bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "linear-button linear-button-secondary border border-border bg-secondary text-secondary-foreground hover:border-input hover:bg-surface-3 hover:text-foreground",
        accent:
          "linear-button linear-button-primary border border-accent-border bg-accent text-accent-foreground hover:bg-accent-hover",
        destructive:
          "linear-button linear-button-danger border border-danger-border bg-danger-soft text-danger hover:border-destructive hover:bg-destructive hover:text-destructive-foreground",
        ghost: "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
      },
      size: {
        default: "h-9 px-3.5",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-4",
        icon: "h-9 w-9 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
