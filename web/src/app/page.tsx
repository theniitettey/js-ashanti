"use client";

import { Hero } from "@/components/hero/Hero";
import Products from "@/components/products/product";
import { useEffect } from "react";
import { useAnalytics } from "@/hooks/use-analytics";

export default function Home() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Track landing page view
    trackEvent("page_view", {
      source: "landing_page",
    });
  }, [trackEvent]);

  return (
    <div className="min-h-screen p-4 md:p-0 pb-20 gap-16 font-[family-name:var(--font-lato)] mx-auto">
      {/* Main Content */}
      <main className="mx-auto">
        <Hero />
        <Products />
      </main>
    </div>
  );
}
