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

import { BentoCard } from "@/components/marketing/bento-card";
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
  const [activeModule, setActiveModule] = useState<ProductModuleId>("clients");
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
      className="scroll-mt-28 border-b border-white/[0.055] px-5 py-20 sm:px-8 lg:px-10 lg:py-24 relative overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-info/5 blur-[120px]" />
      
      <ScrollReveal className="mx-auto max-w-[1000px]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-info">Product modules</p>
            <h2 className="mt-5 text-3xl font-medium leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
              One workspace for every client relationship.
            </h2>
            <p className="mt-5 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              workroom keeps clients, projects, tasks, updates, invoices, and portal access connected around the same account.
            </p>
          </div>

          <div
            aria-label="Product modules"
            className="inline-flex shrink-0 rounded-full border border-white/[0.075] bg-white/[0.018] p-1.5 backdrop-blur-md overflow-x-auto max-w-full"
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

        <div className="mt-12">
          <BentoCard glowSize={1000} className="overflow-hidden rounded-[20px] bg-black shadow-[0_32px_100px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-white/[0.075] bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <LogoMark className="h-3.5 w-3.5" />
                Acme Studio Workspace
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={active.badgeVariant} className="scale-90">{active.badge}</Badge>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] bg-[#0b0c0d]">
              <div
                aria-labelledby={`module-tab-${activeModule}`}
                className="relative min-h-[440px] p-6 sm:p-8"
                id="module-panel"
                role="tabpanel"
              >
                <div key={activeModule} className="grid gap-6 md:grid-cols-2 animate-in fade-in zoom-in-95 duration-500 fill-mode-forwards">
                  {activeModule === "clients" && <ClientRecordPanel />}
                  {activeModule === "projects" && <ProjectPanel />}
                  {activeModule === "updates" && <UpdatesPanel />}
                  {activeModule === "invoices" && <InvoicesPanel />}
                </div>
              </div>

              <aside className="border-t border-white/[0.05] bg-white/[0.01] p-6 lg:border-l lg:border-t-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.075] bg-white/[0.035] text-info">
                    <ActiveIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {active.label}
                    </h3>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {active.description}
                </p>

                <div className="mt-6 space-y-3">
                  {active.details.map((detail) => (
                    <div
                      key={detail}
                      className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-sm text-muted-foreground shadow-sm"
                    >
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-success"
                        aria-hidden="true"
                      />
                      {detail}
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 shadow-sm">
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
          </BentoCard>
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
        "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-white/10 text-foreground shadow-sm ring-1 ring-white/10"
          : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
      )}
      id={`module-tab-${module.id}`}
      role="tab"
      type="button"
      onClick={onClick}
    >
      <Icon className={cn("h-4 w-4", active ? "text-info" : "text-muted-foreground")} aria-hidden="true" />
      {module.label}
    </button>
  );
}

function ProductPanel({
  icon: Icon,
  title,
  badge,
  badgeVariant,
  children,
}: {
  icon: LucideIcon;
  title: string;
  badge: string;
  badgeVariant: BadgeVariant;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/40 backdrop-blur-sm shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 bg-white/[0.01] rounded-t-xl shrink-0">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <h3 className="truncate text-sm font-medium text-foreground">
            {title}
          </h3>
        </div>
        <Badge variant={badgeVariant} className="scale-90">{badge}</Badge>
      </div>
      <div className="p-4 sm:p-5 flex-1">{children}</div>
    </div>
  );
}

function ClientRecordPanel() {
  return (
    <ProductPanel
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
      <div className="mt-5 space-y-3">
        <RecordLine label="Owner" value="Jordan Lee" />
        <RecordLine label="Primary contact" value="Maya Chen" />
        <RecordLine label="Access" value="Client-scoped" />
      </div>
    </ProductPanel>
  );
}

function ProjectPanel() {
  return (
    <ProductPanel
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
      <div className="mt-6">
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
      <div className="mt-6 grid gap-3">
        <MilestoneLine label="Homepage review" state="Client" />
        <MilestoneLine label="QA pass" state="Internal" />
      </div>
    </ProductPanel>
  );
}

function UpdatesPanel() {
  return (
    <ProductPanel
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
      <div className="mt-5 rounded-md border border-white/[0.07] bg-black/20 p-3.5">
        <p className="text-xs font-medium text-info">Latest update</p>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          Homepage structure is approved and final polish is in progress.
        </p>
      </div>
    </ProductPanel>
  );
}

function InvoicesPanel() {
  return (
    <ProductPanel
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
      <div className="mt-5 flex items-center justify-between rounded-md border border-white/[0.07] bg-black/20 px-4 py-3">
        <span className="text-sm text-muted-foreground">Outstanding</span>
        <span className="text-sm font-semibold text-foreground">$10,000</span>
      </div>
    </ProductPanel>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.07] bg-black/20 p-3">
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
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/[0.07] bg-black/20 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm text-foreground">{label}</span>
      </div>
      <Badge variant={state === "Client" ? "info" : "neutral"} className="scale-90">{state}</Badge>
    </div>
  );
}

function TaskLine({ label, state }: { label: string; state: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/[0.07] bg-black/20 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
        <span className="truncate text-sm text-foreground">{label}</span>
      </div>
      <Badge
        variant={
          state === "Visible" ? "success" : state === "Private" ? "neutral" : "warning"
        }
        className="scale-90"
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
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-white/[0.07] bg-black/20 px-3 py-2.5">
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
        className="scale-90"
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
