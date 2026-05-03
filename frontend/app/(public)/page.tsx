import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  PanelRight,
  type LucideIcon,
} from "lucide-react";

import { BentoCard } from "@/components/marketing/bento-card";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { ProductModules } from "@/components/marketing/product-modules";
import { ProductPreview } from "@/components/marketing/product-preview";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <section className="relative isolate overflow-hidden rounded-b-[12px] border-b border-white/[0.055] px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:rounded-b-[16px] lg:px-10 lg:pb-24 lg:pt-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[-1px] z-0 h-[48rem] sm:h-[58rem] lg:h-[68rem]"
        >
          <div
            className="absolute inset-x-[-18%] bottom-0 h-full opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 100%, rgba(185, 198, 210, 0.38) 0%, rgba(112, 124, 134, 0.24) 34%, rgba(38, 44, 49, 0.12) 58%, transparent 78%), radial-gradient(ellipse at 16% 96%, rgba(105, 117, 126, 0.24) 0%, rgba(44, 51, 57, 0.14) 42%, transparent 70%), radial-gradient(ellipse at 84% 96%, rgba(105, 117, 126, 0.24) 0%, rgba(44, 51, 57, 0.14) 42%, transparent 70%), linear-gradient(180deg, transparent 0%, rgba(8, 9, 10, 0.18) 40%, rgba(86, 96, 105, 0.2) 78%, rgba(168, 181, 194, 0.24) 100%)",
              maskImage:
                "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1320px]">
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
      <ProductModules />
      <WorkflowSection />
      <ClientPortalSection />
      <FinalCta />
    </MarketingLayout>
  );
}

function WorkspacesSection() {
  return (
    <section className="border-b border-white/[0.055] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <ScrollReveal className="mx-auto max-w-[1320px]">
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
            workroom separates what your team manages from what each client can
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
      </ScrollReveal>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="scroll-mt-28 border-b border-white/[0.055] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
    >
      <ScrollReveal className="mx-auto max-w-[1320px]">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">Workflow</p>
          <h2 className="mt-5 text-3xl font-medium leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
            From internal work to client visibility.
          </h2>
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {workflow.map((item) => (
            <BentoCard key={item.step} className="flex flex-col justify-between p-8">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.075] bg-white/[0.025] font-mono text-sm text-muted-foreground">
                {item.step}
              </span>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </BentoCard>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

function ClientPortalSection() {
  return (
    <section
      id="portal"
      className="scroll-mt-28 border-b border-white/[0.055] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
    >
      <ScrollReveal className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
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

        <div className="[perspective:2000px]">
          <BentoCard glowSize={800} className="group overflow-hidden rounded-[20px] border border-white/[0.08] bg-black shadow-[0_32px_100px_rgba(0,0,0,0.6)] transition-all duration-700 ease-out origin-top [transform:rotateX(8deg)_translateY(-20px)] hover:[transform:rotateX(0deg)_translateY(0px)]">
            <div className="flex items-center justify-between border-b border-white/[0.075] bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                Acme Studio Portal
              </div>
              <Badge variant="success" className="scale-90">Visible to client</Badge>
            </div>
            <div className="bg-[#0b0c0d]">
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
        </BentoCard>
        </div>
      </ScrollReveal>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-24">
      <ScrollReveal className="mx-auto max-w-3xl">
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
      </ScrollReveal>
    </section>
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
    <BentoCard className="flex flex-col" glowSize={1000}>
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.075] p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.075] bg-black/15 text-muted-foreground transition-[color] duration-200 group-hover:text-info">
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
      <div className="flex-1 p-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 border-b border-white/[0.06] px-4 sm:px-6 py-4 text-sm text-muted-foreground last:border-b-0"
          >
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-success"
              aria-hidden="true"
            />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

function ClientPortalMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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
