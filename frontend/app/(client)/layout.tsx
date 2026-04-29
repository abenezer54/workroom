import type { ReactNode } from "react";

import { ClientLayout } from "@/components/layout/client-layout";

export default function ClientRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
