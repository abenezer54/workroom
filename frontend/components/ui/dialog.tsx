import * as React from "react";

import { cn } from "@/lib/utils";

export function DialogOverlay({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-foreground/45 px-3 py-4 backdrop-blur-[2px] sm:items-center sm:px-6 sm:py-8",
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      aria-modal="true"
      className={cn(
        "max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-lg border border-border bg-card text-card-foreground shadow-[0_20px_70px_rgba(15,23,42,0.22)] sm:max-h-[calc(100vh-4rem)]",
        className,
      )}
      role="dialog"
      {...props}
    />
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DialogBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-5 sm:px-6", className)} {...props} />;
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
