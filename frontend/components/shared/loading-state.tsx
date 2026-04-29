import { Skeleton } from "@/components/ui/skeleton";

// ─── Auth / layout check ──────────────────────────────────────────────────────

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
      <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
      {label}
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
      <Skeleton className="h-4 w-[30%]" />
      <Skeleton className="h-4 w-[20%]" />
      <Skeleton className="h-4 w-[20%]" />
      <Skeleton className="ml-auto h-4 w-[10%]" />
    </div>
  );
}

function SkeletonTablePanel({ rows = 6 }: { rows?: number }) {
  return (
    <div className="wr-panel overflow-hidden rounded-lg border border-border bg-card">
      {/* Header row */}
      <div className="flex items-center gap-4 border-b border-border bg-muted/50 px-4 py-2.5">
        <Skeleton className="h-3 w-[18%]" />
        <Skeleton className="h-3 w-[14%]" />
        <Skeleton className="h-3 w-[14%]" />
        <Skeleton className="ml-auto h-3 w-[10%]" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

function SkeletonToolbar() {
  return (
    <div className="wr-panel rounded-lg border border-border bg-card/35 px-4 py-4">
      <div className="flex gap-4">
        <Skeleton className="h-9 w-full max-w-xs" />
        <Skeleton className="h-9 w-[160px]" />
      </div>
    </div>
  );
}

function SkeletonPageHeader() {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-28" />
    </div>
  );
}

// ─── Table page skeleton (Clients, Projects, Invoices, Tasks, Updates) ────────

export function TablePageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <SkeletonToolbar />
      <SkeletonTablePanel rows={rows} />
    </div>
  );
}

// ─── Dashboard skeleton ───────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />

      {/* Stats grid */}
      <div className="wr-panel grid overflow-hidden rounded-lg border border-border bg-card/45 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-4 border-b border-border p-4 last:border-0 md:odd:border-r xl:border-b-0 xl:border-r xl:last:border-r-0"
          >
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
          </div>
        ))}
      </div>

      {/* Two-col sections */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <SkeletonSection rows={4} />
        <SkeletonSection rows={3} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SkeletonSection rows={3} />
        <SkeletonSection rows={3} />
      </div>
    </div>
  );
}

function SkeletonSection({ rows = 4 }: { rows?: number }) {
  return (
    <div className="wr-panel overflow-hidden rounded-lg border border-border bg-card/50">
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Project detail skeleton ──────────────────────────────────────────────────

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-36" />
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Summary metadata */}
      <div className="wr-panel grid gap-4 rounded-lg border border-border bg-card/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Tasks + Updates */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <SkeletonSection rows={5} />
        <SkeletonSection rows={4} />
      </div>
    </div>
  );
}

// ─── Client portal home skeleton ──────────────────────────────────────────────

export function ClientPortalSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />

      {/* Stats row */}
      <div className="wr-panel grid overflow-hidden rounded-lg border border-border bg-card/45 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-4 border-b border-border p-4 last:border-0 md:border-b-0 md:border-r md:last:border-r-0"
          >
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-10" />
            </div>
            <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SkeletonSection rows={3} />
        <SkeletonSection rows={3} />
      </div>
    </div>
  );
}

// ─── Section-level skeletons (used inside larger pages) ───────────────────────

export function SectionListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
