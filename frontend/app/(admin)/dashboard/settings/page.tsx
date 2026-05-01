"use client";

import { Bell, CreditCard, Settings, UserRound, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  MetadataGrid,
  MetadataItem,
  WorkspaceList,
  WorkspaceListRow,
  WorkspaceSection,
  WorkspaceSectionContent,
  WorkspaceSectionHeader,
  WorkspaceSectionTitle,
} from "@/components/shared/workspace-section";
import { useAuth } from "@/lib/auth/auth-provider";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage your workroom account and workspace preferences."
        title="Settings"
      />

      <WorkspaceSection>
        <WorkspaceSectionHeader>
          <WorkspaceSectionTitle>Account</WorkspaceSectionTitle>
        </WorkspaceSectionHeader>
        <WorkspaceSectionContent>
          <MetadataGrid className="lg:grid-cols-4">
            <MetadataItem label="Name" value={user?.name ?? "Unknown"} />
            <MetadataItem label="Email" value={user?.email ?? "Unknown"} />
            <MetadataItem
              label="Role"
              value={<StatusBadge status={user?.role ?? "UNKNOWN"} />}
            />
            <MetadataItem
            label="Workspace ID"
            value={user?.agency_id ?? user?.id ?? "Unavailable"}
          />
          </MetadataGrid>
        </WorkspaceSectionContent>
      </WorkspaceSection>

      <WorkspaceSection>
        <WorkspaceSectionHeader>
          <WorkspaceSectionTitle>Workspace Areas</WorkspaceSectionTitle>
        </WorkspaceSectionHeader>
        <WorkspaceList>
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
        </WorkspaceList>
      </WorkspaceSection>

      <WorkspaceSection>
        <WorkspaceSectionHeader>
          <WorkspaceSectionTitle>Demo Limitations</WorkspaceSectionTitle>
        </WorkspaceSectionHeader>
        <WorkspaceSectionContent>
          <p className="text-sm leading-6 text-muted-foreground">
            This settings area is intentionally read-only for the portfolio MVP.
            Profile editing, team access, notifications, billing, file uploads,
            payments, and email workflows are not implemented in this phase.
          </p>
        </WorkspaceSectionContent>
      </WorkspaceSection>
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
    <WorkspaceListRow className="flex gap-4 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </WorkspaceListRow>
  );
}
