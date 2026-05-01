"use client";

import { type ReactNode, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  FolderKanban,
  LockKeyhole,
  MessageSquareText,
  PanelRight,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { AnimatedProgressBar } from "@/components/shared/animated-progress-bar";
import { LogoMark } from "@/components/shared/app-logo";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProductModuleId = "clients" | "projects" | "updates" | "invoices";
type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

type ProductModule = {
  id: ProductModuleId;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  badgeVariant: BadgeVariant;
  details: string[];
};

const productModules: ProductModule[] = [
  {
    id: "clients",
    label: "Clients",
    title: "Every record starts with the client.",
    description:
      "Client details, ownership, connected projects, invoices, and portal access stay attached to one account.",
    icon: UsersRound,
    badge: "Source record",
    badgeVariant: "info",
    details: [
      "Agency-owned client record",
      "Assigned contacts and portal users",
      "Connected projects and billing status",
    ],
  },
  {
    id: "projects",
    label: "Projects",
    title: "Projects carry the work forward.",
    description:
      "Track status, progress, deadlines, and milestones while keeping the client relationship in context.",
    icon: FolderKanban,
    badge: "Active work",
    badgeVariant: "warning",
    details: [
      "Project status and completion",
      "Milestones and next deadlines",
      "Client-visible progress",
    ],
  },
  {
    id: "updates",
    label: "Tasks & Updates",
    title: "Internal execution becomes clear updates.",
    description:
      "Tasks, milestones, and published updates help the agency stay organized while clients see what matters.",
    icon: MessageSquareText,
    badge: "Shared clarity",
    badgeVariant: "success",
    details: [
      "Private tasks stay internal",
      "Published updates become client-facing",
      "Milestones make progress easy to scan",
    ],
  },
  {
    id: "invoices",
    label: "Invoices",
    title: "Billing stays connected to the work.",
    description:
      "Invoice status sits beside the project and client record, so payment visibility is part of the workspace.",
    icon: BadgeDollarSign,
    badge: "Billing view",
    badgeVariant: "neutral",
    details: [
      "Sent, paid, and overdue states",
      "Client-scoped invoice visibility",
      "Amounts tied back to the project",
    ],
  },
];

export function ProductModules() {
  const [activeModule, setActiveModule] =
    useState<ProductModuleId>("clients");
  const active = useMemo(
    () =>
      productModules.find((module) => module.id === activeModule) ??
      productModules[0],
    [activeModule],
  );
  const ActiveIcon = active.icon;

  return (
    <section
      id="features"
      className="scroll-mt-28 border-b border-white/[0.055] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
    >
      <ScrollReveal className="mx-auto max-w-[1320px]">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Product modules
            </p>
            <h2 className="mt-5 max-w-2xl text-3xl font-medium leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
              One workspace for every client relationship.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              workroom keeps clients, projects, tasks, updates, invoices, and
              portal access connected around the same account.
            </p>

            <div
              aria-label="Product modules"
              className="mt-9 grid gap-2 rounded-lg border border-white/[0.075] bg-white/[0.018] p-2"
              role="tablist"
            >
              {productModules.map((module) => (
                <ProductModuleButton
                  key={module.id}
                  active={activeModule === module.id}
                  module={module}
                  onClick={() => setActiveModule(module.id)}
                />
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/[0.09] bg-[#0b0c0d] shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.075] bg-white/[0.018] px-5 py-4">
              <div className="flex items-center gap-3">
                <LogoMark />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Acme Studio
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Client workspace overview
                  </p>
                </div>
              </div>
              <Badge variant={active.badgeVariant}>{active.badge}</Badge>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
              <div
                aria-labelledby={`module-tab-${activeModule}`}
                className="grid gap-4 p-4 sm:p-5 md:grid-cols-2"
                id="module-panel"
                role="tabpanel"
              >
                <ClientRecordPanel active={activeModule === "clients"} />
                <ProjectPanel active={activeModule === "projects"} />
                <UpdatesPanel active={activeModule === "updates"} />
                <InvoicesPanel active={activeModule === "invoices"} />
              </div>

              <aside className="border-t border-white/[0.075] bg-black/10 p-5 lg:border-l lg:border-t-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.075] bg-white/[0.035] text-info">
                    <ActiveIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Selected module
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-foreground">
                      {active.label}
                    </h3>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                  {active.description}
                </p>

                <div className="mt-6 space-y-3">
                  {active.details.map((detail) => (
                    <div
                      key={detail}
                      className="flex items-center gap-3 rounded-md border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-sm text-muted-foreground"
                    >
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-success"
                        aria-hidden="true"
                      />
                      {detail}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg border border-white/[0.075] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <PanelRight className="h-4 w-4 text-info" />
                    Portal boundary
                  </div>
                  <div className="mt-4 space-y-3">
                    <BoundaryRow icon={Eye} label="Visible to client" />
                    <BoundaryRow icon={LockKeyhole} label="Internal only" />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

function ProductModuleButton({
  active,
  module,
  onClick,
}: {
  active: boolean;
  module: ProductModule;
  onClick: () => void;
}) {
  const Icon = module.icon;

  return (
    <button
      aria-controls="module-panel"
      aria-selected={active}
      className={cn(
        "grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border px-3 py-3 text-left transition-[background-color,border-color] duration-200",
        active
          ? "border-accent-border bg-accent-soft"
          : "border-transparent hover:border-white/[0.09] hover:bg-white/[0.03]",
      )}
      id={`module-tab-${module.id}`}
      role="tab"
      type="button"
      onClick={onClick}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md border transition-[background-color,border-color,color] duration-200",
          active
            ? "border-accent-border bg-white/[0.055] text-info"
            : "border-white/[0.075] bg-black/15 text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">
          {module.label}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {module.title}
        </span>
      </span>
      <Badge variant={module.badgeVariant}>{module.badge}</Badge>
    </button>
  );
}

function ProductPanel({
  active,
  icon: Icon,
  title,
  badge,
  badgeVariant,
  children,
}: {
  active: boolean;
  icon: LucideIcon;
  title: string;
  badge: string;
  badgeVariant: BadgeVariant;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border bg-white/[0.025] transition-[background-color,border-color] duration-200",
        active
          ? "border-accent-border bg-white/[0.045]"
          : "border-white/[0.075]",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.075] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon
            className={cn(
              "h-4 w-4 shrink-0",
              active ? "text-info" : "text-muted-foreground",
            )}
            aria-hidden="true"
          />
          <h3 className="truncate text-sm font-semibold text-foreground">
            {title}
          </h3>
        </div>
        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function ClientRecordPanel({ active }: { active: boolean }) {
  return (
    <ProductPanel
      active={active}
      badge="Agency-owned"
      badgeVariant="info"
      icon={UsersRound}
      title="Client record"
    >
      <div>
        <p className="text-xl font-semibold text-foreground">Acme Studio</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Brand and web consultancy client
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MiniMetric label="Active projects" value="1" />
        <MiniMetric label="Portal users" value="3" />
      </div>
      <div className="mt-4 space-y-3">
        <RecordLine label="Owner" value="Jordan Lee" />
        <RecordLine label="Primary contact" value="Maya Chen" />
        <RecordLine label="Access" value="Client-scoped" />
      </div>
    </ProductPanel>
  );
}

function ProjectPanel({ active }: { active: boolean }) {
  return (
    <ProductPanel
      active={active}
      badge="In Progress"
      badgeVariant="warning"
      icon={FolderKanban}
      title="Project"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-foreground">
            Website Redesign
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Due May 12, 2026
          </p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">WR-021</span>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-medium text-foreground">Progress</span>
          <span className="text-muted-foreground">68%</span>
        </div>
        <AnimatedProgressBar
          className="mt-3"
          label="Product module project progress"
          value={68}
        />
      </div>
      <div className="mt-4 grid gap-3">
        <MilestoneLine label="Homepage review" state="Client" />
        <MilestoneLine label="QA pass" state="Internal" />
      </div>
    </ProductPanel>
  );
}

function UpdatesPanel({ active }: { active: boolean }) {
  return (
    <ProductPanel
      active={active}
      badge="Published"
      badgeVariant="success"
      icon={MessageSquareText}
      title="Tasks & updates"
    >
      <div className="space-y-3">
        <TaskLine label="Finalize homepage copy" state="Open" />
        <TaskLine label="Share milestone update" state="Visible" />
        <TaskLine label="Internal QA notes" state="Private" />
      </div>
      <div className="mt-4 rounded-md border border-white/[0.07] bg-black/15 p-3">
        <p className="text-xs font-medium text-info">Latest update</p>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          Homepage structure is approved and final polish is in progress.
        </p>
      </div>
    </ProductPanel>
  );
}

function InvoicesPanel({ active }: { active: boolean }) {
  return (
    <ProductPanel
      active={active}
      badge="Sent"
      badgeVariant="neutral"
      icon={BadgeDollarSign}
      title="Invoices"
    >
      <div className="space-y-3">
        <InvoiceRow amount="$4,500" invoice="WR-1042" state="Sent" />
        <InvoiceRow amount="$8,000" invoice="WR-1038" state="Paid" />
        <InvoiceRow amount="$5,500" invoice="WR-1031" state="Overdue" />
      </div>
      <div className="mt-4 flex items-center justify-between rounded-md border border-white/[0.07] bg-black/15 px-3 py-2.5">
        <span className="text-sm text-muted-foreground">Outstanding</span>
        <span className="text-sm font-semibold text-foreground">$10,000</span>
      </div>
    </ProductPanel>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.07] bg-black/15 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function RecordLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function MilestoneLine({ label, state }: { label: string; state: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/[0.07] bg-black/15 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm text-foreground">{label}</span>
      </div>
      <Badge variant={state === "Client" ? "info" : "neutral"}>{state}</Badge>
    </div>
  );
}

function TaskLine({ label, state }: { label: string; state: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/[0.07] bg-black/15 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
        <span className="truncate text-sm text-foreground">{label}</span>
      </div>
      <Badge
        variant={
          state === "Visible" ? "success" : state === "Private" ? "neutral" : "warning"
        }
      >
        {state}
      </Badge>
    </div>
  );
}

function InvoiceRow({
  invoice,
  amount,
  state,
}: {
  invoice: string;
  amount: string;
  state: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-white/[0.07] bg-black/15 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {invoice}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{amount}</p>
        </div>
      </div>
      <Badge
        variant={
          state === "Paid" ? "success" : state === "Overdue" ? "danger" : "warning"
        }
      >
        {state}
      </Badge>
    </div>
  );
}

function BoundaryRow({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </div>
  );
}
