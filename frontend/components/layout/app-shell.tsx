"use client";

import {
  BriefcaseBusiness,
  CheckSquare,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
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
  const navItems = variant === "admin" ? adminNavItems : clientNavItems;
  const workspaceLabel =
    variant === "admin" ? "Agency workspace" : "Client portal";

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] border-r border-sidebar-border bg-sidebar px-3 py-4 lg:flex lg:flex-col">
        <div className="px-2 py-1">
          <AppLogo variant="dark" />
        </div>
        <div className="mt-6 px-2 text-xs font-medium text-sidebar-muted">
          {workspaceLabel}
        </div>
        <nav className="mt-3 space-y-0.5">
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
                className={cn(
                  "relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-sidebar-muted transition-[background-color,color,box-shadow] hover:bg-white/[0.06] hover:text-sidebar-foreground",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-accent",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden">
              <AppLogo />
            </div>
            <div className="hidden text-sm font-medium text-muted-foreground lg:block">
              {workspaceLabel}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">
                  {user?.name ?? "Workroom user"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email ?? "Signed in"}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  signOut();
                  router.replace("/login");
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  item.href !== "/client" &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isActive &&
                      "border-accent-border bg-accent-soft text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
