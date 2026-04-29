import * as React from "react";

import { cn } from "@/lib/utils";

export function WorkspaceSection({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "wr-panel overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-[0_4px_20px_rgba(0,0,0,0.22)]",
        className,
      )}
      {...props}
    />
  );
}

export function WorkspaceSectionHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border bg-surface-1/80 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    />
  );
}

export function WorkspaceSectionTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-[15px] font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function WorkspaceSectionContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function WorkspaceList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("divide-y divide-border", className)} {...props} />;
}

export function WorkspaceListRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={cn(
        "px-5 py-3.5 transition-colors hover:bg-surface-2/60",
        className,
      )}
      {...props}
    />
  );
}

export function WorkspaceToolbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "wr-panel border-y border-border bg-surface-1/50 px-4 py-3 sm:px-6",
        className,
      )}
      {...props}
    />
  );
}

export function MetadataGrid({
  className,
  ...props
}: React.HTMLAttributes<HTMLDListElement>) {
  return (
    <dl
      className={cn("grid gap-x-8 gap-y-0 sm:grid-cols-2", className)}
      {...props}
    />
  );
}

export function MetadataItem({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className={cn("border-t border-border py-3.5", className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}
