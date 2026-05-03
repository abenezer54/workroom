"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { googleSignIn, login, register } from "@/lib/api/auth";
import type { AuthResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { dashboardPathForRole } from "@/lib/auth/roles";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "@/lib/validations/auth";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { isLoading, setSession, user } = useAuth();
  const isLogin = mode === "login";
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [isLoading, router, user]);

  function completeAuth(session: AuthResponse) {
    if (!session.access_token) {
      setIsRegistered(true);
      return;
    }
    setSession(session);
    router.replace(dashboardPathForRole(session.user.role));
  }

  const mutation = useMutation({
    mutationFn: (values: LoginValues | RegisterValues) =>
      isLogin ? login(values) : register(values as RegisterValues),
    onMutate() {
      setGoogleError(null);
    },
    onSuccess: completeAuth,
  });

  const googleMutation = useMutation({
    mutationFn: (credential: string) => googleSignIn({ credential, mode }),
    onMutate() {
      setGoogleError(null);
    },
    onSuccess: completeAuth,
  });

  const submitLogin = loginForm.handleSubmit((values) => mutation.mutate(values));
  const submitRegister = registerForm.handleSubmit((values) =>
    mutation.mutate(values),
  );
  const emailAuthError =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "The request could not be completed."
        : null;
  const googleAuthError =
    googleMutation.error instanceof ApiError
      ? googleMutation.error.message
      : googleMutation.error
        ? "Google sign-in could not be completed."
        : null;
  const error = googleError ?? emailAuthError ?? googleAuthError;
  const isPending = mutation.isPending || googleMutation.isPending;
  const isEmailPending = mutation.isPending;

  const handleGoogleCredential = useCallback(
    (credential: string) => {
      googleMutation.mutate(credential);
    },
    [googleMutation],
  );

  const handleGoogleError = useCallback((message: string) => {
    setGoogleError(message);
  }, []);

  if (!isLoading && user) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">
            Redirecting to your workspace...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isRegistered) {
    return (
      <Card className="border border-white/10 bg-[#0a0a0a] shadow-2xl rounded-xl">
        <CardContent className="space-y-5 p-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to{" "}
            <span className="font-medium text-foreground">
              {registerForm.getValues().email}
            </span>
            . Please check your inbox to verify your account.
          </p>
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full h-11 bg-transparent border-white/10 text-foreground hover:bg-white/5"
              onClick={() => {
                setIsRegistered(false);
                router.push("/login");
              }}
            >
              Return to log in
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-white/10 bg-[#0a0a0a] shadow-2xl rounded-xl">
      <CardContent className="space-y-5 p-7">
        {error ? <ErrorState message={error} /> : null}
        <GoogleAuthButton
          mode={mode}
          disabled={mutation.isPending}
          isPending={googleMutation.isPending}
          onCredential={handleGoogleCredential}
          onError={handleGoogleError}
        />
        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">or continue with email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <form
          className="space-y-5"
          onSubmit={isLogin ? submitLogin : submitRegister}
        >
          {!isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                disabled={isPending}
                className="h-11 bg-background border-white/10 focus-visible:border-white/20 focus-visible:ring-white/10 transition-none"
                {...registerForm.register("name")}
              />
              {registerForm.formState.errors.name ? (
                <p className="text-xs text-destructive">
                  {registerForm.formState.errors.name.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isPending}
              className="h-11 bg-background border-white/10 focus-visible:border-white/20 focus-visible:ring-white/10 transition-none"
              {...(isLogin
                ? loginForm.register("email")
                : registerForm.register("email"))}
            />
            {isLogin && loginForm.formState.errors.email ? (
              <p className="text-xs text-destructive">
                {loginForm.formState.errors.email.message}
              </p>
            ) : null}
            {!isLogin && registerForm.formState.errors.email ? (
              <p className="text-xs text-destructive">
                {registerForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={isPending}
              className="h-11 bg-background border-white/10 focus-visible:border-white/20 focus-visible:ring-white/10 transition-none"
              {...(isLogin
                ? loginForm.register("password")
                : registerForm.register("password"))}
            />
            {isLogin && loginForm.formState.errors.password ? (
              <p className="text-xs text-destructive">
                {loginForm.formState.errors.password.message}
              </p>
            ) : null}
            {!isLogin && registerForm.formState.errors.password ? (
              <p className="text-xs text-destructive">
                {registerForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          {!isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isPending}
                className="h-11 bg-background border-white/10 focus-visible:border-white/20 focus-visible:ring-white/10 transition-none"
                {...registerForm.register("confirmPassword")}
              />
              {registerForm.formState.errors.confirmPassword ? (
                <p className="text-xs text-destructive">
                  {registerForm.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <Button className="w-full h-11 text-base font-medium bg-[#f7f8f8] text-black hover:bg-[#d0d6e0] border-transparent" type="submit" disabled={isPending}>
            {isEmailPending ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : null}
            {isLogin
              ? isEmailPending
                ? "Logging in"
                : "Log in"
              : isEmailPending
                ? "Creating account"
                : "Create account"}
            {!isEmailPending ? (
              <ArrowRight className="h-5 w-5 ml-1" aria-hidden="true" />
            ) : null}
          </Button>
        </form>

        {!isLogin && (
          <p className="rounded-md border border-info-border bg-info-soft p-3 text-xs leading-5 text-info">
            Registration creates an agency admin account. Client users are
            managed from the agency workspace in a later feature phase.
          </p>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Need an agency account?" : "Already have an account?"}{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={isLogin ? "/register" : "/login"}
          >
            {isLogin ? "Register" : "Log in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
