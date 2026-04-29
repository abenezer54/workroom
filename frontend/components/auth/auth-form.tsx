"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { login, register } from "@/lib/api/auth";
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

  const mutation = useMutation({
    mutationFn: (values: LoginValues | RegisterValues) =>
      isLogin ? login(values) : register(values as RegisterValues),
    onSuccess(session) {
      setSession(session);
      router.replace(dashboardPathForRole(session.user.role));
    },
  });

  const submitLogin = loginForm.handleSubmit((values) => mutation.mutate(values));
  const submitRegister = registerForm.handleSubmit((values) =>
    mutation.mutate(values),
  );
  const error =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "The request could not be completed."
        : null;
  const isPending = mutation.isPending;

  function fillDemoAccount(email: string) {
    loginForm.setValue("email", email, {
      shouldDirty: true,
      shouldValidate: true,
    });
    loginForm.setValue("password", "password123", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

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

  return (
    <Card className="shadow-[0_12px_40px_rgba(0,0,0,0.46)]">
      <CardContent className="space-y-5 p-5">
        {error ? <ErrorState message={error} /> : null}
        <form
          className="space-y-4"
          onSubmit={isLogin ? submitLogin : submitRegister}
        >
          {!isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                disabled={isPending}
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isPending}
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={isPending}
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
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isPending}
                {...registerForm.register("confirmPassword")}
              />
              {registerForm.formState.errors.confirmPassword ? (
                <p className="text-xs text-destructive">
                  {registerForm.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {isLogin
              ? isPending
                ? "Logging in"
                : "Log in"
              : isPending
                ? "Creating account"
                : "Create account"}
            {!isPending ? (
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            ) : null}
          </Button>
        </form>

        {isLogin ? (
          <div className="linear-panel rounded-md border border-border bg-muted/70 p-3">
            <p className="text-xs font-medium text-foreground">
              Demo accounts
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isPending}
                onClick={() => fillDemoAccount("admin@workroom.demo")}
              >
                Admin demo
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isPending}
                onClick={() => fillDemoAccount("client@workroom.demo")}
              >
                Client demo
              </Button>
            </div>
          </div>
        ) : (
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
