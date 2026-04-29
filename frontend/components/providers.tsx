"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { AuthProvider } from "@/lib/auth/auth-provider";
import { PageTitleProvider } from "@/lib/page-title-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PageTitleProvider>
        <AuthProvider>{children}</AuthProvider>
      </PageTitleProvider>
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  );
}
