"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/hooks/use-analytics";

/**
 * Component that tracks product view events
 * Wrap any product detail page with this
 */
interface ProductTrackerProps {
  productId: string;
  productName: string;
  children?: React.ReactNode;
}

export function ProductTracker({
  productId,
  productName,
  children,
}: ProductTrackerProps) {
  const { trackProductView } = useAnalytics();

  useEffect(() => {
    // Track product view when component mounts
    trackProductView(productId, productName);
  }, [productId, productName, trackProductView]);

  return <>{children}</>;
}

/**
 * Component that tracks cart interactions
 */
export function CartTracker({ children }: { children: React.ReactNode }) {
  const { trackAddToCart, trackRemoveFromCart } = useAnalytics();

  // This would be used with event delegation or custom hooks in actual cart component
  return <>{children}</>;
}

/**
 * Component that tracks search events
 */
interface SearchTrackerProps {
  query: string;
  resultsCount: number;
  children?: React.ReactNode;
}

export function SearchTracker({
  query,
  resultsCount,
  children,
}: SearchTrackerProps) {
  const { trackSearch } = useAnalytics();

  useEffect(() => {
    trackSearch(query, resultsCount);
  }, [query, resultsCount, trackSearch]);

  return <>{children}</>;
}
