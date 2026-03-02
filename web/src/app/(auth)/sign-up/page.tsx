"use client";

import { SignupForm } from "@/components/auth/sign-up";
import { useEffect } from "react";
import { useAnalytics } from "@/hooks/use-analytics";

export default function SignupPage() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Track page view
    trackEvent("page_view", {
      source: "signup_page",
    });
  }, [trackEvent]);

  return (
    <div className="bg-muted h-dvh">
      <SignupForm />
    </div>
  );
}
