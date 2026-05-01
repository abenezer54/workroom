import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  Milestone,
  PanelRight,
  Send,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Client Management",
    description:
      "Keep client records and active work organized under the right agency.",
    icon: UsersRound,
  },
  {
    title: "Project Tracking",
    description:
      "Track status, deadlines, and progress without losing client context.",
    icon: FolderKanban,
  },
  {
    title: "Tasks & Milestones",
    description:
      "Turn project work into clear tasks, milestones, and next steps.",
    icon: Milestone,
  },
  {
    title: "Project Updates",
    description:
      "Share concise progress notes from the same workspace.",
    icon: MessageSquareText,
  },
  {
    title: "Invoice Management",
    description:
      "Create invoice records with clear status visibility.",
    icon: BadgeDollarSign,
  },
  {
    title: "Client Portal",
    description:
      "Give each client a scoped view of their own work and invoices.",
    icon: PanelRight,
  },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Clients", icon: UsersRound },
  { label: "Projects", icon: BriefcaseBusiness },
  { label: "Tasks", icon: ListChecks },
  { label: "Invoices", icon: FileText },
  { label: "Updates", icon: MessageSquareText },
];

const projectRows = [
  {
    title: "Website Redesign",
    client: "Acme Studio",
    status: "In Progress",
    variant: "warning" as const,
    progress: 68,
  },
  {
    title: "CRM Dashboard",
    client: "BrightPath Marketing",
    status: "Review",
    variant: "info" as const,
    progress: 84,
  },
  {
    title: "Invoice Portal Setup",
    client: "GreenLeaf Accounting",
    status: "Planning",
    variant: "neutral" as const,
    progress: 46,
  },
];

const workflow = [
  {
    step: "01",
    title: "Set up the client workspace",
    description:
      "Create the client record and connect the work that belongs to it.",
  },
  {
    step: "02",
    title: "Run the work from one surface",
    description:
      "Move projects forward with tasks, milestones, and status visibility.",
  },
  {
    step: "03",
    title: "Share a calm client view",
    description:
      "Clients sign in to see project progress, updates, and invoice status.",
  },
];

export default function HomePage() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b border-white/[0.055] px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-[720px] text-left">
            <h1 className="text-3xl font-medium leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
              <span className="block">The client workspace</span>
              <span className="block">for agencies and consultants.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Plan projects, share updates, track invoices, and give every
              client a clear portal.
            </p>
          </div>

          <ProductPreview />
        </div>
      </section>

      <WorkspacesSection />
      <FeatureGrid />
      <WorkflowSection />
      <ClientPortalSection />
      <FinalCta />
    </MarketingLayout>
  );
}

function ProductPreview() {
  return (
    <div
      id="product"
      className="relative mx-auto mt-12 max-w-[1320px] scroll-mt-28 sm:mt-14"
    >
      <div className="relative overflow-hidden rounded-lg border border-white/[0.11] bg-[#0b0c0d] shadow-[0_30px_120px_rgba(0,0,0,0.46)]">
        <div className="flex h-12 items-center justify-between border-b border-white/[0.075] bg-white/[0.018] px-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/18" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            workroom.demo / agency
          </p>
          <Badge variant="info">Live demo</Badge>
        </div>

        <div className="hidden min-h-[650px] grid-cols-[244px_minmax(0,1fr)_342px] lg:grid">
          <aside className="border-r border-white/[0.075] bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.09] bg-white/[0.055] text-sm font-semibold text-foreground">
                W
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Workroom</p>
                <p className="text-xs text-muted-foreground">Agency workspace</p>
              </div>
            </div>

            <nav className="mt-8 space-y-1" aria-label="Product preview">
              {navItems.map((item) => (
                <PreviewNavItem key={item.label} {...item} />
              ))}
            </nav>

            <div className="mt-10 rounded-lg border border-white/[0.075] bg-white/[0.025] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-info" aria-hidden="true" />
                Scoped access
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Client users only see records linked to their client account.
              </p>
            </div>
          </aside>

          <main className="border-r border-white/[0.075]">
            <div className="flex h-20 items-center justify-between border-b border-white/[0.075] px-7">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Dashboard
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-foreground">
                  Agency overview
                </h2>
              </div>
              <Badge variant="success">4 active projects</Badge>
            </div>

            <div className="grid grid-cols-4 border-b border-white/[0.075]">
              <PreviewMetric label="Total clients" value="5" />
              <PreviewMetric label="Active projects" value="4" />
              <PreviewMetric label="Open invoices" value="2" />
              <PreviewMetric label="Completed tasks" value="18" />
            </div>

            <div className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
              <section className="rounded-lg border border-white/[0.075] bg-white/[0.025]">
                <div className="flex items-center justify-between border-b border-white/[0.075] px-5 py-4">
                  <h3 className="text-base font-semibold text-foreground">
                    Recent projects
                  </h3>
                  <span className="text-xs text-muted-foreground">Progress</span>
                </div>
                <div>
                  {projectRows.map((project) => (
                    <ProjectRow key={project.title} {...project} />
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-white/[0.075] bg-white/[0.025]">
                <div className="border-b border-white/[0.075] px-5 py-4">
                  <h3 className="text-base font-semibold text-foreground">
                    Invoice overview
                  </h3>
                </div>
                <div className="space-y-4 p-5">
                  <InvoiceLine label="Outstanding" amount="$12,500" progress={62} />
                  <InvoiceLine label="Paid" amount="$8,000" progress={42} />
                  <InvoiceLine label="Overdue" amount="$5,500" progress={28} />
                </div>
              </section>

              <section className="rounded-lg border border-white/[0.075] bg-white/[0.025] xl:col-span-2">
                <div className="flex items-center justify-between border-b border-white/[0.075] px-5 py-4">
                  <h3 className="text-base font-semibold text-foreground">
                    Recent updates
                  </h3>
                  <Badge variant="neutral">Client-visible</Badge>
                </div>
                <div className="grid gap-0 md:grid-cols-2">
                  <UpdateItem
                    title="Client feedback incorporated"
                    project="Brand Landing Page"
                    description="Campaign copy and page structure were adjusted after the latest client review."
                  />
                  <UpdateItem
                    title="Invoice review complete"
                    project="Invoice Portal Setup"
                    description="Line items and invoice status are ready for the client portal."
                  />
                </div>
              </section>
            </div>
          </main>

          <aside className="bg-black/10 p-5">
            <div className="rounded-lg border border-white/[0.075] bg-white/[0.025]">
              <div className="border-b border-white/[0.075] p-5">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Client portal
                </p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">
                  Acme Studio
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  A focused view for project progress, open tasks, updates, and
                  invoices.
                </p>
              </div>
              <div className="space-y-3 p-5">
                <PortalStat icon={FolderKanban} label="Active project" value="Website Redesign" />
                <PortalStat icon={ListChecks} label="Next milestone" value="Client feedback review" />
                <PortalStat icon={FileText} label="Invoice status" value="Sent" />
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/[0.075] bg-white/[0.025] p-5">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-info" aria-hidden="true" />
                <p className="text-sm font-semibold text-foreground">
                  Latest update
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The homepage structure is approved and implementation is moving
                through final polish.
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Apr 29, 2026</span>
                <Badge variant="warning">In Progress</Badge>
              </div>
            </div>
          </aside>
        </div>

        <div className="lg:hidden">
          <div className="border-b border-white/[0.075] p-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Workroom preview
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Agency overview
            </h2>
          </div>
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <PreviewMetric compact label="Clients" value="5" />
              <PreviewMetric compact label="Projects" value="4" />
            </div>
            <div className="rounded-lg border border-white/[0.075] bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">Website Redesign</p>
                  <p className="mt-1 text-sm text-muted-foreground">Acme Studio</p>
                </div>
                <Badge variant="warning">In Progress</Badge>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/[0.08]">
                <div className="h-full w-[68%] rounded-full bg-accent" />
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.075] bg-white/[0.025] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <PanelRight className="h-4 w-4 text-info" aria-hidden="true" />
                Client portal
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Clients get a scoped view of their own projects, updates, tasks,
                and invoices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspacesSection() {
  return (
    <section className="border-b border-white/[0.055] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Two workspaces
            </p>
            <h2 className="mt-5 max-w-2xl text-3xl font-medium leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
              Internal control. Client clarity.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:justify-self-end">
            Workroom separates what your team manages from what each client can
            safely review, without splitting the work across tools.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <WorkspacePanel
            icon={BriefcaseBusiness}
            label="Agency workspace"
            title="Run the work behind the scenes."
            description="Your team manages the operational side of every client relationship."
            items={[
              "Organize client records and active projects.",
              "Track tasks, milestones, updates, and invoices.",
              "Keep admin controls inside the agency workspace.",
            ]}
            badge="Admin view"
          />
          <WorkspacePanel
            icon={PanelRight}
            label="Client portal"
            title="Share only what clients need."
            description="Clients get a focused view of their own work, progress, and billing status."
            items={[
              "Show assigned projects and visible tasks.",
              "Publish progress updates in one place.",
              "Keep each client scoped to their own records.",
            ]}
            badge="Client-scoped"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section
      id="features"
      className="scroll-mt-28 border-b border-white/[0.055] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <h2 className="max-w-2xl text-3xl font-medium leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
            Everything client work needs to stay clear.
          </h2>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:justify-self-end">
            Workroom keeps the essentials together: clients, projects, tasks,
            updates, invoices, and portal access with clear ownership.
          </p>
        </div>

        <div className="mt-12 grid border-l border-t border-white/[0.075] sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCell key={feature.title} index={index + 1} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="scroll-mt-28 border-b border-white/[0.055] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Workflow</p>
          <h2 className="mt-5 text-3xl font-medium leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
            From internal work to client visibility.
          </h2>
        </div>
        <div className="space-y-4">
          {workflow.map((item) => (
            <div
              key={item.step}
              className="grid gap-5 border-t border-white/[0.075] pt-6 sm:grid-cols-[92px_1fr]"
            >
              <span className="font-mono text-sm text-muted-foreground">
                {item.step}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClientPortalSection() {
  return (
    <section
      id="portal"
      className="scroll-mt-28 border-b border-white/[0.055] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Client portal
          </p>
          <h2 className="mt-5 text-3xl font-medium leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
            A polished client view with the right boundaries.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Clients can review assigned projects, visible tasks, updates, and
            their own invoices while admin controls stay private.
          </p>
        </div>

        <div className="rounded-lg border border-white/[0.09] bg-white/[0.025] shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between border-b border-white/[0.075] p-5">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Acme Studio Portal
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Scoped client workspace
              </p>
            </div>
            <Badge variant="success">Visible to client</Badge>
          </div>
          <div className="grid gap-0 sm:grid-cols-3">
            <ClientPortalMetric label="Projects" value="1" />
            <ClientPortalMetric label="Open tasks" value="3" />
            <ClientPortalMetric label="Invoices" value="$4,500" />
          </div>
          <div className="border-t border-white/[0.075] p-5">
            <div className="rounded-lg border border-white/[0.075] bg-black/15 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="warning">In Progress</Badge>
                <span className="text-sm text-muted-foreground">
                  Website Redesign
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-foreground">
                Homepage structure approved
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Latest project update, milestone status, and invoice visibility
                are collected in one calm client-facing space.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <PortalChecklistItem label="Wireframes reviewed" />
                <PortalChecklistItem label="Invoice sent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-medium leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
          Bring client work into focus.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          See how clients, projects, tasks, updates, and invoices fit together
          in one calm workspace.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-full border-white/80 bg-[#f7f8f8] px-5 text-background hover:bg-text-secondary"
          >
            <Link href="/login">
              View Demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="h-11 rounded-full border-white/[0.09] bg-white/[0.03] px-5 text-foreground hover:bg-white/[0.065]"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function PreviewNavItem({
  label,
  icon: Icon,
  active = false,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
        active
          ? "border border-accent-border bg-accent-soft text-foreground"
          : "text-muted-foreground",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </div>
  );
}

function PreviewMetric({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-white/[0.075]",
        compact
          ? "rounded-lg border bg-white/[0.025] p-4"
          : "border-r px-5 py-5 last:border-r-0",
      )}
    >
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ProjectRow({
  title,
  client,
  status,
  variant,
  progress,
}: {
  title: string;
  client: string;
  status: string;
  variant: "neutral" | "success" | "warning" | "danger" | "info";
  progress: number;
}) {
  return (
    <div className="grid gap-4 border-b border-white/[0.065] px-5 py-4 last:border-b-0 md:grid-cols-[1fr_126px_142px] md:items-center">
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{client}</p>
      </div>
      <Badge variant={variant} className="w-fit">
        {status}
      </Badge>
      <div>
        <div className="h-2 rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{progress}% complete</p>
      </div>
    </div>
  );
}

function InvoiceLine({
  label,
  amount,
  progress,
}: {
  label: string;
  amount: string;
  progress: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{amount}</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function UpdateItem({
  title,
  project,
  description,
}: {
  title: string;
  project: string;
  description: string;
}) {
  return (
    <div className="border-b border-white/[0.065] p-5 md:border-b-0 md:border-r md:last:border-r-0">
      <p className="text-sm font-medium text-info">{project}</p>
      <h4 className="mt-2 text-base font-semibold text-foreground">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PortalStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-white/[0.07] bg-black/15 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function FeatureCell({
  index,
  title,
  description,
  icon: Icon,
}: {
  index: number;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="min-h-64 border-b border-r border-white/[0.075] p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-xs text-muted-foreground">
          {String(index).padStart(2, "0")}
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.075] bg-white/[0.025] text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <h3 className="mt-12 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function WorkspacePanel({
  icon: Icon,
  label,
  title,
  description,
  items,
  badge,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  items: string[];
  badge: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.075] bg-white/[0.025]">
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.075] p-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.075] bg-black/15 text-muted-foreground">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
          </div>
          <h3 className="mt-6 text-2xl font-semibold leading-tight text-foreground">
            {title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <Badge variant="neutral" className="shrink-0">
          {badge}
        </Badge>
      </div>
      <div>
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4 text-sm text-muted-foreground last:border-b-0"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientPortalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/[0.075] p-5 sm:border-r sm:last:border-r-0">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function PortalChecklistItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/[0.075] bg-white/[0.025] px-3 py-2 text-sm text-muted-foreground">
      <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
      {label}
    </div>
  );
}
