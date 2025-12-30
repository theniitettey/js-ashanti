"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useEffect } from "react";
import { useAnalytics } from "@/hooks/use-analytics";

export default function LoginPage() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Track page view
    trackEvent("page_view", {
      source: "login_page",
    });
  }, [trackEvent]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="flex items-center gap-2 self-center font-bold logo">
          J's Ashantis
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
