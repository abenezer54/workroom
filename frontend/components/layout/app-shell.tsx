"use client";

import {
  BriefcaseBusiness,
  CheckSquare,
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
import type { ReactNode } from "react";
import { useState } from "react";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
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
                "relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-sidebar-muted transition-[background-color,color,box-shadow] hover:bg-surface-2 hover:text-sidebar-foreground",
                isActive &&
                  "bg-sidebar-accent text-sidebar-foreground shadow-[inset_0_0_0_1px_rgba(130,143,255,0.1)] before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-ring/80",
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

  function UserFooter({ onSignOut }: { onSignOut: () => void }) {
    return (
      <div className="mt-auto border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[11px] font-semibold text-accent">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight text-sidebar-foreground">
              {user?.name ?? "Workroom user"}
            </p>
            <p className="truncate text-xs leading-tight text-sidebar-muted">
              {user?.email ?? ""}
            </p>
          </div>
          <Button
            className="h-7 w-7 shrink-0 text-sidebar-muted hover:text-sidebar-foreground"
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

  return (
    <div className="wr-app min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="wr-sidebar fixed inset-y-0 left-0 hidden w-[248px] border-r border-sidebar-border bg-sidebar px-3 py-4 lg:flex lg:flex-col">
        <div className="px-2 py-1">
          <AppLogo variant="dark" />
        </div>
        <div className="mt-6 px-2 text-xs font-medium text-sidebar-muted">
          {workspaceLabel}
        </div>
        <nav className="mt-3 flex-1 space-y-0.5">
          <NavLinks />
        </nav>
        <UserFooter onSignOut={handleSignOut} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="wr-sidebar w-[248px] border-sidebar-border bg-sidebar px-3 py-4"
        >
          <SheetTitle className="sr-only">
            {workspaceLabel} navigation
          </SheetTitle>
          <div className="px-2 py-1">
            <AppLogo variant="dark" />
          </div>
          <div className="mt-6 px-2 text-xs font-medium text-sidebar-muted">
            {workspaceLabel}
          </div>
          <nav className="mt-3 flex-1 space-y-0.5">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </nav>
          <UserFooter
            onSignOut={() => {
              setMobileOpen(false);
              handleSignOut();
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-[248px]">
        <header className="wr-header sticky top-0 z-20 border-b border-sidebar-border bg-header">
          <div className="flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </Button>
              <AppLogo />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
