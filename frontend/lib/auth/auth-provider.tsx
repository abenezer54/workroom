"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import type { AuthResponse, CurrentUser } from "@/lib/api/types";
import { me } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  clearStoredToken,
  getStoredToken,
  storeToken,
} from "@/lib/auth/token";

type AuthContextValue = {
  user: CurrentUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (session: AuthResponse) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const currentUserQuery = useQuery({
    queryKey: ["me", token],
    async queryFn() {
      try {
        return await me(token);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearStoredToken();
          setToken(null);
          queryClient.clear();
        }

        throw error;
      }
    },
    enabled: Boolean(token),
    retry(failureCount, error) {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }

      return failureCount < 1;
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: currentUserQuery.data ?? null,
      token,
      isLoading:
        Boolean(token) &&
        (currentUserQuery.isLoading || currentUserQuery.isFetching),
      isAuthenticated: Boolean(token && currentUserQuery.data),
      setSession(session) {
        storeToken(session.access_token);
        setToken(session.access_token);
        queryClient.setQueryData(["me", session.access_token], session.user);
      },
      signOut() {
        clearStoredToken();
        setToken(null);
        queryClient.clear();
      },
    }),
    [
      currentUserQuery.data,
      currentUserQuery.isFetching,
      currentUserQuery.isLoading,
      queryClient,
      token,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
