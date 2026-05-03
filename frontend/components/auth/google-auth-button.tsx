"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const googleClientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

let googleScriptPromise: Promise<void> | null = null;

type GoogleAuthButtonProps = {
  mode: "login" | "register";
  disabled?: boolean;
  isPending?: boolean;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
};

export function GoogleAuthButton({
  mode,
  disabled = false,
  isPending = false,
  onCredential,
  onError,
}: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const googleActionLabel =
    mode === "login" ? "Google sign-in" : "Google sign-up";

  useEffect(() => {
    if (!googleClientID || disabled || isPending) {
      return;
    }

    let isMounted = true;

    loadGoogleIdentityScript()
      .then(() => {
        if (!isMounted || !buttonRef.current || !window.google) {
          return;
        }

        const width = Math.min(buttonRef.current.offsetWidth || 400, 400);
        buttonRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: googleClientID,
          callback(response) {
            if (!response.credential) {
              onError("Google did not return a sign-in credential.");
              return;
            }

            onCredential(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: mode === "login" ? "signin_with" : "signup_with",
          width,
        });
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setIsUnavailable(true);
        onError("Google sign-in could not be loaded.");
      });

    return () => {
      isMounted = false;
      window.google?.accounts.id.cancel();
    };
  }, [disabled, isPending, mode, onCredential, onError]);

  if (!googleClientID || isUnavailable) {
    return (
      <Button className="w-full h-11 shadow-sm" type="button" variant="secondary" disabled>
        {googleActionLabel} unavailable
      </Button>
    );
  }

  if (isPending) {
    return (
      <Button className="w-full h-11 shadow-sm" type="button" variant="secondary" disabled>
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        {mode === "login" ? "Continuing with Google" : "Creating account"}
      </Button>
    );
  }

  if (disabled) {
    return (
      <Button className="w-full h-11 shadow-sm" type="button" variant="secondary" disabled>
        Continue with Google
      </Button>
    );
  }

  return (
    <div
      className="flex min-h-10 w-full justify-center overflow-hidden rounded-md"
      ref={buttonRef}
    />
  );
}

function loadGoogleIdentityScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in requires a browser."));
  }

  if (window.google?.accounts.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Google sign-in script failed to load.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Google sign-in script failed to load."));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}
