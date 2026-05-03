"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { verifyEmail } from "@/lib/api/auth";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const hasAttempted = useRef(false);

  const mutation = useMutation({
    mutationFn: (token: string) => verifyEmail(token),
  });

  useEffect(() => {
    if (token && !hasAttempted.current) {
      hasAttempted.current = true;
      mutation.mutate(token);
    }
  }, [token, mutation]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border border-white/10 bg-[#0a0a0a] shadow-2xl rounded-xl">
          <CardContent className="space-y-5 p-7 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="text-xl font-semibold text-foreground">Invalid Link</h3>
            <p className="text-sm text-muted-foreground">
              The verification link is missing or invalid.
            </p>
            <div className="pt-4">
              <Button asChild className="w-full h-11 bg-[#f7f8f8] text-black hover:bg-[#d0d6e0]">
                <Link href="/login">Return to log in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border border-white/10 bg-[#0a0a0a] shadow-2xl rounded-xl">
        <CardContent className="space-y-5 p-7 text-center">
          {mutation.isPending ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Verifying email...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </>
          ) : mutation.isError ? (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">Verification Failed</h3>
              <p className="text-sm text-muted-foreground">
                The link is invalid or has expired. Please try logging in to resend.
              </p>
              <div className="pt-4">
                <Button asChild className="w-full h-11 bg-[#f7f8f8] text-black hover:bg-[#d0d6e0]">
                  <Link href="/login">Return to log in</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="text-xl font-semibold text-foreground">Email Verified!</h3>
              <p className="text-sm text-muted-foreground">
                Your email has been successfully verified. You can now log in to your account.
              </p>
              <div className="pt-4">
                <Button asChild className="w-full h-11 bg-[#f7f8f8] text-black hover:bg-[#d0d6e0]">
                  <Link href="/login">Log in to Workroom</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
