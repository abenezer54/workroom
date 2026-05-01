"use client";

import {
  BriefcaseBusiness,
  CheckSquare,
  ChevronRight,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/lib/page-title-context";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Projects", href: "/dashboard/projects", icon: BriefcaseBusiness },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Updates", href: "/dashboard/updates", icon: Inbox },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const clientNavItems: NavItem[] = [
  { label: "Overview", href: "/client", icon: Home },
  { label: "Projects", href: "/client/projects", icon: BriefcaseBusiness },
  { label: "Invoices", href: "/client/invoices", icon: FileText },
];

function buildBreadcrumbs(
  pathname: string,
  navItems: NavItem[],
  pageTitle: string | null,
): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const [rootSegment, sectionSegment] = segments;
  if (!sectionSegment) {
    const rootItem = navItems.find((item) => item.href === pathname);
    return rootItem ? [{ label: rootItem.label }] : [];
  }

  const sectionHref = `/${rootSegment}/${sectionSegment}`;
  const sectionItem = navItems.find((item) => item.href === sectionHref);

  if (!sectionItem) return [];

  if (segments.length === 2) {
    return [{ label: sectionItem.label }];
  }

  return [
    { label: sectionItem.label, href: sectionHref },
    { label: pageTitle ?? "\u2026" },
  ];
}

type AppShellProps = {
  children: ReactNode;
  variant: "admin" | "client";
};

export function AppShell({ children, variant }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = variant === "admin" ? adminNavItems : clientNavItems;
  const workspaceLabel =
    variant === "admin" ? "Agency workspace" : "Client portal";

  const { pageTitle, setPageTitle } = usePageTitle();
  useEffect(() => {
    setPageTitle(null);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  const breadcrumbs = buildBreadcrumbs(pathname, navItems, pageTitle);

  const initials = (user?.name ?? "W")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  return (
    <div className="wr-app min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="wr-sidebar fixed inset-y-0 left-0 hidden w-[264px] border-r border-white/[0.075] bg-sidebar px-4 py-5 lg:flex lg:flex-col">
        <div className="px-1 py-1">
          <AppLogo variant="dark" />
        </div>
        <div className="mt-8 px-2 text-xs font-medium text-sidebar-muted">
          {workspaceLabel}
        </div>
        <nav className="mt-3 flex-1 space-y-1">
          <NavLinks navItems={navItems} pathname={pathname} />
        </nav>
        <UserFooter
          email={user?.email ?? ""}
          initials={initials}
          name={user?.name ?? "workroom user"}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="wr-sidebar w-[264px] border-white/[0.075] bg-sidebar px-4 py-5"
        >
          <SheetTitle className="sr-only">
            {workspaceLabel} navigation
          </SheetTitle>
          <div className="px-1 py-1">
            <AppLogo variant="dark" />
          </div>
          <div className="mt-8 px-2 text-xs font-medium text-sidebar-muted">
            {workspaceLabel}
          </div>
          <nav className="mt-3 flex-1 space-y-1">
            <NavLinks
              navItems={navItems}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </nav>
          <UserFooter
            email={user?.email ?? ""}
            initials={initials}
            name={user?.name ?? "workroom user"}
            onSignOut={() => {
              setMobileOpen(false);
              handleSignOut();
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 border-b border-white/[0.075] bg-background/88 backdrop-blur-xl">
          <div className="flex h-[64px] items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 border-white/[0.08] bg-white/[0.025] p-0"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </Button>
              <AppLogo />
            </div>
            {breadcrumbs.length > 0 && (
              <nav
                aria-label="Breadcrumb"
                className="hidden items-center gap-1 text-sm lg:flex"
              >
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && (
                      <ChevronRight
                        className="h-3.5 w-3.5 text-muted-foreground/40"
                        aria-hidden="true"
                      />
                    )}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-foreground">
                        {crumb.label}
                      </span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div
            key={pathname}
            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavLinks({
  navItems,
  onNavigate,
  pathname,
}: {
  navItems: NavItem[];
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== "/client" &&
            pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex h-9 items-center gap-3 rounded-md px-2.5 text-sm font-medium text-sidebar-muted transition-[background-color,border-color,color,box-shadow] hover:bg-white/[0.04] hover:text-sidebar-foreground",
              isActive &&
                "border border-accent-border bg-accent-soft text-sidebar-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-ring/80",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function UserFooter({
  email,
  initials,
  name,
  onSignOut,
}: {
  email: string;
  initials: string;
  name: string;
  onSignOut: () => void;
}) {
  return (
    <div className="mt-auto border-t border-white/[0.075] pt-4">
      <div className="flex items-center gap-2.5 rounded-md border border-white/[0.065] bg-white/[0.025] px-2.5 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft text-[11px] font-semibold text-accent">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight text-sidebar-foreground">
            {name}
          </p>
          <p className="truncate text-xs leading-tight text-sidebar-muted">
            {email}
          </p>
        </div>
        <Button
          className="h-8 w-8 shrink-0 text-sidebar-muted hover:text-sidebar-foreground"
          onClick={onSignOut}
          size="icon"
          title="Sign out"
          type="button"
          variant="ghost"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
