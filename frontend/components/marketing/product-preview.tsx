"use client";

import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  PanelRight,
  Send,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { AnimatedProgressBar } from "@/components/shared/animated-progress-bar";
import { LogoMark } from "@/components/shared/app-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PreviewTabId = "dashboard" | "projects" | "portal";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

type PreviewTab = {
  id: PreviewTabId;
  label: string;
  path: string;
  badge: string;
  badgeVariant: BadgeVariant;
  icon: LucideIcon;
};

const previewTabs: PreviewTab[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "workroom.demo / agency",
    badge: "Live demo",
    badgeVariant: "info",
    icon: LayoutDashboard,
  },
  {
    id: "projects",
    label: "Projects",
    path: "workroom.demo / projects",
    badge: "Agency view",
    badgeVariant: "neutral",
    icon: BriefcaseBusiness,
  },
  {
    id: "portal",
    label: "Client Portal",
    path: "workroom.demo / client/acme",
    badge: "Client view",
    badgeVariant: "success",
    icon: PanelRight,
  },
];

const projectRows = [
  {
    title: "Website Redesign",
    client: "Acme Studio",
    status: "In Progress",
    variant: "warning" as const,
    progress: 68,
    due: "May 12",
    tasks: "9 / 13",
  },
  {
    title: "CRM Dashboard",
    client: "BrightPath Marketing",
    status: "Review",
    variant: "info" as const,
    progress: 84,
    due: "May 18",
    tasks: "16 / 19",
  },
  {
    title: "Invoice Portal Setup",
    client: "GreenLeaf Accounting",
    status: "Planning",
    variant: "neutral" as const,
    progress: 46,
    due: "Jun 03",
    tasks: "5 / 11",
  },
];

const portalTasks = [
  { label: "Review homepage copy", status: "Open" },
  { label: "Approve milestone scope", status: "Waiting" },
  { label: "Confirm invoice line items", status: "Open" },
];

const portalInvoices = [
  { label: "WR-1042", amount: "$4,500", status: "Sent" },
  { label: "WR-1038", amount: "$8,000", status: "Paid" },
];

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTabId>("dashboard");
  const activePreviewTab = useMemo(
    () => previewTabs.find((tab) => tab.id === activeTab) ?? previewTabs[0],
    [activeTab],
  );

  return (
    <div
      id="product"
      className="relative mx-auto mt-12 max-w-[1320px] scroll-mt-28 sm:mt-14"
    >
      <div className="relative overflow-hidden rounded-[18px] border border-white/[0.11] bg-[#0b0c0d] shadow-[0_22px_34px_rgba(0,0,0,0.34),0_48px_120px_rgba(0,0,0,0.42)]">
        <div className="grid min-h-12 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-white/[0.075] bg-white/[0.018] px-4">
          <div className="flex items-center gap-2 justify-self-start">
            <span className="h-2.5 w-2.5 rounded-full bg-white/18" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>

          <p className="hidden text-xs font-medium text-muted-foreground sm:block">
            {activePreviewTab.path}
          </p>

          <div className="flex items-center gap-3 justify-self-end">
            <Badge variant={activePreviewTab.badgeVariant}>
              {activePreviewTab.badge}
            </Badge>
          </div>
        </div>

        <div className="hidden min-h-[650px] grid-cols-[244px_minmax(0,1fr)_342px] lg:grid">
          <PreviewSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <main className="min-w-0 border-r border-white/[0.075]">
            <div
              key={activeTab}
              aria-label={`${activePreviewTab.label} preview`}
              className="h-full"
              id={`preview-panel-${activeTab}`}
              role="tabpanel"
            >
              {activeTab === "dashboard" ? <DashboardMain /> : null}
              {activeTab === "projects" ? <ProjectsMain /> : null}
              {activeTab === "portal" ? <PortalMain /> : null}
            </div>
          </main>

          <aside className="min-w-0 bg-black/10 p-5">
            {activeTab === "dashboard" ? <DashboardAside /> : null}
            {activeTab === "projects" ? <ProjectsAside /> : null}
            {activeTab === "portal" ? <PortalAside /> : null}
          </aside>
        </div>

        <MobilePreview activeTab={activeTab} />
      </div>
    </div>
  );
}

function PreviewSidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: PreviewTabId;
  onTabChange: (tab: PreviewTabId) => void;
}) {
  return (
    <aside className="border-r border-white/[0.075] bg-black/20 p-5">
      <div className="flex items-center gap-3">
        <LogoMark />
        <div>
          <p className="text-sm font-semibold text-foreground">workroom</p>
          <p className="text-xs text-muted-foreground">Agency workspace</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1" aria-label="Product preview">
        {previewTabs.map((tab) => (
          <SidebarTabButton
            key={tab.id}
            active={activeTab === tab.id}
            tab={tab}
            onClick={() => onTabChange(tab.id)}
          />
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

      <div className="mt-4 rounded-lg border border-white/[0.075] bg-white/[0.018] p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Connected records
        </p>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <SidebarRecord label="Clients" value="5" />
          <SidebarRecord label="Projects" value="4" />
          <SidebarRecord label="Invoices" value="7" />
        </div>
      </div>
    </aside>
  );
}

function SidebarTabButton({
  active,
  tab,
  onClick,
}: {
  active: boolean;
  tab: PreviewTab;
  onClick: () => void;
}) {
  const Icon = tab.icon;

  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-[background-color,border-color,color] duration-200",
        active
          ? "border border-accent-border bg-accent-soft text-foreground"
          : "border border-transparent text-muted-foreground hover:bg-white/[0.035] hover:text-foreground",
      )}
      type="button"
      onClick={onClick}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {tab.label}
    </button>
  );
}

function SidebarRecord({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function DashboardMain() {
  return (
    <>
      <PreviewScreenHeader
        badge="4 active projects"
        badgeVariant="success"
        eyebrow="Dashboard"
        title="Agency overview"
      />

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
              description="Campaign copy and page structure were adjusted after the latest client review."
              project="Brand Landing Page"
              title="Client feedback incorporated"
            />
            <UpdateItem
              description="Line items and invoice status are ready for the client portal."
              project="Invoice Portal Setup"
              title="Invoice review complete"
            />
          </div>
        </section>
      </div>
    </>
  );
}

function ProjectsMain() {
  return (
    <>
      <PreviewScreenHeader
        badge="Client-ready"
        badgeVariant="info"
        eyebrow="Projects"
        title="Project pipeline"
      />

      <div className="grid grid-cols-4 border-b border-white/[0.075]">
        <PreviewMetric label="In progress" value="2" />
        <PreviewMetric label="In review" value="1" />
        <PreviewMetric label="Milestones" value="7" />
        <PreviewMetric label="Visible updates" value="6" />
      </div>

      <div className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(270px,0.85fr)]">
        <section className="rounded-lg border border-white/[0.075] bg-white/[0.025] xl:col-span-2">
          <div className="grid grid-cols-[minmax(0,1fr)_96px_110px_132px] gap-4 border-b border-white/[0.075] px-5 py-4 text-xs font-medium uppercase text-muted-foreground">
            <span>Project</span>
            <span>Status</span>
            <span>Tasks</span>
            <span>Progress</span>
          </div>
          <div>
            {projectRows.map((project) => (
              <ProjectPipelineRow key={project.title} {...project} />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/[0.075] bg-white/[0.025]">
          <div className="border-b border-white/[0.075] px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Next milestones
            </h3>
          </div>
          <div>
            <MilestoneRow
              date="May 06"
              label="Homepage review"
              status="Client"
            />
            <MilestoneRow
              date="May 10"
              label="CRM handoff"
              status="Internal"
            />
            <MilestoneRow
              date="May 15"
              label="Portal walkthrough"
              status="Client"
            />
          </div>
        </section>

        <section className="rounded-lg border border-white/[0.075] bg-white/[0.025]">
          <div className="border-b border-white/[0.075] px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Work visibility
            </h3>
          </div>
          <div className="space-y-3 p-5">
            <VisibilityItem label="Published updates" value="6" />
            <VisibilityItem label="Client-visible tasks" value="14" />
            <VisibilityItem label="Private admin notes" value="9" muted />
          </div>
        </section>
      </div>
    </>
  );
}

function PortalMain() {
  return (
    <>
      <PreviewScreenHeader
        badge="Visible to client"
        badgeVariant="success"
        eyebrow="Client portal"
        title="Acme Studio"
      />

      <div className="grid grid-cols-4 border-b border-white/[0.075]">
        <PreviewMetric label="Active project" value="1" />
        <PreviewMetric label="Open tasks" value="3" />
        <PreviewMetric label="Invoice due" value="$4.5k" />
        <PreviewMetric label="Updates" value="4" />
      </div>

      <div className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
        <section className="rounded-lg border border-white/[0.075] bg-white/[0.025] xl:col-span-2">
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.075] p-5">
            <div>
              <p className="text-sm font-medium text-info">
                Website Redesign
              </p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">
                Homepage structure approved
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                The client sees the current milestone, project progress, and
                the next requested decisions in one focused portal view.
              </p>
            </div>
            <Badge variant="warning">In Progress</Badge>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-foreground">
                Project progress
              </span>
              <span className="text-muted-foreground">68% complete</span>
            </div>
            <AnimatedProgressBar
              className="mt-3"
              label="Client portal project progress"
              value={68}
            />
          </div>
        </section>

        <section className="rounded-lg border border-white/[0.075] bg-white/[0.025]">
          <div className="border-b border-white/[0.075] px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Visible tasks
            </h3>
          </div>
          <div>
            {portalTasks.map((task) => (
              <PortalTaskRow key={task.label} {...task} />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/[0.075] bg-white/[0.025]">
          <div className="border-b border-white/[0.075] px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Invoices
            </h3>
          </div>
          <div>
            {portalInvoices.map((invoice) => (
              <PortalInvoiceRow key={invoice.label} {...invoice} />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/[0.075] bg-white/[0.025] xl:col-span-2">
          <div className="flex items-center justify-between border-b border-white/[0.075] px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Latest updates
            </h3>
            <Badge variant="neutral">Shared</Badge>
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            <UpdateItem
              description="The new homepage structure is approved and final polish is underway."
              project="Apr 29, 2026"
              title="Milestone approved"
            />
            <UpdateItem
              description="Invoice line items have been reviewed and are ready for payment."
              project="Apr 25, 2026"
              title="Invoice sent"
            />
          </div>
        </section>
      </div>
    </>
  );
}

function DashboardAside() {
  return (
    <>
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
          <PortalStat
            icon={FolderKanban}
            label="Active project"
            value="Website Redesign"
          />
          <PortalStat
            icon={ListChecks}
            label="Next milestone"
            value="Client feedback review"
          />
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
    </>
  );
}

function ProjectsAside() {
  return (
    <>
      <div className="rounded-lg border border-white/[0.075] bg-white/[0.025]">
        <div className="border-b border-white/[0.075] p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Selected project
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Website Redesign
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Acme Studio has access to updates, visible tasks, milestones, and
            invoices connected to this project.
          </p>
        </div>
        <div className="space-y-5 p-5">
          <div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-foreground">Completion</span>
              <span className="text-muted-foreground">68%</span>
            </div>
            <AnimatedProgressBar
              className="mt-3"
              label="Selected project completion"
              value={68}
            />
          </div>
          <ProjectDetailLine label="Next milestone" value="Homepage review" />
          <ProjectDetailLine label="Due date" value="May 12, 2026" />
          <ProjectDetailLine label="Assigned tasks" value="9 of 13 complete" />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-white/[0.075] bg-white/[0.025] p-5">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-info" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">
            Client-visible update
          </p>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Campaign copy is approved. Implementation is moving into final QA.
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Shared with Acme Studio</span>
          <Badge variant="success">Published</Badge>
        </div>
      </div>
    </>
  );
}

function PortalAside() {
  return (
    <>
      <div className="rounded-lg border border-white/[0.075] bg-white/[0.025]">
        <div className="border-b border-white/[0.075] p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Signed in as
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Maya Chen
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Client user at Acme Studio with access limited to their own records.
          </p>
        </div>
        <div className="space-y-3 p-5">
          <PortalStat icon={UsersRound} label="Client account" value="Acme" />
          <PortalStat
            icon={FolderKanban}
            label="Visible project"
            value="Website Redesign"
          />
          <PortalStat icon={BadgeDollarSign} label="Open invoice" value="$4.5k" />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-white/[0.075] bg-white/[0.025] p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-info" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">
            Private from client
          </p>
        </div>
        <div className="mt-4 space-y-3">
          <PrivateRecord label="Internal notes" />
          <PrivateRecord label="Agency-only tasks" />
          <PrivateRecord label="Other client records" />
        </div>
      </div>
    </>
  );
}

function MobilePreview({ activeTab }: { activeTab: PreviewTabId }) {
  return (
    <div className="lg:hidden">
      {activeTab === "dashboard" ? <MobileDashboard /> : null}
      {activeTab === "projects" ? <MobileProjects /> : null}
      {activeTab === "portal" ? <MobilePortal /> : null}
    </div>
  );
}

function MobileDashboard() {
  return (
    <>
      <MobileHeader eyebrow="Dashboard" title="Agency overview" />
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <PreviewMetric compact label="Clients" value="5" />
          <PreviewMetric compact label="Projects" value="4" />
        </div>
        <MobileProjectCard />
        <MobilePortalCard />
      </div>
    </>
  );
}

function MobileProjects() {
  return (
    <>
      <MobileHeader eyebrow="Projects" title="Project pipeline" />
      <div className="space-y-4 p-4">
        {projectRows.map((project) => (
          <div
            key={project.title}
            className="rounded-lg border border-white/[0.075] bg-white/[0.025] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{project.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.client}
                </p>
              </div>
              <Badge variant={project.variant}>{project.status}</Badge>
            </div>
            <AnimatedProgressBar
              className="mt-4"
              label={`${project.title} mobile progress`}
              value={project.progress}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function MobilePortal() {
  return (
    <>
      <MobileHeader eyebrow="Client portal" title="Acme Studio" />
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <PreviewMetric compact label="Open tasks" value="3" />
          <PreviewMetric compact label="Invoice due" value="$4.5k" />
        </div>
        <MobileProjectCard />
        <MobilePortalCard />
      </div>
    </>
  );
}

function MobileHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="border-b border-white/[0.075] p-5">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function MobileProjectCard() {
  return (
    <div className="rounded-lg border border-white/[0.075] bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">Website Redesign</p>
          <p className="mt-1 text-sm text-muted-foreground">Acme Studio</p>
        </div>
        <Badge variant="warning">In Progress</Badge>
      </div>
      <AnimatedProgressBar
        className="mt-4"
        label="Website Redesign progress"
        value={68}
      />
    </div>
  );
}

function MobilePortalCard() {
  return (
    <div className="rounded-lg border border-white/[0.075] bg-white/[0.025] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <PanelRight className="h-4 w-4 text-info" aria-hidden="true" />
        Client portal
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Clients get a scoped view of their own projects, updates, tasks, and
        invoices.
      </p>
    </div>
  );
}

function PreviewScreenHeader({
  eyebrow,
  title,
  badge,
  badgeVariant,
}: {
  eyebrow: string;
  title: string;
  badge: string;
  badgeVariant: BadgeVariant;
}) {
  return (
    <div className="flex h-20 items-center justify-between border-b border-white/[0.075] px-7">
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-foreground">{title}</h2>
      </div>
      <Badge variant={badgeVariant}>{badge}</Badge>
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
  variant: BadgeVariant;
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
        <AnimatedProgressBar value={progress} label={`${title} progress`} />
        <p className="mt-2 text-xs text-muted-foreground">
          {progress}% complete
        </p>
      </div>
    </div>
  );
}

function ProjectPipelineRow({
  title,
  client,
  status,
  variant,
  progress,
  due,
  tasks,
}: {
  title: string;
  client: string;
  status: string;
  variant: BadgeVariant;
  progress: number;
  due: string;
  tasks: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_96px_110px_132px] gap-4 border-b border-white/[0.065] px-5 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">{title}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {client} - Due {due}
        </p>
      </div>
      <Badge variant={variant} className="h-fit w-fit">
        {status}
      </Badge>
      <p className="pt-1 text-sm text-muted-foreground">{tasks}</p>
      <div>
        <AnimatedProgressBar
          value={progress}
          label={`${title} project progress`}
        />
        <p className="mt-2 text-xs text-muted-foreground">{progress}%</p>
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
      <AnimatedProgressBar
        className="mt-3"
        label={`${label} invoice progress`}
        value={progress}
      />
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

function MilestoneRow({
  date,
  label,
  status,
}: {
  date: string;
  label: string;
  status: string;
}) {
  return (
    <div className="grid grid-cols-[72px_1fr_auto] items-center gap-3 border-b border-white/[0.065] px-5 py-4 last:border-b-0">
      <span className="font-mono text-xs text-muted-foreground">{date}</span>
      <span className="min-w-0 truncate text-sm font-medium text-foreground">
        {label}
      </span>
      <Badge variant={status === "Client" ? "info" : "neutral"}>{status}</Badge>
    </div>
  );
}

function VisibilityItem({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-white/[0.07] bg-black/15 px-3 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold",
          muted ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ProjectDetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/[0.065] pt-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function PortalTaskRow({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.065] px-5 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
        <span className="truncate text-sm font-medium text-foreground">
          {label}
        </span>
      </div>
      <Badge variant={status === "Waiting" ? "warning" : "neutral"}>
        {status}
      </Badge>
    </div>
  );
}

function PortalInvoiceRow({
  label,
  amount,
  status,
}: {
  label: string;
  amount: string;
  status: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/[0.065] px-5 py-4 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{amount}</p>
      </div>
      <Badge variant={status === "Paid" ? "success" : "warning"}>
        {status}
      </Badge>
    </div>
  );
}

function PrivateRecord({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-white/[0.07] bg-black/15 px-3 py-2.5 text-sm text-muted-foreground">
      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
      {label}
    </div>
  );
}
