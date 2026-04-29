"use client";

import { Bell, CreditCard, Settings, UserRound, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-provider";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage your Workroom account and workspace preferences."
        title="Settings"
      />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnlyField label="Name" value={user?.name ?? "Unknown"} />
          <ReadOnlyField label="Email" value={user?.email ?? "Unknown"} />
          <ReadOnlyField label="Role" value={<StatusBadge status={user?.role ?? "UNKNOWN"} />} />
          <ReadOnlyField
            label="Workspace ID"
            value={user?.agency_id ?? user?.id ?? "Unavailable"}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <SettingsSection
          description="Profile editing will be added in a future settings phase."
          icon={UserRound}
          title="Profile"
        />
        <SettingsSection
          description="Workspace preferences are read-only in the MVP."
          icon={Settings}
          title="Workspace"
        />
        <SettingsSection
          description="Team members are outside the current MVP scope."
          icon={Users}
          title="Team members"
        />
        <SettingsSection
          description="Email notifications and reminder settings are planned for later."
          icon={Bell}
          title="Notifications"
        />
        <SettingsSection
          description="Billing, payments, and subscription management are future options."
          icon={CreditCard}
          title="Billing"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demo Limitations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            This settings area is intentionally read-only for the portfolio MVP.
            Profile editing, team access, notifications, billing, file uploads,
            payments, and email workflows are not implemented in this phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 break-all text-sm font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}

function SettingsSection({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <Card>
      <CardContent className="flex gap-4 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
