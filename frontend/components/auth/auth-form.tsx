"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const { setSession } = useAuth();
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
    },
  });

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

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        {error ? <ErrorState message={error} /> : null}
        <form
          className="space-y-4"
          onSubmit={isLogin ? submitLogin : submitRegister}
        >
          {!isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoComplete="name" {...registerForm.register("name")} />
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

          <Button className="w-full" type="submit" disabled={mutation.isPending}>
            {isLogin ? "Log in" : "Create account"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>

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
